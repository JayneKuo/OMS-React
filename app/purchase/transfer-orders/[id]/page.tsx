"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeft, RefreshCw, Building, Clock, MapPin, Truck,
  Package, CheckCircle, AlertCircle, FileInput, FileOutput,
  TrendingUp, History, User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockOrder = {
  id: "to-1",
  transferNo: "TO202401150001",
  transferType: "PURCHASE_INBOUND",
  status: "CREATED",
  executionDocCreationStatus: "FAILED",
  executionDocCreationError: "Target inbound document creation failed",
  executionDocCreatedCount: 1,
  executionDocTargetCount: 3,
  executionDocLastUpdatedAt: "2024-01-15T11:00:00Z",
  executionDocRetryCount: 2,
  shippedQty: 70,
  receivedQty: 30,
  finalInboundNo: "RN-PO202403150001",
  finalInboundAction: "UPDATE",
  finalInboundExpectedQty: 70,
  remainingShipQty: 40,
  pendingInboundQty: 40,
  outboundShipments: [
    { outboundNo: "SO-FAC-SZ01-A1", shippedQty: 30, shippedAt: "2024-01-16T10:00:00Z" },
    { outboundNo: "SO-FAC-SZ01-A2", shippedQty: 40, shippedAt: "2024-01-17T10:00:00Z" },
  ],
  fromWarehouseName: "Shenzhen Smart Factory Warehouse",
  fromWarehouseCode: "FAC-WH-SZ01",
  viaWarehouseName: "Shenzhen Vendor FG Warehouse",
  viaWarehouseCode: "VFG-SZ01",
  toWarehouseName: "Main Warehouse - Los Angeles",
  toWarehouseCode: "WH001",
  sourceName: "Shenzhen Smart Factory",
  sourceCode: "FAC-SZ01",
  sourceDocumentNo: "PO202403150001",
  referenceNo: "REF-TO-001",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T14:20:00Z",
  pushStatus: "CREATED",
  pushMessageId: "msg-12345",
  lastPushedAt: "2024-01-15T11:00:00Z",
  retryCount: 0,
  lines: [
    { lineNo: 1, skuCode: "SKU001", productName: "iPhone 15 Pro", plannedQty: 60, transferredQty: 0, uom: "PCS" },
    { lineNo: 2, skuCode: "SKU002", productName: "MacBook Pro", plannedQty: 50, transferredQty: 0, uom: "PCS" },
  ],
  relatedDocuments: [
    { docNo: "VRN-SZ01-A1", docType: "INBOUND", warehouseName: "Shenzhen Vendor FG Warehouse", warehouseCode: "VFG-SZ01", status: "CONFIRMED", expectedQty: 110, actualQty: 110, pushedToWms: true, lastPushedAt: "2024-01-15T11:10:00Z", retryCount: 0, messageId: "wms-vrn-001", location: "VFG-SZ01 / FG-A-01", notes: "Vendor warehouse receipt generated from transfer order." },
    { docNo: "SO-FAC-SZ01-A1", docType: "OUTBOUND", warehouseName: "Shenzhen Vendor FG Warehouse", warehouseCode: "VFG-SZ01", status: "FAILED", expectedQty: 110, actualQty: 70, pushedToWms: false, lastPushedAt: "2024-01-16T10:00:00Z", retryCount: 2, messageId: "wms-so-001", location: "VFG-SZ01 / DOCK-02", error: "WMS rejected outbound update because target RN is not ready.", notes: "Outbound document waits for successful WMS push before shipment confirmation." },
    { docNo: "RN-PO202403150001", docType: "INBOUND", warehouseName: "Main Warehouse - Los Angeles", warehouseCode: "WH001", status: "CREATED", expectedQty: 70, actualQty: 30, pushedToWms: true, lastPushedAt: "2024-01-16T10:05:00Z", retryCount: 0, messageId: "wms-rn-001", location: "WH001 / REC-A-03", notes: "Final inbound is updated by cumulative outbound shipment quantity." },
  ],
}

// ─── Component ──────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string }
}

