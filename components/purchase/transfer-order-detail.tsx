"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  CheckCircle, AlertCircle, Package, Truck, MapPin, Send, Ban,
  FilePlus, RefreshCw, ChevronDown, Building, Clock, ArrowRight,
  FileInput, FileOutput
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Generic Transfer Order Types ───────────────────────────────────────────

export type TransferOrderStatus = "DRAFT" | "CREATED" | "PROCESSING" | "INBOUND_AT_SOURCE" | "IN_TRANSIT" | "RECEIVED" | "CLOSED" | "VOIDED"

export type ExecutionDocumentCreationStatus = "PENDING" | "CREATING" | "FAILED" | "PARTIAL_SUCCESS" | "SUCCESS" | "CANCELLED"

export type InboundPushStatus = "NONE" | "CREATED" | "PUSH_FAILED" | "WAITING_ACCEPT" | "REJECTED" | "ACCEPTED" | "CANCELLED"

export type DocumentStatus = "NONE" | "CREATED" | "PUSHED" | "CONFIRMED" | "CLOSED" | "FAILED" | "CANCELLED"

export interface TransferOrderLine {
  lineNo: number
  skuCode: string
  productName: string
  plannedQty: number
  transferredQty: number
  uom: string
}

export interface RelatedDocument {
  docNo: string
  docType: "INBOUND" | "OUTBOUND"
  warehouseName: string
  warehouseCode: string
  status: DocumentStatus
  statusLabel?: string
  pushedToWms?: boolean
  expectedQty?: number
  actualQty?: number
  createdAt?: string
}

