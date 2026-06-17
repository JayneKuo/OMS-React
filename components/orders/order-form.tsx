"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle, ClipboardList, Package, Plus, Save, Sparkles, Trash2, Truck, User, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import type { Order, OrderStatus } from "@/lib/orders/types"
import { useDemoOrders } from "@/lib/orders/demo-store"
import { cn } from "@/lib/utils"

const channels = [
  { value: "amazon", label: "Amazon US" },
  { value: "shopify", label: "Shopify US Store" },
  { value: "tiktok", label: "TikTok Shop" },
  { value: "walmart", label: "Walmart Marketplace" },
]

const statuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "awaiting_payment", label: "Awaiting Payment" },
  { value: "processing", label: "Processing" },
  { value: "warehouse_processing", label: "Warehouse Processing" },
  { value: "on_hold", label: "On Hold" },
  { value: "exception", label: "Exception" },
  { value: "backorder", label: "Backorder" },
  { value: "cancelled", label: "Cancelled" },
]

const warehouses = ["SZ-WH-01", "LA-WH-02", "NY-WH-03", "Unassigned"]

type FormLineItem = {
  id: string
  channelSku: string
  channelProductName: string
  qty: number
  unitPrice: number
  omsSku: string
  omsProductName: string
  warehouseName: string
  availQty: number
}

type OrderFormState = {
  id: string
  channelOrderNo: string
  referenceNo: string
  channel: string
  status: OrderStatus
  customerName: string
  customerCountry: string
  isPaid: boolean
  isExpedited: boolean
  holdReason: string
  notes: string
  lineItems: FormLineItem[]
}

function createEmptyLineItem(index: number): FormLineItem {
  return {
    id: `line-${Date.now()}-${index}`,
    channelSku: "",
    channelProductName: "",
    qty: 1,
    unitPrice: 0,
    omsSku: "",
    omsProductName: "",
    warehouseName: "SZ-WH-01",
    availQty: 0,
  }
}

function buildInitialState(order?: Order): OrderFormState {
  if (!order) {
    return {
      id: `SO${Math.floor(9000000 + Math.random() * 999999)}`,
      channelOrderNo: "",
      referenceNo: "",
      channel: "shopify",
      status: "pending",
      customerName: "",
      customerCountry: "US",
      isPaid: false,
      isExpedited: false,
      holdReason: "",
      notes: "",
      lineItems: [createEmptyLineItem(1)],
    }
  }

  return {
    id: order.id,
    channelOrderNo: order.channelOrderNo,
    referenceNo: order.referenceNo,
    channel: order.channel,
    status: order.status,
    customerName: order.customer.name,
    customerCountry: order.customer.country,
    isPaid: order.isPaid,
    isExpedited: order.isExpedited,
    holdReason: order.holdReason ?? "",
    notes: "",
    lineItems: order.lineItems.map((item) => ({
      id: item.id,
      channelSku: item.channelSku,
      channelProductName: item.channelProductName,
      qty: item.qty,
      unitPrice: item.unitPrice,
      omsSku: item.omsSku ?? "",
      omsProductName: item.omsProductName ?? "",
      warehouseName: item.warehouseName ?? "Unassigned",
      availQty: item.availQty,
    })),
  }
}

interface OrderFormProps {
  mode: "create" | "edit"
  order?: Order
}

