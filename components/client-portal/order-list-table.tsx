"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDown, ChevronRight, Search, AlertTriangle, Clock, XCircle,
  RefreshCw, CheckCircle2, AlertCircle, Timer, Package, ArrowRight,
  Truck, ExternalLink, MapPin, Warehouse, BarChart3, TrendingUp, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"

// ── Types ──────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "imported" | "on_hold" | "allocated" | "deallocated"
  | "warehouse_processing" | "shipped" | "cancelled" | "exception"

export type OrderTag = "overdue" | "dc_sync_fail" | "dc_rejected" | "dc_short" | "urgent" | "sla_risk" | "wh_stalled" | "alloc_failed" | "partial_ship" | "import_error"
export type ChannelType = "amazon" | "walmart" | "shopify" | "tiktok" | "shein"

export interface OrderItem { sku: string; name: string; qty: number; unitPrice: number; currency: string }
export interface Shipment {
  id: string; warehouseCode: string; warehouseName: string; status: string; outboundOrderNo: string
  asnNo?: string; trackingNo?: string; carrier?: string; itemCount: number; shippedAt?: string
  estimatedDelivery?: string; dcConfirmedAt?: string; dcReceivedQty?: number; dcNote?: string
  shipFrom?: { name: string; city: string; state: string }
  shipTo?: { name: string; city: string; state: string }
  requiredShipDate?: string; palletCount?: number; bolNo?: string; proNo?: string
  lotNumbers?: string[]; serialNumbers?: { total: number; sample?: string[] }
  /** 出库单创建时间 — 用于检测仓库处理停滞 */
  createdAt?: string
}
export interface Order {
  id: string; orderNo: string; poNo?: string; externalOrderNo?: string; refOrderNo?: string
  channel: ChannelType; platform?: string; customer: string; retailer?: string
  sourceChannel?: string; channelNote?: string
  createdAt: string; requiredShipDate?: string; requiredDeliveryDate?: string; slaDeadline?: string
  shipToAddress: { name: string; city: string; state: string; zip: string; country: string }
  skuCount: number; itemCount: number; totalAmount: string; currency: string
  status: OrderStatus; tags?: OrderTag[]; overdueShipDays?: number
  items: OrderItem[]; shipments: Shipment[]
  /** 订单创建失败原因 — API对接时缺SKU/缺地址/格式错误等 */
  importError?: string
}

// ── Config ─────────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  imported: "Imported", on_hold: "On Hold", allocated: "Allocated", deallocated: "Deallocated",
  warehouse_processing: "Warehouse Processing", shipped: "Shipped", cancelled: "Cancelled", exception: "Exception",
}
const STATUS_CLASS: Record<OrderStatus, string> = {
  imported:              "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  on_hold:               "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  allocated:             "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  deallocated:           "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  warehouse_processing:  "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  shipped:               "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  cancelled:             "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  exception:             "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}
