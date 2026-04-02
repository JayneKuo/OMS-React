import { test, expect } from '@playwright/test'

/**
 * Task 10.1 - 页面导航和基础渲染 E2E 测试
 * 需求：1.1, 1.2, 1.3, 12.1
 */
test.describe('AI 异常处理 - 页面导航与基础渲染', () => {
  test('通过侧边栏导航到 /orders/exception-ai', async ({ page }) => {
    await page.goto('/orders')
    // 点击侧边栏中的 "AI 异常处理" 链接
    const menuItem = page.getByRole('link', { name: 'AI 异常处理' })
    await menuItem.click()
    await expect(page).toHaveURL('/orders/exception-ai')
  })

  test('直接访问页面 - 所有核心区域已渲染', async ({ page }) => {
    await page.goto('/orders/exception-ai')

    // 页面标题
    await expect(page.getByRole('heading', { name: 'AI 异常处理' })).toBeVisible()

    // 自然语言输入区域
    await expect(page.getByTestId('natural-language-input')).toBeVisible()
    await expect(page.getByTestId('symptom-textarea')).toBeVisible()
    await expect(page.getByTestId('submit-symptom')).toBeVisible()

    // 快捷操作栏
    await expect(page.getByTestId('quick-action-bar')).toBeVisible()
    await expect(page.getByTestId('order-no-input')).toBeVisible()
    await expect(page.getByTestId('merchant-no-input')).toBeVisible()

    // 仅诊断开关
    await expect(page.getByTestId('diagnosis-only-toggle')).toBeVisible()

    // 历史面板
    await expect(page.getByTestId('history-panel')).toBeVisible()
  })

  test('首次加载显示空状态提示', async ({ page }) => {
    await page.goto('/orders/exception-ai')

    // 结果区域显示空状态
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByText('输入问题描述或使用快捷操作开始诊断')).toBeVisible()

    // 历史面板显示空提示
    await expect(page.getByTestId('history-empty')).toBeVisible()
    await expect(page.getByText('暂无历史记录')).toBeVisible()
  })

  test('提交按钮在输入为空时禁用', async ({ page }) => {
    await page.goto('/orders/exception-ai')
    await expect(page.getByTestId('submit-symptom')).toBeDisabled()
  })
})
