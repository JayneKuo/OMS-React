# 工厂直发采购单需求文档

## 一、功能概述

**功能名称**：工厂直发采购单（Factory Direct Shipment PO）

**功能目的**：
- 支持从工厂直接发货到目的地的采购流程
- 提供灵活的物流路径配置（经成品库 vs 直接发货）
- 优化供应链效率，减少中间环节

**使用场景**：
1. 工厂生产完成后直接发货到客户/门店
2. 紧急订单需要快速配送
3. 大宗商品直接从工厂发货

---

## 二、业务流程

### 2.1 物流路径类型

#### 路径1：经成品库（Via Finished Goods Warehouse）
```
工厂 → 成品库入库 → 成品库出库 → 目的地收货
```

**流程说明**：
1. 工厂生产完成，创建发运单发往成品库
2. 成品库收货入库（WMS入库单）
3. 成品库根据订单出库（WMS出库单）
4. 目的地（客户/门店）收货确认

**适用场景**：
- 需要质检的商品
- 需要分拣配货的订单
- 需要库存缓冲的商品

#### 路径2：直接发货（Direct Shipment）
```
工厂 → 直接发货 → 目的地收货
```

**流程说明**：
1. 工厂生产完成，直接创建发运单发往目的地
2. 目的地（客户/门店）直接收货确认
3. 系统自动创建虚拟出库单（财务记账用）

**适用场景**：
- 紧急订单
- 大宗商品
- 已质检合格的商品

---

## 三、数据模型

### 3.1 PO 数据结构扩展

```typescript
interface PurchaseOrder {
  // ... 现有字段
  
  // 新增字段
  poType: "STANDARD" | "FACTORY_DIRECT"  // PO类型
  
  // 工厂直发专用字段
  factoryDirectConfig?: {
    viaFinishedGoodsWarehouse: boolean    // 是否经成品库
    factoryId: string                      // 工厂ID
    factoryName: string                    // 工厂名称
    factoryAddress: string                 // 工厂地址
    finishedGoodsWarehouseId?: string     // 成品库ID（如果经成品库）
    finishedGoodsWarehouseName?: string   // 成品库名称
    finalDestinationId: string             // 最终目的地ID
    finalDestinationType: "CUSTOMER" | "STORE" | "WAREHOUSE"  // 目的地类型
    finalDestinationName: string           // 目的地名称
    finalDestinationAddress: string        // 目的地地址
  }
}
```

---

## 四、UI设计

### 4.1 新建PO下拉菜单

**位置**：PO列表页右上角"新增PO"按钮

**菜单项**：
```
┌─────────────────────────────────┐
│ 📄 手动创建PO                    │
│ 🏭 工厂直发PO (新增)             │
│ 📤 从文件导入PO                  │
│ ─────────────────────────────   │
│ 📥 下载模板PO                    │
└─────────────────────────────────┘
```

### 4.2 工厂直发PO创建表单

**页面路径**：`/purchase/po/create/factory-direct`

**表单布局**：

#### 第一部分：基本信息
```
┌─────────────────────────────────────────────┐
│ 基本信息                                     │
├─────────────────────────────────────────────┤
│ PO编号: [自动生成]                           │
│ 供应商: [下拉选择]                           │
│ 工厂: [下拉选择]                             │
│ 采购日期: [日期选择器]                       │
│ 预计到货日期: [日期时间选择器]               │
└─────────────────────────────────────────────┘
```

#### 第二部分：物流路径配置（核心）
```
┌─────────────────────────────────────────────┐
│ 物流路径配置                                 │
├─────────────────────────────────────────────┤
│ ○ 经成品库                                   │
│   ├─ 成品库: [下拉选择仓库]                  │
│   ├─ 最终目的地类型: [客户/门店/仓库]        │
│   └─ 最终目的地: [根据类型选择]              │
│                                              │
│ ○ 直接发货                                   │
│   ├─ 目的地类型: [客户/门店/仓库]            │
│   └─ 目的地: [根据类型选择]                  │
│                                              │
│ 流程预览:                                    │
│ [工厂] → [成品库] → [客户A]                 │
│ 或                                           │
│ [工厂] → [客户A]                             │
└─────────────────────────────────────────────┘
```

#### 第三部分：商品明细
```
┌─────────────────────────────────────────────┐
│ 商品明细                                     │
├─────────────────────────────────────────────┤
│ [+ 添加商品]                                 │
│                                              │
│ 表格：                                       │
│ 行号 | SKU | 商品名称 | 数量 | 单价 | 金额  │
└─────────────────────────────────────────────┘
```

### 4.3 物流路径配置组件详细设计

**组件名称**：`FactoryDirectShippingConfig`

**交互逻辑**：

