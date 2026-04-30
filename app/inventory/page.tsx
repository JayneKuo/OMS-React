"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Warehouse,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  mockWarehouses,
  mockSkuInventory,
  mockLedger,
  mockAnalytics,
  inventoryStats,
} from "@/lib/inventory/mock-data"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },
  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

const ledgerTypeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  inbound:    { label: "Inbound",    color: "text-green-600",  icon: <ArrowDownRight className="h-3 w-3" /> },
  outbound:   { label: "Outbound",   color: "text-red-500",    icon: <ArrowUpRight className="h-3 w-3" /> },
  adjustment: { label: "Adjustment", color: "text-yellow-600", icon: <RefreshCw className="h-3 w-3" /> },
  return:     { label: "Return",     color: "text-blue-500",   icon: <ArrowDownRight className="h-3 w-3" /> },
  transfer:   { label: "Transfer",   color: "text-purple-500", icon: <RefreshCw className="h-3 w-3" /> },
  oms_lock:   { label: "OMS Lock",   color: "text-orange-500", icon: <RefreshCw className="h-3 w-3" /> },
  oms_unlock: { label: "OMS Unlock", color: "text-gray-400",   icon: <ArrowDownRight className="h-3 w-3" /> },
}

const warehouseTypeLabel: Record<string, string> = {
  physical: "Physical",
  virtual: "Virtual",
  fba: "Amazon FBA",
  "3pl": "3PL",
}

// 图表数据
const bestsellersData = [...mockAnalytics]
  .sort((a, b) => b.totalSold30d - a.totalSold30d)
  .slice(0, 6)
  .map((s) => ({ name: s.skuCode.split("-").slice(0, 3).join("-"), sold: s.totalSold30d }))

const turnoverData = mockAnalytics
  .filter((s) => s.turnoverRate > 0)
  .sort((a, b) => b.turnoverRate - a.turnoverRate)
  .map((s) => ({ name: s.skuCode.split("-").slice(0, 3).join("-"), rate: Number(s.turnoverRate.toFixed(1)) }))

const warehouseDistData = mockWarehouses
  .filter((w) => w.status !== "disconnected")
  .map((w) => ({ name: w.code, value: w.totalUnits }))

const slowMoving = mockAnalytics.filter((s) => s.stockAge > 30 && s.currentStock > 0)
const outOfStock = mockAnalytics.filter((s) => s.currentStock === 0)
const lowStock = mockAnalytics.filter((s) => s.stockDays > 0 && s.stockDays < 7)

