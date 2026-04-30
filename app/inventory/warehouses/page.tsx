"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Warehouse,
  MapPin,
  Package,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
} from "lucide-react"
import { mockWarehouses } from "@/lib/inventory/mock-data"
import type { WarehouseType, WarehouseStatus } from "@/lib/inventory/types"
import Link from "next/link"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },

  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const typeConfig: Record<WarehouseType, { label: string; color: string }> = {
  physical: { label: "Physical", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  virtual: { label: "Virtual", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  fba: { label: "Amazon FBA", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  "3pl": { label: "3PL", color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
}

const statusConfig: Record<WarehouseStatus, { icon: React.ReactNode; label: string; color: string }> = {
  active: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    label: "Active",
    color: "text-green-600",
  },
  inactive: {
    icon: <XCircle className="h-4 w-4 text-gray-400" />,
    label: "Inactive",
    color: "text-gray-500",
  },
  disconnected: {
    icon: <XCircle className="h-4 w-4 text-red-400" />,
    label: "Disconnected",
    color: "text-red-500",
  },
}

export default function WarehousesPage() {
  const totalUnits = mockWarehouses.reduce((sum, w) => sum + w.totalUnits, 0)
  const activeCount = mockWarehouses.filter((w) => w.status === "active").length

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
            <p className="text-muted-foreground">
              {activeCount} active · {mockWarehouses.length} total ·{" "}
              {totalUnits.toLocaleString()} total units
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Warehouse
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Physical", count: mockWarehouses.filter((w) => w.type === "physical").length, color: "text-blue-600" },
            { label: "3PL", count: mockWarehouses.filter((w) => w.type === "3pl").length, color: "text-teal-600" },
            { label: "Amazon FBA", count: mockWarehouses.filter((w) => w.type === "fba").length, color: "text-orange-600" },
            { label: "Disconnected", count: mockWarehouses.filter((w) => w.status === "disconnected").length, color: "text-red-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Warehouse Cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockWarehouses.map((wh) => {
            const type = typeConfig[wh.type]
            const status = statusConfig[wh.status]
            return (
              <Card key={wh.id} className={wh.status === "disconnected" ? "opacity-70" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted">
                        <Warehouse className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{wh.name}</CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">{wh.code}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${type.color}`}>
                      {type.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wh.address && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{wh.address}</span>
                    </div>
                  )}
                  {!wh.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{wh.region}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">SKUs</p>
                      <p className="text-xl font-semibold">{wh.skuCount}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Total Units</p>
                      <p className="text-xl font-semibold">{wh.totalUnits.toLocaleString()}</p>
                    </div>
                  </div>

                  {wh.connectedChannel && (
                    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Channel:</span>
                      <span className="font-medium">{wh.connectedChannel}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      {status.icon}
                      <span className={`text-sm ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inventory/warehouses/${wh.id}`}>
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
