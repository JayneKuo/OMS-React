export type WarehouseType = "physical" | "virtual" | "fba" | "3pl"
export type WarehouseStatus = "active" | "inactive" | "disconnected"
export type StockStatus = "normal" | "low" | "out" | "overstock"
export type LedgerType = "inbound" | "outbound" | "adjustment" | "return" | "transfer" | "oms_lock" | "oms_unlock"
export type SyncMode = "realtime" | "15min" | "hourly" | "manual"
export type ChannelType = "shopify" | "amazon" | "manual"

export interface Warehouse {
  id: string
  name: string
  code: string
  type: WarehouseType
  region: string
  address?: string
  status: WarehouseStatus
  skuCount: number
  totalUnits: number
  connectedChannel?: string
}

/**
 * OMS 侧库存预占锁定明细（UNIS 实际字段）
 * 订单流：open_order(OMS) → locked(寻仓) → allocated(寻到/已分配) → pending_wms_sync(Kafka已发待消费)
 */
export interface OmsLockBreakdown {
  openOrder: number       // OMS 订单软占（刚下单，全局占用，未进入路由）
  locked: number          // 寻仓锁（路由中，寻仓未完成）
  allocated: number       // 已分配到仓库，OMS 侧锁定
  pendingWmsSync: number  // Kafka 消息已发，WMS 尚未消费
}

/**
 * 单仓库标准化库存快照
 *
 * 兼容多仓库服务商数据协议差异：
 *   availableIsNet = false（UNIS WMS 默认）：
 *     available 是毛可用，未扣 open_order，OMS 需自行扣减
 *     此仓净可用贡献 = available − wmsOpenOrder
 *   availableIsNet = true（其他供应商）：
 *     available 已是净可用，wmsOpenOrder 填 0，OMS 直接使用
 *
 * 全局 wmsOpenOrder（SkuInventory）仅累加 availableIsNet=false 仓库的值
 * ATP = Σ(wmsAvailable) − Σ(wmsOpenOrder where !availableIsNet) − omsLockTotal
 */
export interface WarehouseStockDetail {
  warehouseId: string
  warehouseName: string
  warehouseType: WarehouseType
  warehouseCode: string
  // WMS 同步字段
  onHand: number          // WMS: on_hand（物理在库总量）
  available: number       // WMS: available（见 availableIsNet 说明）
  wmsOpenOrder: number    // WMS: open_order 缓存（availableIsNet=true 时填 0）
  wmsAllocate: number     // WMS: allocate（WMS 内部已分配拣货）
  damage: number          // WMS: damage（残次/不可售，仅展示，不计入 ATP）
  inbound: number         // 在途入库（PO/调拨，非WMS字段，OMS采购模块计算）
  availableIsNet: boolean // false = UNIS WMS（gross，需扣 wmsOpenOrder）
                          // true  = 其他供应商（已净，直接参与 ATP）
  lastSyncAt: string
  syncStatus: "synced" | "delayed" | "error"
}

/**
 * SKU 库存快照（OMS视角）
 *
 * ATP 计算公式（UNIS）：
 *   ATP = WMS available − WMS open_order(缓存) − OMS omsLockTotal
 *
 * 说明：
 *   - WMS available 未扣除 WMS 自身 open_order，OMS 需自行扣减
 *   - WMS open_order 是上次同步的快照，下次同步前不变
 *   - OMS 推单后产生的锁（openOrder/locked/allocated/pendingWmsSync）
 *     反映"已推但 WMS 尚未消费"的部分，防止超卖
 *   - damage 不参与 ATP 计算（WMS available 已排除残次）
 *
 * OMS Locks = openOrder + locked + allocated + pendingWmsSync（均不绑定特定仓库）
 */
export interface SkuInventory {
  skuId: string
  skuCode: string
  productName: string
  category: string
  imageUrl?: string

  // ── ATP 计算链 ──
  atpUnits: number              // 最终可承诺（计算值）
  wmsAvailable: number          // WMS available 合计（各仓之和）
  wmsOpenOrder: number          // WMS open_order 缓存合计（履约占用）
  omsLocks: OmsLockBreakdown    // OMS 四阶段锁明细（全局，不绑定仓库）
  omsLockTotal: number          // 四锁合计（= openOrder+locked+allocated+pendingWmsSync）

  // ── WMS 同步数据 ──
  onHand: number                // WMS on_hand 合计（物理库存）
  wmsAllocate: number           // WMS allocate 合计（WMS内部已分配拣货）
  damage: number                // WMS damage 合计（残次/不可售）
  inbound: number               // 在途入库合计（采购/调拨）

  // ── 各仓明细 ──
  warehouseBreakdown: WarehouseStockDetail[]

  // ── 决策参数 ──
  safetyStock: number
  reorderPoint: number
  maxStock: number
  status: StockStatus
  avgDailySales: number
  stockDays: number
  lastUpdated: string
}

export interface LedgerEntry {
  id: string
  timestamp: string
  skuId: string
  skuCode: string
  productName: string
  warehouseId?: string          // OMS全局锁事件无仓库
  warehouseName?: string
  type: LedgerType
  quantity: number              // 正数增加，负数减少
  beforeStock: number           // 变动前可用量（ATP口径）
  afterStock: number
  referenceNo: string
  reason: string                // 触发原因说明（人类可读）
  note?: string
}

export interface SafetyStockConfig {
  skuId: string
  skuCode: string
  productName: string
  currentStock: number
  safetyStock: number
  reorderPoint: number
  maxStock: number
  leadTimeDays: number
}

export interface SyncChannel {
  id: string
  name: string
  type: ChannelType
  platform: string
  enabled: boolean
  syncMode: SyncMode
  bufferStock: number
  syncRatio: number
  warehouses: string[]
  skuFilter: "all" | "whitelist" | "blacklist"
  skuFilterList: string[]
  lastSyncAt: string
  lastSyncStatus: "success" | "partial" | "failed" | "pending"
  pendingUpdates: number
}

export interface AnalyticsSku {
  skuId: string
  skuCode: string
  productName: string
  category: string
  currentStock: number
  stockValue: number
  avgDailySales: number
  stockDays: number
  stockAge: number
  totalSold30d: number
  turnoverRate: number
}
