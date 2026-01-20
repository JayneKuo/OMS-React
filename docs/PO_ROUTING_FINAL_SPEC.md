# PO Order Routing - 最终规格说明

## 版本信息
- **版本**: 3.0 Final
- **更新日期**: 2025-01-07
- **状态**: ✅ 已完成

---

## 核心业务逻辑

### 触发机制

#### 1️⃣ Receipt 创建触发（基于 PO 状态）
当 PO 到达以下状态时，自动创建收货单：

| PO 状态 | 说明 | 使用场景 |
|---------|------|----------|
| **NEW** | 新建 | 立即创建收货单，提前准备 |
| **IN_TRANSIT** | 运输中 | 货物在途时创建，常用场景 |
| **WAITING_FOR_RECEIVING** | 待收货/已到达 | 货物到达仓库时创建 |

#### 2️⃣ WMS 推送触发（基于 Receipt 状态）
仅当收货单创建成功时触发：

| Receipt 状态 | 说明 | 适用仓库 |
|--------------|------|----------|
| **RECEIPT_CREATED (NEW)** | 收货单创建成功 | 仅非本地仓库 |

---

## 业务流程图

### 完整流程
```
┌─────────────────────────────────────────────────────────────┐
│                    PO 状态变更监听                           │
│         (NEW / IN_TRANSIT / WAITING_FOR_RECEIVING)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  自动创建 Receipt     │
              │   (状态: NEW)        │
              └──────────┬───────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │  检查商品是否存在     │
              └──────────┬───────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ↓                 ↓
        [商品存在]         [商品不存在]
                │                 │
                │                 ↓
                │      ┌──────────────────────┐
                │      │ 自动创建商品？        │
                │      └──────────┬───────────┘
                │                 │
                │        ┌────────┴────────┐
                │        │                 │
                │        ↓                 ↓
                │    [启用]            [禁用]
                │        │                 │
                │        ↓                 ↓
                │  [创建商品]        [报错/跳过]
                │        │
                └────────┴─────────┐
                                   │
                                   ↓
                        ┌──────────────────────┐
                        │   判断仓库类型        │
                        └──────────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ↓                             ↓
            ┌───────────────┐           ┌───────────────┐
            │  本地仓库      │           │  非本地仓库    │
            └───────┬───────┘           └───────┬───────┘
                    │                           │
                    ↓                           ↓
        ┌──────────────────────┐    ┌──────────────────────┐
        │ 自动完成入库？        │    │ 推送到 WMS？         │
        └──────────┬───────────┘    └──────────┬───────────┘
                   │                           │
          ┌────────┴────────┐         ┌────────┴────────┐
          │                 │         │                 │
          ↓                 ↓         ↓                 ↓
      [启用]            [禁用]    [启用]            [禁用]
          │                 │         │                 │
          ↓                 ↓         ↓                 ↓
    [完成入库]      [等待人工]  [推送数据]        [不推送]
    [更新库存]      [验货收货]  [到 WMS]
          │                 │         │
          └─────────────────┴─────────┘
                            │
                            ↓
                    ┌───────────────┐
                    │   流程结束     │
                    └───────────────┘
```

---

## 配置项详解

### 1. Auto-Create Receipt
**功能**: 自动创建收货单  
**触发**: PO 状态变更  
**配置项**:
- 启用/禁用开关
- 触发节点选择（NEW / IN_TRANSIT / WAITING_FOR_RECEIVING）

**UI 示例**:
```
┌─────────────────────────────────────────────────────┐
│ 📦 Auto-Create Receipt                    [ON/OFF] │
│                                                     │
│ Automatically create receipt records when PO       │
│ reaches specified status                           │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Trigger Node (PO Status)                           │
│ ┌─────────────────────────────────────────────┐   │
│ │ In Transit (运输中)                    ▼   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Receipt will be created when PO reaches this       │
│ status                                             │
└─────────────────────────────────────────────────────┘
```

### 2. Auto-Complete Receipt (Local Warehouse)
**功能**: 本地仓库自动完成入库  
**触发**: Receipt 创建后  
**适用**: 仅本地仓库  
**配置项**:
- 启用/禁用开关

**UI 示例**:
```
┌─────────────────────────────────────────────────────┐
│ ✅ Auto-Complete Receipt (Local Warehouse) [ON/OFF]│
│                                                     │
│ Automatically complete receiving process when       │
│ receipt is created for local warehouses            │
└─────────────────────────────────────────────────────┘
```

### 3. Auto-Create Missing Products
**功能**: 自动创建缺失商品  
**触发**: Receipt 创建时检查商品  
**适用**: 所有仓库  
**配置项**:
- 启用/禁用开关

**UI 示例**:
```
┌─────────────────────────────────────────────────────┐
│ 📦 Auto-Create Missing Products           [ON/OFF] │
│                                                     │
│ Automatically create product records when           │
│ receiving items that don't exist in the system     │
└─────────────────────────────────────────────────────┘
```

### 4. Push to WMS (Non-Local Warehouse)
**功能**: 推送到 WMS  
**触发**: Receipt 创建成功（NEW 状态）  
**适用**: 仅非本地仓库  
**配置项**:
- 启用/禁用开关
- 触发节点（固定为 RECEIPT_CREATED）

