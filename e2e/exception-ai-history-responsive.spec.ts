import { test, expect } from '@playwright/test'
import { singleSuccessResult, diagnosisOnlyResult } from './fixtures/mock-data'

/**
 * Task 10.4 - 历史记录和响应式布局 E2E 测试
 * 需求：9.1, 9.2, 9.3, 11.1, 11.5
 */

async function mockApiSequence(page: import('@playwright/test').Page) {
  let callCount = 0
  const responses = [singleSuccessResult, diagnosisOnlyResult]
  await page.route('**/api/exception/run', async (route) => {
    const response = responses[callCount % responses.length]
    callCount++
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

test.describe('AI 异常处理 - 历史记录', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage 确保干净状态
    await page.goto('/orders/exception-ai')
    await page.evaluate(() => localStorage.removeItem('exception-ai-history'))
    await page.reload()
  })

  test('多次操作后历史面板显示记录', async ({ page }) => {
    await mockApiSequence(page)

    // 第一次提交
    await page.getByTestId('symptom-textarea').fill('第一次查询')
    await page.getByTestId('submit-symptom').click()
    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })

    // 第二次提交
    await page.getByTestId('symptom-textarea').fill('第二次查询')
    await page.getByTestId('submit-symptom').click()
    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })

    // 历史面板不再显示空提示
    await expect(page.getByTestId('history-empty')).not.toBeVisible()

    // 应有 2 条历史记录
    const historyItems = page.locator('[data-testid^="history-item-"]')
    await expect(historyItems).toHaveCount(2)
  })

  test('点击历史记录回显结果', async ({ page }) => {
    await mockApiSequence(page)

    // 提交一次
    await page.getByTestId('symptom-textarea').fill('历史回显测试')
    await page.getByTestId('submit-symptom').click()
    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })

    // 点击历史记录
    const firstItem = page.locator('[data-testid^="history-item-"]').first()
    await firstItem.click()

    // 结果区域仍然显示
    await expect(page.getByTestId('result-display')).toBeVisible()
    await expect(page.getByTestId('diagnosis-card')).toBeVisible()
  })

  test('历史记录显示时间戳、摘要、模式和状态', async ({ page }) => {
    await mockApiSequence(page)

    await page.getByTestId('symptom-textarea').fill('字段展示测试')
    await page.getByTestId('submit-symptom').click()
    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })

    const firstItem = page.locator('[data-testid^="history-item-"]').first()

    // 时间戳
    await expect(firstItem.getByTestId('history-timestamp')).toBeVisible()
    // 状态 badge
    await expect(firstItem.getByTestId('history-status')).toBeVisible()
    // 摘要
    await expect(firstItem.getByTestId('history-summary')).toBeVisible()
    // 模式
    await expect(firstItem.getByTestId('history-mode')).toBeVisible()
  })
})

test.describe('AI 异常处理 - 响应式布局', () => {
  test('桌面宽度 (≥1024px) 双栏布局', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/orders/exception-ai')

    const panel = page.getByTestId('exception-ai-panel')
    await expect(panel).toBeVisible()

    // 历史面板在右侧可见
    await expect(page.getByTestId('history-panel')).toBeVisible()
  })

  test('移动宽度 (<1024px) 单栏堆叠', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/orders/exception-ai')

    // 所有区域仍然可见（堆叠排列）
    await expect(page.getByTestId('natural-language-input')).toBeVisible()
    await expect(page.getByTestId('quick-action-bar')).toBeVisible()
    await expect(page.getByTestId('history-panel')).toBeVisible()
  })
})

test.describe('AI 异常处理 - 键盘导航', () => {
  test('Tab 键可以在交互元素间切换焦点', async ({ page }) => {
    await page.goto('/orders/exception-ai')

    // 先填入文本使提交按钮启用
    const textarea = page.getByTestId('symptom-textarea')
    await textarea.fill('测试焦点')
    await textarea.focus()
    await expect(textarea).toBeFocused()

    // Tab 到提交按钮（现在已启用）
    await page.keyboard.press('Tab')
    const submitBtn = page.getByTestId('submit-symptom')
    await expect(submitBtn).toBeFocused()
  })
})
