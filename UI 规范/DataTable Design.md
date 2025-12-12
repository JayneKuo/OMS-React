# 数据表格组件设计规范 (DataTable Design Specification)

## 概述 (Overview)

本文档定义了 OMS React 系统中数据表格组件的标准设计规范，基于国际最佳实践（Shopify、Amazon Seller Central、SAP、GitHub）。

---

## 一、核心功能 (Core Features)

### 1.1 表格结构

#### 固定列 (Sticky Columns)
- **Checkbox 列**：固定在最左侧 (`left: 0`, 宽度 50px)
- **第一数据列**：固定在 Checkbox 后 (`left: 50px`)
- **操作列 (Actions)**：固定在最右侧 (`right: 0`)
- **中间列**：可横向滚动

#### 列配置
```typescript
interface Column<T> {
  id: string                    // 唯一标识
  header: string                // 列标题
  accessorKey?: keyof T         // 数据字段
  cell?: (row: T) => ReactNode  // 自定义渲染
  width?: string                // 列宽度
  defaultVisible?: boolean      // 默认可见性
  sortable?: boolean            // 是否可排序
}
```

### 1.2 行选择 (Row Selection)

#### 功能特性
- **全选 Checkbox**：表头位置，支持全选/取消全选
- **单行 Checkbox**：每行左侧，独立选择
- **选中状态**：高亮显示选中的行
- **批量操作**：选中后显示批量操作按钮

#### 实现接口
```typescript
interface SelectionProps {
  selectedRows?: (string | number)[]
  onSelectionChange?: (selectedIds: (string | number)[]) => void
}
```

### 1.3 分页 (Pagination)

#### 布局结构
```
[选中提示]                    [每页数量] [显示范围] [分页按钮]
```

#### 组件元素
- **左侧**：选中行数提示（仅在有选中时显示）
- **右侧**：
  - 每页数量选择器：10 / 20 / 50 / 100
  - 显示范围：Showing X to Y of Z results
  - 分页按钮：首页 / 上一页 / 页码 / 下一页 / 末页

#### 实现接口
```typescript
interface PaginationProps {
  currentPage: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (size: number) => void
}
```

---

## 二、筛选系统 (Filter System)

### 2.1 状态标签页 (Status Tabs)

#### 设计原则
- **位置**：在搜索栏上方（国际标准）
- **显示数量**：每个标签显示对应状态的数量
- **交互**：点击切换，自动过滤数据

#### 标签配置
```typescript
interface TabConfig {
  value: string        // 状态值
  label: string        // 显示文本
  count: number        // 数量徽章
}

// 示例：PO 状态标签
const tabs = [
  { value: "all", label: "All", count: totalCount },
  { value: "DRAFT", label: "Draft", count: draftCount },
  { value: "SUBMITTED", label: "Submitted", count: submittedCount },
  // ...
]
```

### 2.2 搜索栏 (Search Bar)

#### 统一搜索
- **位置**：标签页下方
- **功能**：支持多字段模糊搜索
- **清除**：显示清除按钮（有内容时）

#### 高级搜索
- **触发**：点击 "Advanced" 按钮
- **形式**：弹出对话框
- **功能**：精确字段搜索
- **字段配置**：
```typescript
interface SearchField {
  id: string
  label: string
  placeholder: string
}
```

### 2.3 筛选器 (Filters)

#### 交互方式
- **使用 Popover**（不是 DropdownMenu）
- **保持打开**：多选时不自动关闭
- **清除按钮**：每个筛选器头部显示 "Clear" 按钮
- **搜索功能**：选项超过 5 个时自动显示搜索框

#### 筛选器搜索
- **触发条件**：当筛选器选项数量 > 5 时显示
- **搜索框位置**：筛选器头部下方，选项列表上方
- **实时过滤**：输入时动态过滤选项列表
- **清除按钮**：搜索框内显示清除图标
- **空状态**：无匹配结果时显示 "No results found"