1. **单选按钮组**：
   - 选项1：经成品库（默认选中）
   - 选项2：直接发货

2. **经成品库模式**：
   ```tsx
   <div className="space-y-4 pl-6 border-l-2 border-primary">
     <div>
       <Label>成品库 *</Label>
       <Select>
         <SelectTrigger>
           <SelectValue placeholder="选择成品库" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="FG001">成品库A - 深圳</SelectItem>
           <SelectItem value="FG002">成品库B - 上海</SelectItem>
         </SelectContent>
       </Select>
       <p className="text-xs text-muted-foreground mt-1">
         货物将先入库到此仓库，再出库发往目的地
       </p>
     </div>
     
     <div>
       <Label>最终目的地类型 *</Label>
       <Select>
         <SelectTrigger>
           <SelectValue placeholder="选择目的地类型" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="CUSTOMER">客户</SelectItem>
           <SelectItem value="STORE">门店</SelectItem>
           <SelectItem value="WAREHOUSE">仓库</SelectItem>
         </SelectContent>
       </Select>
     </div>
     
     <div>
       <Label>最终目的地 *</Label>
       <Select>
         <SelectTrigger>
           <SelectValue placeholder="选择目的地" />
         </SelectTrigger>
         <SelectContent>
           {/* 根据目的地类型动态加载 */}
         </SelectContent>
       </Select>
     </div>
   </div>
   ```

3. **直接发货模式**：
   ```tsx
   <div className="space-y-4 pl-6 border-l-2 border-primary">
     <div>
       <Label>目的地类型 *</Label>
       <Select>
         <SelectTrigger>
           <SelectValue placeholder="选择目的地类型" />
         </SelectTrigger>
         <SelectContent>
           <SelectItem value="CUSTOMER">客户</SelectItem>
           <SelectItem value="STORE">门店</SelectItem>
           <SelectItem value="WAREHOUSE">仓库</SelectItem>
         </SelectContent>
       </Select>
     </div>
     
     <div>
       <Label>目的地 *</Label>
       <Select>
         <SelectTrigger>
           <SelectValue placeholder="选择目的地" />
         </SelectTrigger>
         <SelectContent>
           {/* 根据目的地类型动态加载 */}
         </SelectContent>
       </Select>
     </div>
     
     <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md p-3">
       <div className="flex items-start gap-2">
         <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
         <div className="text-xs text-yellow-800 dark:text-yellow-200">
           <p className="font-medium">直接发货模式</p>
           <p className="mt-1">货物将直接从工厂发往目的地，系统会自动创建虚拟出库单用于财务记账。</p>
         </div>
       </div>
     </div>
   </div>
   ```

4. **流程预览**：
   ```tsx
   <div className="mt-4 p-4 bg-muted/50 rounded-lg">
     <div className="text-sm font-medium mb-2">物流流程预览</div>
     <div className="flex items-center gap-2 text-sm">
       <Badge variant="outline">工厂: {factoryName}</Badge>
       <ArrowRight className="h-4 w-4 text-muted-foreground" />
       {viaFinishedGoodsWarehouse && (
         <>
           <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
             成品库: {finishedGoodsWarehouseName}
           </Badge>
           <ArrowRight className="h-4 w-4 text-muted-foreground" />
         </>
       )}
       <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
         {destinationType}: {destinationName}
       </Badge>
     </div>
   </div>
   ```

---

## 五、状态流转

### 5.1 经成品库模式

```
NEW (新建)
  ↓ 工厂创建发运单
FACTORY_SHIPPED (工厂已发货)
  ↓ 成品库收货
FG_RECEIVED (成品库已收货)
  ↓ 成品库出库
FG_SHIPPED (成品库已发货)
  ↓ 目的地收货
COMPLETED (已完成)
```

### 5.2 直接发货模式

```
NEW (新建)
  ↓ 工厂创建发运单
FACTORY_SHIPPED (工厂已发货)
  ↓ 目的地收货（系统自动创建虚拟出库单）
COMPLETED (已完成)
```

---

## 六、列表页显示

### 6.1 新增列

**PO类型列**：
- 标准PO：显示 "标准"
- 工厂直发PO：显示 "工厂直发" + 路径标识

```tsx
{
  id: "poType",
  header: "PO类型",
  width: "150px",
  defaultVisible: true,
  cell: (row) => {
    if (row.poType === "FACTORY_DIRECT") {
      const config = row.factoryDirectConfig
      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
            工厂直发
          </Badge>
          <span className="text-xs text-muted-foreground">
            {config?.viaFinishedGoodsWarehouse ? "经成品库" : "直接发货"}
          </span>
        </div>
      )
    }
    return <span className="text-sm text-muted-foreground">标准</span>
  }
}
```

### 6.2 物流路径列

