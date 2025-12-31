# 表头吸顶和100条测试数据实现总结

## 实现内容

### 1. 生成100条测试数据

**位置**: `OMS React/app/real-layout-demo/page.tsx`

**实现方式**:
- 创建 `generateMockOrders()` 函数动态生成100条订单数据
- 随机生成订单号、客户、供应商、状态、金额、日期等字段
- 数据包含4种状态：pending、processing、shipped、completed
- 20个不同的客户名称
- 15个不同的供应商
- 10个不同的地址

**数据特点**:
```typescript
- 订单编号: ORD-2024-1001 到 ORD-2024-1100
- 金额范围: ¥1,000 - ¥51,000
- 商品数量: 1-20件
- 日期范围: 最近90天内
- 状态分布: 随机分配
```

### 2. 页面滚动时表头吸顶功能

**位置**: `OMS React/components/data-table/data-table-with-sticky-header.tsx`

**实现方式**: 创建新的DataTable组件，支持页面滚动时表头固定

#### 核心实现
```tsx
<TableHeader 
  className="bg-muted/50"
  style={{
    position: 'sticky',
    top: `${stickyTop}px`,  // 距离页面顶部的距离
    zIndex: 10,
  }}
>
```

#### 关键特性
- **页面级吸顶**: 当整个页面滚动时，表头固定在指定位置
- **可配置距离**: `stickyTop` 参数可设置表头距离页面顶部的距离（默认64px，即header高度）
- **左右列锁定**: 第一列和最后一列依然保持水平滚动时的锁定效果
- **复合固定**: 表头吸顶 + 左右列锁定 = 四个角的单元格同时固定

#### Z-Index层级
```
z-20: 表头锁定列（最上层）
z-10: 表头
z-10: 内容锁定列
z-0:  普通内容
```

### 3. 分页设置

**默认每页显示**: 50条
```typescript
const [pageSize, setPageSize] = useState(50)
```

**可选项**: 10、20、50、100条/页

## 功能特性

### ✅ 页面滚动时表头吸顶
- 整个页面滚动时，表头固定在页面顶部（header下方）
- 表头使用 `bg-muted/50` 半透明背景
- 不影响页面其他内容的滚动

### ✅ 左右列锁定
- 第一列（订单编号）锁定在左侧
- 最后一列（操作）锁定在右侧
- 水平滚动时锁定列始终可见

### ✅ 复合吸顶效果
- 表头吸顶 + 左右列锁定 = 四个角的单元格同时固定
- 页面滚动时，表头固定
- 水平滚动时，左右列固定
- 同时滚动时，四个角的单元格保持可见

### ✅ 大数据量测试
- 100条数据分2页显示（每页50条）
- 页面滚动流畅
- 分页切换流畅

## 视觉效果

```
页面滚动前：
┌─────────────────────────────────────────────┐
│ Header (64px)                                │
├─────────────────────────────────────────────┤
│ 标题、Tab、筛选区                            │
├─────────────────────────────────────────────┤
│ [表头]                                       │ ← 普通位置
│ 订单1 | 客户 | 状态 | 金额 | ... | 操作     │
│ 订单2 | 客户 | 状态 | 金额 | ... | 操作     │
│   ...                                        │
└─────────────────────────────────────────────┘

页面滚动后：
┌─────────────────────────────────────────────┐
│ Header (64px)                                │
├─────────────────────────────────────────────┤
│ [表头 - 固定在这里]                          │ ← sticky top-64px
│ 订单10| 客户 | 状态 | 金额 | ... | 操作     │
│ 订单11| 客户 | 状态 | 金额 | ... | 操作     │
│   ↓ 继续滚动                                 │
│ 订单50| 客户 | 状态 | 金额 | ... | 操作     │
└─────────────────────────────────────────────┘
  ↑                                         ↑
  左列锁定                                右列锁定
```

## 技术实现

### CSS关键属性
```css
/* 表头 - 页面滚动吸顶 */
position: sticky
top: 64px  /* header高度 */
z-index: 10
background: hsl(var(--muted) / 0.5)

/* 表头锁定列 - 水平滚动固定 */
position: sticky
left: 0 / right: 0
z-index: 20
background: hsl(var(--muted) / 0.5)
box-shadow: 2px 0 4px -2px rgba(0,0,0,0.1)
```

### 与普通DataTable的区别

| 特性 | 普通DataTable | DataTableWithStickyHeader |
|------|--------------|---------------------------|
| 滚动方式 | 表格内部滚动 | 页面滚动 |
| 表头固定 | 在表格容器内 | 在页面视口内 |
| 使用场景 | 固定高度的表格 | 需要查看大量数据 |
| 表格容器 | 有最大高度限制 | 无高度限制 |

## 使用方法

```tsx
import { DataTableWithStickyHeader } from "@/components/data-table/data-table-with-sticky-header"

<DataTableWithStickyHeader
  data={data}
  columns={columns}
  currentPage={currentPage}
  totalItems={totalItems}
  pageSize={pageSize}
  onPageChange={setCurrentPage}
  onPageSizeChange={setPageSize}
  onSelectionChange={setSelectedRows}
  selectedRows={selectedRows}
  onRowClick={handleRowClick}
  stickyTop={64}  // 可选，默认64px
/>
```

## 测试建议

1. **页面滚动测试**
   - 向下滚动页面，查看表头是否固定在header下方
   - 继续滚动，表头应该始终可见
   - 滚动回顶部，表头回到原位

2. **水平滚动测试**
   - 水平滚动查看左右列是否固定
   - 第一列（订单编号）应该始终可见
   - 最后一列（操作）应该始终可见

3. **复合滚动测试**
   - 同时进行页面滚动和水平滚动
   - 检查四个角的单元格是否正确显示
   - 表头锁定列应该在最上层

4. **数据测试**
   - 切换页面查看不同数据
   - 使用筛选功能测试数据过滤
   - 使用搜索功能测试数据查找

5. **主题测试**
   - 切换深色/浅色模式
   - 检查表头背景色是否正确（半透明效果）
   - 检查阴影效果是否明显

## 注意事项

1. **stickyTop值**: 需要根据实际的header高度调整，确保表头不会被header遮挡

2. **背景色**: 表头使用 `bg-muted/50` 半透明背景，确保在深色模式下也能正确显示

3. **性能**: 100条数据在现代浏览器中性能良好，如需更多数据建议使用虚拟滚动

4. **兼容性**: sticky定位在所有现代浏览器中都支持良好

5. **移除Card包裹**: 使用吸顶表头时，不要用Card包裹DataTable，否则会影响sticky效果

## 相关文件

- `OMS React/app/real-layout-demo/page.tsx` - 测试页面和数据生成
- `OMS React/components/data-table/data-table-with-sticky-header.tsx` - 支持页面滚动吸顶的表格组件
- `OMS React/components/data-table/data-table.tsx` - 原始表格组件（表格内部滚动）
