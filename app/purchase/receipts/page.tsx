"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter, ColumnConfig } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { 
  Plus, Download, Upload, FileDown, FilePlus, 
  ExternalLink, Package, Truck, XCircle, Edit, Eye, CheckCircle
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Receipt数据接口
interface Receipt {
  id: string
  receiptNo: string // 入库请求单号
  actualReceiptNo?: string // 收货单号（实际收货后生成）
  inboundReceiptNo?: string // 入库单号
  receiptType: "REGULAR" | "TRANSLOAD" | "RETURN_FROM_END_USER" | "INVENTORY_RECEIPT" | "CUSTOMER_TRANSFER" // 单据类型
  source: "MANUAL" | "EDI" | "SYSTEM_AUTO" // 来源：手动创建、EDI、系统自动创建
  title?: string // 货主
  relatedNo?: string // 关联单号
  autoReceiving?: "YES" | "NO" // 自动收货
  supplier?: string // 供应商名称
  poNo: string // PO单号（可能多个，用逗号分隔）
  poIds?: string[] // PO IDs
  shipmentNo?: string
  shipmentId?: string
  transportMode?: "FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL" // 运输方式
  carrier?: string // 承运商
  trackingNumber?: string // 追踪号
  appointmentTime?: string // 预约时间
  inYardTime?: string // 进场时间
  warehouse: string
  warehouseId: string
  status: "NEW" | "PENDING" | "IN_RECEIVING" | "PARTIALLY_RECEIVED" | "COMPLETED" | "EXCEPTION" | "CANCELLED"
  receivedBy?: string
  receivedDate?: string
  expectedQty: number
  receivedQty: number
  totalLines: number
  completedLines: number
  damageQty?: number
  rejectedQty?: number
  warehouseLocation?: string
  notes?: string
  created: string
  updated: string
}

// Mock数据
const mockReceipts: Receipt[] = [
  {
    id: "1",
    receiptNo: "RCP-2024-001",
    actualReceiptNo: "RN-2024-001",
    inboundReceiptNo: "IN-2024-001",
    receiptType: "REGULAR",
    source: "MANUAL",
    shipmentNo: "SHIP-2024-001",
    shipmentId: "1",
    poNo: "PO-2024-001",
    poId: "PO-001",
    warehouse: "Main Warehouse - Los Angeles",
    warehouseId: "WH001",
    status: "IN_RECEIVING",
    receivedBy: "John Smith",
    receivedDate: "2024-01-20T10:30:00Z",
    expectedQty: 150,
    receivedQty: 80,
    totalLines: 5,
    completedLines: 2,
    damageQty: 0,
    rejectedQty: 0,
    warehouseLocation: "A区-01-001",
    created: "2024-01-20T09:00:00Z",
    updated: "2024-01-20T10:30:00Z",
  },
  {
    id: "2",
    receiptNo: "RCP-2024-002",
    actualReceiptNo: "RN-2024-002",
    inboundReceiptNo: "IN-2024-002",
    receiptType: "TRANSLOAD",
    source: "EDI",
    title: "XYZ Corporation",
    relatedNo: "REF-2024-002",
    autoReceiving: "NO",
    supplier: "XYZ Suppliers Ltd.",
    shipmentNo: "SHIP-2024-002",
    shipmentId: "2",
    poNo: "PO-2024-002",
    poIds: ["PO-002"],
    transportMode: "AIR_CARGO",
    carrier: "DHL",
    trackingNumber: "9876543210",
    appointmentTime: "2024-01-18T10:00:00Z",
    inYardTime: "2024-01-18T10:15:00Z",
    warehouse: "New York Warehouse",
    warehouseId: "WH002",
    status: "COMPLETED",
    receivedBy: "Jane Doe",
    receivedDate: "2024-01-18T14:15:00Z",
    expectedQty: 200,
    receivedQty: 200,
    totalLines: 8,
    completedLines: 8,
    damageQty: 0,
    rejectedQty: 0,
    warehouseLocation: "B区-02-001",
    created: "2024-01-18T13:00:00Z",
    updated: "2024-01-18T14:15:00Z",
  },
  {
    id: "3",
    receiptNo: "RCP-2024-003",
    actualReceiptNo: "RN-2024-003",
    inboundReceiptNo: "IN-2024-003",
    receiptType: "RETURN_FROM_END_USER",
    source: "SYSTEM_AUTO",
    title: "Global Trading Co.",
    relatedNo: "REF-2024-003",
    autoReceiving: "YES",
    supplier: "Global Suppliers Inc.",
    shipmentNo: "SHIP-2024-003",
    shipmentId: "3",
    poNo: "PO-2024-003",
    poIds: ["PO-003"],
    transportMode: "OCEAN_FCL",
    carrier: "Maersk",
    trackingNumber: "MAERSK123456",
    appointmentTime: "2024-01-22T09:00:00Z",
    inYardTime: "2024-01-22T09:30:00Z",
    warehouse: "Main Warehouse - Los Angeles",
    warehouseId: "WH001",
    status: "PARTIALLY_RECEIVED",
    receivedBy: "Mike Johnson",
    receivedDate: "2024-01-22T11:45:00Z",
    expectedQty: 100,
    receivedQty: 60,
    totalLines: 3,
    completedLines: 1,
    damageQty: 2,
    rejectedQty: 0,
    warehouseLocation: "A区-01-002",
    notes: "部分货物包装破损",
    created: "2024-01-22T10:00:00Z",
    updated: "2024-01-22T11:45:00Z",
  },
  {
    id: "4",
    receiptNo: "RCP-2024-004",
    actualReceiptNo: undefined, // PENDING状态，还没有收货单号
    inboundReceiptNo: "IN-2024-004",
    receiptType: "INVENTORY_RECEIPT",
    source: "MANUAL",
    title: "ABC Company",
    relatedNo: "REF-2024-004",
    autoReceiving: "NO",
    supplier: "ABC Suppliers Inc.",
    shipmentNo: "SHIP-2024-004",
    shipmentId: "4",
    poNo: "PO-2024-001",
    poIds: ["PO-001"],
    transportMode: "LTL",
    carrier: "UPS",
    trackingNumber: "UPS123456",
    appointmentTime: "2024-01-23T08:00:00Z",
    warehouse: "Main Warehouse - Los Angeles",
    warehouseId: "WH001",
    status: "PENDING",
    expectedQty: 120,
    receivedQty: 0,
    totalLines: 4,
    completedLines: 0,
    created: "2024-01-23T08:00:00Z",
    updated: "2024-01-23T08:00:00Z",
  },
  {
    id: "5",
    receiptNo: "RCP-2024-005",
    actualReceiptNo: undefined, // NEW状态，还没有收货单号
    inboundReceiptNo: "IN-2024-005",
    receiptType: "CUSTOMER_TRANSFER",
    source: "MANUAL",
    title: "XYZ Corporation",
    relatedNo: "REF-2024-005",
    autoReceiving: "YES",
    supplier: "XYZ Suppliers Ltd.",
    shipmentNo: "SHIP-2024-005",
    shipmentId: "5",
    poNo: "PO-2024-003",
    poIds: ["PO-003"],
    transportMode: "EXPRESS",
    carrier: "FedEx",
    trackingNumber: "FEDEX123456",
    warehouse: "Chicago Warehouse",
    warehouseId: "WH003",
    status: "NEW",
    expectedQty: 80,
    receivedQty: 0,
    totalLines: 2,
    completedLines: 0,
    created: "2024-01-19T15:00:00Z",
    updated: "2024-01-19T15:00:00Z",
  },
  {
    id: "6",
    receiptNo: "RCP-2024-006",
    actualReceiptNo: undefined,
    inboundReceiptNo: "IN-2024-006",
    receiptType: "REGULAR",
    source: "MANUAL",
    title: "Test Company",
    relatedNo: "REF-2024-006",
    autoReceiving: "NO",
    supplier: "Test Suppliers Inc.",
    poNo: "PO-2024-004",
    poIds: ["PO-004"],
    transportMode: "TRUCK",
    carrier: "FedEx",
    trackingNumber: "FEDEX789012",
    warehouse: "Chicago Warehouse",
    warehouseId: "WH003",
    status: "CANCELLED",
    expectedQty: 50,
    receivedQty: 0,
    totalLines: 2,
    completedLines: 0,
    created: "2024-01-24T09:00:00Z",
    updated: "2024-01-24T10:00:00Z",
  },
]

