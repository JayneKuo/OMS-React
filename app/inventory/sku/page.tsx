"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { DataTable, type Column } from "@/components/data-table/data-table"
import { FilterBar, type ActiveFilter, type FilterConfig } from "@/components/data-table/filter-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Clock3,
  Info,
  Lock,
  PackageCheck,
  ShieldAlert,
  Warehouse,
} from "lucide-react"
import { mockSkuInventory } from "@/lib/inventory/mock-data"
import type { SkuInventory } from "@/lib/inventory/types"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },
  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const statusConfig: Record<string, { label: string; cls: string }> = {
  normal: { label: "Normal", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  low: { label: "Low Stock", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  out: { label: "Out of Stock", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
  overstock: { label: "Overstock", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
}

type FocusView = "all" | "attention" | "locked" | "pending-sync" | "zero-atp" | "delayed-sync"

type InventoryRow = {
  id: string
  sku: SkuInventory
  atpHealth: "healthy" | "low" | "zero" | "negative"
  warehouseCount: number
  warehouseSummary: string
  warehouseCodes: string[]
  syncState: "synced" | "delayed" | "error" | "none"
  delayedWarehouseCount: number
  pendingSyncUnits: number
  hasPendingSync: boolean
  hasOmsLocks: boolean
  hasAttention: boolean
  netAvailable: number
  reservedUnits: number
  formulaText: string
  lastUpdatedLabel: string
}

const filterConfigs: FilterConfig[] = [
  {
    id: "status",
    label: "Status",
    type: "multiple",
    options: [
      { id: "normal", label: "Normal", value: "normal" },
      { id: "low", label: "Low Stock", value: "low" },
      { id: "out", label: "Out of Stock", value: "out" },
      { id: "overstock", label: "Overstock", value: "overstock" },
    ],
  },
  {
    id: "atpBucket",
    label: "ATP",
    type: "multiple",
    options: [
      { id: "healthy", label: "Healthy", value: "healthy" },
      { id: "low", label: "Low", value: "low" },
      { id: "zero", label: "Zero", value: "zero" },
      { id: "negative", label: "Negative", value: "negative" },
    ],
  },
  {
    id: "lockState",
    label: "OMS Locks",
    type: "single",
    options: [
      { id: "with-locks", label: "With OMS Locks", value: "with-locks" },
      { id: "no-locks", label: "No OMS Locks", value: "no-locks" },
    ],
  },
  {
    id: "pendingSync",
    label: "Pending Sync",
    type: "single",
    options: [
      { id: "pending-sync", label: "Has Pending WMS Sync", value: "pending-sync" },
      { id: "sync-clear", label: "No Pending WMS Sync", value: "sync-clear" },
    ],
  },
  {
    id: "warehouse",
    label: "Warehouse",
    type: "multiple",
    options: Array.from(
      new Map(
        mockSkuInventory
          .flatMap((sku) => sku.warehouseBreakdown)
          .map((warehouse) => [
            warehouse.warehouseId,
            {
              id: warehouse.warehouseId,
              label: `${warehouse.warehouseCode} · ${warehouse.warehouseName}`,
              value: warehouse.warehouseId,
            },
          ])
      ).values()
    ),
  },
]

const focusOptions: Array<{ id: FocusView; label: string; description: string }> = [
  { id: "all", label: "All", description: "Everything in the current filter result" },
  { id: "attention", label: "Needs Attention", description: "Low, zero, or negative ATP" },
  { id: "locked", label: "OMS Locked", description: "Rows with OMS occupancy" },
  { id: "pending-sync", label: "Pending Sync", description: "Rows waiting for WMS sync catch-up" },
  { id: "zero-atp", label: "Zero ATP", description: "ATP already exhausted" },
  { id: "delayed-sync", label: "Delayed Sync", description: "Warehouse sync is delayed or errored" },
]

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getAtpHealth(sku: SkuInventory): InventoryRow["atpHealth"] {
  if (sku.atpUnits < 0) return "negative"
  if (sku.atpUnits === 0) return "zero"
  if (sku.atpUnits < sku.safetyStock) return "low"
  return "healthy"
}

function buildInventoryRow(sku: SkuInventory): InventoryRow {
  const syncStatuses = sku.warehouseBreakdown.map((warehouse) => warehouse.syncStatus)
  const syncState = syncStatuses.includes("error")
    ? "error"
    : syncStatuses.includes("delayed")
      ? "delayed"
      : syncStatuses.length > 0
        ? "synced"
        : "none"

  const delayedWarehouseCount = sku.warehouseBreakdown.filter(
    (warehouse) => warehouse.syncStatus === "delayed" || warehouse.syncStatus === "error"
  ).length

  const warehouseCodes = sku.warehouseBreakdown.map((warehouse) => warehouse.warehouseCode)
  const topWarehouses = warehouseCodes.slice(0, 2).join(", ")
  const remainingWarehouses = Math.max(0, warehouseCodes.length - 2)
  const warehouseSummary = sku.warehouseBreakdown.length === 0
    ? "No warehouse data"
    : remainingWarehouses > 0
      ? `${topWarehouses} +${remainingWarehouses}`
      : topWarehouses

  const atpHealth = getAtpHealth(sku)

  return {
    id: sku.skuId,
    sku,
    atpHealth,
    warehouseCount: sku.warehouseBreakdown.length,
    warehouseSummary,
    warehouseCodes,
    syncState,
    delayedWarehouseCount,
    pendingSyncUnits: sku.omsLocks.pendingWmsSync,
    hasPendingSync: sku.omsLocks.pendingWmsSync > 0,
    hasOmsLocks: sku.omsLockTotal > 0,
    hasAttention: atpHealth !== "healthy",
    netAvailable: sku.wmsAvailable - sku.wmsOpenOrder,
    reservedUnits: sku.omsLockTotal,
    formulaText: `${sku.wmsAvailable} - ${sku.wmsOpenOrder} - ${sku.omsLockTotal}`,
    lastUpdatedLabel: formatDate(sku.lastUpdated),
  }
}

function getFilterValues(activeFilters: ActiveFilter[], filterId: string) {
  return activeFilters
    .filter((filter) => filter.filterId === filterId)
    .map((filter) => filter.optionValue)
}

function atpTextClass(row: InventoryRow) {
  switch (row.atpHealth) {
    case "negative":
    case "zero":
      return "text-red-600 dark:text-red-400"
    case "low":
      return "text-yellow-600 dark:text-yellow-400"
    default:
      return "text-green-600 dark:text-green-400"
  }
}

export default function SkuInventoryPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [focusView, setFocusView] = useState<FocusView>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const rows = useMemo(() => mockSkuInventory.map(buildInventoryRow), [])

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const statusValues = getFilterValues(activeFilters, "status")
    const atpValues = getFilterValues(activeFilters, "atpBucket")
    const lockValues = getFilterValues(activeFilters, "lockState")
    const pendingValues = getFilterValues(activeFilters, "pendingSync")
    const warehouseValues = getFilterValues(activeFilters, "warehouse")

    return rows.filter((row) => {
      const matchesSearch = !normalizedSearch || [
        row.sku.skuCode,
        row.sku.productName,
        row.sku.category,
        ...row.warehouseCodes,
        ...row.sku.warehouseBreakdown.map((warehouse) => warehouse.warehouseName),
      ].some((value) => value.toLowerCase().includes(normalizedSearch))

      const matchesStatus = statusValues.length === 0 || statusValues.includes(row.sku.status)
      const matchesAtp = atpValues.length === 0 || atpValues.includes(row.atpHealth)
      const matchesLocks = lockValues.length === 0 || lockValues.some((value) => {
        if (value === "with-locks") return row.hasOmsLocks
        if (value === "no-locks") return !row.hasOmsLocks
        return true
      })
      const matchesPending = pendingValues.length === 0 || pendingValues.some((value) => {
        if (value === "pending-sync") return row.hasPendingSync
        if (value === "sync-clear") return !row.hasPendingSync
        return true
      })
      const matchesWarehouse = warehouseValues.length === 0 || row.sku.warehouseBreakdown.some(
        (warehouse) => warehouseValues.includes(warehouse.warehouseId)
      )

      const matchesFocus = (() => {
        switch (focusView) {
          case "attention":
            return row.hasAttention
          case "locked":
            return row.hasOmsLocks
          case "pending-sync":
            return row.hasPendingSync
          case "zero-atp":
            return row.sku.atpUnits <= 0
          case "delayed-sync":
            return row.syncState === "delayed" || row.syncState === "error"
          default:
            return true
        }
      })()

      return matchesSearch && matchesStatus && matchesAtp && matchesLocks && matchesPending && matchesWarehouse && matchesFocus
    })
  }, [activeFilters, focusView, rows, search])

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [currentPage, filteredRows, pageSize])

  const summary = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => {
        acc.totalAtp += row.sku.atpUnits
        acc.totalNetAvailable += row.netAvailable
        acc.totalReserved += row.reservedUnits
        if (row.hasPendingSync) acc.pendingSyncSkus += 1
        if (row.syncState === "delayed" || row.syncState === "error") acc.delayedSyncSkus += 1
        if (row.hasAttention) acc.attentionSkus += 1
        return acc
      },
      {
        totalAtp: 0,
        totalNetAvailable: 0,
        totalReserved: 0,
        pendingSyncSkus: 0,
        delayedSyncSkus: 0,
        attentionSkus: 0,
      }
    )
  }, [filteredRows])

  const columns = useMemo<Column<InventoryRow>[]>(() => [
    {
      id: "sku",
      header: "SKU / Product",
      width: "280px",
      cell: (row) => {
        const status = statusConfig[row.sku.status]
        return (
          <div className="space-y-2 py-1.5">
            <div>
              <p className="font-medium leading-tight">{row.sku.productName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{row.sku.skuCode}</span>
                <span>·</span>
                <span>{row.sku.category}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                {status.label}
              </span>
              {row.hasPendingSync && (
                <Badge variant="outline" className="border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-300">
                  Pending sync
                </Badge>
              )}
              {row.hasAttention && (
                <Badge variant="outline" className="border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300">
                  Review ATP
                </Badge>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: "atp",
      header: "ATP",
      width: "150px",
      cell: (row) => (
        <div className="space-y-1 py-1.5">
          <div className={`text-lg font-bold ${atpTextClass(row)}`}>{row.sku.atpUnits}</div>
          <p className="text-[11px] text-muted-foreground">{row.formulaText}</p>
        </div>
      ),
    },
    {
      id: "available",
      header: "Available",
      width: "170px",
      cell: (row) => (
        <div className="space-y-1 py-1.5 text-right">
          <div className="font-semibold">{row.netAvailable}</div>
          <p className="text-[11px] text-muted-foreground">{row.sku.wmsAvailable} avail - {row.sku.wmsOpenOrder} OO</p>
        </div>
      ),
    },
    {
      id: "reserved",
      header: "Reserved",
      width: "170px",
      cell: (row) => (
        <div className="space-y-1 py-1.5 text-right">
          {row.reservedUnits > 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  {row.reservedUnits} OMS
                  <Info className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                <div className="space-y-1">
                  <div>Open order: {row.sku.omsLocks.openOrder}</div>
                  <div>Locked: {row.sku.omsLocks.locked}</div>
                  <div>Allocated: {row.sku.omsLocks.allocated}</div>
                  <div>Pending WMS sync: {row.sku.omsLocks.pendingWmsSync}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
          <p className="text-[11px] text-muted-foreground">OMS occupancy bucket</p>
        </div>
      ),
    },
    {
      id: "pendingSync",
      header: "Pending Sync",
      width: "150px",
      cell: (row) => (
        <div className="space-y-1 py-1.5 text-right">
          {row.hasPendingSync ? (
            <>
              <span className="font-semibold text-purple-700 dark:text-purple-300">{row.pendingSyncUnits}</span>
              <p className="text-[11px] text-muted-foreground">Already included in Reserved</p>
            </>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      ),
    },
    {
      id: "inbound",
      header: "Inbound",
      width: "120px",
      cell: (row) => (
        <div className="py-1.5 text-right">
          {row.sku.inbound > 0 ? (
            <span className="font-medium text-blue-600 dark:text-blue-400">+{row.sku.inbound}</span>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          )}
        </div>
      ),
    },
    {
      id: "warehouses",
      header: "Warehouses / Sync",
      width: "220px",
      cell: (row) => (
        <div className="space-y-1.5 py-1.5">
          <p className="font-medium">{row.warehouseCount === 0 ? "No warehouse data" : row.warehouseSummary}</p>
          <div className="flex flex-wrap gap-2">
            {row.syncState === "synced" && <Badge variant="outline">Synced</Badge>}
            {row.syncState === "delayed" && (
              <Badge variant="outline" className="border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300">
                {row.delayedWarehouseCount} delayed
              </Badge>
            )}
            {row.syncState === "error" && (
              <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                Sync error
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      width: "140px",
      cell: (row) => <div className="py-1.5 text-xs text-muted-foreground">{row.lastUpdatedLabel}</div>,
    },
    {
      id: "actions",
      header: "",
      width: "110px",
      cell: (row) => (
        <div className="py-1.5 text-right">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(event) => {
              event.stopPropagation()
              router.push(`/inventory/sku/${row.sku.skuId}`)
            }}
          >
            Details <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ], [router])

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">SKU Inventory</h1>
              <p className="text-muted-foreground">
                Mixed ERP/WMS view: start with ATP, available, and reserved; drill into sync and lock detail only when needed.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border px-3 py-1">ATP = Available - Reserved</span>
              <span className="rounded-full border px-3 py-1">Available = WMS Available - WMS Open Order</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Filtered SKUs</p>
                    <p className="text-2xl font-bold">{filteredRows.length}</p>
                  </div>
                  <Boxes className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
            <Card className={summary.attentionSkus > 0 ? "border-yellow-200 bg-yellow-50/40 dark:bg-yellow-950/20" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.attentionSkus}</p>
                  </div>
                  <ShieldAlert className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total ATP</p>
                    <p className="text-2xl font-bold">{summary.totalAtp}</p>
                  </div>
                  <PackageCheck className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Before OMS</p>
                    <p className="text-2xl font-bold">{summary.totalNetAvailable}</p>
                  </div>
                  <Warehouse className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Reserved / Pending Sync</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.totalReserved}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{summary.pendingSyncSkus} SKU(s) pending sync · {summary.delayedSyncSkus} delayed sync</p>
                  </div>
                  <Lock className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-blue-500" />
                Inventory logic at a glance
              </CardTitle>
              <CardDescription>
                Keep the list decision-first: ATP and net available are the primary numbers; reserved and pending sync explain why they move.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Primary number</p>
                  <p className="mt-1 text-muted-foreground">ATP is what OMS can safely expose now.</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Available</p>
                  <p className="mt-1 text-muted-foreground">Net warehouse availability after WMS open orders.</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="font-medium">Reserved</p>
                  <p className="mt-1 text-muted-foreground">OMS occupancy. Pending WMS sync stays inside this bucket, not on top of it.</p>
                </div>
              </div>
              {summary.attentionSkus > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50/60 p-3 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    {summary.attentionSkus} SKU(s) in the current result need review because ATP is low, zero, or negative.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {focusOptions.map((option) => {
              const active = focusView === option.id
              return (
                <Button
                  key={option.id}
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="h-auto min-h-9 px-3 py-2 text-left"
                  onClick={() => {
                    setFocusView(option.id)
                    setCurrentPage(1)
                  }}
                >
                  <div>
                    <div className="text-xs font-medium">{option.label}</div>
                    <div className="text-[11px] opacity-80">{option.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>

          <FilterBar
            searchValue={search}
            searchPlaceholder="Search SKU, product, warehouse code, or warehouse name..."
            onSearchChange={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            filters={filterConfigs}
            onFiltersChange={(filters) => {
              setActiveFilters(filters)
              setCurrentPage(1)
            }}
          />

          <Card>
            <CardContent className="p-6">
              <DataTable
                data={paginatedRows}
                columns={columns}
                currentPage={currentPage}
                totalItems={filteredRows.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                onRowClick={(row) => router.push(`/inventory/sku/${row.sku.skuId}`)}
                emptyMessage="No inventory rows match the current filters"
              />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}