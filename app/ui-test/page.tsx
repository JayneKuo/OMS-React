"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, ExternalLink, Palette, Type, Layout, Layers, Eye } from "lucide-react"

export default function UITestPage() {
  const testUIGuidelines = () => {
    window.open('/ui-guidelines', '_blank')
  }

  const features = [
    {
      icon: <Palette className="h-5 w-5" />,
      title: "颜色系统",
      description: "完整的品牌颜色、UI主题颜色、语义颜色和文本颜色展示"
    },
    {
      icon: <Type className="h-5 w-5" />,
      title: "字体排版",
      description: "基于Satoshi字体的完整字体层级和间距系统"
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "组件样式",
      description: "按钮、徽章、下拉菜单等常用组件的实际样式展示"
    },
    {
      icon: <Layout className="h-5 w-5" />,
      title: "表单组件",
      description: "输入框、选择器、文本域、复选框等表单元素"
    },
    {
      icon: <Layout className="h-5 w-5" />,
      title: "数据展示",
      description: "数据表格、卡片组件、进度条等数据展示组件"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "设计规范",
      description: "实施检查清单、CSS变量使用指南和快速参考"
    }
  ]

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">UI 设计规范测试页面</h1>
        <p className="text-lg text-muted-foreground mb-6">
          全新的UI设计规范页面已经完成，融合了AI-Friendly UI Design Guide的所有内容，并提供了直观的组件样式展示。
        </p>
        <Button onClick={testUIGuidelines} size="lg" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          打开 UI 设计规范
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            新功能特性
          </CardTitle>
          <CardDescription>
            全面升级的UI设计规范页面包含以下6个主要部分
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <div className="text-primary">{feature.icon}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>实际组件展示</CardTitle>
            <CardDescription>页面包含真实可交互的组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>默认徽章</Badge>
              <Badge variant="secondary">次要徽章</Badge>
              <Badge variant="outline">边框徽章</Badge>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">成功状态</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm">小按钮</Button>
              <Button>默认按钮</Button>
              <Button variant="outline">边框按钮</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>颜色系统</CardTitle>
            <CardDescription>可点击复制的颜色色板</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <div className="h-12 rounded bg-[#753BBD]"></div>
                <div className="text-xs text-center">Primary</div>
              </div>
              <div className="space-y-1">
                <div className="h-12 rounded bg-[#F97316]"></div>
                <div className="text-xs text-center">Orange</div>
              </div>
              <div className="space-y-1">
                <div className="h-12 rounded bg-[#15803D]"></div>
                <div className="text-xs text-center">Success</div>
              </div>
              <div className="space-y-1">
                <div className="h-12 rounded bg-[#F0283C]"></div>
                <div className="text-xs text-center">Danger</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>如何使用</CardTitle>
          <CardDescription>访问UI设计规范的多种方式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
              <div>
                <h4 className="font-medium">通过用户下拉菜单</h4>
                <p className="text-sm text-muted-foreground">点击右上角用户图标，选择"UI Design Guidelines"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
              <div>
                <h4 className="font-medium">直接访问链接</h4>
                <p className="text-sm text-muted-foreground">访问 <code className="bg-muted px-1 rounded">/ui-guidelines</code> 路径</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
              <div>
                <h4 className="font-medium">使用测试按钮</h4>
                <p className="text-sm text-muted-foreground">点击上方的"打开 UI 设计规范"按钮</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">完全符合 AI-Friendly UI Design Guide</h3>
        <p className="text-muted-foreground">
          新的UI规范页面完全基于您提供的设计指南，包含所有颜色、字体、间距和组件规范，
          并提供了直观的可视化展示和实际可交互的组件示例。
        </p>
      </div>
    </div>
  )
}