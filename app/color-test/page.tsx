"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ColorTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">颜色系统测试</h1>
        <p className="text-muted-foreground">
          验证新的颜色规范是否正确应用
        </p>
      </div>

      {/* 颜色方块测试 */}
      <Card>
        <CardHeader>
          <CardTitle>CSS变量颜色测试</CardTitle>
          <CardDescription>直接使用CSS变量的颜色方块</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-lg bg-primary"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">bg-primary</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-lg bg-primary-hover"></div>
              <p className="text-sm font-medium">Primary Hover</p>
              <p className="text-xs text-muted-foreground">bg-primary-hover</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-lg bg-accent"></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-muted-foreground">bg-accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="w-20 h-20 rounded-lg bg-secondary"></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-muted-foreground">bg-secondary</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 按钮测试 */}
      <Card>
        <CardHeader>
          <CardTitle>按钮Hover测试</CardTitle>
          <CardDescription>悬停查看新的hover颜色效果</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button (hover测试)</Button>
            <Button variant="outline">Outline Button (hover测试)</Button>
            <Button variant="ghost">Ghost Button (hover测试)</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button className="bg-accent hover:bg-accent/90">Accent CTA</Button>
          </div>
        </CardContent>
      </Card>

      {/* 交互元素测试 */}
      <Card>
        <CardHeader>
          <CardTitle>交互元素测试</CardTitle>
          <CardDescription>测试各种交互状态的颜色</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">悬停测试项目：</p>
            <div className="space-y-1">
              <div className="p-3 rounded-lg hover:bg-primary-hover/10 hover:text-primary transition-colors cursor-pointer border">
                悬停我 - 应该显示淡紫色背景
              </div>
              <div className="p-3 rounded-lg hover:bg-primary-hover/20 transition-colors cursor-pointer border">
                悬停我 - 应该显示稍深的紫色背景
              </div>
              <div className="p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer border">
                悬停我 - 应该显示淡橙色背景（对比用）
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实时颜色值检测 */}
      <Card>
        <CardHeader>
          <CardTitle>实时颜色检测</CardTitle>
          <CardDescription>通过JavaScript获取实际的计算颜色值</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div 
                  id="primary-test" 
                  className="w-full h-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-medium"
                >
                  Primary
                </div>
                <p className="text-xs font-mono" id="primary-value">检测中...</p>
              </div>
              
              <div className="space-y-2">
                <div 
                  id="primary-hover-test" 
                  className="w-full h-16 rounded-lg bg-primary-hover flex items-center justify-center text-white font-medium"
                >
                  Primary Hover
                </div>
                <p className="text-xs font-mono" id="primary-hover-value">检测中...</p>
              </div>
              
              <div className="space-y-2">
                <div 
                  id="accent-test" 
                  className="w-full h-16 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-medium"
                >
                  Accent
                </div>
                <p className="text-xs font-mono" id="accent-value">检测中...</p>
              </div>
            </div>
          </div>
          
          <script dangerouslySetInnerHTML={{
            __html: `
              setTimeout(() => {
                const primaryEl = document.getElementById('primary-test');
                const primaryHoverEl = document.getElementById('primary-hover-test');
                const accentEl = document.getElementById('accent-test');
                
                if (primaryEl) {
                  const primaryColor = getComputedStyle(primaryEl).backgroundColor;
                  document.getElementById('primary-value').textContent = primaryColor;
                }
                
                if (primaryHoverEl) {
                  const primaryHoverColor = getComputedStyle(primaryHoverEl).backgroundColor;
                  document.getElementById('primary-hover-value').textContent = primaryHoverColor;
                }
                
                if (accentEl) {
                  const accentColor = getComputedStyle(accentEl).backgroundColor;
                  document.getElementById('accent-value').textContent = accentColor;
                }
              }, 1000);
            `
          }} />
        </CardContent>
      </Card>

      {/* 颜色值显示 */}
      <Card>
        <CardHeader>
          <CardTitle>当前颜色值</CardTitle>
          <CardDescription>显示实际的CSS变量值</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <p><strong>浅色模式：</strong></p>
              <p>--primary: 267 53% 47% (应该是 #753BBD)</p>
              <p>--primary-hover: 267 54% 65% (应该是 #9561D0)</p>
              <p>--accent: 24 95% 53% (应该是 #F97316)</p>
            </div>
            <div>
              <p><strong>深色模式：</strong></p>
              <p>--primary: 267 53% 49% (应该是 #763ABF)</p>
              <p>--primary-hover: 267 38% 43% (应该是 #6C38AD)</p>
              <p>--accent: 24 95% 53% (应该是 #F97316)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}