#### 筛选器配置
```typescript
interface FilterConfig {
  id: string
  label: string
  type: "single" | "multiple"
  options: FilterOption[]
}

interface FilterOption {
  id: string
  label: string
  value: string
}
```

#### 实现示例
```typescript
// 筛选器内部搜索状态
const [filterSearch, setFilterSearch] = useState("")

// 过滤选项
const filteredOptions = filter.options.filter(option =>
  option.label.toLowerCase().includes(filterSearch.toLowerCase())
)

// 搜索框（仅在选项 > 5 时显示）
{filter.options.length > 5 && (
  <div className="p-2 border-b">
    <Input
      placeholder={`Search ${filter.label.toLowerCase()}...`}
      value={filterSearch}
      onChange={(e) => setFilterSearch(e.target.value)}
      className="h-8 pl-7 pr-7 text-sm"
    />
  </div>
)}
```

### 2.4 列可见性控制 (Column Visibility)

#### 功能特性
- **拖拽排序**：支持拖放重新排列列顺序
- **显示/隐藏**：Checkbox 控制列可见性
- **恢复默认**：一键恢复默认列设置
- **视觉反馈**：
  - 拖拽时显示半透明
  - 拖放目标显示边框
  - Checkbox 清晰显示选中状态

#### 实现要点
```typescript
interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  defaultVisible?: boolean
}

// 拖拽处理
const handleDragStart = (e: DragEvent, columnId: string) => { ... }
const handleDrop = (e: DragEvent, targetColumnId: string) => { ... }
```

---

## 三、操作列设计 (Actions Column)

### 3.1 状态驱动操作 (Status-Driven Actions)

#### 设计原则
- **根据状态显示不同操作**
- **前两个操作显示为图标按钮**
- **其余操作放入 "更多" 下拉菜单**

#### 状态操作映射示例（PO）
```typescript
const getAvailableActions = (status: string) => {
  switch (status) {
    case "DRAFT":
      return [
        { label: "Edit", icon: <Edit />, action: handleEdit },
        { label: "Submit", icon: <Send />, action: handleSubmit },
        { label: "Delete", icon: <Trash2 />, action: handleDelete, variant: "destructive" }
      ]
    case "SUBMITTED":
      return [
        { label: "View", icon: <Eye />, action: handleView },
        { label: "Confirm", icon: <CheckCircle />, action: handleConfirm },
        { label: "Cancel", icon: <XCircle />, action: handleCancel, variant: "destructive" }
      ]
    // ... 其他状态
  }
}
```

### 3.2 批量操作 (Bulk Actions)

#### 设计原则
- **按钮始终显示**：批量操作按钮始终可见
- **禁用状态**：未选中时按钮禁用（灰色）
- **智能操作**：根据选中行的状态显示可用操作

#### 状态检测
```typescript
// 获取选中行的状态
const selectedRowsData = useMemo(() => {
  return filteredData.filter(row => selectedRows.includes(row.id))
}, [filteredData, selectedRows])

const selectedStatuses = useMemo(() => {
  return [...new Set(selectedRowsData.map(row => row.status))]
}, [selectedRowsData])
```

#### 智能批量操作
```typescript
// 单一状态：显示该状态的特定操作
if (selectedStatuses.length === 1) {
  switch (status) {
    case "DRAFT":
      return [
        { label: "Batch Submit", icon: <Send />, action: handleBatchSubmit },
        { label: "Batch Delete", icon: <Trash2 />, action: handleBatchDelete, variant: "destructive" }
      ]
    // ... 其他状态
  }
}

// 混合状态：只显示通用操作
return [
  { label: "Batch Update", icon: <Edit />, action: handleBatchUpdate }
]
```