export default function InventoryPage() {
  const lowStockSkus = mockSkuInventory.filter((s) => s.status === "low" || s.status === "out").slice(0, 5)
  const recentLedger = mockLedger.slice(0, 6)

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
      <div className="space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Overview</h1>
            <p className="text-muted-foreground">Real-time stock health, alerts, and analytics</p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total SKUs</p>
                  <p className="text-2xl font-bold">{inventoryStats.totalSkus}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warehouses</p>
                  <p className="text-2xl font-bold">
                    {inventoryStats.activeWarehouses}
                    <span className="text-sm font-normal text-muted-foreground">/{inventoryStats.totalWarehouses}</span>
                  </p>
                </div>
                <Warehouse className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Value</p>
                  <p className="text-2xl font-bold">${(inventoryStats.totalStockValue / 1000).toFixed(0)}K</p>
                </div>
                <TrendingDown className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold text-yellow-600">{inventoryStats.lowStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className={inventoryStats.outOfStockCount > 0 ? "border-red-200 bg-red-50/50 dark:bg-red-950/20" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Out of Stock</p>
                  <p className={`text-2xl font-bold ${inventoryStats.outOfStockCount > 0 ? "text-red-600" : ""}`}>
                    {inventoryStats.outOfStockCount}
                  </p>
                </div>
                <XCircle className={`h-8 w-8 ${inventoryStats.outOfStockCount > 0 ? "text-red-400" : "text-muted-foreground/40"}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Warehouse Summary + Alerts ── */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Warehouse Summary</CardTitle>
              <CardDescription>Stock distribution by warehouse</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWarehouses.map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{wh.name}</p>
                        <p className="text-xs text-muted-foreground">{wh.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{wh.totalUnits.toLocaleString()} units</p>
                        <p className="text-xs text-muted-foreground">{wh.skuCount} SKUs</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{warehouseTypeLabel[wh.type]}</Badge>
                      <div className="flex items-center gap-1">
                        {wh.status === "active"
                          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                          : <XCircle className="h-4 w-4 text-red-400" />}
                        <span className="text-xs text-muted-foreground capitalize">{wh.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Stock Alerts
              </CardTitle>
              <CardDescription>SKUs needing attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockSkus.map((sku) => (
                  <div key={sku.skuId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium leading-tight">{sku.productName}</p>
                      <Badge
                        variant={sku.status === "out" ? "destructive" : "outline"}
                        className="ml-2 shrink-0 text-xs"
                      >
                        {sku.status === "out" ? "Out" : "Low"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{sku.skuCode}</span>
                      <span>{sku.atpUnits} / {sku.safetyStock} min</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className={`h-1.5 rounded-full ${sku.status === "out" ? "bg-red-500" : "bg-yellow-500"}`}
                        style={{ width: `${Math.min(100, (sku.atpUnits / sku.safetyStock) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Analytics: Charts Row ── */}
        <div>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Analytics</h2>
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Best Sellers */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Best Sellers — Last 30 Days
                </CardTitle>
                <CardDescription>Units sold by SKU</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bestsellersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="sold" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Warehouse Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Distribution</CardTitle>
                <CardDescription>Units by warehouse</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={warehouseDistData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {warehouseDistData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${val} units`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Turnover Rate */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Inventory Turnover Rate</CardTitle>
                <CardDescription>Higher = faster-moving stock</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={turnoverData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} name="Turnover Rate" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Slow Moving */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-yellow-500" />
                  Slow Moving
                </CardTitle>
                <CardDescription>Stock age &gt; 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {slowMoving.length === 0 && (
                    <p className="text-sm text-muted-foreground">No slow-moving SKUs</p>
                  )}
                  {slowMoving.map((s) => (
                    <div key={s.skuId} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{s.skuCode}</p>
                      </div>
                      <span className={`ml-3 shrink-0 text-xs font-semibold ${s.stockAge > 60 ? "text-red-500" : "text-yellow-600"}`}>
                        {s.stockAge}d
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Stockout Risks ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {outOfStock.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Out of Stock ({outOfStock.length})
                </CardTitle>
                <CardDescription>Orders cannot be fulfilled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {outOfStock.map((s) => (
                    <div key={s.skuId} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50/30 p-3">
                      <div>
                        <p className="text-sm font-medium">{s.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{s.skuCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">0 units</p>
                        <p className="text-xs text-muted-foreground">{s.avgDailySales}/day avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStock.length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Low Stock ({lowStock.length})
                </CardTitle>
                <CardDescription>Less than 7 days of stock remaining</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStock.map((s) => (
                    <div key={s.skuId} className="flex items-center justify-between rounded-lg border border-yellow-100 bg-yellow-50/30 p-3">
                      <div>
                        <p className="text-sm font-medium">{s.productName}</p>
                        <p className="font-mono text-xs text-muted-foreground">{s.skuCode}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-700">{s.stockDays}d left</p>
                        <p className="text-xs text-muted-foreground">{s.currentStock} units · {s.avgDailySales}/day</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Recent Ledger ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Stock Movements</CardTitle>
                <CardDescription>Latest inventory changes across all warehouses</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="/inventory/ledger">View All</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentLedger.map((entry, idx) => {
                const typeInfo = ledgerTypeConfig[entry.type]
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between py-3 ${idx < recentLedger.length - 1 ? "border-b" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-muted ${typeInfo.color}`}>
                        {typeInfo.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{entry.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.warehouseName} · {entry.referenceNo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-sm font-semibold ${typeInfo.color}`}>
                        {entry.quantity > 0 ? "+" : ""}{entry.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {entry.beforeStock} → {entry.afterStock}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.timestamp).toLocaleString("en-US", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
