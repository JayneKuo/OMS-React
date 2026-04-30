"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { OrderTable } from "@/components/orders/order-table"
import { mockOrders } from "@/lib/orders/mock-data"
import type { Order, OrderStatus } from "@/lib/orders/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, SlidersHorizontal } from "lucide-react"

const sidebarItems = [
  { title: "All Orders", href: "/orders" },
  { title: "Pending", href: "/orders/pending" },
  { title: "Processing", href: "/orders/processing" },
  { title: "Shipped", href: "/orders/shipped" },
  { title: "Delivered", href: "/orders/delivered" },
  { title: "Cancelled", href: "/orders/cancelled" },
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

const CHANNEL_OPTIONS = [
  { label: "Amazon", value: "amazon" },
  { label: "Shopify", value: "shopify" },
  { label: "TikTok", value: "tiktok" },
  { label: "Walmart", value: "walmart" },
]

const STATUS_COUNTS: Partial<Record<OrderStatus, number>> = {}
mockOrders.forEach((order) => {
  STATUS_COUNTS[order.status] = (STATUS_COUNTS[order.status] ?? 0) + 1
})

export default function OrdersPage() {
  const [search, setSearch] = React.useState("")
  const [selectedStatuses, setSelectedStatuses] = React.useState<OrderStatus[]>([])
  const [selectedChannels, setSelectedChannels] = React.useState<string[]>([])
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])

  const filtered = React.useMemo(() => {
    let result: Order[] = mockOrders

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (order) =>
          order.id.toLowerCase().includes(query) ||
          order.channelOrderNo.toLowerCase().includes(query) ||
          order.referenceNo.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.channelName.toLowerCase().includes(query) ||
          order.lineItems.some(
            (item) =>
              item.channelSku.toLowerCase().includes(query) ||
              (item.omsSku ?? "").toLowerCase().includes(query)
          )
      )
    }

    if (selectedStatuses.length > 0) {
      result = result.filter((order) => selectedStatuses.includes(order.status))
    }

    if (selectedChannels.length > 0) {
      result = result.filter((order) => selectedChannels.includes(order.channel))
    }

    return result
  }, [search, selectedChannels, selectedStatuses])

  const exceptionCount = mockOrders.filter((order) => order.hasExceptions).length
  const onHoldCount = mockOrders.filter((order) => order.status === "on_hold").length

  function toggleStatus(status: OrderStatus) {
    setSelectedStatuses((current) =>
      current.includes(status) ? current.filter((value) => value !== status) : [...current, status]
    )
  }

  function toggleChannel(channel: string) {
    setSelectedChannels((current) =>
      current.includes(channel) ? current.filter((value) => value !== channel) : [...current, channel]
    )
  }

  function clearFilters() {
    setSearch("")
    setSelectedStatuses([])
    setSelectedChannels([])
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Orders">
      <div className="space-y-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            {mockOrders.length} orders · {exceptionCount} with issues · {onHoldCount} on hold
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search order no., channel order #, SKU, customer..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 pl-8"
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Status
                  {selectedStatuses.length > 0 && <span className="text-xs text-muted-foreground">{selectedStatuses.length}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUS_FILTER_OPTIONS.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={selectedStatuses.includes(status.value)}
                    onCheckedChange={() => toggleStatus(status.value)}
                  >
                    {status.label}
                    <span className="ml-auto text-xs text-muted-foreground">{STATUS_COUNTS[status.value] ?? 0}</span>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1.5">
                  Channel
                  {selectedChannels.length > 0 && <span className="text-xs text-muted-foreground">{selectedChannels.length}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {CHANNEL_OPTIONS.map((channel) => (
                  <DropdownMenuCheckboxItem
                    key={channel.value}
                    checked={selectedChannels.includes(channel.value)}
                    onCheckedChange={() => toggleChannel(channel.value)}
                  >
                    {channel.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(selectedStatuses.length > 0 || selectedChannels.length > 0 || search) && (
              <Button variant="ghost" size="sm" className="h-9 text-muted-foreground" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>
        </div>

        <OrderTable orders={filtered} selectedIds={selectedIds} onSelectionChange={setSelectedIds} />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filtered.length} of {mockOrders.length} orders
          </span>
          {selectedIds.length > 0 && <span>{selectedIds.length} selected</span>}
        </div>
      </div>
    </MainLayout>
  )
}
