# Workflow Types Business Logic

## 📦 四种工作流类型对比

### 1. 🏭 Factory Direct (工厂直发)
**业务场景**: 工厂生产后先入成品仓，再配送到目标仓库

**流程**:
```
工厂 → 成品仓(FG) → 目标仓库(DC)
```

**单据流**:
- ✅ 创建成品入库单 (FG Receipt)
- ✅ 创建成品出库单 (FG Outbound/SO)
- ✅ 创建最终入库单 (Final Receipt at DC)

**配置项**:
- Enable FG Staging (启用成品仓)
- Generate FG Receipt (生成成品入库)
- Generate Sale Order (生成成品出库)
- Wait for FG Receipt (等待成品入库完成)
- Auto Create Final Receipt (自动创建最终入库)

---

### 2. 📦 Standard (标准采购)
**业务场景**: 传统采购流程，供应商发货到指定仓库

**流程**:
```
供应商 → 目标仓库
```

**单据流**:
- ✅ 创建入库单 (Receipt)
- ✅ 可选质检 (Quality Check)
- ✅ 上架入库 (Putaway)

**配置项**:
- Target Warehouse (目标仓库)
- Auto Create Receipt (自动创建入库)
- Quality Check Required (需要质检)

---

### 3. 🚚 Dropship (直运)
**业务场景**: 供应商直接发货给客户，不经过自己的仓库

**流程**:
```
供应商 → 客户 (跳过仓库)
```

**单据流**:
- ❌ **不创建入库单** (No Receipt)
- ❌ **不经过仓库** (No Warehouse)
- ✅ 只跟踪发货状态 (Track Shipment Only)
- ✅ 虚拟库存管理 (Virtual Inventory)

**配置项**:
- Supplier Warehouse (供应商仓库位置)
- Direct Ship to Customer (直接发货给客户) - 默认 YES
- Track Supplier Shipment (跟踪供应商发货) - 默认 YES
- Virtual Inventory (虚拟库存) - 可选
- Notify Customer (通知客户) - 可选

**关键特点**:
- 💡 **无需入库** - 供应商直接发货
- 💡 **虚拟库存** - 系统记录但无实物库存
- 💡 **跟踪为主** - 主要跟踪发货和物流状态

---

### 4. 🔄 Cross Dock (越库)
**业务场景**: 货物到达越库中心后立即分拣出库，不存储

**流程**:
```
供应商 → 越库中心 → 立即出库 → 目标地
```

**单据流**:
- ✅ **创建入库单** (Inbound Receipt at Cross Dock)
- ✅ **创建出库单** (Immediate Outbound)
- ❌ **不上架存储** (No Putaway/Storage)

**配置项**:
- Cross Dock Hub (越库中心)
- Max Dwell Time (最大停留时间) - 通常24-48小时
- Create Inbound Receipt (创建入库单) - 默认 YES
- Skip Putaway (跳过上架) - 默认 YES
- Immediate Outbound (立即出库) - 默认 YES
- Auto Sort (自动分拣) - 可选

**关键特点**:
- 💡 **需要入库** - 记录货物到达
- 💡 **立即出库** - 不存储，快速周转
- 💡 **最小停留** - 24-48小时内完成
- 💡 **不上架** - 直接分拣出库

---

## 📊 对比表格

| 特性 | Factory Direct | Standard | Dropship | Cross Dock |
|------|----------------|----------|----------|------------|
| **入库单** | ✅ 成品入库 + 最终入库 | ✅ 一次入库 | ❌ 无入库 | ✅ 越库入库 |
| **出库单** | ✅ 成品出库 | ❌ 无 | ❌ 无 | ✅ 立即出库 |
| **经过仓库** | ✅ 成品仓 + 目标仓 | ✅ 目标仓 | ❌ 不经过 | ✅ 越库中心 |
| **上架存储** | ✅ 两次上架 | ✅ 一次上架 | ❌ 无 | ❌ 不上架 |
| **停留时间** | 长期存储 | 长期存储 | 0 | 24-48小时 |
| **质检** | 可选 | 可选 | ❌ 无 | 可选 |
| **库存类型** | 实物库存 | 实物库存 | 虚拟库存 | 实物库存 |

---

## 🎯 使用场景

### Factory Direct (工厂直发)
- 自有工厂生产
- 需要成品仓中转
- 多仓库配送

### Standard (标准采购)
- 传统供应商采购
- 需要质检和验收
- 长期存储

### Dropship (直运)
- 供应商直发客户
- 无需自有库存
- 降低仓储成本
- 快速响应订单

### Cross Dock (越库)
- 快速周转商品
- 多点配送
- 减少存储成本
- 提高物流效率

---

## 💡 实施建议

### Dropship 适用于:
- ✅ 大件商品 (家具、家电)
- ✅ 定制商品
- ✅ 低频商品
- ✅ 供应商直发能力强

### Cross Dock 适用于:
- ✅ 快消品
- ✅ 多点配送
- ✅ 时效性要求高
- ✅ 大批量转运

### Factory Direct 适用于:
- ✅ 自有工厂
- ✅ 需要成品仓质检
- ✅ 多仓库分销

### Standard 适用于:
- ✅ 传统采购
- ✅ 需要质检验收
- ✅ 长期存储商品

---

## 🔧 技术实现要点

### Dropship
```typescript
{
  type: "SET_WORKFLOW",
  workflow: "DROPSHIP",
  config: {
    directShipToCustomer: true,  // 不创建入库单
    trackSupplierShipment: true, // 只跟踪物流
    virtualInventory: true,      // 虚拟库存
    notifyCustomer: true         // 通知客户
  }
}
```

### Cross Dock
```typescript
{
  type: "SET_WORKFLOW",
  workflow: "CROSS_DOCK",
  config: {
    createInboundReceipt: true,  // 创建入库单
    skipPutaway: true,           // 跳过上架
    immediateOutbound: true,     // 立即出库
    maxDwellTimeHours: 24,       // 24小时内完成
    autoSort: true               // 自动分拣
  }
}
```

---

## 📝 总结

- **Dropship**: 无入库，供应商直发客户
- **Cross Dock**: 有入库+出库，但不存储，快速周转
- **Factory Direct**: 两次入库+一次出库，经过成品仓
- **Standard**: 一次入库，传统流程

选择合适的工作流类型可以优化库存管理、降低成本、提高效率！
