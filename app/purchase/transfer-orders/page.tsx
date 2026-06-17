"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Eye, MoreVertical } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { CreateTransferOrderDialog } from "@/components/purchase/create-transfer-order-dialog"
import { OrderNumberCell } from "@/components/ui/order-number-cell"
import { cn } from "@/lib/utils"
import {
  type ExecutionDocumentCreationStatus,
  type TransferOrderStatus,
  type TransferOrderType,
  TRANSFER_ORDER_TYPE_OPTIONS,
  WAREHOUSE_OPTIONS,
} from "@/components/purchase/transfer-order-types"

// ─── Types ──────────────────────────────────────────────────────────────────

interface TransferOrderRow {
  id: string
  transferNo: string
  transferType: TransferOrderType
  status: TransferOrderStatus
  executionDocCreationStatus: ExecutionDocumentCreationStatus
  executionDocCreationError?: string
  fromWarehouseName: string
  fromWarehouseCode: string
  viaWarehouseName?: string
  toWarehouseName: string
  toWarehouseCode: string
  sourceDocumentNo?: string
  referenceNo?: string
  totalQty: number
  transferredQty: number
  shippedQty: number
  receivedQty: number
  outboundNos: string[]
  inboundNos: string[]
  finalInboundNo?: string
  finalInboundAction?: "CREATE" | "UPDATE" | "NONE"
  carrier?: string
  logisticsNo?: string
  expectedShipDate?: string
  expectedArrivalDate?: string
  createdAt: string
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockData: TransferOrderRow[] = [
  { id: "to-1", transferNo: "TO202401150001", transferType: "PURCHASE_INBOUND", status: "CREATED", executionDocCreationStatus: "FAILED", executionDocCreationError: "Target inbound document creation failed", fromWarehouseName: "Shenzhen Smart Factory Warehouse", fromWarehouseCode: "FAC-WH-SZ01", viaWarehouseName: "Shenzhen Vendor FG Warehouse", toWarehouseName: "Main Warehouse - Los Angeles", toWarehouseCode: "WH001", sourceDocumentNo: "PO202403150001", referenceNo: "REF-PO-001", totalQty: 110, transferredQty: 0, shippedQty: 0, receivedQty: 0, outboundNos: ["OB-FAC-SZ01-A1"], inboundNos: ["VRN-SZ01-A1"], finalInboundAction: "NONE", carrier: "DHL", logisticsNo: "DHL-784512369", expectedShipDate: "2024-01-20", expectedArrivalDate: "2024-02-05", createdAt: "2024-01-15T10:30:00Z" },
  { id: "to-2", transferNo: "TO202401160001", transferType: "PURCHASE_INBOUND", status: "PROCESSING", executionDocCreationStatus: "SUCCESS", fromWarehouseName: "Dongguan Factory Warehouse", fromWarehouseCode: "FAC-WH-DG01", toWarehouseName: "Main Warehouse - Los Angeles", toWarehouseCode: "WH001", sourceDocumentNo: "PO202403150001", referenceNo: "REF-PO-002", totalQty: 40, transferredQty: 0, shippedQty: 0, receivedQty: 0, outboundNos: [], inboundNos: [], finalInboundAction: "CREATE", carrier: "FedEx", logisticsNo: "FX-20240116001", expectedArrivalDate: "2024-01-28", createdAt: "2024-01-16T08:00:00Z" },
  { id: "to-3", transferNo: "TO202401180001", transferType: "SALES_OUTBOUND", status: "IN_TRANSIT", executionDocCreationStatus: "SUCCESS", fromWarehouseName: "Main Warehouse - Los Angeles", fromWarehouseCode: "WH001", toWarehouseName: "East Coast Warehouse - New York", toWarehouseCode: "WH002", sourceDocumentNo: "SO202403150001", referenceNo: "REF-SO-001", totalQty: 200, transferredQty: 200, shippedQty: 120, receivedQty: 0, outboundNos: ["OB-WH001-A1", "OB-WH001-A2", "OB-WH001-A3"], inboundNos: [], finalInboundAction: "NONE", carrier: "UPS", logisticsNo: "1Z-UPS-5568", createdAt: "2024-01-18T14:00:00Z" },
  { id: "to-4", transferNo: "TO202401200001", transferType: "WAREHOUSE_TRANSFER", status: "DRAFT", executionDocCreationStatus: "PENDING", fromWarehouseName: "Main Warehouse - Los Angeles", fromWarehouseCode: "WH001", toWarehouseName: "East Coast Warehouse - New York", toWarehouseCode: "WH002", sourceDocumentNo: "WT202403150001", referenceNo: "REF-WT-001", totalQty: 50, transferredQty: 0, shippedQty: 0, receivedQty: 0, outboundNos: [], inboundNos: [], finalInboundAction: "NONE", createdAt: "2024-01-20T09:15:00Z" },
  { id: "to-5", transferNo: "TO202401220001", transferType: "RETURN_TRANSFER", status: "CREATED", executionDocCreationStatus: "PARTIAL_SUCCESS", fromWarehouseName: "East Coast Warehouse - New York", fromWarehouseCode: "WH002", toWarehouseName: "Main Warehouse - Los Angeles", toWarehouseCode: "WH001", sourceDocumentNo: "RT202403150001", referenceNo: "REF-RT-001", totalQty: 15, transferredQty: 0, shippedQty: 0, receivedQty: 0, outboundNos: ["OB-RT-A1"], inboundNos: [], finalInboundAction: "NONE", carrier: "Maersk", logisticsNo: "BOL-MSK-88201", createdAt: "2024-01-22T11:30:00Z" },
  { id: "to-6", transferNo: "TO202401230001", transferType: "REPLENISHMENT", status: "INBOUND_AT_SOURCE", executionDocCreationStatus: "CREATING", fromWarehouseName: "Main Warehouse - Los Angeles", fromWarehouseCode: "WH001", viaWarehouseName: "Shenzhen Vendor FG Warehouse", toWarehouseName: "East Coast Warehouse - New York", toWarehouseCode: "WH002", sourceDocumentNo: "RP202403150001", referenceNo: "REF-RP-001", totalQty: 80, transferredQty: 20, shippedQty: 20, receivedQty: 0, outboundNos: ["OB-RP-A1"], inboundNos: ["IB-RP-A1"], finalInboundAction: "NONE", carrier: "COSCO", logisticsNo: "COSCO-BL-7135", createdAt: "2024-01-23T09:15:00Z" },
  { id: "to-7", transferNo: "TO202401240001", transferType: "CROSS_DOCK", status: "RECEIVED", executionDocCreationStatus: "SUCCESS", fromWarehouseName: "Shenzhen Vendor FG Warehouse", fromWarehouseCode: "VFG-SZ01", toWarehouseName: "Main Warehouse - Los Angeles", toWarehouseCode: "WH001", sourceDocumentNo: "CD202403150001", referenceNo: "REF-CD-001", totalQty: 30, transferredQty: 30, shippedQty: 30, receivedQty: 30, outboundNos: ["OB-CD-A1"], inboundNos: ["IB-CD-A1", "RN-PO202403150001"], finalInboundAction: "UPDATE", finalInboundNo: "RN-PO202403150001", carrier: "CMA CGM", logisticsNo: "CMA-BL-44021", createdAt: "2024-01-24T09:15:00Z" },
  { id: "to-8", transferNo: "TO202401250001", transferType: "MANUAL", status: "CLOSED", executionDocCreationStatus: "SUCCESS", fromWarehouseName: "East Coast Warehouse - New York", fromWarehouseCode: "WH002", toWarehouseName: "Main Warehouse - Los Angeles", toWarehouseCode: "WH001", sourceDocumentNo: "MANUAL202403150001", referenceNo: "REF-MANUAL-001", totalQty: 12, transferredQty: 12, shippedQty: 12, receivedQty: 12, outboundNos: ["OB-MANUAL-A1"], inboundNos: ["IB-MANUAL-A1"], finalInboundAction: "NONE", carrier: "USPS", logisticsNo: "9400-1234-5678", createdAt: "2024-01-25T09:15:00Z" },
  { id: "to-9", transferNo: "TO202401260001", transferType: "PURCHASE_INBOUND", status: "VOIDED", executionDocCreationStatus: "CANCELLED", fromWarehouseName: "Dongguan Factory Warehouse", fromWarehouseCode: "FAC-WH-DG01", toWarehouseName: "Main Warehouse - Los Angeles", toWarehouseCode: "WH001", sourceDocumentNo: "PO202403260001", referenceNo: "REF-VOID-001", totalQty: 25, transferredQty: 0, shippedQty: 0, receivedQty: 0, outboundNos: [], inboundNos: [], finalInboundAction: "NONE", createdAt: "2024-01-26T09:15:00Z" },
  { id: "to-10", transferNo: "TO202401270001", transferType: "SALES_OUTBOUND", status: "CANCELLED", executionDocCreationStatus: "CANCELLED", fromWarehouseName: "Main Warehouse - Los Angeles", fromWarehouseCode: "WH001", toWarehouseName: "East Coast Warehouse - New York", toWarehouseCode: "WH002", sourceDocumentNo: "SO202403270001", referenceNo: "REF-CANCEL-001", totalQty: 45, transferredQty: 0, shippedQty: 0, receivedQty: 0, outboundNos: [], inboundNos: [], finalInboundAction: "NONE", createdAt: "2024-01-27T09:15:00Z" },
]

// ─── Status / Type Configs ──────────────────────────────────────────────────

const statusOptions = [
  { id: "draft", label: "草稿", value: "DRAFT" },
  { id: "created", label: "已创建", value: "CREATED" },
  { id: "processing", label: "执行中", value: "PROCESSING" },
  { id: "inbound_source", label: "源仓入库", value: "INBOUND_AT_SOURCE" },
  { id: "in_transit", label: "在途", value: "IN_TRANSIT" },
  { id: "received", label: "已收货", value: "RECEIVED" },
  { id: "closed", label: "已关闭", value: "CLOSED" },
  { id: "voided", label: "已作废", value: "VOIDED" },
  { id: "cancelled", label: "已取消", value: "CANCELLED" },
]

const statusBadge: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "草稿", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  CREATED: { label: "已创建", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  PROCESSING: { label: "执行中", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
  INBOUND_AT_SOURCE: { label: "源仓入库", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400" },
  IN_TRANSIT: { label: "在途", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
  RECEIVED: { label: "已收货", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  CLOSED: { label: "已关闭", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
  VOIDED: { label: "已作废", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  CANCELLED: { label: "已取消", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
}

const executionDocCreationBadge: Record<ExecutionDocumentCreationStatus, { label: string; className: string }> = {
  PENDING: { label: "待创建", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  CREATING: { label: "创建中", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  FAILED: { label: "创建失败", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  PARTIAL_SUCCESS: { label: "部分成功", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  SUCCESS: { label: "全部成功", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  CANCELLED: { label: "已取消", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
}

const typeBadge: Record<string, { label: string; className: string }> = {
  PURCHASE_INBOUND: { label: "采购入库", className: "border-blue-200 bg-blue-50 text-blue-700" },
  SALES_OUTBOUND: { label: "销售出库", className: "border-amber-200 bg-amber-50 text-amber-700" },
  WAREHOUSE_TRANSFER: { label: "仓间调拨", className: "border-green-200 bg-green-50 text-green-700" },
  RETURN_TRANSFER: { label: "退货调拨", className: "border-orange-200 bg-orange-50 text-orange-700" },
  REPLENISHMENT: { label: "补货调拨", className: "border-purple-200 bg-purple-50 text-purple-700" },
  CROSS_DOCK: { label: "越库调拨", className: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  MANUAL: { label: "手动", className: "border-gray-200 bg-gray-50 text-gray-700" },
}

const formatDocumentNos = (documentNos: string[]) => {
  if (documentNos.length === 0) return "-"
  if (documentNos.length === 1) return documentNos[0]
  return `${documentNos[0]} +${documentNos.length - 1}`
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function TransferOrdersPage() {
  const { t } = useI18n()
  const router = useRouter()
  const sidebarItems = createPurchaseSidebarItems(t)

  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [activeTab, setActiveTab] = React.useState("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [showChangeWarehouseDialog, setShowChangeWarehouseDialog] = React.useState(false)
  const [changeWarehouseDirection, setChangeWarehouseDirection] = React.useState<"from" | "to">("to")

  const tf = (en: string, zh: string) => zh

  // ─── Filters ───────────────────────────────────────────────────────────────
  const filterConfigs: FilterConfig[] = [
    { id: "transferNo", label: "调拨单号", type: "batch", placeholder: "TO202401150001\nTO202401160001" },
    { id: "sourceDocumentNo", label: "相关单据号", type: "batch", placeholder: "PO202403150001\nSO202403150001" },
    { id: "referenceNo", label: "Ref 单号", type: "batch", placeholder: "REF-TO-001\nREF-SO-001" },
    { id: "status", label: "状态", type: "multiple", options: statusOptions },
    { id: "transferType", label: "调拨类型", type: "multiple", options: TRANSFER_ORDER_TYPE_OPTIONS.map((o) => ({ id: o.value, label: o.label, value: o.value })) },
    { id: "fromWarehouse", label: "源仓库", type: "multiple", options: [
      { id: "fac-sz", label: "Shenzhen Smart Factory", value: "Shenzhen Smart Factory Warehouse" },
      { id: "fac-dg", label: "Dongguan Factory", value: "Dongguan Factory Warehouse" },
      { id: "wh001", label: "Main Warehouse - LA", value: "Main Warehouse - Los Angeles" },
      { id: "wh002", label: "East Coast - NY", value: "East Coast Warehouse - New York" },
    ]},
    { id: "toWarehouse", label: "目标仓库", type: "multiple", options: [
      { id: "wh001", label: "Main Warehouse - LA", value: "Main Warehouse - Los Angeles" },
      { id: "wh002", label: "East Coast - NY", value: "East Coast Warehouse - New York" },
    ]},
  ]

  // ─── Data filtering ────────────────────────────────────────────────────────
  const filteredData = React.useMemo(() => {
    let data = mockData
    // Tab filter
    if (activeTab === "in_transit") data = data.filter((d) => d.status === "IN_TRANSIT")
    else if (activeTab === "draft") data = data.filter((d) => d.status === "DRAFT")
    else if (activeTab === "completed") data = data.filter((d) => d.status === "RECEIVED" || d.status === "CLOSED")
    else if (activeTab === "exception") data = data.filter((d) => ["FAILED", "PARTIAL_SUCCESS"].includes(d.executionDocCreationStatus) || d.shippedQty > d.totalQty || d.receivedQty > d.shippedQty)

    // Search
    if (searchValue) {
      const q = searchValue.toLowerCase()
      data = data.filter((d) => d.transferNo.toLowerCase().includes(q) || d.fromWarehouseName.toLowerCase().includes(q) || d.toWarehouseName.toLowerCase().includes(q) || (d.sourceDocumentNo || "").toLowerCase().includes(q) || (d.referenceNo || "").toLowerCase().includes(q))
    }
    // Active filters
    activeFilters.forEach((f) => {
      if (f.id === "status") data = data.filter((d) => f.values.includes(d.status))
      if (f.id === "transferType") data = data.filter((d) => f.values.includes(d.transferType))
      if (f.id === "fromWarehouse") data = data.filter((d) => f.values.includes(d.fromWarehouseName))
      if (f.id === "toWarehouse") data = data.filter((d) => f.values.includes(d.toWarehouseName))
      if (f.id === "transferNo") data = data.filter((d) => f.values.some((v) => d.transferNo.includes(v)))
      if (f.id === "sourceDocumentNo") data = data.filter((d) => f.values.some((v) => (d.sourceDocumentNo || "").includes(v)))
      if (f.id === "referenceNo") data = data.filter((d) => f.values.some((v) => (d.referenceNo || "").includes(v)))
    })
    return data
  }, [searchValue, activeFilters, activeTab])

  const getRowActions = (row: TransferOrderRow) => {
    const actions = [{ label: "查看详情", onClick: () => router.push(`/purchase/transfer-orders/${row.id}`) }]

    if (row.status === "DRAFT") {
      actions.push({ label: "编辑草稿", onClick: () => console.log("Edit draft", row.id) })
      actions.push({ label: "提交创建", onClick: () => console.log("Submit transfer order", row.id) })
      actions.push({ label: "删除草稿", onClick: () => console.log("Delete draft", row.id) })
      return actions
    }

    if (row.status === "CREATED") {
      if (row.executionDocCreationStatus === "PENDING") {
        actions.push({ label: "创建执行单据", onClick: () => console.log("Create execution docs", row.id) })
      }
      if (["FAILED", "PARTIAL_SUCCESS"].includes(row.executionDocCreationStatus)) {
        actions.push({ label: "重试创建", onClick: () => console.log("Retry execution docs", row.id) })
      }
      if (["PENDING", "CREATING", "FAILED", "PARTIAL_SUCCESS"].includes(row.executionDocCreationStatus)) {
        actions.push({ label: "取消创建", onClick: () => console.log("Cancel execution docs", row.id) })
      }
      actions.push({ label: "作废调拨单", onClick: () => console.log("Void transfer order", row.id) })
      return actions
    }

    if (row.status === "PROCESSING") {
      actions.push({ label: "查看执行单据", onClick: () => console.log("View execution docs", row.id) })
      actions.push({ label: "跟踪执行进度", onClick: () => console.log("Track execution", row.id) })
      return actions
    }

    if (row.status === "INBOUND_AT_SOURCE") {
      actions.push({ label: "查看入库节点", onClick: () => console.log("View inbound node", row.id) })
      actions.push({ label: "查看执行单据", onClick: () => console.log("View execution docs", row.id) })
      return actions
    }

    if (row.status === "IN_TRANSIT") {
      actions.push({ label: "查看物流", onClick: () => console.log("View logistics", row.id) })
      actions.push({ label: "查看收货进度", onClick: () => console.log("View receipt progress", row.id) })
      return actions
    }

    if (row.status === "RECEIVED") {
      actions.push({ label: "核对收货", onClick: () => console.log("Review receipt", row.id) })
      actions.push({ label: "关闭单据", onClick: () => console.log("Close transfer order", row.id) })
      return actions
    }

    if (row.status === "CLOSED") {
      actions.push({ label: "导出", onClick: () => console.log("Export transfer order", row.id) })
      return actions
    }

    if (["VOIDED", "CANCELLED"].includes(row.status)) {
      actions.push({ label: "审计追溯", onClick: () => console.log("Audit transfer order", row.id) })
    }

    return actions
  }

  // ─── Columns ───────────────────────────────────────────────────────────────
  const columns: Column<TransferOrderRow>[] = [
    {
      id: "transferNo",
      header: "调拨单号",
      accessorKey: "transferNo",
      width: "160px",
      defaultVisible: true,
      cell: (row) => <OrderNumberCell orderNumber={row.transferNo} onClick={() => router.push(`/purchase/transfer-orders/${row.id}`)} />,
    },
    {
      id: "status",
      header: "状态",
      width: "100px",
      defaultVisible: true,
      cell: (row) => {
        const meta = statusBadge[row.status] || { label: row.status, className: "" }
        return <Badge className={meta.className}>{meta.label}</Badge>
      },
    },
    {
      id: "executionDocCreationStatus",
      header: "执行单据创建状态",
      width: "140px",
      defaultVisible: true,
      cell: (row) => {
        const meta = executionDocCreationBadge[row.executionDocCreationStatus]
        return <Badge className={meta.className}>{meta.label}</Badge>
      },
    },
    {
      id: "transferType",
      header: "调拨类型",
      width: "120px",
      defaultVisible: true,
      cell: (row) => {
        const meta = typeBadge[row.transferType] || { label: row.transferType, className: "" }
        return <Badge variant="outline" className={cn("text-[10px]", meta.className)}>{meta.label}</Badge>
      },
    },
    {
      id: "fromWarehouse",
      header: "调出仓",
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-xs">
          <div className="truncate font-medium">{row.fromWarehouseName}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{row.fromWarehouseCode}</div>
        </div>
      ),
    },
    {
      id: "toWarehouse",
      header: "调入仓",
      width: "160px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-xs">
          <div className="truncate font-medium text-green-700">{row.toWarehouseName}</div>
          <div className="font-mono text-[10px] text-muted-foreground">{row.toWarehouseCode}</div>
        </div>
      ),
    },
    {
      id: "quantity",
      header: "数量进度",
      width: "120px",
      defaultVisible: true,
      cell: (row) => {
        const pct = row.totalQty > 0 ? Math.round((row.transferredQty / row.totalQty) * 100) : 0
        return (
          <div className="text-right">
            <div className="text-xs font-medium">调拨 {row.transferredQty}/{row.totalQty}</div>
            <div className="text-[10px] text-muted-foreground">发货 {row.shippedQty} · 收货 {row.receivedQty}</div>
            <div className="text-[10px] text-muted-foreground">{pct}%</div>
          </div>
        )
      },
    },
    {
      id: "outboundNos",
      header: "出库单号",
      width: "140px",
      defaultVisible: true,
      cell: (row) => {
        const outboundDisplay = formatDocumentNos(row.outboundNos)
        return outboundDisplay === "-"
          ? <span className="font-mono text-xs text-muted-foreground">-</span>
          : <OrderNumberCell orderNumber={outboundDisplay} className="text-xs font-mono text-muted-foreground" />
      },
    },
    {
      id: "inboundNos",
      header: "入库单号",
      width: "150px",
      defaultVisible: true,
      cell: (row) => {
        const inboundDisplay = formatDocumentNos(row.inboundNos)
        return inboundDisplay === "-"
          ? <span className="font-mono text-xs text-muted-foreground">-</span>
          : <OrderNumberCell orderNumber={inboundDisplay} className="text-xs font-mono text-muted-foreground" />
      },
    },
    {
      id: "sourceDocumentNo",
      header: "相关单据号",
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.sourceDocumentNo ? <OrderNumberCell orderNumber={row.sourceDocumentNo} className="text-xs font-mono" /> : <span className="text-muted-foreground text-xs">-</span>,
    },
    {
      id: "referenceNo",
      header: "Ref 单号",
      width: "130px",
      defaultVisible: true,
      cell: (row) => row.referenceNo ? <OrderNumberCell orderNumber={row.referenceNo} className="text-xs font-mono" /> : <span className="text-muted-foreground text-xs">-</span>,
    },
    {
      id: "logistics",
      header: "物流信息",
      width: "180px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="truncate font-medium">{row.carrier || "-"}</div>
          {row.logisticsNo
            ? <OrderNumberCell orderNumber={row.logisticsNo} className="text-[10px] font-mono text-muted-foreground" />
            : <div className="font-mono text-[10px] text-muted-foreground">-</div>}
        </div>
      ),
    },
    {
      id: "expectedArrivalDate",
      header: "预计到达",
      width: "100px",
      defaultVisible: true,
      cell: (row) => <span className="text-xs">{row.expectedArrivalDate || "-"}</span>,
    },
    {
      id: "createdAt",
      header: "创建时间",
      width: "100px",
      defaultVisible: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      id: "actions",
      header: "",
      width: "50px",
      defaultVisible: true,
      cell: (row) => {
        const actions = getRowActions(row)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action, index) => (
                <DropdownMenuItem key={`${row.id}-${action.label}`} onClick={action.onClick} className={index > 0 && action.label.includes("作废") ? "text-red-600" : undefined}>
                  {index === 0 && <Eye className="h-4 w-4 mr-2" />}
                  {index !== 0 && <span className="mr-6" />}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">调拨单</h1>
            <p className="text-sm text-muted-foreground mt-2">管理所有类型的仓间调拨单据</p>
          </div>
          <Button size="sm" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />创建调拨单
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1) }}>
          <TabsList>
            <TabsTrigger value="all">全部 <Badge variant="secondary" className="ml-2">{mockData.length}</Badge></TabsTrigger>
            <TabsTrigger value="draft">草稿 <Badge variant="secondary" className="ml-2">{mockData.filter((d) => d.status === "DRAFT").length}</Badge></TabsTrigger>
            <TabsTrigger value="in_transit">在途 <Badge variant="secondary" className="ml-2">{mockData.filter((d) => d.status === "IN_TRANSIT").length}</Badge></TabsTrigger>
            <TabsTrigger value="completed">已完成 <Badge variant="secondary" className="ml-2">{mockData.filter((d) => d.status === "RECEIVED" || d.status === "CLOSED").length}</Badge></TabsTrigger>
            <TabsTrigger value="exception">异常 <Badge variant="secondary" className="ml-2">{mockData.filter((d) => ["FAILED", "PARTIAL_SUCCESS"].includes(d.executionDocCreationStatus) || d.shippedQty > d.totalQty || d.receivedQty > d.shippedQty).length}</Badge></TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder="搜索调拨单号、仓库、相关单据号、Ref 单号..."
          onSearchChange={setSearchValue}
          filters={filterConfigs}
          onFiltersChange={setActiveFilters}
        />

        {/* Batch Action Bar */}
        {selectedRows.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    已选 <span className="text-primary">{selectedRows.length}</span> 项
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedRows([])}>
                    取消选择
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setChangeWarehouseDirection("from"); setShowChangeWarehouseDialog(true) }}
                  >
                    更换调出仓
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setChangeWarehouseDirection("to"); setShowChangeWarehouseDialog(true) }}
                  >
                    更换调入仓
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm"><MoreVertical className="h-4 w-4 mr-1" />更多</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => console.log("Batch export", selectedRows)}>批量导出</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log("Batch cancel", selectedRows)} className="text-red-600">批量取消</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={filteredData}
              columns={columns}
              currentPage={currentPage}
              totalItems={filteredData.length}
              pageSize={10}
              onPageChange={setCurrentPage}
              onRowClick={(row) => router.push(`/purchase/transfer-orders/${row.id}`)}
              selectedRows={selectedRows}
              onSelectionChange={setSelectedRows}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Transfer Order Dialog */}
      <CreateTransferOrderDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        tf={tf}
        onSubmit={(drafts) => {
          console.log("Created transfer orders:", drafts)
          setShowCreateDialog(false)
        }}
      />

      {/* Change Warehouse Dialog */}
      <ChangeWarehouseDialog
        open={showChangeWarehouseDialog}
        onOpenChange={setShowChangeWarehouseDialog}
        direction={changeWarehouseDirection}
        selectedCount={selectedRows.length}
        onConfirm={(warehouseCode) => {
          console.log(`Change ${changeWarehouseDirection} warehouse to ${warehouseCode} for`, selectedRows)
          setShowChangeWarehouseDialog(false)
          setSelectedRows([])
        }}
      />
    </MainLayout>
  )
}


// ─── Change Warehouse Dialog ────────────────────────────────────────────────

function ChangeWarehouseDialog({
  open, onOpenChange, direction, selectedCount, onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  direction: "from" | "to"
  selectedCount: number
  onConfirm: (warehouseCode: string) => void
}) {
  const [selectedWarehouse, setSelectedWarehouse] = React.useState("")

  React.useEffect(() => {
    if (open) setSelectedWarehouse("")
  }, [open])

  const title = direction === "from" ? "更换调出仓（发货仓）" : "更换调入仓（目标仓）"
  const description = `将选中的 ${selectedCount} 张调拨单的${direction === "from" ? "调出仓" : "调入仓"}更换为：`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm">{direction === "from" ? "新调出仓" : "新调入仓"}</Label>
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger>
                <SelectValue placeholder="选择仓库" />
              </SelectTrigger>
              <SelectContent>
                {WAREHOUSE_OPTIONS.map((wh) => (
                  <SelectItem key={wh.code} value={wh.code}>
                    <div className="flex items-center gap-2">
                      <span>{wh.name}</span>
                      <Badge variant="outline" className="text-[10px]">{wh.type}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
            将影响 <span className="font-medium text-foreground">{selectedCount}</span> 张调拨单。仅草稿和已创建状态的单据可以更换仓库。
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={() => onConfirm(selectedWarehouse)} disabled={!selectedWarehouse}>确认更换</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
