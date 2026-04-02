import { test, expect } from '@playwright/test'
import { singleSuccessResult, diagnosisOnlyResult, batchResult, needsConfirmationResult } from './fixtures/mock-data'

/**
 * 演示测试 - 所有场景在一个浏览器窗口中连续执行
 * 用 --headed --workers=1 运行可以完整观看自动化过程
 */
test('AI 异常处理面板 - 完整演示', async ({ page }) => {
  // Mock API - 根据请求内容返回不同结果
  let mockResponse = singleSuccessResult
  await page.route('**/api/exception/run', async (route, request) => {
    await new Promise(r => setTimeout(r, 1500)) // 模拟网络延迟，让你看到加载状态
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockResponse),
    })
  })

  // ========== 1. 打开页面 ==========
  await page.goto('/orders/exception-ai')
  await page.waitForTimeout(2000)

  // 验证空状态
  await expect(page.getByTestId('empty-state')).toBeVisible()
  await expect(page.getByText('暂无历史记录')).toBeVisible()
  await page.waitForTimeout(1500)

  // ========== 2. 自然语言输入提交 ==========
  mockResponse = singleSuccessResult
  const textarea = page.getByTestId('symptom-textarea')
  // 逐字输入，让你看到打字过程
  await textarea.click()
  await textarea.type('帮我查 SO00522427 的异常', { delay: 80 })
  await page.waitForTimeout(1000)

  await page.getByTestId('submit-symptom').click()
  // 你会看到加载骨架屏
  await page.waitForTimeout(500)
  await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000)

  // ========== 3. 按订单号查询 ==========
  mockResponse = singleSuccessResult
  const orderInput = page.getByTestId('order-no-input')
  await orderInput.click()
  await orderInput.type('SO00522427', { delay: 80 })
  await page.waitForTimeout(800)
  await page.getByTestId('order-query-btn').click()
  await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000)

  // ========== 4. 空输入校验 ==========
  await orderInput.clear()
  await page.waitForTimeout(500)
  await page.getByTestId('order-query-btn').click()
  await expect(page.getByTestId('order-error')).toBeVisible()
  await page.waitForTimeout(1500)

  // ========== 5. 仅诊断模式 ==========
  mockResponse = diagnosisOnlyResult
  await page.getByTestId('diagnosis-only-toggle').click()
  await page.waitForTimeout(800)

  await textarea.click()
  await textarea.clear()
  await textarea.type('渠道令牌过期了', { delay: 80 })
  await page.waitForTimeout(500)
  await page.getByTestId('submit-symptom').click()
  await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 10000 })
  // 你会看到只有诊断卡片，没有修复卡片，有手动修复按钮
  await page.waitForTimeout(2500)

  // 关闭仅诊断
  await page.getByTestId('diagnosis-only-toggle').click()
  await page.waitForTimeout(500)

  // ========== 6. 批量诊断 ==========
  mockResponse = batchResult
  const merchantInput = page.getByTestId('merchant-no-input')
  await merchantInput.click()
  await merchantInput.type('M100', { delay: 80 })
  await page.waitForTimeout(500)
  await page.getByTestId('merchant-batch-btn').click()
  await expect(page.getByTestId('batch-result-display')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2000)

  // 展开批量结果
  await page.getByTestId('batch-item-trigger-0').click()
  await page.waitForTimeout(1500)
  await page.getByTestId('batch-item-trigger-1').click()
  await page.waitForTimeout(2000)

  // ========== 7. 确认对话框 ==========
  mockResponse = needsConfirmationResult
  await textarea.click()
  await textarea.clear()
  await textarea.type('订单卡住了需要取消重建', { delay: 80 })
  await page.waitForTimeout(500)
  await page.getByTestId('submit-symptom').click()
  await expect(page.getByTestId('confirmation-dialog')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(2500)

  // 拒绝
  await page.getByTestId('reject-btn').click()
  await page.waitForTimeout(1500)

  // ========== 8. 查看历史记录 ==========
  const historyItems = page.locator('[data-testid^="history-item-"]')
  const count = await historyItems.count()
  if (count > 0) {
    await historyItems.first().click()
    await page.waitForTimeout(2000)
  }

  // ========== 演示结束 ==========
  await page.waitForTimeout(3000)
})