export default function ReceiptsPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<Receipt[]>(mockReceipts)
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  
  // Dialog states
  const [showViewDialog, setShowViewDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false)
  const [showExceptionDialog, setShowExceptionDialog] = React.useState(false)
  const [currentReceipt, setCurrentReceipt] = React.useState<Receipt | null>(null)
  
  // Form states for dialogs
  const [exceptionReason, setExceptionReason] = React.useState("")
  const [completionNotes, setCompletionNotes] = React.useState("")
  const [receivingQuantities, setReceivingQuantities] = React.useState<Record<string, number>>({})
  const [receivingBatchNos, setReceivingBatchNos] = React.useState<Record<string, string>>({})
  const [receivingSerialNos, setReceivingSerialNos] = React.useState<Record<string, string>>({})
  const [receivingUOMs, setReceivingUOMs] = React.useState<Record<string, string>>({})
  const [receivingLocations, setReceivingLocations] = React.useState<Record<string, string>>({})
  const [receivingPalletCounts, setReceivingPalletCounts] = React.useState<Record<string, number>>({})

  const sidebarItems = createPurchaseSidebarItems(t)

  // 状态配置
  const statusConfig = {
    NEW: { label: t('NEW'), color: "bg-purple-100 text-purple-800" },
    PENDING: { label: t('PENDING'), color: "bg-gray-100 text-gray-800" },
    IN_RECEIVING: { label: t('IN_RECEIVING'), color: "bg-blue-100 text-blue-800" },
    PARTIALLY_RECEIVED: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800" },
    COMPLETED: { label: t('COMPLETED'), color: "bg-green-100 text-green-800" },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-red-100 text-red-800" },
    CANCELLED: { label: t('CANCELLED'), color: "bg-gray-200 text-gray-600" },
  }

  // 来源配置
  const sourceConfig = {
    MANUAL: { label: t('manual'), color: "bg-blue-100 text-blue-800" },
    EDI: { label: t('edi'), color: "bg-green-100 text-green-800" },
    SYSTEM_AUTO: { label: t('systemAuto'), color: "bg-purple-100 text-purple-800" },
  }

  // 单据类型配置
  const receiptTypeConfig = {
    REGULAR: { label: t('regularReceipt'), color: "bg-gray-100 text-gray-800" },
    TRANSLOAD: { label: t('transload'), color: "bg-blue-100 text-blue-800" },
    RETURN_FROM_END_USER: { label: t('returnFromEndUser'), color: "bg-orange-100 text-orange-800" },
    INVENTORY_RECEIPT: { label: t('inventoryReceipt'), color: "bg-purple-100 text-purple-800" },
    CUSTOMER_TRANSFER: { label: t('customerTransfer'), color: "bg-green-100 text-green-800" },
  }

  // 筛选器配置
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "new", label: t('NEW'), value: "NEW" },
        { id: "pending", label: t('PENDING'), value: "PENDING" },
        { id: "in_receiving", label: t('IN_RECEIVING'), value: "IN_RECEIVING" },
        { id: "partially_received", label: t('PARTIALLY_RECEIVED'), value: "PARTIALLY_RECEIVED" },
        { id: "completed", label: t('COMPLETED'), value: "COMPLETED" },
        { id: "exception", label: t('EXCEPTION'), value: "EXCEPTION" },
        { id: "cancelled", label: t('CANCELLED'), value: "CANCELLED" },
      ],
    },
    {
      id: "warehouse",
      label: t('warehouse'),
      type: "multiple",
      options: [
        { id: "wh001", label: "Main Warehouse - Los Angeles", value: "Main Warehouse - Los Angeles" },
        { id: "wh002", label: "New York Warehouse", value: "New York Warehouse" },
        { id: "wh003", label: "Chicago Warehouse", value: "Chicago Warehouse" },
      ],
    },
    {
      id: "receiptType",
      label: t('receiptType'),
      type: "multiple",
      options: [
        { id: "regular", label: t('regularReceipt'), value: "REGULAR" },
        { id: "transload", label: t('transload'), value: "TRANSLOAD" },
        { id: "return", label: t('returnFromEndUser'), value: "RETURN_FROM_END_USER" },
        { id: "inventory", label: t('inventoryReceipt'), value: "INVENTORY_RECEIPT" },
        { id: "transfer", label: t('customerTransfer'), value: "CUSTOMER_TRANSFER" },
      ],
    },
    {
      id: "autoReceiving",
      label: t('autoReceiving'),
      type: "multiple",
      options: [
        { id: "yes", label: t('yes'), value: "YES" },
        { id: "no", label: t('no'), value: "NO" },
      ],
    },
    {
      id: "transportMode",
      label: t('transportMode'),
      type: "multiple",
      options: [
        { id: "ftl", label: t('ftl'), value: "FTL" },
        { id: "ltl", label: t('ltl'), value: "LTL" },
        { id: "express", label: t('express'), value: "EXPRESS" },
        { id: "smallParcel", label: t('smallParcel'), value: "SMALL_PARCEL" },
        { id: "airCargo", label: t('airCargo'), value: "AIR_CARGO" },
        { id: "oceanFCL", label: t('oceanFCL'), value: "OCEAN_FCL" },
        { id: "oceanLCL", label: t('oceanLCL'), value: "OCEAN_LCL" },
        { id: "rail", label: t('rail'), value: "RAIL" },
        { id: "intermodal", label: t('intermodal'), value: "INTERMODAL" },
        { id: "internal", label: t('internal'), value: "INTERNAL" },
        { id: "virtual", label: t('virtual'), value: "VIRTUAL" },
      ],
    },
    {
      id: "source",
      label: t('source'),
      type: "multiple",
      options: [
        { id: "manual", label: t('manual'), value: "MANUAL" },
        { id: "edi", label: t('edi'), value: "EDI" },
        { id: "system_auto", label: t('systemAuto'), value: "SYSTEM_AUTO" },
      ],
    },
  ]

  // 高级搜索字段配置
  const advancedSearchFields: SearchField[] = [
    { id: "receiptNo", label: t('inboundRequestNo'), placeholder: "e.g., RCP-2024-001" },
    { id: "actualReceiptNo", label: t('receiptNo'), placeholder: "e.g., RN-2024-001" },
    { id: "title", label: t('title'), placeholder: "e.g., ABC Company" },
    { id: "relatedNo", label: t('relatedNo'), placeholder: "e.g., REF-001" },
    { id: "shipmentNo", label: t('shipmentNo'), placeholder: "e.g., SHIP-2024-001" },
    { id: "poNo", label: t('poNo'), placeholder: "e.g., PO-001" },
    { id: "supplier", label: t('supplierName'), placeholder: "e.g., ABC Suppliers Inc." },
    { id: "carrier", label: t('carrier'), placeholder: "e.g., FedEx" },
    { id: "trackingNumber", label: t('trackingNo'), placeholder: "e.g., 1234567890" },
    { id: "warehouse", label: t('warehouse'), placeholder: "e.g., Main Warehouse" },
    { id: "receivedBy", label: t('receivedBy'), placeholder: "e.g., John Smith" },
  ]


  // 计算状态计数（基于filteredData，这样状态更新后计数也会更新）
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: filteredData.length,
      NEW: 0,
      PENDING: 0,
      IN_RECEIVING: 0,
      PARTIALLY_RECEIVED: 0,
      COMPLETED: 0,
      EXCEPTION: 0,
      CANCELLED: 0,
    }
    filteredData.forEach(receipt => {
      counts[receipt.status] = (counts[receipt.status] || 0) + 1
    })
    return counts
  }, [filteredData])

  // 数据过滤逻辑
  React.useEffect(() => {
    let result = [...mockReceipts]

    // 状态标签页过滤
    if (activeTab !== "all") {
      result = result.filter(r => r.status === activeTab.toUpperCase())
    }

    // 基础搜索过滤
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      result = result.filter(r =>
        r.receiptNo.toLowerCase().includes(searchLower) ||
        r.shipmentNo.toLowerCase().includes(searchLower) ||
        r.poNo.toLowerCase().includes(searchLower) ||
        r.warehouse.toLowerCase().includes(searchLower)
      )
    }

    // 筛选器过滤
    if (activeFilters.length > 0) {
      result = result.filter(r => {
        return activeFilters.every(filter => {
          switch (filter.filterId) {
            case "status":
              return r.status === filter.optionValue
            case "warehouse":
              return r.warehouse === filter.optionValue
            case "receiptType":
              return r.receiptType === filter.optionValue
            case "source":
              return r.source === filter.optionValue
            case "autoReceiving":
              return r.autoReceiving === filter.optionValue
            case "transportMode":
              return r.transportMode === filter.optionValue
            default:
              return true
          }
        })
      })
    }

    // 高级搜索过滤
    if (Object.keys(advancedSearchValues).length > 0) {
      result = result.filter(r => {
        if (advancedSearchValues.receiptNo && !r.receiptNo.toLowerCase().includes(advancedSearchValues.receiptNo.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.actualReceiptNo && (!r.actualReceiptNo || !r.actualReceiptNo.toLowerCase().includes(advancedSearchValues.actualReceiptNo.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.title && (!r.title || !r.title.toLowerCase().includes(advancedSearchValues.title.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.relatedNo && (!r.relatedNo || !r.relatedNo.toLowerCase().includes(advancedSearchValues.relatedNo.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.shipmentNo && (!r.shipmentNo || !r.shipmentNo.toLowerCase().includes(advancedSearchValues.shipmentNo.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.poNo && !r.poNo.toLowerCase().includes(advancedSearchValues.poNo.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.supplier && (!r.supplier || !r.supplier.toLowerCase().includes(advancedSearchValues.supplier.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.carrier && (!r.carrier || !r.carrier.toLowerCase().includes(advancedSearchValues.carrier.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.trackingNumber && (!r.trackingNumber || !r.trackingNumber.toLowerCase().includes(advancedSearchValues.trackingNumber.toLowerCase()))) {
          return false
        }
        if (advancedSearchValues.warehouse && !r.warehouse.toLowerCase().includes(advancedSearchValues.warehouse.toLowerCase())) {
          return false
        }
        if (advancedSearchValues.receivedBy && (!r.receivedBy || !r.receivedBy.toLowerCase().includes(advancedSearchValues.receivedBy.toLowerCase()))) {
          return false
        }
        return true
      })
    }

    setFilteredData(result)
    setCurrentPage(1)
  }, [activeTab, searchValue, activeFilters, advancedSearchValues])

  // 操作处理函数
  const handleView = (receipt: Receipt) => {
    router.push(`/purchase/receipts/${receipt.id}`)
  }

  const handleEdit = (receipt: Receipt) => {
    router.push(`/purchase/receipts/${receipt.id}/edit`)
  }

  const handleMarkException = (receipt: Receipt) => {
    setCurrentReceipt(receipt)
    setExceptionReason("")
    setShowExceptionDialog(true)
  }

  // 处理推送到仓库
  const handlePushToWarehouse = (receipt: Receipt) => {
    console.log("Push to warehouse:", receipt.id)
    // TODO: 实现推送到仓库的逻辑
  }

  // Receipt Line Item Interface (for dialog)
  interface ReceiptLineItem {
    id: string
    lineNo: number
    sku: string
    itemName: string
    orderedQty: number
    receivedQty: number
    uom: string
  }

  // Mock receipt lines data (in real app, fetch from API)
  const getReceiptLines = (receipt: Receipt): ReceiptLineItem[] => {
    // Mock data - in real app, fetch from API based on receiptId
    // 根据receipt的已收货数量，分配各行的已收货数量
    const baseLines: ReceiptLineItem[] = [
      {
        id: `${receipt.id}-line-1`,
        lineNo: 1,
        sku: "SKU-001",
        itemName: "Product A",
        orderedQty: Math.floor(receipt.expectedQty * 0.5), // 50%
        receivedQty: 0,
        uom: "PCS",
      },
      {
        id: `${receipt.id}-line-2`,
        lineNo: 2,
        sku: "SKU-002",
        itemName: "Product B",
        orderedQty: Math.floor(receipt.expectedQty * 0.3), // 30%
        receivedQty: 0,
        uom: "PCS",
      },
      {
        id: `${receipt.id}-line-3`,
        lineNo: 3,
        sku: "SKU-003",
        itemName: "Product C",
        orderedQty: receipt.expectedQty - Math.floor(receipt.expectedQty * 0.5) - Math.floor(receipt.expectedQty * 0.3), // 剩余
        receivedQty: 0,
        uom: "PCS",
      },
    ]

    // 根据receipt的已收货数量，分配各行的已收货数量（简单按比例分配）
    if (receipt.receivedQty > 0) {
      const totalOrdered = baseLines.reduce((sum, line) => sum + line.orderedQty, 0)
      baseLines.forEach((line, index) => {
        // 按比例分配已收货数量
        const proportion = line.orderedQty / totalOrdered
        line.receivedQty = Math.floor(receipt.receivedQty * proportion)
      })
    }

    return baseLines
  }

  // 处理完成收货
  const handleCompleteReceiving = (receipt: Receipt) => {
    setCurrentReceipt(receipt)
    // 初始化收货数量（本次收货数量初始为0）
    const lines = getReceiptLines(receipt)
    const initialQuantities: Record<string, number> = {}
    const initialBatchNos: Record<string, string> = {}
    const initialSerialNos: Record<string, string> = {}
    const initialUOMs: Record<string, string> = {}
    const initialLocations: Record<string, string> = {}
    const initialPalletCounts: Record<string, number> = {}
    lines.forEach(line => {
      initialQuantities[line.id] = 0 // 本次收货数量初始为0
      initialBatchNos[line.id] = ""
      initialSerialNos[line.id] = ""
      initialUOMs[line.id] = line.uom // 初始化为原始UOM
      initialLocations[line.id] = ""
      initialPalletCounts[line.id] = 0
    })
    setReceivingQuantities(initialQuantities)
    setReceivingBatchNos(initialBatchNos)
    setReceivingSerialNos(initialSerialNos)
    setReceivingUOMs(initialUOMs)
    setReceivingLocations(initialLocations)
    setReceivingPalletCounts(initialPalletCounts)
    setCompletionNotes("")
    setShowCompleteDialog(true)
  }

  // 处理收货数量变化
  const handleReceivingQtyChange = (lineId: string, value: number) => {
    setReceivingQuantities(prev => ({ ...prev, [lineId]: Math.max(0, value) }))
  }

  // 确认完成收货
  const handleConfirmCompleteReceiving = () => {
    if (!currentReceipt) return

    const lines = getReceiptLines(currentReceipt)
    const hasAnyQty = lines.some(line => {
      const qty = receivingQuantities[line.id] || 0
      return qty > 0
    })

    if (!hasAnyQty) {
      alert(t('pleaseEnterReceivingQty'))
      return
    }

    // 验证收货数量不超过剩余数量
    const invalidLines = lines.filter(line => {
      const qty = receivingQuantities[line.id] || 0
      const maxQty = line.orderedQty - line.receivedQty
      return qty > maxQty
    })

    if (invalidLines.length > 0) {
      alert(t('receivingQtyExceedsRemaining') || "收货数量不能超过剩余数量")
      return
    }

    // 计算总收货数量
    const totalReceivingQty = lines.reduce((sum, line) => {
      return sum + (receivingQuantities[line.id] || 0)
    }, 0)

    // 更新mock数据（实际应该调用API）
    console.log("Complete Receiving", {
      receiptId: currentReceipt.id,
      receivingQuantities,
      receivingBatchNos,
      receivingSerialNos,
      receivingUOMs,
      receivingLocations,
      receivingPalletCounts,
      totalReceivingQty,
      completionNotes,
    })

    // 更新状态
    const newReceivedQty = currentReceipt.receivedQty + totalReceivingQty
    const isFullyReceived = newReceivedQty >= currentReceipt.expectedQty

    // 更新mock数据中的receipt状态
    // 在实际应用中，这里应该调用API更新数据
    setFilteredData(prev => prev.map(r => {
      if (r.id === currentReceipt.id) {
        const newStatus = isFullyReceived ? "COMPLETED" : (newReceivedQty > 0 ? "PARTIALLY_RECEIVED" : (r.status === "NEW" ? "PENDING" : r.status))
        return {
          ...r,
          receivedQty: newReceivedQty,
          status: newStatus,
          receivedBy: "Current User", // 实际应该从用户上下文获取
          receivedDate: new Date().toISOString(),
        }
      }
      return r
    }))

    // 更新mockReceipts（用于状态计数）
    mockReceipts.forEach((r, index) => {
      if (r.id === currentReceipt.id) {
        const newReceivedQty = r.receivedQty + totalReceivingQty
        const isFullyReceived = newReceivedQty >= r.expectedQty
        r.receivedQty = newReceivedQty
        r.status = isFullyReceived ? "COMPLETED" : (newReceivedQty > 0 ? "PARTIALLY_RECEIVED" : (r.status === "NEW" ? "PENDING" : r.status))
        r.receivedBy = "Current User"
        r.receivedDate = new Date().toISOString()
      }
    })

    setShowCompleteDialog(false)
    setReceivingQuantities({})
    setCompletionNotes("")
  }

  // 处理取消
  const handleCancelReceipt = (receipt: Receipt) => {
    if (confirm(t('confirmCancelReceipt'))) {
      console.log("Cancel receipt:", receipt.id)
      // TODO: 实现取消收货单的逻辑
    }
  }

  // 处理复制
  const handleCopyReceipt = (receipt: Receipt) => {
    console.log("Copy receipt:", receipt.id)
    // TODO: 实现复制收货单的逻辑，跳转到新建页面并预填充数据
    router.push(`/purchase/receipts/create?copyFrom=${receipt.id}`)
  }

  // 获取可用操作（根据状态）
  const getAvailableActions = (receipt: Receipt) => {
    switch (receipt.status) {
      case "NEW":
        return [
          { label: t('edit'), action: () => handleEdit(receipt) },
          { label: t('pushToWarehouse'), action: () => handlePushToWarehouse(receipt) },
          { label: t('receiving'), action: () => handleCompleteReceiving(receipt) },
          { label: t('cancel'), action: () => handleCancelReceipt(receipt) },
        ]
      case "PENDING":
      case "IN_RECEIVING":
      case "PARTIALLY_RECEIVED":
        return [
          { label: t('receiving'), action: () => handleCompleteReceiving(receipt) },
        ]
      case "COMPLETED":
        return [
          { label: t('copy'), action: () => handleCopyReceipt(receipt) },
        ]
      case "EXCEPTION":
        return [
          { label: t('resolveException'), action: () => console.log("Resolve exception") },
        ]
      case "CANCELLED":
        return [
          { label: t('copy'), action: () => handleCopyReceipt(receipt) },
        ]
      default:
        return []
    }
  }

  // 批量操作
  const availableBatchActions = [
    { label: t('batchComplete'), action: () => console.log("Batch Complete", selectedRows) },
    { label: t('batchDownload'), action: () => console.log("Batch Download", selectedRows) },
  ]

  // 列定义（包含defaultVisible属性）
  const allColumns: Column<Receipt>[] = [
    {
      id: "receiptNo",
      header: t('inboundRequestNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <Button variant="link" className="h-auto p-0 font-medium" onClick={() => handleView(row)}>
          {row.receiptNo}
        </Button>
      ),
    },
    {
      id: "inboundReceiptNo",
      header: t('inboundReceiptNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.actualReceiptNo || <span className="text-muted-foreground">-</span>, // 第一个入库单号：RN开头的值
    },
    {
      id: "actualReceiptNo",
      header: t('receiptNo'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => row.actualReceiptNo || <span className="text-muted-foreground">-</span>, // 收货单号
    },
    {
      id: "receiptType",
      header: t('receiptType'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        <Badge className={receiptTypeConfig[row.receiptType].color}>
          {receiptTypeConfig[row.receiptType].label}
        </Badge>
      ),
    },
    {
      id: "source",
      header: t('source'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <Badge className={sourceConfig[row.source].color}>
          {sourceConfig[row.source].label}
        </Badge>
      ),
    },
    {
      id: "title",
      header: t('title'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.title || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "relatedNo",
      header: t('relatedNo'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.relatedNo || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "supplier",
      header: t('supplierName'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => row.supplier || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "poNo",
      header: t('poNo'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => {
        const poNos = row.poNo.split(',').map(no => no.trim())
        return (
          <div className="flex flex-wrap gap-1">
            {poNos.map((poNo, idx) => {
              const poId = row.poIds?.[idx] || row.poId
              return (
                <Button 
                  key={idx}
                  variant="link" 
                  className="h-auto p-0 text-xs" 
                  onClick={() => poId && router.push(`/purchase/po/${poId}`)}
                >
                  {poNo}
                </Button>
              )
            })}
          </div>
        )
      },
    },
    {
      id: "shipmentNo",
      header: t('shipmentNo'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.shipmentNo ? (
        <Button variant="link" className="h-auto p-0" onClick={() => row.shipmentId && router.push(`/purchase/asn/${row.shipmentId}`)}>
          {row.shipmentNo}
        </Button>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "transportMode",
      header: t('transportMode'),
      width: "140px",
      defaultVisible: false,
      cell: (row) => row.transportMode ? t(row.transportMode.toLowerCase()) : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "carrier",
      header: t('carrier'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.carrier || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "trackingNumber",
      header: t('trackingNo'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.trackingNumber || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "warehouse",
      header: t('warehouse'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => row.warehouse,
    },
    {
      id: "autoReceiving",
      header: t('autoReceiving'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => row.autoReceiving ? (
        <Badge className={row.autoReceiving === "YES" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {row.autoReceiving === "YES" ? t('yes') : t('no')}
        </Badge>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "status",
      header: t('status'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        <Badge className={statusConfig[row.status].color}>
          {statusConfig[row.status].label}
        </Badge>
      ),
    },
    {
      id: "expectedQty",
      header: t('expectedQty'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => row.expectedQty.toLocaleString(),
    },
    {
      id: "receivedQty",
      header: t('receivedQty'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <span className={row.receivedQty > 0 ? "font-medium text-green-600" : ""}>
          {row.receivedQty.toLocaleString()}
        </span>
      ),
    },
    {
      id: "receivedBy",
      header: t('receivedBy'),
      width: "150px",
      defaultVisible: false,
      cell: (row) => row.receivedBy || <span className="text-muted-foreground">-</span>,
    },
    {
      id: "receivedDate",
      header: t('receivedDate'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => row.receivedDate ? new Date(row.receivedDate).toLocaleDateString() : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "appointmentTime",
      header: t('appointmentTime'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => row.appointmentTime ? new Date(row.appointmentTime).toLocaleString() : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "inYardTime",
      header: t('inYardTime'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => row.inYardTime ? new Date(row.inYardTime).toLocaleString() : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "damageQty",
      header: t('damageQty'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => row.damageQty ? row.damageQty.toLocaleString() : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "rejectedQty",
      header: t('rejectedQty'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => row.rejectedQty ? row.rejectedQty.toLocaleString() : <span className="text-muted-foreground">-</span>,
    },
    {
      id: "updated",
      header: t('updatedAt'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => new Date(row.updated).toLocaleString(),
    },
    {
      id: "actions",
      header: t('actions'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => {
        const actions = getAvailableActions(row)
        return (
          <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
            {actions.slice(0, 2).map((action, idx) => (
              <button
                key={idx}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  action.action()
                }}
              >
                {action.label}
              </button>
            ))}
            {actions.slice(2, 4).map((action, idx) => (
              <button
                key={idx + 2}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                onClick={(e) => {
                  e.stopPropagation()
                  action.action()
                }}
              >
                {action.label}
              </button>
            ))}
            {actions.length > 4 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm cursor-pointer bg-transparent border-0 p-0 text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('moreActions')}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {actions.slice(4).map((action, idx) => (
                    <DropdownMenuItem 
                      key={idx} 
                      onClick={(e) => {
                        e.stopPropagation()
                        action.action()
                      }}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      },
    },
  ]

  // Initialize visible columns on mount
  React.useEffect(() => {
    const defaultVisible = new Set(
      allColumns.filter(col => col.defaultVisible !== false).map(col => col.id)
    )
    setVisibleColumns(defaultVisible)
  }, [])

  // Prepare column configs for FilterBar
  const columnConfigs = allColumns.map(col => ({
    id: col.id,
    label: typeof col.header === 'string' ? col.header : col.header,
    visible: visibleColumns.has(col.id),
    defaultVisible: col.defaultVisible
  }))

  // Handle column visibility changes
  const handleColumnsChange = (updatedColumns: { id: string; label: string; visible: boolean }[]) => {
    const newVisible = new Set(updatedColumns.filter(c => c.visible).map(c => c.id))
    setVisibleColumns(newVisible)
  }

  // Filter columns based on visibility
  const visibleColumnsList = allColumns.filter(col => visibleColumns.has(col.id))

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('receipts')}</h1>
            <p className="text-muted-foreground">{t('manageReceipts')}</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {t('newReceipt')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/purchase/receipts/create")}>
                  {t('createManuallyReceipt')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Import from file")}>
                  {t('importFromFileReceipt')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Download template")}>
                  {t('downloadTemplateReceipt')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t('download')}
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              {t('upload')}
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')} ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="new">
              {t('NEW')} ({statusCounts.NEW})
            </TabsTrigger>
            <TabsTrigger value="pending">
              {t('PENDING')} ({statusCounts.PENDING})
            </TabsTrigger>
            <TabsTrigger value="in_receiving">
              {t('IN_RECEIVING')} ({statusCounts.IN_RECEIVING})
            </TabsTrigger>
            <TabsTrigger value="partially_received">
              {t('PARTIALLY_RECEIVED')} ({statusCounts.PARTIALLY_RECEIVED})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {t('COMPLETED')} ({statusCounts.COMPLETED})
            </TabsTrigger>
            <TabsTrigger value="exception">
              {t('EXCEPTION')} ({statusCounts.EXCEPTION})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {t('CANCELLED')} ({statusCounts.CANCELLED})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filter Bar */}
        <FilterBar
          searchPlaceholder={t('searchReceiptsPlaceholder') || t('search')}
          onSearchChange={setSearchValue}
          filters={filterConfigs}
          onFiltersChange={setActiveFilters}
          columns={columnConfigs}
          onColumnsChange={handleColumnsChange}
          advancedSearchFields={advancedSearchFields}
          onAdvancedSearch={setAdvancedSearchValues}
        />

        {/* Data Table */}
        <Card>
          <CardContent className="pt-6">
            <DataTable
              data={filteredData}
              columns={visibleColumnsList}
              currentPage={currentPage}
              totalItems={filteredData.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSelectionChange={setSelectedRows}
              selectedRows={selectedRows}
              onRowClick={(row) => handleView(row)}
              hideColumnControl={true}
              batchActions={selectedRows.length > 0 ? availableBatchActions : undefined}
              hideColumnControl={true}
            />
          </CardContent>
        </Card>

        {/* Complete Receiving Dialog */}
        <Dialog 
          open={showCompleteDialog} 
          onOpenChange={(open) => {
            setShowCompleteDialog(open)
            if (!open) {
              // 关闭对话框时清空数据
              setReceivingQuantities({})
              setReceivingBatchNos({})
              setReceivingSerialNos({})
              setReceivingUOMs({})
              setReceivingLocations({})
              setReceivingPalletCounts({})
              setCompletionNotes("")
            }
          }}
        >
          <DialogContent className="max-w-[95vw] w-full">
            <DialogHeader>
              <DialogTitle>{t('receiving')}</DialogTitle>
              <DialogDescription>
                {t('inboundRequestNo')}: {currentReceipt?.receiptNo}
                {currentReceipt?.receivedQty > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    ({t('receivedQty')}: {currentReceipt.receivedQty} / {currentReceipt.expectedQty})
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {currentReceipt && (
            <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{t('receiptLines')}</Label>
                    <div className="border rounded-md overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">{t('lineNo')}</TableHead>
                            <TableHead>{t('item')}</TableHead>
                            <TableHead className="text-center">{t('orderedQty')}</TableHead>
                            <TableHead className="text-center">{t('receivedQty')}</TableHead>
                            <TableHead className="text-center">{t('thisReceiptQty')} *</TableHead>
                            <TableHead className="text-center">{t('palletCount')}</TableHead>
                            <TableHead className="text-center">{t('location')}</TableHead>
                            <TableHead className="text-center">{t('lotBatchNo')}</TableHead>
                            <TableHead className="text-center">{t('serialNo')}</TableHead>
                            <TableHead className="text-center">{t('uom')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getReceiptLines(currentReceipt).map((line) => {
                            const maxQty = line.orderedQty - line.receivedQty
                            const receivingQty = receivingQuantities[line.id] || 0
                            const batchNo = receivingBatchNos[line.id] || ""
                            const serialNo = receivingSerialNos[line.id] || ""
                            const uom = receivingUOMs[line.id] || line.uom
                            const location = receivingLocations[line.id] || ""
                            const palletCount = receivingPalletCounts[line.id] || 0
                            return (
                              <TableRow key={line.id}>
                                <TableCell>
                                  <Badge variant="outline">{line.lineNo}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{line.itemName}</div>
                                    <div className="text-xs text-muted-foreground">SKU: {line.sku}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">{line.orderedQty.toLocaleString()}</TableCell>
                                <TableCell className="text-center">{line.receivedQty.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={maxQty}
                                    value={receivingQty}
                                    onChange={(e) => handleReceivingQtyChange(line.id, parseInt(e.target.value) || 0)}
                                    className="w-24 mx-auto"
                                    placeholder="0"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min={0}
                                    value={palletCount}
                                    onChange={(e) => setReceivingPalletCounts(prev => ({ ...prev, [line.id]: parseInt(e.target.value) || 0 }))}
                                    placeholder={t('enterPalletCount') || "输入托盘数"}
                                    className="w-24 mx-auto text-xs"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={location}
                                    onChange={(e) => setReceivingLocations(prev => ({ ...prev, [line.id]: e.target.value }))}
                                    placeholder={t('enterLocation') || "输入库位"}
                                    className="w-32 mx-auto text-xs"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={batchNo}
                                    onChange={(e) => setReceivingBatchNos(prev => ({ ...prev, [line.id]: e.target.value }))}
                                    placeholder={t('enterLotBatchNo') || "输入批次号"}
                                    className="w-32 mx-auto text-xs"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={serialNo}
                                    onChange={(e) => setReceivingSerialNos(prev => ({ ...prev, [line.id]: e.target.value }))}
                                    placeholder={t('enterSerialNo') || "输入序列号"}
                                    title={t('serialNoHint') || "多个用逗号分隔"}
                                    className="w-40 mx-auto text-xs"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={uom}
                                    onChange={(e) => setReceivingUOMs(prev => ({ ...prev, [line.id]: e.target.value }))}
                                    placeholder={t('uom') || "单位"}
                                    className="w-20 mx-auto text-xs text-center"
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="completionNotes">{t('notes')}</Label>
                    <Textarea
                      id="completionNotes"
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder={t('enterNotes')}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCompleteDialog(false)
                setReceivingQuantities({})
                setReceivingBatchNos({})
                setReceivingSerialNos({})
                setReceivingUOMs({})
                setReceivingLocations({})
                setReceivingPalletCounts({})
                setCompletionNotes("")
              }}>
                {t('cancel')}
              </Button>
              <Button onClick={handleConfirmCompleteReceiving}>
                {t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark Exception Dialog */}
        <Dialog open={showExceptionDialog} onOpenChange={setShowExceptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('markException')}</DialogTitle>
              <DialogDescription>
                {t('markException')} {t('receiptNo')}: {currentReceipt?.receiptNo}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exceptionReason">{t('exceptionDescription')}</Label>
                <Textarea
                  id="exceptionReason"
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  placeholder={t('enterNotes')}
                  rows={4}
                />
                  </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExceptionDialog(false)}>{t('cancel')}</Button>
              <Button onClick={() => {
                console.log("Mark Exception", { receiptId: currentReceipt?.id, exceptionReason })
                setShowExceptionDialog(false)
              }}>{t('confirm')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
