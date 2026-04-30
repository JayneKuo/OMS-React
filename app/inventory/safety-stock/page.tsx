"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Shield, Settings2, Save } from "lucide-react"
import { mockSafetyStock } from "@/lib/inventory/mock-data"
import type { SafetyStockConfig } from "@/lib/inventory/types"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },

  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

export default function SafetyStockPage() {
  const [search, setSearch] = useState("")
  const [editingSku, setEditingSku] = useState<SafetyStockConfig | null>(null)
  const [configs, setConfigs] = useState<SafetyStockConfig[]>(mockSafetyStock)
  const [editForm, setEditForm] = useState({ safetyStock: 0, reorderPoint: 0, maxStock: 0, leadTimeDays: 0 })

  const filtered = configs.filter(
    (c) =>
      !search ||
      c.skuCode.toLowerCase().includes(search.toLowerCase()) ||
      c.productName.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (cfg: SafetyStockConfig) => {
    setEditingSku(cfg)
    setEditForm({
      safetyStock: cfg.safetyStock,
      reorderPoint: cfg.reorderPoint,
      maxStock: cfg.maxStock,
      leadTimeDays: cfg.leadTimeDays,
    })
  }

  const saveEdit = () => {
    if (!editingSku) return
    setConfigs((prev) =>
      prev.map((c) =>
        c.skuId === editingSku.skuId ? { ...c, ...editForm } : c
      )
    )
    setEditingSku(null)
  }

  const stockHealthColor = (current: number, safetyStock: number) => {
    if (current === 0) return "text-red-600"
    if (current < safetyStock) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Safety Stock</h1>
            <p className="text-muted-foreground">
              Configure minimum stock thresholds and reorder points per SKU
            </p>
          </div>
        </div>

        {/* Global Rule Banner */}
        <Card className="border-blue-200 bg-blue-50/40 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base text-blue-700 dark:text-blue-300">
                Global Default Rule
              </CardTitle>
            </div>
            <CardDescription>
              Applied to SKUs without individual overrides. Safety stock = avg daily sales × lead time days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-muted-foreground">Safety Stock Formula: </span>
                <span className="font-semibold">Avg Daily Sales × Lead Time Days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Default Lead Time: </span>
                <span className="font-semibold">7 days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Reorder Point: </span>
                <span className="font-semibold">Safety Stock × 1.5</span>
              </div>
              <Button variant="outline" size="sm">Edit Global Rule</Button>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="py-3 pl-4 pr-4 font-medium">SKU / Product</th>
                    <th className="py-3 pr-4 text-right font-medium">Current Stock</th>
                    <th className="py-3 pr-4 text-right font-medium">Safety Stock</th>
                    <th className="py-3 pr-4 text-right font-medium">Reorder Point</th>
                    <th className="py-3 pr-4 text-right font-medium">Max Stock</th>
                    <th className="py-3 pr-4 text-right font-medium">Lead Time</th>
                    <th className="py-3 pr-4 font-medium">Health</th>
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cfg) => {
                    const healthColor = stockHealthColor(cfg.currentStock, cfg.safetyStock)
                    const healthLabel =
                      cfg.currentStock === 0
                        ? "Out of Stock"
                        : cfg.currentStock < cfg.safetyStock
                        ? "Below Safety"
                        : cfg.currentStock >= cfg.maxStock
                        ? "Overstock"
                        : "Healthy"
                    const healthBg =
                      cfg.currentStock === 0
                        ? "bg-red-100 text-red-700"
                        : cfg.currentStock < cfg.safetyStock
                        ? "bg-yellow-100 text-yellow-700"
                        : cfg.currentStock >= cfg.maxStock
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"

                    return (
                      <tr key={cfg.skuId} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                        <td className="py-3 pl-4 pr-4">
                          <p className="font-medium">{cfg.productName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{cfg.skuCode}</p>
                        </td>
                        <td className={`py-3 pr-4 text-right font-semibold ${healthColor}`}>
                          {cfg.currentStock}
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <span className="flex items-center justify-end gap-1">
                            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                            {cfg.safetyStock}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">{cfg.reorderPoint}</td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">{cfg.maxStock}</td>
                        <td className="py-3 pr-4 text-right">{cfg.leadTimeDays}d</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${healthBg}`}>
                            {healthLabel}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <Button variant="outline" size="sm" onClick={() => openEdit(cfg)}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t px-4 py-3 text-sm text-muted-foreground">
              {filtered.length} SKUs configured
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSku} onOpenChange={(open) => !open && setEditingSku(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Safety Stock</DialogTitle>
            <DialogDescription>
              {editingSku?.productName} · <span className="font-mono">{editingSku?.skuCode}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Safety Stock (min units)</Label>
              <Input
                type="number"
                value={editForm.safetyStock}
                onChange={(e) => setEditForm((f) => ({ ...f, safetyStock: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Reorder Point</Label>
              <Input
                type="number"
                value={editForm.reorderPoint}
                onChange={(e) => setEditForm((f) => ({ ...f, reorderPoint: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max Stock</Label>
              <Input
                type="number"
                value={editForm.maxStock}
                onChange={(e) => setEditForm((f) => ({ ...f, maxStock: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Lead Time (days)</Label>
              <Input
                type="number"
                value={editForm.leadTimeDays}
                onChange={(e) => setEditForm((f) => ({ ...f, leadTimeDays: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSku(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
