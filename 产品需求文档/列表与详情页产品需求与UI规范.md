# 列表与详情页产品需求与UI规范文档

**文档版本**: v1.0  
**创建日期**: 2024-12-31  
**产品**: OMS订单管理系统  
**参考原型**: `/real-layout-demo`  
**文档类型**: 产品需求文档（PRD）+ UI设计规范

---

## 文档说明

本文档结合产品经理视角的功能需求和UI设计师视角的界面规范，为每个功能模块提供：
1. **产品逻辑** - 功能目的、使用场景、业务规则
2. **交互设计** - 用户操作流程、交互反馈
3. **UI规范** - 具体的视觉样式、尺寸、颜色、间距

---

## 一、列表页整体需求

### 1.1 页面目标

**产品目标**：
- 让用户快速浏览和查找数据
- 支持多维度筛选和搜索
- 提供批量操作提升效率
- 确保信息清晰易读

**使用场景**：
- 用户需要查看所有订单/单据
- 用户需要按状态筛选数据
- 用户需要搜索特定订单
- 用户需要批量处理多个订单

### 1.2 页面布局结构

**布局顺序**（从上到下，间距24px）：
```
┌─────────────────────────────────────────────┐
│ 1. 页面标题栏 (高度: 自适应)                │
├─────────────────────────────────────────────┤ ↕ 24px
│ 2. 状态标签页 (高度: 40px)                  │
├─────────────────────────────────────────────┤ ↕ 24px
│ 3. 筛选工具栏 (高度: 40px)                  │
├─────────────────────────────────────────────┤ ↕ 24px
│ 4. 已选筛选条件 (高度: 自适应, 可选)        │
├─────────────────────────────────────────────┤ ↕ 24px
│ 5. 批量操作栏 (高度: 自适应, 可选)          │
├─────────────────────────────────────────────┤ ↕ 24px
│ 6. 数据表格 (高度: 自适应)                  │
└─────────────────────────────────────────────┘
```

**UI规范**：
- 区域间距：24px (`space-y-6`)
- 页面左右内边距：24px
- 所有区域使用卡片容器（除筛选条件外）

---

## 二、页面标题栏

### 2.1 产品需求

**功能目的**：
- 明确告知用户当前页面功能
- 提供页面级的主要操作入口

**业务规则**：
- 标题应简洁明了，不超过10个字
- 描述文字不超过30个字
- 主要操作不超过3个按钮


### 2.2 交互设计

**操作流程**：
1. 用户进入页面，看到标题和描述
2. 用户点击"新建"按钮 → 跳转到创建页面
3. 用户点击"导出"按钮 → 显示导出确认提示 → 开始导出

**交互反馈**：
- 按钮hover时显示浅紫色背景
- 点击按钮后显示Toast提示
- 导出等耗时操作显示进度提示

### 2.3 UI规范

**布局**：
```
┌────────────────────────────────────────────────────────┐
│ [标题]                              [次要按钮] [主按钮] │
│ [描述文字]                                              │
└────────────────────────────────────────────────────────┘
```

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 标题 | `text-3xl` (24px) `font-semibold` `tracking-tight` | 深色文字 |
| 描述 | `text-sm` (14px) `text-muted-foreground` `mt-2` | 灰色文字，上边距8px |
| 按钮容器 | `flex gap-2` | 按钮间距8px |
| 次要按钮 | `variant="outline"` `size="sm"` | 边框按钮 |
| 主按钮 | `size="sm"` | 紫色填充按钮 |
| 按钮图标 | `h-4 w-4` (16px) `mr-2` | 图标与文字间距8px |

