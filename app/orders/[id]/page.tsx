"use client"

import * as React from "react"
import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  FileText,
  History,
  Loader2,
  MoreHorizontal,
  Package,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
  User,
  Wallet,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MainLayout } from "@/components/layout/main-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoOrders } from "@/lib/orders/demo-store"
import type { Order, OrderLineItem, OrderStatus } from "@/lib/orders/types"
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

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "border-slate-200 bg-slate-50 text-slate-700" },
  awaiting_payment: { label: "Awaiting Payment", className: "border-yellow-200 bg-yellow-50 text-yellow-800" },
  processing: { label: "Processing", className: "border-blue-200 bg-blue-50 text-blue-800" },
  warehouse_processing: { label: "Warehouse Processing", className: "border-indigo-200 bg-indigo-50 text-indigo-800" },
  partially_shipped: { label: "Partial Shipped", className: "border-cyan-200 bg-cyan-50 text-cyan-800" },
  shipped: { label: "Shipped", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  delivered: { label: "Delivered", className: "border-green-200 bg-green-50 text-green-800" },
  on_hold: { label: "On Hold", className: "border-orange-200 bg-orange-50 text-orange-800" },
  exception: { label: "Exception", className: "border-red-200 bg-red-50 text-red-700" },
  backorder: { label: "Backorder", className: "border-amber-200 bg-amber-50 text-amber-800" },
  cancelled: { label: "Cancelled", className: "border-slate-200 bg-slate-50 text-slate-500" },
  payment_failed: { label: "Payment Failed", className: "border-red-200 bg-red-50 text-red-700" },
}

const issueLabels: Record<string, string> = {
  sku_not_exist: "SKU Not Found",
  oms_not_matched: "OMS Unmatched",
  no_warehouse: "No Warehouse",
  out_of_stock: "Out of Stock",
  insufficient_stock: "Low Stock",
  backorder: "Backorder",
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
}

function compactDate(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("en-US")
}

function getWarehouseGroups(order: Order) {
  const groups = new Map<string, OrderLineItem[]>()
  order.lineItems.forEach((item) => {
    const key = item.warehouseName ?? "Unassigned"
    groups.set(key, [...(groups.get(key) ?? []), item])
  })
  return Array.from(groups.entries())
}

