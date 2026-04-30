"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Download,
  Clock,
} from "lucide-react"
import { mockLedger, mockWarehouses } from "@/lib/inventory/mock-data"
import type { LedgerType } from "@/lib/inventory/types"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },

  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const ledgerTypeConfig: Record<
  LedgerType,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  inbound: {
    label: "Inbound",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <ArrowDownRight className="h-3.5 w-3.5" />,
  },
  outbound: {
    label: "Outbound",
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <ArrowUpRight className="h-3.5 w-3.5" />,
  },
  adjustment: {
    label: "Adjustment",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
  return: {
    label: "Return",
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <ArrowDownRight className="h-3.5 w-3.5" />,
  },
  transfer: {
    label: "Transfer",
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
  oms_lock: {
    label: "OMS Lock",
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
  oms_unlock: {
    label: "OMS Unlock",
    color: "text-gray-500",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: <ArrowDownRight className="h-3.5 w-3.5" />,
  },
}

export default function LedgerPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [warehouseFilter, setWarehouseFilter] = useState("all")

  const filtered = mockLedger.filter((entry) => {
    const matchSearch =
      !search ||
      entry.skuCode.toLowerCase().includes(search.toLowerCase()) ||
      entry.productName.toLowerCase().includes(search.toLowerCase()) ||
      entry.referenceNo.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || entry.type === typeFilter
    const matchWh = warehouseFilter === "all" || entry.warehouseId === warehouseFilter
    return matchSearch && matchType && matchWh
  })

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Ledger</h1>
            <p className="text-muted-foreground">Full stock movement history across all warehouses</p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SKU, product, or reference no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="adjustment">Adjustment</SelectItem>
              <SelectItem value="return">Return</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {mockWarehouses.map((wh) => (
                <SelectItem key={wh.id} value={wh.id}>
                  {wh.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ledger Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                    <th className="py-3 pl-4 pr-4 font-medium">Time</th>
                    <th className="py-3 pr-4 font-medium">SKU / Product</th>
                    <th className="py-3 pr-4 font-medium">Warehouse</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 text-right font-medium">Qty Change</th>
                    <th className="py-3 pr-4 text-right font-medium">Before</th>
                    <th className="py-3 pr-4 text-right font-medium">After</th>
                    <th className="py-3 pr-4 font-medium">Reference</th>
                    <th className="py-3 pr-4 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((entry, idx) => {
                    const cfg = ledgerTypeConfig[entry.type]
                    return (
                      <tr
                        key={entry.id}
                        className="border-b transition-colors hover:bg-muted/20 last:border-0"
                      >
                        <td className="py-3 pl-4 pr-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs">
                              {new Date(entry.timestamp).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{entry.productName}</p>
                          <p className="font-mono text-xs text-muted-foreground">{entry.skuCode}</p>
                        </td>
                        <td className="py-3 pr-4 text-sm text-muted-foreground">
                          {entry.warehouseName}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.color}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className={`py-3 pr-4 text-right font-semibold ${cfg.color}`}>
                          {entry.quantity > 0 ? "+" : ""}{entry.quantity}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground">
                          {entry.beforeStock}
                        </td>
                        <td className="py-3 pr-4 text-right font-medium">
                          {entry.afterStock}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                          {entry.referenceNo}
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">
                          {entry.note || "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t px-4 py-3 text-sm text-muted-foreground">
              Showing {filtered.length} of {mockLedger.length} entries
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
