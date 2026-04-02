import { test, expect } from '@playwright/test'

test('SO00523347 真实订单诊断', async ({ page }) => {
  await page.goto('/orders/exception-ai')
  await page.waitForTimeout(2000)

  // 输入订单号
  const orderInput = page.getByTestId('order-no-input')
  await orderInput.click()
  await orderInput.type('SO00523347', { delay: 80 })
  await page.waitForTimeout(1000)

  // 点击查询
  await page.getByTestId('order-query-btn').click()

  // 等待结果（给 staging API 足够时间）
  await page.waitForSelector(
    '[data-testid="result-display"], [data-testid="result-error"], [data-testid="diagnosis-card"]',
    { timeout: 180000 }
  )

  // 停留让你看结果
  await page.waitForTimeout(30000)
})