function getReadyQty(order: Order) {
  return order.lineItems.reduce((sum, item) => {
    const blocked = item.issues.some((issue) =>
      ["sku_not_exist", "oms_not_matched", "no_warehouse", "out_of_stock"].includes(issue)
    )
    return blocked || !item.warehouseName ? sum : sum + Math.min(item.qty, item.availQty)
  }, 0)
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

export default function SalesOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { orders, upsertOrder, updateOrder } = useDemoOrders()
  const order = orders.find((item) => item.id === params.id) ?? orders[0]
  const [activeMainTab, setActiveMainTab] = React.useState("items")
  const [activeSideTab, setActiveSideTab] = React.useState("routing")
  const [isLoading, setIsLoading] = React.useState(false)

  if (!order) return null

  const status = statusConfig[order.status]
  const warehouseGroups = getWarehouseGroups(order)
  const readyQty = getReadyQty(order)
  const exceptionItems = order.lineItems.filter((item) => item.issues.length > 0)
  const shipmentRecords = order.hasShipment
    ? [
        {
          id: "ship-1",
          shipmentNo: `SHP-${order.id}`,
          carrier: "Demo Carrier",
          trackingNo: `TRK${order.id.slice(-6)}`,
          warehouse: order.warehouseName ?? warehouseGroups[0]?.[0] ?? "Unassigned",
          qty: readyQty || order.totalQty,
          status: order.status === "delivered" ? "DELIVERED" : "SHIPPED",
          shipDate: order.shipDate ?? new Date().toISOString(),
        },
      ]
    : []
  const allocationRecords = warehouseGroups.map(([warehouse, items], index) => ({
    id: `alloc-${index + 1}`,
    warehouse,
    lineCount: items.length,
    qty: items.reduce((sum, item) => sum + item.qty, 0),
    readyQty: items.reduce((sum, item) => sum + Math.min(item.qty, Math.max(item.availQty, 0)), 0),
    status: warehouse === "Unassigned" ? "UNASSIGNED" : "ALLOCATED",
  }))
  const messageRecords = [
    { id: "msg-1", type: "Order Confirmation", recipient: order.customer.name, status: "Sent", time: order.ingestedAt },
    {
      id: "msg-2",
      type: order.hasShipment ? "Shipping Notice" : "Warehouse Release",
      recipient: order.customer.name,
      status: order.hasShipment ? "Sent" : "Draft",
      time: order.shipDate ?? order.orderDate,
    },
  ]
  const eventRecords = [
    { title: "Order Placed", time: order.orderDate, actor: order.customer.name, note: `${order.channelName} order received.` },
    { title: "Imported to OMS", time: order.ingestedAt, actor: "OMS Sync", note: `Reference ${order.referenceNo}` },
    {
      title: order.hasExceptions ? "Exception Detected" : "SKU Matched",
      time: order.ingestedAt,
      actor: "Order Engine",
      note: order.hasExceptions ? `${exceptionItems.length} line(s) need attention.` : "All lines passed SKU and stock checks.",
    },
    ...(order.hasShipment
      ? [{ title: "Shipment Created", time: order.shipDate, actor: "Warehouse", note: "Demo shipment generated." }]
      : []),
  ]
  const routingRecords = [
    {
      title: "Routing Started",
      time: order.ingestedAt,
      result: "Sales order entered allocation workflow.",
      active: true,
    },
    {
      title: order.hasExceptions ? "Routing Blocked" : "Warehouse Selected",
      time: order.ingestedAt,
      result: order.hasExceptions
        ? "Exception lines must be fixed before warehouse release."
        : `${allocationRecords.length} warehouse allocation record(s) created.`,
      active: !order.hasExceptions,
    },
    {
      title: order.hasShipment ? "Shipment Linked" : "Awaiting Shipment",
      time: order.shipDate ?? null,
      result: order.hasShipment ? `${shipmentRecords[0]?.shipmentNo} is linked to this order.` : "Shipment can be created after release.",
      active: order.hasShipment,
    },
  ]
  const progressSteps = [
    { key: "NEW", label: "Imported", description: "Order in OMS", time: order.ingestedAt, status: "completed" },
    {
      key: "ALLOCATED",
      label: "Allocated",
      description: `${readyQty}/${order.totalQty} units ready`,
      time: order.hasExceptions ? null : order.ingestedAt,
      status: order.hasExceptions ? "exception" : "completed",
    },
    {
      key: "WAREHOUSE",
      label: "Warehouse",
      description: "Pick and pack",
      time: ["warehouse_processing", "partially_shipped", "shipped", "delivered"].includes(order.status) ? order.ingestedAt : null,
      status:
        order.status === "cancelled"
          ? "cancelled"
          : ["warehouse_processing", "partially_shipped"].includes(order.status)
            ? "in-progress"
            : ["shipped", "delivered"].includes(order.status)
              ? "completed"
              : "pending",
    },
    {
      key: "SHIPPED",
      label: "Shipped",
      description: "Carrier tracking",
      time: order.shipDate,
      status: order.hasShipment ? "completed" : "pending",
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      description: "Order closed",
      time: order.status === "delivered" ? order.shipDate : null,
      status: order.status === "delivered" ? "completed" : "pending",
    },
  ]

  function handleRefresh() {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
    toast.success("Demo data refreshed")
  }

  function handleRelease() {
    updateOrder(order.id, (current) => ({
      ...current,
      status: current.hasExceptions ? "exception" : "warehouse_processing",
      holdReason: null,
    }))
    toast.success(order.hasExceptions ? "Release blocked: order still has exceptions" : "Order released to warehouse")
  }

  function handleCreateShipment() {
    updateOrder(order.id, (current) => ({
      ...current,
      status: current.status === "delivered" ? current.status : "shipped",
      hasShipment: true,
      shipDate: new Date().toISOString(),
    }))
    toast.success("Shipment created", { description: `${order.id} now has a demo shipment record.` })
  }

  function handleResolveExceptions() {
    updateOrder(order.id, (current) => {
      const lineItems = current.lineItems.map((item) => ({
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
      return { ...current, status: "processing", hasExceptions: false, lineItems, warehouseName: lineItems[0]?.warehouseName ?? null }
    })
    toast.success("Exceptions resolved", { description: "SKU mapping, warehouse assignment, and stock are fixed for demo." })
  }

  function handleDuplicate() {
    const copyId = `SO${Math.floor(9000000 + Math.random() * 999999)}`
    upsertOrder({
      ...order,
      id: copyId,
      channelOrderNo: `${order.channelOrderNo}-COPY`,
      referenceNo: `REF-${copyId}`,
      status: "pending",
      hasShipment: false,
      shipDate: null,
      ingestedAt: new Date().toISOString(),
      orderDate: new Date().toISOString(),
      lineItems: order.lineItems.map((item, index) => ({ ...item, id: `${copyId}-line-${index + 1}` })),
    })
    toast.success("Order copied", { description: `${copyId} created from ${order.id}.` })
    router.push(`/orders/${copyId}`)
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Orders">
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">{order.id}</h1>
                  <Badge variant="outline" className={status.className}>{status.label}</Badge>
                  <Badge variant="outline" className={order.isPaid ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-yellow-200 bg-yellow-50 text-yellow-800"}>
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </Badge>
                  <Badge variant="outline" className={order.hasShipment ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-700"}>
                    {order.hasShipment ? "Shipment Created" : "No Shipment"}
                  </Badge>
                  {order.hasExceptions && <Badge className="bg-red-600 text-white">Exception</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>Customer: {order.customer.name}</span>
                  <span>/</span>
                  <Clock className="h-3 w-3" />
                  <span>Created: {compactDate(order.orderDate)}</span>
                  <span>/</span>
                  <span>Channel: {order.channelName}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}/edit`)}>
                <Edit className="h-4 w-4" />
                <span className="ml-2">Edit Lines</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleRelease}>
                <Send className="h-4 w-4" />
                <span className="ml-2">Release</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleCreateShipment}>
                <Truck className="h-4 w-4" />
                <span className="ml-2">Ship</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="ml-2">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Order
                  </DropdownMenuItem>
                  {order.hasExceptions && (
                    <DropdownMenuItem onClick={handleResolveExceptions}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve Exceptions
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.success("Demo note added")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Add Note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {progressSteps.map((step, index) => {
                const Icon =
                  step.status === "completed"
                    ? CheckCircle
                    : step.status === "exception"
                      ? AlertCircle
                      : step.status === "cancelled"
                        ? XCircle
                        : step.status === "in-progress"
                          ? Loader2
                          : Package
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-1 flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          step.status === "completed" && "bg-green-100 text-green-800",
                          step.status === "in-progress" && "bg-blue-100 text-blue-800",
                          step.status === "exception" && "bg-red-100 text-red-800",
                          step.status === "cancelled" && "bg-gray-100 text-gray-700",
                          step.status === "pending" && "bg-gray-100 text-gray-400"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", step.status === "in-progress" && "animate-spin")} />
                      </div>
                      <div className="mt-2 text-center">
                        <div className="text-sm font-medium">{step.label}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{step.description}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{formatDate(step.time)}</div>
                      </div>
                    </div>
                    {index < progressSteps.length - 1 && (
                      <div className={cn("mx-2 h-0.5 flex-1", step.status === "completed" ? "bg-green-300" : "bg-gray-200")} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="allocation">Warehouse Allocation</TabsTrigger>
                <TabsTrigger value="shipments">Shipment Tracking</TabsTrigger>
                <TabsTrigger value="exceptions">
                  Exceptions
                  {exceptionItems.length > 0 && <Badge variant="secondary" className="ml-2">{exceptionItems.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="emails">Email History</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Product Line Items</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="whitespace-nowrap bg-muted/50">
                            <TableHead className="p-3 text-sm font-medium">Line</TableHead>
                            <TableHead className="p-3 text-sm font-medium">Product</TableHead>
                            <TableHead className="p-3 text-center text-sm font-medium">Order Qty</TableHead>
                            <TableHead className="p-3 text-center text-sm font-medium">Available</TableHead>
                            <TableHead className="p-3 text-sm font-medium">OMS SKU</TableHead>
                            <TableHead className="p-3 text-sm font-medium">Warehouse</TableHead>
                            <TableHead className="p-3 text-right text-sm font-medium">Unit Price</TableHead>
                            <TableHead className="p-3 text-right text-sm font-medium">Line Amount</TableHead>
                            <TableHead className="p-3 text-center text-sm font-medium">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {order.lineItems.map((item, index) => {
                            const isReady = item.issues.length === 0 && Boolean(item.warehouseName)
                            return (
                              <TableRow key={item.id} className="hover:bg-muted/50">
                                <TableCell className="p-3 text-xs">
                                  <Badge variant="outline" className="bg-white text-xs">{String(index + 1).padStart(2, "0")}</Badge>
                                </TableCell>
                                <TableCell className="min-w-[240px] p-3 text-xs">
                                  <div className="space-y-1">
                                    <div className="text-sm font-semibold">{item.omsProductName ?? item.channelProductName}</div>
                                    <div className="font-mono text-muted-foreground">Channel SKU: {item.channelSku}</div>
                                    <div className="text-muted-foreground">Channel product: {item.channelProductName}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="p-3 text-center text-xs font-medium">{item.qty}</TableCell>
                                <TableCell className={cn("p-3 text-center text-xs font-medium", item.availQty < item.qty ? "text-red-600" : "text-green-600")}>
                                  {item.availQty}
                                </TableCell>
                                <TableCell className="p-3 font-mono text-xs">{item.omsSku ?? "-"}</TableCell>
                                <TableCell className="p-3 text-xs">{item.warehouseName ?? <span className="text-red-600">Unassigned</span>}</TableCell>
                                <TableCell className="p-3 text-right font-mono text-xs">USD {item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell className="p-3 text-right text-xs font-semibold">USD {(item.qty * item.unitPrice).toFixed(2)}</TableCell>
                                <TableCell className="p-3 text-center text-xs">
                                  {isReady ? (
                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Ready</Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Issue</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="border-t bg-muted/30 p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <FieldRow label="Total Qty:" value={order.totalQty} />
                        <FieldRow label="Ready Qty:" value={<span className="text-green-600">{readyQty}</span>} />
                        <FieldRow label="Exception Lines:" value={<span className={exceptionItems.length ? "text-red-600" : "text-green-600"}>{exceptionItems.length}</span>} />
                        <FieldRow label="Grand Total:" value={<span className="font-bold">USD {order.grandTotal.toFixed(2)}</span>} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="allocation" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Warehouse Allocation</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="p-3">Warehouse</TableHead>
                          <TableHead className="p-3">Lines</TableHead>
                          <TableHead className="p-3">Order Qty</TableHead>
                          <TableHead className="p-3">Ready Qty</TableHead>
                          <TableHead className="p-3">Rule Result</TableHead>
                          <TableHead className="p-3">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocationRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="p-3 font-medium">{record.warehouse}</TableCell>
                            <TableCell className="p-3 text-xs">{record.lineCount}</TableCell>
                            <TableCell className="p-3 text-xs">{record.qty}</TableCell>
                            <TableCell className="p-3 text-xs">{record.readyQty}</TableCell>
                            <TableCell className="p-3 text-xs text-muted-foreground">
                              {record.status === "ALLOCATED" ? "Matched by stock and channel region" : "Waiting for exception resolution"}
                            </TableCell>
                            <TableCell className="p-3">
                              <Badge variant="outline" className={record.status === "ALLOCATED" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}>
                                {record.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipments" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Shipment Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {shipmentRecords.length === 0 ? (
                      <div className="py-10 text-center text-muted-foreground">
                        <Truck className="mx-auto mb-3 h-10 w-10 opacity-50" />
                        <div className="text-sm">No shipment records</div>
                        <Button className="mt-4" size="sm" onClick={handleCreateShipment}>Create Demo Shipment</Button>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="p-3">Shipment No.</TableHead>
                            <TableHead className="p-3">Warehouse</TableHead>
                            <TableHead className="p-3">Carrier</TableHead>
                            <TableHead className="p-3">Tracking No.</TableHead>
                            <TableHead className="p-3">Qty</TableHead>
                            <TableHead className="p-3">Status</TableHead>
                            <TableHead className="p-3">Ship Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shipmentRecords.map((shipment) => (
                            <TableRow key={shipment.id}>
                              <TableCell className="p-3 font-mono text-xs">{shipment.shipmentNo}</TableCell>
                              <TableCell className="p-3 text-xs">{shipment.warehouse}</TableCell>
                              <TableCell className="p-3 text-xs">{shipment.carrier}</TableCell>
                              <TableCell className="p-3 font-mono text-xs">{shipment.trackingNo}</TableCell>
                              <TableCell className="p-3 text-xs">{shipment.qty}</TableCell>
                              <TableCell className="p-3"><Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{shipment.status}</Badge></TableCell>
                              <TableCell className="p-3 text-xs">{formatDate(shipment.shipDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exceptions" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Exception Handling</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {exceptionItems.length === 0 ? (
                      <div className="m-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        No exception records
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="p-3">Channel SKU</TableHead>
                            <TableHead className="p-3">OMS SKU</TableHead>
                            <TableHead className="p-3">Warehouse</TableHead>
                            <TableHead className="p-3">Issues</TableHead>
                            <TableHead className="p-3">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exceptionItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="p-3 font-mono text-xs">{item.channelSku}</TableCell>
                              <TableCell className="p-3 font-mono text-xs">{item.omsSku ?? "-"}</TableCell>
                              <TableCell className="p-3 text-xs">{item.warehouseName ?? "Unassigned"}</TableCell>
                              <TableCell className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {item.issues.map((issue) => (
                                    <Badge key={issue} className="bg-red-600 text-white">{issueLabels[issue] ?? issue}</Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="p-3"><Button variant="outline" size="sm" onClick={handleResolveExceptions}>Fix</Button></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="emails" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Email History</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="p-3">Type</TableHead>
                          <TableHead className="p-3">Recipient</TableHead>
                          <TableHead className="p-3">Status</TableHead>
                          <TableHead className="p-3">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messageRecords.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="p-3 text-xs font-medium">{message.type}</TableCell>
                            <TableCell className="p-3 text-xs">{message.recipient}</TableCell>
                            <TableCell className="p-3"><Badge variant="outline">{message.status}</Badge></TableCell>
                            <TableCell className="p-3 text-xs">{formatDate(message.time)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <Tabs value={activeSideTab} onValueChange={setActiveSideTab}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order Context</CardTitle>
                    <TabsList className="inline-grid w-auto grid-cols-3">
                      <TabsTrigger value="routing">Routing</TabsTrigger>
                      <TabsTrigger value="events">Events</TabsTrigger>
                      <TabsTrigger value="info">Info</TabsTrigger>
                    </TabsList>
                  </div>
                </CardHeader>

                <TabsContent value="routing" className="mt-0">
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                      Routing History
                    </div>
                    <div className="relative space-y-4 pl-5">
                      <div className="absolute left-2 top-1 h-[calc(100%-8px)] w-px bg-blue-200" />
                      {routingRecords.map((record) => (
                        <div key={record.title} className="relative">
                          <span className={cn("absolute -left-[17px] top-1 h-3 w-3 rounded-full border-2 border-white", record.active ? "bg-blue-600" : "bg-slate-300")} />
                          <div className="text-sm font-medium">{record.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{record.result}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{formatDate(record.time)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <History className="h-4 w-4 text-green-600" />
                      Event History
                    </div>
                    <div className="relative space-y-4 pl-5">
                      <div className="absolute left-2 top-1 h-[calc(100%-8px)] w-px bg-green-200" />
                      {eventRecords.map((event) => (
                        <div key={`${event.title}-${event.time}`} className="relative">
                          <span className="absolute -left-[17px] top-1 h-3 w-3 rounded-full border-2 border-white bg-green-600" />
                          <div className="text-sm font-medium">{event.title}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{event.note}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">{formatDate(event.time)} / {event.actor}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="info" className="mt-0">
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Basic Information
                      </div>
                      <div className="space-y-2">
                        <FieldRow label="OMS Order:" value={<span className="font-mono">{order.id}</span>} />
                        <FieldRow label="Channel Order:" value={<span className="font-mono">{order.channelOrderNo}</span>} />
                        <FieldRow label="Reference:" value={<span className="font-mono">{order.referenceNo}</span>} />
                        <FieldRow label="Company:" value={order.company} />
                        <FieldRow label="Created:" value={compactDate(order.orderDate)} />
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-green-600" />
                        Customer
                      </div>
                      <div className="space-y-2">
                        <FieldRow label="Name:" value={order.customer.name} />
                        <FieldRow label="Country:" value={order.customer.country} />
                        <FieldRow label="Region:" value={order.isDomestic ? "Domestic" : "International"} />
                        <FieldRow label="Priority:" value={order.isExpedited ? "Expedited" : "Standard"} />
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <Wallet className="h-4 w-4 text-amber-600" />
                        Commercial Terms
                      </div>
                      <div className="space-y-2">
                        <FieldRow label="Payment:" value={order.isPaid ? "Paid" : "Unpaid"} />
                        <FieldRow label="Total Qty:" value={order.totalQty} />
                        <FieldRow label="Grand Total:" value={<span>USD {order.grandTotal.toFixed(2)}</span>} />
                        <FieldRow label="DropShip:" value={order.dropShipStatus} />
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <Truck className="h-4 w-4 text-indigo-600" />
                        Logistics Summary
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded border bg-blue-50 p-2">
                          <div className="text-[11px] text-muted-foreground">Shipments</div>
                          <div className="text-lg font-bold text-blue-700">{shipmentRecords.length}</div>
                        </div>
                        <div className="rounded border bg-green-50 p-2">
                          <div className="text-[11px] text-muted-foreground">Ready Qty</div>
                          <div className="text-lg font-bold text-green-700">{readyQty}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
