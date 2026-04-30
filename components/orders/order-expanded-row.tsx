"use client"

import * as React from "react"
import { AlertCircle, CheckCircle2, Clock, Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LineItemIssue, Order, OrderLineItem } from "@/lib/orders/types"
import { cn } from "@/lib/utils"

interface OrderExpandedRowProps {
  order: Order
}

const ISSUE_TOOLTIPS: Record<LineItemIssue, string> = {
  sku_not_exist: "SKU does not exist in OMS",
  oms_not_matched: "Channel SKU is not matched to any OMS product",
  no_warehouse: "OMS product has no warehouse mapping",
  out_of_stock: "Available quantity is 0",
  insufficient_stock: "Available quantity is less than ordered quantity",
  backorder: "Item is on backorder",
}

function getLineItemStatus(item: OrderLineItem): {
  label: string
  className: string
  rowClassName: string
  icon: React.ReactNode
} {
  if (item.issues.includes("sku_not_exist")) {
    return {
      label: "SKU Not Found",
      className: "text-red-600",
      rowClassName: "bg-red-50/40",
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    }
  }
  if (item.issues.includes("oms_not_matched")) {
    return {
      label: "Unmatched",
      className: "text-red-600",
      rowClassName: "bg-red-50/40",
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    }
  }
  if (item.issues.includes("no_warehouse")) {
    return {
      label: "No Warehouse",
      className: "text-red-600",
      rowClassName: "bg-red-50/40",
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    }
  }
  if (item.issues.includes("out_of_stock")) {
    return {
      label: "Out of Stock",
      className: "text-red-600",
      rowClassName: "bg-red-50/30",
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
    }
  }
  if (item.issues.includes("backorder")) {
    return {
      label: "Backorder",
      className: "text-orange-600",
      rowClassName: "bg-orange-50/30",
      icon: <Clock className="h-3.5 w-3.5 text-orange-500" />,
    }
  }
  if (item.issues.includes("insufficient_stock")) {
    return {
      label: "Low Stock",
      className: "text-yellow-600",
      rowClassName: "bg-yellow-50/30",
      icon: <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />,
    }
  }

  return {
    label: "Ready",
    className: "text-emerald-600",
    rowClassName: "",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  }
}

function getFulfillmentSummary(order: Order) {
  const groups = new Map<string, OrderLineItem[]>()

  order.lineItems.forEach((item) => {
    const key = item.warehouseName ?? "Unassigned"
    groups.set(key, [...(groups.get(key) ?? []), item])
  })

  return Array.from(groups.entries())
}

export function OrderExpandedRow({ order }: OrderExpandedRowProps) {
  const groups = getFulfillmentSummary(order)

  return (
    <div className="border-t bg-muted/20 px-3 py-2">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Routing</span>
          {groups.map(([warehouse, items]) => (
            <div key={warehouse} className="flex items-center gap-2 text-xs">
              <span className={cn("font-medium", warehouse === "Unassigned" && "text-red-600")}>{warehouse}</span>
              <span className="text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-1">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Line Items ({order.lineItems.length})
          </span>
        </div>

        <div className="overflow-x-auto rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="h-8 min-w-[130px] py-1">Channel SKU</TableHead>
                <TableHead className="h-8 min-w-[130px] py-1">OMS SKU</TableHead>
                <TableHead className="h-8 min-w-[220px] py-1">OMS Product</TableHead>
                <TableHead className="h-8 min-w-[120px] py-1">Warehouse</TableHead>
                <TableHead className="h-8 min-w-[100px] py-1">WH SKU</TableHead>
                <TableHead className="h-8 w-16 py-1 text-right">Qty</TableHead>
                <TableHead className="h-8 min-w-[120px] py-1">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lineItems.map((item) => {
                const status = getLineItemStatus(item)

                return (
                  <TableRow key={item.id} className={cn("text-xs", status.rowClassName)}>
                    <TableCell className="py-2 font-mono">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex cursor-default items-center gap-1">
                              {item.channelSku}
                              {item.issues.includes("sku_not_exist") && (
                                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                              )}
                            </span>
                          </TooltipTrigger>
                          {item.issues.length > 0 && (
                            <TooltipContent>
                              <div className="space-y-1 text-xs">
                                {item.issues.map((issue) => (
                                  <div key={issue}>{ISSUE_TOOLTIPS[issue]}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="py-2 font-mono">
                      {item.omsSku ? item.omsSku : <span className="italic text-red-500">— Unmatched</span>}
                    </TableCell>
                    <TableCell className="py-2">
                      {item.omsProductName ? (
                        <span className="line-clamp-1">{item.omsProductName}</span>
                      ) : (
                        <span className="italic text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      {item.warehouseName ? (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {item.warehouseName}
                        </Badge>
                      ) : (
                        <span className="italic text-red-500">— Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 font-mono text-muted-foreground">
                      {item.warehouseSku ?? <span className="italic">—</span>}
                    </TableCell>
                    <TableCell className="py-2 text-right font-medium">{item.qty}</TableCell>
                    <TableCell className="py-2">
                      <span className={cn("flex items-center gap-1 font-medium", status.className)}>
                        {status.icon}
                        {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
