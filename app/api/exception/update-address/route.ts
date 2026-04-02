import { NextRequest, NextResponse } from 'next/server'

const OMS_BASE_URL = process.env.OMS_API_BASE_URL || 'https://oms-stage.item.com'
const API_PREFIX = '/api/linker-oms/opc/app-api'

async function getToken(): Promise<string> {
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
  return body.data.access_token
}

async function callApi(
  token: string,
  method: 'GET' | 'PUT' | 'POST',
  path: string,
  body?: unknown
): Promise<{ code: number; data: unknown; msg: string | null }> {
  const res = await fetch(`${OMS_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function POST(request: NextRequest) {
  try {
    const { orderNo, shipToAddress } = await request.json()

    if (!orderNo || !shipToAddress?.name || !shipToAddress?.address1 ||
        !shipToAddress?.city || !shipToAddress?.state ||
        !shipToAddress?.country || !shipToAddress?.zipCode) {
      return NextResponse.json(
        { error: '缺少必填字段：orderNo, name, address1, city, state, country, zipCode' },
        { status: 400 }
      )
    }

    const token = await getToken()

    // Step 1: GET 现有订单完整数据
    const getRes = await callApi(token, 'GET', `/sale-order/${orderNo}`)
    if (getRes.code !== 0 || !getRes.data) {
      return NextResponse.json(
        { error: `获取订单失败: ${getRes.msg || '订单不存在'}` },
        { status: 502 }
      )
    }

    const existingOrder = getRes.data as Record<string, unknown>
    console.log('[UpdateAddress] GET order keys:', Object.keys(existingOrder))
    console.log('[UpdateAddress] existing shipToAddress:', JSON.stringify(existingOrder.shipToAddress))
    console.log('[UpdateAddress] existing shipAddress:', JSON.stringify(existingOrder.shipAddress))

    // Build new address object
    const newAddress = {
      name: shipToAddress.name,
      address1: shipToAddress.address1,
      city: shipToAddress.city,
      state: shipToAddress.state,
      country: shipToAddress.country,
      zipCode: shipToAddress.zipCode,
      ...(shipToAddress.phone ? { phone: shipToAddress.phone } : {}),
    }

    // Step 2: PUT 用完整订单数据 + 新地址
    // Set address in all possible field names the backend might expect
    const updateBody = {
      ...existingOrder,
      shipToAddress: {
        ...(existingOrder.shipToAddress as Record<string, unknown> || {}),
        ...newAddress,
      },
      // Also set top-level address fields in case backend reads from there
      shipToName: shipToAddress.name,
      shipToAddress1: shipToAddress.address1,
      shipToCity: shipToAddress.city,
      shipToState: shipToAddress.state,
      shipToCountry: shipToAddress.country,
      shipToZipCode: shipToAddress.zipCode,
      ...(shipToAddress.phone ? { shipToPhone: shipToAddress.phone } : {}),
    }

    // Also set shipAddress if it exists as a separate field
    if (existingOrder.shipAddress !== undefined) {
      (updateBody as Record<string, unknown>).shipAddress = {
        ...(existingOrder.shipAddress as Record<string, unknown> || {}),
        ...newAddress,
      }
    }

    console.log('[UpdateAddress] PUT body shipToAddress:', JSON.stringify(updateBody.shipToAddress))

    const updateRes = await callApi(token, 'PUT', '/sale-order', updateBody)

    if (updateRes.code !== 0) {
      return NextResponse.json(
        { error: `地址更新失败: ${updateRes.msg || '未知错误'}` },
        { status: 502 }
      )
    }

    // Step 3: POST /sale-order/reopen/{orderNo} 重新分派
    const reopenRes = await callApi(token, 'POST', `/sale-order/reopen/${orderNo}`)

    if (reopenRes.code !== 0 && !reopenRes.msg?.includes('not exception')) {
      // Self-healing: if reopen says address missing, verify the PUT actually saved
      const verifyMsg = (reopenRes.msg || '').toLowerCase()
      if (verifyMsg.includes('address') || verifyMsg.includes('shipping')) {
        console.log('[UpdateAddress] Reopen failed with address error, verifying PUT result...')
        const verifyRes = await callApi(token, 'GET', `/sale-order/${orderNo}`)
        const verifyOrder = verifyRes.data as Record<string, unknown> | null
        console.log('[UpdateAddress] After PUT, shipToAddress:', JSON.stringify(verifyOrder?.shipToAddress))
        console.log('[UpdateAddress] After PUT, shipAddress:', JSON.stringify(verifyOrder?.shipAddress))
      }

      return NextResponse.json(
        { error: `地址已更新，但重新分派失败: ${reopenRes.msg || '未知错误'}` },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      orderNo,
      addressUpdated: true,
      reopened: true,
      message: '地址已补充，订单已重新分派',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
