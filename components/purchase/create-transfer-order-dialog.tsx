"use client"

import * as React from "react"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Building, ArrowRight, Package } from "lucide-react"
import {
  type TransferOrderType,
  type TransferOrderDraft,
  type WarehouseOption,
  type SupplyDemandLine,
  TRANSFER_ORDER_TYPE_OPTIONS,
  WAREHOUSE_OPTIONS,
} from "./transfer-order-types"

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CreateTransferOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tf?: (en: string, zh: string) => string
  /**
   * "standard" = 调拨单模块创建（一张单：调出仓→调入仓+商品）
   * "po" = 从PO页面创建（多vendor/多来源，拆成多张调拨单）
   * 默认 "standard"
   */
  mode?: "standard" | "po"
  defaultTransferType?: TransferOrderType
  defaultTargetWarehouse?: WarehouseOption
  sourceDocument?: { type: "PO" | "SO" | "MANUAL"; no: string }
  warehouseOptions?: WarehouseOption[]
  /** PO模式下的需求行 */
  demandLines?: SupplyDemandLine[]
  onSubmit: (drafts: TransferOrderDraft[]) => void
}

type RouteType = "DIRECT" | "VIA_FG"

interface ManualLine {
  id: string
  skuCode: string
  productName: string
  quantity: number
  uom: string
}

interface SourceDraft {
  id: string
  routeType: RouteType
  fromWarehouseCode: string
  fromWarehouseName: string
  viaWarehouseCode?: string
  viaWarehouseName?: string
  lineQtys: Record<string, number>
}

const PO_OPTIONS = ["PO202403150001", "PO202403180002", "PO202403210003"]
const SO_OPTIONS = ["SO202403150001", "SO202403190002", "SO202403220003"]

// ─── Component ──────────────────────────────────────────────────────────────

