"use client"

import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Minus,
  Info,
  Warehouse,
} from "lucide-react"
import { mockSkuInventory, mockLedger } from "@/lib/inventory/mock-data"
import type { LedgerType } from "@/lib/inventory/types"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },
  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const statusConfig: Record<string, { label: string; cls: string }> = {
  normal: { label: "Normal", cls: "bg-green-100 text-green-700" },
  low: { label: "Low Stock", cls: "bg-yellow-100 text-yellow-700" },
  out: { label: "Out of Stock", cls: "bg-red-100 text-red-700" },
  overstock: { label: "Overstock", cls: "bg-blue-100 text-blue-700" },
}

const warehouseTypeIcon: Record<string, string> = {
  physical: "🏭",
  fba: "📦",
  "3pl": "🔄",
  virtual: "☁️",
}

const syncStatusConfig: Record<string, { cls: string; label: string }> = {
  synced: { cls: "bg-green-100 text-green-700", label: "Synced" },
  delayed: { cls: "bg-yellow-100 text-yellow-700", label: "Delayed" },
  error: { cls: "bg-red-100 text-red-700", label: "Error" },
}

const ledgerTypeConfig: Record<LedgerType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  inbound: { label: "Inbound", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: <ArrowDownRight className="h-3.5 w-3.5" /> },
  outbound: { label: "Outbound", color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
  adjustment: { label: "Adjustment", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  return: { label: "Return", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", icon: <ArrowDownRight className="h-3.5 w-3.5" /> },
  transfer: { label: "Transfer", color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  oms_lock: { label: "OMS Lock", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", icon: <Minus className="h-3.5 w-3.5" /> },
  oms_unlock: { label: "OMS Unlock", color: "text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: <ArrowDownRight className="h-3.5 w-3.5" /> },
}

export default function SkuDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const sku = mockSkuInventory.find((item) => item.skuId === id)
  const skuLedger = mockLedger
    .filter((entry) => entry.skuId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  if (!sku) {
    return (
      <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">SKU not found.</p>
        </div>
      </MainLayout>
    )
  }

  const sc = statusConfig[sku.status]

  const atpChain = [
    {
      label: "WMS Available",
      value: sku.wmsAvailable,
      description: "WMS last reported available",
      color: "text-foreground",
      bg: "bg-muted",
      sign: null,
    },
    {
      label: "Open Orders",
      value: sku.wmsOpenOrder,
      description: "Held by WMS for active fulfillment (cached from last sync)",
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
      sign: "−",
    },
    {
      label: "OMS Locks",
      value: sku.omsLockTotal,
      description: `Open order: ${sku.omsLocks.openOrder} · Locked: ${sku.omsLocks.locked} · Allocated: ${sku.omsLocks.allocated} · Pending WMS sync: ${sku.omsLocks.pendingWmsSync}`,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      sign: "−",
    },
    {
      label: "Damage",
      value: sku.damage,
      description: "Damaged / QC Hold / FBA Unfulfillable",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      sign: "−",
    },
  ]

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/inventory/sku" className="hover:text-foreground transition-colors">
                SKU Inventory
              </Link>
              <ArrowRight className="h-3.5 w-3.5" />
              <span className="text-foreground">{sku.skuCode}</span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{sku.productName}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <span className="font-mono text-muted-foreground">{sku.skuCode}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{sku.category}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sc.cls}`}>
                    {sc.label}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/inventory/safety-stock">Edit Safety Stock</Link>
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ATP Calculation</CardTitle>
              <CardDescription>
                ATP is derived from WMS available, WMS open order, and OMS lock total. Pending WMS sync is already part of OMS Locks, not an extra generic subtraction.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-2">
                {atpChain.map((node, idx) => (
                  <div key={node.label} className="flex items-center gap-2">
                    {idx > 0 && (
                      <span className="text-lg font-semibold text-muted-foreground">{node.sign}</span>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`rounded-lg border px-4 py-3 cursor-help ${node.bg}`}>
                          <p className="text-xs text-muted-foreground">{node.label}</p>
                          <p className={`text-xl font-bold ${node.color}`}>{node.value}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{node.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ))}

                <span className="text-lg font-semibold text-muted-foreground">=</span>
                <div className="rounded-lg border-2 border-primary bg-primary/5 px-5 py-3">
                  <p className="text-xs text-muted-foreground">ATP</p>
                  <p className={`text-2xl font-bold ${sku.atpUnits === 0 ? "text-red-600" : sku.atpUnits < sku.safetyStock ? "text-yellow-600" : "text-green-600"}`}>
                    {sku.atpUnits}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>ATP vs Safety Stock ({sku.safetyStock} min)</span>
                  <span>{Math.min(100, Math.round((sku.atpUnits / sku.safetyStock) * 100))}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full transition-all ${sku.atpUnits === 0 ? "bg-red-500" : sku.atpUnits < sku.safetyStock ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(100, (sku.atpUnits / sku.safetyStock) * 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "On Hand", value: sku.onHand, description: "Physical units in warehouses (WMS reported)" },
              { label: "WMS Available", value: sku.wmsAvailable, description: "Available per WMS last sync" },
              { label: "Open Orders", value: sku.wmsOpenOrder, color: "text-red-500", description: "WMS fulfillment in progress" },
              { label: "OMS Locks", value: sku.omsLockTotal, color: sku.omsLockTotal > 0 ? "text-orange-600" : "", description: `Open order: ${sku.omsLocks.openOrder} / Locked: ${sku.omsLocks.locked} / Allocated: ${sku.omsLocks.allocated} / Pending WMS sync: ${sku.omsLocks.pendingWmsSync}` },
              { label: "Inbound", value: sku.inbound, color: "text-blue-600", description: "Confirmed in-transit POs and transfers" },
              { label: "Damage", value: sku.damage, color: sku.damage > 0 ? "text-orange-500" : "", description: "Damaged / Hold / FBA Unfulfillable" },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <CardContent className="pt-5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          {kpi.label}
                          <Info className="h-3 w-3" />
                        </p>
                        <p className={`mt-1 text-xl font-bold ${kpi.color ?? ""}`}>{kpi.value}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{kpi.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-4 w-4" />
                Warehouse Breakdown
              </CardTitle>
              <CardDescription>
                Per-warehouse normalized view. OMS Locks ({sku.omsLockTotal}) are global, and pending WMS sync stays inside the OMS lock bucket rather than as a separate extra deduction.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {sku.warehouseBreakdown.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">No warehouse data available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                        <th className="py-3 pl-4 pr-4 font-medium">Warehouse</th>
                        <th className="py-3 pr-4 font-medium">Type</th>
                        <th className="py-3 pr-4 text-right font-medium">On Hand</th>
                        <th className="py-3 pr-4 text-right font-medium">WMS Avail</th>
                        <th className="py-3 pr-4 text-right font-medium">Open Orders</th>
                        <th className="py-3 pr-4 text-right font-medium">Inbound</th>
                        <th className="py-3 pr-4 text-right font-medium">Unfulfillable</th>
                        <th className="py-3 pr-4 font-medium">Last Sync</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sku.warehouseBreakdown.map((wh) => {
                        const sync = syncStatusConfig[wh.syncStatus]
                        return (
                          <tr key={wh.warehouseId} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="py-3 pl-4 pr-4">
                              <div className="flex items-center gap-2">
                                <span>{warehouseTypeIcon[wh.warehouseType]}</span>
                                <div>
                                  <p className="font-medium">{wh.warehouseName}</p>
                                  <p className="font-mono text-xs text-muted-foreground">{wh.warehouseCode}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground">
                                {wh.warehouseType}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold">{wh.onHand}</td>
                            <td className="py-3 pr-4 text-right">{wh.available}</td>
                            <td className="py-3 pr-4 text-right">
                              {wh.wmsOpenOrder > 0 ? (
                                <span className="text-red-500">−{wh.wmsOpenOrder}</span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              {wh.inbound > 0 ? (
                                <span className="text-blue-600">+{wh.inbound}</span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              {wh.damage > 0 ? (
                                <span className="text-orange-500">{wh.damage}</span>
                              ) : (
                                <span className="text-muted-foreground/40">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">
                              {new Date(wh.lastSyncAt).toLocaleString("en-US", {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sync.cls}`}>
                                {sync.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
              <CardDescription>
                Inventory movement entries for this SKU, including OMS lock/unlock and warehouse-side changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {skuLedger.length === 0 ? (
                <p className="text-sm text-muted-foreground">No movement history for this SKU.</p>
              ) : (
                <div className="relative space-y-0">
                  <div className="absolute left-[19px] top-0 h-full w-px bg-border" />

                  {skuLedger.map((entry) => {
                    const cfg = ledgerTypeConfig[entry.type]
                    return (
                      <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
                        <div className={`relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                        </div>

                        <div className="flex-1 rounded-lg border bg-background p-3 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                                {cfg.icon}
                                {cfg.label}
                              </span>
                              <span className="text-sm font-medium">
                                {entry.quantity > 0 ? (
                                  <span className="text-green-600">+{entry.quantity}</span>
                                ) : (
                                  <span className="text-red-500">{entry.quantity}</span>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {entry.beforeStock} → {entry.afterStock} ATP
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(entry.timestamp).toLocaleString("en-US", {
                                month: "short", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </div>
                          </div>

                          <p className="mt-1.5 text-sm text-foreground">{entry.reason}</p>

                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="font-mono">{entry.referenceNo}</span>
                            {entry.warehouseName ? (
                              <span className="flex items-center gap-1">
                                <Warehouse className="h-3 w-3" />
                                {entry.warehouseName}
                              </span>
                            ) : (
                              <span>OMS Global Event</span>
                            )}
                            {entry.note && <span>{entry.note}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}
