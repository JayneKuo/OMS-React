"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle,
  Download,
  PackageCheck,
  Plus,
  RefreshCw,
  Send,
  Truck,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { OrderTable } from "@/components/orders/order-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar, type ActiveFilter, type FilterConfig } from "@/components/data-table/filter-bar"
import type { AdvancedSearchValues, SearchField } from "@/components/data-table/advanced-search-dialog"
import { useDemoOrders } from "@/lib/orders/demo-store"
import type { Order, OrderStatus } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { title: "All Orders", href: "/orders" },
  { title: "Create Order", href: "/orders/create" },
  { title: "Pending", href: "/orders?status=pending" },
  { title: "Processing", href: "/orders?status=processing" },
  { title: "Shipped", href: "/orders?status=shipped" },
  { title: "Delivered", href: "/orders?status=delivered" },
  { title: "Cancelled", href: "/orders?status=cancelled" },
  { title: "AI Exception Handler", href: "/orders/exception-ai" },
]

const STATUS_FILTER_OPTIONS: { label: string; value: OrderStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Awaiting Payment", value: "awaiting_payment" },
  { label: "Processing", value: "processing" },
  { label: "Warehouse Processing", value: "warehouse_processing" },
  { label: "Partial Shipped", value: "partially_shipped" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "On Hold", value: "on_hold" },
  { label: "Exception", value: "exception" },
  { label: "Backorder", value: "backorder" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Payment Failed", value: "payment_failed" },
]

const sidebarStatusMap: Record<string, OrderStatus> = {
  pending: "pending",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
}

type WorkQueue = "all" | "action_required" | "ready" | "warehouse" | "shipped" | "closed"
type ListType = "current" | "history"

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).map((value) => ({ id: value, label: value, value }))
}

function matchesText(order: Order, rawQuery: string) {
  const query = rawQuery.trim().toLowerCase()
  if (!query) return true

  return (
    order.id.toLowerCase().includes(query) ||
    order.channelOrderNo.toLowerCase().includes(query) ||
    order.referenceNo.toLowerCase().includes(query) ||
    order.customer.name.toLowerCase().includes(query) ||
    order.channelName.toLowerCase().includes(query) ||
    order.company.toLowerCase().includes(query) ||
    order.lineItems.some(
      (item) =>
        item.channelSku.toLowerCase().includes(query) ||
        item.channelProductName.toLowerCase().includes(query) ||
        (item.omsSku ?? "").toLowerCase().includes(query) ||
        (item.omsProductName ?? "").toLowerCase().includes(query)
    )
  )
}

function matchesBatch(order: Order, fields: string[], values: string[]) {
  if (values.length === 0) return true
  const normalized = values.map((value) => value.toLowerCase())
  const candidates = fields.flatMap((field) => {
    if (field === "orderNo") return [order.id]
    if (field === "channelOrderNo") return [order.channelOrderNo]
    if (field === "referenceNo") return [order.referenceNo]
    if (field === "sku") return order.lineItems.flatMap((item) => [item.channelSku, item.omsSku ?? ""])
    return []
  })

  return candidates.some((candidate) => normalized.some((value) => candidate.toLowerCase().includes(value)))
}

function resolveOrderLines(order: Order): Order {
  const lineItems = order.lineItems.map((item) => ({
    ...item,
    omsSku: item.omsSku ?? `AUTO-${item.channelSku}`,
    omsProductName: item.omsProductName ?? item.channelProductName,
    omsMatched: true,
    warehouseId: item.warehouseId ?? "wh-demo",
    warehouseName: item.warehouseName ?? "SZ-WH-01",
    warehouseSku: item.warehouseSku ?? `WH-${item.channelSku.slice(-6)}`,
    availQty: Math.max(item.availQty, item.qty),
    backorderQty: 0,
    warehouseMapped: true,
    issues: [],
  }))

  return {
    ...order,
    status: "processing",
    hasExceptions: false,
    holdReason: null,
    lineItems,
    warehouseName: lineItems[0]?.warehouseName ?? order.warehouseName,
  }
}

