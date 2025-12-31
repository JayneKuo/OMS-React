# 批量搜索功能实现总结

**实现日期**: 2024-12-31  
**功能**: 支持批量搜索订单号  
**适用场景**: 采购单、销售单、物流单等所有需要批量查询单号的列表页

---

## 功能概述

用户可以通过批量搜索功能，一次性输入多个订单号（最多100个），系统自动识别并筛选出匹配的订单。

### 核心特性

1. **多种分隔符支持**：换行、逗号、空格、分号
2. **自动处理**：去重、去空格、格式化
3. **实时预览**：显示识别的订单号数量和列表
4. **数量限制**：最多100个订单号
5. **友好提示**：超出限制时显示警告

---

## 文件清单

### 新增文件

1. **`components/data-table/batch-search-dialog.tsx`**
   - 批量搜索对话框组件
   - 支持Textarea输入
   - 实时解析和预览
   - 可单独删除某个订单号

2. **`app/batch-search-demo/page.tsx`**
   - 批量搜索功能演示页面
   - 完整的使用示例
   - 访问地址：`http://localhost:3000/batch-search-demo`

### 修改文件

1. **`components/data-table/filter-bar.tsx`**
   - 添加批量搜索按钮
   - 新增Props：
     - `enableBatchSearch?: boolean` - 是否启用批量搜索
     - `batchSearchField?: string` - 批量搜索字段名称（默认"订单编号"）
     - `onBatchSearch?: (orderNumbers: string[]) => void` - 批量搜索回调

2. **`产品需求文档/列表与详情页产品需求与UI规范.md`**
   - 添加批量搜索章节（4.2.1）
   - 包含产品逻辑、交互设计、UI规范

---

## 使用方法

### 1. 在列表页启用批量搜索

```tsx
import { FilterBar } from "@/components/data-table/filter-bar"

export default function PurchaseOrderList() {
  const [batchSearchNumbers, setBatchSearchNumbers] = useState<string[]>([])
  
  const handleBatchSearch = (orderNumbers: string[]) => {
    setBatchSearchNumbers(orderNumbers)
    // 执行批量搜索逻辑
    toast.success("批量搜索成功", { 
      description: `找到 ${matchedCount} 条匹配记录` 
    })
  }

  return (
    <FilterBar
      searchPlaceholder="搜索采购单号、供应商..."
      onSearchChange={setSearchValue}
      enableBatchSearch={true}
      batchSearchField="采购单号"
      onBatchSearch={handleBatchSearch}
    />
  )
}
```

### 2. 实现批量搜索过滤逻辑

```tsx
// 批量搜索优先级高于普通搜索
useMemo(() => {
  let filtered = allData

  // 批量搜索
  if (batchSearchNumbers.length > 0) {
    filtered = filtered.filter(item => 
      batchSearchNumbers.some(num => 
        item.orderNo.toLowerCase().includes(num.toLowerCase())
      )
    )
  } 
  // 普通搜索
  else if (searchValue) {
    const searchLower = searchValue.toLowerCase()
    filtered = filtered.filter(item => 
      item.orderNo.toLowerCase().includes(searchLower) ||
      item.supplier.toLowerCase().includes(searchLower)
    )
  }

  setFilteredData(filtered)
}, [searchValue, batchSearchNumbers])
```

### 3. 显示批量搜索信息卡片

```tsx
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

---

## 用户操作流程

1. 用户点击"批量搜索"按钮
2. 打开批量搜索对话框
3. 用户粘贴或输入多个订单号（支持从Excel复制）
   ```
   PO-2024-001
   PO-2024-002, PO-2024-003
   PO-2024-004 PO-2024-005
   ```
4. 系统实时显示识别结果：
   - 已识别 5 个订单号
   - 预览区域显示所有订单号Badge
5. 用户点击"搜索"按钮
6. 对话框关闭，列表显示匹配结果
7. 页面顶部显示批量搜索信息卡片
8. 用户可以：
   - 查看搜索的订单号列表
   - 点击"清除批量搜索"恢复正常列表

---

## 技术细节

### 订单号解析逻辑

```tsx
const parseInput = (value: string) => {
  // 支持换行、逗号、空格、分号分隔
  const items = value
    .split(/[\n,，;；\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
  
  // 去重
  const uniqueItems = Array.from(new Set(items))
  
  return uniqueItems
}
```

### 数量限制验证

```tsx
if (items.length > maxItems) {
  alert(`最多支持 ${maxItems} 个订单号，当前输入了 ${items.length} 个`)
  return
}
```

### 搜索优先级

```
批量搜索 > 普通搜索 > 筛选条件
```

---

## 适用页面

可以在以下页面启用批量搜索功能：

- ✅ 采购申请单列表（PR）
- ✅ 采购订单列表（PO）
- ✅ 销售订单列表
- ✅ 发货单列表
- ✅ 收货单列表
- ✅ 退货单列表
- ✅ 物流单列表

---

## 演示页面

访问 `http://localhost:3000/batch-search-demo` 查看完整演示。

演示内容：
- 批量搜索按钮位置
- 批量搜索对话框交互
- 实时预览功能
- 搜索结果展示
- 批量搜索信息卡片

---

## 后续优化建议

1. **保存搜索历史**：记录用户最近的批量搜索
2. **导入文件**：支持上传Excel/CSV文件批量搜索
3. **搜索结果导出**：批量搜索结果一键导出
4. **搜索模板**：保存常用的批量搜索组合
5. **智能识别**：自动识别订单号格式，过滤无效输入

---

## 验收标准

- [x] 批量搜索按钮正确显示
- [x] 对话框打开/关闭正常
- [x] 支持多种分隔符（换行、逗号、空格、分号）
- [x] 自动去重和去空格
- [x] 实时显示识别数量
- [x] 预览区域正确显示
- [x] 超出限制时显示警告
- [x] 搜索功能正常工作
- [x] 批量搜索信息卡片正确显示
- [x] 清除批量搜索功能正常
- [x] Toast提示正确显示
- [x] 深色模式正常

---

## 相关文档

- 产品需求文档：`产品需求文档/列表与详情页产品需求与UI规范.md`
- 组件文档：`components/data-table/batch-search-dialog.tsx`
- 演示页面：`app/batch-search-demo/page.tsx`
