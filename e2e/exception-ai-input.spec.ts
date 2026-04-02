import { test, expect } from '@playwright/test'
import { singleSuccessResult, batchResult } from './fixtures/mock-data'

/**
 * Task 10.2 - 自然语言输入和快捷操作 E2E 测试
 * 需求：2.1, 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5
 */

/** 拦截 API 并返回 mock 数据 */
async function mockApiSuccess(page: import('@playwright/test').Page, response = singleSuccessResult) {
  await page.route('**/api/exception/run', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

async function mockApiDelayed(page: import('@playwright/test').Page, delayMs = 2000) {
  await page.route('**/api/exception/run', async (route) => {
    await new Promise((r) => setTimeout(r, delayMs))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(singleSuccessResult),
    })
  })
}

test.describe('AI 异常处理 - 自然语言输入', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders/exception-ai')
  })

  test('输入文本 → 提交 → 加载状态 → 结果展示', async ({ page }) => {
    await mockApiDelayed(page, 500)

    const textarea = page.getByTestId('symptom-textarea')
    await textarea.fill('帮我查 SO00522427 的异常')

    const submitBtn = page.getByTestId('submit-symptom')
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // 加载状态：骨架屏出现
    await expect(page.getByTestId('loading-skeleton')).toBeVisible()

    // 结果展示
    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })
    // 诊断卡片可见
    await expect(page.getByTestId('diagnosis-card')).toBeVisible()
    // 修复卡片可见
    await expect(page.getByTestId('repair-card')).toBeVisible()
    // 学习卡片可见
    await expect(page.getByTestId('learning-card')).toBeVisible()
  })

  test('Ctrl+Enter 快捷键提交', async ({ page }) => {
    await mockApiSuccess(page)

    const textarea = page.getByTestId('symptom-textarea')
    await textarea.fill('SKU 1823810 not found')
    await textarea.press('Control+Enter')

    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })
  })

  test('加载中禁用输入和按钮', async ({ page }) => {
    await mockApiDelayed(page, 3000)

    await page.getByTestId('symptom-textarea').fill('测试加载状态')
    await page.getByTestId('submit-symptom').click()

    // 输入框和按钮应被禁用
    await expect(page.getByTestId('symptom-textarea')).toBeDisabled()
    await expect(page.getByTestId('submit-symptom')).toBeDisabled()
    await expect(page.getByTestId('order-query-btn')).toBeDisabled()
    await expect(page.getByTestId('merchant-batch-btn')).toBeDisabled()
  })
})

test.describe('AI 异常处理 - 快捷操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders/exception-ai')
  })

  test('按订单号查询完整流程', async ({ page }) => {
    await mockApiSuccess(page)

    await page.getByTestId('order-no-input').fill('SO00522427')
    await page.getByTestId('order-query-btn').click()

    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('diagnosis-card')).toBeVisible()
  })

  test('按商户批量诊断完整流程', async ({ page }) => {
    await mockApiSuccess(page, batchResult)

    await page.getByTestId('merchant-no-input').fill('M100')
    await page.getByTestId('merchant-batch-btn').click()

    await expect(page.getByTestId('batch-result-display')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('batch-summary-card')).toBeVisible()
  })

  test('订单号为空时显示校验提示', async ({ page }) => {
    await page.getByTestId('order-query-btn').click()
    await expect(page.getByTestId('order-error')).toBeVisible()
    await expect(page.getByTestId('order-error')).toHaveText('请输入订单号')
  })

  test('商户号为空时显示校验提示', async ({ page }) => {
    await page.getByTestId('merchant-batch-btn').click()
    await expect(page.getByTestId('merchant-error')).toBeVisible()
    await expect(page.getByTestId('merchant-error')).toHaveText('请输入商户号')
  })

  test('输入内容后校验提示消失', async ({ page }) => {
    await page.getByTestId('order-query-btn').click()
    await expect(page.getByTestId('order-error')).toBeVisible()

    await page.getByTestId('order-no-input').fill('SO001')
    await expect(page.getByTestId('order-error')).not.toBeVisible()
  })
})