**UI 示例**:
```
┌─────────────────────────────────────────────────────┐
│ 🔄 Push to WMS (Non-Local Warehouse)     [ON/OFF] │
│                                                     │
│ Automatically send data to downstream WMS when      │
│ receipt is created for non-local warehouses        │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Trigger Node (Receipt Status)                      │
│ ┌─────────────────────────────────────────────┐   │
│ │ Receipt Created (收货单创建成功)              │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Data will be pushed to WMS when receipt is         │
│ created (NEW status)                               │
└─────────────────────────────────────────────────────┘
```

---

## 仓库类型行为矩阵

| 功能 | 本地仓库 | 非本地仓库 (3PL/虚拟仓) |
|------|----------|------------------------|
| 自动创建 Receipt | ✅ 支持 | ✅ 支持 |
| 触发节点 | PO 状态 | PO 状态 |
| 自动完成入库 | ✅ 可选 | ❌ 不支持 |
| 自动创建商品 | ✅ 可选 | ✅ 可选 |
| 推送到 WMS | ❌ 不适用 | ✅ 可选 |
| WMS 触发节点 | - | Receipt 创建 |

---

## 业务场景配置指南

### 场景 A: 本地仓库 - 标准流程
**适用**: 有人工验货流程的本地仓库

```yaml
配置:
  Auto-Create Receipt: ON
    Trigger: IN_TRANSIT
  Auto-Complete Receipt: OFF
  Auto-Create Missing Products: OFF
  Push to WMS: N/A

流程:
  1. PO 状态 → IN_TRANSIT
  2. 系统自动创建收货单
  3. 仓库人员收到通知
  4. 人工验货
  5. 手动完成收货
  6. 库存更新
```

### 场景 B: 本地仓库 - 快速入库
**适用**: 信任供应商，无需验货的本地仓库

```yaml
配置:
  Auto-Create Receipt: ON
    Trigger: IN_TRANSIT
  Auto-Complete Receipt: ON
  Auto-Create Missing Products: OFF
  Push to WMS: N/A

流程:
  1. PO 状态 → IN_TRANSIT
  2. 系统自动创建收货单
  3. 系统自动完成入库
  4. 库存立即更新
  5. 无需人工介入
```

### 场景 C: 3PL 仓库 - 标准集成
**适用**: 与 3PL WMS 集成的仓库

```yaml
配置:
  Auto-Create Receipt: ON
    Trigger: WAITING_FOR_RECEIVING
  Auto-Complete Receipt: N/A
  Auto-Create Missing Products: ON
  Push to WMS: ON
    Trigger: RECEIPT_CREATED

流程:
  1. PO 状态 → WAITING_FOR_RECEIVING (货物已到达)
  2. 系统自动创建收货单
  3. 检查并创建缺失商品
  4. 推送数据到 3PL WMS
  5. 等待 3PL 确认收货
  6. 3PL 回传收货结果
  7. 库存更新
```

### 场景 D: Dropship - 虚拟仓库
**适用**: 直发模式，无实际收货

```yaml
配置:
  Auto-Create Receipt: ON
    Trigger: NEW
  Auto-Complete Receipt: N/A
  Auto-Create Missing Products: ON
  Push to WMS: OFF

流程:
  1. PO 状态 → NEW
  2. 系统自动创建收货单
  3. 检查并创建缺失商品
  4. 系统自动完成（虚拟收货）
  5. 库存立即可用
```

---

## UI 设计规范合规性

### ✅ 完全符合 OMS React Design System

#### 颜色使用
- ✅ 主色: `bg-primary/10`, `text-primary`
- ✅ 语义色: `text-blue-600` (信息), `text-emerald-600` (成功), `text-amber-600` (警告), `text-purple-600` (集成)
- ✅ 背景: `bg-muted/30`, `bg-muted/50`
- ✅ 边框: `border`, `border-l-4 border-l-blue-500`

#### 排版
- ✅ 页面标题: `text-3xl font-semibold tracking-tight`
- ✅ 卡片标题: `text-base font-medium`
- ✅ 描述文本: `text-sm text-muted-foreground`
- ✅ 辅助文本: `text-xs text-muted-foreground`

#### 间距
- ✅ 页面容器: `space-y-6` (24px)
- ✅ 卡片内容: `space-y-6` (24px)
- ✅ 配置项: `space-y-3` (12px)
- ✅ 表单元素: `space-y-2` (8px)
- ✅ 图标间距: `gap-2` (8px), `gap-3` (12px)

#### 组件
- ✅ 使用 shadcn/ui 标准组件
- ✅ 正确的组件层次结构
- ✅ 一致的交互状态

#### 可访问性
- ✅ 触摸目标: `h-10` (40px)
- ✅ 键盘导航支持
- ✅ 屏幕阅读器友好
- ✅ 颜色对比度符合 WCAG 标准

---

## 技术实现

