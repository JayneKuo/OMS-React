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
  ArrowLeft, ArrowRight, RefreshCw, Building, Clock, MapPin, Truck,
  Package, CheckCircle, AlertCircle, FileInput, FileOutput, Send,
  FilePlus, Ban, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
    { docNo: "VRN-SZ01-A1", docType: "INBOUND", warehouseName: "Shenzhen Vendor FG Warehouse", warehouseCode: "VFG-SZ01", status: "CREATED", expectedQty: 110 },
    { docNo: "SO-FAC-SZ01-A1", docType: "OUTBOUND", warehouseName: "Shenzhen Vendor FG Warehouse", warehouseCode: "VFG-SZ01", status: "NONE", expectedQty: 110 },
    { docNo: "RN-PO202403150001", docType: "INBOUND", warehouseName: "Main Warehouse - Los Angeles", warehouseCode: "WH001", status: "NONE", expectedQty: 110 },
  ],
}

// ─── Component ──────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string }
}

export default function TransferOrderDetailPage({ params }: PageProps) {
  const { t } = useI18n()
  const router = useRouter()
  const sidebarItems = createPurchaseSidebarItems(t)
  const [activeTab, setActiveTab] = React.useState("lines")
  const [isLoading, setIsLoading] = React.useState(false)
  const [pushDetailOpen, setPushDetailOpen] = React.useState(false)

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
        { key: "confirmed", label: "已确认" },
        { key: "fg_inbound", label: "成品仓入库" },
        { key: "outbound", label: "出库" },
        { key: "target_inbound", label: "目标入库" },
      ]
    : [
        { key: "confirmed", label: "已确认" },
        { key: "outbound", label: "出库" },
        { key: "target_inbound", label: "目标入库" },
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
    DRAFT: { label: "草稿", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    CREATED: { label: "已创建", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    PROCESSING: { label: "执行中", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
    INBOUND_AT_SOURCE: { label: "源仓入库中", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    IN_TRANSIT: { label: "在途", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
    RECEIVED: { label: "已收货", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    CLOSED: { label: "已关闭", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    VOIDED: { label: "已作废", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  }

  const typeConfig: Record<string, string> = {
    PURCHASE_INBOUND: "采购入库调拨",
    WAREHOUSE_TRANSFER: "仓间调拨",
    RETURN_TRANSFER: "退货调拨",
    REPLENISHMENT: "补货调拨",
    CROSS_DOCK: "越库调拨",
    MANUAL: "手动创建",
  }

  const currentStatus = statusConfig[order.status] || { label: order.status, className: "" }

  const executionDocCreationConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "待创建", className: "border-gray-200 bg-gray-50 text-gray-700" },
    CREATING: { label: "创建中", className: "border-blue-200 bg-blue-50 text-blue-700" },
    FAILED: { label: "创建失败", className: "border-red-200 bg-red-50 text-red-700" },
    PARTIAL_SUCCESS: { label: "部分成功", className: "border-orange-200 bg-orange-50 text-orange-700" },
    SUCCESS: { label: "全部成功", className: "border-green-200 bg-green-50 text-green-700" },
    CANCELLED: { label: "已取消", className: "border-gray-300 bg-gray-100 text-gray-700" },
  }

  const currentExecutionDocCreation = executionDocCreationConfig[order.executionDocCreationStatus] || { label: order.executionDocCreationStatus, className: "" }
  const canCreateExecutionDocs = ["PENDING", "FAILED", "PARTIAL_SUCCESS", "CANCELLED"].includes(order.executionDocCreationStatus)
  const canRetryExecutionDocs = ["FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
  const canCancelExecutionDocs = ["PENDING", "CREATING", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)

  const docStatusMeta: Record<string, { label: string; className: string }> = {
    NONE: { label: "未创建", className: "bg-gray-100 text-gray-600" },
    CREATED: { label: "已创建", className: "bg-blue-100 text-blue-700" },
    PUSHED: { label: "已推送", className: "bg-amber-100 text-amber-700" },
    CONFIRMED: { label: "已确认", className: "bg-green-100 text-green-700" },
    CLOSED: { label: "已关闭", className: "bg-teal-100 text-teal-700" },
    FAILED: { label: "失败", className: "bg-red-100 text-red-700" },
    CANCELLED: { label: "已取消", className: "bg-gray-200 text-gray-600" },
  }

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
                      执行单据创建: {currentExecutionDocCreation.label}
                    </Badge>
                    {hasVia && (
                      <Badge variant="outline" className="text-[10px] border-purple-200 bg-purple-50 text-purple-700">
                        经成品仓
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building className="h-3 w-3" />
                    <span>{order.sourceName}</span>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>创建: {new Date(order.createdAt).toLocaleDateString()}</span>
                    {order.sourceDocumentNo && (
                      <>
                        <span>·</span>
                        <span>相关单据: {order.sourceDocumentNo}</span>
                        {order.referenceNo && (
                          <>
                            <span>·</span>
                            <span>Ref: {order.referenceNo}</span>
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
                  <TooltipContent><p>刷新数据</p></TooltipContent>
                </Tooltip>
                {canCreateExecutionDocs && (
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />创建执行单据
                  </Button>
                )}
                {canRetryExecutionDocs && (
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />重试创建
                  </Button>
                )}
                {canCancelExecutionDocs && (
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Ban className="h-4 w-4 mr-2" />取消创建
                  </Button>
                )}
              </div>
            </div>
          </div>

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
                  <Package className="h-4 w-4 text-blue-600" />调拨信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">调拨单号:</span><span className="font-mono font-medium">{order.transferNo}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">调拨类型:</span><span>{typeConfig[order.transferType]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">相关单据号:</span><span className="font-mono">{order.sourceDocumentNo || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ref 单号:</span><span className="font-mono">{order.referenceNo || "-"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">创建时间:</span><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">路径模式:</span><Badge variant="outline" className="text-[10px]">{hasVia ? "经成品仓" : "直发"}</Badge></div>
              </CardContent>
            </Card>

            {/* 源仓库 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building className="h-4 w-4 text-orange-600" />源仓库
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-orange-50 p-2 rounded-lg border border-orange-200 dark:bg-orange-900/20 dark:border-orange-700">
                  <div className="font-bold text-sm">{order.fromWarehouseName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{order.fromWarehouseCode}</div>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">供应商:</span><span className="font-medium">{order.sourceName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">供应商编码:</span><span className="font-mono">{order.sourceCode}</span></div>
              </CardContent>
            </Card>

            {/* 目标仓库 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />目标仓库
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-700">
                  <div className="font-bold text-sm">{order.toWarehouseName}</div>
                  <div className="text-xs text-muted-foreground mt-1">{order.toWarehouseCode}</div>
                </div>
                {hasVia && (
                  <div>
                    <div className="text-muted-foreground mb-1">中转（成品仓）</div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                      <div className="font-medium text-sm">{order.viaWarehouseName}</div>
                      <div className="text-xs text-muted-foreground mt-1">{order.viaWarehouseCode}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 进度摘要 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-purple-600" />调拨进度
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded border border-blue-200 dark:bg-blue-900/20">
                    <div className="text-muted-foreground">计划数量</div>
                    <div className="font-bold text-lg text-blue-600">{totalPlanned}</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200 dark:bg-green-900/20">
                    <div className="text-muted-foreground">已调拨</div>
                    <div className="font-bold text-lg text-green-600">{totalTransferred}</div>
                  </div>
                </div>
                <div className="flex justify-between"><span className="text-muted-foreground">完成率:</span><span className="font-medium">{totalPlanned > 0 ? Math.round(totalTransferred / totalPlanned * 100) : 0}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">已发货:</span><span className="font-medium">{order.shippedQty} PCS</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">已收货:</span><span className="font-medium">{order.receivedQty} PCS</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">商品行:</span><span className="font-medium">{order.lines.length} 行</span></div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileInput className="h-4 w-4 text-green-600" />最终入库单处理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">处理方式</div>
                  <div className="mt-1"><Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{order.finalInboundAction === "UPDATE" ? "更新已有最终入库单" : "新建最终入库单"}</Badge></div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">最终入库单号</div>
                  <div className="mt-1 font-mono text-xs">{order.finalInboundNo || "-"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">预计入库数量</div>
                  <div className="mt-1 font-medium">{order.finalInboundExpectedQty} PCS</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">待入库数量</div>
                  <div className="mt-1 font-medium">{order.pendingInboundQty} PCS</div>
                </div>
              </div>
              <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                最终入库单按 PO + 目标仓 + SKU 复用；多次出库时按累计已发货数量更新，预计入库数量不超过调拨总数量。
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FilePlus className="h-4 w-4 text-blue-600" />执行单据创建状态
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">当前状态</div>
                  <div className="mt-1"><Badge variant="outline" className={cn("text-[10px]", currentExecutionDocCreation.className)}>{currentExecutionDocCreation.label}</Badge></div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">创建进度</div>
                  <div className="mt-1 font-medium">{order.executionDocCreatedCount ?? 0}/{order.executionDocTargetCount ?? 0}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">最近创建时间</div>
                  <div className="mt-1 text-xs">{order.executionDocLastUpdatedAt ? new Date(order.executionDocLastUpdatedAt).toLocaleString() : "-"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">重试次数</div>
                  <div className="mt-1 font-medium">{order.executionDocRetryCount ?? 0}</div>
                </div>
              </div>
              {order.executionDocCreationError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300">
                  <div className="font-medium">失败原因</div>
                  <div className="mt-1">{order.executionDocCreationError}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Tabs (same pattern as PO detail) ─────────────────────────── */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lines">商品明细</TabsTrigger>
              <TabsTrigger value="documents">
                关联单据
                <Badge variant="secondary" className="ml-2">{order.relatedDocuments.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="push">推送/同步</TabsTrigger>
            </TabsList>

            {/* 商品明细 Tab */}
            <TabsContent value="lines" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">调拨商品</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {totalTransferred}/{totalPlanned} PCS ({totalPlanned > 0 ? Math.round(totalTransferred / totalPlanned * 100) : 0}%)
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-sm font-medium p-3">行号</TableHead>
                        <TableHead className="text-sm font-medium p-3">SKU</TableHead>
                        <TableHead className="text-sm font-medium p-3">商品名称</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-right">计划数量</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-right">已调拨</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-right">剩余</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-center">单位</TableHead>
                        <TableHead className="text-sm font-medium p-3 text-center">状态</TableHead>
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
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />完成</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">待转</Badge>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">关联单据</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.relatedDocuments.map((doc) => {
                    const meta = docStatusMeta[doc.status] || { label: doc.status, className: "" }
                    const isInbound = doc.docType === "INBOUND"
                    return (
                      <div key={doc.docNo} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isInbound ? "bg-blue-50" : "bg-purple-50")}>
                            {isInbound ? <FileInput className="h-5 w-5 text-blue-600" /> : <FileOutput className="h-5 w-5 text-purple-600" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-medium">{doc.docNo}</span>
                              <Badge className={cn("text-[10px]", meta.className)}>{meta.label}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {isInbound ? "入库" : "出库"} · {doc.warehouseName}
                              {doc.expectedQty !== undefined && <span> · {doc.expectedQty} PCS</span>}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 推送/同步 Tab */}
            <TabsContent value="push" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">推送 / 同步详情</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">推送状态</div>
                      <div className="mt-1"><Badge variant="outline" className={cn("text-[10px]", currentExecutionDocCreation.className)}>{currentExecutionDocCreation.label}</Badge></div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Message ID</div>
                      <div className="mt-1 font-mono text-xs break-all">{order.pushMessageId}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">最后推送</div>
                      <div className="mt-1 text-xs">{order.lastPushedAt ? new Date(order.lastPushedAt).toLocaleString() : "-"}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">重试次数</div>
                      <div className="mt-1 font-medium">{order.retryCount}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canRetryExecutionDocs && <Button size="sm"><Send className="h-4 w-4 mr-2" />重试创建</Button>}
                    {canCancelExecutionDocs && <Button variant="outline" size="sm" className="text-red-600"><Ban className="h-4 w-4 mr-2" />取消创建</Button>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}