export default function TransferOrderDetailPage({ params }: PageProps) {
  const { t, language } = useI18n()
  const tf = React.useCallback((en: string, zh: string) => language === "en" ? en : zh, [language])
  const router = useRouter()
  const sidebarItems = createPurchaseSidebarItems(t)
  const [activeTab, setActiveTab] = React.useState("lines")
  const [activeSideTab, setActiveSideTab] = React.useState("routing")
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedDocumentNo, setSelectedDocumentNo] = React.useState(mockOrder.relatedDocuments[0]?.docNo || "")

  const order = mockOrder
  const hasVia = Boolean(order.viaWarehouseCode)
  const totalPlanned = order.lines.reduce((s, l) => s + l.plannedQty, 0)
  const totalTransferred = order.lines.reduce((s, l) => s + l.transferredQty, 0)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  // Step progress
  const steps = hasVia
    ? [
        { key: "confirmed", label: tf("Confirmed", "已确认") },
        { key: "fg_inbound", label: tf("FG Inbound", "成品仓入库") },
        { key: "outbound", label: tf("Outbound", "出库") },
        { key: "target_inbound", label: tf("Target Inbound", "目标入库") },
      ]
    : [
        { key: "confirmed", label: tf("Confirmed", "已确认") },
        { key: "outbound", label: tf("Outbound", "出库") },
        { key: "target_inbound", label: tf("Target Inbound", "目标入库") },
      ]

  const stepIndex = (() => {
    switch (order.status) {
      case "DRAFT": return -1
      case "CREATED": return 0
      case "PROCESSING": return 1
      case "INBOUND_AT_SOURCE": return 1
      case "IN_TRANSIT": return hasVia ? 2 : 2
      case "RECEIVED":
      case "CLOSED": return steps.length - 1
      default: return -1
    }
  })()

  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: tf("Draft", "草稿"), className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    CREATED: { label: tf("Created", "已创建"), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    PROCESSING: { label: tf("Processing", "执行中"), className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
    INBOUND_AT_SOURCE: { label: tf("Source Inbound", "源仓入库中"), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    IN_TRANSIT: { label: tf("In Transit", "在途"), className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
    RECEIVED: { label: tf("Received", "已收货"), className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    CLOSED: { label: tf("Closed", "已关闭"), className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    VOIDED: { label: tf("Voided", "已作废"), className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  }

  const typeConfig: Record<string, string> = {
    PURCHASE_INBOUND: tf("Purchase Inbound", "采购入库调拨"),
    WAREHOUSE_TRANSFER: tf("Warehouse Transfer", "仓间调拨"),
    RETURN_TRANSFER: tf("Return Transfer", "退货调拨"),
    REPLENISHMENT: tf("Replenishment", "补货调拨"),
    CROSS_DOCK: tf("Cross Dock", "越库调拨"),
    MANUAL: tf("Manual", "手动创建"),
  }

  const currentStatus = statusConfig[order.status] || { label: order.status, className: "" }

  const executionDocCreationConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: tf("Pending", "待创建"), className: "border-gray-200 bg-gray-50 text-gray-700" },
    CREATING: { label: tf("Creating", "创建中"), className: "border-blue-200 bg-blue-50 text-blue-700" },
    FAILED: { label: tf("Failed", "创建失败"), className: "border-red-200 bg-red-50 text-red-700" },
    PARTIAL_SUCCESS: { label: tf("Partial Success", "部分成功"), className: "border-orange-200 bg-orange-50 text-orange-700" },
    SUCCESS: { label: tf("Success", "全部成功"), className: "border-green-200 bg-green-50 text-green-700" },
    CANCELLED: { label: tf("Cancelled", "已取消"), className: "border-gray-300 bg-gray-100 text-gray-700" },
  }

  const currentExecutionDocCreation = executionDocCreationConfig[order.executionDocCreationStatus] || { label: order.executionDocCreationStatus, className: "" }

  const docStatusMeta: Record<string, { label: string; className: string }> = {
    NONE: { label: tf("Not Created", "未创建"), className: "bg-gray-100 text-gray-600" },
    CREATED: { label: tf("Created", "已创建"), className: "bg-blue-100 text-blue-700" },
    PUSHED: { label: tf("Pushed", "已推送"), className: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: tf("Confirmed", "已确认"), className: "bg-green-100 text-green-700" },
    CLOSED: { label: tf("Closed", "已关闭"), className: "bg-teal-100 text-teal-700" },
    FAILED: { label: tf("Failed", "失败"), className: "bg-red-100 text-red-700" },
    CANCELLED: { label: tf("Cancelled", "已取消"), className: "bg-gray-200 text-gray-600" },
  }

  const selectedDocument = order.relatedDocuments.find((doc) => doc.docNo === selectedDocumentNo) || order.relatedDocuments[0]
  const selectedDocumentMeta = selectedDocument ? docStatusMeta[selectedDocument.status] || { label: selectedDocument.status, className: "" } : undefined
  const selectedDocumentIsInbound = selectedDocument?.docType === "INBOUND"
  const routingHistory = [
    {
      id: "route-1",
      timestamp: order.createdAt,
      action: tf("Transfer Created", "调拨单创建"),
      details: hasVia
        ? tf(
            `${order.fromWarehouseName} routes via ${order.viaWarehouseName} to ${order.toWarehouseName}.`,
            `${order.fromWarehouseName} 经 ${order.viaWarehouseName} 路由到 ${order.toWarehouseName}。`
          )
        : tf(
            `${order.fromWarehouseName} routes directly to ${order.toWarehouseName}.`,
            `${order.fromWarehouseName} 直接路由到 ${order.toWarehouseName}。`
          ),
      user: tf("OMS Routing", "OMS 路由"),
    },
    {
      id: "route-2",
      timestamp: order.updatedAt,
      action: tf("Current Fulfillment Route", "当前履约路径"),
      details: hasVia
        ? tf(
            `Inbound at ${order.viaWarehouseName}, outbound from ${order.viaWarehouseName}, final receipt at ${order.toWarehouseName}.`,
            `${order.viaWarehouseName} 入库后出库，最终在 ${order.toWarehouseName} 收货。`
          )
        : tf(
            `Outbound from ${order.fromWarehouseName}, final receipt at ${order.toWarehouseName}.`,
            `${order.fromWarehouseName} 出库后，最终在 ${order.toWarehouseName} 收货。`
          ),
      user: tf("System", "系统"),
    },
  ]
  const eventHistory = [
    {
      id: "event-1",
      timestamp: order.createdAt,
      event: tf("Transfer Created", "调拨单创建"),
      description: tf("Transfer order was created in OMS.", "调拨单已在 OMS 中创建。"),
      user: tf("System", "系统"),
    },
    {
      id: "event-2",
      timestamp: order.executionDocLastUpdatedAt,
      event: tf("Execution Document Status", "执行单据状态"),
      description: tf(
        `Execution document status is ${currentExecutionDocCreation.label}.`,
        `执行单据状态为 ${currentExecutionDocCreation.label}。`
      ),
      user: tf("OMS", "OMS"),
    },
    {
      id: "event-3",
      timestamp: order.lastPushedAt,
      event: tf("Selected Document Sync", "选中单据同步"),
      description: tf(
        `${selectedDocument.docNo} is ${selectedDocument.pushedToWms ? "already synced to WMS" : "still waiting for WMS sync"}.`,
        `${selectedDocument.docNo}${selectedDocument.pushedToWms ? " 已同步到 WMS" : " 仍在等待 WMS 同步"}。`
      ),
      user: tf("Warehouse Sync", "仓库同步"),
    },
  ]
  const selectedDocumentSteps = selectedDocumentIsInbound
    ? [
        { key: "created", label: tf("New", "新建"), subLabel: tf("Created", "已创建") },
        { key: "pushed", label: tf("Pending Receipt", "待收货"), subLabel: selectedDocument?.pushedToWms ? tf("Pushed", "已推送") : tf("Not Pushed", "未推送") },
        { key: "receiving", label: tf("Receiving", "收货中"), subLabel: tf("In Process", "处理中") },
        { key: "received", label: tf("Received", "已收货"), subLabel: `${selectedDocument?.actualQty ?? 0} / ${selectedDocument?.expectedQty ?? 0}` },
        { key: "closed", label: tf("Closed", "已关闭"), subLabel: tf("Final", "完成") },
      ]
    : [
        { key: "created", label: tf("New", "新建"), subLabel: tf("Created", "已创建") },
        { key: "pushed", label: tf("Pending Push", "待推送"), subLabel: selectedDocument?.pushedToWms ? tf("Pushed", "已推送") : tf("Not Pushed", "未推送") },
        { key: "picking", label: tf("Picking", "拣货中"), subLabel: tf("In Process", "处理中") },
        { key: "shipped", label: tf("Shipped", "已发货"), subLabel: `${selectedDocument?.actualQty ?? 0} / ${selectedDocument?.expectedQty ?? 0}` },
        { key: "closed", label: tf("Closed", "已关闭"), subLabel: tf("Final", "完成") },
      ]
  const selectedDocumentStepIndex = (() => {
    if (!selectedDocument) return -1
    if (selectedDocument.status === "FAILED") return 1
    if (selectedDocument.status === "NONE") return -1
    if (selectedDocument.status === "CREATED") return 0
    if (selectedDocument.status === "PUSHED") return 1
    if (selectedDocument.status === "CONFIRMED") return 3
    if (selectedDocument.status === "CLOSED") return 4
    return -1
  })()
  const selectedDocumentCanRetry = selectedDocument?.status === "FAILED" || selectedDocument?.pushedToWms === false

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-4">
          {/* ─── Header (same structure as PO detail) ─────────────────────── */}
          <div className="bg-white dark:bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/purchase/transfer-orders")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold font-mono">{order.transferNo}</h1>
                    <Badge className={currentStatus.className}>{currentStatus.label}</Badge>
                    <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      {typeConfig[order.transferType] || order.transferType}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", currentExecutionDocCreation.className)}>
                      {tf("Execution Documents", "执行单据创建")}: {currentExecutionDocCreation.label}
                    </Badge>
                    {hasVia && (
                      <Badge variant="outline" className="text-[10px] border-purple-200 bg-purple-50 text-purple-700">
                        {tf("Via FG Warehouse", "经成品仓")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building className="h-3 w-3" />
                    <span>{order.sourceName}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{tf("Created", "创建")}: {new Date(order.createdAt).toLocaleDateString()}</span>
                    {order.sourceDocumentNo && (
                      <>
                        <span>·</span>
                        <span>{tf("Related Document", "相关单据")}: {order.sourceDocumentNo}</span>
                        {order.referenceNo && (
                          <>
                            <span>·</span>
                            <span>{tf("Ref", "Ref")}: {order.referenceNo}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{tf("Refresh data", "刷新数据")}</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {(order.executionDocCreationStatus === "FAILED" || order.finalInboundAction === "UPDATE") && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
              <CardContent className="flex items-start gap-3 p-4 text-sm text-amber-900 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-medium">{tf("Transfer execution needs attention", "调拨执行需要关注")}</div>
                  <div className="mt-1 text-amber-800 dark:text-amber-300">
                    {tf(
                      "Execution documents are not fully ready. Review final inbound and execution status before pushing updates.",
                      "执行单据尚未全部就绪。推送更新前请核对最终入库单和执行单据状态。"
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "lines" && (
            <>
              {/* ─── Step Progress Bar ────────────────────────────────────────── */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {steps.map((step, idx) => {
                      const isDone = idx <= stepIndex
                      const isCurrent = idx === stepIndex
                      return (
                        <React.Fragment key={step.key}>
                          {idx > 0 && (
                            <div className={cn("flex-1 h-0.5 mx-2", isDone ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700")} />
                          )}
                          <div className="flex flex-col items-center flex-1">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              isDone ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : isCurrent ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                  : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                            )}>
                              {isDone ? <CheckCircle className="h-5 w-5" />
                                : idx === steps.length - 1 ? <MapPin className="h-5 w-5" />
                                  : step.key === "outbound" ? <Truck className="h-5 w-5" />
                                    : <Package className="h-5 w-5" />}
                            </div>
                            <div className="mt-2 text-center">
                              <div className={cn("text-sm font-medium", isDone ? "text-green-700 dark:text-green-400" : "")}>{step.label}</div>
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ─── 4-Column Info Cards (same pattern as PO detail) ──────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />{tf("Transfer Details", "调拨信息")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Transfer Order No.", "调拨单号")}:</span><span className="font-mono font-medium">{order.transferNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Transfer Type", "调拨类型")}:</span><span>{typeConfig[order.transferType]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Related Document No.", "相关单据号")}:</span><span className="font-mono">{order.sourceDocumentNo || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Ref No.", "Ref 单号")}:</span><span className="font-mono">{order.referenceNo || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Created At", "创建时间")}:</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Route Mode", "路径模式")}:</span><Badge variant="outline" className="text-[10px]">{hasVia ? tf("Via FG Warehouse", "经成品仓") : tf("Direct", "直发")}</Badge></div>
              </CardContent>
            </Card>

            {/* 源仓库 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4 text-orange-600" />{tf("Source Warehouse", "源仓库")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
                  <div className="font-bold text-sm">{order.fromWarehouseName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{order.fromWarehouseCode}</div>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Vendor", "供应商")}:</span><span className="font-medium">{order.sourceName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Vendor Code", "供应商编码")}:</span><span className="font-mono">{order.sourceCode}</span></div>
              </CardContent>
            </Card>

            {/* 目标仓库 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />{tf("Target Warehouse", "目标仓库")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
                  <div className="font-bold text-sm">{order.toWarehouseName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{order.toWarehouseCode}</div>
                </div>
              </CardContent>
            </Card>

            {/* 进度摘要 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-purple-600" />{tf("Transfer Progress", "调拨进度")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 dark:bg-blue-900/20">
                    <div className="text-muted-foreground">{tf("Planned Qty", "计划数量")}</div>
                    <div className="font-bold text-lg text-blue-600">{totalPlanned}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200 dark:bg-green-900/20">
                    <div className="text-muted-foreground">{tf("Transferred", "已调拨")}</div>
                    <div className="font-bold text-lg text-green-600">{totalTransferred}</div>
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Completion", "完成率")}:</span><span className="font-medium">{totalPlanned > 0 ? Math.round(totalTransferred / totalPlanned * 100) : 0}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Shipped", "已发货")}:</span><span className="font-medium">{order.shippedQty} PCS</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Received", "已收货")}:</span><span className="font-medium">{order.receivedQty} PCS</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{tf("Item Lines", "商品行")}:</span><span className="font-medium">{order.lines.length} {tf("Lines", "行")}</span></div>
              </CardContent>
            </Card>
          </div>
            </>
          )}

          {/* CONTENT ROW WITH RIGHT COLUMN */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              {/* ─── Tabs (same pattern as PO detail) ─────────────────────────── */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="lines">{tf("Items", "商品明细")}</TabsTrigger>
                  <TabsTrigger value="documents">
                    {tf("Related Documents", "关联单据")}
                    <Badge variant="secondary" className="ml-2">{order.relatedDocuments.length}</Badge>
                  </TabsTrigger>
                </TabsList>

            {/* 商品明细 Tab */}
            <TabsContent value="lines" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tf("Transfer Items", "调拨商品")}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {totalTransferred}/{totalPlanned} PCS ({totalPlanned > 0 ? Math.round(totalTransferred / totalPlanned * 100) : 0}%)
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm font-medium p-3">{tf("Line", "行号")}</TableHead>
                        <TableHead className="text-sm font-medium p-3">SKU</TableHead>
                        <TableHead className="text-sm font-medium p-3">{tf("Product Name", "商品名称")}</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-right">{tf("Planned Qty", "计划数量")}</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-right">{tf("Transferred", "已调拨")}</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-right">{tf("Remaining", "剩余")}</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-center">{tf("Unit", "单位")}</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-center">{t('status')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.lines.map((line) => {
                        const remaining = line.plannedQty - line.transferredQty
                        const isDone = remaining <= 0
                        return (
                          <TableRow key={line.lineNo} className="hover:bg-muted/50">
                            <TableCell className="p-3"><Badge variant="outline" className="text-xs font-mono">{String(line.lineNo).padStart(2, "0")}</Badge></TableCell>
                            <TableCell className="p-3 font-mono text-xs">{line.skuCode}</TableCell>
                            <TableCell className="p-3 text-sm font-medium">{line.productName}</TableCell>
                            <TableCell className="p-3 text-right font-medium">{line.plannedQty}</TableCell>
                            <TableCell className="p-3 text-right font-medium text-green-600">{line.transferredQty}</TableCell>
                            <TableCell className={cn("p-3 text-right font-medium", remaining > 0 && "text-orange-600")}>{remaining}</TableCell>
                            <TableCell className="p-3 text-center"><Badge variant="secondary" className="text-[10px]">{line.uom}</Badge></TableCell>
                            <TableCell className="p-3 text-center">
                              {isDone ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />{tf("Done", "完成")}</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">{tf("Pending", "待转")}</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>


            {/* 关联单据 Tab */}
            <TabsContent value="documents" className="mt-4">
              <div>
                {selectedDocument && selectedDocumentMeta && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tf("Related Documents", "关联单据")}</CardTitle>
                        <div className="text-sm text-muted-foreground">{order.relatedDocuments.length} {tf("documents", "张单据")}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid xl:grid-cols-[360px_minmax(0,1fr)]">
                        <div className="border-r">
                          {order.relatedDocuments.map((doc) => {
                            const meta = docStatusMeta[doc.status] || { label: doc.status, className: "" }
                            const isInbound = doc.docType === "INBOUND"
                            const isSelected = selectedDocument?.docNo === doc.docNo
                            return (
                              <button
                                key={doc.docNo}
                                type="button"
                                onClick={() => setSelectedDocumentNo(doc.docNo)}
                                className={cn(
                                  "flex w-full items-start gap-3 border-b p-4 text-left transition-colors last:border-b-0 hover:bg-muted/40",
                                  isSelected && "border-l-4 border-l-primary bg-primary/5"
                                )}
                              >
                                <div className={cn("mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full", isInbound ? "bg-blue-50" : "bg-purple-50")}>
                                  {isInbound ? <FileInput className="h-4 w-4 text-blue-600" /> : <FileOutput className="h-4 w-4 text-purple-600" />}
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="truncate font-mono text-sm font-semibold">{doc.docNo}</span>
                                    <Badge className={cn("text-[10px]", meta.className)}>{meta.label}</Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{isInbound ? tf("Inbound Document", "入库单") : tf("Outbound Document", "出库单")}</div>
                                  <div className="line-clamp-2 text-xs text-muted-foreground">{doc.warehouseName}</div>
                                  <div className="text-xs font-medium">{doc.actualQty ?? 0} / {doc.expectedQty ?? 0}</div>
                                  {doc.pushedToWms === false && (
                                    <Badge variant="outline" className="border-orange-200 bg-orange-50 text-[10px] text-orange-700">{tf("Not Pushed", "未推送")}</Badge>
                                  )}
                                </div>
                              </button>
                            )
                          })}
                        </div>

                        <div className="border-r p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b p-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-mono text-xl font-semibold">{selectedDocument.docNo}</h3>
                              <Badge className={cn("text-[10px]", selectedDocumentMeta.className)}>{selectedDocumentMeta.label}</Badge>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {selectedDocumentIsInbound ? tf("Inbound", "入库") : tf("Outbound", "出库")} · {selectedDocument.warehouseName}
                            </div>
                          </div>
                          {selectedDocumentCanRetry && (
                            <Button size="sm" variant="outline" className="border-orange-200 text-orange-700">
                              <RefreshCw className="mr-2 h-4 w-4" />{tf("Retry Push", "重试推送")}
                            </Button>
                          )}
                        </div>
                        <div className="space-y-5 p-5">
                        <div className="rounded-lg bg-muted/40 p-5">
                          <div className="flex items-center justify-between">
                            {selectedDocumentSteps.map((step, idx) => {
                              const isDone = idx <= selectedDocumentStepIndex && selectedDocument.status !== "FAILED"
                              const isFailedCurrent = selectedDocument.status === "FAILED" && idx === selectedDocumentStepIndex
                              return (
                                <React.Fragment key={step.key}>
                                  {idx > 0 && <div className={cn("mx-3 h-0.5 flex-1", isDone ? "bg-green-300" : "bg-gray-200")} />}
                                  <div className="flex min-w-[92px] flex-col items-center text-center">
                                    <div className={cn(
                                      "flex h-9 w-9 items-center justify-center rounded-full",
                                      isFailedCurrent ? "bg-red-100 text-red-700" : isDone ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                                    )}>
                                      {isFailedCurrent ? <AlertCircle className="h-5 w-5" /> : isDone ? <CheckCircle className="h-5 w-5" /> : selectedDocumentIsInbound ? <FileInput className="h-4 w-4" /> : <FileOutput className="h-4 w-4" />}
                                    </div>
                                    <div className={cn("mt-2 text-sm font-medium", isDone && "text-green-700", isFailedCurrent && "text-red-700")}>{step.label}</div>
                                    <div className="text-xs text-muted-foreground">{step.subLabel}</div>
                                  </div>
                                </React.Fragment>
                              )
                            })}
                          </div>
                        </div>

                        {selectedDocument.error && (
                          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            <div className="font-medium">{tf("Push Failure", "推送失败")}</div>
                            <div className="mt-1">{selectedDocument.error}</div>
                          </div>
                        )}

                        <div>
                          <h3 className="mb-3 text-sm font-semibold">{tf("Items", "商品明细")}</h3>
                          <div className="overflow-hidden rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead className="text-xs">{tf("Product", "商品")}</TableHead>
                                  <TableHead className="text-right text-xs">{tf("Expected", "预计")}</TableHead>
                                  <TableHead className="text-right text-xs">{tf("Actual", "实际")}</TableHead>
                                  <TableHead className="text-xs">UOM</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {order.lines.map((line) => (
                                  <TableRow key={line.lineNo}>
                                    <TableCell>
                                      <div className="text-sm font-medium">{line.productName}</div>
                                      <div className="font-mono text-xs text-muted-foreground">{line.skuCode}</div>
                                    </TableCell>
                                    <TableCell className="text-right text-sm">{line.plannedQty}</TableCell>
                                    <TableCell className="text-right text-sm">{Math.min(line.plannedQty, Math.round((selectedDocument.actualQty ?? 0) * line.plannedQty / Math.max(totalPlanned, 1)))}</TableCell>
                                    <TableCell><Badge variant="secondary" className="text-[10px]">{line.uom}</Badge></TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <Card className="shadow-none">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">{tf("Document Information", "单据信息")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Document No.", "单据号")}:</span><span className="font-mono">{selectedDocument.docNo}</span></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("WMS Status", "WMS 状态")}:</span><Badge className={cn("text-[10px]", selectedDocumentMeta.className)}>{selectedDocumentMeta.label}</Badge></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Message ID:</span><span className="font-mono text-xs">{selectedDocument.messageId || "-"}</span></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Last Pushed", "最后推送")}:</span><span>{selectedDocument.lastPushedAt ? new Date(selectedDocument.lastPushedAt).toLocaleString() : "-"}</span></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Retry Count", "重试次数")}:</span><span>{selectedDocument.retryCount ?? 0}</span></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Expected / Actual", "预计 / 实际")}:</span><span className="font-medium">{selectedDocument.expectedQty ?? 0} / {selectedDocument.actualQty ?? 0}</span></div>
                            </CardContent>
                          </Card>

                          <Card className="shadow-none">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm">{tf("Warehouse & Location", "仓库与库位")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Warehouse", "仓库")}:</span><span className="font-medium">{selectedDocument.warehouseName}</span></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Warehouse Code", "仓库编码")}:</span><Badge variant="outline" className="text-[10px]">{selectedDocument.warehouseCode}</Badge></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Location", "库位")}:</span><span className="font-mono text-xs">{selectedDocument.location || "-"}</span></div>
                              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{tf("Source Allocation", "来源分配")}:</span><span className="font-mono text-xs">{order.referenceNo}</span></div>
                            </CardContent>
                          </Card>
                        </div>

                        {selectedDocument.notes && (
                          <div>
                            <h3 className="mb-2 text-sm font-semibold">{tf("Notes", "备注")}</h3>
                            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">{selectedDocument.notes}</div>
                          </div>
                        )}
                        </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                )}
              </div>
            </TabsContent>

              </Tabs>
            </div>

            {/* RIGHT COLUMN - Side Tabs */}
          <div className="lg:col-span-1">
            <Card>
              <Tabs value={activeSideTab} onValueChange={setActiveSideTab}>
                <CardHeader className="pb-3">
                  <TabsList className="inline-grid w-auto grid-cols-2">
                    <TabsTrigger value="routing" className="px-4">Routing</TabsTrigger>
                    <TabsTrigger value="events" className="px-4">Events</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="routing" className="mt-0">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Routing History</span>
                      </div>
                      <div className="space-y-3">
                        {routingHistory.map((route) => (
                          <div key={route.id} className="relative border-l-2 border-blue-200 pb-4 pl-6 last:border-l-0 last:pb-0 dark:border-blue-800">
                            <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 border-background bg-blue-500" />
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{route.action}</div>
                              <div className="text-xs text-muted-foreground">{new Date(route.timestamp).toLocaleString()}</div>
                              <div className="mt-1 text-xs text-muted-foreground">{route.details}</div>
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{route.user}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="events" className="mt-0">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <History className="h-4 w-4 text-green-600" />
                        <span>Event History</span>
                      </div>
                      <div className="space-y-3">
                        {eventHistory.map((event) => (
                          <div key={event.id} className="relative border-l-2 border-green-200 pb-4 pl-6 last:border-l-0 last:pb-0 dark:border-green-800">
                            <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{event.event}</div>
                              <div className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</div>
                              <div className="mt-1 text-xs text-muted-foreground">{event.description}</div>
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{event.user}</span>
                              </div>
                            </div>
                          </div>
                        ))}
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
    </TooltipProvider>
  )
}
