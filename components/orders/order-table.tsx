"use client"

import * as React from "react"
import { CheckCircle, ChevronDown, ChevronRight, Eye, MoreHorizontal, Pencil, Send, Truck, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrderExpandedRow } from "@/components/orders/order-expanded-row"
import { OrderNumberCell } from "@/components/ui/order-number-cell"
import type { LineItemIssue, Order, OrderStatus } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
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

type TableIssue = {
  key: string
  label: string
  description: string
  className: string
}

const LINE_ITEM_ISSUE_CONFIG: Record<LineItemIssue, TableIssue> = {
  sku_not_exist: {
    key: "sku_not_exist",
    label: "SKU Error",
    description: "A channel SKU does not exist in OMS.",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  oms_not_matched: {
    key: "oms_not_matched",
    label: "Unmatched",
    description: "A channel SKU is not matched to an OMS product.",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  no_warehouse: {
    key: "no_warehouse",
    label: "No WH",
    description: "An OMS product has no downstream warehouse mapping.",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  out_of_stock: {
    key: "out_of_stock",
    label: "No Stock",
    description: "At least one item has zero available stock.",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  insufficient_stock: {
    key: "insufficient_stock",
    label: "Low Stock",
    description: "Available stock is lower than ordered quantity.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  backorder: {
    key: "backorder",
    label: "Backorder",
    description: "At least one item is waiting for replenishment.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getWarehouseNames(order: Order) {
  return Array.from(new Set(order.lineItems.map((item) => item.warehouseName).filter(Boolean))) as string[]
}

function getFulfillmentSummary(order: Order) {
  const warehouses = getWarehouseNames(order)
  const hasUnassigned = order.lineItems.some((item) => !item.warehouseName)

  if (warehouses.length === 0) {
    return { label: "Unassigned", className: "text-red-600" }
  }

  let label = warehouses[0]
  if (warehouses.length > 1) {
    label = `${warehouses[0]} +${warehouses.length - 1}`
  }
  if (hasUnassigned) {
    label = `${label} · Unassigned`
  }

  return { label, className: hasUnassigned ? "text-amber-700" : "text-foreground" }
}

function getOrderIssues(order: Order): TableIssue[] {
  const issues: TableIssue[] = []
  const warehouses = getWarehouseNames(order)
  const lineItemIssues = new Set(order.lineItems.flatMap((item) => item.issues))

  if (order.status === "on_hold") {
    issues.push({
      key: "on_hold",
      label: "On Hold",
      description: order.holdReason ?? "This order is on hold.",
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    })
  }

  if (order.status === "payment_failed") {
    issues.push({
      key: "payment_failed",
      label: "Payment",
      description: "Payment authorization failed.",
      className: "border-red-200 bg-red-50 text-red-700",
    })
  }

  if (warehouses.length > 1) {
    issues.push({
      key: "split_wh",
      label: "Split WH",
      description: `Items are allocated to ${warehouses.join(", ")}.`,
      className: "border-slate-200 bg-slate-50 text-slate-700",
    })
  }

  if (order.lineItems.some((item) => !item.warehouseName)) {
    issues.push({
      key: "unassigned",
      label: "Unassigned",
      description: "At least one line item is not assigned to a warehouse.",
      className: "border-red-200 bg-red-50 text-red-700",
    })
  }

  for (const issue of ["sku_not_exist", "oms_not_matched", "no_warehouse", "out_of_stock", "insufficient_stock", "backorder"] as const) {
    if (lineItemIssues.has(issue)) {
      const firstItem = order.lineItems.find((item) => item.issues.includes(issue))
      issues.push({
        ...LINE_ITEM_ISSUE_CONFIG[issue],
        description:
          issue === "sku_not_exist" && firstItem
            ? `SKU does not exist: ${firstItem.channelSku}`
            : issue === "no_warehouse" && firstItem?.omsSku
              ? `${firstItem.omsSku} has no warehouse mapping.`
              : LINE_ITEM_ISSUE_CONFIG[issue].description,
      })
    }
  }

  return issues
}

function OmsSkuPreview({ order }: { order: Order }) {
  const skus = Array.from(
    new Set(order.lineItems.map((item) => item.omsSku ?? item.channelSku).filter(Boolean))
  )

  if (skus.length === 0) {
    return <span className="text-xs italic text-muted-foreground">—</span>
  }

  const visible = skus.slice(0, 2)
  const hidden = skus.slice(2)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((sku) => (
        <span key={sku} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {sku}
        </span>
      ))}
      {hidden.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-xs text-muted-foreground">+{hidden.length}</span>
            </TooltipTrigger>
            <TooltipContent>{hidden.join(", ")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

function SubStatusCell({ order }: { order: Order }) {
  const primaryItems = [
    {
      key: "payment",
      title: "Payment",
      label: order.isPaid ? "Paid" : "Unpaid",
      className: order.isPaid
        ? "border-emerald-300 bg-emerald-100 text-emerald-900"
        : "border-yellow-300 bg-yellow-100 text-yellow-900",
    },
    {
      key: "shipment",
      title: "Shipment",
      label: order.hasShipment ? "Shipped" : "Open",
      className: order.hasShipment
        ? "border-blue-300 bg-blue-100 text-blue-900"
        : "border-slate-300 bg-slate-100 text-slate-800",
    },
  ]

  const secondaryItems = []

  if (order.isExpedited) {
    secondaryItems.push({
      key: "speed",
      label: "Expedited",
      className: "border-orange-300 bg-orange-100 text-orange-800",
    })
  }

  if (!order.isDomestic) {
    secondaryItems.push({
      key: "region",
      label: "Intl",
      className: "border-purple-300 bg-purple-100 text-purple-800",
    })
  }

  if (order.dropShipStatus !== "none") {
    secondaryItems.push({
      key: "dropship",
      label: `DropShip ${order.dropShipStatus}`,
      className: "border-cyan-300 bg-cyan-100 text-cyan-800",
    })
  }

  return (
    <div className="min-w-[220px] space-y-1.5">
      <div className="grid grid-cols-2 gap-1.5">
        {primaryItems.map((item) => (
          <div
            key={item.key}
            className={cn("rounded-md border px-2 py-1 leading-none", item.className)}
          >
            <div className="text-[10px] font-medium uppercase tracking-[0.08em] opacity-70">{item.title}</div>
            <div className="mt-1 text-xs font-semibold">{item.label}</div>
          </div>
        ))}
      </div>

      {secondaryItems.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {secondaryItems.map((item) => (
            <Badge
              key={item.key}
              variant="outline"
              className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", item.className)}
            >
              {item.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

function IssuesCell({ order }: { order: Order }) {
  const issues = getOrderIssues(order)

  if (issues.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const visible = issues.slice(0, 2)
  const hidden = issues.slice(2)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visible.map((issue) => (
        <TooltipProvider key={issue.key}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Badge variant="outline" className={cn("cursor-default text-xs font-medium", issue.className)}>
                  {issue.label}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>{issue.description}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {hidden.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-xs text-muted-foreground">+{hidden.length}</span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {hidden.map((issue) => (
                  <div key={issue.key}>{issue.label}: {issue.description}</div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

interface OrderTableProps {
  orders: Order[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
  onOrderOpen?: (order: Order) => void
  onResolveOrder?: (order: Order) => void
  onReleaseOrder?: (order: Order) => void
  onShipOrder?: (order: Order) => void
  onCancelOrder?: (order: Order) => void
}

export function OrderTable({
  orders,
  selectedIds,
  onSelectionChange,
  onOrderOpen,
  onResolveOrder,
  onReleaseOrder,
  onShipOrder,
  onCancelOrder,
}: OrderTableProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const allSelected = orders.length > 0 && selectedIds.length === orders.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < orders.length

  function toggleAll() {
    onSelectionChange(allSelected ? [] : orders.map((order) => order.id))
  }

  function toggleRow(id: string) {
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((value) => value !== id) : [...selectedIds, id]
    )
  }

  function toggleExpand(id: string, event: React.MouseEvent) {
    event.stopPropagation()
    setExpandedId((current) => (current === id ? null : id))
  }

  return (
    <div className="overflow-x-auto rounded-md border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="sticky left-0 z-10 w-10 bg-background">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead className="w-10" />
            <TableHead className="sticky left-10 z-10 min-w-[160px] bg-background">Order</TableHead>
            <TableHead className="min-w-[150px]">Customer / Channel</TableHead>
            <TableHead className="min-w-[170px]">OMS SKUs</TableHead>
            <TableHead className="min-w-[150px]">Status</TableHead>
            <TableHead className="min-w-[190px]">Sub Status</TableHead>
            <TableHead className="min-w-[170px]">Issues</TableHead>
            <TableHead className="min-w-[170px]">Fulfillment</TableHead>
            <TableHead className="min-w-[140px]">Date / Amount</TableHead>
            <TableHead className="sticky right-0 z-10 w-[120px] bg-background text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const isExpanded = expandedId === order.id
            const isSelected = selectedIds.includes(order.id)
            const status = STATUS_CONFIG[order.status]
            const fulfillment = getFulfillmentSummary(order)

            return (
              <React.Fragment key={order.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer",
                    isSelected && "bg-muted/40",
                    order.status === "on_hold" && !isSelected && "bg-yellow-50/30",
                    order.status === "exception" && !isSelected && "bg-red-50/20"
                  )}
                  onClick={() => onOrderOpen?.(order) ?? router.push(`/orders/${order.id}`)}
                >
                  <TableCell className="sticky left-0 z-10 w-10 bg-inherit" onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(order.id)}
                      aria-label={`Select ${order.id}`}
                    />
                  </TableCell>
                  <TableCell className="w-10" onClick={(event) => toggleExpand(order.id, event)}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </Button>
                  </TableCell>
                  <TableCell className="sticky left-10 z-10 bg-inherit" onClick={(event) => event.stopPropagation()}>
                    <div className="space-y-1">
                      <OrderNumberCell orderNumber={order.id} onClick={() => router.push(`/orders/${order.id}`)} />
                      <div className="font-mono text-xs text-muted-foreground">{order.channelOrderNo}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">{order.channelName}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <OmsSkuPreview order={order} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className={cn("w-fit text-xs font-medium", status.className)}>
                        {status.label}
                      </Badge>
                      {order.holdReason && <div className="text-xs text-amber-700">{order.holdReason}</div>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <SubStatusCell order={order} />
                  </TableCell>
                  <TableCell>
                    <IssuesCell order={order} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className={cn("text-sm", fulfillment.className)}>{fulfillment.label}</div>
                      {order.dropShipStatus !== "none" && (
                        <div className="text-xs text-muted-foreground">DropShip {order.dropShipStatus}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(order.orderDate)}</div>
                      <div>${order.grandTotal.toFixed(2)} · {order.totalQty} qty</div>
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 z-10 bg-inherit text-right" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/orders/${order.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/orders/${order.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onResolveOrder?.(order)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolve Issues
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReleaseOrder?.(order)}>
                            <Send className="mr-2 h-4 w-4" />
                            Release to Warehouse
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onShipOrder?.(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Create Shipment
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onCancelOrder?.(order)}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="p-0">
                      <OrderExpandedRow order={order} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-sm text-muted-foreground">
                No orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
