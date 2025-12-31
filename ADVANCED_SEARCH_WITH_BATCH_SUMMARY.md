# 高级搜索批量输入功能实现总结

**实现日期**: 2024-12-31  
**功能**: 在高级搜索中支持批量输入，并将搜索条件回显到筛选条件中  
**适用场景**: 所有需要批量搜索订单号的列表页

---

## 功能概述

用户可以在高级搜索对话框中：
1. **批量输入订单号**（Textarea字段，支持换行/逗号/空格分隔）
2. **普通文本搜索**（Input字段）
3. **搜索条件自动回显**为蓝色Badge，可单独删除

---

## 核心改进

### 1. 高级搜索字段类型扩展

```typescript
export interface SearchField {
  id: string
  label: string
  placeholder?: string
  type?: "text" | "textarea" | "batch" // 新增字段类型
  maxItems?: number // 批量输入最大数量（默认100）
}
```

**字段类型说明**：
- `text`（默认）：普通Input输入框
- `textarea`：多行文本输入
- `batch`：批量输入，自动解析和预览

### 2. 搜索结果结构化

```typescript
export interface AdvancedSearchFilter {
  fieldId: string
  fieldLabel: string
  value: string | string[] // 支持字符串或数组
  displayValue: string // 用于显示的简化值
}
```

**回调函数签名变更**：
```typescript
// 之前
onAdvancedSearch?: (values: AdvancedSearchValues) => void

// 现在
onAdvancedSearch?: (values: AdvancedSearchValues, filters: AdvancedSearchFilter[]) => void
```

### 3. 筛选条件回显

高级搜索的条件会显示为**蓝色Badge**，与普通筛选条件（紫色）区分：

```tsx
{advancedSearchFilters.map((filter, index) => (
  <Badge 
    key={`advanced-${filter.fieldId}-${index}`} 
    className="gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
  >
    {filter.fieldLabel}: {filter.displayValue}
    <button onClick={() => handleRemoveAdvancedSearchFilter(filter)}>
      <X className="h-3 w-3" />
    </button>
  </Badge>
))}
```

---

## 使用方法

### 1. 定义高级搜索字段

```tsx
const advancedSearchFields: SearchField[] = [
  { 
    id: "orderNo", 
    label: "采购单号", 
    placeholder: "PO-2024-001\nPO-2024-002\nPO-2024-003",
    type: "batch", // 批量输入字段
    maxItems: 100
  },
  { 
    id: "supplier", 
    label: "供应商名称", 
    placeholder: "e.g., 供应商A",
    type: "text" // 普通文本字段（可省略，默认为text）
  },
]
```

### 2. 处理高级搜索回调

```tsx
const [advancedSearchValues, setAdvancedSearchValues] = useState<AdvancedSearchValues>({})
const [advancedSearchFilters, setAdvancedSearchFilters] = useState<AdvancedSearchFilter[]>([])

const handleAdvancedSearch = (values: AdvancedSearchValues, filters: AdvancedSearchFilter[]) => {
  setAdvancedSearchValues(values)
  setAdvancedSearchFilters(filters || [])
}

<FilterBar
  advancedSearchFields={advancedSearchFields}
  onAdvancedSearch={handleAdvancedSearch}
/>
```

### 3. 实现数据过滤逻辑

```tsx
useMemo(() => {
  let filtered = allData

  // 高级搜索
  if (Object.keys(advancedSearchValues).length > 0) {
    filtered = filtered.filter(item => {
      return Object.entries(advancedSearchValues).every(([key, value]) => {
        // 处理批量搜索（数组）
        if (Array.isArray(value)) {
          const itemValue = item[key as keyof typeof item]
          if (typeof itemValue === 'string') {
            return value.some(v => itemValue.toLowerCase().includes(v.toLowerCase()))
          }
          return false
        }
        // 处理普通搜索（字符串）
        const itemValue = item[key as keyof typeof item]
        if (typeof itemValue === 'string') {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }
        return false
      })
    })
  }

  setFilteredData(filtered)
}, [advancedSearchValues])
```

---

## 用户操作流程

### 批量搜索流程

1. 用户点击"高级搜索"按钮
2. 在对话框中找到"采购单号"字段（Textarea）
3. 粘贴或输入多个订单号：
   ```
   PO-2024-001
   PO-2024-002, PO-2024-003
   PO-2024-004 PO-2024-005
   ```
4. 系统实时显示：
   - "已识别 5 个采购单号"
   - 预览区域显示所有订单号Badge
5. 用户点击"搜索"按钮
6. 对话框关闭，列表显示匹配结果
7. 筛选条件区域显示蓝色Badge：
   ```
   采购单号: PO-2024-001, PO-2024-002, PO-2024-003 +2 [×]
   ```
8. 用户可以：
   - 点击Badge上的X删除该搜索条件
   - 点击"清除全部"删除所有筛选条件

### 混合搜索流程

用户可以同时使用：
- 快速搜索框（搜索关键词）
- 普通筛选（状态、客户等）
- 高级搜索（批量订单号 + 供应商名称）

所有条件都会显示为Badge，可单独删除。

---

## 视觉规范

### 筛选条件Badge颜色

