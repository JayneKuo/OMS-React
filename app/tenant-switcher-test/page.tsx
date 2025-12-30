"use client"

import { TenantSwitcherOptimized } from "@/components/layout/tenant-switcher-optimized"
import { TenantSwitcher } from "@/components/layout/tenant-switcher"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function TenantSwitcherTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">租户切换器优化测试</h1>
        <p className="text-muted-foreground">
          对比原版和优化版的租户切换器，验证黑暗模式下的颜色规范
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 原版租户切换器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              原版租户切换器
              <Badge variant="secondary">当前版本</Badge>
            </CardTitle>
            <CardDescription>
              使用 DropdownMenu 的原版实现
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-sidebar">
              <TenantSwitcher />
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>特点：</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>使用 DropdownMenu 组件</li>
                <li>两级导航（租户 → 商户）</li>
                <li>简单的选中状态显示</li>
                <li>基础的交互体验</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 优化版租户切换器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              优化版租户切换器
              <Badge className="bg-primary text-primary-foreground">新版本</Badge>
            </CardTitle>
            <CardDescription>
              使用 Dialog 的优化实现，符合设计规范
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-sidebar">
              <TenantSwitcherOptimized />
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>优化特点：</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>使用 Dialog 弹窗，更现代的交互</li>
                <li>支持搜索功能（租户和商户）</li>
                <li>更清晰的选中状态视觉反馈</li>
                <li>符合设计规范的颜色使用</li>
                <li>正确的hover状态颜色</li>
                <li>更好的信息展示和组织</li>
                <li>支持国际化</li>
              </ul>
            </div>
            
            {/* 颜色示例按钮 */}
            <div className="space-y-3">
              <p className="text-sm font-medium">颜色规范示例：</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Primary Button</Button>
                <Button variant="outline" size="sm">Outline Button</Button>
                <Button variant="ghost" size="sm">Ghost Button</Button>
                <Button className="bg-accent hover:bg-accent/90" size="sm">Accent CTA</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* 颜色规范说明 */}
      <Card>
        <CardHeader>
          <CardTitle>颜色规范说明</CardTitle>
          <CardDescription>
            根据 UI 设计规范，黑暗模式下的颜色使用标准
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">主要颜色 (Primary)</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary"></div>
                  <div>
                    <p className="font-medium">紫色 - 浅色模式: #753BBD / 深色模式: #763ABF</p>
                    <p className="text-sm text-muted-foreground">用于选中状态、主要按钮、品牌元素</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary-hover"></div>
                  <div>
                    <p className="font-medium">紫色悬停 - 浅色模式: #9561D0 / 深色模式: #6C38AD</p>
                    <p className="text-sm text-muted-foreground">用于悬停状态、交互反馈</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>使用场景：</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>选中的租户/商户背景色</li>
                    <li>主要交互元素</li>
                    <li>品牌标识颜色</li>
                    <li>焦点状态指示</li>
                    <li>悬停状态背景</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">强调颜色 (Accent)</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-accent"></div>
                  <div>
                    <p className="font-medium">橙色 #F97316</p>
                    <p className="text-sm text-muted-foreground">用于 CTA 按钮、重要提醒</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p><strong>使用场景：</strong></p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>行动召唤按钮</li>
                    <li>重要通知和警告</li>
                    <li>需要突出的元素</li>
                    <li>特殊强调内容</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">设计原则</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <p><strong>✅ 正确使用：</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>紫色用于选中状态和主要交互</li>
                  <li>紫色hover变体用于悬停状态</li>
                  <li>橙色用于强调和行动召唤</li>
                  <li>保持颜色的语义一致性</li>
                  <li>确保足够的对比度</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p><strong>❌ 避免：</strong></p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>橙色用于选中状态</li>
                  <li>橙色用于悬停状态</li>
                  <li>混合使用不同的选中颜色</li>
                  <li>忽略黑暗模式的对比度</li>
                  <li>过度使用强调色</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}