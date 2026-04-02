import type { OrderContext, DispatchInfo, OrderMessage, OrderItemInfo } from './types'

/**
 * API 取证收集器 — 通过 OMS REST API 收集订单上下文
 * 不直连数据库，所有数据通过业务层 API 获取
 */

const OMS_BASE_URL = process.env.OMS_API_BASE_URL || 'https://oms-stage.item.com'
const API_PREFIX = '/api/linker-oms/opc/app-api'

interface TokenCache {
  token: string
  expiresAt: number
}

export class DbEvidenceCollector {
  private tokenCache: TokenCache | null = null

  private async getToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt - 300_000) {
      return this.tokenCache.token
    }

    const username = process.env.OMS_API_USERNAME
    const password = process.env.OMS_API_PASSWORD
    if (!username || !password) {
      throw new Error('OMS API 认证信息未配置')
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

  private async callApi(path: string, timeoutMs = 90_000): Promise<Record<string, unknown> | null> {
    const token = await this.getToken()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(`${OMS_BASE_URL}${API_PREFIX}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      const json = await res.json()
      if (json.code === 0 && json.data) return json.data as Record<string, unknown>
      return null
    } catch (err) {
      console.error(`[Evidence] API call failed: ${path}`, err instanceof Error ? err.message : err)
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  async collectEvidence(orderNo: string): Promise<OrderContext | null> {
    try {
      const order = await this.callApi(`/sale-order/${orderNo}`)
      if (!order) return null

      // 状态码映射
      const statusMap: Record<string, number> = {
        NEW: 0, ALLOCATED: 1, PROCESSING: 2, SHIPPED: 3,
        CANCELLED: 9, DELIVERED: 7, ONHOLD: 8, PENDING: 9, EXCEPTION: 10,
        WAREHOUSE_PROCESSING: 2, SHORT_SHIPPED: 3,
      }
      const statusStr = (order.status as string) || ''
      const statusNum = statusMap[statusStr] ?? (typeof order.status === 'number' ? order.status : 10)

      const statusLabelMap: Record<number, string> = {
        0: 'New', 1: 'Allocated', 2: 'Processing', 3: 'Shipped',
        5: 'Cancelled', 7: 'Delivered', 8: 'OnHold', 9: 'Pending', 10: 'Exception',
      }

      // 并行调用：分派检查 + 订单日志 + 商品列表
      const merchantNo = (order.merchantNo as string) || ''
      console.log(`[Evidence] 并行调用 orderLog/dispatch/item for ${orderNo}, merchant=${merchantNo}`)
      
      // orderLog 单独处理，超时不阻塞
      const orderLogPromise = this.callApi(
        `/orderLog/list?omsOrderNo=${encodeURIComponent(orderNo)}&merchantNo=${encodeURIComponent(merchantNo)}&pageSize=5&pageNum=1`,
        90_000
      ).catch(() => null)

      const [dispatchCheck, itemData] = await Promise.all([
        this.callApi(`/dispatch/hand/check/${orderNo}`),
        this.callApi(`/dispatch/hand/item/${orderNo}`),
      ])

      // 不等 orderLog 完成就先组装基础数据，orderLog 结果后续补充
      const logData = await Promise.race([
        orderLogPromise,
        new Promise<null>(resolve => setTimeout(() => resolve(null), 15_000)),
      ])
      console.log(`[Evidence] orderLog result:`, logData ? JSON.stringify(logData).slice(0, 500) : 'null (timeout or empty)')
      console.log(`[Evidence] dispatch result:`, dispatchCheck ? 'ok' : 'null')
      console.log(`[Evidence] items result:`, itemData ? 'ok' : 'null')

      const dispatches: DispatchInfo[] = []
      if (dispatchCheck) {
        dispatches.push({
          dispatch_no: (dispatchCheck.dispatchNo as string) || '',
          status: (dispatchCheck.status as number) ?? 0,
          accounting_code: (order.accountingCode as string) || null,
          warehouse_name: null,
          send_kafka: 0,
          shipment_no: null,
          shipment_status: null,
          tracking_number: null,
        })
      }

      const messages: OrderMessage[] = []
      if (logData) {
        const records = Array.isArray(logData) ? logData
          : Array.isArray((logData as Record<string, unknown>).records) ? (logData as Record<string, unknown>).records as Array<Record<string, unknown>>
          : Array.isArray((logData as Record<string, unknown>).list) ? (logData as Record<string, unknown>).list as Array<Record<string, unknown>>
          : []
        for (const log of records) {
          const desc = (log.description as string) || ''
          if (desc) {
            messages.push({
              remark: desc,
              type: 0,
              create_time: (log.eventTime as string) || new Date().toISOString(),
            })
          }
        }
      }
      if (messages.length === 0 && order.remark) {
        messages.push({
          remark: order.remark as string,
          type: 0,
          create_time: (order.createTime as string) || new Date().toISOString(),
        })
      }

      const items: OrderItemInfo[] = []
      if (Array.isArray(itemData)) {
        for (const item of itemData) {
          items.push({
            sku: (item as Record<string, unknown>).sku as string,
            qty: (item as Record<string, unknown>).qty as number,
            title: ((item as Record<string, unknown>).title as string) || null,
            reference_no: ((item as Record<string, unknown>).referenceNo as string) || null,
          })
        }
      }

      return {
        order_no: (order.orderNo as string) || orderNo,
        channel_sales_order_no: (order.channelSalesOrderNo as string) || null,
        merchant_no: (order.merchantNo as string) || '',
        channel_name: (order.channelName as string) || null,
        status: statusNum,
        status_label: statusLabelMap[statusNum] || `Unknown(${statusNum})`,
        order_type: (order.type as number) ?? 0,
        create_time: (order.createTime as string) || '',
        accounting_code: (order.accountingCode as string) || null,
        dispatches,
        recent_messages: messages,
        items,
      }
    } catch (err) {
      console.error('[Diagnosis] API evidence collection failed:', err)
      return null
    }
  }

  async queryExceptionOrders(
    merchantNo: string,
    _limit = 50
  ): Promise<Array<{ order_no: string; channel_sales_order_no: string; create_time: string; latest_error: string | null }>> {
    // 暂无批量查询异常订单的 API，返回空数组
    // 未来可接入 GET /sale-order?merchantNo={merchantNo}&status=EXCEPTION 等接口
    console.log(`[Diagnosis] 批量查询商户 ${merchantNo} 异常订单 — 暂无批量 API`)
    return []
  }

  async destroy(): Promise<void> {
    this.tokenCache = null
  }
}