#### 头部按钮布局
```typescript
<div className="flex gap-2">
  {/* 导出按钮 - 始终可用 */}
  <Button variant="outline">
    <Download className="mr-2 h-4 w-4" />
    {selectedRows.length > 0 ? `Export (${selectedRows.length})` : "Export"}
  </Button>
  
  {/* 批量操作 - 始终显示，未选中时禁用 */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button disabled={selectedRows.length === 0}>
        <Package className="mr-2 h-4 w-4" />
        Batch Actions
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {/* 显示状态信息和可用操作 */}
    </DropdownMenuContent>
  </DropdownMenu>

  {/* 清除选择 - 仅在有选中时显示 */}
  {selectedRows.length > 0 && (
    <Button variant="outline" onClick={() => setSelectedRows([])}>
      <XCircle className="mr-2 h-4 w-4" />
      Clear
    </Button>
  )}

  {/* 新建按钮 - 始终可用 */}
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New PO
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>
        <FilePlus className="mr-2 h-4 w-4" />
        Create Manually
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Upload className="mr-2 h-4 w-4" />
        Import from File
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <FileDown className="mr-2 h-4 w-4" />
        Download Template
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>
```

#### 批量操作菜单内容
```typescript
// 未选中时
<div className="px-2 py-6 text-center text-sm text-muted-foreground">
  Select rows to see available actions
</div>

// 单一状态时
<>
  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
    Status: {statusLabel}
  </div>
  <DropdownMenuSeparator />
  {/* 状态特定操作 */}
</>

// 混合状态时
<>
  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
    Mixed Status ({selectedStatuses.length} types)
  </div>
  <DropdownMenuSeparator />
  {/* 通用操作 */}
</>
```

---

## 四、样式规范 (Style Guidelines)

### 4.1 颜色系统

#### 状态颜色
```typescript
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-800",
  SUBMITTED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-green-100 text-green-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  RECEIVED: "bg-teal-100 text-teal-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-red-100 text-red-800",
}
```

#### 固定列阴影
```css
/* 左侧固定列 */
shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]

/* 右侧固定列 */
shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]
```

### 4.2 间距规范

- **表格内边距**：`pt-6`
- **行高**：`py-2` (表头), `py-2.5` (数据行)
- **列间距**：`gap-2` (操作按钮)
- **筛选器间距**：`gap-2` (按钮), `gap-6` (分页组件)

### 4.3 响应式设计

- **最小宽度**：表格容器 `overflow-x-auto`
- **固定列宽度**：
  - Checkbox: 50px
  - 第一列: 150px+
  - 操作列: 120-150px

---

## 五、使用示例 (Usage Example)

### 5.1 完整实现示例

```typescript
export default function ListPage() {
  // 状态管理
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [activeTab, setActiveTab] = useState("all")
  const [searchValue, setSearchValue] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

  // 状态计数
  const statusCounts = useMemo(() => ({
    all: data.length,
    DRAFT: data.filter(d => d.status === "DRAFT").length,
    // ...
  }), [data])

  // 列定义
  const columns: Column<DataType>[] = [
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      width: "150px",
      defaultVisible: true,
    },
    // ... 其他列
    {
      id: "actions",
      header: "Actions",
      width: "150px",
      defaultVisible: true,
      cell: (row) => <ActionsCell row={row} />,
    },
  ]

  return (
    <div className="space-y-6">
      {/* 标题和批量操作 */}
      <Header selectedRows={selectedRows} />

      {/* 状态标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {Object.entries(statusCounts).map(([key, count]) => (
            <TabsTrigger key={key} value={key}>
              {key} <Badge>{count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 搜索和筛选 */}
      <FilterBar
        searchPlaceholder="Search..."
        onSearchChange={setSearchValue}
        filters={filterConfigs}
        onFiltersChange={setActiveFilters}
        columns={columnConfigs}
        onColumnsChange={handleColumnsChange}
        advancedSearchFields={advancedSearchFields}
        onAdvancedSearch={setAdvancedSearchValues}
      />

      {/* 数据表格 */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            data={filteredData}
            columns={visibleColumns}
            currentPage={currentPage}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onSelectionChange={setSelectedRows}
            selectedRows={selectedRows}
            onRowClick={handleRowClick}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 六、AI 提示词模板 (AI Prompt Template)

### 6.1 创建新列表页面

```
请基于 OMS React 数据表格设计规范创建一个 [模块名称] 列表页面：

