# OMS系统UI设计规范

**文档版本**: v1.0  
**创建日期**: 2024-12-31  
**适用范围**: OMS订单管理系统  
**设计系统**: 基于Item Design System + shadcn/ui

---

## 文档说明

本文档整合了所有UI设计相关的规范，包括：
- 品牌色彩系统
- 字体排版系统
- Logo使用规范
- Shadcn颜色系统
- 组件设计规范
- 数据表格规范
- 用户下拉菜单规范

---

## 目录

1. [品牌色彩系统](#一品牌色彩系统)
2. [Shadcn颜色系统](#二shadcn颜色系统)
3. [字体排版系统](#三字体排版系统)
4. [Logo使用规范](#四logo使用规范)
5. [间距系统](#五间距系统)
6. [组件规范](#六组件规范)
7. [数据表格规范](#七数据表格规范)
8. [用户下拉菜单规范](#八用户下拉菜单规范)
9. [响应式设计](#九响应式设计)
10. [无障碍设计](#十无障碍设计)

---

## 一、品牌色彩系统

### 1.1 主色调

| 颜色名称 | HEX | RGB | 用途 |
|---------|-----|-----|------|
| White | #FFFFFF | 255, 255, 255 | 纯净、清晰 |
| Black | #000000 | 0, 0, 0 | 优雅、权威 |
| Purple | #6B46C1 | 107, 70, 193 | 创新、品牌主色 |
| Orange | #F97316 | 249, 115, 22 | 活力、强调 |

### 1.2 次要色彩

| 颜色名称 | HEX | RGB | 用途 |
|---------|-----|-----|------|
| Lavender | #E6E6FA | 230, 230, 250 | 背景、柔和强调 |
| Lilac | #C8A2C8 | 200, 162, 200 | 次要UI元素 |
| Orchid | #DA70D6 | 218, 112, 214 | 高亮信息 |
| Iris | #5D3FD3 | 93, 63, 211 | 标题、重要区域 |
| Violet | #8A2BE2 | 138, 43, 226 | 特殊功能 |
| Indigo | #4B0082 | 75, 0, 130 | 深色模式 |

### 1.3 灰度色彩

| 颜色名称 | HEX | RGB | 用途 |
|---------|-----|-----|------|
| Mist | #F2F2F2 | 242, 242, 242 | 浅背景、边框 |
| Dove | #E6E6E6 | 230, 230, 230 | 分隔线、卡片背景 |
| Steel | #CCCCCC | 204, 204, 204 | 边框、禁用状态 |
| Glacier | #999999 | 153, 153, 153 | 次要文字、图标 |
| Slate | #808080 | 128, 128, 128 | 辅助文字 |
| Iron | #666666 | 102, 102, 102 | 重要次要文字 |
| Shadow | #4D4D4D | 77, 77, 77 | 强对比、深度 |

### 1.4 使用规则

**主色使用**：
- Purple (#6B46C1): 主要品牌元素、导航、关键交互组件
- Orange (#F97316): CTA按钮、重要提示、需要立即注意的元素
- Black和White: 中性基础，支持主色

**次要色使用**：
- 浅色(Lavender, Lilac, Orchid): 背景、大面积区域
- 深色(Iris, Violet, Indigo): 强调、标题、品牌聚焦元素
- 次要色补充主色，不与主色竞争

**灰度使用**：
- 浅灰(Mist, Dove, Steel): 背景、细微分隔
- 中灰(Glacier, Slate): 次要文字、非活动状态
- 深灰(Iron, Shadow): 重要文字、强对比

### 1.5 无障碍对比度

**高对比度组合 (AAA级)**：
- Black (#000000) on White (#FFFFFF)
- White (#FFFFFF) on Purple (#6B46C1)
- White (#FFFFFF) on Iris (#5D3FD3)
- White (#FFFFFF) on Violet (#8A2BE2)
- White (#FFFFFF) on Indigo (#4B0082)
- Black (#000000) on Orange (#F97316)

**中对比度组合 (AA级)**：
- Black (#000000) on Lavender (#E6E6FA)
- Black (#000000) on Lilac (#C8A2C8)
- Shadow (#4D4D4D) on White (#FFFFFF)
- Iron (#666666) on White (#FFFFFF)

---

## 二、Shadcn颜色系统

### 2.1 为什么使用Shadcn/UI颜色

- **一致性**: 统一的颜色令牌
- **无障碍**: 符合WCAG标准
- **可扩展**: 易于维护和扩展
- **主题支持**: 内置明暗模式
- **开发友好**: CSS变量与Tailwind无缝集成

### 2.2 主题颜色

#### 背景与前景

| 颜色 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| Background | #fafafa | #000000 | 主应用背景 |
| Foreground | #181818 | #ffffff | 主要文字颜色 |

#### 主色与次色

| 颜色 | 值 | 用途 |
|------|---|------|
| Primary | #763abf | 主按钮、链接、关键交互 |
| Primary Foreground | #ffffff | 主色上的文字 |
| Secondary (浅色) | #dbdbdb | 次要按钮 |
| Secondary (深色) | #2b2e31 | 次要按钮 |
| Secondary Foreground (浅色) | #18181b | 次要色上的文字 |
| Secondary Foreground (深色) | #ededed | 次要色上的文字 |

#### UI组件颜色

| 颜色 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| Card | #ffffff | #0d0d0d | 卡片背景 |
| Card Foreground | #181818 | #fcfcfc | 卡片文字 |
| Muted | #e6e6e6 | #202122 | 柔和背景 |
| Muted Foreground | #666666 | #999999 | 柔和文字、占位符 |
| Popover | #ffffff | #0d0d0d | 弹出层背景 |
| Popover Foreground | #09090b | #fcfcfc | 弹出层文字 |

#### 工具颜色

| 颜色 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| Border | #e0e0e0 | #292929 | 组件边框、分隔线 |
| Input | #e4e4e7 | #1b1a1f | 输入框背景 |
| Ring | #763abf | #828282 | 焦点环、轮廓 |

#### 状态颜色

| 颜色 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| Destructive | #e01529 | #f0283c | 错误、删除、破坏性操作 |
| Destructive Foreground | #fff5f7 | #220202 | 破坏性颜色上的文字 |

#### 图表颜色

| 颜色 | 值 | 用途 |
|------|---|------|
| Chart 1 | #763abf | 主图表颜色 |
| Chart 2 (浅色) | #ff5b26 | 次图表颜色 |
| Chart 2 (深色) | #a176d6 | 次图表颜色 |
| Chart 3 | #247b69 | 第三图表颜色 |
| Chart 4 | #ffba26 | 第四图表颜色 |
| Chart 5 (浅色) | #a176d6 | 第五图表颜色 |
| Chart 5 (深色) | #ff5b26 | 第五图表颜色 |

#### 侧边栏颜色

| 颜色 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| Sidebar Background | #f2f2f2 | #141414 | 侧边栏背景 |
| Sidebar Foreground | #3f3f46 | #f4f4f5 | 侧边栏文字 |
| Sidebar Primary | #18181b | #763abf | 激活的侧边栏项 |
| Sidebar Primary Foreground | #fafafa | #fafafa | 激活项文字 |
| Sidebar Accent | #e6e6e6 | #282929 | 悬停的侧边栏项 |
| Sidebar Accent Foreground | #18181b | #ffffff | 悬停项文字 |
| Sidebar Border | #e5e7eb | #292929 | 侧边栏边框 |
| Sidebar Ring | #763abf | #471584 | 侧边栏焦点环 |

### 2.3 CSS实现

```css
:root {
  --background: 0 0% 98.0392%;
  --foreground: 0 0% 9.4118%;
  --primary: 267.0677 53.4137% 48.8235%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 85.8824%;
  --secondary-foreground: 240 5.8824% 10%;
  --muted: 0 0% 90.1961%;
  --muted-foreground: 0 0% 40%;
  --accent: 0 0% 94.902%;
  --accent-foreground: 0 0% 9.4118%;
  --destructive: 354 82.7586% 48.0392%;
  --destructive-foreground: 348 100% 98.0392%;
  --border: 0 0% 87.8431%;
  --input: 240 5.8824% 90%;
  --ring: 267.0677 53.4137% 48.8235%;
  --radius: 0.625rem;
}

.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --primary: 267.0677 53.4137% 48.8235%;
  --primary-foreground: 0 0% 98.0392%;
  --secondary: 210 6.6667% 18.0392%;
  --secondary-foreground: 0 0% 92.9412%;
  --muted: 210 3.0303% 12.9412%;
  --muted-foreground: 0 0% 60%;
  --accent: 180 3.0303% 12.9412%;
  --accent-foreground: 0 0% 100%;
  --destructive: 354 86.2069% 54.902%;
  --destructive-foreground: 0 88.8889% 7.0588%;
  --border: 0 0% 16.0784%;
  --input: 252 8.6957% 11.1765%;
  --ring: 0 0% 51.0196%;
  --radius: 0.625rem;
}
```

### 2.4 Tailwind使用

```tsx
// 使用颜色令牌
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    点击我
  </button>
</div>

// 卡片
<div className="bg-card text-card-foreground border border-border">
  卡片内容
</div>

// 输入框
<input className="bg-input border border-border text-foreground" />

// 破坏性按钮
<button className="bg-destructive text-destructive-foreground">
  删除
</button>
```

---

## 三、字体排版系统

### 3.1 主字体：Satoshi

**字体特性**：
- 设计师：Indian Type Foundry
- 分类：几何无衬线字体
- 特点：现代、清晰、几何结构、平衡比例

**字重**：
- Light (300): 细微文字、装饰元素
- Regular (400): 正文、段落、标准内容
- Medium (500): 小标题、强调、导航项
- Bold (700): 标题、重要信息、CTA
- Black (900): 展示文字、英雄标题

### 3.2 字体大小规范

| 名称 | 大小 | Tailwind类 | 行高 | 字间距 | 用途 |
|------|------|-----------|------|--------|------|
| H1 | 128px | text-9xl | 1.1 | -0.02em | 英雄标题 |
| H2 | 96px | text-8xl | 1.15 | -0.015em | 页面标题 |
| H3 | 64px | text-7xl | 1.2 | -0.01em | 区域标题 |
| H4 | 48px | text-6xl | 1.25 | -0.005em | 子区域标题 |
| H5 | 36px | text-5xl | 1.3 | 0 | 卡片标题 |
| H6 | 28px | text-4xl | 1.35 | 0 | 小标题 |
| Subtitle 1 | 24px | text-3xl | 1.4 | 0 | 引导段落 |
| Subtitle 2 | 20px | text-2xl | 1.45 | 0 | 次要引导 |
| Body 1 | 20px | text-xl | 1.6 | 0 | 大正文 |
| Body 2 | 18px | text-lg | 1.65 | 0 | 标准正文 |
| Base | 16px | text-base | 1.5 | 0 | 默认文字 |
| Button 1 | 14px | text-sm | 1.4 | 0.01em | 按钮、标签 |
| Button 2 | 12px | text-xs | 1.3 | 0.02em | 小标签、说明 |

### 3.3 响应式字体

**移动端缩放**：
- H1: 128px → 32px
- H2: 96px → 28px
- H3: 64px → 24px
- H4: 48px → 20px
- H5: 36px → 18px
- H6: 28px → 16px
- Subtitle 1: 24px → 14px
- Subtitle 2: 20px → 14px
- Body 1: 20px → 14px
- Body 2: 18px → 12px
- Base: 16px → 14px
- Button 1: 14px → 12px
- Button 2: 12px → 10px

### 3.4 字体加载

```css
/* Satoshi Variable Font */
@font-face {
  font-family: "Satoshi";
  src: url("/fonts/Satoshi-Variable.ttf") format("truetype");
  font-weight: 300 900;
  font-display: swap;
  font-style: normal;
}

body {
  font-family: "Satoshi", -apple-system, BlinkMacSystemFont, 
               "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 3.5 排版最佳实践

**层级**：
- 建立清晰的视觉层级
- 每页限制3-4个标题级别
- 保持一致的间距
- 每个级别应明显区别

**可读性**：
- 行长度：50-75字符
- 行高：正文1.5-1.6
- 段落间距：0.75-1em
- 对比度：充足的文字背景对比

**响应式**：
- 使用clamp()或响应式单位
- 移动端适当缩小
- 触摸目标至少44x44px
- 保持所有尺寸的可读性

**无障碍**：
- 最小字号12px
- 颜色对比度符合WCAG AA (4.5:1)
- 避免小字号使用极细字重
- 确保足够的间距

---

## 四、Logo使用规范

### 4.1 Logo变体

| 变体 | 文件路径 | 背景 | 用途 |
|------|---------|------|------|
| 全彩(白字) | `/svg/item-logo-fullcolor-whitetxt.svg` | 深色背景 | 深色主题、深色营销材料 |
| 全彩(黑字) | `/svg/item-logo-fullcolor-blacktxt.svg` | 浅色背景 | 浅色主题、标准文档 |
| 黑色 | `/svg/item-logo-black.svg` | 浅色背景 | 单色应用、黑白打印 |
| 白色 | `/svg/item-white-logo.svg` | 深色背景 | 深色背景、视频叠加 |

### 4.2 Logo尺寸

**最小尺寸**：
- 数字媒体：120px宽度
- 印刷品：1英寸宽度

**最大尺寸**：
- 无限制（矢量格式）

**清晰空间**：
- 最小内边距 = Logo标记高度
- 确保无杂乱的可见性和易读性

### 4.3 Logo使用规则

**应该做的** ✅：
- 使用原始形式，保持清晰可见
- 保持正确的比例和颜色
- 为背景选择适当的版本
- 保持适当的间距

**不应该做的** ❌：
- 改变颜色或添加渐变
- 扭曲、旋转或拉伸
- 添加效果、描边或阴影
- 放置在杂乱的背景上
- 不成比例地调整元素大小

---

## 五、间距系统

### 5.1 间距规范 (8px增量)

| 名称 | 值 | Tailwind类 | 用途 |
|------|---|-----------|------|
| xs | 4px | gap-1, p-1 | 极小间距 |
| sm | 8px | gap-2, p-2 | 小间距（图标与文字） |
| md | 12px | gap-3, p-3 | 中间距（卡片内元素） |
| lg | 16px | gap-4, p-4 | 标准间距（按钮组） |
| xl | 24px | gap-6, p-6 | 大间距（卡片网格、页面区域） |
| 2xl | 32px | gap-8, p-8 | 超大间距 |
| 3xl | 48px | gap-12, p-12 | 主要区域间距 |
| 4xl | 64px | gap-16, p-16 | 英雄区域 |

### 5.2 常用间距模式

**紧密间距** (gap-2, 8px):
- 按钮组
- 内联元素
- 图标与文字

**正常间距** (gap-3, 12px):
- 表单字段
- 列表项
- 卡片内容

**舒适间距** (gap-4, 16px):
- 内容区域
- 表单组

**宽松间距** (gap-6, 24px):
- 主要区域
- 卡片网格
- 页面区域

**垂直间距**:
- space-y-2 (8px): 紧密列表
- space-y-3 (12px): 表单组
- space-y-4 (16px): 内容区域
- space-y-6 (24px): 页面区域

### 5.3 页面布局间距

```
┌─────────────────────────────────────────────┐
│ Header (固定)                                │
├──────────┬──────────────────────────────────┤
│          │ ↕ 24px (space-y-6)               │
│ Sidebar  │ ┌──────────────────────────────┐ │
│          │ │ 页面标题栏                    │ │
│          │ └──────────────────────────────┘ │
│          │ ↕ 24px                           │
│          │ ┌──────────────────────────────┐ │
│          │ │ 状态标签页                    │ │
│          │ └──────────────────────────────┘ │
│          │ ↕ 24px                           │
│          │ ┌──────────────────────────────┐ │
│          │ │ 筛选工具栏                    │ │
│          │ └──────────────────────────────┘ │
│          │ ↕ 24px                           │
│          │ ┌──────────────────────────────┐ │
│          │ │ 数据表格                      │ │
│          │ └──────────────────────────────┘ │
└──────────┴──────────────────────────────────┘
```

**区域间距**: 24px (space-y-6)  
**卡片内边距**: 24px (p-6)  
**卡片间距**: 24px (gap-6)  
**页面左右内边距**: 24px

---

## 六、组件规范

### 6.1 按钮

**尺寸**：
- Small: size="sm" (h-9 px-3, 36px高)
- Default: h-10 px-4 (40px高)
- Icon: size="icon" (h-9 w-9, 36x36px)

**变体**：
- Primary: bg-primary text-primary-foreground hover:bg-primary/90
- Outline: border border-input hover:bg-accent
- Ghost: hover:bg-accent hover:text-accent-foreground
- Destructive: bg-destructive text-destructive-foreground

**示例**：
```tsx
<Button size="sm">主按钮</Button>
<Button variant="outline" size="sm">次要按钮</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
<Button variant="destructive">删除</Button>
```

### 6.2 输入框

**尺寸**：
- 高度: h-10 (40px)
- 内边距: px-3 py-2 (12px 8px)
- 边框: border border-input rounded-md

**状态**：
- 默认: border-input
- 焦点: focus-visible:ring-2 focus-visible:ring-ring
- 错误: border-destructive
- 禁用: opacity-50 cursor-not-allowed

**示例**：
```tsx
<Input placeholder="请输入..." className="h-10" />
<Input type="email" error={errors.email} />
<Input disabled placeholder="禁用状态" />
```

### 6.3 卡片

**结构**：
```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent>
    内容
  </CardContent>
  <CardFooter>
    底部操作
  </CardFooter>
</Card>
```

**样式**：
- 背景: bg-card
- 文字: text-card-foreground
- 边框: border border-border
- 圆角: rounded-lg
- 内边距: p-6 (24px)

### 6.4 对话框

**尺寸**：
- Small: max-w-sm (384px)
- Medium: max-w-md (448px)
- Large: max-w-lg (512px)
- Extra Large: max-w-xl (576px)
- 2X Large: max-w-2xl (672px)

**结构**：
```tsx
<Dialog>
  <DialogTrigger>打开</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>标题</DialogTitle>
      <DialogDescription>描述</DialogDescription>
    </DialogHeader>
    {/* 内容 */}
    <DialogFooter>
      <Button variant="outline">取消</Button>
      <Button>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 6.5 徽章

**变体**：
- Default: bg-primary text-primary-foreground
- Secondary: bg-secondary text-secondary-foreground
- Outline: border border-input
- Destructive: bg-destructive text-destructive-foreground

**状态徽章颜色**：
- 成功: bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400
- 警告: bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400
- 信息: bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400
- 危险: bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400

**筛选徽章**：
- 样式: bg-primary/10 text-primary border border-primary/20
- Hover: hover:bg-primary/20
- 带关闭按钮: gap-1 with X icon (h-3 w-3)

### 6.6 标签页

**容器**：
- 背景: bg-muted
- 内边距: p-1
- 圆角: rounded-md

**标签**：
- 未激活: text-muted-foreground
- 激活: bg-primary text-primary-foreground
- 内边距: px-3 py-1.5 (12px 6px)

**标签中的徽章**：
- 激活: bg-transparent text-primary-foreground border-0
- 未激活: bg-secondary text-secondary-foreground

**示例**：
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="all">
      全部
      <Badge className={cn(
        "ml-2",
        activeTab === "all" && "bg-transparent text-primary-foreground border-0"
      )}>
        125
      </Badge>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

### 6.7 下拉菜单

**容器**：
- 宽度: 根据内容或固定宽度
- 最大高度: max-h-[400px]
- 内边距: p-1
- 圆角: rounded-md

**菜单项**：
- 内边距: px-2 py-2
- Hover: hover:bg-primary-hover/10 hover:text-primary
- 圆角: rounded-sm
- 字体: text-sm

**分隔线**：
- 高度: h-px
- 背景: bg-border
- 边距: my-1

---

## 七、数据表格规范

### 7.1 表格结构

**容器**：
- Card包裹: pt-6 (24px顶部内边距)
- 边框: border rounded-md

**表头**：
- 背景: bg-muted/50 (浅灰色)
- 文字: text-sm (14px) font-medium
- 内边距: p-3 (12px)
- 对齐: 左对齐(文字)、右对齐(数字)、居中(操作)

**表格内容**：
- 文字: text-xs (12px)
- 内边距: p-3 (12px)
- 行高: 自适应
- 边框: border-t (顶部边框)

**行状态**：
- 默认: bg-background
- Hover: hover:bg-primary-hover/10
- 选中: bg-primary-hover/10

### 7.2 列宽建议

| 列类型 | 宽度 | 说明 |
|--------|------|------|
| 复选框 | 50px | 固定左侧 |
| 订单编号 | 150px | 可点击 |
| 客户名称 | 200px | 文字列 |
| 状态 | 120px | 徽章显示 |
| 金额 | 120px | 右对齐 |
| 日期 | 120px | 标准格式 |
| 操作 | 80px | 固定右侧 |

### 7.3 单号列

**样式**：
- 文字: font-medium text-primary
- Hover: hover:text-primary/80 hover:underline
- 复制按钮: opacity-0 group-hover:opacity-100

**示例**：
```tsx
<OrderNumberCell 
  orderNumber={row.orderNo} 
  onClick={() => router.push(`/orders/${row.id}`)}
/>
```

### 7.4 筛选工具栏

**布局**：
```
[搜索框] [筛选按钮...] [更多▼] | [批量搜索] [高级搜索] [列设置]
```

**搜索框**：
- 宽度: max-w-md (384px)
- 高度: h-9 (36px)
- 图标: 左侧Search图标 (h-4 w-4)
- 清除: 右侧X按钮

**筛选按钮**：
- 样式: variant="outline" size="sm"
- 间距: gap-2 (8px)
- 激活数量徽章: Badge variant="secondary"

**"更多筛选"功能**：
1. **动态显示**：
   - 根据容器宽度自动计算可见筛选数量
   - 超出部分收纳到"更多"下拉菜单
   - 响应窗口大小变化

2. **三层搜索**：
   - 第一层：顶部菜单搜索（搜索筛选项名称和选项内容）
   - 第二层：筛选项子菜单（DropdownMenuSub）
   - 第三层：选项搜索框（智能填充搜索词）

3. **视觉反馈**：
   - 匹配数量徽章：bg-primary/10 text-primary
   - 激活数量徽章：variant="secondary"
   - 两个徽章可同时显示

### 7.5 批量操作栏

**容器**：
- 背景: border-primary/20 bg-primary/5
- 内边距: py-3 (12px)

**布局**：
```
已选择 5 项 [取消选择] | [批量导出] [批量发送] [更多▼]
```

**样式**：
- 选中文字: text-sm font-medium
- 数量文字: text-primary
- 取消按钮: variant="ghost" size="sm" h-8 text-xs
- 操作按钮: variant="outline" size="sm" gap-2

### 7.6 分页

**布局**：
```
[已选N项]              [每页: 10▼] [显示1-10/共100] [«] [‹] [1/10] [›] [»]
```

**样式**：
- 容器: flex items-center justify-between
- 左侧信息: text-sm text-muted-foreground
- 右侧区域: flex items-center gap-6
- 每页选择器: h-8 w-[70px]
- 页码信息: text-sm font-medium
- 按钮: variant="outline" size="sm"
- 禁用按钮: disabled (灰色不可点击)

---

## 八、用户下拉菜单规范

### 8.1 触发器

**布局**：
```
[头像] [用户名] [▼]
       [邮箱]
```

**样式**：
- 容器: flex items-center gap-2 px-2 py-1.5
- Hover: hover:bg-accent rounded-md
- 头像: h-8 w-8 rounded-full
- 用户名: text-sm font-medium
- 邮箱: text-xs text-muted-foreground
- 图标: h-4 w-4 text-muted-foreground

### 8.2 下拉菜单

**容器**：
- 宽度: w-[280px]
- 对齐: align="end"
- 内边距: p-2

**菜单项**：
- 内边距: px-3 py-2
- Hover: hover:bg-primary-hover/10 hover:text-primary
- 圆角: rounded-sm
- 字体: text-sm
- 图标: h-4 w-4 mr-2

**分组**：
- 标签: text-xs font-semibold text-muted-foreground px-3 py-2
- 分隔线: my-1 h-px bg-border

**子菜单**：
- 触发器: DropdownMenuSubTrigger
- 内容: DropdownMenuSubContent
- 指示器: ChevronRight图标

### 8.3 键盘导航

- **Tab**: 在菜单项间导航
- **Arrow Keys**: 上下选择菜单项
- **Enter/Space**: 激活选中项
- **Escape**: 关闭菜单

### 8.4 响应式

- **桌面端** (≥1280px): 宽度280px，右对齐，子菜单左侧展开
- **平板端** (768px-1279px): 宽度260px，优化触摸目标
- **移动端** (<768px): 考虑使用Sheet组件全屏模式

---

## 九、响应式设计

### 9.1 断点定义

| 断点 | 屏幕宽度 | 设备类型 | Tailwind前缀 |
|------|---------|---------|-------------|
| 默认 | < 768px | 移动端 | 无 |
| md | ≥ 768px | 平板 | md: |
| lg | ≥ 1024px | 小桌面 | lg: |
| xl | ≥ 1280px | 桌面 | xl: |
| 2xl | ≥ 1536px | 大桌面 | 2xl: |

### 9.2 布局适配

**信息卡片网格**：
- 移动端: grid-cols-1
- 平板: md:grid-cols-2
- 桌面: xl:grid-cols-4

**表格**：
- 移动端: 横向滚动，显示最少列
- 平板: 显示主要列
- 桌面: 显示所有列

**按钮**：
- 移动端: 全宽按钮或图标按钮
- 桌面: 固定宽度按钮

**侧边栏**：
- 移动端: 隐藏，使用汉堡菜单
- 平板: 收起，显示图标
- 桌面: 展开，显示完整菜单

### 9.3 触摸优化

**最小触摸目标**：
- 按钮: 44x44px (h-11 w-11)
- 图标按钮: 40x40px (h-10 w-10)
- 链接: 行高至少44px

**间距**：
- 移动端增加间距
- 避免元素过于紧密
- 确保误触容错

---

## 十、无障碍设计

### 10.1 颜色对比度

**WCAG 2.1 AA标准**：
- 普通文字: 最小对比度4.5:1
- 大文字(18pt+或14pt+加粗): 最小对比度3:1
- UI组件和图形: 最小对比度3:1

**WCAG 2.1 AAA标准**：
- 普通文字: 最小对比度7:1
- 大文字: 最小对比度4.5:1

### 10.2 焦点状态

**焦点环**：
```css
focus-visible:ring-2 
focus-visible:ring-ring 
focus-visible:ring-offset-2
focus-visible:outline-none
```

**交互元素**：
- 最小触摸目标: 40px (h-10)
- 图标按钮: h-9 w-9 (36px)
- 始终包含hover状态

### 10.3 语义化HTML

- 使用正确的HTML标签
- 提供alt文本
- 使用aria-label
- 保持正确的标题层级

### 10.4 键盘导航

- 所有交互元素可通过Tab访问
- 提供跳过导航链接
- 焦点顺序合理
- 支持快捷键

---

## 十一、深色模式

### 11.1 实现方式

```tsx
// 使用ThemeProvider
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>

// 切换主题
const { theme, setTheme } = useTheme()
setTheme('dark') // 'light' | 'dark' | 'system'
```

### 11.2 颜色适配

所有颜色使用CSS变量，自动适配深色模式：

```tsx
// 自动适配
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    按钮
  </button>
</div>
```

### 11.3 图片适配

```tsx
// 深色模式下调整图片
<img className="dark:brightness-75 dark:contrast-125" />

// 或使用不同图片
<img 
  src={theme === 'dark' ? darkImage : lightImage} 
  alt="Logo" 
/>
```

---

## 十二、动画与过渡

### 12.1 过渡时间

| 类型 | 时间 | 用途 |
|------|------|------|
| 快速 | 150ms | 悬停、焦点 |
| 标准 | 200ms | 展开、收起 |
| 慢速 | 300ms | 页面过渡 |

### 12.2 缓动函数

```css
/* 标准缓动 */
transition: all 200ms ease-in-out;

/* 弹性缓动 */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### 12.3 常用动画

```tsx
// Hover效果
className="transition-colors hover:bg-accent"

// 展开/收起
className="transition-all data-[state=open]:animate-in data-[state=closed]:animate-out"

// 淡入淡出
className="animate-in fade-in-0 zoom-in-95"
```

---

## 十三、图标系统

### 13.1 图标库

使用 **Lucide React** 图标库：

```tsx
import { Search, X, ChevronDown, Filter } from 'lucide-react'

<Search className="h-4 w-4" />
```

### 13.2 图标尺寸

| 尺寸 | 类名 | 像素 | 用途 |
|------|------|------|------|
| 小 | h-3 w-3 | 12px | 徽章内图标 |
| 标准 | h-4 w-4 | 16px | 按钮、菜单图标 |
| 中 | h-5 w-5 | 20px | 标题图标 |
| 大 | h-6 w-6 | 24px | 大按钮图标 |

### 13.3 图标颜色

```tsx
// 主色
<Icon className="text-primary" />

// 柔和色
<Icon className="text-muted-foreground" />

// 继承文字颜色
<Icon className="text-current" />
```

---

## 十四、最佳实践清单

### 14.1 设计检查

- [ ] Logo有适当的清晰空间
- [ ] 颜色使用CSS变量
- [ ] 排版遵循规范
- [ ] 间距使用一致的令牌(8px增量)
- [ ] 支持深色模式
- [ ] 语义颜色应用正确
- [ ] 图片符合分辨率要求
- [ ] 无障碍检查通过
- [ ] 选择状态使用主色(紫色)
- [ ] 交互元素定义了hover状态
- [ ] 焦点状态对键盘导航可见

### 14.2 开发检查

- [ ] 使用shadcn/ui组件
- [ ] 遵循Tailwind CSS最佳实践
- [ ] 组件支持深色模式
- [ ] 响应式设计正确
- [ ] 无障碍属性完整
- [ ] 性能优化完成
- [ ] 代码符合规范
- [ ] 测试覆盖充分

---

## 附录

### A. 快速参考

**主色**：
- Primary: #763abf (紫色)
- Orange: #F97316 (橙色)

**字体**：
- Satoshi (300-900)
- Base Size: 16px
- Spacing Unit: 8px

**间距**：
- 小: 8px (gap-2)
- 中: 12px (gap-3)
- 标准: 16px (gap-4)
- 大: 24px (gap-6)

**断点**：
- md: 768px
- xl: 1280px

### B. 相关资源

- [shadcn/ui文档](https://ui.shadcn.com/)
- [Tailwind CSS文档](https://tailwindcss.com/)
- [Lucide图标](https://lucide.dev/)
- [WCAG指南](https://www.w3.org/WAI/WCAG21/)

---

**文档维护**: 设计团队  
**最后更新**: 2024-12-31
