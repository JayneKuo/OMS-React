"use client"

import { use } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, CheckCircle2, XCircle, Package } from "lucide-react"
import { mockWarehouses, mockSkuInventory } from "@/lib/inventory/mock-data"
import Link from "next/link"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },

  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const statusColors: Record<string, string> = {
  normal: "bg-green-100 text-green-700",
  low: "bg-yellow-100 text-yellow-700",
  out: "bg-red-100 text-red-700",
  overstock: "bg-blue-100 text-blue-700",
}

export default function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const warehouse = mockWarehouses.find((w) => w.id === id)

  if (!warehouse) {
    return (
      <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Warehouse not found.</p>
        </div>
      </MainLayout>
    )
  }

  // 筛选该仓库有 warehouseBreakdown 数据的 SKU
  const warehouseSkus = mockSkuInventory
    .map((sku) => ({
      sku,
      whDetail: sku.warehouseBreakdown.find((w) => w.warehouseId === warehouse.id),
    }))
    .filter(({ whDetail }) => whDetail !== undefined)

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-3 -ml-2">
            <Link href="/inventory/warehouses">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Warehouses
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{warehouse.name}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-mono">{warehouse.code}</span>
                {warehouse.address && (
                  <>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {warehouse.address}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {warehouse.status === "active" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-sm capitalize text-muted-foreground">{warehouse.status}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total SKUs", value: warehouse.skuCount },
            { label: "Total Units", value: warehouse.totalUnits.toLocaleString() },
            { label: "Connected Channel", value: warehouse.connectedChannel || "—" },
            { label: "Region", value: warehouse.region },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-lg font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SKU Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              SKU Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="py-3 pl-4 pr-4 font-medium">SKU / Product</th>
                    <th className="py-3 pr-4 text-right font-medium">On Hand</th>
                    <th className="py-3 pr-4 text-right font-medium">WMS Avail</th>
                    <th className="py-3 pr-4 text-right font-medium">Open Orders</th>
                    <th className="py-3 pr-4 text-right font-medium">Inbound</th>
                    <th className="py-3 pr-4 text-right font-medium">Unfulfillable</th>
                    <th className="py-3 pr-4 font-medium">Sync</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseSkus.map(({ sku, whDetail }) => {
                    const wh = whDetail!
                    const syncCls = wh.syncStatus === "synced"
                      ? "bg-green-100 text-green-700"
                      : wh.syncStatus === "delayed"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    return (
                      <tr key={sku.skuId} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="py-3 pl-4 pr-4">
                          <p className="font-medium">{sku.productName}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{sku.skuCode}</span>
                            <span className="rounded bg-muted px-1 py-0.5 text-xs text-muted-foreground">{sku.category}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold">{wh.onHand}</td>
                        <td className="py-3 pr-4 text-right">{wh.available}</td>
                        <td className="py-3 pr-4 text-right">
                          {wh.wmsOpenOrder > 0
                            ? <span className="text-red-500">−{wh.wmsOpenOrder}</span>
                            : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {wh.inbound > 0
                            ? <span className="text-blue-600">+{wh.inbound}</span>
                            : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          {wh.damage > 0
                            ? <span className="text-orange-500">{wh.damage}</span>
                            : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${syncCls}`}>
                            {wh.syncStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sku.status]}`}>
                            {sku.status === "out" ? "Out of Stock" : sku.status === "low" ? "Low Stock" : sku.status === "overstock" ? "Overstock" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