export function OrderForm({ mode, order }: OrderFormProps) {
  const router = useRouter()
  const { upsertOrder } = useDemoOrders()
  const [form, setForm] = React.useState<OrderFormState>(() => buildInitialState(order))

  const selectedChannel = channels.find((channel) => channel.value === form.channel) ?? channels[0]
  const totals = React.useMemo(() => {
    return form.lineItems.reduce(
      (acc, item) => ({ qty: acc.qty + item.qty, amount: acc.amount + item.qty * item.unitPrice }),
      { qty: 0, amount: 0 }
    )
  }, [form.lineItems])

  const validationIssues = React.useMemo(() => {
    const issues: string[] = []
    if (!form.channelOrderNo.trim()) issues.push("Channel order number is required.")
    if (!form.customerName.trim()) issues.push("Customer name is required.")
    if (form.lineItems.length === 0) issues.push("At least one line item is required.")
    form.lineItems.forEach((item, index) => {
      if (!item.channelSku.trim()) issues.push(`Line ${index + 1}: channel SKU is required.`)
      if (!item.omsSku.trim()) issues.push(`Line ${index + 1}: OMS SKU will create an unmatched-SKU exception.`)
      if (item.warehouseName === "Unassigned") issues.push(`Line ${index + 1}: warehouse is not assigned.`)
      if (item.availQty <= 0) issues.push(`Line ${index + 1}: no available stock.`)
      if (item.availQty > 0 && item.availQty < item.qty) issues.push(`Line ${index + 1}: available stock is lower than order quantity.`)
    })
    return issues
  }, [form])

  const blockingIssueCount = validationIssues.filter((issue) => issue.includes("required")).length
  const fulfillmentIssueCount = validationIssues.length - blockingIssueCount

  const isValid =
    form.channelOrderNo.trim().length > 0 &&
    form.customerName.trim().length > 0 &&
    form.lineItems.length > 0 &&
    form.lineItems.every((item) => item.channelSku.trim() && item.qty > 0)

  function updateField<K extends keyof OrderFormState>(field: K, value: OrderFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function updateLine(id: string, patch: Partial<FormLineItem>) {
    setForm((current) => ({
      ...current,
      lineItems: current.lineItems.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }))
  }

  function addLine() {
    setForm((current) => ({ ...current, lineItems: [...current.lineItems, createEmptyLineItem(current.lineItems.length + 1)] }))
  }

  function removeLine(id: string) {
    setForm((current) => ({ ...current, lineItems: current.lineItems.filter((item) => item.id !== id) }))
  }

  function loadSampleOrder() {
    setForm((current) => ({
      ...current,
      channelOrderNo: current.channelOrderNo || `MANUAL-${Date.now().toString().slice(-6)}`,
      referenceNo: current.referenceNo || `REF-${current.id}`,
      customerName: current.customerName || "Demo Wholesale Buyer",
      customerCountry: current.customerCountry || "US",
      isPaid: true,
      lineItems: [
        {
          id: `line-${Date.now()}-1`,
          channelSku: "SAMPLE-UBP-40010",
          channelProductName: "Ultra Bright Pro 40010 6-Pack",
          qty: 2,
          unitPrice: 44.4,
          omsSku: "UBP-40010-6PK",
          omsProductName: "Ultra Bright Pro 40010 6-Pack",
          warehouseName: "SZ-WH-01",
          availQty: 84,
        },
        {
          id: `line-${Date.now()}-2`,
          channelSku: "SAMPLE-RB-19573",
          channelProductName: "RunBoost 19573 3-Pack",
          qty: 1,
          unitPrice: 26,
          omsSku: "RB-19573-3PK",
          omsProductName: "RunBoost 19573 3-Pack",
          warehouseName: "LA-WH-02",
          availQty: 12,
        },
      ],
    }))
    toast.success("Sample order loaded")
  }

  function saveOrder() {
    if (!isValid) {
      toast.error("Please complete required fields")
      return
    }
    const lineItems = form.lineItems.map((item, index) => {
      const warehouseName = item.warehouseName === "Unassigned" ? null : item.warehouseName
      const omsSku = item.omsSku.trim() || null
      const issues = [
        ...(!omsSku ? (["oms_not_matched"] as const) : []),
        ...(!warehouseName ? (["no_warehouse"] as const) : []),
        ...(item.availQty <= 0 ? (["out_of_stock"] as const) : []),
        ...(item.availQty > 0 && item.availQty < item.qty ? (["insufficient_stock"] as const) : []),
      ]

      return {
        id: item.id || `line-${index + 1}`,
        channelSku: item.channelSku,
        channelProductName: item.channelProductName || item.channelSku,
        qty: item.qty,
        unitPrice: item.unitPrice,
        omsSku,
        omsProductName: item.omsProductName.trim() || omsSku,
        omsMatched: Boolean(omsSku),
        warehouseId: warehouseName ? `wh-${warehouseName.toLowerCase()}` : null,
        warehouseName,
        warehouseSku: warehouseName ? `WH-${item.channelSku.slice(-6)}` : null,
        availQty: item.availQty,
        backorderQty: Math.max(item.qty - item.availQty, 0),
        location: warehouseName ? "DEMO-01" : null,
        defaultVendor: "Demo Vendor",
        warehouseMapped: Boolean(warehouseName),
        issues,
      }
    })

    const hasExceptions = lineItems.some((item) => item.issues.length > 0)
    const now = new Date().toISOString()
    const nextOrder: Order = {
      id: form.id,
      channelOrderNo: form.channelOrderNo,
      referenceNo: form.referenceNo || `REF-${form.id}`,
      channel: form.channel,
      channelName: selectedChannel.label,
      status: hasExceptions && form.status !== "on_hold" ? "exception" : form.status,
      dropShipStatus: order?.dropShipStatus ?? "none",
      isExpedited: form.isExpedited,
      isPaid: form.isPaid,
      hasShipment: order?.hasShipment ?? false,
      isDomestic: form.customerCountry.toUpperCase() === "US",
      holdReason: form.holdReason || null,
      customer: { name: form.customerName, country: form.customerCountry },
      lineItems,
      grandTotal: totals.amount,
      totalQty: totals.qty,
      warehouseName: lineItems.find((item) => item.warehouseName)?.warehouseName ?? null,
      orderDate: order?.orderDate ?? now,
      shipDate: order?.shipDate ?? null,
      ingestedAt: order?.ingestedAt ?? now,
      company: order?.company ?? "DEMO",
      hasExceptions,
    }

    upsertOrder(nextOrder)
    toast.success(mode === "create" ? "Sales order created" : "Sales order updated", {
      description: `${form.id} / ${selectedChannel.label} / $${totals.amount.toFixed(2)}`,
    })
    router.push(`/orders/${form.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-4 w-4 text-primary" />
              Order Header
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Capture channel, customer, payment, and release controls.</p>
          </div>
          {mode === "create" && (
            <Button type="button" variant="outline" size="sm" onClick={loadSampleOrder}>
              <Sparkles className="mr-2 h-4 w-4" />
              Load Sample
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>OMS Order No.</Label>
            <Input value={form.id} onChange={(event) => updateField("id", event.target.value)} disabled={mode === "edit"} />
          </div>
          <div className="space-y-2">
            <Label>Channel Order No. *</Label>
            <Input value={form.channelOrderNo} onChange={(event) => updateField("channelOrderNo", event.target.value)} placeholder="Marketplace order number" />
          </div>
          <div className="space-y-2">
            <Label>Reference No.</Label>
            <Input value={form.referenceNo} onChange={(event) => updateField("referenceNo", event.target.value)} placeholder="Internal or ERP reference" />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <Select value={form.channel} onValueChange={(value) => updateField("channel", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{channels.map((channel) => <SelectItem key={channel.value} value={channel.value}>{channel.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => updateField("status", value as OrderStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{statuses.map((status) => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment</Label>
            <Select value={form.isPaid ? "paid" : "unpaid"} onValueChange={(value) => updateField("isPaid", value === "paid")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={form.isExpedited ? "expedited" : "standard"} onValueChange={(value) => updateField("isExpedited", value === "expedited")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="expedited">Expedited</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Customer Name *</Label>
            <Input value={form.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={form.customerCountry} onChange={(event) => updateField("customerCountry", event.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2">
            <Label>Hold Reason</Label>
            <Input value={form.holdReason} onChange={(event) => updateField("holdReason", event.target.value)} placeholder="Required only for hold orders" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-4 w-4 text-primary" />
              Line Items
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Each line drives SKU matching, stock check, allocation, and shipment readiness.</p>
          </div>
          <Button type="button" onClick={addLine} size="sm"><Plus className="mr-2 h-4 w-4" />Add Line</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Channel SKU *</TableHead>
                  <TableHead className="min-w-[220px]">Channel Product</TableHead>
                  <TableHead className="min-w-[150px]">OMS SKU</TableHead>
                  <TableHead className="min-w-[220px]">OMS Product</TableHead>
                  <TableHead className="w-[90px]">Qty</TableHead>
                  <TableHead className="w-[120px]">Unit Price</TableHead>
                  <TableHead className="min-w-[140px]">Warehouse</TableHead>
                  <TableHead className="w-[90px]">Avail</TableHead>
                  <TableHead className="w-[100px] text-right">Amount</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell><Input value={item.channelSku} onChange={(event) => updateLine(item.id, { channelSku: event.target.value })} className="h-8" /></TableCell>
                    <TableCell><Input value={item.channelProductName} onChange={(event) => updateLine(item.id, { channelProductName: event.target.value })} className="h-8" /></TableCell>
                    <TableCell><Input value={item.omsSku} onChange={(event) => updateLine(item.id, { omsSku: event.target.value })} className="h-8 font-mono" /></TableCell>
                    <TableCell><Input value={item.omsProductName} onChange={(event) => updateLine(item.id, { omsProductName: event.target.value })} className="h-8" /></TableCell>
                    <TableCell><Input type="number" min="1" value={item.qty} onChange={(event) => updateLine(item.id, { qty: Number(event.target.value) || 1 })} className="h-8" /></TableCell>
                    <TableCell><Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateLine(item.id, { unitPrice: Number(event.target.value) || 0 })} className="h-8" /></TableCell>
                    <TableCell>
                      <Select value={item.warehouseName ?? "Unassigned"} onValueChange={(value) => updateLine(item.id, { warehouseName: value })}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{warehouses.map((warehouse) => <SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Input type="number" min="0" value={item.availQty} onChange={(event) => updateLine(item.id, { availQty: Number(event.target.value) || 0 })} className="h-8" /></TableCell>
                    <TableCell className="text-right font-medium">${(item.qty * item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLine(item.id)} disabled={form.lineItems.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-end gap-6 text-sm">
            <span>{form.lineItems.length} lines</span>
            <span>{totals.qty} units</span>
            <span className="font-semibold">${totals.amount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Notes</CardTitle></CardHeader>
        <CardContent><Textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} placeholder="Internal fulfillment notes" /></CardContent>
      </Card>
        </div>

        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Lines</div>
                  <div className="mt-1 text-xl font-bold">{form.lineItems.length}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Units</div>
                  <div className="mt-1 text-xl font-bold">{totals.qty}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Amount</div>
                  <div className="mt-1 text-xl font-bold">${totals.amount.toFixed(2)}</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Issues</div>
                  <div className={cn("mt-1 text-xl font-bold", validationIssues.length > 0 ? "text-red-600" : "text-green-600")}>
                    {validationIssues.length}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-primary" />
                  Customer
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-right font-medium">{form.customerName || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Country</span>
                    <span className="font-medium">{form.customerCountry || "-"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant="outline">{form.isExpedited ? "Expedited" : "Standard"}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Wallet className="h-4 w-4 text-primary" />
                  Commercial
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Payment</span>
                    <Badge variant="outline" className={form.isPaid ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-800"}>
                      {form.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Channel</span>
                    <span className="font-medium">{selectedChannel.label}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline">{form.status}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Truck className="h-4 w-4 text-primary" />
                  Fulfillment Readiness
                </div>
                {validationIssues.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    Ready for release after save.
                  </div>
                ) : (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      {blockingIssueCount} required / {fulfillmentIssueCount} fulfillment issue(s)
                    </div>
                    <div className="max-h-44 space-y-1 overflow-y-auto text-xs text-red-700">
                      {validationIssues.slice(0, 8).map((issue) => (
                        <div key={issue}>- {issue}</div>
                      ))}
                      {validationIssues.length > 8 && <div>+{validationIssues.length - 8} more</div>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-end gap-2 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={saveOrder} disabled={!isValid}><Save className="mr-2 h-4 w-4" />Save Order</Button>
      </div>
    </div>
  )
}
