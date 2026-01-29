# 批量上架功能实现文档

## 概述
实现了商品批量上架功能，允许用户选择多个商品的 SKU 并将其上架到不同的销售渠道。

## 功能特性

### 1. 批量选择
- 支持全选/取消全选所有 SKU
- 支持按 SPU 选择/取消选择所有关联的 SKU
- 支持单个 SKU 的选择/取消选择
- 实时显示已选择的 SKU 数量

### 2. 渠道选择
- **快速选择栏**：提供快捷按钮批量为选中的 SKU 添加渠道
- **单独配置**：每个 SKU 可以独立选择要上架的渠道
- **多渠道支持**：
  - Amazon US 🛒
  - Shopify Store 🛍️
  - eBay 📦
  - Walmart 🏪

### 3. 可视化反馈
- 选中的 SKU 高亮显示（白色背景）
- 未选中的 SKU 半透明显示
- 已配置渠道的 SKU 显示绿色勾选图标和渠道数量
- 渠道按钮选中状态用紫色高亮

### 4. 数据验证
- 至少选择一个 SKU
- 至少为一个 SKU 配置一个渠道
- 提交前验证并提示用户

## 组件结构

### BatchPublishDialog 组件
**位置**: `components/product/batch-publish-dialog.tsx`

**Props**:
```typescript
interface BatchPublishDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedProducts: any[]  // 选中的商品列表
}
```

**状态管理**:
- `skuChannels`: Record<string, string[]> - 每个 SKU 选择的渠道
- `selectedSkuIds`: Set<string> - 选中的 SKU ID 集合

**主要功能**:
- `toggleSku(id)`: 切换单个 SKU 的选中状态
- `toggleSpu(product)`: 切换整个 SPU 的选中状态
- `toggleAll()`: 全选/取消全选
- `toggleChannel(skuId, channelId)`: 切换 SKU 的渠道选择
- `batchSelectChannel(channelId)`: 批量为选中的 SKU 添加渠道
- `handleSubmit()`: 提交上架请求

## UI 设计

### 布局结构
```
┌─────────────────────────────────────────────────┐
│ Header: 批量上架商品 + 商品数量徽章              │
├─────────────────────────────────────────────────┤
│ 快速选择渠道栏                                   │
│ [Amazon] [Shopify] [eBay] [Walmart]            │
├─────────────────────────────────────────────────┤
│ 信息提示栏 + 已选 SKU 数量                       │
├─────────────────────────────────────────────────┤
│ SKU 列表表格                                     │
│ ┌─┬────────┬────────┬──────────────┬────────┐  │
│ │☑│商品信息│当前状态│上架渠道      │状态    │  │
│ ├─┼────────┼────────┼──────────────┼────────┤  │
│ │☑│SPU信息 │        │              │        │  │
│ │☑│ SKU 1  │已上架  │[渠道按钮组]  │✓ 2渠道│  │
│ │☑│ SKU 2  │未上架  │[渠道按钮组]  │未选择  │  │
│ └─┴────────┴────────┴──────────────┴────────┘  │
├─────────────────────────────────────────────────┤
│ Footer: 统计信息 + [取消] [确认上架]            │
└─────────────────────────────────────────────────┘
```

### 设计规范遵循
- **颜色**: 使用 CSS 变量 (--primary, --destructive 等)
- **字体**: text-xs, text-sm, text-xl，font-bold, font-medium
- **间距**: 8px 系统 (gap-2, gap-3, py-2.5, h-8, h-9)
- **按钮**: h-9, h-11 符合触摸目标最小尺寸
- **状态**: 使用 Badge 组件显示状态
- **交互**: hover 效果，transition-all 平滑过渡

## 集成方式

### 在产品列表页面中使用

1. **导入组件**:
```typescript
import { BatchPublishDialog } from "@/components/product/batch-publish-dialog"
```

2. **添加状态**:
```typescript
const [isBatchPublishOpen, setIsBatchPublishOpen] = React.useState(false)
```

3. **添加触发按钮**:
```typescript
<Button 
  variant="outline" 
  size="sm" 
  onClick={() => setIsBatchPublishOpen(true)}
>
  批量上架
</Button>
```

4. **添加对话框组件**:
```typescript
<BatchPublishDialog
  open={isBatchPublishOpen}
  onOpenChange={setIsBatchPublishOpen}
  selectedProducts={mockProducts.filter(p => selectedIds.includes(p.id))}
/>
```

## 用户操作流程

1. **选择商品**: 在商品列表中勾选要上架的商品
2. **打开对话框**: 点击"批量上架"按钮
3. **选择 SKU**: 
   - 默认全选所有 SKU
   - 可以取消不需要上架的 SKU
4. **配置渠道**:
   - 方式1: 使用顶部快速选择按钮批量添加渠道
   - 方式2: 为每个 SKU 单独选择渠道
5. **确认上架**: 点击"确认上架"按钮提交

## 数据流

### 输入数据
```typescript
selectedProducts: [
  {
    id: "201205513177568272",
    spuCode: "SPU-88921-X",
    title: "Premium Leather Bag",
    image: "...",
    skus: [
      {
        id: "S001-1",
        skuCode: "SKU-9921-A1",
        color: "Black",
        size: "Standard",
        status: "Active",
        ...
      }
    ]
  }
]
```

### 输出数据
```typescript
{
  skuId: "S001-1",
  channels: ["amazon", "shopify"]
}
```

## 后续优化建议

1. **渠道配置持久化**: 保存用户的渠道选择偏好
2. **批量操作历史**: 记录批量上架操作历史
3. **上架进度显示**: 显示上架进度条和成功/失败状态
4. **渠道库存同步**: 上架时同步库存信息到各渠道
5. **价格配置**: 允许为不同渠道设置不同价格
6. **定时上架**: 支持设置定时上架时间

## 文件清单

- `components/product/batch-publish-dialog.tsx` - 批量上架对话框组件
- `app/product/page.tsx` - 产品列表页面（已集成）
- `docs/BATCH_PUBLISH_FEATURE.md` - 本文档

## 测试建议

1. 测试全选/取消全选功能
2. 测试 SPU 级别的选择
3. 测试单个 SKU 的选择
4. 测试快速选择渠道功能
5. 测试单独配置渠道功能
6. 测试提交验证逻辑
7. 测试空状态处理
8. 测试大量 SKU 的性能

## 已知限制

1. 当前为模拟数据，需要对接后端 API
2. 上架操作为模拟延迟，需要实现真实的上架逻辑
3. 渠道列表为硬编码，应从配置或 API 获取
4. 未实现上架失败的错误处理和重试机制