| 类型 | 颜色 | 说明 |
|------|------|------|
| 快速搜索 | 紫色 `bg-primary/10 text-primary` | 搜索框输入的关键词 |
| 普通筛选 | 紫色 `bg-primary/10 text-primary` | 下拉筛选器选择的条件 |
| 高级搜索 | 蓝色 `bg-blue-100 text-blue-800` | 高级搜索对话框输入的条件 |

### 高级搜索按钮状态

```tsx
<Button variant="outline" size="sm">
  <SearchX className="mr-2 h-4 w-4" />
  高级搜索
  {advancedSearchFilters.length > 0 && (
    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
      {advancedSearchFilters.length}
    </Badge>
  )}
</Button>
```

有搜索条件时，按钮右侧显示数量Badge。

---

## 文件清单

### 修改文件

1. **`components/data-table/advanced-search-dialog.tsx`**
   - 添加字段类型支持（text/textarea/batch）
   - 实现批量输入解析和预览
   - 返回结构化的搜索条件

2. **`components/data-table/filter-bar.tsx`**
   - 添加高级搜索条件状态管理
   - 实现高级搜索条件回显（蓝色Badge）
   - 支持单独删除高级搜索条件
   - 清除全部时同时清除高级搜索

3. **`app/real-layout-demo/page.tsx`**
   - 更新高级搜索字段定义（添加batch类型）
   - 更新回调函数处理filters参数
   - 更新数据过滤逻辑支持数组值

4. **`app/batch-search-demo/page.tsx`**
   - 完全重构为使用高级搜索的批量输入
   - 移除独立的批量搜索对话框
   - 添加高级搜索信息卡片展示

---

## 技术细节

### 批量输入解析

```typescript
const parseBatchInput = (value: string, maxItems: number = 100): string[] => {
  const items = value
    .split(/[\n,，;；\s]+/) // 支持多种分隔符
    .map(item => item.trim())
    .filter(Boolean)
  
  const uniqueItems = Array.from(new Set(items)) // 去重
  return uniqueItems.slice(0, maxItems) // 限制数量
}
```

### 显示值简化

批量输入超过3个时，显示简化版本：
```typescript
displayValue: items.length > 3 
  ? `${items.slice(0, 3).join(", ")} +${items.length - 3}` 
  : items.join(", ")
```

例如：`PO-2024-001, PO-2024-002, PO-2024-003 +7`

### 实时预览

- 输入时实时解析并显示识别数量
- 少于20个时显示所有Badge预览
- 超过20个时只显示数量提示
- 超过限制时显示红色警告

---

## 演示页面

访问 `http://localhost:3000/batch-search-demo` 查看完整演示。

演示内容：
- 高级搜索按钮（带数量Badge）
- 批量输入字段（Textarea）
- 实时解析和预览
- 搜索条件回显（蓝色Badge）
- 单独删除和清除全部

---

## 与独立批量搜索的对比

| 特性 | 独立批量搜索 | 高级搜索批量输入 |
|------|-------------|-----------------|
| 入口 | 独立"批量搜索"按钮 | "高级搜索"按钮 |
| 功能 | 仅支持批量搜索订单号 | 支持多字段组合搜索 |
| 条件回显 | 独立信息卡片 | 统一的筛选条件Badge |
| 混合搜索 | 不支持 | 支持与其他条件组合 |
| 用户体验 | 功能单一 | 功能统一，更灵活 |

**推荐使用高级搜索批量输入**，功能更强大且界面更统一。

---

## 适用页面

可以在以下页面使用高级搜索批量输入：

- ✅ 采购申请单列表（PR）
- ✅ 采购订单列表（PO）
- ✅ 销售订单列表
- ✅ 发货单列表
- ✅ 收货单列表
- ✅ 退货单列表
- ✅ 物流单列表

---

## 后续优化建议

1. **保存搜索模板**：保存常用的高级搜索组合
2. **搜索历史**：记录最近的批量搜索
3. **导入文件**：支持上传Excel/CSV文件批量搜索
4. **智能识别**：自动识别订单号格式
5. **搜索结果导出**：批量搜索结果一键导出

---

## 验收标准

- [x] 高级搜索支持batch类型字段
- [x] Textarea正确显示和输入
- [x] 支持多种分隔符（换行、逗号、空格、分号）
- [x] 自动去重和去空格
- [x] 实时显示识别数量
- [x] 预览区域正确显示（少于20个时）
- [x] 超出限制时显示警告
- [x] 搜索条件回显为蓝色Badge
- [x] 可单独删除高级搜索条件
- [x] 清除全部同时清除高级搜索
- [x] 高级搜索按钮显示数量Badge
- [x] 数据过滤逻辑支持数组值
- [x] Toast提示正确显示
- [x] 深色模式正常

---

## 相关文档

- 产品需求文档：`产品需求文档/列表与详情页产品需求与UI规范.md`
- 高级搜索组件：`components/data-table/advanced-search-dialog.tsx`
- 筛选栏组件：`components/data-table/filter-bar.tsx`
- 演示页面：`app/batch-search-demo/page.tsx`
- 参考实现：`app/real-layout-demo/page.tsx`