export function CreateTransferOrderDialog({
  open, onOpenChange, tf: tfProp, mode = "standard",
  defaultTransferType, defaultTargetWarehouse,
  sourceDocument, warehouseOptions, demandLines, onSubmit,
}: CreateTransferOrderDialogProps) {
  const tf = tfProp || ((en: string, _zh: string) => en)
  const warehouses = warehouseOptions || WAREHOUSE_OPTIONS
  const isPOMode = mode === "po"
  const hasDemandLines = Boolean(demandLines && demandLines.length > 0)

  // ─── Shared State ──────────────────────────────────────────────────────────
  const [transferType, setTransferType] = React.useState<TransferOrderType>(defaultTransferType || "PURCHASE_INBOUND")
  const [sourceDocumentNo, setSourceDocumentNo] = React.useState(sourceDocument?.no || "")
  const [referenceNo, setReferenceNo] = React.useState("")

  // ─── Standard Mode State ───────────────────────────────────────────────────
  const [fromWarehouseCode, setFromWarehouseCode] = React.useState("")
  const [toWarehouseCode, setToWarehouseCode] = React.useState(defaultTargetWarehouse?.code || "")
  const [routeType, setRouteType] = React.useState<RouteType>("DIRECT")
  const [viaWarehouseCode, setViaWarehouseCode] = React.useState("")
  const [expectedShipDate, setExpectedShipDate] = React.useState("")
  const [expectedArrivalDate, setExpectedArrivalDate] = React.useState("")
  const [carrier, setCarrier] = React.useState("")
  const [remarks, setRemarks] = React.useState("")
  const [manualLines, setManualLines] = React.useState<ManualLine[]>([])

  // ─── PO Mode State ─────────────────────────────────────────────────────────
  const [targetWarehouseCode, setTargetWarehouseCode] = React.useState(defaultTargetWarehouse?.code || "")
  const [sources, setSources] = React.useState<SourceDraft[]>([])

  // ─── Reset on open ─────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (open) {
      setTransferType(defaultTransferType || "PURCHASE_INBOUND")
      setSourceDocumentNo(sourceDocument?.no || "")
      setReferenceNo("")
      // Standard
      setFromWarehouseCode("")
      setToWarehouseCode(defaultTargetWarehouse?.code || "")
      setRouteType("DIRECT")
      setViaWarehouseCode("")
      setExpectedShipDate("")
      setExpectedArrivalDate("")
      setCarrier("")
      setRemarks("")
      setManualLines([])
      // PO
      setTargetWarehouseCode(defaultTargetWarehouse?.code || "")
      setSources([createEmptySource()])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function createEmptySource(): SourceDraft {
    return {
      id: crypto.randomUUID(), routeType: "DIRECT", fromWarehouseCode: "", fromWarehouseName: "",
      lineQtys: hasDemandLines ? Object.fromEntries(demandLines!.map((l) => [l.skuCode, 0])) : {},
    }
  }

  // ─── PO Mode Handlers ──────────────────────────────────────────────────────
  function addSource() { setSources((p) => [...p, createEmptySource()]) }
  function removeSource(id: string) { setSources((p) => p.filter((s) => s.id !== id)) }
  function updateSrcWh(id: string, code: string) {
    const wh = warehouses.find((w) => w.code === code)
    setSources((p) => p.map((s) => s.id === id ? { ...s, fromWarehouseCode: code, fromWarehouseName: wh?.name || "" } : s))
  }
  function updateSrcRoute(id: string, rt: RouteType) {
    setSources((p) => p.map((s) => s.id === id ? { ...s, routeType: rt, viaWarehouseCode: rt === "DIRECT" ? undefined : s.viaWarehouseCode, viaWarehouseName: rt === "DIRECT" ? undefined : s.viaWarehouseName } : s))
  }
  function updateSrcVia(id: string, code: string) {
    const wh = warehouses.find((w) => w.code === code)
    setSources((p) => p.map((s) => s.id === id ? { ...s, viaWarehouseCode: code || undefined, viaWarehouseName: wh?.name || undefined } : s))
  }
  function updateSrcQty(srcId: string, sku: string, qty: number) {
    setSources((p) => p.map((s) => s.id === srcId ? { ...s, lineQtys: { ...s.lineQtys, [sku]: Math.max(0, qty) } } : s))
  }

  // ─── Standard Mode Handlers ────────────────────────────────────────────────
  const sourceDocumentType = transferType === "PURCHASE_INBOUND" ? "PO" : transferType === "SALES_OUTBOUND" ? "SO" : "CUSTOM"
  const sourceDocumentOptions = transferType === "PURCHASE_INBOUND" ? PO_OPTIONS : transferType === "SALES_OUTBOUND" ? SO_OPTIONS : []
  const sourceDocumentLabel = tf("Related Document No.", "相关单据号")

  function handleTransferTypeChange(value: TransferOrderType) {
    setTransferType(value)
    setSourceDocumentNo("")
  }

  function addManualLine() { setManualLines((p) => [...p, { id: crypto.randomUUID(), skuCode: "", productName: "", quantity: 0, uom: "PCS" }]) }
  function removeManualLine(id: string) { setManualLines((p) => p.filter((l) => l.id !== id)) }
  function updateManualLine(id: string, field: keyof ManualLine, value: string | number) {
    setManualLines((p) => p.map((l) => l.id === id ? { ...l, [field]: value } : l))
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (isPOMode) {
      // PO模式：多来源 → 多张调拨单
      const tgtWh = warehouses.find((w) => w.code === targetWarehouseCode)
      const drafts: TransferOrderDraft[] = sources
        .filter((s) => s.fromWarehouseCode && Object.values(s.lineQtys).some((q) => q > 0))
        .map((s) => ({
          id: s.id, transferType,
          fromWarehouseCode: s.fromWarehouseCode, fromWarehouseName: s.fromWarehouseName,
          viaWarehouseCode: s.viaWarehouseCode, viaWarehouseName: s.viaWarehouseName,
          toWarehouseCode: targetWarehouseCode, toWarehouseName: tgtWh?.name || "",
          lineQtys: Object.fromEntries(Object.entries(s.lineQtys).filter(([, q]) => q > 0)),
          sourceDocumentType: sourceDocument?.type, sourceDocumentNo: sourceDocument?.no,
        }))
      onSubmit(drafts)
    } else {
      // 标准模式：一张调拨单
      const fromWh = warehouses.find((w) => w.code === fromWarehouseCode)
      const toWh = warehouses.find((w) => w.code === toWarehouseCode)
      const viaWh = viaWarehouseCode ? warehouses.find((w) => w.code === viaWarehouseCode) : undefined
      const draft: TransferOrderDraft = {
        id: crypto.randomUUID(), transferType,
        fromWarehouseCode, fromWarehouseName: fromWh?.name || "",
        viaWarehouseCode: viaWarehouseCode || undefined, viaWarehouseName: viaWh?.name || undefined,
        toWarehouseCode, toWarehouseName: toWh?.name || "",
        lineQtys: Object.fromEntries(manualLines.filter((l) => l.skuCode && l.quantity > 0).map((l) => [l.skuCode, l.quantity])),
        sourceDocumentType,
        sourceDocumentNo: sourceDocumentNo || undefined,
        referenceNo: referenceNo || undefined,
      }
      onSubmit([draft])
    }
    onOpenChange(false)
  }

  // ─── Validation ────────────────────────────────────────────────────────────
  const canSubmit = isPOMode
    ? Boolean(transferType && targetWarehouseCode && sources.some((s) => s.fromWarehouseCode && Object.values(s.lineQtys).some((q) => q > 0)))
    : Boolean(transferType && sourceDocumentNo && referenceNo && fromWarehouseCode && toWarehouseCode && manualLines.some((l) => l.skuCode && l.quantity > 0))

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{tf("Create Transfer Order", "创建调拨单")}</DialogTitle>
          <DialogDescription>
            {isPOMode
              ? tf("Configure source warehouses and assign items to create transfer orders from PO demand.", "配置来源仓库并分配商品，从 PO 需求创建调拨单。")
              : tf("Fill in transfer order information to create a new transfer.", "填写调拨单信息，创建新的调拨单。")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ════════════════════════════════════════════════════════════════ */}
          {/* STANDARD MODE                                                   */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {!isPOMode && (
            <>
              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-semibold mb-3">{tf("Basic Information", "基本信息")}</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Transfer Type", "调拨类型")} <span className="text-red-500">*</span></Label>
                    <Select value={transferType} onValueChange={(v) => handleTransferTypeChange(v as TransferOrderType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TRANSFER_ORDER_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("From Warehouse", "调出仓（发货仓）")} <span className="text-red-500">*</span></Label>
                    <Select value={fromWarehouseCode} onValueChange={setFromWarehouseCode}>
                      <SelectTrigger><SelectValue placeholder={tf("Select", "选择")} /></SelectTrigger>
                      <SelectContent>
                        {warehouses.filter((w) => w.code !== toWarehouseCode).map((wh) => <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("To Warehouse", "调入仓（目标仓）")} <span className="text-red-500">*</span></Label>
                    <Select value={toWarehouseCode} onValueChange={setToWarehouseCode}>
                      <SelectTrigger><SelectValue placeholder={tf("Select", "选择")} /></SelectTrigger>
                      <SelectContent>
                        {warehouses.filter((w) => w.code !== fromWarehouseCode).map((wh) => <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{sourceDocumentLabel} <span className="text-red-500">*</span></Label>
                    {sourceDocumentOptions.length > 0 ? (
                      <Select value={sourceDocumentNo} onValueChange={setSourceDocumentNo}>
                        <SelectTrigger><SelectValue placeholder={tf("Search or select related document no.", "搜索或选择相关单据号")} /></SelectTrigger>
                        <SelectContent>
                          {sourceDocumentOptions.map((docNo) => <SelectItem key={docNo} value={docNo}>{docNo}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder={tf("Enter related document no.", "输入相关单据号")} value={sourceDocumentNo} onChange={(e) => setSourceDocumentNo(e.target.value)} className="h-9" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Reference No.", "Ref 单号")} <span className="text-red-500">*</span></Label>
                    <Input placeholder={tf("Enter Reference No.", "输入 Ref 单号")} value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="h-9" />
                  </div>
                </div>

                {/* 路径类型（仅采购入库） */}
                {transferType === "PURCHASE_INBOUND" && (
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="space-y-2">
                      <Label className="text-xs">{tf("Route Type", "路径类型")} *</Label>
                      <Select value={routeType} onValueChange={(v) => { setRouteType(v as RouteType); if (v === "DIRECT") setViaWarehouseCode("") }}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DIRECT">{tf("Direct", "直发")}</SelectItem>
                          <SelectItem value="VIA_FG">{tf("Via FG Warehouse", "经成品仓")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {routeType === "VIA_FG" && (
                      <div className="space-y-2">
                        <Label className="text-xs">{tf("FG Warehouse", "成品仓")} *</Label>
                        <Select value={viaWarehouseCode} onValueChange={setViaWarehouseCode}>
                          <SelectTrigger><SelectValue placeholder={tf("Select", "选择")} /></SelectTrigger>
                          <SelectContent>
                            {warehouses.filter((w) => w.code !== fromWarehouseCode && w.code !== toWarehouseCode).map((wh) => <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* 路径预览 */}
                {fromWarehouseCode && toWarehouseCode && (
                  <div className="flex items-center gap-2 text-xs rounded-md bg-muted/30 px-3 py-2 mt-4">
                    <span className="font-medium">{warehouses.find((w) => w.code === fromWarehouseCode)?.name}</span>
                    <ArrowRight className="h-3 w-3 flex-shrink-0" />
                    {routeType === "VIA_FG" && viaWarehouseCode && (
                      <><span className="font-medium text-blue-600">{warehouses.find((w) => w.code === viaWarehouseCode)?.name}</span><ArrowRight className="h-3 w-3 flex-shrink-0" /></>
                    )}
                    <span className="font-medium text-green-600">{warehouses.find((w) => w.code === toWarehouseCode)?.name}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* 物流信息 */}
              <div>
                <h3 className="text-sm font-semibold mb-3">{tf("Logistics", "物流信息")}</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Expected Ship Date", "预计发货日期")}</Label>
                    <Input type="date" value={expectedShipDate} onChange={(e) => setExpectedShipDate(e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Expected Arrival", "预计到达日期")}</Label>
                    <Input type="date" value={expectedArrivalDate} onChange={(e) => setExpectedArrivalDate(e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Carrier", "承运商")}</Label>
                    <Input placeholder="FedEx, DHL..." value={carrier} onChange={(e) => setCarrier(e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Remarks", "备注")}</Label>
                    <Input placeholder={tf("Optional", "选填")} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="h-9" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 调拨商品 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{tf("Transfer Items", "调拨商品")}</h3>
                  <Button size="sm" variant="outline" onClick={addManualLine}>
                    <Plus className="mr-2 h-4 w-4" />{tf("Add Item", "添加商品")}
                  </Button>
                </div>
                {manualLines.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    <Package className="mx-auto h-6 w-6 mb-2 opacity-50" />
                    {tf("Click 'Add Item' to add products.", "点击「添加商品」添加调拨商品")}
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs">SKU</TableHead>
                          <TableHead className="text-xs">{tf("Product Name", "商品名称")}</TableHead>
                          <TableHead className="text-xs text-right w-[100px]">{tf("Quantity", "数量")}</TableHead>
                          <TableHead className="text-xs w-[80px]">{tf("Unit", "单位")}</TableHead>
                          <TableHead className="text-xs w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {manualLines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell className="p-2"><Input className="h-7 text-xs" placeholder="SKU001" value={line.skuCode} onChange={(e) => updateManualLine(line.id, "skuCode", e.target.value)} /></TableCell>
                            <TableCell className="p-2"><Input className="h-7 text-xs" placeholder={tf("Name", "名称")} value={line.productName} onChange={(e) => updateManualLine(line.id, "productName", e.target.value)} /></TableCell>
                            <TableCell className="p-2"><Input type="number" min={0} className="h-7 text-xs text-right" value={line.quantity || ""} onChange={(e) => updateManualLine(line.id, "quantity", parseInt(e.target.value) || 0)} /></TableCell>
                            <TableCell className="p-2"><Input className="h-7 text-xs" value={line.uom} onChange={(e) => updateManualLine(line.id, "uom", e.target.value)} /></TableCell>
                            <TableCell className="p-2"><Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeManualLine(line.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* PO MODE (multi-source)                                          */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {isPOMode && (
            <>
              {/* 顶部信息 */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-xs">{tf("Transfer Type", "调拨类型")} *</Label>
                  <Select value={transferType} onValueChange={(v) => handleTransferTypeChange(v as TransferOrderType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRANSFER_ORDER_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{tf("Target Warehouse", "调入仓（目标仓）")} *</Label>
                  <Select value={targetWarehouseCode} onValueChange={setTargetWarehouseCode} disabled={!!defaultTargetWarehouse}>
                    <SelectTrigger><SelectValue placeholder={tf("Select", "选择")} /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {sourceDocument && (
                  <div className="space-y-2">
                    <Label className="text-xs">{tf("Related Document No.", "相关单据号")}</Label>
                    <div className="flex items-center gap-2 h-9 px-3 rounded-md border bg-muted/30 text-sm">
                      <Badge variant="outline" className="text-[10px]">{sourceDocument.type}</Badge>
                      <span className="font-mono">{sourceDocument.no}</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* 多来源卡片 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold">{tf("Transfer Sources (Vendors)", "调拨来源（Vendor）")}</h3>
                    <p className="text-xs text-muted-foreground">{tf("Each source creates one transfer order.", "每个来源生成一张调拨单。")}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={addSource}>
                    <Plus className="mr-2 h-4 w-4" />{tf("Add Source", "添加来源")}
                  </Button>
                </div>

                <div className="space-y-4">
                  {sources.map((src, idx) => (
                    <Card key={src.id}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">{tf("Source", "来源")} #{idx + 1}</span>
                          </div>
                          {sources.length > 1 && (
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeSource(src.id)}><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-3 items-end">
                          <div className="space-y-2">
                            <Label className="text-xs">{tf("Source Warehouse", "调出仓（发货仓）")} *</Label>
                            <Select value={src.fromWarehouseCode} onValueChange={(v) => updateSrcWh(src.id, v)}>
                              <SelectTrigger className="h-9"><SelectValue placeholder={tf("Select", "选择")} /></SelectTrigger>
                              <SelectContent>
                                {warehouses.filter((w) => w.code !== targetWarehouseCode).map((wh) => <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          {transferType === "PURCHASE_INBOUND" && (
                            <div className="space-y-2">
                              <Label className="text-xs">{tf("Route Type", "路径类型")} *</Label>
                              <Select value={src.routeType} onValueChange={(v) => updateSrcRoute(src.id, v as RouteType)}>
                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="DIRECT">{tf("Direct", "直发")}</SelectItem>
                                  <SelectItem value="VIA_FG">{tf("Via FG Warehouse", "经成品仓")}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {transferType === "PURCHASE_INBOUND" && src.routeType === "VIA_FG" && (
                            <div className="space-y-2">
                              <Label className="text-xs">{tf("FG Warehouse", "成品仓")} *</Label>
                              <Select value={src.viaWarehouseCode || ""} onValueChange={(v) => updateSrcVia(src.id, v)}>
                                <SelectTrigger className="h-9"><SelectValue placeholder={tf("Select", "选择")} /></SelectTrigger>
                                <SelectContent>
                                  {warehouses.filter((w) => w.code !== targetWarehouseCode && w.code !== src.fromWarehouseCode).map((wh) => <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        {/* Route preview */}
                        {src.fromWarehouseCode && (
                          <div className="flex items-center gap-2 text-xs rounded-md bg-muted/30 px-3 py-2">
                            <span className="font-medium">{src.fromWarehouseName}</span>
                            <ArrowRight className="h-3 w-3 flex-shrink-0" />
                            {transferType === "PURCHASE_INBOUND" && src.routeType === "VIA_FG" && src.viaWarehouseName && (
                              <><span className="font-medium text-blue-600">{src.viaWarehouseName}</span><ArrowRight className="h-3 w-3 flex-shrink-0" /></>
                            )}
                            <span className="font-medium text-green-600">{warehouses.find((w) => w.code === targetWarehouseCode)?.name || "?"}</span>
                          </div>
                        )}

                        {/* Demand allocation */}
                        {hasDemandLines && (
                          <div className="rounded-md border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="text-xs">SKU</TableHead>
                                  <TableHead className="text-xs">{tf("Product", "商品")}</TableHead>
                                  <TableHead className="text-xs text-right">{tf("Demand", "需求")}</TableHead>
                                  <TableHead className="text-xs text-right w-[120px]">{tf("Transfer Qty", "调拨数量")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {demandLines!.map((line) => (
                                  <TableRow key={line.skuCode}>
                                    <TableCell className="font-mono text-xs">{line.skuCode}</TableCell>
                                    <TableCell className="text-xs">{line.productName}</TableCell>
                                    <TableCell className="text-xs text-right">{line.quantity}</TableCell>
                                    <TableCell className="text-xs text-right">
                                      <Input type="number" min={0} max={line.quantity} className="h-7 w-20 text-xs text-right ml-auto"
                                        value={src.lineQtys[line.skuCode] || 0}
                                        onChange={(e) => updateSrcQty(src.id, line.skuCode, parseInt(e.target.value) || 0)} />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Summary ──────────────────────────────────────────────────── */}
          <div className="rounded-lg border bg-muted/20 p-3 flex items-center justify-between text-sm">
            <div className="flex gap-6 text-muted-foreground">
              <span>{tf("Type", "类型")}: <span className="font-medium text-foreground">{TRANSFER_ORDER_TYPE_OPTIONS.find((o) => o.value === transferType)?.label}</span></span>
              {isPOMode && <span>{tf("Sources", "来源")}: <span className="font-medium text-foreground">{sources.filter((s) => s.fromWarehouseCode).length}</span></span>}
              <span>{tf("Total Qty", "总数量")}: <span className="font-medium text-foreground">
                {isPOMode
                  ? sources.reduce((sum, s) => sum + Object.values(s.lineQtys).reduce((a, b) => a + b, 0), 0)
                  : manualLines.reduce((sum, l) => sum + l.quantity, 0)} PCS
              </span></span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tf("Cancel", "取消")}</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>{tf("Generate Transfer Order", "生成调拨单")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