**数据结构**：
- 字段：[列出所有字段及类型]
- 状态：[列出所有状态值]

**功能要求**：
1. 状态标签页：[列出所有状态标签]
2. 搜索字段：[列出可搜索的字段]
3. 筛选器：[列出筛选维度]
4. 默认显示列：[列出默认可见的列]
5. 状态操作：[列出每个状态的可用操作]

**参考实现**：
- 文件位置：OMS React/app/purchase/po/page.tsx
- 组件：DataTable, FilterBar, Tabs
- 规范文档：UI 规范/DataTable Design.md

**设计要求**：
- 遵循国际最佳实践（Shopify/Amazon/SAP）
- Tab 在上，搜索在下
- 支持行选择和批量操作
- 固定第一列和操作列
- 根据状态显示不同操作
```

### 6.2 添加新功能

```
请为 [模块名称] 列表页面添加 [功能名称]：

**当前实现**：
- 文件：[文件路径]
- 相关组件：[组件列表]

**新功能需求**：
[详细描述功能需求]

**参考规范**：
- UI 规范/DataTable Design.md
- 第 [X] 节：[相关章节]

**实现要点**：
[列出关键实现要点]
```

---

## 七、最佳实践 (Best Practices)

### 7.1 性能优化

1. **使用 useMemo 缓存计算**：状态计数、过滤数据
2. **虚拟滚动**：大数据量时考虑虚拟化
3. **防抖搜索**：搜索输入使用 debounce
4. **分页加载**：避免一次加载所有数据

### 7.2 用户体验

1. **加载状态**：显示 Loading 指示器
2. **空状态**：友好的空数据提示
3. **错误处理**：清晰的错误信息
4. **操作反馈**：成功/失败提示

### 7.3 可访问性

1. **键盘导航**：支持 Tab 键导航
2. **ARIA 标签**：为 Checkbox 添加 aria-label
3. **焦点管理**：合理的焦点顺序
4. **屏幕阅读器**：语义化 HTML

---

## 八、组件依赖 (Component Dependencies)

### 8.1 核心组件

```typescript
// 数据表格
import { DataTable, Column } from "@/components/data-table/data-table"

// 筛选栏
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"

// 高级搜索
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"

// UI 组件
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
```

### 8.2 图标库

```typescript
import { 
  Eye, Edit, Trash2, Download, Send, XCircle, 
  CheckCircle, PlayCircle, MoreHorizontal, Plus 
} from "lucide-react"
```

---

## 九、版本历史 (Version History)

- **v1.1.0** (2024-12-08)
  - ✨ 新增筛选器搜索功能（选项 > 5 时自动显示）
  - ✨ 新增智能批量操作（根据选中状态动态显示）
  - ✨ 新增新建按钮下拉菜单（手动创建/导入/下载模板）
  - 🔧 优化批量操作按钮交互（始终显示，未选中时禁用）
  - 📝 完善文档和代码示例

- **v1.0.0** (2024-12-08)
  - 初始版本
  - 定义核心功能和设计规范
  - 基于 PO 列表页面实现

---

## 十、参考资源 (References)

### 国际标准参考
- **Shopify Admin**: 订单列表设计
- **Amazon Seller Central**: 订单管理界面
- **SAP**: 企业级表格设计
- **GitHub Issues**: 状态标签页设计
- **Gmail**: 分类标签设计

### 技术文档
- [shadcn/ui DataTable](https://ui.shadcn.com/docs/components/data-table)
- [Radix UI Table](https://www.radix-ui.com/primitives/docs/components/table)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**文档维护者**: OMS React Team  
**最后更新**: 2024-12-08  
**状态**: ✅ 已发布
