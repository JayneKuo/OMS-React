import type { OrchestratorInput, OrchestratorResult } from '@/lib/orchestrator/types'
import { ApiError } from './types'

export async function runExceptionPipeline(
  input: OrchestratorInput
): Promise<OrchestratorResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 180000)

  try {
    const res = await fetch('/api/exception/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
    })

    if (!res.ok) {
      if (res.status === 400) {
        const body = await res.json()
        throw new ApiError(400, body.message || '请求参数无效')
      }
      if (res.status >= 500) {
        throw new ApiError(res.status, '异常处理管线执行失败，请稍后重试')
      }
      throw new ApiError(res.status, '请求失败')
    }

    return await res.json()
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, '请求超时，请稍后重试')
    }
    throw new ApiError(0, '网络连接失败，请检查网络后重试')
  } finally {
    clearTimeout(timeoutId)
  }
}