```tsx
{
  id: "shippingRoute",
  header: "物流路径",
  width: "250px",
  defaultVisible: false,
  cell: (row) => {
    if (row.poType === "FACTORY_DIRECT" && row.factoryDirectConfig) {
      const config = row.factoryDirectConfig
      return (
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground">{config.factoryName}</span>
          <ArrowRight className="h-3 w-3" />
          {config.viaFinishedGoodsWarehouse && (
            <>
              <span className="text-blue-600 dark:text-blue-400">
                {config.finishedGoodsWarehouseName}
              </span>
              <ArrowRight className="h-3 w-3" />
            </>
          )}
          <span className="text-green-600 dark:text-green-400">
            {config.finalDestinationName}
          </span>
        </div>
      )
    }
    return <span className="text-muted-foreground">-</span>
  }
}
```

---

## 七、详情页显示

### 7.1 物流路径卡片

**位置**：详情页关键信息卡片区域

```tsx
{row.poType === "FACTORY_DIRECT" && row.factoryDirectConfig && (
  <Card>
    <CardContent className="pt-6 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium mb-3">
        <Truck className="h-4 w-4 text-primary" />
        物流路径
      </div>
      
      {/* 流程图 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground mb-1">工厂</div>
          <Badge variant="outline">{row.factoryDirectConfig.factoryName}</Badge>
        </div>
        
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        
        {row.factoryDirectConfig.viaFinishedGoodsWarehouse && (
          <>
            <div className="flex-1 text-center">
              <div className="text-xs text-muted-foreground mb-1">成品库</div>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                {row.factoryDirectConfig.finishedGoodsWarehouseName}
              </Badge>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </>
        )}
        
        <div className="flex-1 text-center">
          <div className="text-xs text-muted-foreground mb-1">目的地</div>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            {row.factoryDirectConfig.finalDestinationName}
          </Badge>
        </div>
      </div>
      
      {/* 详细信息 */}
      <div className="space-y-2 text-xs pt-3 border-t">
        <div className="flex justify-between">
          <span className="text-muted-foreground">路径类型:</span>
          <span className="font-medium">
            {row.factoryDirectConfig.viaFinishedGoodsWarehouse ? "经成品库" : "直接发货"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">目的地类型:</span>
          <span className="font-medium">
            {row.factoryDirectConfig.finalDestinationType === "CUSTOMER" ? "客户" :
             row.factoryDirectConfig.finalDestinationType === "STORE" ? "门店" : "仓库"}
          </span>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

---

## 八、实现步骤

### 步骤1：更新数据模型
- [ ] 扩展 PurchaseOrder 接口，添加 poType 和 factoryDirectConfig 字段
- [ ] 更新 mock 数据，添加工厂直发示例

### 步骤2：创建物流路径配置组件
- [ ] 创建 `FactoryDirectShippingConfig.tsx` 组件
- [ ] 实现单选按钮切换逻辑
- [ ] 实现动态表单字段显示
- [ ] 实现流程预览功能

### 步骤3：创建工厂直发PO创建页面
- [ ] 创建 `/app/purchase/po/create/factory-direct/page.tsx`
- [ ] 集成物流路径配置组件
- [ ] 实现表单验证
- [ ] 实现保存和提交功能

### 步骤4：更新PO列表页
- [ ] 在"新增PO"下拉菜单添加"工厂直发PO"选项
- [ ] 添加"PO类型"列
- [ ] 添加"物流路径"列（默认隐藏）

### 步骤5：更新PO详情页
- [ ] 添加物流路径卡片
- [ ] 根据路径类型显示不同的状态流程

### 步骤6：国际化
- [ ] 添加中英文翻译
- [ ] 更新 i18n 配置

---

## 九、验收标准

### 功能验收
- [ ] 可以创建工厂直发PO
- [ ] 可以选择"经成品库"或"直接发货"
- [ ] 流程预览正确显示物流路径
- [ ] 列表页正确显示PO类型和物流路径
- [ ] 详情页正确显示物流路径卡片

### UI验收
- [ ] 符合设计系统规范
- [ ] 响应式布局正常
- [ ] 深色模式正常
- [ ] 交互流畅，无卡顿

### 数据验收
- [ ] 数据保存正确
- [ ] 状态流转正确
- [ ] 筛选和搜索正常

---

## 十、后续优化

1. **智能推荐**：根据商品类型和目的地自动推荐物流路径
2. **成本计算**：对比两种路径的物流成本
3. **时效预估**：显示预计到货时间
4. **批量创建**：支持批量创建工厂直发PO
5. **模板保存**：保存常用的物流路径配置为模板

---

**文档版本**: v1.0  
**创建日期**: 2025-01-21  
**最后更新**: 2025-01-21  
**状态**: ✅ 待评审
