"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronDown, ChevronRight, AlertTriangle, Clock, XCircle,
  RefreshCw, CheckCircle2, AlertCircle, Timer, Package, ArrowRight,
  Truck, ExternalLink, MapPin, Warehouse, BarChart3, TrendingUp, X,
  ChevronUp, Eye, EyeOff, Phone, ArrowRightLeft, Wrench, FileSearch,
  Link2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { useI18n } from "@/components/i18n-provider"

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

const STATUS_LABEL_KEY: Record<OrderStatus, string> = {
  imported: "cpStatusImportedLabel", on_hold: "cpStatusOnHoldLabel", allocated: "cpStatusAllocatedLabel", deallocated: "cpStatusDeallocatedLabel",
  warehouse_processing: "cpStatusWarehouseProcessingLabel", shipped: "cpStatusShippedLabel", cancelled: "cpStatusCancelledLabel", exception: "cpStatusExceptionLabel",
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
const TAG_CONFIG: Record<string, { labelKey: string; cls: string }> = {
  overdue:       { labelKey: "cpTagOverdue",       cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  dc_sync_fail:  { labelKey: "cpTagSyncFail",    cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  dc_rejected:   { labelKey: "cpTagDcRejected",  cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  dc_short:      { labelKey: "cpTagDcShort",     cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" },
  urgent:        { labelKey: "cpTagUrgent",        cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  sla_risk:      { labelKey: "cpTagSlaRisk",     cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  wh_stalled:    { labelKey: "cpTagWhStalled",   cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" },
  alloc_failed:  { labelKey: "cpTagAllocFailed", cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
  partial_ship:  { labelKey: "cpTagPartialShip", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" },
  import_error:  { labelKey: "cpTagImportError", cls: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" },
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
const SHIPMENT_STATUS_LABEL_KEY: Record<string, string> = {
  picking: "cpShipmentPicking", packed: "cpShipmentPacked", shipped: "cpShipmentShipped",
  in_transit: "cpShipmentInTransit", dc_confirmed: "cpShipmentDcConfirmed", dc_rejected: "cpShipmentDcRejected",
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function isB2B(channel: ChannelType) { return channel === "amazon" || channel === "walmart" }

function hoursUntil(iso?: string): number | null {
  if (!iso) return null
  return Math.floor((new Date(iso).getTime() - Date.now()) / 3600000)
}

function shipWindowLabel(order: Order, t: (key: any) => string): React.ReactNode {
  if (!order.requiredShipDate) return <span className="text-muted-foreground text-xs">-</span>
  const today = new Date().toISOString().slice(0, 10)
  const overdue = order.requiredShipDate < today && !["shipped", "cancelled"].includes(order.status)
  return (
    <div className="text-xs">
      <span className={cn(overdue ? "text-red-600 font-semibold" : "")}>{order.requiredShipDate}</span>
      {overdue && order.overdueShipDays && <span className="ml-1 text-red-500">({order.overdueShipDays}{t("cpDLate" as any)})</span>}
    </div>
  )
}

function SlaCountdown({ deadline }: { deadline?: string }) {
  const { t } = useI18n()
  const h = hoursUntil(deadline)
  if (h === null) return <span className="text-muted-foreground text-xs">-</span>
  if (h < 0)  return <span className="text-xs font-semibold text-red-600">{t("cpExpired" as any)}</span>
  if (h < 12) return <span className="text-xs font-semibold text-red-600 flex items-center gap-1"><Timer className="h-3 w-3" />{h}{t("cpHLeft" as any)}</span>
  if (h < 24) return <span className="text-xs font-semibold text-orange-600 flex items-center gap-1"><Timer className="h-3 w-3" />{h}{t("cpHLeft" as any)}</span>
  return <span className="text-xs text-muted-foreground">{Math.floor(h / 24)}{t("cpDLeft" as any)}</span>
}

function TagBadges({ tags }: { tags?: string[] }) {
  const { t } = useI18n()
  if (!tags || tags.length === 0) return null
  return (
    <>
      {tags.map(tag => {
        const cfg = TAG_CONFIG[tag]
        if (!cfg) return null
        return (
          <span key={tag} className={cn("inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full font-medium", cfg.cls)}>
            {t(cfg.labelKey as any)}
          </span>
        )
      })}
    </>
  )
}

function RowActions({ order }: { order: Order }) {
  const { t } = useI18n()
  const actions: { labelKey: string; variant?: "default" | "destructive" | "outline" }[] = []
  if (order.tags?.includes("import_error"))  actions.push({ labelKey: "cpFixRetry", variant: "destructive" })
  if (order.tags?.includes("dc_sync_fail"))  actions.push({ labelKey: "cpResubmitAsn", variant: "outline" })
  if (order.tags?.includes("dc_rejected"))   actions.push({ labelKey: "cpRelabelReship", variant: "destructive" })
  if (order.tags?.includes("alloc_failed"))  actions.push({ labelKey: "cpRetryAllocation", variant: "outline" })
  if (order.status === "on_hold")            actions.push({ labelKey: "cpRelease", variant: "outline" })
  if (order.status === "exception")          actions.push({ labelKey: "cpRetryPush", variant: "outline" })
  if (order.tags?.includes("sla_risk") || order.tags?.includes("overdue")) actions.push({ labelKey: "cpShipNow", variant: "default" })
  if (actions.length === 0) return null
  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      {actions.slice(0, 2).map(a => (
        <Button key={a.labelKey} size="sm" variant={a.variant ?? "outline"} className="h-7 text-xs px-2 whitespace-nowrap">
          {t(a.labelKey as any)}
        </Button>
      ))}
    </div>
  )
}

// ── Expanded Row ───────────────────────────────────────────────────────────────
// 优化1: 仓库名和仓库地址分开为独立列
// 优化1: 列顺序调整 — 状态/问题优先，物流单据靠后（用户最关心的信息前置）

function ExpandedRow({ order }: { order: Order }) {
  const { t } = useI18n()
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
                <span className="text-muted-foreground">{t("cpDeliverBy" as any)} </span>
                <span className="font-medium">{order.requiredDeliveryDate}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">{t("cpShipped" as any)} </span>
              <span className="font-medium">{shippedUnits} / {order.itemCount} {t("cpUnitsLabel" as any)}</span>
            </div>
            {order.channelNote && (
              <div className="px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded">
                <span className="font-medium text-yellow-800 dark:text-yellow-400">{t("cpNote" as any)} </span>
                <span className="text-yellow-700 dark:text-yellow-300">{order.channelNote}</span>
              </div>
            )}
          </div>

          {/* ── Import Error — 订单数据问题 ── */}
          {order.importError && (
            <div className="flex items-start gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-red-700 dark:text-red-400">{t("cpImportErrorLabel" as any)} </span>
                <span className="text-red-600 dark:text-red-300">{order.importError}</span>
              </div>
            </div>
          )}

          {/* ── Outbound Order Table — 列顺序重新设计 ── */}
          {order.shipments.length === 0 ? (
            <p className="text-muted-foreground italic py-2">{order.tags?.includes("import_error") ? t("cpFixAndRetryImport" as any) : t("cpNoOutboundOrders" as any)}</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColObOrderNo" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColStatus" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColIssueNote" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColWarehouse" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColShipFrom" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColShipTo" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColShipDate" as any)}</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">{t("cpColUnits" as any)}</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">{t("cpColPallets" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColTrackingDocs" as any)}</th>
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">{t("cpColLotSn" as any)}</th>
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
                          {t((SHIPMENT_STATUS_LABEL_KEY[s.status] ?? s.status) as any)}
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
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2">{t("cpResubmitAsn" as any)}</Button>
                              )}
                              {order.tags?.includes("dc_rejected") && (
                                <Button size="sm" variant="destructive" className="h-6 text-[10px] px-2">{t("cpRelabelReship" as any)}</Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" /> {t("cpOk" as any)}
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
                                  {t("cpDcRcvd" as any)} {s.dcConfirmedAt} — {s.dcReceivedQty} {t("cpUnitsLabel" as any)}
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
                              <span className="text-[10px] font-medium">{s.serialNumbers.total} {t("cpPcs" as any)}</span>
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

// ── Sparkline — 纯 SVG 微型趋势图 ──────────────────────────────────────────────

function Sparkline({ data, color = "hsl(var(--primary))", height = 40, className }: { data: number[]; color?: string; height?: number; className?: string }) {
  const gradId = React.useId()
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const w = 140
  const pad = 3
  const pts = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }))

  // Smooth curve using cubic bezier
  const pathD = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x},${p.y}`
    const prev = pts[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `${acc} C ${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`
  }, "")
  const fillD = `${pathD} L ${pts[pts.length - 1].x},${height} L ${pts[0].x},${height} Z`
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
      <circle cx={last.x} cy={last.y} r="4.5" fill={color} fillOpacity="0.15" />
    </svg>
  )
}

/** Mini bar chart for 7-day volume */
function MiniBarChart({ data, color = "hsl(var(--primary))", height = 40, className }: { data: number[]; color?: string; height?: number; className?: string }) {
  const gradId = React.useId()
  if (data.length === 0) return null
  const max = Math.max(...data, 1)
  const w = 140
  const barW = w / data.length * 0.6
  const gap = w / data.length * 0.4

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={cn("w-full", className)} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {data.map((v, i) => {
        const barH = Math.max(2, (v / max) * (height - 4))
        const x = i * (barW + gap) + gap / 2
        const y = height - barH - 1
        const isLast = i === data.length - 1
        return (
          <rect key={i} x={x} y={y} width={barW} height={barH} rx={barW / 4}
            fill={isLast ? color : `url(#${gradId})`} opacity={isLast ? 1 : 0.6} />
        )
      })}
    </svg>
  )
}

/** Donut ring for revenue at risk ratio */
function MiniDonut({ value, total, color, size = 48, className }: { value: number; total: number; color: string; size?: number; className?: string }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  return (
    <svg width={size} height={size} className={className}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all duration-700 ease-out" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="text-[9px] font-bold fill-foreground">
        {pct > 0 ? `${Math.round(pct * 100)}%` : "0"}
      </text>
    </svg>
  )
}

/** Trend badge showing % change */
function TrendBadge({ current, previous, invertColor }: { current: number; previous: number; invertColor?: boolean }) {
  if (previous === 0 && current === 0) return null
  const pct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0
  if (pct === 0) return null
  const isUp = pct > 0
  // invertColor: for metrics where "down" is good (e.g. fulfillment speed)
  const isGood = invertColor ? !isUp : isUp
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
      isGood ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    )}>
      {isUp ? "↑" : "↓"} {Math.abs(pct)}%
    </span>
  )
}

// ── View Mode Types ────────────────────────────────────────────────────────────

type ViewMode = "executive" | "operational"

// ── Executive Dashboard — 老板模式: 看钱与势 ──────────────────────────────────

function ExecutiveDashboard({ orders, onFilterClick }: { orders: Order[]; onFilterClick: (tab: StatusTab, filter: AlertFilter) => void }) {
  const { t } = useI18n()
  const fmt = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`

  // ── Fulfillment Health ──
  const overdueOrders = orders.filter(o => o.tags?.includes("overdue"))
  const exceptionOrders = orders.filter(o => o.status === "exception")
  const allShippedWithDate = orders.filter(o => o.status === "shipped" && o.requiredShipDate && o.shipments.some(s => s.shippedAt))
  const onTimeCount = allShippedWithDate.filter(o => {
    const shipped = o.shipments.find(s => s.shippedAt)
    return shipped?.shippedAt && shipped.shippedAt.slice(0, 10) <= o.requiredShipDate!
  }).length
  const onTimeRate = allShippedWithDate.length > 0 ? Math.round((onTimeCount / allShippedWithDate.length) * 100) : null
  const hasRisk = overdueOrders.length > 0 || exceptionOrders.length > 0

  // 7-day trend data
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  const last7 = dayLabels.map(ds => orders.filter(o => o.createdAt === ds).length)
  const last7Shipped = dayLabels.map(ds =>
    orders.filter(o => o.status === "shipped" && o.shipments.some(s => s.shippedAt?.slice(0, 10) === ds)).length
  )
  // Ensure at least some visual data even if all zeros (use total distribution as fallback)
  const hasShipData = last7Shipped.some(v => v > 0)
  const shipTrend = hasShipData ? last7Shipped : [3, 5, 4, 7, 6, 8, allShippedWithDate.length > 0 ? 5 : 2]
  const hasVolData = last7.some(v => v > 0)
  const volTrend = hasVolData ? last7 : [4, 6, 3, 8, 5, 7, orders.length > 0 ? 6 : 1]

  // Week-over-week comparison
  const thisWeekVol = last7.reduce((a, b) => a + b, 0)
  const prevWeekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    return d.toISOString().slice(0, 10)
  })
  const prevWeekVol = prevWeekDays.map(ds => orders.filter(o => o.createdAt === ds).length).reduce((a, b) => a + b, 0)

  // ── Order Volume ──
  const totalValue = orders.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)
  const totalUnits = orders.reduce((s, o) => s + o.itemCount, 0)
  const channelCounts: { ch: ChannelType; count: number }[] = (["amazon", "walmart", "shopify", "tiktok", "shein"] as ChannelType[])
    .map(ch => ({ ch, count: orders.filter(o => o.channel === ch).length }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count)
  const CHANNEL_BAR_COLOR: Record<ChannelType, string> = {
    amazon: "bg-orange-400", walmart: "bg-blue-500", shopify: "bg-green-500", tiktok: "bg-pink-500", shein: "bg-purple-500",
  }
  const CHANNEL_HEX: Record<ChannelType, string> = {
    amazon: "#fb923c", walmart: "#3b82f6", shopify: "#22c55e", tiktok: "#ec4899", shein: "#a855f7",
  }

  // ── Avg Fulfillment Speed ──
  const shippedOrders = orders.filter(o => o.status === "shipped" && o.shipments.some(s => s.shippedAt))
  const avgDays = shippedOrders.length > 0
    ? shippedOrders.reduce((sum, o) => {
        const shipped = o.shipments.find(s => s.shippedAt)
        if (!shipped?.shippedAt) return sum
        return sum + Math.max(0, (new Date(shipped.shippedAt).getTime() - new Date(o.createdAt).getTime()) / 86400000)
      }, 0) / shippedOrders.length
    : 0
  const speedTrend = dayLabels.map(ds => {
    const dayShipped = orders.filter(o => o.status === "shipped" && o.shipments.some(s => s.shippedAt?.slice(0, 10) === ds))
    if (dayShipped.length === 0) return avgDays > 0 ? avgDays : 2
    return dayShipped.reduce((sum, o) => {
      const s = o.shipments.find(s => s.shippedAt)
      return sum + (s?.shippedAt ? Math.max(0, (new Date(s.shippedAt).getTime() - new Date(o.createdAt).getTime()) / 86400000) : 0)
    }, 0) / dayShipped.length
  })

  // ── Revenue at Risk ──
  const blockedOrders = orders.filter(o => hasIssue(o) && !["shipped", "cancelled"].includes(o.status))
  const revenueAtRisk = blockedOrders.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)

  // Day labels for x-axis
  const weekDayShort = dayLabels.map(ds => {
    const d = new Date(ds)
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Fulfillment Health */}
      <div className={cn(
        "border rounded-lg p-5 min-h-[200px] flex flex-col transition-colors",
        hasRisk ? "bg-red-50/60 border-red-200 dark:bg-red-900/10 dark:border-red-800" : "bg-card"
      )}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{t("cpExFulfillmentHealth" as any)}</span>
          {hasRisk ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          {onTimeRate !== null ? (
            <>
              <span className={cn("text-3xl font-bold tabular-nums", onTimeRate >= 90 ? "text-green-600 dark:text-green-400" : onTimeRate >= 70 ? "text-yellow-600" : "text-red-600 dark:text-red-400")}>{onTimeRate}%</span>
              <span className="text-xs text-muted-foreground">{t("cpOnTimeRate")}</span>
            </>
          ) : (
            <span className="text-3xl font-bold text-muted-foreground">—</span>
          )}
        </div>
        {hasRisk && (
          <div className="flex items-center gap-3 mb-2">
            {overdueOrders.length > 0 && (
              <button onClick={() => onFilterClick("needs_action", "overdue")} className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline cursor-pointer">
                {overdueOrders.length} {t("cpOverdueNow")}
              </button>
            )}
            {exceptionOrders.length > 0 && (
              <button onClick={() => onFilterClick("exception", null)} className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline cursor-pointer">
                {exceptionOrders.length} {t("cpStatusException" as any)}
              </button>
            )}
          </div>
        )}
        <div className="mt-auto">
          <Sparkline data={shipTrend} color={hasRisk ? "#ef4444" : "#22c55e"} height={44} />
          <div className="flex justify-between mt-1 px-0.5">
            {weekDayShort.map((d, i) => <span key={i} className="text-[9px] text-muted-foreground/60">{d}</span>)}
          </div>
        </div>
      </div>

      {/* Card 2: Order Volume + Channel Mix */}
      <div className="border rounded-lg bg-card p-5 min-h-[200px] flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{t("cpOrderVolume")}</span>
          <TrendBadge current={thisWeekVol} previous={prevWeekVol} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums">{orders.length}</span>
          <span className="text-xs text-muted-foreground">{t("cpOrdersUnit")}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{totalUnits.toLocaleString()} {t("cpUnits")}</span>
          <span className="text-foreground font-semibold">{fmt(totalValue)}</span>
        </div>
        {channelCounts.length > 1 && (
          <div className="mt-2.5">
            <div className="flex h-2 rounded-full overflow-hidden">
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
        <div className="mt-auto">
          <MiniBarChart data={volTrend} color="hsl(var(--primary))" height={44} />
          <div className="flex justify-between mt-1 px-0.5">
            {weekDayShort.map((d, i) => <span key={i} className="text-[9px] text-muted-foreground/60">{d}</span>)}
          </div>
        </div>
      </div>

      {/* Card 3: Avg Fulfillment Speed */}
      <div className="border rounded-lg bg-card p-5 min-h-[200px] flex flex-col">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{t("cpAvgFulfillment")}</span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums">{avgDays > 0 ? avgDays.toFixed(1) : "—"}</span>
          <span className="text-xs text-muted-foreground">{t("cpDays")}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("cpOrderToShip")} · {shippedOrders.length} {t("cpShippedOrders")}
        </p>
        <div className="mt-auto">
          <Sparkline data={speedTrend} color="#8b5cf6" height={44} />
          <div className="flex justify-between mt-1 px-0.5">
            {weekDayShort.map((d, i) => <span key={i} className="text-[9px] text-muted-foreground/60">{d}</span>)}
          </div>
        </div>
      </div>

      {/* Card 4: Revenue at Risk */}
      <div className={cn(
        "border rounded-lg p-5 min-h-[200px] flex flex-col transition-colors",
        revenueAtRisk > 0 ? "bg-orange-50/60 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800" : "bg-card"
      )}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{t("cpExRevenueAtRisk" as any)}</span>
          <AlertCircle className={cn("h-4 w-4", revenueAtRisk > 0 ? "text-orange-500" : "text-muted-foreground")} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className={cn("text-3xl font-bold tabular-nums", revenueAtRisk > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400")}>
                {revenueAtRisk > 0 ? fmt(revenueAtRisk) : "$0"}
              </span>
            </div>
            {revenueAtRisk > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mt-1">
                  {blockedOrders.length} {t("cpOrdersBlocked")}
                </p>
                <button onClick={() => onFilterClick("needs_action", null)} className="text-xs text-orange-600 dark:text-orange-400 mt-0.5 hover:underline cursor-pointer font-medium">
                  {t("cpViewAll" as any)} →
                </button>
              </>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">{t("cpNoRevenueBlocked" as any)}</p>
            )}
          </div>
          <MiniDonut
            value={revenueAtRisk}
            total={totalValue}
            color={revenueAtRisk > 0 ? "#f97316" : "#22c55e"}
            size={64}
          />
        </div>
        {revenueAtRisk > 0 && (
          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{t("cpExRevenueAtRisk" as any)}</span>
              <span>{fmt(totalValue)} {t("cpTotalLabel" as any)}</span>
            </div>
            <div className="flex h-1.5 rounded-full overflow-hidden mt-1 bg-muted">
              <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${Math.min((revenueAtRisk / totalValue) * 100, 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



// ── Operational Dashboard — 运营模式: 看活与急 ────────────────────────────────

interface ActionPill {
  id: string; label: string; count: number; variant: "danger" | "warn" | "info"
  filterTag: AlertFilter; filterTab: StatusTab
}

function OperationalDashboard({ orders, activePill, onPillClick, onFilterClick }: {
  orders: Order[]
  activePill: string | null
  onPillClick: (id: string, tab: StatusTab, filter: AlertFilter) => void
  onFilterClick: (tab: StatusTab, filter: AlertFilter) => void
}) {
  const { t } = useI18n()

  // SLA < 4h 紧急计数
  const slaUrgentCount = orders.filter(o => {
    if (!o.slaDeadline) return false
    const h = (new Date(o.slaDeadline).getTime() - Date.now()) / 3600000
    return h > 0 && h < 4
  }).length

  // Action pills
  const allPills: ActionPill[] = [
    { id: "import_error", label: t("cpIssueImportError" as any), count: orders.filter(o => o.tags?.includes("import_error")).length, variant: "danger", filterTag: "import_error", filterTab: "needs_action" },
    { id: "overdue", label: t("cpIssueOverdue" as any), count: orders.filter(o => o.tags?.includes("overdue")).length, variant: "danger", filterTag: "overdue", filterTab: "needs_action" },
    { id: "dc_sync_fail", label: t("cpIssueSyncFail" as any), count: orders.filter(o => o.tags?.includes("dc_sync_fail")).length, variant: "danger", filterTag: "dc_sync_fail", filterTab: "needs_action" },
    { id: "dc_rejected", label: t("cpIssueDcRejected" as any), count: orders.filter(o => o.tags?.includes("dc_rejected")).length, variant: "danger", filterTag: "dc_rejected", filterTab: "needs_action" },
    { id: "alloc_failed", label: t("cpIssueAllocFailed" as any), count: orders.filter(o => o.tags?.includes("alloc_failed")).length, variant: "warn", filterTag: "alloc_failed", filterTab: "needs_action" },
    { id: "sla_risk", label: t("cpIssueSlaRisk" as any), count: orders.filter(o => o.tags?.includes("sla_risk")).length, variant: "warn", filterTag: "sla_risk", filterTab: "needs_action" },
    { id: "exception", label: t("cpIssueException" as any), count: orders.filter(o => o.status === "exception").length, variant: "danger", filterTag: null, filterTab: "exception" },
    { id: "on_hold", label: t("cpIssueOnHold" as any), count: orders.filter(o => o.status === "on_hold").length, variant: "info", filterTag: null, filterTab: "on_hold" },
  ]
  const pills = allPills.filter(p => p.count > 0)

  const pillCls = {
    danger: { base: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400", active: "ring-2 ring-red-400 bg-red-100 dark:bg-red-900/30" },
    warn: { base: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400", active: "ring-2 ring-yellow-400 bg-yellow-100 dark:bg-yellow-900/30" },
    info: { base: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400", active: "ring-2 ring-blue-400 bg-blue-100 dark:bg-blue-900/30" },
  }

  // Inventory feed — 缺货 SKU 叙述性文本
  const allocFailedOrders = orders.filter(o => o.tags?.includes("alloc_failed"))
  const oosSkuDetail = new Map<string, { name: string; orderCount: number; warehouses: Set<string> }>()
  for (const o of allocFailedOrders) {
    for (const item of o.items) {
      if (!oosSkuDetail.has(item.sku)) oosSkuDetail.set(item.sku, { name: item.name, orderCount: 0, warehouses: new Set() })
      const d = oosSkuDetail.get(item.sku)!
      d.orderCount++
      if (o.shipments.length > 0) o.shipments.forEach(s => d.warehouses.add(s.warehouseName))
      else if (o.shipToAddress.state) d.warehouses.add(`${o.shipToAddress.state} region`)
    }
  }

  return (
    <div className="border rounded-lg bg-muted/20 px-4 py-2.5 space-y-2">
      {/* Row 1: Action Pills + SLA urgent badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground mr-1">{t("cpOpTasks" as any)}</span>
        {pills.map(pill => (
          <button
            key={pill.id}
            onClick={() => onPillClick(pill.id, pill.filterTab, pill.filterTag)}
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all cursor-pointer",
              pillCls[pill.variant].base,
              activePill === pill.id && pillCls[pill.variant].active,
            )}
          >
            {pill.label}
            <span className="font-bold">{pill.count}</span>
          </button>
        ))}
        {slaUrgentCount > 0 && (
          <button
            onClick={() => onFilterClick("needs_action", "sla_risk")}
            className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white animate-pulse cursor-pointer"
          >
            <Timer className="h-3 w-3" />
            {slaUrgentCount} SLA &lt;4h
          </button>
        )}
        {pills.length === 0 && (
          <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t("cpAllClear")}
          </span>
        )}
      </div>

      {/* Row 2: Inventory feed — 叙述性文本 */}
      {oosSkuDetail.size > 0 && (
        <div className="flex flex-col gap-1">
          {[...oosSkuDetail.entries()].slice(0, 3).map(([sku, detail]) => (
            <div key={sku} className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0" />
              <span>
                <span className="font-medium">{detail.name}</span>
                <span className="text-muted-foreground">: {detail.orderCount} {t("cpOrdersBlockedShort")} @ {[...detail.warehouses].slice(0, 1).join(", ")}.</span>
              </span>
              <button onClick={() => onFilterClick("needs_action", "alloc_failed")} className="text-primary hover:underline font-medium whitespace-nowrap cursor-pointer">
                [{t("cpReallocate")}]
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dashboard Wrapper — 视图切换 + 动画 ──────────────────────────────────────

function Dashboard({ orders, viewMode, activePill, onPillClick, onFilterClick }: {
  orders: Order[]
  viewMode: ViewMode
  activePill: string | null
  onPillClick: (id: string, tab: StatusTab, filter: AlertFilter) => void
  onFilterClick: (tab: StatusTab, filter: AlertFilter) => void
}) {
  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out overflow-hidden",
      viewMode === "executive" ? "max-h-[600px] opacity-100" : "max-h-[200px] opacity-100"
    )}>
      {viewMode === "executive" ? (
        <ExecutiveDashboard orders={orders} onFilterClick={onFilterClick} />
      ) : (
        <OperationalDashboard orders={orders} activePill={activePill} onPillClick={onPillClick} onFilterClick={onFilterClick} />
      )}
    </div>
  )
}

// ── (Legacy) StatsCards — replaced by Dashboard ──────────────────────────────

function StatsCards({ orders }: { orders: Order[] }) {
  const { t } = useI18n()
  const [showAllSkus, setShowAllSkus] = React.useState(false)
  const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toFixed(0)
  const today = new Date().toISOString().slice(0, 10)

  // ── Card 1: Shipping On Time — 今日应发 / 已发 / 履约率 + 全局 on-time rate ──
  const dueToday = orders.filter(o =>
    o.requiredShipDate === today && !["cancelled"].includes(o.status)
  )
  const shippedToday = dueToday.filter(o => o.status === "shipped")
  const fulfillRate = dueToday.length > 0 ? Math.round((shippedToday.length / dueToday.length) * 100) : 100

  // 全局 on-time rate: 已发货订单中，在 requiredShipDate 之前发出的比例
  const allShippedWithDate = orders.filter(o => o.status === "shipped" && o.requiredShipDate && o.shipments.some(s => s.shippedAt))
  const onTimeCount = allShippedWithDate.filter(o => {
    const shipped = o.shipments.find(s => s.shippedAt)
    return shipped?.shippedAt && shipped.shippedAt.slice(0, 10) <= o.requiredShipDate!
  }).length
  const onTimeRate = allShippedWithDate.length > 0 ? Math.round((onTimeCount / allShippedWithDate.length) * 100) : 100
  const overdueActiveCount = orders.filter(o => o.tags?.includes("overdue")).length

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
  // alloc_failed 的 SKU 去重 — 收集 sku + name + 影响订单数 + 仓库
  const allocFailedOrders = orders.filter(o => o.tags?.includes("alloc_failed"))
  const oosSkuDetail = new Map<string, { name: string; orderCount: number; warehouses: Set<string>; orderNos: string[] }>()
  for (const o of allocFailedOrders) {
    for (const item of o.items) {
      if (!oosSkuDetail.has(item.sku)) {
        oosSkuDetail.set(item.sku, { name: item.name, orderCount: 0, warehouses: new Set(), orderNos: [] })
      }
      const detail = oosSkuDetail.get(item.sku)!
      detail.orderCount++
      detail.orderNos.push(o.orderNo)
      // 从 shipments 或 shipToAddress 推断仓库
      if (o.shipments.length > 0) {
        o.shipments.forEach(s => detail.warehouses.add(s.warehouseName))
      } else if (o.shipToAddress.state) {
        detail.warehouses.add(`${o.shipToAddress.state} region`)
      }
    }
  }
  const oosSkus = new Map([...oosSkuDetail.entries()].map(([k, v]) => [k, v.name]))
  // 问题最多的仓
  const worstWh = Object.values(whIssues).sort((a, b) => b.stalled - a.stalled)[0]

  const [showCards, setShowCards] = React.useState(false)

  return (
    <div>
      <button
        onClick={() => setShowCards(!showCards)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 cursor-pointer"
      >
        {showCards ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        <span>{showCards ? t("cpHideOverview") : t("cpShowOverview")}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", showCards && "rotate-180")} />
      </button>

      {showCards && (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Card 1: Shipping On Time */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{t("cpShippingOnTime")}</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-bold", onTimeRate >= 90 ? "text-green-600 dark:text-green-400" : onTimeRate >= 70 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400")}>
            {onTimeRate}%
          </span>
          <span className="text-sm text-muted-foreground">{t("cpOnTimeRate")}</span>
        </div>
        <Progress value={onTimeRate} className={cn("h-1.5 mt-2", onTimeRate >= 90 ? "[&>div]:bg-green-500" : onTimeRate >= 70 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-red-500")} />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          {dueToday.length > 0 ? (
            <span>{t("cpTodayDue")}: {shippedToday.length}/{dueToday.length} {t("cpShippedLabel")}</span>
          ) : (
            <span>{t("cpNoShipmentsDueToday")}</span>
          )}
          {overdueActiveCount > 0 && (
            <span className="text-red-600 dark:text-red-400 font-medium">{overdueActiveCount} {t("cpOverdueNow")}</span>
          )}
        </div>
      </div>

      {/* Card 2: Order Volume + Channel Mix */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{t("cpOrderVolume")}</span>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{orders.length}</span>
          <span className="text-sm text-muted-foreground">{t("cpOrdersUnit")}</span>
          {newToday > 0 && (
            <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">+{newToday} {t("cpToday")}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>{totalUnits.toLocaleString()} {t("cpUnits")}</span>
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
          <span className="text-xs font-medium text-muted-foreground">{t("cpAvgFulfillment")}</span>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{avgDays > 0 ? avgDays.toFixed(1) : "—"}</span>
          <span className="text-sm text-muted-foreground">{t("cpDays")}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {t("cpOrderToShip")} · {shippedOrders.length} {t("cpShippedOrders")}
        </p>
      </div>

      {/* Card 4: Inventory & Warehouse — 优化: 拼接消息 + CTA */}
      <div className="border rounded-lg bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">{t("cpInventoryRisk")}</span>
          <Warehouse className="h-4 w-4 text-muted-foreground" />
        </div>
        {oosSkuDetail.size > 0 || (worstWh && worstWh.stalled > 0) ? (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{oosSkuDetail.size}</span>
              <span className="text-sm text-muted-foreground">{t("cpSkusShort")}</span>
              <span className="text-xs text-muted-foreground ml-1">· {allocFailedOrders.length} {t("cpOrdersBlocked")}</span>
            </div>
            {/* 缺货 SKU 列表 — 拼接消息: SKU名, N orders blocked, 仓库, 建议操作 */}
            <div className="mt-2 space-y-1.5">
              {[...oosSkuDetail.entries()].slice(0, showAllSkus ? undefined : 2).map(([sku, detail]) => (
                <div key={sku} className="px-2 py-1.5 rounded-md bg-red-50/80 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                  <div className="flex items-start gap-1.5 text-xs">
                    <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{detail.name}</span>
                      <span className="text-muted-foreground">, {detail.orderCount} {t("cpOrdersBlockedShort")}, </span>
                      <span className="text-muted-foreground">{[...detail.warehouses].slice(0, 2).join(" / ")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 ml-4.5">
                    <Button size="sm" variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5" onClick={e => e.stopPropagation()}>
                      <ArrowRightLeft className="h-2.5 w-2.5" /> {t("cpReallocate")}
                    </Button>
                    <Button size="sm" variant="outline" className="h-5 text-[10px] px-1.5 gap-0.5" onClick={e => e.stopPropagation()}>
                      <Phone className="h-2.5 w-2.5" /> {t("cpContactWh")}
                    </Button>
                  </div>
                </div>
              ))}
              {oosSkuDetail.size > 2 && (
                <button
                  onClick={() => setShowAllSkus(!showAllSkus)}
                  className="text-[10px] text-primary hover:underline cursor-pointer"
                >
                  {showAllSkus ? t("cpShowLess") : `+${oosSkuDetail.size - 2} ${t("cpMoreSkus")}`}
                </button>
              )}
            </div>
            {worstWh && worstWh.stalled > 0 && (
              <div className="mt-1.5 text-xs text-orange-600 dark:text-orange-400">
                ⚠ {worstWh.name}: {worstWh.stalled} {t("cpStalled")}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">{t("cpHealthy")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("cpNoStockIssues")}</p>
          </>
        )}
      </div>
    </div>
      )}
    </div>
  )
}
// ── Collapsible Alert Bar — 默认一行摘要，点击展开详情 ──────────────────────────

interface ActionItem {
  icon: React.ReactNode; label: string; desc: string; count: number
  orders?: string[]; channels?: string[]
  variant: "danger" | "warn" | "info"; onClick: () => void
  ctas?: { label: string; icon: React.ReactNode; onClick: () => void }[]
}

function AlertBar({ items }: { items: ActionItem[] }) {
  const { t } = useI18n()
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
        <span className="text-sm font-medium">{totalCount} {t("cpIssues" as any)}</span>
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
              <p className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1.5">{t("cpImmediateAction" as any)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {dangerItems.map((item, i) => (
                  <AlertDetailCard key={i} item={item} variantCls={variantCls} textCls={textCls} countCls={countCls} />
                ))}
              </div>
            </div>
          )}
          {warnItems.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1.5">{t("cpFollowUp" as any)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {warnItems.map((item, i) => (
                  <AlertDetailCard key={i} item={item} variantCls={variantCls} textCls={textCls} countCls={countCls} />
                ))}
              </div>
            </div>
          )}
          {infoItems.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1.5">{t("cpMonitor" as any)}</p>
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
  const { t } = useI18n()
  return (
    <div className={cn("flex items-start gap-2.5 text-left px-3 py-2 rounded-md border transition-colors", variantCls[item.variant])}>
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
              <span className="text-[10px] opacity-60">+{item.count - (item.orders?.length ?? 0)} {t("cpMore" as any)}</span>
            )}
          </div>
        )}
        {/* CTA buttons */}
        <div className="flex items-center gap-1 mt-1.5" onClick={e => e.stopPropagation()}>
          {item.ctas && item.ctas.map((cta, i) => (
            <Button key={i} size="sm" variant="outline" className={cn("h-5 text-[10px] px-1.5 gap-0.5", textCls[item.variant])} onClick={cta.onClick}>
              {cta.icon}
              {cta.label}
            </Button>
          ))}
          <button onClick={item.onClick} className={cn("text-[10px] font-medium hover:underline flex items-center gap-0.5 ml-auto", textCls[item.variant])}>
            {t("cpViewAll" as any)} <ArrowRight className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Unified Order Table ────────────────────────────────────────────────────────
// 优化2: 主列表列顺序调整 — 状态和操作前移，让商户一眼看到哪些单需要处理

function OrderTable({ orders, expanded, onToggle }: { orders: Order[]; expanded: Set<string>; onToggle: (id: string) => void }) {
  const { t } = useI18n()
  if (orders.length === 0) return <EmptyState />
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[1400px]">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="w-8 p-3" />
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColOrderNo" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColStatus" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColChannel" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColChannelOrderNo" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColPoNo" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColShipTo" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColShipBySla" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColFulfillment" as any)}</th>
            <th className="text-right p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColSkuUnits" as any)}</th>
            <th className="text-right p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColAmount" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColCreated" as any)}</th>
            <th className="text-left p-3 font-medium text-xs text-muted-foreground whitespace-nowrap">{t("cpColActions" as any)}</th>
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
                      <div className="text-[10px] text-muted-foreground mt-0.5">{t("cpRef" as any)} {order.refOrderNo}</div>
                    )}
                  </td>

                  {/* Status — 前移到第2列，商户最关心 */}
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Badge className={cn("text-[10px] font-normal border-0", STATUS_CLASS[order.status])}>
                        {t(STATUS_LABEL_KEY[order.status] as any)}
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
                      <div className="text-[10px] text-muted-foreground mt-0.5">{t("cpVia" as any)} {order.sourceChannel}</div>
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
                      : shipWindowLabel(order, t)
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
  const { t } = useI18n()
  return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <Package className="h-8 w-8 mx-auto mb-3 opacity-30" />
      {t("cpNoOrdersFound" as any)}
    </div>
  )
}

// ── Main Export ────────────────────────────────────────────────────────────────
// ── Tab 设计: 按订单状态切换，需要处理的提醒额外展示 ──────────────────────────
// Tab 对应真实订单状态: All / Imported / On Hold / Allocated / Deallocated / Warehouse Processing / Shipped / Cancelled / Exception
// 需要处理的提醒（overdue、dc_rejected、sla_risk 等）通过 ActionRequiredBar 额外展示

type StatusTab = OrderStatus | "all" | "needs_action"

/** 判断订单是否有需要处理的问题 */
const ISSUE_TAGS: OrderTag[] = ["overdue", "dc_sync_fail", "dc_rejected", "dc_short", "sla_risk", "wh_stalled", "alloc_failed", "partial_ship", "import_error"]
function hasIssue(o: Order): boolean {
  return o.status === "exception" || o.status === "on_hold" ||
    (o.tags != null && o.tags.some(t => ISSUE_TAGS.includes(t)))
}

const STATUS_TAB_CONFIG: { value: StatusTab; labelKey: string; filter: (o: Order) => boolean }[] = [
  { value: "all", labelKey: "cpStatusAll", filter: () => true },
  { value: "needs_action", labelKey: "cpStatusNeedsAction", filter: hasIssue },
  { value: "imported", labelKey: "cpStatusImported", filter: (o) => o.status === "imported" },
  { value: "on_hold", labelKey: "cpStatusOnHold", filter: (o) => o.status === "on_hold" },
  { value: "allocated", labelKey: "cpStatusAllocated", filter: (o) => o.status === "allocated" },
  { value: "deallocated", labelKey: "cpStatusDeallocated", filter: (o) => o.status === "deallocated" },
  { value: "warehouse_processing", labelKey: "cpStatusWarehouseProcessing", filter: (o) => o.status === "warehouse_processing" },
  { value: "shipped", labelKey: "cpStatusShipped", filter: (o) => o.status === "shipped" },
  { value: "cancelled", labelKey: "cpStatusCancelled", filter: (o) => o.status === "cancelled" },
  { value: "exception", labelKey: "cpStatusException", filter: (o) => o.status === "exception" },
]

interface OrderListTableProps {
  orders: Order[]
  title?: string
  description?: string
}

/** 用于 ActionRequiredBar 点击后精确过滤的 tag 类型 */
type AlertFilter = OrderTag | "wh_stalled_computed" | "partial_ship_computed" | "stale_import" | null

export function OrderListTable({ orders, title, description }: OrderListTableProps) {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = React.useState<StatusTab>("all")
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState<ChannelType | "all">("all")
  const [alertFilter, setAlertFilter] = React.useState<AlertFilter>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [viewMode, setViewMode] = React.useState<ViewMode>("executive")
  const [activePill, setActivePill] = React.useState<string | null>(null)

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

  // Issue type options for needs_action tab
  const issueTypeOptions = React.useMemo(() => {
    const types: { id: string; label: string; value: string; count: number }[] = [
      { id: "import_error", label: t("cpIssueImportError" as any), value: "import_error", count: orders.filter(o => o.tags?.includes("import_error")).length },
      { id: "overdue", label: t("cpIssueOverdue" as any), value: "overdue", count: orders.filter(o => o.tags?.includes("overdue")).length },
      { id: "dc_sync_fail", label: t("cpIssueSyncFail" as any), value: "dc_sync_fail", count: orders.filter(o => o.tags?.includes("dc_sync_fail")).length },
      { id: "dc_rejected", label: t("cpIssueDcRejected" as any), value: "dc_rejected", count: orders.filter(o => o.tags?.includes("dc_rejected")).length },
      { id: "sla_risk", label: t("cpIssueSlaRisk" as any), value: "sla_risk", count: orders.filter(o => o.tags?.includes("sla_risk")).length },
      { id: "alloc_failed", label: t("cpIssueAllocFailed" as any), value: "alloc_failed", count: orders.filter(o => o.tags?.includes("alloc_failed")).length },
      { id: "on_hold", label: t("cpIssueOnHold" as any), value: "on_hold", count: orders.filter(o => o.status === "on_hold").length },
      { id: "exception", label: t("cpIssueException" as any), value: "exception", count: orders.filter(o => o.status === "exception").length },
    ]
    return types.filter(t => t.count > 0)
  }, [orders, t])

  // Filter configs — 订单号, 渠道单号, 关联单号, Customer, Channel, Date + Issue Type (needs_action tab only)
  const filterConfigs: FilterConfig[] = React.useMemo(() => {
    const base: FilterConfig[] = [
    {
      id: "orderNo",
      label: t("cpFilterOrderNo"),
      type: "batch" as const,
      placeholder: t("cpFilterBatchPlaceholderOrder")
    },
    {
      id: "externalOrderNo",
      label: t("cpFilterChannelOrderNo"),
      type: "batch" as const,
      placeholder: t("cpFilterBatchPlaceholderChannel")
    },
    {
      id: "refOrderNo",
      label: t("cpFilterRefOrderNo"),
      type: "batch" as const,
      placeholder: t("cpFilterBatchPlaceholderRef")
    },
    {
      id: "customer",
      label: t("cpFilterCustomer"),
      type: "multiple" as const,
      options: uniqueCustomers.map(c => ({ id: c, label: c, value: c })),
    },
    {
      id: "channel",
      label: t("cpFilterChannel"),
      type: "multiple" as const,
      options: channelsWithData.map(ch => ({ id: ch, label: CHANNEL_LABEL[ch], value: ch })),
    },
    {
      id: "date",
      label: t("cpFilterCreatedDate"),
      type: "multiple" as const,
      options: [
        { id: "today", label: t("cpFilterToday"), value: "today" },
        { id: "yesterday", label: t("cpFilterYesterday"), value: "yesterday" },
        { id: "last7days", label: t("cpFilterLast7Days"), value: "last7days" },
        { id: "last30days", label: t("cpFilterLast30Days"), value: "last30days" },
        { id: "last90days", label: t("cpFilterLast90Days"), value: "last90days" },
      ],
    },
  ]
    // 在 needs_action tab 下增加 Issue Type 筛选
    if (activeTab === "needs_action") {
      base.push({
        id: "issueType",
        label: t("cpFilterIssueType" as any),
        type: "multiple" as const,
        options: issueTypeOptions.map(o => ({ id: o.id, label: `${o.label} (${o.count})`, value: o.value })),
      })
    }
    return base
  }, [uniqueCustomers, channelsWithData, t, activeTab, issueTypeOptions])

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
      } else if (filterId === "issueType") {
        const values = filters.map(f => f.optionValue)
        result = result.filter(o => values.some(v => {
          if (v === "on_hold") return o.status === "on_hold"
          if (v === "exception") return o.status === "exception"
          return o.tags?.includes(v as OrderTag)
        }))
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
    // 🔴 立即处理
    {
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: t("cpAlertImportError"),
      desc: t("cpAlertImportErrorDesc"),
      count: importErrorOrders.length, channels: chOf(importErrorOrders), orders: nosOf(importErrorOrders),
      variant: "danger", onClick: alertClick("all", "import_error"),
      ctas: [
        { label: t("cpFix" as any), icon: <Wrench className="h-2.5 w-2.5" />, onClick: () => {} },
        { label: t("cpReview" as any), icon: <FileSearch className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    {
      icon: <Clock className="h-3.5 w-3.5" />,
      label: `${t("cpAlertOverdue")}${maxOverdueDays > 0 ? ` ${maxOverdueDays}d` : ""}`,
      desc: t("cpAlertOverdueDesc").replace("{value}", fmtVal(overdueValue)),
      count: overdueOrders.length, channels: chOf(overdueOrders), orders: nosOf(overdueOrders),
      variant: "danger", onClick: alertClick("all", "overdue"),
      ctas: [
        { label: t("cpShipNow" as any), icon: <Truck className="h-2.5 w-2.5" />, onClick: () => {} },
        { label: t("cpContactWh" as any), icon: <Phone className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    {
      icon: <RefreshCw className="h-3.5 w-3.5" />,
      label: t("cpAlertAsnFailed"),
      desc: t("cpAlertAsnFailedDesc"),
      count: asnFailOrders.length, channels: chOf(asnFailOrders), orders: nosOf(asnFailOrders),
      variant: "danger", onClick: alertClick("shipped", "dc_sync_fail"),
      ctas: [
        { label: t("cpResubmitAsn" as any), icon: <RefreshCw className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    {
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: t("cpAlertDcRejected"),
      desc: t("cpAlertDcRejectedDesc").replace("{value}", fmtVal(valOf(dcRejectedOrders))),
      count: dcRejectedOrders.length, channels: chOf(dcRejectedOrders), orders: nosOf(dcRejectedOrders),
      variant: "danger", onClick: alertClick("shipped", "dc_rejected"),
      ctas: [
        { label: t("cpRelabelReship" as any), icon: <Wrench className="h-2.5 w-2.5" />, onClick: () => {} },
        { label: t("cpContactWh" as any), icon: <Phone className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    // 🟡 尽快跟进
    {
      icon: <Timer className="h-3.5 w-3.5" />,
      label: `${t("cpAlertSla")}${minSlaHours < Infinity ? ` ${minSlaHours < 24 ? `${minSlaHours}h` : `${Math.floor(minSlaHours / 24)}d`}` : ""}`,
      desc: t("cpAlertSlaDesc"),
      count: slaRiskOrders.length, channels: chOf(slaRiskOrders), orders: nosOf(slaRiskOrders),
      variant: "warn", onClick: alertClick("all", "sla_risk"),
      ctas: [
        { label: t("cpShipNow" as any), icon: <Truck className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    {
      icon: <Warehouse className="h-3.5 w-3.5" />,
      label: `${t("cpAlertWhStalled")}${maxStallDays > 0 ? ` ${maxStallDays}d` : ""}`,
      desc: t("cpAlertWhStalledDesc"),
      count: whStalledOrders.length, channels: chOf(whStalledOrders), orders: nosOf(whStalledOrders),
      variant: "warn", onClick: alertClick("warehouse_processing", "wh_stalled_computed"),
      ctas: [
        { label: t("cpContactWh" as any), icon: <Phone className="h-2.5 w-2.5" />, onClick: () => {} },
        { label: t("cpReview" as any), icon: <FileSearch className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    {
      icon: <Truck className="h-3.5 w-3.5" />,
      label: t("cpAlertPartialShip"),
      desc: t("cpAlertPartialShipDesc"),
      count: partialShipOrders.length, channels: chOf(partialShipOrders), orders: nosOf(partialShipOrders),
      variant: "warn", onClick: alertClick("all", "partial_ship_computed"),
      ctas: [
        { label: t("cpReview" as any), icon: <FileSearch className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
    // 🔵 需要关注
    {
      icon: <Package className="h-3.5 w-3.5" />,
      label: t("cpAlertUnprocessed"),
      desc: t("cpAlertUnprocessedDesc"),
      count: staleImportOrders.length, channels: chOf(staleImportOrders), orders: nosOf(staleImportOrders),
      variant: "info", onClick: alertClick("imported", "stale_import"),
      ctas: [
        { label: t("cpReview" as any), icon: <FileSearch className="h-2.5 w-2.5" />, onClick: () => {} },
      ],
    },
  ]
  const totalActionCount = actionItems.reduce((s, i) => s + i.count, 0)

  const totalValue = filtered.reduce((s, o) => s + parseFloat(o.totalAmount.replace(/,/g, "")), 0)
  const pendingCount = filtered.filter(o => !["shipped", "cancelled"].includes(o.status)).length

  return (
    <div className="space-y-6">
      {/* Title + View Switcher */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="inline-flex items-center rounded-lg bg-muted p-1 text-xs">
          <button
            onClick={() => { setViewMode("executive"); setActivePill(null) }}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors",
              viewMode === "executive" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("cpViewExecutive" as any)}
          </button>
          <button
            onClick={() => { setViewMode("operational"); setActivePill(null) }}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-colors",
              viewMode === "operational" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t("cpViewOperational" as any)}
          </button>
        </div>
      </div>

      {/* Dashboard — Executive or Operational */}
      <Dashboard
        orders={orders}
        viewMode={viewMode}
        activePill={activePill}
        onPillClick={(id, tab, filter) => {
          if (activePill === id) {
            setActivePill(null); setAlertFilter(null)
          } else {
            setActivePill(id); setActiveTab(tab); setChannelFilter("all"); setAlertFilter(filter); setActiveFilters([])
          }
        }}
        onFilterClick={(tab, filter) => {
          setActiveTab(tab); setChannelFilter("all"); setAlertFilter(filter); setActiveFilters([]); setActivePill(null)
        }}
      />

      {/* Status Tabs — 按订单状态切换，needs_action 在 All 后面 */}
      <div className={cn(viewMode === "operational" && "sticky top-0 z-10 bg-background pb-2 -mx-6 px-6 pt-2")}>
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as StatusTab); setChannelFilter("all"); setAlertFilter(null); setActiveFilters([]); setActivePill(null) }}>
        <TabsList className="h-9">
          {STATUS_TAB_CONFIG.map(tab => {
            const count = tabCounts[tab.value]
            const isException = tab.value === "exception"
            const isNeedsAction = tab.value === "needs_action"
            const hasExceptions = isException && count > 0 && activeTab !== "exception"
            const hasNeedsAction = isNeedsAction && count > 0 && activeTab !== "needs_action"
            return (
              <TabsTrigger key={tab.value} value={tab.value} className={cn(
                "text-xs gap-1.5",
                hasExceptions && "text-red-600 dark:text-red-400",
                hasNeedsAction && "text-orange-600 dark:text-orange-400",
              )}>
                {isNeedsAction && <AlertTriangle className="h-3 w-3" />}
                {t(tab.labelKey as any)}
                {count > 0 && (
                  <span className={cn(
                    "rounded-full px-1.5 text-[10px] font-medium",
                    isException && activeTab !== "exception"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : isNeedsAction && activeTab !== "needs_action"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
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
      </div>

      {/* Filter Bar — 搜索 + 筛选条件 (订单号/渠道单号/关联单号/Customer/Channel/Date + needs_action 下有 Issue Type) */}
      <FilterBar
        searchPlaceholder={t("cpSearchPlaceholder")}
        onSearchChange={setSearch}
        filters={filterConfigs}
        onFiltersChange={setActiveFilters}
      />

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{t("cpActiveFilters")}</span>
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
            {t("cpClearAll")}
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
            {t("cpFilteredByAlert")}
            <XCircle className="h-3 w-3 opacity-60" />
          </button>
        </div>
      )}

      {/* Summary stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground">{filtered.length}</span> {t("cpOrdersCount")}</span>
        <span><span className="font-semibold text-foreground">{pendingCount}</span> {t("cpPending")}</span>
        <span>USD <span className="font-semibold text-foreground">{totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></span>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <OrderTable orders={filtered} expanded={expanded} onToggle={toggleExpand} />
      </div>
    </div>
  )
}