export default function OrdersPage() {
  const router = useRouter()
  const { orders, replaceOrders, resetOrders } = useDemoOrders()
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedValues, setAdvancedValues] = React.useState<AdvancedSearchValues>({})
  const [batchCriteria, setBatchCriteria] = React.useState<Record<string, string[]>>({})
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [listType, setListType] = React.useState<ListType>("current")
  const [queue, setQueue] = React.useState<WorkQueue>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  React.useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("status")
    if (status && sidebarStatusMap[status]) {
      setActiveFilters([
        {
          filterId: "status",
          filterLabel: "Status",
          optionId: status,
          optionLabel: STATUS_FILTER_OPTIONS.find((item) => item.value === sidebarStatusMap[status])?.label ?? status,
          optionValue: sidebarStatusMap[status],
        },
      ])
    }
  }, [])

  const filters: FilterConfig[] = React.useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        type: "multiple",
        options: STATUS_FILTER_OPTIONS.map((status) => ({ id: status.value, label: status.label, value: status.value })),
      },
      {
        id: "channel",
        label: "Channel",
        type: "multiple",
        options: uniqueOptions(orders.map((order) => order.channelName)),
      },
      {
        id: "warehouse",
        label: "Warehouse",
        type: "multiple",
        options: uniqueOptions(orders.flatMap((order) => order.lineItems.map((line) => line.warehouseName ?? "Unassigned"))),
      },
      {
        id: "payment",
        label: "Payment",
        type: "multiple",
        options: [
          { id: "paid", label: "Paid", value: "paid" },
          { id: "unpaid", label: "Unpaid", value: "unpaid" },
        ],
      },
      {
        id: "fulfillment",
        label: "Fulfillment",
        type: "multiple",
        options: [
          { id: "hasShipment", label: "Has Shipment", value: "hasShipment" },
          { id: "noShipment", label: "No Shipment", value: "noShipment" },
          { id: "splitWarehouse", label: "Split Warehouse", value: "splitWarehouse" },
          { id: "unassigned", label: "Unassigned", value: "unassigned" },
        ],
      },
      {
        id: "risk",
        label: "Risk",
        type: "multiple",
        options: [
          { id: "hasExceptions", label: "Has Exceptions", value: "hasExceptions" },
          { id: "onHold", label: "On Hold", value: "onHold" },
          { id: "backorder", label: "Backorder", value: "backorder" },
          { id: "expedited", label: "Expedited", value: "expedited" },
          { id: "international", label: "International", value: "international" },
        ],
      },
    ],
    [orders]
  )

  const advancedSearchFields: SearchField[] = [
    {
      id: "smart",
      label: "Smart Match",
      type: "batch",
      maxItems: 100,
      placeholder: "SO1086013\n113-3056495-6289014\nUBP-40010-6PK",
    },
    { id: "customer", label: "Customer", placeholder: "Customer name" },
    { id: "referenceNo", label: "Reference No.", type: "batch", maxItems: 100 },
    { id: "sku", label: "SKU", type: "batch", maxItems: 100 },
  ]

  const counts = React.useMemo(() => {
    const open = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length
    const actionRequired = orders.filter((order) => order.hasExceptions || order.status === "on_hold" || !order.isPaid).length
    const ready = orders.filter((order) => !order.hasExceptions && order.isPaid && !order.hasShipment && order.status !== "cancelled").length
    const warehouse = orders.filter((order) => order.status === "warehouse_processing").length
    const shipped = orders.filter((order) => order.hasShipment && order.status !== "delivered").length
    const closed = orders.filter((order) => ["delivered", "cancelled"].includes(order.status)).length

    return { open, actionRequired, ready, warehouse, shipped, closed }
  }, [orders])

  const filtered = React.useMemo(() => {
    let result = orders

    result = result.filter((order) =>
      listType === "current" ? !["delivered", "cancelled"].includes(order.status) : ["delivered", "cancelled"].includes(order.status)
    )

    if (queue === "action_required") {
      result = result.filter((order) => order.hasExceptions || order.status === "on_hold" || !order.isPaid)
    } else if (queue === "ready") {
      result = result.filter((order) => !order.hasExceptions && order.isPaid && !order.hasShipment && order.status !== "cancelled")
    } else if (queue === "warehouse") {
      result = result.filter((order) => order.status === "warehouse_processing")
    } else if (queue === "shipped") {
      result = result.filter((order) => order.hasShipment && order.status !== "delivered")
    } else if (queue === "closed") {
      result = result.filter((order) => ["delivered", "cancelled"].includes(order.status))
    }

    result = result.filter((order) => matchesText(order, search))

    const filtersById = activeFilters.reduce<Record<string, string[]>>((acc, filter) => {
      acc[filter.filterId] = [...(acc[filter.filterId] ?? []), filter.optionValue]
      return acc
    }, {})

    if (filtersById.status?.length) {
      result = result.filter((order) => filtersById.status.includes(order.status))
    }
    if (filtersById.channel?.length) {
      result = result.filter((order) => filtersById.channel.includes(order.channelName))
    }
    if (filtersById.warehouse?.length) {
      result = result.filter((order) =>
        order.lineItems.some((line) => filtersById.warehouse.includes(line.warehouseName ?? "Unassigned"))
      )
    }
    if (filtersById.payment?.length) {
      result = result.filter((order) =>
        filtersById.payment.includes(order.isPaid ? "paid" : "unpaid")
      )
    }
    if (filtersById.fulfillment?.length) {
      result = result.filter((order) => {
        const warehouses = new Set(order.lineItems.map((line) => line.warehouseName).filter(Boolean))
        return filtersById.fulfillment.some((filter) => {
          if (filter === "hasShipment") return order.hasShipment
          if (filter === "noShipment") return !order.hasShipment
          if (filter === "splitWarehouse") return warehouses.size > 1
          if (filter === "unassigned") return order.lineItems.some((line) => !line.warehouseName)
          return true
        })
      })
    }
    if (filtersById.risk?.length) {
      result = result.filter((order) =>
        filtersById.risk.some((filter) => {
          if (filter === "hasExceptions") return order.hasExceptions
          if (filter === "onHold") return order.status === "on_hold"
          if (filter === "backorder") return order.status === "backorder" || order.lineItems.some((line) => line.backorderQty > 0)
          if (filter === "expedited") return order.isExpedited
          if (filter === "international") return !order.isDomestic
          return true
        })
      )
    }

    const smartValues = advancedValues.smart
    if (Array.isArray(smartValues) && smartValues.length > 0) {
      result = result.filter((order) => matchesBatch(order, ["orderNo", "channelOrderNo", "referenceNo", "sku"], smartValues))
    }
    const referenceValues = advancedValues.referenceNo
    if (Array.isArray(referenceValues) && referenceValues.length > 0) {
      result = result.filter((order) => referenceValues.some((value) => order.referenceNo.toLowerCase().includes(value.toLowerCase())))
    }
    const skuValues = advancedValues.sku
    if (Array.isArray(skuValues) && skuValues.length > 0) {
      result = result.filter((order) => matchesBatch(order, ["sku"], skuValues))
    }
    if (typeof advancedValues.customer === "string" && advancedValues.customer.trim()) {
      result = result.filter((order) => order.customer.name.toLowerCase().includes(advancedValues.customer.toLowerCase()))
    }

    Object.entries(batchCriteria).forEach(([field, values]) => {
      result = result.filter((order) => matchesBatch(order, [field], values))
    })

    return result
  }, [activeFilters, advancedValues, batchCriteria, listType, orders, queue, search])

  React.useEffect(() => {
    setCurrentPage(1)
    setSelectedIds([])
  }, [activeFilters, advancedValues, batchCriteria, listType, queue, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = React.useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, pageSize, safePage])

  function updateSelectedOrders(updater: (order: Order) => Order, message: string) {
    if (selectedIds.length === 0) {
      toast.warning("Select at least one order first")
      return
    }
    replaceOrders(orders.map((order) => (selectedIds.includes(order.id) ? updater(order) : order)))
    toast.success(message, { description: `${selectedIds.length} order(s) updated in demo data.` })
  }

  function updateSingleOrder(target: Order, updater: (order: Order) => Order, message: string) {
    replaceOrders(orders.map((order) => (order.id === target.id ? updater(order) : order)))
    toast.success(message, { description: `${target.id} updated in demo data.` })
  }

  function handleReleaseSelected() {
    updateSelectedOrders(
      (order) => ({
        ...order,
        status: order.hasExceptions ? "exception" : "warehouse_processing",
        holdReason: order.hasExceptions ? order.holdReason : null,
      }),
      "Release workflow completed"
    )
  }

  function handleResolveSelected() {
    updateSelectedOrders(resolveOrderLines, "Exceptions resolved")
  }

  function handleShipSelected() {
    updateSelectedOrders(
      (order) => ({
        ...order,
        status: order.status === "delivered" ? order.status : "shipped",
        hasShipment: true,
        shipDate: order.shipDate ?? new Date().toISOString(),
      }),
      "Demo shipments created"
    )
  }

  function handleCancelSelected() {
    updateSelectedOrders((order) => ({ ...order, status: "cancelled", holdReason: "Cancelled from order workspace" }), "Orders cancelled")
  }

  function handleExport() {
    toast.success("Export prepared", { description: `${filtered.length} filtered order(s) would be exported.` })
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Orders">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Sales Order Management</h1>
            <p className="text-sm text-muted-foreground">
              Find, triage, release, ship, and audit marketplace orders from one ERP workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={resetOrders}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Demo
            </Button>
            <Button size="sm" onClick={() => router.push("/orders/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Open Orders</div>
                  <div className="mt-1 text-2xl font-bold">{counts.open}</div>
                </div>
                <PackageCheck className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Action Required</div>
                  <div className="mt-1 text-2xl font-bold">{counts.actionRequired}</div>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Ready to Release</div>
                  <div className="mt-1 text-2xl font-bold">{counts.ready}</div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">In Warehouse</div>
                  <div className="mt-1 text-2xl font-bold">{counts.warehouse}</div>
                </div>
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-slate-400">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Closed</div>
                  <div className="mt-1 text-2xl font-bold">{counts.closed}</div>
                </div>
                <XCircle className="h-5 w-5 text-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <Tabs value={listType} onValueChange={(value) => setListType(value as ListType)}>
              <TabsList>
                <TabsTrigger value="current">
                  Current
                  <Badge variant="secondary" className="ml-2">{counts.open}</Badge>
                </TabsTrigger>
                <TabsTrigger value="history">
                  History
                  <Badge variant="secondary" className="ml-2">{counts.closed}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={queue} onValueChange={(value) => setQueue(value as WorkQueue)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="action_required">Action</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <FilterBar
            searchValue={search}
            searchPlaceholder="Search order no., channel order #, reference, SKU, customer..."
            onSearchChange={setSearch}
            filters={filters}
            onFiltersChange={setActiveFilters}
            advancedSearchFields={advancedSearchFields}
            onAdvancedSearch={(values) => setAdvancedValues(values)}
            enableBatchSearch
            batchSearchFields={[
              { label: "OMS Order No.", value: "orderNo" },
              { label: "Channel Order No.", value: "channelOrderNo" },
              { label: "Reference No.", value: "referenceNo" },
              { label: "SKU", value: "sku" },
            ]}
            onBatchSearch={setBatchCriteria}
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-3 rounded-lg border bg-primary/5 p-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm">
              <span className="font-semibold">{selectedIds.length}</span> selected
              <span className="ml-2 text-muted-foreground">Use bulk actions to close the fulfillment loop.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleResolveSelected}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Resolve
              </Button>
              <Button variant="outline" size="sm" onClick={handleReleaseSelected}>
                <Send className="mr-2 h-4 w-4" />
                Release
              </Button>
              <Button variant="outline" size="sm" onClick={handleShipSelected}>
                <Truck className="mr-2 h-4 w-4" />
                Ship
              </Button>
              <Button variant="outline" size="sm" className="text-destructive" onClick={handleCancelSelected}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <OrderTable
          orders={paginated}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onOrderOpen={(order) => router.push(`/orders/${order.id}`)}
          onResolveOrder={(order) => updateSingleOrder(order, resolveOrderLines, "Exceptions resolved")}
          onReleaseOrder={(order) =>
            updateSingleOrder(
              order,
              (current) => ({
                ...current,
                status: current.hasExceptions ? "exception" : "warehouse_processing",
                holdReason: current.hasExceptions ? current.holdReason : null,
              }),
              order.hasExceptions ? "Release blocked by exceptions" : "Released to warehouse"
            )
          }
          onShipOrder={(order) =>
            updateSingleOrder(
              order,
              (current) => ({
                ...current,
                status: current.status === "delivered" ? current.status : "shipped",
                hasShipment: true,
                shipDate: current.shipDate ?? new Date().toISOString(),
              }),
              "Demo shipment created"
            )
          }
          onCancelOrder={(order) =>
            updateSingleOrder(
              order,
              (current) => ({ ...current, status: "cancelled", holdReason: "Cancelled from order workspace" }),
              "Order cancelled"
            )
          }
        />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>
            Showing {(safePage - 1) * pageSize + (paginated.length ? 1 : 0)}-{Math.min(safePage * pageSize, filtered.length)} of {filtered.length} filtered orders / {orders.length} total
          </span>
          <div className="flex items-center gap-2">
            {[10, 20, 50].map((size) => (
              <Button
                key={size}
                variant={pageSize === size ? "default" : "outline"}
                size="sm"
                className={cn("h-8 px-2 text-xs", pageSize === size && "text-primary-foreground")}
                onClick={() => setPageSize(size)}
              >
                {size}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage(1)}>
              First
            </Button>
            <Button variant="outline" size="sm" className="h-8" disabled={safePage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
              Prev
            </Button>
            <span className="px-2">Page {safePage} / {totalPages}</span>
            <Button variant="outline" size="sm" className="h-8" disabled={safePage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
