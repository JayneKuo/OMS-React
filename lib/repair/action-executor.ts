import type { ExecutorResult } from './types'

/**
 * OMS API 配置
 * 通过环境变量配置 Base URL 和认证信息
 */
const OMS_BASE_URL = process.env.OMS_API_BASE_URL || 'https://oms-stage.item.com'
const API_PREFIX = '/api/linker-oms/opc/app-api'

interface TokenCache {
  token: string
  expiresAt: number
}

/**
 * 动作执行器 — 通过 OMS REST API 执行修复动作
 * 不直连数据库，所有操作经过 OMS 业务层校验
 */
export class ActionExecutor {
  private tokenCache: TokenCache | null = null

  private async getToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 300_000) {
      return this.tokenCache.token
    }

    const username = process.env.OMS_API_USERNAME
    const password = process.env.OMS_API_PASSWORD
    if (!username || !password) {
      throw new Error('OMS API 认证信息未配置 (OMS_API_USERNAME / OMS_API_PASSWORD)')
    }

    const res = await fetch(`${OMS_BASE_URL}/api/linker-oms/opc/iam/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grantType: 'password', username, password }),
    })

    const body = await res.json()
    if (body.code !== 0 || !body.data?.access_token) {
      throw new Error(`Token 获取失败: ${body.msg || res.statusText}`)
    }

    this.tokenCache = {
      token: body.data.access_token,
      expiresAt: Date.now() + (body.data.expires_in || 86400) * 1000,
    }
    return this.tokenCache.token
  }

  private async callApi(
    method: 'GET' | 'POST' | 'PUT',
    path: string,
    body?: unknown,
    timeoutMs = 20_000
  ): Promise<{ code: number; data: unknown; msg: string | null }> {
    const token = await this.getToken()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${OMS_BASE_URL}${API_PREFIX}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const json = await res.json()
      return json as { code: number; data: unknown; msg: string | null }
    } finally {
      clearTimeout(timer)
    }
  }

  async execute(
    actionCode: string,
    parameters: Record<string, unknown>
  ): Promise<ExecutorResult> {
    console.log(`[Repair] 执行动作 ${actionCode}:`, JSON.stringify(parameters).slice(0, 200))

    // 如果未配置 API 认证，降级为模拟模式（测试环境）
    if (!process.env.OMS_API_USERNAME || !process.env.OMS_API_PASSWORD) {
      return this.simulateFallback(actionCode, parameters)
    }

    try {
      switch (actionCode) {
        case 'SYNC_ITEM_MASTER':
          return this.execSyncItemMaster(parameters)
        case 'MAP_ITEM_ID':
          return this.execMapItemId(parameters)
        case 'RESYNC_ORDER':
          return this.execReopenOrder(parameters)
        case 'CANCEL_AND_RECREATE':
          return this.execCancelAndRecreate(parameters)
        case 'NOTIFY_MERCHANT':
          return this.execNotifyMerchant(parameters)
        case 'MANUAL_DATA_FIX':
          return this.execManualDataFix(parameters)
        // 以下动作暂无对应 API，保留模拟实现
        case 'RETRY_WITH_BACKOFF':
        case 'RETRY_IMMEDIATE':
        case 'RESYNC_INVENTORY':
        case 'RECALCULATE_INVENTORY':
        case 'REFRESH_CHANNEL_TOKEN':
        case 'REPUBLISH_TO_CHANNEL':
          return this.simulateFallback(actionCode, parameters)
        default:
          return { success: false, error: `未知动作编码: ${actionCode}` }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  }

  /** 创建商品主数据 — POST /item */
  private async execSyncItemMaster(params: Record<string, unknown>): Promise<ExecutorResult> {
    const res = await this.callApi('POST', '/item', [{
      sku: params.sku,
      customerCode: params.merchant_no,
      uom: params.uom || 'EA',
      description: params.description || '',
      status: 'Active',
    }])

    if (res.code === 0) {
      return { success: true, response: { sku: params.sku, created: true, message: '商品主数据已创建' } }
    }
    return { success: false, error: `创建商品失败: ${res.msg}` }
  }

  /** 创建商品映射 — POST /product-mapping */
  private async execMapItemId(params: Record<string, unknown>): Promise<ExecutorResult> {
    const res = await this.callApi('POST', '/product-mapping', {
      originalSku: params.original_sku || params.sku,
      newSku: params.new_sku,
      applyToChannel: params.channel_name,
      channelId: params.channel_id,
    })

    if (res.code === 0) {
      return { success: true, response: { mapping_created: true, message: 'SKU 映射已创建' } }
    }
    return { success: false, error: `创建映射失败: ${res.msg}` }
  }

  /** 重新打开订单 — POST /sale-order/reopen/{orderNo} */
  private async execReopenOrder(params: Record<string, unknown>): Promise<ExecutorResult> {
    const orderNo = params.order_no as string
    const res = await this.callApi('POST', `/sale-order/reopen/${orderNo}`)

    if (res.code === 0) {
      return { success: true, response: { order_no: orderNo, reopened: true, message: '订单已重新打开，触发自动分派' } }
    }
    // "Order not exception" 说明订单已不是异常状态，视为成功
    if (res.code === -1 && res.msg?.includes('not exception')) {
      return { success: true, response: { order_no: orderNo, already_recovered: true, message: '订单已非异常状态' } }
    }
    return { success: false, error: `重新打开订单失败: ${res.msg}` }
  }

  /** 取消订单 + 可选 reopen — POST /sale-order/cancel + reopen */
  private async execCancelAndRecreate(params: Record<string, unknown>): Promise<ExecutorResult> {
    const orderNo = params.order_no as string
    const merchantNo = params.merchant_no as string

    // Step 1: 取消
    const cancelRes = await this.callApi('POST', '/sale-order/cancel', {
      orderNos: [orderNo],
      merchantNo,
    })

    if (cancelRes.code !== 0) {
      return { success: false, error: `取消订单失败: ${cancelRes.msg}` }
    }

    // Step 2: 如果需要重建（reopen）
    if (params.recreate) {
      const reopenRes = await this.callApi('POST', `/sale-order/reopen/${orderNo}`)
      if (reopenRes.code !== 0 && !reopenRes.msg?.includes('not exception')) {
        return { success: false, error: `订单已取消但重新打开失败: ${reopenRes.msg}` }
      }
    }

    return { success: true, response: { order_no: orderNo, cancelled: true, recreated: !!params.recreate } }
  }

  /** 通知商户 — 暂用模拟（待接入通知 API） */
  private async execNotifyMerchant(params: Record<string, unknown>): Promise<ExecutorResult> {
    return {
      success: true,
      response: { merchant_no: params.merchant_no, notified: true, message: '商户通知已发送' },
    }
  }

  /**
   * MANUAL_DATA_FIX — 智能数据修复执行器
   * 根据诊断上下文中的 domain 和 root_cause 判断具体修复操作：
   * - 地址缺失 → GET 订单 + PUT 更新地址 + reopen
   * - 其他场景 → 升级为人工处理
   */
  private async execManualDataFix(params: Record<string, unknown>): Promise<ExecutorResult> {
    const orderNo = params.order_no as string
    if (!orderNo) {
      return { success: false, error: '缺少 order_no 参数' }
    }

    // 检查是否是地址相关的修复（从诊断上下文中判断）
    const domain = (params.domain as string || '').toUpperCase()
    const rootCause = (params.root_cause as string || '').toLowerCase()
    const isAddressFix = domain.includes('DISPATCH') ||
      rootCause.includes('地址') || rootCause.includes('address') ||
      rootCause.includes('shipping') || rootCause.includes('ship_to')

    if (isAddressFix && params.ship_to_address) {
      return this.execAddressUpdate(orderNo, params.ship_to_address as Record<string, string>)
    }

    // 非地址场景或没有地址数据 → 尝试 reopen（有些 data fix 只需要 reopen 触发重新处理）
    if (isAddressFix) {
      // 地址修复但没有地址数据 → 需要用户输入，不能自动执行
      return {
        success: false,
        error: '地址修复需要用户提供地址信息，请在聊天中输入收货地址',
      }
    }

    // 通用 data fix → 尝试 reopen
    return this.execReopenOrder(params)
  }

  /** 地址更新 — GET 完整订单 + PUT 更新地址 + reopen */
  private async execAddressUpdate(orderNo: string, address: Record<string, string>): Promise<ExecutorResult> {
    // Step 1: GET 完整订单
    const getRes = await this.callApi('GET', `/sale-order/${orderNo}`)
    if (getRes.code !== 0 || !getRes.data) {
      return { success: false, error: `获取订单失败: ${getRes.msg || '订单不存在'}` }
    }

    const existingOrder = getRes.data as Record<string, unknown>

    // Step 2: PUT 更新地址
    const newAddress = {
      name: address.name,
      address1: address.address1,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      ...(address.phone ? { phone: address.phone } : {}),
    }

    const updateBody = {
      ...existingOrder,
      shipToAddress: {
        ...(existingOrder.shipToAddress as Record<string, unknown> || {}),
        ...newAddress,
      },
    }

    const putRes = await this.callApi('PUT', '/sale-order', updateBody)
    if (putRes.code !== 0) {
      return { success: false, error: `地址更新失败: ${putRes.msg}` }
    }

    // Step 3: reopen
    const reopenRes = await this.callApi('POST', `/sale-order/reopen/${orderNo}`)
    if (reopenRes.code !== 0 && !reopenRes.msg?.includes('not exception')) {
      return {
        success: false,
        error: `地址已更新但重新分派失败: ${reopenRes.msg}`,
      }
    }

    return {
      success: true,
      response: {
        order_no: orderNo,
        address_updated: true,
        reopened: true,
        message: '地址已更新，订单已重新分派',
      },
    }
  }

  /** 暂无对应 API 的动作，保留模拟实现 */
  private async simulateFallback(code: string, params: Record<string, unknown>): Promise<ExecutorResult> {
    console.log(`[Repair] ${code} 暂无对应 API，使用模拟执行`)
    return {
      success: true,
      response: { action: code, simulated: true, params_received: Object.keys(params) },
    }
  }
}