export interface TransferOrder {
  id: string
  transferNo: string
  status: TransferOrderStatus
  executionDocCreationStatus: ExecutionDocumentCreationStatus
  executionDocCreationError?: string
  executionDocCreatedCount?: number
  executionDocTargetCount?: number
  executionDocLastUpdatedAt?: string | null
  executionDocRetryCount?: number
  // Warehouses
  fromWarehouseName: string
  fromWarehouseCode: string
  viaWarehouseName?: string
  viaWarehouseCode?: string
  toWarehouseName: string
  toWarehouseCode: string
  // Source context (optional, for display)
  sourceName?: string
  sourceCode?: string
  // Lines
  lines: TransferOrderLine[]
  // Related documents (new structured format)
  relatedDocuments?: RelatedDocument[]
  // Legacy fields (kept for backward compat)
  sourceInboundNo?: string
  outboundOrderNo?: string
  targetInboundNo?: string
  // Push / sync state
  pushStatus: InboundPushStatus
  pushError?: string
  pushMessageId?: string
  lastPushedAt?: string | null
  retryCount?: number
  // Meta
  createdAt?: string
  canRevise?: boolean
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface TransferOrderDetailProps {
  order: TransferOrder
  /** Language toggle helper */
  tf: (en: string, zh: string) => string
  onRetryPush?: (order: TransferOrder) => void
  onCancelInbound?: (order: TransferOrder) => void
  onCreateInbound?: (order: TransferOrder) => void
  onRevise?: (order: TransferOrder) => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function TransferOrderDetail({
  order,
  tf,
  onRetryPush,
  onCancelInbound,
  onCreateInbound,
  onRevise,
}: TransferOrderDetailProps) {
  const [pushDetailOpen, setPushDetailOpen] = React.useState(false)

  const totalPlanned = order.lines.reduce((sum, l) => sum + l.plannedQty, 0)
  const totalTransferred = order.lines.reduce((sum, l) => sum + l.transferredQty, 0)

  // ─── Build documents list from both new and legacy fields ──────────────────
  const documents = React.useMemo(() => {
    if (order.relatedDocuments && order.relatedDocuments.length > 0) {
      return order.relatedDocuments
    }
    // Fallback: build from legacy fields
    const docs: RelatedDocument[] = []
    if (order.viaWarehouseCode && order.sourceInboundNo) {
      docs.push({
        docNo: order.sourceInboundNo,
        docType: "INBOUND",
        warehouseName: order.viaWarehouseName || "",
        warehouseCode: order.viaWarehouseCode,
        status: order.pushStatus === "ACCEPTED" ? "CONFIRMED" : order.pushStatus === "PUSH_FAILED" ? "FAILED" : order.pushStatus === "CREATED" ? "CREATED" : "NONE",
        expectedQty: totalPlanned,
      })
    }
    if (order.outboundOrderNo) {
      docs.push({
        docNo: order.outboundOrderNo,
        docType: "OUTBOUND",
        warehouseName: order.viaWarehouseName || order.fromWarehouseName,
        warehouseCode: order.viaWarehouseCode || order.fromWarehouseCode,
        status: order.status === "IN_TRANSIT" || order.status === "RECEIVED" || order.status === "CLOSED" ? "CLOSED" : "CREATED",
        expectedQty: totalPlanned,
      })
    }
    if (order.targetInboundNo) {
      docs.push({
        docNo: order.targetInboundNo,
        docType: "INBOUND",
        warehouseName: order.toWarehouseName,
        warehouseCode: order.toWarehouseCode,
        status: order.status === "RECEIVED" || order.status === "CLOSED" ? "CLOSED" : "CREATED",
        expectedQty: totalPlanned,
        actualQty: totalTransferred,
      })
    }
    return docs
  }, [order, totalPlanned, totalTransferred])

  // ─── Step computation ──────────────────────────────────────────────────────
  const hasVia = Boolean(order.viaWarehouseCode)

  const steps = React.useMemo(() => {
    if (hasVia) {
      // 经成品仓模式: 确认 → 成品仓入库 → 出库 → 目标仓入库
      return [
        { key: "confirmed", label: tf("Confirmed", "已确认") },
        { key: "fg_inbound", label: tf("FG Inbound", "成品仓入库") },
        { key: "outbound", label: tf("Outbound", "出库") },
        { key: "target_inbound", label: tf("Target Inbound", "目标入库") },
      ]
    }
    // 直发模式: 确认 → 出库 → 目标仓入库
    return [
      { key: "confirmed", label: tf("Confirmed", "已确认") },
      { key: "outbound", label: tf("Outbound", "出库") },
      { key: "target_inbound", label: tf("Target Inbound", "目标入库") },
    ]
  }, [hasVia, tf])

  const stepIndex = React.useMemo(() => {
    switch (order.status) {
      case "DRAFT": return -1
      case "CREATED": return 0
      case "PROCESSING": return 1
      case "INBOUND_AT_SOURCE": return 1
      case "IN_TRANSIT": return hasVia ? 2 : 2
      case "RECEIVED":
      case "CLOSED": return steps.length - 1
      case "VOIDED": return -1
      default: return -1
    }
  }, [order.status, hasVia, steps.length])

  // ─── Status meta ───────────────────────────────────────────────────────────
  const statusMeta: Record<TransferOrderStatus, { label: string; className: string }> = {
    DRAFT: { label: tf("Draft", "草稿"), className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    CREATED: { label: tf("Created", "已创建"), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    PROCESSING: { label: tf("Processing", "执行中"), className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
    INBOUND_AT_SOURCE: { label: tf("FG Inbound", "成品仓入库中"), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    IN_TRANSIT: { label: tf("In Transit", "在途"), className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
    RECEIVED: { label: tf("Received", "已收货"), className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    CLOSED: { label: tf("Closed", "已关闭"), className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    VOIDED: { label: tf("Voided", "已作废"), className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  }

  const executionDocCreationMeta: Record<ExecutionDocumentCreationStatus, { label: string; className: string }> = {
    PENDING: { label: tf("Pending", "待创建"), className: "border-gray-200 bg-gray-50 text-gray-700" },
    CREATING: { label: tf("Creating", "创建中"), className: "border-blue-200 bg-blue-50 text-blue-700" },
    FAILED: { label: tf("Failed", "创建失败"), className: "border-red-200 bg-red-50 text-red-700" },
    PARTIAL_SUCCESS: { label: tf("Partial Success", "部分成功"), className: "border-orange-200 bg-orange-50 text-orange-700" },
    SUCCESS: { label: tf("Success", "全部成功"), className: "border-green-200 bg-green-50 text-green-700" },
    CANCELLED: { label: tf("Cancelled", "已取消"), className: "border-gray-300 bg-gray-100 text-gray-700" },
  }

  const docStatusMeta: Record<DocumentStatus, { label: string; className: string }> = {
    NONE: { label: tf("Not Created", "未创建"), className: "bg-gray-100 text-gray-600" },
    CREATED: { label: tf("Created", "已创建"), className: "bg-blue-100 text-blue-700" },
    PUSHED: { label: tf("Pushed", "已推送"), className: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: tf("Confirmed", "已确认"), className: "bg-green-100 text-green-700" },
    CLOSED: { label: tf("Closed", "已关闭"), className: "bg-teal-100 text-teal-700" },
    FAILED: { label: tf("Failed", "失败"), className: "bg-red-100 text-red-700" },
    CANCELLED: { label: tf("Cancelled", "已取消"), className: "bg-gray-200 text-gray-600" },
  }

  const pushStatusMeta: Record<InboundPushStatus, { label: string; className: string }> = {
    NONE: { label: tf("Not Created", "未创建"), className: "border-gray-200 bg-gray-50 text-gray-700" },
    CREATED: { label: tf("Created", "已创建"), className: "border-blue-200 bg-blue-50 text-blue-700" },
    PUSH_FAILED: { label: tf("Push Failed", "推送失败"), className: "border-red-200 bg-red-50 text-red-700" },
    WAITING_ACCEPT: { label: tf("Waiting Accept", "等待接收"), className: "border-amber-200 bg-amber-50 text-amber-700" },
    REJECTED: { label: tf("Rejected", "已拒收"), className: "border-red-200 bg-red-50 text-red-700" },
    ACCEPTED: { label: tf("Accepted", "已接收"), className: "border-green-200 bg-green-50 text-green-700" },
    CANCELLED: { label: tf("Cancelled", "已取消"), className: "border-gray-300 bg-gray-100 text-gray-700" },
  }

  const canRetry = ["FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
  const canCancel = ["PENDING", "CREATING", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
  const canCreate = ["PENDING", "CANCELLED", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)

  // ─── Route description ─────────────────────────────────────────────────────
  const routePath = [order.fromWarehouseName, order.viaWarehouseName, order.toWarehouseName].filter(Boolean).join(" → ")

  return (
    <div className="p-6 space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between pb-4 border-b">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold font-mono">{order.transferNo}</h3>
            <Badge className={statusMeta[order.status].className}>{statusMeta[order.status].label}</Badge>
            <Badge variant="outline" className={cn("text-[10px]", executionDocCreationMeta[order.executionDocCreationStatus].className)}>
              {tf("Execution Doc Creation", "执行单据创建")}: {executionDocCreationMeta[order.executionDocCreationStatus].label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-3.5 w-3.5" />
            <span>{routePath}</span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {order.sourceName && (
              <span>Vendor: <span className="font-medium text-foreground">{order.sourceName}</span></span>
            )}
            {order.createdAt && (
              <span><Clock className="inline h-3 w-3 mr-1" />{new Date(order.createdAt).toLocaleDateString()}</span>
            )}
            {hasVia && <Badge variant="outline" className="text-[10px] border-blue-200 bg-blue-50 text-blue-700">{tf("Via FG", "经成品仓")}</Badge>}
            {!hasVia && <Badge variant="outline" className="text-[10px] border-gray-200 bg-gray-50 text-gray-600">{tf("Direct", "直发")}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {order.canRevise && onRevise && (
            <Button variant="outline" size="sm" onClick={() => onRevise(order)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {tf("Revise", "调整")}
            </Button>
          )}
          {canCreate && onCreateInbound && (
            <Button size="sm" onClick={() => onCreateInbound(order)}>
              <FilePlus className="h-4 w-4 mr-2" />
              {tf("Create Inbound", "创建入库通知")}
            </Button>
          )}
          {canRetry && onRetryPush && (
            <Button size="sm" onClick={() => onRetryPush(order)}>
              <Send className="h-4 w-4 mr-2" />
              {tf("Retry Push", "重试推送")}
            </Button>
          )}
          {canCancel && onCancelInbound && (
            <Button variant="outline" size="sm" className="text-red-600" onClick={() => onCancelInbound(order)}>
              <Ban className="h-4 w-4 mr-2" />
              {tf("Cancel", "取消")}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Step Progress ────────────────────────────────────────────────── */}
      {order.status !== "VOIDED" && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const isDone = idx <= stepIndex
              const isCurrent = idx === stepIndex
              const isError = order.pushStatus === "PUSH_FAILED" && ((hasVia && idx === 1) || (!hasVia && idx === 0))
              return (
                <React.Fragment key={step.key}>
                  {idx > 0 && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      isDone ? "bg-green-300 dark:bg-green-700" : isError ? "bg-red-300 dark:bg-red-700" : "bg-gray-200 dark:bg-gray-700"
                    )} />
                  )}
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isDone ? "bg-green-100 dark:bg-green-900/20"
                        : isError ? "bg-red-100 dark:bg-red-900/20"
                          : isCurrent ? "bg-blue-100 dark:bg-blue-900/20"
                            : "bg-gray-100 dark:bg-gray-800"
                    )}>
                      {isDone ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        : isError ? <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          : idx === steps.length - 1 ? <MapPin className="h-4 w-4 text-gray-400" />
                            : step.key === "outbound" ? <Truck className="h-4 w-4 text-gray-400" />
                              : <Package className="h-4 w-4 text-gray-400" />}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={cn("text-xs font-medium", isDone ? "text-green-700 dark:text-green-400" : !isCurrent && "text-muted-foreground")}>{step.label}</div>
                    </div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── Items Table ──────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">{tf("Transfer Items", "调拨商品")}</h4>
          <div className="text-xs text-muted-foreground">
            {totalTransferred}/{totalPlanned} PCS ({totalPlanned > 0 ? Math.round(totalTransferred / totalPlanned * 100) : 0}%)
          </div>
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">{tf("Line", "行号")}</TableHead>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs">{tf("Product", "商品")}</TableHead>
                <TableHead className="text-xs text-right">{tf("Planned", "计划")}</TableHead>
                <TableHead className="text-xs text-right">{tf("Transferred", "已转")}</TableHead>
                <TableHead className="text-xs text-right">{tf("Remaining", "剩余")}</TableHead>
                <TableHead className="text-xs text-center">{tf("Status", "状态")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.lines.map((line) => {
                const remaining = line.plannedQty - line.transferredQty
                const isDone = remaining <= 0
                return (
                  <TableRow key={`${line.lineNo}-${line.skuCode}`}>
                    <TableCell className="text-xs">{line.lineNo}</TableCell>
                    <TableCell className="font-mono text-xs">{line.skuCode}</TableCell>
                    <TableCell className="text-xs">{line.productName}</TableCell>
                    <TableCell className="text-xs text-right">{line.plannedQty}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{line.transferredQty}</TableCell>
                    <TableCell className={cn("text-xs text-right font-medium", remaining > 0 && "text-orange-600")}>{remaining}</TableCell>
                    <TableCell className="text-xs text-center">
                      {isDone ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />{tf("Done", "完成")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700">
                          {tf("Pending", "待转")}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ─── Related Documents (关联单据) - below items ─────────────────── */}
      {documents.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">{tf("Related Documents", "关联单据")}</h4>
          <div className="space-y-2">
            {documents.map((doc) => {
              const meta = docStatusMeta[doc.status]
              const isInbound = doc.docType === "INBOUND"
              return (
                <div key={doc.docNo} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isInbound ? "bg-blue-50" : "bg-purple-50")}>
                      {isInbound
                        ? <FileInput className="h-4 w-4 text-blue-600" />
                        : <FileOutput className="h-4 w-4 text-purple-600" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{doc.docNo}</span>
                        <Badge className={cn("text-[10px]", meta.className)}>{doc.statusLabel || meta.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {isInbound ? tf("Inbound", "入库") : tf("Outbound", "出库")}
                        {" · "}
                        {doc.warehouseName}
                        {doc.expectedQty !== undefined && (
                          <span> · {doc.actualQty !== undefined ? `${doc.actualQty}/` : ""}{doc.expectedQty} PCS</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FilePlus className="h-4 w-4 text-blue-600" />
            {tf("Execution Document Creation", "执行单据创建状态")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">{tf("Status", "状态")}:</span>
            <Badge variant="outline" className={cn("text-[10px]", executionDocCreationMeta[order.executionDocCreationStatus].className)}>
              {executionDocCreationMeta[order.executionDocCreationStatus].label}
            </Badge>
          </div>
          {(order.executionDocCreatedCount !== undefined || order.executionDocTargetCount !== undefined) && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{tf("Progress", "创建进度")}:</span>
              <span>{order.executionDocCreatedCount ?? 0}/{order.executionDocTargetCount ?? 0}</span>
            </div>
          )}
          {order.executionDocLastUpdatedAt && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{tf("Last Updated", "最近创建时间")}:</span>
              <span>{new Date(order.executionDocLastUpdatedAt).toLocaleString()}</span>
            </div>
          )}
          {order.executionDocRetryCount !== undefined && order.executionDocRetryCount > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{tf("Retry Count", "重试次数")}:</span>
              <span>{order.executionDocRetryCount}</span>
            </div>
          )}
          {order.executionDocCreationError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-2 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300">
              <div className="font-medium">{tf("Failure Reason", "失败原因")}</div>
              <div className="mt-1">{order.executionDocCreationError}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Warehouse Route Card ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Truck className="h-4 w-4 text-purple-600" />
            {tf("Transfer Route", "调拨路径")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {/* Source */}
            <div className="flex-1 rounded-lg border p-3 text-center">
              <div className="text-xs text-muted-foreground">{tf("Source", "源仓")}</div>
              <div className="text-sm font-medium mt-1">{order.fromWarehouseName}</div>
              <div className="text-xs text-muted-foreground font-mono">{order.fromWarehouseCode}</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {/* Via (if exists) */}
            {hasVia && (
              <>
                <div className="flex-1 rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-center">
                  <div className="text-xs text-blue-600">{tf("FG Warehouse", "成品仓")}</div>
                  <div className="text-sm font-medium mt-1">{order.viaWarehouseName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{order.viaWarehouseCode}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </>
            )}
            {/* Target */}
            <div className="flex-1 rounded-lg border border-green-200 bg-green-50/50 p-3 text-center">
              <div className="text-xs text-green-600">{tf("Target", "目标仓")}</div>
              <div className="text-sm font-medium mt-1">{order.toWarehouseName}</div>
              <div className="text-xs text-muted-foreground font-mono">{order.toWarehouseCode}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Push / Sync Details (Collapsible) ────────────────────────────── */}
      {order.pushStatus !== "NONE" && (
        <Collapsible open={pushDetailOpen} onOpenChange={setPushDetailOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground hover:text-foreground">
              <span>{tf("Push / Sync Details", "推送/同步详情")}</span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", pushDetailOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="rounded-lg border bg-muted/20 p-4 mt-2 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{tf("Push Status", "推送状态")}:</span>
                <Badge variant="outline" className={cn("text-[10px]", pushStatusMeta[order.pushStatus].className)}>
                  {pushStatusMeta[order.pushStatus].label}
                </Badge>
              </div>
              {order.pushMessageId && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Message ID:</span>
                  <span className="font-mono text-right break-all">{order.pushMessageId}</span>
                </div>
              )}
              {order.lastPushedAt && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{tf("Last Push", "最后推送")}:</span>
                  <span className="text-right">{new Date(order.lastPushedAt).toLocaleString()}</span>
                </div>
              )}
              {order.retryCount !== undefined && order.retryCount > 0 && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">{tf("Retry Count", "重试次数")}:</span>
                  <span className="font-medium">{order.retryCount}</span>
                </div>
              )}
              {order.pushError && (
                <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-2 text-red-800 dark:text-red-300">
                  <div className="font-medium">{tf("Error", "异常")}</div>
                  <div className="mt-1">{order.pushError}</div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