**颜色规范**：
- 标题文字：`text-foreground` (深色模式自适应)
- 描述文字：`text-muted-foreground` (#71717A 浅色 / #A1A1AA 深色)
- 主按钮：`bg-primary` (#8B5CF6 紫色)
- 次要按钮：`border-input` 边框

**示例代码**：
```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-semibold tracking-tight">订单管理</h1>
    <p className="text-sm text-muted-foreground mt-2">
      管理和跟踪所有订单信息
    </p>
  </div>
  <div className="flex gap-2">
    <Button variant="outline" size="sm">
      <Download className="mr-2 h-4 w-4" />
      导出
    </Button>
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      新建订单
    </Button>
  </div>
</div>
```

---

## 三、状态标签页

### 3.1 产品需求

**功能目的**：
- 提供快速按状态筛选数据的能力
- 直观展示各状态的数据数量
- 减少用户筛选操作步骤

**业务规则**：
- 默认显示"全部"标签页
- 标签页数量建议不超过7个
- 每个标签页显示实时数据数量
- 切换标签页立即刷新数据

**使用场景**：
- 用户想查看所有待处理的订单
- 用户想查看已完成的订单数量
- 用户想在不同状态间快速切换

### 3.2 交互设计

**操作流程**：
1. 页面加载时默认显示"全部"标签页
2. 用户点击其他标签页 → 立即切换并加载对应数据
3. 数据加载完成后更新表格内容

**交互反馈**：
- 激活的标签页有明显的视觉区分（紫色背景）
- 标签页内的数字Badge在激活时变为白色透明背景
- 切换时显示加载状态（可选）

**状态说明**：
- 未激活：灰色背景，灰色文字
- Hover：浅紫色背景
- 激活：紫色背景，白色文字

### 3.3 UI规范

**布局**：
```
[全部 125] [待处理 23] [处理中 45] [已发货 32] [已完成 25]
```

**样式规范**：

| 元素 | 未激活状态 | 激活状态 | Hover状态 |
|------|-----------|---------|----------|
| Tab容器 | `bg-background` | `bg-primary` | `hover:bg-primary-hover/10` |
| Tab文字 | `text-muted-foreground` | `text-primary-foreground` | `hover:text-primary` |
| Badge背景 | `bg-secondary` (灰色) | `bg-transparent` | - |
| Badge文字 | `text-secondary-foreground` | `text-primary-foreground` | - |
| Badge边框 | 默认边框 | `border-0` | - |

**尺寸规范**：
- Tab高度：40px
- Tab内边距：`px-4 py-2` (左右16px，上下8px)
- Badge与文字间距：`ml-2` (8px)
- Badge字体：`text-xs` (12px)

**示例代码**：
```tsx
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="all">
      全部 
      <Badge 
        variant="secondary" 
        className={cn(
          "ml-2", 
          activeTab === "all" && "bg-transparent text-primary-foreground border-0"
        )}
      >
        125
      </Badge>
    </TabsTrigger>
    <TabsTrigger value="pending">
      待处理 
      <Badge 
        variant="secondary" 
        className={cn(
          "ml-2", 
          activeTab === "pending" && "bg-transparent text-primary-foreground border-0"
        )}
      >
        23
      </Badge>
    </TabsTrigger>
  </TabsList>
</Tabs>
```

---

## 四、筛选工具栏

### 4.1 产品需求

**功能目的**：
- 提供多种数据筛选方式
- 支持快速搜索和精确筛选
- 允许用户自定义显示列

**业务规则**：
- 搜索支持模糊匹配
- 筛选条件支持多选
- 列自定义立即生效
- 筛选结果实时更新

### 4.2 快速搜索

**产品逻辑**：
- 搜索类型：关键词模糊搜索
- 搜索范围：订单编号、客户名称、备注等文本字段
- 搜索触发：输入后实时搜索（防抖300ms）或按回车搜索
- 搜索结果：高亮显示匹配的关键词（可选）
- 多关键词：支持空格分隔多个关键词（AND逻辑）

**交互设计**：
1. 用户在搜索框输入关键词
2. 系统等待300ms（防抖）
3. 自动执行搜索并更新列表
4. 显示搜索结果数量

**UI规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 搜索框容器 | `relative w-64` | 宽度256px |
| 搜索图标 | `absolute left-3 top-1/2 -translate-y-1/2` | 左侧内边距12px |
| 搜索图标尺寸 | `h-4 w-4` (16px) | 灰色 |
| 输入框 | `pl-9 h-9` | 左内边距36px，高度36px |
| 占位文字 | `text-sm text-muted-foreground` | 14px灰色 |

**示例**：
```tsx
<div className="relative w-64">
  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input
    placeholder="搜索订单编号、客户名称（空格分隔多个关键词）..."
    value={searchValue}
    onChange={(e) => setSearchValue(e.target.value)}
    className="pl-9 h-9"
  />
</div>
```

### 4.2.1 批量搜索（订单号专用）

**产品逻辑**：
- 功能目的：支持用户批量搜索多个订单号（常见于对账、核查场景）
- 输入方式：Textarea，支持换行、逗号、空格、分号分隔
- 数量限制：最多100个订单号
- 自动处理：去重、去空、格式化
- 搜索逻辑：OR逻辑（匹配任一订单号）

**业务规则**：
- 批量搜索优先级高于快速搜索
- 批量搜索激活时，快速搜索自动清空
- 显示批量搜索的订单号列表
- 支持单独删除某个订单号
- 支持一键清除所有批量搜索

**使用场景**：
- 财务对账：从Excel复制多个订单号进行批量查询
- 异常核查：批量查询问题订单
- 数据导出：批量选择特定订单导出

**交互设计**：
1. 用户点击"批量搜索"按钮
2. 打开批量搜索对话框
3. 用户粘贴或输入多个订单号（支持换行、逗号等分隔）
4. 系统实时显示识别的订单号数量和预览
5. 用户点击"搜索"按钮
6. 列表显示匹配的订单
7. 页面顶部显示批量搜索信息卡片

**交互反馈**：
- 实时显示识别的订单号数量
- 超出限制时显示红色警告
- 搜索成功显示Toast提示
- 批量搜索信息卡片可折叠/展开

**UI规范**：

**批量搜索按钮**：
- 位置：筛选工具栏右侧，高级搜索按钮之前
- 样式：`variant="outline"` `size="sm"`
- 图标：`ListFilter` 图标 + "批量搜索"文字

**批量搜索对话框**：
- 宽度：`max-w-2xl` (672px)
- 标题：`text-lg font-semibold`
- 描述：说明支持的分隔符和数量限制

**输入区域**：
- Textarea高度：`min-h-[200px]`
- 字体：`font-mono text-sm` (等宽字体)
- 占位符：显示示例格式

**预览区域**：
- 最大高度：`max-h-[200px]` 超出滚动
- Badge样式：`variant="secondary"` `font-mono text-xs`
- 每个Badge带X按钮可删除
- 超过50个时显示"还有N个..."

**批量搜索信息卡片**：
- 背景：`border-primary/20 bg-primary/5`
- 内边距：`py-3`
- 显示：搜索的订单号数量
- 预览：显示前10个订单号Badge
- 操作：清除批量搜索按钮

**示例代码**：
```tsx
// 批量搜索按钮
<Button 
  variant="outline" 
  size="sm"
  onClick={() => setShowBatchSearch(true)}
>
  <ListFilter className="mr-2 h-4 w-4" />
  批量搜索
</Button>

// 批量搜索对话框
<BatchSearchDialog
  open={showBatchSearch}
  onOpenChange={setShowBatchSearch}
  onSearch={handleBatchSearch}
  fieldLabel="采购单号"
  placeholder="PO-2024-001\nPO-2024-002\nPO-2024-003"
  maxItems={100}
/>

// 批量搜索信息卡片
{batchSearchNumbers.length > 0 && (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            批量搜索: <span className="text-primary">{batchSearchNumbers.length}</span> 个订单号
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setBatchSearchNumbers([])}
          className="h-8 text-xs"
        >
          清除批量搜索
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {batchSearchNumbers.slice(0, 10).map((num, index) => (
          <Badge key={index} variant="secondary" className="text-xs font-mono">
            {num}
          </Badge>
        ))}
        {batchSearchNumbers.length > 10 && (
          <Badge variant="outline" className="text-xs">
            +{batchSearchNumbers.length - 10} 更多
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
)}
```

### 4.3 条件筛选

**产品逻辑**：
- 筛选类型：单选或多选
- 筛选字段：状态、客户、部门、优先级等枚举字段
- 筛选逻辑：多个条件之间为"且"关系
- 筛选结果：立即生效

**交互设计**：
1. 用户点击"筛选"按钮
2. 弹出筛选面板（Popover）
3. 用户勾选筛选条件
4. 点击"应用"或直接关闭面板
5. 筛选条件显示在工具栏下方

**UI规范**：

**筛选按钮**：
- 样式：`variant="outline"` `size="sm"`
- 图标：`Filter` 图标 + 文字
- 激活状态：有筛选条件时显示紫色边框

**筛选面板**：
- 宽度：300px
- 最大高度：400px（超出滚动）
- 内边距：16px
- 圆角：8px

**筛选项**：
- 标题：`text-sm font-medium mb-2`
- 选项：使用Checkbox组件
- 选项间距：`space-y-2` (8px)

**示例**：
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" size="sm">
      <Filter className="mr-2 h-4 w-4" />
      筛选
      {activeFilters.length > 0 && (
        <Badge className="ml-2">{activeFilters.length}</Badge>
      )}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-[300px]">
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">状态</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <Checkbox />
            <span className="text-sm">待处理</span>
          </label>
        </div>
      </div>
    </div>
  </PopoverContent>
</Popover>
```

### 4.4 高级搜索

**产品逻辑**：
- 搜索类型：多字段精确搜索
- 搜索字段：订单编号、客户名称、申请人等
- 搜索逻辑：多个字段之间为"且"关系
- 搜索结果：点击"搜索"按钮后生效

**交互设计**：
1. 用户点击"高级搜索"按钮
2. 打开高级搜索对话框
3. 用户填写搜索条件
4. 点击"搜索"按钮执行搜索
5. 点击"重置"清空所有条件

**UI规范**：

**对话框**：
- 宽度：600px
- 标题：`text-lg font-semibold`
- 内容区内边距：24px

**搜索字段**：
- 标签：`text-sm font-medium mb-2`
- 输入框：`h-9` 高度36px
- 字段间距：`space-y-4` (16px)

**按钮组**：
- 位置：对话框底部右侧
- 间距：`gap-2` (8px)
- 重置按钮：`variant="outline"`
- 搜索按钮：主按钮

### 4.5 列自定义

**产品逻辑**：
- 功能：显示/隐藏表格列
- 默认：显示所有defaultVisible=true的列
- 保存：保存到本地存储（可选）
- 重置：恢复默认显示列（可选）

**交互设计**：
1. 用户点击"自定义列"按钮
2. 打开列选择下拉菜单
3. 用户勾选/取消勾选列
4. 表格立即更新显示

**UI规范**：

**按钮**：
- 位置：工具栏最右侧
- 图标：`Settings2` 图标
- 样式：`variant="outline"` `size="sm"`

**下拉菜单**：
- 宽度：200px
- 最大高度：400px
- 对齐：右对齐

**列选项**：
- 使用Checkbox组件
- 选项间距：`py-2`
- 文字：`text-sm`

---

## 五、已选筛选条件

### 5.1 产品需求

**功能目的**：
- 让用户清楚当前生效的筛选条件
- 提供快速删除筛选条件的能力
- 支持一键清除所有筛选

**业务规则**：
- 仅在有筛选条件时显示
- 删除筛选条件立即刷新数据
- 清除全部后恢复到默认状态

### 5.2 交互设计

**操作流程**：
1. 用户应用筛选条件后，条件显示为标签
2. 用户点击标签上的X按钮 → 删除该筛选条件
3. 用户点击"清除全部"→ 删除所有筛选条件

**交互反馈**：
- 标签hover时显示浅紫色背景
- 删除后显示Toast提示（可选）
- 数据立即刷新

### 5.3 UI规范

**布局**：
```
已选筛选: [待处理 ×] [北京科技有限公司 ×] [清除全部]
```

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器 | `flex items-center gap-2 flex-wrap` | 自动换行 |
| 提示文字 | `text-sm text-muted-foreground` | 14px灰色 |
| 筛选标签 | `bg-primary/10 text-primary border border-primary/20` | 浅紫色背景 |
| 标签hover | `hover:bg-primary/20` | 深一点的紫色 |
| X按钮 | `h-3 w-3` (12px) | 小图标 |
| X按钮hover | `hover:bg-primary/30 rounded-full` | 圆形背景 |
| 清除按钮 | `variant="ghost"` `size="sm"` `h-6 text-xs` | 高度24px |

**示例代码**：
```tsx
{activeFilters.length > 0 && (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-sm text-muted-foreground">已选筛选:</span>
    {activeFilters.map((filter, index) => (
      <Badge 
        key={index} 
        className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
      >
        {filter.optionLabel}
        <button
          onClick={() => removeFilter(index)}
          className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    ))}
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setActiveFilters([])}
      className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10"
    >
      清除全部
    </Button>
  </div>
)}
```

---

## 六、批量操作栏

### 6.1 产品需求

**功能目的**：
- 提供批量处理数据的能力
- 提升用户操作效率
- 减少重复操作

**业务规则**：
- 仅在选中数据时显示
- 显示选中的数据数量
- 批量操作需要二次确认（危险操作）
- 操作完成后显示结果提示

**使用场景**：
- 用户需要批量导出多个订单
- 用户需要批量发送订单给客户
- 用户需要批量修改订单状态
- 用户需要批量删除订单

### 6.2 交互设计

**操作流程**：
1. 用户勾选一条或多条数据
2. 批量操作栏从顶部滑入显示
3. 用户点击批量操作按钮
4. 危险操作显示确认对话框
5. 确认后执行操作
6. 显示操作结果Toast

**交互反馈**：
- 操作栏显示动画（滑入）
- 按钮hover显示提示
- 操作中显示加载状态
- 操作完成显示Toast

**状态说明**：
- 未选中：不显示
- 选中1条：显示"已选择 1 项"
- 选中多条：显示"已选择 N 项"

### 6.3 UI规范

**布局**：
```
┌────────────────────────────────────────────────────────┐
│ 已选择 5 项 [取消选择]  |  [批量导出] [批量发送] [更多▼] │
└────────────────────────────────────────────────────────┘
```

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器Card | `border-primary/20 bg-primary/5` | 浅紫色背景，紫色边框 |
| 内容区 | `py-3` | 上下内边距12px |
| 左侧区域 | `flex items-center gap-4` | 间距16px |
| 右侧区域 | `flex items-center gap-2` | 间距8px |
| 选中文字 | `text-sm font-medium` | 14px加粗 |
| 数量文字 | `text-primary` | 紫色强调 |
| 取消按钮 | `variant="ghost"` `size="sm"` `h-8 text-xs` | 高度32px |
| 操作按钮 | `variant="outline"` `size="sm"` `gap-2` | 边框按钮 |
| 按钮图标 | `h-4 w-4` (16px) | 标准图标尺寸 |

**示例代码**：
```tsx
{selectedRows.length > 0 && (
  <Card className="border-primary/20 bg-primary/5">
    <CardContent className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            已选择 <span className="text-primary">{selectedRows.length}</span> 项
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setSelectedRows([])}
            className="h-8 text-xs"
          >
            取消选择
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            批量导出
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            批量发送
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                更多操作
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                批量编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                批量删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## 七、数据表格

### 7.1 产品需求

**功能目的**：
- 展示列表数据
- 支持数据排序（可选）
- 支持行选择
- 支持单行操作
- 支持分页浏览

**业务规则**：
- 默认按创建时间倒序排列
- 每页显示10/20/50/100条数据
- 支持跳转到任意页
- 选中行有视觉反馈

### 7.2 表格展示

**产品逻辑**：
- 列宽：根据内容自动调整或固定宽度
- 文字截断：超长文字显示省略号+Tooltip
- 空状态：无数据时显示友好提示
- 加载状态：数据加载时显示骨架屏或加载提示

**UI规范**：

**表格容器**：
- 包裹在Card中
- Card内边距：`pt-6` (24px)
- 表格边框：`border rounded-md`

**表头**：
- 背景：`bg-muted/50` (浅灰色)
- 文字：`text-sm font-medium` (14px加粗)
- 内边距：`p-3` (12px)
- 对齐：左对齐（文字）、右对齐（数字）、居中（操作）

**表格内容**：
- 文字：`text-xs` (12px)
- 内边距：`p-3` (12px)
- 行高：自适应
- 边框：`border-t` (顶部边框)

**行状态**：
- 默认：`bg-background`
- Hover：`hover:bg-primary-hover/10`
- 选中：`bg-primary-hover/10`

**特殊列**：
- 复选框列：宽度50px，固定在左侧
- 操作列：宽度80px，固定在右侧（可选）
- 第一列：固定在左侧（可选）

### 7.3 单号列

**产品逻辑**：
- 显示：紫色文字，可点击
- 点击：跳转到详情页
- 复制：hover时显示复制按钮
- 反馈：复制成功显示Toast

**UI规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 单号文字 | `font-medium text-primary` | 紫色加粗 |
| hover状态 | `hover:text-primary/80 hover:underline` | 浅紫色+下划线 |
| 复制按钮 | `opacity-0 group-hover:opacity-100` | hover时显示 |
| 按钮尺寸 | `h-6 w-6` (24px) | 小按钮 |
| 图标尺寸 | `h-3 w-3` (12px) | 小图标 |

**示例代码**：
```tsx
<OrderNumberCell 
  orderNumber={row.orderNo} 
  onClick={() => router.push(`/orders/${row.id}`)}
/>
```

### 7.4 状态列

**产品逻辑**：
- 显示：彩色Badge
- 颜色：根据状态类型自动匹配
- 支持：深色模式

**UI规范**：

**状态颜色映射**：

| 状态类型 | 浅色模式 | 深色模式 |
|---------|---------|---------|
| 成功/完成 | `bg-green-100 text-green-800` | `bg-green-900/20 text-green-400` |
| 警告/待处理 | `bg-yellow-100 text-yellow-800` | `bg-yellow-900/20 text-yellow-400` |
| 处理中 | `bg-blue-100 text-blue-800` | `bg-blue-900/20 text-blue-400` |
| 错误/失败 | `bg-red-100 text-red-800` | `bg-red-900/20 text-red-400` |
| 默认/灰色 | `bg-gray-100 text-gray-800` | `bg-gray-900/20 text-gray-400` |

**Badge样式**：
- 字体：`text-xs` (12px)
- 内边距：`px-2 py-1` (左右8px，上下4px)
- 圆角：`rounded-md`

### 7.5 分页

**产品逻辑**：
- 默认每页：10条
- 可选每页：10/20/50/100条
- 显示信息：当前页/总页数，当前范围/总数量
- 跳转：首页、上一页、下一页、末页

**交互设计**：
1. 用户选择每页数量 → 重置到第1页
2. 用户点击页码按钮 → 跳转到对应页
3. 首页/末页按钮在边界时禁用

**UI规范**：

**布局**：
```
[已选N项]              [每页: 10▼] [显示1-10/共100] [«] [‹] [1/10] [›] [»]
```

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器 | `flex items-center justify-between` | 两端对齐 |
| 左侧信息 | `text-sm text-muted-foreground` | 14px灰色 |
| 右侧区域 | `flex items-center gap-6` | 间距24px |
| 每页选择器 | `h-8 w-[70px]` | 高度32px，宽度70px |
| 页码信息 | `text-sm font-medium` | 14px加粗 |
| 按钮 | `variant="outline"` `size="sm"` | 边框按钮 |
| 禁用按钮 | `disabled` | 灰色不可点击 |

---

由于内容较长，我将继续添加详情页部分。让我继续：

## 八、详情页整体需求

### 8.1 页面目标

**产品目标**：
- 展示完整的单据信息
- 提供便捷的操作入口
- 记录历史操作轨迹
- 支持快速返回列表

**使用场景**：
- 用户查看订单详细信息
- 用户编辑订单内容
- 用户查看操作历史
- 用户执行单据操作（发送、审批等）

### 8.2 页面布局结构

**布局顺序**（从上到下，间距16px）：
```
┌─────────────────────────────────────────────┐
│ 1. 页面头部 (高度: 自适应)                  │
├─────────────────────────────────────────────┤ ↕ 16px
│ 2. 关键信息卡片网格 (4列)                   │
├─────────────────────────────────────────────┤ ↕ 16px
│ 3. 详细数据表格                             │
├─────────────────────────────────────────────┤ ↕ 16px
│ 4. 操作记录时间线                           │
└─────────────────────────────────────────────┘
```

**UI规范**：
- 区域间距：16px (`space-y-4`)
- 卡片内边距：24px (`p-6`)
- 卡片间距：24px (`gap-6`)

---

## 九、详情页头部

### 9.1 产品需求

**功能目的**：
- 提供返回列表的入口
- 展示单据关键信息
- 提供常用操作按钮

**业务规则**：
- 返回按钮返回到列表页
- 单号可复制
- 操作按钮根据状态动态显示
- 危险操作需要二次确认

### 9.2 交互设计

**操作流程**：
1. 用户点击返回按钮 → 返回列表页
2. 用户点击操作按钮 → 执行对应操作
3. 用户点击"更多操作" → 显示下拉菜单

**交互反馈**：
- 返回按钮hover显示背景色
- 操作按钮显示加载状态
- 操作完成显示Toast

### 9.3 UI规范

**布局**：
```
┌────────────────────────────────────────────────────────┐
│ [←] ORD-2024-1001 [已发货]                              │
│     供应商: ABC Inc. • 创建时间: 2024-12-25              │
│                                  [刷新] [编辑] [发送] [更多▼] │
└────────────────────────────────────────────────────────┘
```

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器 | `bg-white dark:bg-gray-950 border rounded-lg p-6` | 卡片容器 |
| 返回按钮 | `variant="ghost"` `size="icon"` | 图标按钮 |
| 单号 | `text-3xl font-bold` | 24px加粗 |
| 状态Badge | 根据状态类型 | 彩色Badge |
| 次要信息 | `text-sm text-muted-foreground mt-2` | 14px灰色 |
| 图标 | `h-4 w-4` (16px) | 标准尺寸 |
| 分隔符 | `•` | 圆点分隔 |
| 按钮容器 | `flex gap-2` | 间距8px |
| 操作按钮 | `variant="outline"` `size="sm"` | 边框按钮 |

**示例代码**：
```tsx
<div className="bg-white dark:bg-gray-950 border rounded-lg p-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{orderNo}</h1>
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Building className="h-4 w-4" />
          <span>供应商: {supplier}</span>
          <span>•</span>
          <Clock className="h-4 w-4" />
          <span>创建时间: {date}</span>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <RefreshCw className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm">
        <Edit className="h-4 w-4 mr-2" />
        编辑
      </Button>
      <Button variant="outline" size="sm">
        <Send className="h-4 w-4 mr-2" />
        发送
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">更多操作</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>复制订单</DropdownMenuItem>
          <DropdownMenuItem>导出PDF</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            删除订单
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</div>
```

---

## 十、关键信息卡片

### 10.1 产品需求

**功能目的**：
- 分类展示关键信息
- 提供快速信息浏览
- 支持信息复制（可选）

**业务规则**：
- 卡片数量：通常4个
- 卡片内容：标签-值对形式
- 响应式：移动端1列，平板2列，桌面4列

**常见卡片类型**：
1. 基本信息 - 单号、客户、金额、数量
2. 地址信息 - 收货人、电话、地址
3. 物流信息 - 物流公司、运单号、状态
4. 来源信息 - 订单来源、支付方式、创建人

### 10.2 交互设计

**操作流程**：
1. 页面加载时展示所有卡片
2. 用户可复制卡片中的信息（可选）
3. 响应式布局自动调整列数

**交互反馈**：
- 卡片hover显示阴影（可选）
- 复制成功显示Toast

### 10.3 UI规范

**网格布局**：
```
grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6
```

**卡片样式**：

| 元素 | 样式 | 说明 |
|------|------|------|
| Card容器 | `border rounded-lg` | 标准卡片 |
| 内容区 | `pt-6 space-y-3` | 顶部24px，间距12px |
| 卡片标题 | `text-sm font-medium mb-3` | 14px加粗，底部12px |
| 标题图标 | `h-4 w-4 text-primary` | 16px紫色 |
| 内容区域 | `space-y-2 text-xs` | 间距8px，12px文字 |
| 标签 | `text-muted-foreground` | 灰色 |
| 值 | `font-medium` | 加粗 |

**示例代码**：
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  <Card>
    <CardContent className="pt-6 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium mb-3">
        <FileText className="h-4 w-4 text-primary" />
        订单信息
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">订单编号:</span>
          <span className="font-medium">{orderNo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">客户名称:</span>
          <span className="font-medium">{customer}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">订单金额:</span>
          <span className="font-medium">¥{amount}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

---

## 十一、详细数据表格

### 11.1 产品需求

**功能目的**：
- 展示明细数据（如商品明细）
- 显示汇总信息
- 支持数据导出（可选）

**业务规则**：
- 表格固定表头
- 最后一行显示合计
- 合计行样式突出

### 11.2 UI规范

**表格样式**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器 | `border rounded-lg overflow-hidden` | 圆角边框 |
| 表格 | `w-full text-xs` | 12px文字 |
| 表头 | `bg-muted/50` | 浅灰色背景 |
| 表头单元格 | `text-left p-3 font-medium` | 左对齐，12px内边距 |
| 数据行 | `border-t` | 顶部边框 |
| 数据单元格 | `p-3` | 12px内边距 |
| 合计行 | `border-t bg-muted/30` | 浅灰色背景 |
| 合计金额 | `font-bold text-base` | 16px加粗 |

**示例代码**：
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center gap-2 text-sm font-medium mb-4">
      <Package className="h-4 w-4 text-primary" />
      商品明细
    </div>
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">商品名称</th>
            <th className="text-left p-3 font-medium">规格</th>
            <th className="text-center p-3 font-medium">数量</th>
            <th className="text-right p-3 font-medium">单价</th>
            <th className="text-right p-3 font-medium">小计</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-3">iPhone 15 Pro</td>
            <td className="p-3 text-muted-foreground">256GB</td>
            <td className="p-3 text-center">2</td>
            <td className="p-3 text-right">¥7,999.00</td>
            <td className="p-3 text-right font-medium">¥15,998.00</td>
          </tr>
          <tr className="border-t bg-muted/30">
            <td colSpan={4} className="p-3 text-right font-medium">合计:</td>
            <td className="p-3 text-right font-bold text-base">¥15,998.00</td>
          </tr>
        </tbody>
      </table>
    </div>
  </CardContent>
</Card>
```

---

## 十二、操作记录时间线

### 12.1 产品需求

**功能目的**：
- 展示历史操作记录
- 追溯操作轨迹
- 记录操作人和时间

**业务规则**：
- 按时间倒序排列（最新在上）
- 显示操作人、操作时间、操作内容
- 当前状态的操作点突出显示

### 12.2 UI规范

**时间线样式**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器 | `space-y-3` | 间距12px |
| 记录项 | `flex gap-3 pb-3 border-b` | 底部边框 |
| 时间点（激活） | `h-2 w-2 rounded-full bg-primary` | 8px紫色圆点 |
| 时间点（未激活） | `h-2 w-2 rounded-full bg-muted` | 8px灰色圆点 |
| 连接线 | `w-px bg-border mt-1` | 1px灰色线 |
| 操作标题 | `text-sm font-medium` | 14px加粗 |
| 操作时间 | `text-xs text-muted-foreground` | 12px灰色 |
| 操作详情 | `text-xs text-muted-foreground` | 12px灰色 |

**示例代码**：
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="flex items-center gap-2 text-sm font-medium mb-4">
      <Clock className="h-4 w-4 text-primary" />
      操作记录
    </div>
    <div className="space-y-3">
      <div className="flex gap-3 pb-3 border-b">
        <div className="flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div className="h-full w-px bg-border mt-1" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">订单已发货</span>
            <span className="text-xs text-muted-foreground">
              2024-12-26 10:30
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            操作人: 张三 | 物流公司: 顺丰速运 | 运单号: SF1234567890
          </p>
        </div>
      </div>
      <div className="flex gap-3 pb-3 border-b">
        <div className="flex flex-col items-center">
          <div className="h-2 w-2 rounded-full bg-muted" />
          <div className="h-full w-px bg-border mt-1" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">订单已确认</span>
            <span className="text-xs text-muted-foreground">
              2024-12-25 16:20
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            操作人: 李四 | 备注: 客户要求尽快发货
          </p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 十三、Toast通知规范

### 13.1 产品需求

**功能目的**：
- 提供即时操作反馈
- 告知操作结果
- 引导用户注意重要信息

**业务规则**：
- 自动消失时间：3-5秒
- 同时最多显示：3条
- 位置：右上角或顶部中间

### 13.2 通知类型

**成功通知**：
- 使用场景：操作成功、数据保存成功
- 图标：✓ 绿色对勾
- 颜色：绿色主题
- 示例：`toast.success("订单创建成功", { description: "订单 ORD-2024-1011 已成功创建" })`

**错误通知**：
- 使用场景：操作失败、权限不足、网络错误
- 图标：✗ 红色叉号
- 颜色：红色主题
- 示例：`toast.error("删除失败", { description: "该订单已发货，无法删除" })`

**警告通知**：
- 使用场景：重要提示、需要注意的操作
- 图标：⚠ 黄色警告
- 颜色：黄色主题
- 示例：`toast.warning("注意事项", { description: "该操作将影响所有关联订单" })`

**信息通知**：
- 使用场景：一般提示、系统通知
- 图标：ℹ 蓝色信息
- 颜色：蓝色主题
- 示例：`toast.info("系统提示", { description: "新版本已发布，建议更新" })`

### 13.3 UI规范

**样式规范**：

| 元素 | 样式 | 说明 |
|------|------|------|
| 容器宽度 | `min-w-[300px] max-w-[500px]` | 最小300px，最大500px |
| 内边距 | `p-4` | 16px |
| 圆角 | `rounded-lg` | 8px |
| 阴影 | `shadow-lg` | 大阴影 |
| 标题 | `text-sm font-semibold` | 14px加粗 |
| 描述 | `text-xs text-muted-foreground mt-1` | 12px灰色 |
| 图标 | `h-5 w-5` | 20px |

---

## 十四、响应式设计规范

### 14.1 断点定义

| 断点 | 屏幕宽度 | 设备类型 |
|------|---------|---------|
| 默认 | < 768px | 移动端 |
| md | ≥ 768px | 平板 |
| xl | ≥ 1280px | 桌面 |

### 14.2 布局适配

**信息卡片网格**：
- 移动端：1列 (`grid-cols-1`)
- 平板：2列 (`md:grid-cols-2`)
- 桌面：4列 (`xl:grid-cols-4`)

**表格**：
- 移动端：横向滚动，显示最少列
- 平板：显示主要列
- 桌面：显示所有列

**按钮**：
- 移动端：全宽按钮或图标按钮
- 桌面：固定宽度按钮

---

## 十五、颜色系统

### 15.1 主题色

| 颜色名称 | 浅色模式 | 深色模式 | 用途 |
|---------|---------|---------|------|
| Primary | #8B5CF6 | #8B5CF6 | 主色调（紫色） |
| Primary Hover | #9561D0 | #6C38AD | Hover状态 |
| Foreground | #09090B | #FAFAFA | 主要文字 |
| Muted Foreground | #71717A | #A1A1AA | 次要文字 |
| Border | #E4E4E7 | #27272A | 边框 |
| Background | #FFFFFF | #09090B | 背景 |
| Muted | #F4F4F5 | #18181B | 浅灰背景 |

### 15.2 状态色

| 状态 | 浅色模式 | 深色模式 |
|------|---------|---------|
| Success | #22C55E | #4ADE80 |
| Warning | #EAB308 | #FACC15 |
| Error | #EF4444 | #F87171 |
| Info | #3B82F6 | #60A5FA |

---

## 十六、间距系统（8px增量）

| 名称 | 值 | Tailwind类 | 用途 |
|------|---|-----------|------|
| xs | 4px | `gap-1` `p-1` | 极小间距 |
| sm | 8px | `gap-2` `p-2` | 小间距（图标与文字） |
| md | 12px | `gap-3` `p-3` | 中间距（卡片内元素） |
| lg | 16px | `gap-4` `p-4` | 标准间距（按钮组） |
| xl | 24px | `gap-6` `p-6` | 大间距（卡片网格、页面区域） |

---

## 十七、字体系统

### 17.1 字体大小

| 名称 | 大小 | Tailwind类 | 用途 |
|------|------|-----------|------|
| xs | 12px | `text-xs` | 表格内容、辅助文字 |
| sm | 14px | `text-sm` | 正文、描述、表头 |
| base | 16px | `text-base` | 默认文字 |
| lg | 18px | `text-lg` | 小标题 |
| xl | 20px | `text-xl` | 标题 |
| 2xl | 24px | `text-2xl` | 大标题 |
| 3xl | 24px | `text-3xl` | 页面主标题 |

### 17.2 字重

| 名称 | 值 | Tailwind类 | 用途 |
|------|---|-----------|------|
| Normal | 400 | `font-normal` | 正文 |
| Medium | 500 | `font-medium` | 强调文字 |
| Semibold | 600 | `font-semibold` | 标题 |
| Bold | 700 | `font-bold` | 重要标题 |

---

## 十八、验收标准

### 18.1 功能验收

- [ ] 列表页所有功能正常工作
- [ ] 搜索功能准确快速
- [ ] 筛选功能正确生效
- [ ] 批量操作执行成功
- [ ] 详情页信息完整展示
- [ ] 操作反馈及时准确
- [ ] 分页功能正常

### 18.2 UI验收

- [ ] 所有间距符合8px增量规范
- [ ] 字体大小符合规范
- [ ] 颜色使用符合设计系统
- [ ] Hover状态正确显示
- [ ] 激活状态正确显示
- [ ] 深色模式正常
- [ ] 响应式布局正常

### 18.3 体验验收

- [ ] 页面加载流畅
- [ ] 交互响应及时
- [ ] 错误提示友好
- [ ] 操作流程顺畅
- [ ] 视觉层次清晰

---

## 十九、附录

### 19.1 参考原型

- 完整原型：`http://localhost:3000/real-layout-demo`
- 列表视图：默认页面
- 详情视图：点击任意订单编号

### 19.2 相关文档

- UI设计规范：`/UI 规范/AI-Friendly UI Design Guide.md`
- 数据表格规范：`/UI 规范/DataTable Design.md`
- 用户下拉菜单规范：`/UI 规范/User Dropdown Design.md`

### 19.3 更新记录

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|----------|--------|
| v1.0 | 2024-12-31 | 初始版本，包含产品需求和UI规范 | - |

---

## 结语

本文档结合了产品经理的功能需求和UI设计师的视觉规范，为开发团队提供了完整的实现指南。

**使用建议**：
1. 产品经理：关注"产品需求"和"业务规则"部分
2. UI设计师：关注"UI规范"和"样式规范"部分
3. 开发工程师：参考"示例代码"和完整规范实现
4. 测试工程师：使用"验收标准"进行测试

**实施流程**：
1. 产品经理确认功能需求
2. UI设计师确认视觉规范
3. 开发工程师实现功能
4. 测试工程师验收测试
5. 产品经理最终验收
