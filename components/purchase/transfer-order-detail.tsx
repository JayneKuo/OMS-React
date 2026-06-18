"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  CheckCircle, Package, Truck, Send, Ban,
  FilePlus, RefreshCw, Building, Clock, ArrowRight,
  FileInput, FileOutput
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Generic Transfer Order Types ───────────────────────────────────────────

export type TransferOrderStatus = "DRAFT" | "CREATED" | "PROCESSING" | "INBOUND_AT_SOURCE" | "IN_TRANSIT" | "RECEIVED" | "CLOSED" | "VOIDED" | "CANCELLED"

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
    CANCELLED: { label: tf("Cancelled", "已取消"), className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
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

  const currentStatusMeta = statusMeta[order.status] || {
    label: order.status,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  }

  const canRetry = ["FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
  const canCancel = ["PENDING", "CREATING", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
  const canCreate = ["PENDING", "CANCELLED", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)

  const lifecycleSteps = [
    { key: "created", label: tf("Created", "已创建"), subLabel: tf("Created", "已创建") },
    { key: "processing", label: tf("Processing", "进行中"), subLabel: tf("In Progress", "处理中") },
    { key: "in_transit", label: tf("In Transit", "在途"), subLabel: tf("Shipping", "运输中") },
    { key: "receiving", label: tf("Receiving", "收货中"), subLabel: `${totalTransferred} / ${totalPlanned}` },
    { key: "completed", label: tf("Completed", "已完成"), subLabel: tf("Final", "完成") },
  ]

  const lifecycleStepIndex = (() => {
    switch (order.status) {
      case "DRAFT":
      case "CREATED":
        return 0
      case "PROCESSING":
      case "INBOUND_AT_SOURCE":
        return 1
      case "IN_TRANSIT":
        return 2
      case "RECEIVED":
        return 3
      case "CLOSED":
        return 4
      case "VOIDED":
      case "CANCELLED":
      default:
        return 0
    }
  })()

  return (
    <div className="p-6 space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-4 pb-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-semibold font-mono">{order.transferNo}</h3>
              <Badge className={currentStatusMeta.className}>{currentStatusMeta.label}</Badge>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              {order.sourceDocumentNo && <span>{tf("Source Doc", "来源单据")}: <span className="font-mono text-foreground">{order.sourceDocumentNo}</span></span>}
              {order.referenceNo && <span>{tf("Ref No", "Ref 单号")}: <span className="font-mono text-foreground">{order.referenceNo}</span></span>}
              {order.createdAt && <span>{tf("Target RN", "目标 RN")} → <span className="text-foreground">{new Date(order.createdAt).toLocaleString()}</span></span>}
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

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="font-medium">{tf("Target receipt is derived from the allocation chain", "目标仓 RN 由分配链路履约")}</div>
          <div className="mt-1 text-amber-800">{tf("If vendor, quantity, or route changes, please revise the allocation before pushing to the warehouse.", "如需修改 vendor、数量或路径，请先调整分配链路后再推仓。")}</div>
        </div>

        <div className="rounded-lg bg-muted/40 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            {lifecycleSteps.map((step, idx) => {
              const isCompleted = idx < lifecycleStepIndex
              const isCurrent = idx === lifecycleStepIndex
              return (
                <React.Fragment key={step.key}>
                  {idx > 0 && (
                    <div className={cn(
                      "mt-5 h-0.5 flex-1",
                      idx <= lifecycleStepIndex ? "bg-green-300" : "bg-border"
                    )} />
                  )}
                  <div className="flex min-w-[120px] flex-col items-center text-center">
                    <div className={cn(
                      "mb-3 flex h-8 w-8 items-center justify-center rounded-full border",
                      isCompleted || isCurrent
                        ? "border-green-200 bg-green-50 text-green-600"
                        : "border-border bg-background text-muted-foreground"
                    )}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.subLabel}</div>
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

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
          <div className="space-y-3">
            {documents.map((doc) => {
              const meta = docStatusMeta[doc.status] || { label: doc.status, className: "bg-gray-100 text-gray-600" }
              const isInbound = doc.docType === "INBOUND"
              return (
                <Card key={doc.docNo}>
                  <CardContent className="p-4">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", isInbound ? "bg-blue-50" : "bg-purple-50")}>
                            {isInbound
                              ? <FileInput className="h-4 w-4 text-blue-600" />
                              : <FileOutput className="h-4 w-4 text-purple-600" />
                            }
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">{isInbound ? tf("Inbound Document", "入库单据") : tf("Outbound Document", "出库单据")}</div>
                            <div className="font-mono text-sm font-medium">{doc.docNo}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                          <span className="text-muted-foreground">{tf("Warehouse", "仓库")}</span>
                          <div className="text-right">{doc.warehouseName}</div>
                          <span className="text-muted-foreground">{tf("Warehouse Code", "仓库编码")}</span>
                          <div className="text-right font-mono">{doc.warehouseCode}</div>
                          {doc.expectedQty !== undefined && (
                            <>
                              <span className="text-muted-foreground">{tf("Expected / Actual", "应收/实收")}</span>
                              <div className="text-right">
                                {doc.actualQty !== undefined ? `${doc.actualQty} / ${doc.expectedQty}` : doc.expectedQty}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
                          <span className="text-muted-foreground">{tf("Status", "状态")}</span>
                          <div className="flex justify-end"><Badge className={cn("text-[10px]", meta.className)}>{doc.statusLabel || meta.label}</Badge></div>
                          {order.sourceCode && (
                            <>
                              <span className="text-muted-foreground">{tf("Source Allocation", "来源调拨")}</span>
                              <div className="text-right font-mono">{order.sourceCode}</div>
                            </>
                          )}
                          {order.outboundOrderNo && isInbound && (
                            <>
                              <span className="text-muted-foreground">{tf("Outbound / SO", "Outbound / SO")}</span>
                              <div className="text-right font-mono">{order.outboundOrderNo}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
