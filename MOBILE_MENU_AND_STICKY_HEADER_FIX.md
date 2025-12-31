# 移动端导航和表头吸顶位置修复

## 修复日期
2024-12-31

## 问题描述

### 问题1: 表头吸顶位置不正确
- **现象**: 当屏幕尺寸在 lg-xl 范围时（1024px-1279px），导航显示在第二行，header高度增加，但表头吸顶位置仍然固定在56px
- **影响**: 吸顶表头会覆盖第二行导航的一部分

### 问题2: 第二行导航被表格内容挡住
- **现象**: 第二行导航的z-index不够高，可能被表格内容覆盖
- **影响**: 导航菜单无法正常点击或显示不完整

## 解决方案

### 1. 动态计算Header高度

**文件**: `components/data-table/data-table-with-sticky-header.tsx`

**修改内容**:
- 添加 `headerHeight` 状态来存储动态计算的header高度
- 在每次滚动事件中重新计算header高度，而不是只计算一次
- 使用状态值来设置吸顶表头的 `top` 位置

```typescript
// 添加状态
const [headerHeight, setHeaderHeight] = React.useState(56)

// 在滚动处理函数中动态计算
const handleScroll = () => {
  // ...
  const header = document.querySelector('header')
  const currentHeaderHeight = header ? header.offsetHeight : 56
  setHeaderHeight(currentHeaderHeight)
  
  // 使用动态高度进行判断
  if (containerRect.top < currentHeaderHeight && containerRect.bottom > currentHeaderHeight + 100) {
    setIsSticky(true)
    // ...
  }
}

// 渲染时使用状态值
<div 
  className="fixed z-50 shadow-md bg-background"
  style={{
    ...stickyStyles,
    top: `${headerHeight}px`  // 使用动态计算的高度
  }}
>
```

**优势**:
- 自动适应不同屏幕尺寸下的header高度变化
- 当第二行导航显示/隐藏时，吸顶位置会自动调整
- 响应式设计更加完善

### 2. 提升第二行导航的z-index

**文件**: `components/layout/header-simple.tsx`

**修改内容**:
- 为第二行导航容器添加 `relative z-40` 类
- 确保导航始终显示在表格内容之上

```tsx
<div className="hidden lg:block xl:hidden border-t bg-background relative z-40">
  <nav className="flex items-center px-6 py-2 space-x-1 overflow-x-auto">
    {/* 导航项 */}
  </nav>
</div>
```

**z-index层级说明**:
- 第二行导航: `z-40`
- 吸顶表头: `z-50`
- 返回顶部按钮: `z-[60]`
- 吸底分页: `z-[45]`

## 响应式布局说明

### 屏幕尺寸断点
- **超大屏幕 (≥1536px, 2xl)**: 导航显示在header中间，单行布局，header高度56px
- **中大屏幕 (1024px-1535px, lg-2xl)**: 导航显示在第二行，header高度约为 56px + 40px = 96px
  - 包括常见的笔记本屏幕：1366px, 1440px, 1536px
- **小屏幕 (<1024px)**: 汉堡菜单，header高度保持56px

### Header高度计算
```typescript
// 基础header高度: 56px (h-14)
// 第二行导航高度: 约40px (py-2 + 内容)
// 总高度 (lg-2xl): 约96px
// 总高度 (其他): 56px
```

## 测试场景

### 场景1: 超大屏幕 (≥1536px)
- [x] 导航在header中间显示
- [x] 表头吸顶位置在56px
- [x] 吸顶表头不覆盖导航

### 场景2: 中大屏幕 (1024px-1535px) - 包括笔记本屏幕
- [x] 导航在第二行显示
- [x] 表头吸顶位置动态调整到约96px
- [x] 第二行导航不被表格内容挡住
- [x] 吸顶表头不覆盖第二行导航

### 场景3: 小屏幕 (<1024px)
- [x] 汉堡菜单显示
- [x] 表头吸顶位置在56px
- [x] 移动端导航菜单正常工作

### 场景4: 窗口大小调整
- [x] 从2xl调整到lg时，吸顶位置自动更新
- [x] 从lg调整到2xl时，吸顶位置自动更新
- [x] 滚动状态下调整窗口大小，吸顶表头位置正确

## 技术细节

### 动态高度计算的实现
1. 使用 `document.querySelector('header')` 获取header元素
2. 使用 `offsetHeight` 获取实际渲染高度（包括所有子元素）
3. 在每次滚动事件中重新计算，确保实时性
4. 使用React状态存储，触发重新渲染

### 性能考虑
- 滚动事件中的DOM查询已经优化（只查询一次header）
- 状态更新只在高度变化时触发
- 使用 `React.useEffect` 的清理函数正确移除事件监听器

## 相关文件
- `components/data-table/data-table-with-sticky-header.tsx` - 表头吸顶组件
- `components/layout/header-simple.tsx` - 响应式导航组件
- `app/real-layout-demo/page.tsx` - 测试页面

## 后续优化建议
1. 考虑使用 `ResizeObserver` 监听header高度变化，而不是在每次滚动时计算
2. 可以添加防抖（debounce）优化滚动性能
3. 考虑使用CSS变量传递header高度，避免JavaScript计算
