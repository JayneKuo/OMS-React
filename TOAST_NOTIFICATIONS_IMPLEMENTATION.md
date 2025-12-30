# Toast 通知实现总结

## 实现内容

在 `real-layout-demo` 页面中添加了完整的 Toast 通知系统，展示了所有四种状态类型。

## Toast 类型和配色

### 1. Success (成功)
- **颜色**: 绿色 (#15803D)
- **样式**: 左侧 4px 绿色边框 + 浅绿色背景 (5% 透明度)
- **示例**: 
  - "订单创建成功" - 新建订单按钮
  - "订单已复制" - 更多操作菜单
  - "发送成功" - 表格行操作

### 2. Error (错误)
- **颜色**: 红色 (#F0283C)
- **样式**: 左侧 4px 红色边框 + 浅红色背景 (5% 透明度)
- **示例**:
  - "删除失败" - 详情页删除操作
  - "操作失败" - 表格行删除操作
  - "网络连接超时" - 演示按钮

### 3. Warning (警告)
- **颜色**: 黄色 (#e79f04)
- **样式**: 左侧 4px 黄色边框 + 浅黄色背景 (5% 透明度)
- **示例**:
  - "请先保存当前修改" - 详情页发送按钮
  - "该操作将影响所有关联订单" - 演示按钮

### 4. Info (信息)
- **颜色**: 灰色 (#666666)
- **样式**: 左侧 4px 灰色边框 + 浅灰色背景 (5% 透明度)
- **示例**:
  - "导出任务已创建" - 导出按钮
  - "正在生成PDF" - 更多操作菜单
  - "编辑功能" - 表格行编辑操作
  - "系统提示" - 演示按钮

## 技术实现

### 1. CSS 样式 (`app/globals.css`)
使用 CSS 选择器直接针对 sonner 的 data 属性添加样式：

```css
@layer components {
  /* Toast Notifications */
  [data-sonner-toast][data-type="success"] {
    border-left: 4px solid hsl(var(--success)) !important;
    background-color: hsl(var(--success) / 0.05) !important;
  }
  
  [data-sonner-toast][data-type="error"] {
    border-left: 4px solid hsl(var(--destructive)) !important;
    background-color: hsl(var(--destructive) / 0.05) !important;
  }
  
  [data-sonner-toast][data-type="warning"] {
    border-left: 4px solid hsl(var(--warning)) !important;
    background-color: hsl(var(--warning) / 0.05) !important;
  }
  
  [data-sonner-toast][data-type="info"] {
    border-left: 4px solid hsl(var(--info)) !important;
    background-color: hsl(var(--info) / 0.05) !important;
  }
}
```

### 2. Toaster 组件 (`components/ui/sonner.tsx`)
简化配置，让 CSS 样式生效：

```tsx
<Sonner
  theme={theme as ToasterProps["theme"]}
  position="top-center"
  className="toaster group"
  toastOptions={{
    classNames: {
      toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:shadow-lg",
      description: "group-[.toast]:text-muted-foreground",
    },
  }}
/>
```

### 3. 使用方法
```tsx
// 成功通知
toast.success("标题", { description: "描述信息" })

// 错误通知
toast.error("标题", { description: "描述信息" })

// 警告通知
toast.warning("标题", { description: "描述信息" })

// 信息通知
toast.info("标题", { description: "描述信息" })
```

## 演示功能

在页面底部中央添加了"演示 Toast"按钮，点击后会依次弹出所有四种类型的通知：
1. Success - 操作成功
2. Error - 操作失败 (300ms 延迟)
3. Warning - 注意事项 (600ms 延迟)
4. Info - 系统提示 (900ms 延迟)

## 位置和样式

- **位置**: 页面顶部居中 (`position="top-center"`)
- **边框**: 左侧 4px 彩色边框区分类型
- **背景**: 对应颜色的 5% 透明度背景
- **阴影**: shadow-lg 提供深度感
- **主题**: 自动适配明暗模式

## 符合设计规范

所有颜色使用 CSS 变量，完全符合 UI Design Guide 中的语义颜色规范：
- Success: #15803D (绿色) - `hsl(142 71% 29%)`
- Warning: #e79f04 (黄色) - `hsl(38 92% 50%)`
- Danger: #F0283C (红色) - `hsl(354 83% 48%)`
- Info: #666666 (灰色) - `hsl(0 0% 40%)`

## 关键点

1. **使用 CSS 选择器而非 Tailwind 类名**：因为 sonner 使用 `data-type` 属性，直接用 CSS 选择器更可靠
2. **使用 !important**：确保样式优先级高于默认样式
3. **HSL 颜色格式**：使用 `hsl(var(--color) / 0.05)` 实现透明度
4. **自动主题适配**：CSS 变量在明暗模式下自动切换

---
实现日期: 2024-12-30
更新日期: 2024-12-30 (修复颜色显示问题)