const TAG_CONFIG: Record<string, { label: string; cls: string }> = {
  overdue:       { label: "Overdue",       cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  dc_sync_fail:  { label: "Sync Fail",    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  dc_rejected:   { label: "DC Rejected",  cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  dc_short:      { label: "DC Short",     cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" },
  urgent:        { label: "Urgent",        cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  sla_risk:      { label: "SLA Risk",     cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  wh_stalled:    { label: "WH Stalled",   cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  alloc_failed:  { label: "Alloc Failed", cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  partial_ship:  { label: "Partial Ship", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" },
  import_error:  { label: "Import Error", cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
}
const CHANNEL_LABEL: Record<ChannelType, string> = {
  amazon: "Amazon", walmart: "Walmart", shopify: "Shopify", tiktok: "TikTok", shein: "Shein",
}
const CHANNEL_COLOR: Record<ChannelType, string> = {
  amazon:  "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  walmart: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  shopify: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  tiktok:  "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
  shein:   "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
}

const SHIPMENT_STATUS_CLASS: Record<string, string> = {
  picking:       "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  packed:        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  shipped:       "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  in_transit:    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  dc_confirmed:  "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  dc_rejected:   "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
}
const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  picking: "Picking", packed: "Packed", shipped: "Shipped",
  in_transit: "In Transit", dc_confirmed: "DC Confirmed", dc_rejected: "DC Rejected",
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isB2B(channel: ChannelType) { return channel === "amazon" || channel === "walmart" }

function hoursUntil(iso?: string): number | null {
  if (!iso) return null
  return Math.floor((new Date(iso).getTime() - Date.now()) / 3600000)
}

function shipWindowLabel(order: Order): React.ReactNode {
  if (!order.requiredShipDate) return <span className="text-muted-foreground text-xs">-</span>
  const today = new Date().toISOString().slice(0, 10)
  const overdue = order.requiredShipDate < today && !["shipped", "cancelled"].includes(order.status)
  return (
    <div className="text-xs">
      <span className={cn(overdue ? "text-red-600 font-semibold" : "")}>{order.requiredShipDate}</span>
      {overdue && order.overdueShipDays && <span className="ml-1 text-red-500">({order.overdueShipDays}d late)</span>}
    </div>
  )
}

function SlaCountdown({ deadline }: { deadline?: string }) {
  const h = hoursUntil(deadline)
  if (h === null) return <span className="text-muted-foreground text-xs">-</span>
  if (h < 0)  return <span className="text-xs font-semibold text-red-600">Expired</span>
  if (h < 12) return <span className="text-xs font-semibold text-red-600 flex items-center gap-1"><Timer className="h-3 w-3" />{h}h left</span>
  if (h < 24) return <span className="text-xs font-semibold text-orange-600 flex items-center gap-1"><Timer className="h-3 w-3" />{h}h left</span>
  return <span className="text-xs text-muted-foreground">{Math.floor(h / 24)}d left</span>
}

function TagBadges({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null
  return (
    <>
      {tags.map(tag => {
        const cfg = TAG_CONFIG[tag]
        if (!cfg) return null
        return (
          <span key={tag} className={cn("inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium", cfg.cls)}>
            {cfg.label}
          </span>
        )
      })}
    </>
  )
}

function RowActions({ order }: { order: Order }) {
  const actions: { label: string; variant?: "default" | "destructive" | "outline" }[] = []
  if (order.tags?.includes("import_error"))  actions.push({ label: "Fix & Retry", variant: "destructive" })
  if (order.tags?.includes("dc_sync_fail"))  actions.push({ label: "Resubmit ASN", variant: "outline" })
  if (order.tags?.includes("dc_rejected"))   actions.push({ label: "Relabel & Reship", variant: "destructive" })
  if (order.tags?.includes("alloc_failed"))  actions.push({ label: "Retry Allocation", variant: "outline" })
  if (order.status === "on_hold")            actions.push({ label: "Release", variant: "outline" })
  if (order.status === "exception")          actions.push({ label: "Retry Push", variant: "outline" })
  if (order.tags?.includes("sla_risk") || order.tags?.includes("overdue")) actions.push({ label: "Ship Now", variant: "default" })
  if (actions.length === 0) return null
  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      {actions.slice(0, 2).map(a => (
        <Button key={a.label} size="sm" variant={a.variant ?? "outline"} className="h-7 text-xs px-2 whitespace-nowrap">
          {a.label}
        </Button>
      ))}
    </div>
  )
}

// ── Expanded Row ───────────────────────────────────────────────────────────────
// 优化1: 仓库名和仓库地址分开为独立列
// 优化1: 列顺序调整 — 状态/问题优先，物流单据靠后（用户最关心的信息前置）

function ExpandedRow({ order }: { order: Order }) {
  const shippedUnits = order.shipments
    .filter(s => ["shipped", "in_transit", "dc_confirmed"].includes(s.status))
    .reduce((sum, s) => sum + s.itemCount, 0)

  return (
    <tr>
      <td colSpan={14} className="bg-muted/20 border-b">
        <div className="px-6 py-3 space-y-3 text-xs">
          {/* ── Compact info bar ── */}
          <div className="flex flex-wrap items-start gap-x-8 gap-y-2">
            {order.requiredDeliveryDate && (
              <div>
                <span className="text-muted-foreground">Deliver by: </span>
                <span className="font-medium">{order.requiredDeliveryDate}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Shipped: </span>
              <span className="font-medium">{shippedUnits} / {order.itemCount} units</span>
            </div>
            {order.channelNote && (
              <div className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded">
                <span className="font-medium text-yellow-800 dark:text-yellow-400">Note: </span>
                <span className="text-yellow-700 dark:text-yellow-300">{order.channelNote}</span>
              </div>
            )}
          </div>

          {/* ── Import Error — 订单数据问题 ── */}
          {order.importError && (
            <div className="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-red-700 dark:text-red-400">Import Error: </span>
                <span className="text-red-600 dark:text-red-300">{order.importError}</span>
              </div>
            </div>
          )}

          {/* ── Outbound Order Table — 列顺序重新设计 ── */}
          {order.shipments.length === 0 ? (
            <p className="text-muted-foreground italic py-2">{order.tags?.includes("import_error") ? "Order has data issues — fix and retry import" : "No outbound orders created yet"}</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">OB Order #</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Issue / Note</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Warehouse</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ship From</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ship To</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Ship Date</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Units</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Pallets</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Tracking / Docs</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Lot / SN</th>
                  </tr>
                </thead>
                <tbody>
                  {order.shipments.map((s, idx) => (
                    <tr key={s.id} className={cn(
                      "border-b last:border-0",
                      s.dcNote ? "bg-red-50/60 dark:bg-red-900/5" : idx % 2 === 1 ? "bg-muted/20" : ""
                    )}>

                      {/* 1. OB Order # — 最重要的标识 */}
                      <td className="px-3 py-2.5">
                        <button onClick={e => e.stopPropagation()}
                          className="font-medium text-primary hover:underline flex items-center gap-1 group">
                          {s.outboundOrderNo}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </button>
                      </td>
                      {/* 2. Status — 用户最关心当前状态 */}
                      <td className="px-3 py-2.5">
                        <Badge className={cn("text-[10px] font-normal border-0", SHIPMENT_STATUS_CLASS[s.status] ?? "bg-muted text-muted-foreground")}>
                          {SHIPMENT_STATUS_LABEL[s.status] ?? s.status}
                        </Badge>
                      </td>
                      {/* 3. Issue / Note — 有问题的前置，方便快速发现 */}
                      <td className="px-3 py-2.5 max-w-[240px]">
                        {s.dcNote ? (
                          <div className="space-y-1">
                            <div className="flex items-start gap-1 text-red-600 dark:text-red-400">
                              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                              <span className="leading-tight">{s.dcNote}</span>
                            </div>
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                              {order.tags?.includes("dc_sync_fail") && (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">Resubmit ASN</Button>
                              )}
                              {order.tags?.includes("dc_rejected") && (
                                <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2">Relabel & Reship</Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" /> OK
                          </span>
                        )}
                      </td>

                      {/* 4. Warehouse — 仓库名称（独立列） */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Warehouse className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-medium">{s.warehouseName}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{s.warehouseCode}</div>
                      </td>
                      {/* 5. Ship From — 仓库地址（独立列） */}
                      <td className="px-3 py-2.5">
                        {s.shipFrom ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <div className="text-[11px]">{s.shipFrom.city}, {s.shipFrom.state}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      {/* 6. Ship To — 收货地址（独立列） */}
                      <td className="px-3 py-2.5">
                        {s.shipTo ? (
                          <div>
                            <div className="font-medium text-[11px]">{s.shipTo.name}</div>
                            <div className="text-[10px] text-muted-foreground">{s.shipTo.city}, {s.shipTo.state}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-[11px]">{order.shipToAddress.name}</div>
                            <div className="text-[10px] text-muted-foreground">{order.shipToAddress.city}, {order.shipToAddress.state}</div>
                          </div>
                        )}
                      </td>

                      {/* 7. Ship Date */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {s.requiredShipDate ? (
                          <span className="font-medium">{s.requiredShipDate}</span>
                        ) : order.requiredShipDate ? (
                          <span className="text-muted-foreground">{order.requiredShipDate}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      {/* 8. Units */}
                      <td className="px-3 py-2.5 text-right font-medium">{s.itemCount}</td>
                      {/* 9. Pallets */}
                      <td className="px-3 py-2.5 text-right">
                        {s.palletCount ? <span className="font-medium">{s.palletCount}</span> : <span className="text-muted-foreground">-</span>}
                      </td>

                      {/* 10. Tracking / Docs — ASN / BOL / Tracking 合并 */}
                      <td className="px-3 py-2.5">
                        <div className="space-y-0.5">
                          {s.asnNo && (
                            <div>
                              <span className="text-muted-foreground">ASN </span>
                              <button onClick={e => e.stopPropagation()} className="text-primary hover:underline">{s.asnNo}</button>
                            </div>
                          )}
                          {s.bolNo && (
                            <div>
                              <span className="text-muted-foreground">BOL </span>
                              <span className="font-mono">{s.bolNo}</span>
                            </div>
                          )}
                          {s.proNo && (
                            <div>
                              <span className="text-muted-foreground">PRO </span>
                              <span className="font-mono">{s.proNo}</span>
                            </div>
                          )}
                          {s.trackingNo ? (
                            <div>
                              <span className="text-muted-foreground">{s.carrier} </span>
                              <button onClick={e => e.stopPropagation()} className="text-primary hover:underline font-mono">{s.trackingNo}</button>
                              {s.estimatedDelivery && <div className="text-muted-foreground">ETA {s.estimatedDelivery}</div>}
                              {s.dcConfirmedAt && (
                                <div className="text-green-600 dark:text-green-400">
                                  DC rcvd {s.dcConfirmedAt} — {s.dcReceivedQty} units
                                </div>
                              )}
                            </div>
                          ) : (!s.asnNo && !s.bolNo && !s.proNo) ? (
                            <span className="text-muted-foreground">-</span>
                          ) : null}
                        </div>
                      </td>

                      {/* 11. Lot / SN */}
                      <td className="px-3 py-2.5 max-w-[180px]">
                        <div className="space-y-1">
                          {s.lotNumbers && s.lotNumbers.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[10px] text-muted-foreground">Lot:</span>
                              {s.lotNumbers.slice(0, 2).map(lot => (
                                <span key={lot} className="text-[10px] font-mono px-1 py-0.5 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 rounded">{lot}</span>
                              ))}
                              {s.lotNumbers.length > 2 && <span className="text-[10px] text-muted-foreground">+{s.lotNumbers.length - 2}</span>}
                            </div>
                          )}
                          {s.serialNumbers && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">SN:</span>
                              <span className="text-[10px] font-medium">{s.serialNumbers.total} pcs</span>
                              {s.serialNumbers.sample && s.serialNumbers.sample.length > 0 && (
                                <span className="text-[10px] font-mono text-muted-foreground">({s.serialNumbers.sample.slice(0, 2).join(", ")}{s.serialNumbers.total > 2 ? "…" : ""})</span>
                              )}
                            </div>
                          )}
                          {!s.lotNumbers?.length && !s.serialNumbers && <span className="text-muted-foreground">-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Inline Stats Bar — 替代 StatCards，一行搞定 ────────────────────────────────

// ── Stats Cards — 4 张紧凑卡片，数字大、一眼能看 ──────────────────────────────

function StatsCards({ orders }: { orders: Order[] }) {
  const [showAllSkus, setShowAllSkus] = React.useState(false)
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(0)
  const today = new Date().toISOString().slice(0, 10)

  // ── Card 1: Today's Fulfillment — 今日应发 / 已发 / 履约率 ──
  const dueToday = orders.filter(o =>
    o.requiredShipDate === today && !["cancelled"].includes(o.status)
  )
  const shippedToday = dueToday.filter(o => o.status === "shipped")
  const fulfillRate = dueToday.length > 0 ? Math.round((shippedToday.length / dueToday.length) * 100) : 100

  // ── Card 2: Order Volume — 总单量 / units / GMV + 渠道分布 ──
  const totalValue = orders.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)
  const totalUnits = orders.reduce((s, o) => s + o.itemCount, 0)
  const newToday = orders.filter(o => o.createdAt === today).length

  // 渠道分布
  const channelCounts: { ch: ChannelType; count: number }[] = (["amazon", "walmart", "shopify", "tiktok", "shein"] as ChannelType[])
    .map(ch => ({ ch, count: orders.filter(o => o.channel === ch).length }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
  const CHANNEL_BAR_COLOR: Record<ChannelType, string> = {
    amazon: "bg-orange-400", walmart: "bg-blue-500", shopify: "bg-green-500", tiktok: "bg-pink-500", shein: "bg-purple-500",
  }

  // ── Card 3: Avg Fulfillment Speed — imported→shipped 平均天数 ──
  const shippedOrders = orders.filter(o => o.status === "shipped" && o.shipments.some(s => s.shippedAt))
  const avgDays = shippedOrders.length > 0
    ? shippedOrders.reduce((sum, o) => {
        const shipped = o.shipments.find(s => s.shippedAt)
        if (!shipped?.shippedAt) return sum
        const days = (new Date(shipped.shippedAt).getTime() - new Date(o.createdAt).getTime()) / 86400000
        return sum + Math.max(0, days)
      }, 0) / shippedOrders.length
    : 0

  // ── Card 4: Warehouse Health — 各仓问题数 + 缺货 SKU ──
  // 从 shipments 提取仓库维度的问题
  const whIssues: Record<string, { name: string; stalled: number; total: number }> = {}
  for (const o of orders) {
    for (const s of o.shipments) {
      if (!whIssues[s.warehouseCode]) whIssues[s.warehouseCode] = { name: s.warehouseName, stalled: 0, total: 0 }
      whIssues[s.warehouseCode].total++
      // 停滞: picking/packed 超过 48h
      if (["picking", "packed"].includes(s.status) && s.createdAt &&
          (Date.now() - new Date(s.createdAt).getTime()) > 48 * 3600000) {
        whIssues[s.warehouseCode].stalled++
      }
    }
  }
  // alloc_failed 的 SKU 去重 — 收集 sku + name
  const allocFailedOrders = orders.filter(o => o.tags?.includes("alloc_failed"))
  const oosSkuMap = new Map<string, string>() // sku → name
  for (const o of allocFailedOrders) {
    for (const item of o.items) {
      if (!oosSkuMap.has(item.sku)) oosSkuMap.set(item.sku, item.name)
    }
  }
  const oosSkus = oosSkuMap
  // 问题最多的仓
  const worstWh = Object.values(whIssues).sort((a, b) => b.stalled - a.stalled)[0]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Today's Fulfillment */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Today&apos;s Fulfillment</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        {dueToday.length > 0 ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{shippedToday.length}<span className="text-base font-normal text-muted-foreground">/{dueToday.length}</span></span>
              <span className={cn("text-sm font-semibold", fulfillRate >= 80 ? "text-green-600 dark:text-green-400" : fulfillRate >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400")}>
                {fulfillRate}%
              </span>
            </div>
            <Progress value={fulfillRate} className={cn("h-1.5 mt-2", fulfillRate >= 80 ? "[&>div]:bg-green-500" : fulfillRate >= 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500")} />
            <p className="text-xs text-muted-foreground mt-1.5">{dueToday.length - shippedToday.length} remaining to ship</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">All clear</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">No shipments due today</p>
          </>
        )}
      </div>

      {/* Card 2: Order Volume + Channel Mix */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Order Volume</span>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{orders.length}</span>
          <span className="text-sm text-muted-foreground">orders</span>
          {newToday > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">+{newToday} today</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{totalUnits.toLocaleString()} units</span>
          <span className="text-foreground font-medium">${fmt(totalValue)}</span>
        </div>
        {/* Channel distribution stacked bar */}
        {channelCounts.length > 1 && (
          <div className="mt-2.5">
            <div className="flex h-1.5 rounded-full overflow-hidden">
              {channelCounts.map(({ ch, count }) => (
                <div key={ch} className={cn("h-full", CHANNEL_BAR_COLOR[ch])} style={{ width: `${(count / orders.length) * 100}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {channelCounts.map(({ ch, count }) => (
                <span key={ch} className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={cn("h-1.5 w-1.5 rounded-full", CHANNEL_BAR_COLOR[ch])} />
                  {CHANNEL_LABEL[ch]} {count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card 3: Avg Fulfillment Speed */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Avg Fulfillment</span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{avgDays > 0 ? avgDays.toFixed(1) : "—"}</span>
          <span className="text-sm text-muted-foreground">days</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Order to ship · {shippedOrders.length} shipped orders
        </p>
      </div>

      {/* Card 4: Inventory & Warehouse */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Inventory Risk</span>
          <Warehouse className="h-4 w-4 text-muted-foreground" />
        </div>
        {oosSkus.size > 0 || (worstWh && worstWh.stalled > 0) ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{oosSkus.size}</span>
              <span className="text-sm text-muted-foreground">SKUs short</span>
              <span className="text-xs text-muted-foreground ml-1">· {allocFailedOrders.length} orders blocked</span>
            </div>
            {/* 缺货 SKU 列表 — 默认3个，可展开 */}
            <div className="mt-2 space-y-0.5">
              {[...oosSkus.entries()].slice(0, showAllSkus ? undefined : 3).map(([sku, name]) => (
                <div key={sku} className="flex items-center gap-1.5 text-xs">
                  <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400">{sku}</span>
                  <span className="text-muted-foreground truncate">{name}</span>
                </div>
              ))}
              {oosSkus.size > 3 && (
                <button
                  onClick={() => setShowAllSkus(!showAllSkus)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {showAllSkus ? "Show less" : `+${oosSkus.size - 3} more SKUs`}
                </button>
              )}
            </div>
            {worstWh && worstWh.stalled > 0 && (
              <div className="mt-1.5 text-xs text-orange-600 dark:text-orange-400">
                ⚠ {worstWh.name}: {worstWh.stalled} stalled
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">No stock issues detected</p>
          </>
        )}
      </div>
    </div>
  )
}
// ── Collapsible Alert Bar — 默认一行摘要，点击展开详情 ──────────────────────────

interface ActionItem {
  icon: React.ReactNode; label: string; desc: string; count: number
  orders?: string[]; channels?: string[]
  variant: "danger" | "warn" | "info"; onClick: () => void
}

function AlertBar({ items }: { items: ActionItem[] }) {
  const [open, setOpen] = React.useState(false)
  const active = items.filter(i => i.count > 0)
  if (active.length === 0) return null

  const dangerItems = active.filter(i => i.variant === "danger")
  const warnItems = active.filter(i => i.variant === "warn")
  const infoItems = active.filter(i => i.variant === "info")
  const totalCount = active.reduce((s, i) => s + i.count, 0)

  const variantCls = {
    danger: "border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/10",
    warn:   "border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/10",
    info:   "border-blue-200 bg-blue-50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/10",
  }
  const textCls = {
    danger: "text-red-700 dark:text-red-400",
    warn:   "text-yellow-700 dark:text-yellow-400",
    info:   "text-blue-700 dark:text-blue-400",
  }
  const countCls = {
    danger: "bg-red-600 text-white dark:bg-red-500",
    warn:   "bg-yellow-600 text-white dark:bg-yellow-500",
    info:   "bg-blue-600 text-white dark:bg-blue-500",
  }
  const pillCls = {
    danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    warn:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    info:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 摘要行 — 始终可见 */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        <span className="text-sm font-medium">{totalCount} issues</span>
        <div className="flex items-center gap-1.5 flex-wrap flex-1">
          {active.map((item, i) => (
            <span key={i} className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full", pillCls[item.variant])}>
              {item.label}
              <span className="font-bold">{item.count}</span>
            </span>
          ))}
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </button>

      {/* 展开详情 */}
      {open && (
        <div className="px-4 py-3 border-t bg-card">
          {dangerItems.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1.5">Immediate Action</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {dangerItems.map((item, i) => (
                  <AlertDetailCard key={i} item={item} variantCls={variantCls} textCls={textCls} countCls={countCls} />
                ))}
              </div>
            </div>
          )}
          {warnItems.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1.5">Follow Up</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {warnItems.map((item, i) => (
                  <AlertDetailCard key={i} item={item} variantCls={variantCls} textCls={textCls} countCls={countCls} />
                ))}
              </div>
            </div>
          )}
          {infoItems.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">Monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {infoItems.map((item, i) => (
                  <AlertDetailCard key={i} item={item} variantCls={variantCls} textCls={textCls} countCls={countCls} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AlertDetailCard({ item, variantCls, textCls, countCls }: {
  item: ActionItem
  variantCls: Record<string, string>; textCls: Record<string, string>; countCls: Record<string, string>
}) {
  return (
    <button onClick={item.onClick}
      className={cn("flex items-start gap-2.5 text-left px-3 py-2 rounded-md border transition-colors cursor-pointer", variantCls[item.variant])}>
      <span className={cn("mt-0.5 shrink-0", textCls[item.variant])}>{item.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn("text-xs font-semibold", textCls[item.variant])}>{item.label}</span>
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none", countCls[item.variant])}>{item.count}</span>
        </div>
        <p className={cn("text-[11px] mt-0.5 leading-tight opacity-80", textCls[item.variant])}>{item.desc}</p>
        {item.orders && item.orders.length > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {item.orders.map(no => (
              <span key={no} className="text-[10px] font-mono px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">{no}</span>
            ))}
            {item.count > (item.orders?.length ?? 0) && (
              <span className="text-[10px] opacity-60">+{item.count - (item.orders?.length ?? 0)} more</span>
            )}
          </div>
        )}
      </div>
      <ArrowRight className={cn("h-3 w-3 mt-1 shrink-0 opacity-40", textCls[item.variant])} />
    </button>
  )
}

// ── Unified Order Table ────────────────────────────────────────────────────────
// 优化2: 主列表列顺序调整 — 状态和操作前移，让商户一眼看到哪些单需要处理

function OrderTable({ orders, expanded, onToggle }: { orders: Order[]; expanded: Set<string>; onToggle: (id: string) => void }) {
  if (orders.length === 0) return <EmptyState />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[1400px]">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="w-8 p-3" />
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Order #</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Status</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Channel</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Channel Order #</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">PO #</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Ship To</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Ship By / SLA</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Fulfillment</th>
            <th className="text-right p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">SKU / Units</th>
            <th className="text-right p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Amount</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Created</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const isExpanded = expanded.has(order.id)
            const hasIssue = order.status === "exception" || (order.tags && order.tags.length > 0)
            const shippedShipments = order.shipments.filter(s => ["shipped", "in_transit", "dc_confirmed"].includes(s.status))
            const shippedUnits = shippedShipments.reduce((sum, s) => sum + s.itemCount, 0)

            return (
              <React.Fragment key={order.id}>
                <tr
                  className={cn("border-b hover:bg-muted/30 cursor-pointer transition-colors", hasIssue && "border-l-2 border-l-red-500")}
                  onClick={() => onToggle(order.id)}
                >
                  <td className="p-3 text-muted-foreground">
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </td>

                  {/* Order # */}
                  <td className="p-3">
                    <div className="font-medium text-xs whitespace-nowrap">{order.orderNo}</div>
                    {order.refOrderNo && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">Ref: {order.refOrderNo}</div>
                    )}
                  </td>

                  {/* Status — 前移到第2列，商户最关心 */}
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge className={cn("text-[10px] font-normal border-0", STATUS_CLASS[order.status])}>
                        {STATUS_LABEL[order.status]}
                      </Badge>
                      <TagBadges tags={order.tags} />
                    </div>
                  </td>

                  {/* Channel */}
                  <td className="p-3">
                    <Badge className={cn("text-[10px] font-normal border-0", CHANNEL_COLOR[order.channel])}>
                      {CHANNEL_LABEL[order.channel]}
                    </Badge>
                    {order.sourceChannel && (
                      <div className="text-[10px] text-muted-foreground mt-0.5">via {order.sourceChannel}</div>
                    )}
                  </td>

                  {/* Channel Order # */}
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                    {order.externalOrderNo ?? "-"}
                  </td>

                  {/* PO # */}
                  <td className="p-3 text-xs whitespace-nowrap">
                    {order.poNo ? <span className="font-medium">{order.poNo}</span> : <span className="text-muted-foreground">-</span>}
                  </td>

                  {/* Ship To */}
                  <td className="p-3">
                    <div className="text-xs font-medium whitespace-nowrap">
                      {isB2B(order.channel) ? order.shipToAddress.name : order.customer}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                      {order.shipToAddress.city}, {order.shipToAddress.state}
                    </div>
                  </td>

                  {/* Ship By / SLA — 前移，时效性信息更重要 */}
                  <td className="p-3 whitespace-nowrap">
                    {order.slaDeadline
                      ? <SlaCountdown deadline={order.slaDeadline} />
                      : shipWindowLabel(order)
                    }
                  </td>

                  {/* Fulfillment — 前移到金额前面 */}
                  <td className="p-3">
                    {order.shipments.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                        <Truck className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium">{shippedShipments.length}</span>
                        <span className="text-muted-foreground">/ {order.shipments.length}</span>
                        {/* 新增: 显示已发货件数占比 */}
                        {order.itemCount > 0 && (
                          <span className="text-[10px] text-muted-foreground">({Math.round(shippedUnits / order.itemCount * 100)}%)</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* SKU / Units */}
                  <td className="p-3 text-right text-xs whitespace-nowrap">
                    <span className="font-medium">{order.skuCount}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span>{order.itemCount}</span>
                  </td>

                  {/* Amount */}
                  <td className="p-3 text-right text-xs font-medium whitespace-nowrap">
                    {order.currency} {order.totalAmount}
                  </td>

                  {/* Created — 移到最后，不是最紧急的信息 */}
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{order.createdAt}</td>

                  {/* Actions */}
                  <td className="p-3"><RowActions order={order} /></td>
                </tr>
                {isExpanded && <ExpandedRow order={order} />}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <Package className="h-8 w-8 mx-auto mb-3 opacity-30" />
      No orders found
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────────
// ── Tab 设计: 按订单状态切换，需要处理的提醒额外展示 ──────────────────────────
// Tab 对应真实订单状态: All / Imported / On Hold / Allocated / Deallocated / Warehouse Processing / Shipped / Cancelled / Exception
// 需要处理的提醒（overdue、dc_rejected、sla_risk 等）通过 ActionRequiredBar 额外展示

type StatusTab = OrderStatus | "all"

const STATUS_TAB_CONFIG: { value: StatusTab; label: string; filter: (o: Order) => boolean }[] = [
  { value: "all", label: "All", filter: () => true },
  { value: "imported", label: "Imported", filter: (o) => o.status === "imported" },
  { value: "on_hold", label: "On Hold", filter: (o) => o.status === "on_hold" },
  { value: "allocated", label: "Allocated", filter: (o) => o.status === "allocated" },
  { value: "deallocated", label: "Deallocated", filter: (o) => o.status === "deallocated" },
  { value: "warehouse_processing", label: "Processing", filter: (o) => o.status === "warehouse_processing" },
  { value: "shipped", label: "Shipped", filter: (o) => o.status === "shipped" },
  { value: "cancelled", label: "Cancelled", filter: (o) => o.status === "cancelled" },
  { value: "exception", label: "Exception", filter: (o) => o.status === "exception" },
]

interface OrderListTableProps {
  orders: Order[]
  title?: string
  description?: string
}

/** 用于 ActionRequiredBar 点击后精确过滤的 tag 类型 */
type AlertFilter = OrderTag | "wh_stalled_computed" | "partial_ship_computed" | "stale_import" | null

export function OrderListTable({ orders, title, description }: OrderListTableProps) {
  const [activeTab, setActiveTab] = React.useState<StatusTab>("all")
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<ChannelType | "all">("all")
  const [alertFilter, setAlertFilter] = React.useState<AlertFilter>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])

  function toggleExpand(id: string) {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  // 计算每个 tab 的数量
  const tabCounts = {} as Record<StatusTab, number>
  for (const tab of STATUS_TAB_CONFIG) {
    tabCounts[tab.value] = orders.filter(tab.filter).length
  }

  // Channel 选项（只显示有数据的）
  const channelsWithData = (["amazon", "walmart", "shopify", "tiktok", "shein"] as ChannelType[])
    .filter(ch => orders.some(o => o.channel === ch))

  // Unique customers for filter options
  const uniqueCustomers = React.useMemo(() =>
    [...new Set(orders.map(o => o.customer))].sort(),
    [orders]
  )

  // Filter configs — 订单号, 渠道单号, 关联单号, Customer, Channel, Date
  const filterConfigs: FilterConfig[] = React.useMemo(() => [
    {
      id: "orderNo",
      label: "Order #",
      type: "batch" as const,
      placeholder: "Enter order numbers, separated by comma, space or newline..."
    },
    {
      id: "externalOrderNo",
      label: "Channel Order #",
      type: "batch" as const,
      placeholder: "Enter channel order numbers, separated by comma, space or newline..."
    },
    {
      id: "refOrderNo",
      label: "Ref Order #",
      type: "batch" as const,
      placeholder: "Enter reference order numbers, separated by comma, space or newline..."
    },
    {
      id: "customer",
      label: "Customer",
      type: "multiple" as const,
      options: uniqueCustomers.map(c => ({ id: c, label: c, value: c })),
    },
    {
      id: "channel",
      label: "Channel",
      type: "multiple" as const,
      options: channelsWithData.map(ch => ({ id: ch, label: CHANNEL_LABEL[ch], value: ch })),
    },
    {
      id: "date",
      label: "Created Date",
      type: "multiple" as const,
      options: [
        { id: "today", label: "Today", value: "today" },
        { id: "yesterday", label: "Yesterday", value: "yesterday" },
        { id: "last7days", label: "Last 7 Days", value: "last7days" },
        { id: "last30days", label: "Last 30 Days", value: "last30days" },
        { id: "last90days", label: "Last 90 Days", value: "last90days" },
      ],
    },
  ], [uniqueCustomers, channelsWithData])

  // 过滤逻辑: tab → channel → alertFilter → search → activeFilters
  const tabConfig = STATUS_TAB_CONFIG.find(t => t.value === activeTab)!
  const tabFiltered = orders.filter(tabConfig.filter)
  const channelFiltered = channelFilter === "all" ? tabFiltered : tabFiltered.filter(o => o.channel === channelFilter)

  // alertFilter: 精确过滤到问题订单集合
  const STALL_HOURS_FILTER = 48
  const IMPORT_STALE_HOURS_FILTER = 24
  const alertFiltered = alertFilter === null ? channelFiltered : channelFiltered.filter(o => {
    switch (alertFilter) {
      case "import_error": return o.tags?.includes("import_error")
      case "overdue": return o.tags?.includes("overdue")
      case "dc_sync_fail": return o.tags?.includes("dc_sync_fail")
      case "dc_rejected": return o.tags?.includes("dc_rejected")
      case "sla_risk": return o.tags?.includes("sla_risk")
      case "wh_stalled_computed":
        return o.status === "warehouse_processing" && o.shipments.some(s =>
          ["picking", "packed"].includes(s.status) && s.createdAt &&
          (Date.now() - new Date(s.createdAt).getTime()) > STALL_HOURS_FILTER * 3600000
        )
      case "partial_ship_computed":
        return o.tags?.includes("partial_ship") ||
          (["warehouse_processing", "shipped"].includes(o.status) && o.shipments.length > 1 &&
           o.shipments.some(s => ["shipped", "in_transit", "dc_confirmed"].includes(s.status)) &&
           o.shipments.some(s => ["picking", "packed"].includes(s.status)))
      case "stale_import":
        return o.status === "imported" && (Date.now() - new Date(o.createdAt).getTime()) > IMPORT_STALE_HOURS_FILTER * 3600000
      default: return o.tags?.includes(alertFilter as OrderTag)
    }
  })

  // Apply search
  const searchFiltered = alertFiltered.filter(o => {
    const q = search.toLowerCase()
    return !q || o.orderNo.toLowerCase().includes(q) ||
      (o.poNo?.toLowerCase().includes(q)) ||
      (o.externalOrderNo?.toLowerCase().includes(q)) || o.customer.toLowerCase().includes(q)
  })

  // Apply active filters from FilterBar
  const filtered = React.useMemo(() => {
    if (activeFilters.length === 0) return searchFiltered

    let result = searchFiltered

    // Group filters by filterId
    const filterGroups: Record<string, ActiveFilter[]> = {}
    activeFilters.forEach(f => {
      if (!filterGroups[f.filterId]) filterGroups[f.filterId] = []
      filterGroups[f.filterId].push(f)
    })

    // Apply each filter group (AND between groups, OR within group)
    Object.entries(filterGroups).forEach(([filterId, filters]) => {
      if (filterId === "orderNo") {
        const searchValues = filters.flatMap(f => f.optionValue.split(",").map(v => v.trim().toLowerCase()).filter(Boolean))
        if (searchValues.length > 0) {
          result = result.filter(o => searchValues.some(v => o.orderNo.toLowerCase().includes(v)))
        }
      } else if (filterId === "externalOrderNo") {
        const searchValues = filters.flatMap(f => f.optionValue.split(",").map(v => v.trim().toLowerCase()).filter(Boolean))
        if (searchValues.length > 0) {
          result = result.filter(o => searchValues.some(v => (o.externalOrderNo || "").toLowerCase().includes(v)))
        }
      } else if (filterId === "refOrderNo") {
        const searchValues = filters.flatMap(f => f.optionValue.split(",").map(v => v.trim().toLowerCase()).filter(Boolean))
        if (searchValues.length > 0) {
          result = result.filter(o => searchValues.some(v => (o.refOrderNo || "").toLowerCase().includes(v)))
        }
      } else if (filterId === "customer") {
        const values = filters.map(f => f.optionValue)
        result = result.filter(o => values.includes(o.customer))
      } else if (filterId === "channel") {
        const values = filters.map(f => f.optionValue)
        result = result.filter(o => values.includes(o.channel))
      } else if (filterId === "date") {
        const values = filters.map(f => f.optionValue)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        result = result.filter(o => {
          const orderDate = new Date(o.createdAt)
          return values.some(v => {
            switch (v) {
              case "today": return orderDate >= today
              case "yesterday": { const y = new Date(today); y.setDate(y.getDate() - 1); return orderDate >= y && orderDate < today }
              case "last7days": { const d = new Date(today); d.setDate(d.getDate() - 7); return orderDate >= d }
              case "last30days": { const d = new Date(today); d.setDate(d.getDate() - 30); return orderDate >= d }
              case "last90days": { const d = new Date(today); d.setDate(d.getDate() - 90); return orderDate >= d }
              default: return true
            }
          })
        })
      }
    })

    return result
  }, [searchFiltered, activeFilters])

  // ── 提醒系统 — 覆盖履约全生命周期风险点，按"商户该做什么"分组 ──────────
  // 🔴 立即处理: 订单完全卡住或正在亏钱
  // 🟡 尽快跟进: 再不管就要出事
  // 🔵 需要决策: 等商户拍板

  // --- 🔴 立即处理 ---

  // 1. 订单数据问题 — API对接进来但缺SKU/缺地址/格式错误，需要修复后重新导入
  const importErrorOrders = orders.filter(o => o.tags?.includes("import_error"))

  // 2. 发货逾期 — 已超过 required ship date，三方可能已经在罚款
  const overdueOrders = orders.filter(o => o.tags?.includes("overdue"))
  const maxOverdueDays = Math.max(...overdueOrders.map(o => o.overdueShipDays ?? 0), 0)
  const overdueValue = overdueOrders.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)

  // ASN 回传失败 — 货发了但三方没收到发货确认，会被 chargeback
  const asnFailOrders = orders.filter(o => o.tags?.includes("dc_sync_fail"))

  // DC 拒收 — 货到了三方仓被退回，需要重新贴标重发
  const dcRejectedOrders = orders.filter(o => o.tags?.includes("dc_rejected"))

  // --- 🟡 尽快跟进 ---

  // SLA 即将到期 — 平台时效要求快到了
  const slaRiskOrders = orders.filter(o => o.tags?.includes("sla_risk"))
  const minSlaHours = Math.min(...slaRiskOrders.map(o => hoursUntil(o.slaDeadline) ?? Infinity))

  // 7. 仓库处理停滞 — 出库单已推给 WMS 但 picking/packed 超过 48h 没发出
  const STALL_HOURS = 48
  const whStalledOrders = orders.filter(o =>
    o.status === "warehouse_processing" &&
    o.shipments.some(s =>
      ["picking", "packed"].includes(s.status) &&
      s.createdAt &&
      (Date.now() - new Date(s.createdAt).getTime()) > STALL_HOURS * 3600000
    )
  )
  const maxStallDays = whStalledOrders.length > 0
    ? Math.max(...whStalledOrders.flatMap(o => o.shipments.filter(s => s.createdAt && ["picking", "packed"].includes(s.status)).map(s => Math.floor((Date.now() - new Date(s.createdAt!).getTime()) / 86400000))))
    : 0

  // 9. 部分发货卡住 — 订单有多个出库单，部分已发但剩余的卡在仓库
  const partialShipOrders = orders.filter(o =>
    o.tags?.includes("partial_ship") ||
    (["warehouse_processing", "shipped"].includes(o.status) &&
     o.shipments.length > 1 &&
     o.shipments.some(s => ["shipped", "in_transit", "dc_confirmed"].includes(s.status)) &&
     o.shipments.some(s => ["picking", "packed"].includes(s.status)))
  )

  // 10. 新单未处理 — imported 超过 24h 还没分配库存
  const IMPORT_STALE_HOURS = 24
  const staleImportOrders = orders.filter(o =>
    o.status === "imported" &&
    (Date.now() - new Date(o.createdAt).getTime()) > IMPORT_STALE_HOURS * 3600000
  )

  // 辅助: 提取渠道列表
  const chOf = (list: Order[]) => [...new Set(list.map(o => CHANNEL_LABEL[o.channel]))]
  const nosOf = (list: Order[], max = 3) => list.slice(0, max).map(o => o.orderNo)
  const valOf = (list: Order[]) => list.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)
  const fmtVal = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v.toFixed(0)}`

  /** 点击 alert 卡片: 切到最相关的 tab + 设置精确过滤 */
  const alertClick = (tab: StatusTab, filter: AlertFilter) => () => {
    setActiveTab(tab); setChannelFilter("all"); setAlertFilter(filter)
  }

  const actionItems: ActionItem[] = [
    // 🔴 立即处理 — 订单完全卡住或正在亏钱
    {
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: "Import Error",
      desc: `Order data issues — missing SKU, invalid address, or API format error. Fix data and re-import.`,
      count: importErrorOrders.length, channels: chOf(importErrorOrders), orders: nosOf(importErrorOrders),
      variant: "danger", onClick: alertClick("all", "import_error"),
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: `Overdue${maxOverdueDays > 0 ? ` ${maxOverdueDays}d` : ""}`,
      desc: `Past ship date — penalties accruing. ${fmtVal(overdueValue)} at risk. Contact warehouse to ship today.`,
      count: overdueOrders.length, channels: chOf(overdueOrders), orders: nosOf(overdueOrders),
      variant: "danger", onClick: alertClick("all", "overdue"),
    },
    {
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      label: "ASN Failed",
      desc: `Shipped but retailer has no confirmation. Resubmit ASN now to avoid chargebacks.`,
      count: asnFailOrders.length, channels: chOf(asnFailOrders), orders: nosOf(asnFailOrders),
      variant: "danger", onClick: alertClick("shipped", "dc_sync_fail"),
    },
    {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: "DC Rejected",
      desc: `Retailer refused delivery — relabel and reship. ${fmtVal(valOf(dcRejectedOrders))} blocked.`,
      count: dcRejectedOrders.length, channels: chOf(dcRejectedOrders), orders: nosOf(dcRejectedOrders),
      variant: "danger", onClick: alertClick("shipped", "dc_rejected"),
    },
    // 🟡 尽快跟进 — 再不管就要出事
    {
      icon: <Timer className="h-3.5 w-3.5" />,
      label: `SLA${minSlaHours < Infinity ? ` ${minSlaHours < 24 ? `${minSlaHours}h` : `${Math.floor(minSlaHours / 24)}d`}` : ""}`,
      desc: `Platform deadline approaching — prioritize these or face late-ship penalties.`,
      count: slaRiskOrders.length, channels: chOf(slaRiskOrders), orders: nosOf(slaRiskOrders),
      variant: "warn", onClick: alertClick("all", "sla_risk"),
    },
    {
      icon: <Warehouse className="h-3.5 w-3.5" />,
      label: `WH Stalled${maxStallDays > 0 ? ` ${maxStallDays}d` : ""}`,
      desc: `Outbound order stuck at warehouse (picking/packing). Contact warehouse to expedite.`,
      count: whStalledOrders.length, channels: chOf(whStalledOrders), orders: nosOf(whStalledOrders),
      variant: "warn", onClick: alertClick("warehouse_processing", "wh_stalled_computed"),
    },
    {
      icon: <Truck className="h-3.5 w-3.5" />,
      label: "Partial Ship",
      desc: `Some shipments sent, rest stuck in warehouse. Remaining items may miss delivery window.`,
      count: partialShipOrders.length, channels: chOf(partialShipOrders), orders: nosOf(partialShipOrders),
      variant: "warn", onClick: alertClick("all", "partial_ship_computed"),
    },
    // 🔵 需要关注
    {
      icon: <Package className="h-3.5 w-3.5" />,
      label: "Unprocessed",
      desc: `Imported 24h+ ago, not yet allocated. Assign inventory to start fulfillment.`,
      count: staleImportOrders.length, channels: chOf(staleImportOrders), orders: nosOf(staleImportOrders),
      variant: "info", onClick: alertClick("imported", "stale_import"),
    },
  ]
  const totalActionCount = actionItems.reduce((s, i) => s + i.count, 0)

  const totalValue = filtered.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)
  const pendingCount = filtered.filter(o => !["shipped", "cancelled"].includes(o.status)).length

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div>
          {title && <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}

      <StatsCards orders={orders} />

      {/* Status Tabs — 按订单状态切换 */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as StatusTab); setChannelFilter("all"); setAlertFilter(null) }}>
        <TabsList className="h-9">
          {STATUS_TAB_CONFIG.map(tab => {
            const count = tabCounts[tab.value]
            const isException = tab.value === "exception"
            const hasExceptions = isException && count > 0 && activeTab !== "exception"
            return (
              <TabsTrigger key={tab.value} value={tab.value} className={cn("text-xs gap-1.5", hasExceptions && "text-red-600 dark:text-red-400")}>
                {tab.label}
                {count > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 text-[10px] font-medium",
                    isException && activeTab !== "exception"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>

      {/* Alert Bar — 可折叠，默认收起只显示 pill 摘要 */}
      {totalActionCount > 0 && (
        <AlertBar items={actionItems} />
      )}

      {/* Filter Bar — 搜索 + 筛选条件 (订单号/渠道单号/关联单号/Customer/Channel/Date) */}
      <FilterBar
        searchPlaceholder="Search order #, PO #, channel order #, customer..."
        onSearchChange={setSearch}
        filters={filterConfigs}
        onFiltersChange={setActiveFilters}
      />

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
              {filter.optionLabel}
              <button
                onClick={() => setActiveFilters(activeFilters.filter((_, i) => i !== index))}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5 transition-colors"
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
            Clear all
          </Button>
        </div>
      )}

      {/* Alert filter indicator */}
      {alertFilter && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlertFilter(null)}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-md border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <AlertTriangle className="h-3 w-3" />
            Filtered by alert
            <XCircle className="h-3 w-3 opacity-60" />
          </button>
        </div>
      )}

      {/* Summary stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{filtered.length}</span> orders</span>
        <span><span className="font-semibold text-foreground">{pendingCount}</span> pending</span>
        <span>USD <span className="font-semibold text-foreground">{totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <OrderTable orders={filtered} expanded={expanded} onToggle={toggleExpand} />
      </div>
    </div>
  )
}
