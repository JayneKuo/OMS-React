"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"
import Link from "next/link"

export default function InteractionTestPage() {
  const { t } = useI18n()

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">界面交互测试 / Interface Interaction Test</h1>
          <p className="text-muted-foreground">
            测试页面用于验证导航和用户界面交互功能 / Test page to verify navigation and UI interactions
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>导航测试 / Navigation Test</CardTitle>
              <CardDescription>测试各个模块的导航链接 / Test navigation links to different modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/purchase" className="block">
                <Button variant="outline" className="w-full justify-start">
                  前往采购管理 / Go to Purchase Management
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full justify-start">
                  前往仪表板 / Go to Dashboard
                </Button>
              </Link>
              <Link href="/orders" className="block">
                <Button variant="outline" className="w-full justify-start">
                  前往订单管理 / Go to Order Management
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>用户界面测试 / UI Test</CardTitle>
              <CardDescription>测试用户头像下拉菜单和语言切换 / Test user avatar dropdown and language switching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p><strong>当前语言 / Current Language:</strong> {t('language')} ({t('language') === 'Language' ? 'English' : '中文'})</p>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>测试步骤 / Test Steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>点击右上角用户头像按钮 / Click the user avatar button in the top right</li>
                  <li>查看下拉菜单是否出现 / Check if dropdown menu appears</li>
                  <li>尝试切换语言 / Try switching language</li>
                  <li>点击导航菜单中的&quot;采购管理&quot; / Click &quot;Purchase Management&quot; in navigation</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>问题诊断 / Issue Diagnosis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>已知问题 / Known Issues:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>点击采购管理导航没有响应 / Purchase management navigation not responding</li>
                <li>用户头像按钮点击没有显示下拉菜单 / User avatar button click not showing dropdown</li>
              </ul>
              <p className="mt-4"><strong>可能原因 / Possible Causes:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>JavaScript事件处理问题 / JavaScript event handling issues</li>
                <li>组件状态管理问题 / Component state management issues</li>
                <li>CSS样式冲突 / CSS style conflicts</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}