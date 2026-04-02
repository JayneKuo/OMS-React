import { test, expect } from '@playwright/test'
import { diagnosisOnlyResult, needsConfirmationResult, singleSuccessResult } from './fixtures/mock-data'

/**
 * Task 10.3 - 仅诊断模式和确认对话框 E2E 测试
 * 需求：7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4
 */

test.describe('AI 异常处理 - 仅诊断模式', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders/exception-ai')
  })

  test('开启仅诊断开关 → 提交 → 无修复卡片 → 显示手动修复按钮', async ({ page }) => {
    // Mock API 返回仅诊断结果
    await page.route('**/api/exception/run', async (route, request) => {
      const body = JSON.parse(request.postData() || '{}')
      // 验证 auto_repair 为 false
      expect(body.auto_repair).toBe(false)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(diagnosisOnlyResult),
      })
    })

    // 开启仅诊断开关
    await page.getByTestId('diagnosis-only-toggle').click()

    // 提交
    await page.getByTestId('order-no-input').fill('SO00999999')
    await page.getByTestId('order-query-btn').click()

    // 等待结果
    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })

    // 诊断卡片可见
    await expect(page.getByTestId('diagnosis-card')).toBeVisible()

    // 修复卡片不可见
    await expect(page.getByTestId('repair-card')).not.toBeVisible()

    // 手动修复按钮可见
    await expect(page.getByTestId('trigger-repair-btn')).toBeVisible()
  })

  test('关闭仅诊断开关后 auto_repair 为 true', async ({ page }) => {
    await page.route('**/api/exception/run', async (route, request) => {
      const body = JSON.parse(request.postData() || '{}')
      expect(body.auto_repair).toBe(true)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(singleSuccessResult),
      })
    })

    // 确保开关关闭（默认状态）
    await page.getByTestId('symptom-textarea').fill('测试 auto_repair')
    await page.getByTestId('submit-symptom').click()

    await expect(page.getByTestId('result-display')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('AI 异常处理 - 确认对话框', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders/exception-ai')
  })

  test('需确认的修复 → 对话框显示 → 确认执行', async ({ page }) => {
    let callCount = 0
    await page.route('**/api/exception/run', async (route) => {
      callCount++
      if (callCount === 1) {
        // 第一次返回需确认的结果
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(needsConfirmationResult),
        })
      } else {
        // 确认后的第二次请求返回成功
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(singleSuccessResult),
        })
      }
    })

    await page.getByTestId('symptom-textarea').fill('订单卡住了')
    await page.getByTestId('submit-symptom').click()

    // 确认对话框出现
    await expect(page.getByTestId('confirmation-dialog')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('确认修复操作')).toBeVisible()
    await expect(page.getByTestId('confirm-action-code')).toHaveText('CANCEL_AND_RECREATE')

    // 点击确认
    await page.getByTestId('confirm-btn').click()

    // 对话框关闭
    await expect(page.getByTestId('confirmation-dialog')).not.toBeVisible()
  })

  test('需确认的修复 → 对话框显示 → 拒绝', async ({ page }) => {
    await page.route('**/api/exception/run', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(needsConfirmationResult),
      })
    })

    await page.getByTestId('symptom-textarea').fill('订单卡住了')
    await page.getByTestId('submit-symptom').click()

    // 确认对话框出现
    await expect(page.getByTestId('confirmation-dialog')).toBeVisible({ timeout: 5000 })

    // 点击拒绝
    await page.getByTestId('reject-btn').click()

    // 对话框关闭
    await expect(page.getByTestId('confirmation-dialog')).not.toBeVisible()

    // 结果仍然显示（诊断卡片）
    await expect(page.getByTestId('diagnosis-card')).toBeVisible()
  })
})
