"use client"

// 强制动态渲染，避免构建时预渲染错误
export const dynamic = 'force-dynamic'

import { TenantSwitcher } from "@/components/layout/tenant-switcher"
import { TenantSwitcherOptimized } from "@/components/layout/tenant-switcher-optimized"
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ColorFixTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">颜色修复验证</h1>
        <p className="text-muted-foreground">
          验证项目中各个组件的颜色是否已正确修复为紫色hover
        </p>
      </div>

      {/* 切换器组件测试 */}
      <Card>
        <CardHeader>
          <CardTitle>切换器组件测试</CardTitle>
          <CardDescription>
            测试各种切换器的hover颜色是否为紫色
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">原版租户切换器</h3>
              <div className="p-4 border rounded-lg bg-sidebar">
                <TenantSwitcher />
              </div>
              <p className="text-xs text-muted-foreground">
                hover应该显示淡紫色背景
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">优化版租户切换器</h3>
              <div className="p-4 border rounded-lg bg-sidebar">
                <TenantSwitcherOptimized />
              </div>
              <p className="text-xs text-muted-foreground">
                hover应该显示淡紫色背景
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">工作区切换器</h3>
              <div className="p-4 border rounded-lg bg-sidebar">
                <WorkspaceSwitcher />
              </div>
              <p className="text-xs text-muted-foreground">
                hover应该显示淡紫色背景
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 按钮组件测试 */}
      <Card>
        <CardHeader>
          <CardTitle>按钮组件测试</CardTitle>
          <CardDescription>
            测试各种按钮变体的hover颜色
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button className="bg-accent hover:bg-accent/90">Accent CTA</Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>预期效果：</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Primary: hover时变为更亮的紫色</li>
              <li>Outline: hover时显示淡紫色背景</li>
              <li>Ghost: hover时显示淡紫色背景</li>
              <li>Secondary: hover时变为更深的灰色</li>
              <li>Accent CTA: hover时变为更深的橙色</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 下拉菜单测试 */}
      <Card>
        <CardHeader>
          <CardTitle>下拉菜单测试</CardTitle>
          <CardDescription>
            测试下拉菜单项的hover颜色
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">打开菜单测试</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>菜单项 1 (hover测试)</DropdownMenuItem>
              <DropdownMenuItem>菜单项 2 (hover测试)</DropdownMenuItem>
              <DropdownMenuItem>菜单项 3 (hover测试)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <p className="text-sm text-muted-foreground">
            菜单项hover时应该显示淡紫色背景，而不是橙色
          </p>
        </CardContent>
      </Card>

      {/* 交互元素测试 */}
      <Card>
        <CardHeader>
          <CardTitle>交互元素测试</CardTitle>
          <CardDescription>
            测试各种交互元素的hover效果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="p-3 rounded-lg hover:bg-primary-hover/10 hover:text-primary transition-colors cursor-pointer border">
              ✅ 正确的hover效果 - 淡紫色背景
            </div>
            <div className="p-3 rounded-lg hover:bg-primary-hover/20 transition-colors cursor-pointer border">
              ✅ 稍深的紫色hover效果
            </div>
            <div className="p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer border">
              ⚠️ 橙色hover效果（仅用于对比）
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 颜色对比 */}
      <Card>
        <CardHeader>
          <CardTitle>颜色对比</CardTitle>
          <CardDescription>
            直观对比新旧颜色效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-green-600">✅ 正确的颜色使用</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                  <span className="text-sm">Primary - 主要元素</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary-hover"></div>
                  <span className="text-sm">Primary Hover - 悬停状态</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-accent"></div>
                  <span className="text-sm">Accent - 仅用于CTA</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-red-600">❌ 错误的颜色使用</h3>
              <div className="space-y-2 opacity-50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-accent"></div>
                  <span className="text-sm line-through">Accent用于hover状态</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-accent"></div>
                  <span className="text-sm line-through">Accent用于选中状态</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}