### 数据结构
```typescript
interface GlobalSettings {
  autoCreateReceipt: boolean
  receiptTrigger?: "NEW" | "IN_TRANSIT" | "WAITING_FOR_RECEIVING"
  autoCompleteReceipt: boolean
  autoCreateProduct: boolean
  pushToWMS: boolean
  wmsTrigger?: "RECEIPT_CREATED"
}
```

### 状态枚举
```typescript
// PO 状态 (来自 /lib/enums/po-status.ts)
enum POStatus {
  NEW = 'NEW',
  IN_TRANSIT = 'IN_TRANSIT',
  WAITING_FOR_RECEIVING = 'WAITING_FOR_RECEIVING',
  RECEIVING = 'RECEIVING',
  PARTIAL_RECEIPT = 'PARTIAL_RECEIPT',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION'
}

// Receipt 状态
enum ReceiptStatus {
  NEW = 'NEW',              // 创建成功，触发 WMS 推送
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

### API 端点设计
```typescript
// 保存配置
POST /api/automation/po-routing/settings
Body: GlobalSettings

// 获取配置
GET /api/automation/po-routing/settings
Response: GlobalSettings

// 测试 WMS 连接
POST /api/automation/po-routing/test-wms
Body: { endpoint: string, authType: string }
```

---

## 后端实现要点

### 1. PO 状态监听
```typescript
// 伪代码
onPOStatusChange(po: PurchaseOrder) {
  const settings = getRoutingSettings()
  
  if (settings.autoCreateReceipt && 
      po.status === settings.receiptTrigger) {
    createReceipt(po)
  }
}
```

### 2. Receipt 创建逻辑
```typescript
// 伪代码
async function createReceipt(po: PurchaseOrder) {
  // 1. 检查商品
  if (settings.autoCreateProduct) {
    await checkAndCreateMissingProducts(po.items)
  }
  
  // 2. 创建收货单
  const receipt = await Receipt.create({
    poId: po.id,
    status: 'NEW',
    items: po.items
  })
  
  // 3. 判断仓库类型
  const warehouse = await getWarehouse(po.warehouseId)
  
  if (warehouse.isLocal) {
    // 本地仓库
    if (settings.autoCompleteReceipt) {
      await completeReceipt(receipt)
    }
  } else {
    // 非本地仓库
    if (settings.pushToWMS) {
      await pushToWMS(receipt)
    }
  }
}
```

### 3. WMS 推送逻辑
```typescript
// 伪代码
async function pushToWMS(receipt: Receipt) {
  const warehouse = await getWarehouse(receipt.warehouseId)
  
  try {
    await wmsClient.push({
      endpoint: warehouse.wmsEndpoint,
      data: formatReceiptForWMS(receipt)
    })
    
    await receipt.update({
      wmsPushStatus: 'SUCCESS',
      wmsPushAt: new Date()
    })
  } catch (error) {
    await receipt.update({
      wmsPushStatus: 'FAILED',
      wmsPushError: error.message
    })
    
    // 加入重试队列
    await retryQueue.add(receipt.id)
  }
}
```

---

## 测试清单

### 功能测试
- [ ] PO 状态 NEW 触发 Receipt 创建
- [ ] PO 状态 IN_TRANSIT 触发 Receipt 创建
- [ ] PO 状态 WAITING_FOR_RECEIVING 触发 Receipt 创建
- [ ] 本地仓库自动完成入库
- [ ] 非本地仓库不自动完成
- [ ] 自动创建缺失商品
- [ ] 非本地仓库 WMS 推送
- [ ] 本地仓库不推送 WMS

### 边界测试
- [ ] PO 取消后不创建 Receipt
- [ ] 重复触发防护
- [ ] 商品创建失败处理
- [ ] WMS 推送失败重试
- [ ] 并发场景处理

### 性能测试
- [ ] 大批量 PO 处理
- [ ] WMS 推送性能
- [ ] 数据库查询优化

---

## 文档清单

- ✅ `/app/automation/purchase-order/routing/page.tsx` - 主页面实现
- ✅ `/docs/PO_ROUTING_FINAL_SPEC.md` - 最终规格说明（本文件）
- ✅ `/docs/PO_ROUTING_REFACTOR_SUMMARY.md` - 重构总结
- ✅ `/docs/PO_ROUTING_UI_COMPLIANCE.md` - UI 规范合规性检查
- ✅ `/docs/PO_ROUTING_RULES.md` - 路由规则文档

---

## 版本历史

### v3.0 Final (2025-01-07)
- ✅ 使用真实的 PO 状态枚举
- ✅ 简化 WMS 推送触发（仅 RECEIPT_CREATED）
- ✅ 明确本地/非本地仓库行为差异
- ✅ 移除虚拟仓库特殊处理
- ✅ 移除仓库级别覆盖功能
- ✅ 添加业务流程说明卡片
- ✅ 完善文档和示例

### v2.0 (2025-01-06)
- 添加触发节点配置
- 添加自动完成入库
- 添加自动创建商品
- 添加仓库级别覆盖

### v1.0 (2024-12-XX)
- 初始版本
- 基础路由功能

---

**文档维护**: 开发团队  
**最后审核**: 2025-01-07  
**状态**: ✅ 已批准实施
