"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, AlertCircle, Download, Upload, FileDown, FilePlus, Eye, Edit, Send, X, RotateCcw, Copy, MapPin, FileCheck, MoreVertical, Mail, CheckCircle2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/ui/status-badge"
import { OrderNumberCell } from "@/components/ui/order-number-cell"
import { POStatus, ShippingStatus, ReceivingStatus } from "@/lib/enums/po-status"
import { LocalWarehouseReceiptDialog } from "@/components/purchase/local-warehouse-receipt-dialog"
import { POSendDialog } from "@/components/purchase/po-send-dialog"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

// Email history record interface
interface EmailHistoryRecord {
  id: string
  sentDate: string
  from: string
  recipients: string[]
  cc?: string[]
  subject: string
  body: string
  pdfTemplate: string
  status: "SENT" | "FAILED" | "PENDING"
  sentBy: string
}

// PO Data Interface based on the optimized status system
interface PurchaseOrder {
  id: string
  orderNo: string
  originalPoNo: string // Original PO number from external system
  prNos: string[] // Related PR numbers (multiple PRs can be consolidated into one PO)
  referenceNo: string
  supplierName: string
  supplierNo: string
  destination: string
  warehouseName: string
  warehouseId?: string // 仓库ID，用于判断仓库类型

  // 主状态（PO Status）- 使用新的状态枚举
  status: POStatus

  // 运输状态（Shipping Status）- 使用新的状态枚举
  shippingStatus: ShippingStatus | null

  // 收货状态（Receiving Status）- 使用新的状态枚举
  receivingStatus: ReceivingStatus | null

  // 来源
  dataSource: "MANUAL" | "PR_CONVERSION" | "API_IMPORT"

  // 数量和金额信息
  totalOrderQty: number
  shippedQty: number
  receivedQty: number
  totalPrice: number
  currency: string

  // ASN 相关
  asnCount: number

  // 时间信息
  created: string
  updated: string
  expectedArrivalDate: string
  purchaseOrderDate: string

  // 地址信息
  toCity: string
  toState: string
  toCountry: string

  // 运输信息
  shippingService: string
  shippingCarrier: string
  shippingNotes: string

  // 其他
  itemCount: number
  exceptions: string[]

  // Email tracking
  sentToSupplier: boolean
  lastSentDate?: string
  emailHistory?: EmailHistoryRecord[]
}

// Mock data with simplified status system (NEW, PROCESSING, CLOSED, CANCELLED, EXCEPTION)
const mockPOs: PurchaseOrder[] = [
  {
    id: "1",
    orderNo: "PO202403150001",
    originalPoNo: "EXT-PO-2024-001",
    prNos: ["PR202401100001", "PR202401100002"],
    referenceNo: "REF202403150001",
    supplierName: "ABC Suppliers Inc.",
    supplierNo: "SUP001",
    destination: "Main Warehouse - Los Angeles",
    warehouseName: "Main Warehouse",
    status: POStatus.IN_TRANSIT,
    shippingStatus: ShippingStatus.SHIPPED,
    receivingStatus: ReceivingStatus.NOT_RECEIVED,
    dataSource: "PR_CONVERSION",
    totalOrderQty: 500,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 12500.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-15T10:30:00Z",
    updated: "2024-01-16T14:20:00Z",
    expectedArrivalDate: "2024-01-25T15:00:00Z",
    purchaseOrderDate: "2024-01-15",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "Handle with care - fragile items",
    itemCount: 15,
    exceptions: [],
    sentToSupplier: true,
    lastSentDate: "2024-01-15T11:00:00Z",
    emailHistory: [
      {
        id: "email-1",
        sentDate: "2024-01-15T11:00:00Z",
        from: "purchasing@company.com",
        recipients: ["sup001@abcsuppliers.com"],
        cc: ["manager@company.com"],
        subject: "Purchase Order PO202403150001 - ABC Suppliers Inc.",
        body: "Dear ABC Suppliers Inc.,\n\nPlease find attached Purchase Order PO202403150001...",
        pdfTemplate: "standard",
        status: "SENT",
        sentBy: "John Doe"
      }
    ]
  },
  {
    id: "2",
    orderNo: "PO202403150002",
    originalPoNo: "EXT-PO-2024-002",
    prNos: ["PR202401090001"],
    referenceNo: "REF202403150002",
    supplierName: "Global Trading Co.",
    supplierNo: "SUP002",
    destination: "East Distribution Center - New York",
    warehouseName: "East DC",
    status: POStatus.WAITING_FOR_RECEIVING,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.PARTIAL_RECEIVED,
    dataSource: "MANUAL",
    totalOrderQty: 1200,
    shippedQty: 1200,
    receivedQty: 0,
    totalPrice: 35000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-14T09:15:00Z",
    updated: "2024-01-18T11:45:00Z",
    expectedArrivalDate: "2024-01-23T14:30:00Z",
    purchaseOrderDate: "2024-01-14",
    toCity: "New York",
    toState: "NY",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Signature required",
    itemCount: 28,
    exceptions: ["Delayed shipment"],
    sentToSupplier: false,
  },
  {
    id: "3",
    orderNo: "PO202403150003",
    originalPoNo: "EXT-PO-2024-003",
    prNos: ["PR202401050001", "PR202401050002", "PR202401050003"],
    referenceNo: "REF202403150003",
    supplierName: "Tech Distributors Ltd.",
    supplierNo: "SUP003",
    destination: "West Fulfillment Center - Seattle",
    warehouseName: "West FC",
    status: POStatus.CLOSED,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.RECEIVED,
    dataSource: "PR_CONVERSION",
    totalOrderQty: 850,
    shippedQty: 850,
    receivedQty: 850,
    totalPrice: 28000.00,
    currency: "USD",
    asnCount: 3,
    created: "2024-01-10T13:20:00Z",
    updated: "2024-01-17T10:35:00Z",
    expectedArrivalDate: "2024-01-17T16:00:00Z",
    purchaseOrderDate: "2024-01-10",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "",
    itemCount: 42,
    exceptions: [],
    sentToSupplier: true,
    lastSentDate: "2024-01-10T14:00:00Z",
  },
  {
    id: "4",
    orderNo: "PO202403150004",
    originalPoNo: "EXT-PO-2024-004",
    prNos: ["PR202401120001"],
    referenceNo: "REF202403150004",
    supplierName: "Premium Goods Supply",
    supplierNo: "SUP004",
    destination: "Central Warehouse - Chicago",
    warehouseName: "Central WH",
    status: POStatus.EXCEPTION,
    shippingStatus: ShippingStatus.SHIPPING_EXCEPTION,
    receivingStatus: null,
    dataSource: "API_IMPORT",
    totalOrderQty: 1500,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 45000.00,
    currency: "USD",
    asnCount: 0,
    created: "2024-01-16T08:00:00Z",
    updated: "2024-01-16T16:30:00Z",
    expectedArrivalDate: "2024-01-27T10:00:00Z",
    purchaseOrderDate: "2024-01-16",
    toCity: "Chicago",
    toState: "IL",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "FedEx",
    shippingNotes: "Hold for inspection",
    itemCount: 35,
    exceptions: ["Payment pending", "Quality check required"],
    sentToSupplier: false,
  },
  {
    id: "5",
    orderNo: "PO202403150005",
    originalPoNo: "EXT-PO-2024-005",
    prNos: ["PR202401080001"],
    referenceNo: "REF202403150005",
    supplierName: "Reliable Parts Co.",
    supplierNo: "SUP005",
    destination: "South Warehouse - Miami",
    warehouseName: "South WH",
    status: POStatus.PROCESSING,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.PARTIAL_RECEIVED,
    dataSource: "MANUAL",
    totalOrderQty: 2000,
    shippedQty: 2000,
    receivedQty: 1200,
    totalPrice: 67000.00,
    currency: "USD",
    asnCount: 4,
    created: "2024-01-12T15:45:00Z",
    updated: "2024-01-20T09:30:00Z",
    expectedArrivalDate: "2024-01-22T13:30:00Z",
    purchaseOrderDate: "2024-01-12",
    toCity: "Miami",
    toState: "FL",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Partial delivery expected",
    itemCount: 18,
    exceptions: [],
    sentToSupplier: true,
    lastSentDate: "2024-01-12T16:00:00Z",
  },
  {
    id: "6",
    orderNo: "PO202403150006",
    originalPoNo: "EXT-PO-2024-006",
    prNos: ["PR202401070001", "PR202401070002"],
    referenceNo: "REF202403150006",
    supplierName: "Quality Components Ltd.",
    supplierNo: "SUP006",
    destination: "North Warehouse - Boston",
    warehouseName: "North WH",
    status: POStatus.NEW,
    shippingStatus: null,
    receivingStatus: null,
    dataSource: "MANUAL",
    totalOrderQty: 300,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 8500.00,
    currency: "USD",
    asnCount: 0,
    created: "2024-01-18T11:20:00Z",
    updated: "2024-01-18T11:20:00Z",
    expectedArrivalDate: "2024-01-30",
    purchaseOrderDate: "2024-01-18",
    toCity: "Boston",
    toState: "MA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "",
    itemCount: 8,
    exceptions: [],
    sentToSupplier: false,
  },
  {
    id: "7",
    orderNo: "PO202403150007",
    originalPoNo: "EXT-PO-2024-007",
    prNos: ["PR202401200001"],
    referenceNo: "REF202403150007",
    supplierName: "Fast Delivery Inc.",
    supplierNo: "SUP007",
    destination: "Main Warehouse - Los Angeles",
    warehouseName: "Main Warehouse",
    status: POStatus.PROCESSING,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.PARTIAL_RECEIVED,
    dataSource: "PR_CONVERSION",
    totalOrderQty: 750,
    shippedQty: 750,
    receivedQty: 200,
    totalPrice: 22000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-19T14:30:00Z",
    updated: "2024-01-21T16:45:00Z",
    expectedArrivalDate: "2024-01-21",
    purchaseOrderDate: "2024-01-19",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "Currently receiving at warehouse",
    itemCount: 25,
    exceptions: [],
    sentToSupplier: false,
  },
  {
    id: "8",
    orderNo: "PO202403150008",
    originalPoNo: "EXT-PO-2024-008",
    prNos: ["PR202401220001"],
    referenceNo: "REF202403150008",
    supplierName: "Digital Products Co.",
    supplierNo: "SUP008",
    destination: "West Fulfillment Center - Seattle",
    warehouseName: "West FC",
    status: POStatus.PROCESSING,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.NOT_RECEIVED,
    dataSource: "MANUAL",
    totalOrderQty: 600,
    shippedQty: 600,
    receivedQty: 0,
    totalPrice: 18000.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-22T09:00:00Z",
    updated: "2024-01-22T15:30:00Z",
    expectedArrivalDate: "2024-01-24",
    purchaseOrderDate: "2024-01-22",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "Local warehouse - ready for receiving",
    itemCount: 12,
    exceptions: [],
    sentToSupplier: false,
  },
  {
    id: "9",
    orderNo: "PO202403150009",
    originalPoNo: "EXT-PO-2024-009",
    prNos: ["PR202401250001"],
    referenceNo: "REF202403150009",
    supplierName: "Global Electronics",
    supplierNo: "SUP009",
    destination: "Main Warehouse - Los Angeles",
    warehouseName: "Main Warehouse",
    status: POStatus.DRAFT,
    shippingStatus: null,
    receivingStatus: null,
    dataSource: "MANUAL",
    totalOrderQty: 100,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 5000.00,
    currency: "USD",
    asnCount: 0,
    created: "2024-02-01T10:00:00Z",
    updated: "2024-02-01T10:00:00Z",
    expectedArrivalDate: "2024-02-15",
    purchaseOrderDate: "2024-02-01",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    shippingService: "",
    shippingCarrier: "",
    shippingNotes: "",
    itemCount: 5,
    exceptions: [],
    sentToSupplier: false,
  },
  {
    id: "10",
    orderNo: "PO202403150010",
    originalPoNo: "EXT-PO-2024-010",
    prNos: ["PR202401260001"],
    referenceNo: "REF202403150010",
    supplierName: "Fast Shipping Co.",
    supplierNo: "SUP010",
    destination: "East Distribution Center - New York",
    warehouseName: "East DC",
    status: POStatus.RECEIVING,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.PARTIAL_RECEIVED,
    dataSource: "API_IMPORT",
    totalOrderQty: 2000,
    shippedQty: 2000,
    receivedQty: 500,
    totalPrice: 40000.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-28T09:00:00Z",
    updated: "2024-02-02T14:00:00Z",
    expectedArrivalDate: "2024-02-01",
    purchaseOrderDate: "2024-01-28",
    toCity: "New York",
    toState: "NY",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Heavy load",
    itemCount: 50,
    exceptions: [],
    sentToSupplier: true,
  },
  {
    id: "11",
    orderNo: "PO202403150011",
    originalPoNo: "EXT-PO-2024-011",
    prNos: ["PR202401270001"],
    referenceNo: "REF202403150011",
    supplierName: "Tech Giants",
    supplierNo: "SUP011",
    destination: "West Fulfillment Center - Seattle",
    warehouseName: "West FC",
    status: POStatus.PARTIAL_RECEIPT,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.PARTIAL_RECEIVED,
    dataSource: "MANUAL",
    totalOrderQty: 1000,
    shippedQty: 1000,
    receivedQty: 400,
    totalPrice: 25000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-25T08:30:00Z",
    updated: "2024-01-31T16:00:00Z",
    expectedArrivalDate: "2024-01-30",
    purchaseOrderDate: "2024-01-25",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "Partial delivery allowed",
    itemCount: 20,
    exceptions: [],
    sentToSupplier: true,
  },
  {
    id: "12",
    orderNo: "PO202403150012",
    originalPoNo: "EXT-PO-2024-012",
    prNos: ["PR202401280001"],
    referenceNo: "REF202403150012",
    supplierName: "Office Supplies Inc.",
    supplierNo: "SUP012",
    destination: "Central Warehouse - Chicago",
    warehouseName: "Central WH",
    status: POStatus.COMPLETED,
    shippingStatus: ShippingStatus.ARRIVED,
    receivingStatus: ReceivingStatus.FULLY_RECEIVED,
    dataSource: "PR_CONVERSION",
    totalOrderQty: 500,
    shippedQty: 500,
    receivedQty: 500,
    totalPrice: 10000.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-15T11:00:00Z",
    updated: "2024-01-25T14:00:00Z",
    expectedArrivalDate: "2024-01-24",
    purchaseOrderDate: "2024-01-15",
    toCity: "Chicago",
    toState: "IL",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "FedEx",
    shippingNotes: "",
    itemCount: 15,
    exceptions: [],
    sentToSupplier: true,
  },
  {
    id: "13",
    orderNo: "PO202403150013",
    originalPoNo: "EXT-PO-2024-013",
    prNos: ["PR202401290001"],
    referenceNo: "REF202403150013",
    supplierName: "Cancel Express",
    supplierNo: "SUP013",
    destination: "South Warehouse - Miami",
    warehouseName: "South WH",
    status: POStatus.CANCELLED,
    shippingStatus: null,
    receivingStatus: null,
    dataSource: "MANUAL",
    totalOrderQty: 200,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 4000.00,
    currency: "USD",
    asnCount: 0,
    created: "2024-01-30T09:00:00Z",
    updated: "2024-01-31T10:00:00Z",
    expectedArrivalDate: "2024-02-10",
    purchaseOrderDate: "2024-01-30",
    toCity: "Miami",
    toState: "FL",
    toCountry: "USA",
    shippingService: "",
    shippingCarrier: "",
    shippingNotes: "Cancelled by user",
    itemCount: 4,
    exceptions: [],
    sentToSupplier: false,
  },
]

// 仓库映射 - 用于判断仓库类型
const warehouseMap: Record<string, { id: string; name: string; type: "LOCAL_WAREHOUSE" | "THIRD_PARTY" }> = {
  "Main Warehouse": { id: "WH001", name: "Main Warehouse - Los Angeles", type: "LOCAL_WAREHOUSE" },
  "East DC": { id: "WH002", name: "East Distribution Center - New York", type: "THIRD_PARTY" },
  "West FC": { id: "WH003", name: "West Fulfillment Center - Seattle", type: "LOCAL_WAREHOUSE" },
  "Central WH": { id: "WH004", name: "Central Warehouse - Chicago", type: "THIRD_PARTY" },
  "South WH": { id: "WH005", name: "South Warehouse - Miami", type: "THIRD_PARTY" },
  "North WH": { id: "WH006", name: "North Warehouse - Boston", type: "THIRD_PARTY" },
}

// 状态配置将在组件内部使用 t() 函数动态获取标签

export default function POPage() {
  const { t } = useI18n()
  const router = useRouter()
  const sidebarItems = createPurchaseSidebarItems(t)
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [advancedSearchFilters, setAdvancedSearchFilters] = React.useState<any[]>([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<PurchaseOrder[]>(mockPOs)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [showLocalWarehouseReceiptDialog, setShowLocalWarehouseReceiptDialog] = React.useState(false)
  const [currentPOForReceipt, setCurrentPOForReceipt] = React.useState<PurchaseOrder | null>(null)
  const [showSendDialog, setShowSendDialog] = React.useState(false)
  const [currentPOForSend, setCurrentPOForSend] = React.useState<PurchaseOrder | null>(null)

  // ─── Import PO Feature ──────────────────────────────────────────────
  const [showImportPODialog, setShowImportPODialog] = React.useState(false)
  const [importPOLoading, setImportPOLoading] = React.useState(false)
  const importPOFileInputRef = React.useRef<HTMLInputElement>(null)

  // Parsed row type for import preview
  // Columns align with create/page.tsx form fields:
  // PO Header: purchaseType, priority, supplierName, supplierCode, warehouse, expectedDeliveryDate, latestShippingTime, shippingMethod, incoterm, notes
  // Line: skuCode, productName, specifications, quantity, uom, currency, unitPrice, taxRate, lineNotes
  type ImportedPORow = {
    _rowIndex: number
    _errors: string[]
    // PO Header fields
    purchaseType: string
    priority: string
    supplierName: string
    supplierCode: string
    warehouse: string
    expectedDeliveryDate: string
    latestShippingTime: string
    shippingMethod: string
    incoterm: string
    poNotes: string
    // Line item fields
    skuCode: string
    productName: string
    specifications: string
    quantity: number
    uom: string
    currency: string
    unitPrice: number
    taxRate: number
    lineNotes: string
  }

  const [importPORows, setImportPORows] = React.useState<ImportedPORow[]>([])

  // Group rows into PO previews: same purchaseType + supplierName + warehouse + expectedDeliveryDate = one PO
  type POPreview = {
    groupKey: string
    purchaseType: string
    priority: string
    supplierName: string
    supplierCode: string
    warehouse: string
    expectedDeliveryDate: string
    latestShippingTime: string
    shippingMethod: string
    incoterm: string
    poNotes: string
    lines: ImportedPORow[]
    hasErrors: boolean
  }

  const importPOPreviews = React.useMemo<POPreview[]>(() => {
    const groups: Record<string, ImportedPORow[]> = {}
    importPORows.forEach(row => {
      const key = `${row.purchaseType}||${row.supplierName}||${row.warehouse}||${row.expectedDeliveryDate}`
      if (!groups[key]) groups[key] = []
      groups[key].push(row)
    })
    return Object.entries(groups).map(([key, lines]) => ({
      groupKey: key,
      purchaseType: lines[0].purchaseType,
      priority: lines[0].priority,
      supplierName: lines[0].supplierName,
      supplierCode: lines[0].supplierCode,
      warehouse: lines[0].warehouse,
      expectedDeliveryDate: lines[0].expectedDeliveryDate,
      latestShippingTime: lines[0].latestShippingTime,
      shippingMethod: lines[0].shippingMethod,
      incoterm: lines[0].incoterm,
      poNotes: lines[0].poNotes,
      lines,
      hasErrors: lines.some(l => l._errors.length > 0),
    }))
  }, [importPORows])

  // Download PO import template — columns aligned to create/page.tsx form
  const handleDownloadPOTemplate = () => {
    // Column order: PO Header fields | Line item fields
    const headers = [
      // ── PO Header（每行须填写，相同组合视为同一张 PO）──
      '采购类型* (NORMAL/DIRECT/FACTORY_DIRECT)',
      '优先级* (NORMAL/URGENT/EMERGENCY)',
      '供应商名称*',
      '供应商编号',
      '目标仓库*',
      '预计到货日期* (YYYY-MM-DD)',
      '最晚发货时间 (YYYY-MM-DD)',
      '运输方式 (AIR/SEA/LAND/EXPRESS)',
      '贸易术语 (FOB/CIF/EXW/DAP)',
      'PO 备注',
      // ── 产品明细（每行一个产品）──
      'SKU Code*',
      '产品名称*',
      '规格',
      '数量*',
      '单位* (PCS/SET/BOX/KG)',
      '币种 (USD/CNY/EUR)',
      '单价*',
      '税率(%) ',
      '行备注',
    ]
    const examples = [
      // 示例：两个产品 → 同一张 PO（供应商+仓库+日期相同）
      ['NORMAL', 'NORMAL', 'ABC Suppliers Inc.', 'SUP001', 'Main Warehouse', '2024-04-30', '2024-04-20', 'SEA', 'FOB', '', 'SKU-001', 'iPhone 15 Pro', '256GB 黑色', '100', 'PCS', 'USD', '999.00', '13', 'Rush order'],
      ['NORMAL', 'NORMAL', 'ABC Suppliers Inc.', 'SUP001', 'Main Warehouse', '2024-04-30', '2024-04-20', 'SEA', 'FOB', '', 'SKU-002', 'MacBook Pro 14"', 'M3 Pro 512GB', '50', 'PCS', 'USD', '1999.00', '13', ''],
      // 示例：不同供应商/仓库/日期 → 另一张 PO
      ['DIRECT', 'URGENT', 'Global Trading Co.', 'SUP002', 'East DC', '2024-05-15', '2024-05-05', 'AIR', 'CIF', '加急补货', 'SKU-003', 'AirPods Pro', '2nd Gen USB-C', '200', 'PCS', 'USD', '249.00', '13', ''],
    ]
    const csvContent = [
      headers.join(','),
      ...examples.map(row => row.map(c => `"${c}"`).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'po_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('模板下载成功', {
      description: '相同「采购类型+供应商+仓库+预计到货日期」的行将合并为一张 PO'
    })
  }

  // Parse CSV and open import dialog
  const handleImportPOFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      toast.error('格式不支持', { description: '请上传 .csv 文件' })
      return
    }
    setImportPOLoading(true)

    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let cur = ''
      let inQ = false
      for (const ch of line) {
        if (ch === '"') { inQ = !inQ }
        else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = '' }
        else cur += ch
      }
      result.push(cur.trim())
      return result
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = ((e.target?.result as string) || '').replace(/^\uFEFF/, '')
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        if (lines.length < 2) {
          toast.error('文件为空', { description: '至少需要 1 行数据' })
          setImportPOLoading(false)
          return
        }

        const dataLines = lines.slice(1)
        const parsed = dataLines.map((line, idx): ImportedPORow => {
          const cols = parseCSVLine(line)
          const errors: string[] = []

          // PO Header columns (0-9)
          const purchaseType = cols[0]?.toUpperCase() || ''
          const priority = cols[1]?.toUpperCase() || 'NORMAL'
          const supplierName = cols[2] || ''
          const supplierCode = cols[3] || ''
          const warehouse = cols[4] || ''
          const expectedDeliveryDate = cols[5] || ''
          const latestShippingTime = cols[6] || ''
          const shippingMethod = cols[7] || ''
          const incoterm = cols[8] || ''
          const poNotes = cols[9] || ''

          // Line item columns (10-18)
          const skuCode = cols[10] || ''
          const productName = cols[11] || ''
          const specifications = cols[12] || ''
          const quantityRaw = cols[13] || ''
          const uom = cols[14] || 'PCS'
          const currency = cols[15] || 'USD'
          const unitPriceRaw = cols[16] || ''
          const taxRateRaw = cols[17] || '13'
          const lineNotes = cols[18] || ''

          // Validation
          const validPurchaseTypes = ['NORMAL', 'DIRECT', 'FACTORY_DIRECT']
          if (!purchaseType || !validPurchaseTypes.includes(purchaseType))
            errors.push(`采购类型无效（须为 ${validPurchaseTypes.join('/')}）`)
          if (!supplierName) errors.push('供应商名称不能为空')
          if (!warehouse) errors.push('目标仓库不能为空')
          if (!expectedDeliveryDate || !/^\d{4}-\d{2}-\d{2}$/.test(expectedDeliveryDate))
            errors.push('预计到货日期格式错误（YYYY-MM-DD）')
          if (!skuCode) errors.push('SKU Code 不能为空')
          if (!productName) errors.push('产品名称不能为空')
          const quantity = parseInt(quantityRaw, 10)
          if (isNaN(quantity) || quantity <= 0) errors.push('数量必须为正整数')
          const unitPrice = parseFloat(unitPriceRaw)
          if (isNaN(unitPrice) || unitPrice < 0) errors.push('单价格式错误')
          const taxRate = parseFloat(taxRateRaw)

          return {
            _rowIndex: idx + 2,
            _errors: errors,
            purchaseType, priority, supplierName, supplierCode, warehouse,
            expectedDeliveryDate, latestShippingTime, shippingMethod, incoterm, poNotes,
            skuCode, productName, specifications,
            quantity: isNaN(quantity) ? 0 : quantity,
            uom, currency,
            unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
            taxRate: isNaN(taxRate) ? 13 : taxRate,
            lineNotes,
          }
        })

        setImportPORows(parsed)
        setShowImportPODialog(true)
      } catch {
        toast.error('解析失败', { description: '请使用下载的模板格式' })
      } finally {
        setImportPOLoading(false)
      }
    }
    reader.onerror = () => { toast.error('读取失败'); setImportPOLoading(false) }
    reader.readAsText(file, 'UTF-8')
  }

  // Confirm import: create PO records from valid groups
  const handleConfirmImportPO = () => {
    const validGroups = importPOPreviews.filter(g => !g.hasErrors)
    if (validGroups.length === 0) {
      toast.error('没有可导入的有效数据')
      return
    }

    const newPOs: PurchaseOrder[] = validGroups.map((group, idx) => {
      const totalQty = group.lines.reduce((s, l) => s + l.quantity, 0)
      const totalPrice = group.lines.reduce((s, l) => {
        const sub = l.quantity * l.unitPrice
        const tax = sub * (l.taxRate / 100)
        return s + sub + tax
      }, 0)
      // Use currency from first line (within one PO, currency should be same)
      const currency = group.lines[0]?.currency || 'USD'
      const now = new Date().toISOString()
      const poNo = `PO${new Date().getFullYear()}${String(Date.now()).slice(-8)}${idx}`
      return {
        id: `import-${Date.now()}-${idx}`,
        orderNo: poNo,
        originalPoNo: '',
        prNos: [],
        referenceNo: '',
        supplierName: group.supplierName,
        supplierNo: group.supplierCode,
        destination: group.warehouse,
        warehouseName: group.warehouse,
        status: POStatus.DRAFT,
        shippingStatus: null,
        receivingStatus: null,
        dataSource: 'API_IMPORT' as any,
        totalOrderQty: totalQty,
        shippedQty: 0,
        receivedQty: 0,
        totalPrice,
        currency,
        asnCount: 0,
        created: now,
        updated: now,
        expectedArrivalDate: group.expectedDeliveryDate,
        purchaseOrderDate: new Date().toISOString().split('T')[0],
        toCity: '', toState: '', toCountry: '',
        shippingService: group.shippingMethod,
        shippingCarrier: '',
        shippingNotes: group.poNotes,
        itemCount: group.lines.length,
        exceptions: [],
        sentToSupplier: false,
      }
    })

    setFilteredData(prev => [...newPOs, ...prev])
    setShowImportPODialog(false)
    setImportPORows([])

    const skippedCount = importPOPreviews.length - validGroups.length
    if (skippedCount > 0) {
      toast.warning(`导入完成（跳过 ${skippedCount} 张有误 PO）`, {
        description: `成功创建 ${newPOs.length} 张 PO 单据（DRAFT 状态）`
      })
    } else {
      toast.success(`导入成功`, { description: `已创建 ${newPOs.length} 张 PO 单据（DRAFT 状态）` })
    }
  }

  // Mock PO Line Items数据 - 实际应用中应该从API获取
  const mockPOLineItems: Record<string, Array<{
    id: string
    lineNo: number
    skuCode: string
    productName: string
    specifications: string
    quantity: number
    uom: string
    receivedQty: number
  }>> = {
    "1": [
      {
        id: "1-1",
        lineNo: 1,
        skuCode: "SKU001",
        productName: "iPhone 15 Pro",
        specifications: "256GB, Natural Titanium",
        quantity: 100,
        uom: "PCS",
        receivedQty: 0,
      },
      {
        id: "1-2",
        lineNo: 2,
        skuCode: "SKU002",
        productName: "MacBook Pro",
        specifications: "14-inch, M3 Pro, 512GB SSD",
        quantity: 50,
        uom: "PCS",
        receivedQty: 0,
      },
    ],
    "8": [
      {
        id: "8-1",
        lineNo: 1,
        skuCode: "SKU004",
        productName: "AirPods Pro",
        specifications: "2nd Generation, USB-C",
        quantity: 300,
        uom: "PCS",
        receivedQty: 0,
      },
      {
        id: "8-2",
        lineNo: 2,
        skuCode: "SKU005",
        productName: "Apple Watch Series 9",
        specifications: "45mm, GPS, Midnight",
        quantity: 150,
        uom: "PCS",
        receivedQty: 0,
      },
      {
        id: "8-3",
        lineNo: 3,
        skuCode: "SKU006",
        productName: "Magic Keyboard",
        specifications: "For iPad Pro 12.9-inch",
        quantity: 150,
        uom: "PCS",
        receivedQty: 0,
      },
    ],
  }

  // 将PurchaseOrder转换为弹窗需要的POInfo格式
  const convertPOToPOInfo = (po: PurchaseOrder) => {
    return {
      id: po.id,
      orderNo: po.orderNo,
      supplierName: po.supplierName,
      warehouseName: po.warehouseName,
      warehouseId: warehouseMap[po.warehouseName]?.id || "",
      lineItems: mockPOLineItems[po.id] || [],
    }
  }

  // 处理本地仓库收货确认
  const handleLocalWarehouseReceiptConfirm = (data: any) => {
    console.log("Local Warehouse Receipt Confirm:", data)
    // 实际应用中应该调用API完成收货
    // 成功提示已在弹窗内显示，这里不需要额外的提示
    // 刷新数据
    setShowLocalWarehouseReceiptDialog(false)
    setCurrentPOForReceipt(null)

    // 更新PO状态（模拟）
    setFilteredData(prev => prev.map(po => {
      if (po.id === data.poId) {
        const totalReceivedQty = data.items.reduce((sum: number, item: any) => sum + item.receivedQty, 0)
        const newReceivedQty = po.receivedQty + totalReceivedQty
        const isFullyReceived = newReceivedQty >= po.totalOrderQty

        return {
          ...po,
          receivedQty: newReceivedQty,
          status: isFullyReceived ? POStatus.CLOSED : POStatus.PARTIAL_RECEIPT,
          receivingStatus: isFullyReceived ? ReceivingStatus.RECEIVED : ReceivingStatus.PARTIAL_RECEIVED,
          updated: new Date().toISOString(),
        }
      }
      return po
    }))
  }

  // 处理发送PO邮件
  const handleSendPO = (emailData: any) => {
    console.log("Send PO Email:", emailData)

    // 更新PO状态，添加邮件历史记录
    if (currentPOForSend) {
      const newEmailRecord: EmailHistoryRecord = {
        id: `email-${Date.now()}`,
        sentDate: new Date().toISOString(),
        from: emailData.from,
        recipients: emailData.recipients,
        cc: emailData.cc,
        subject: emailData.subject,
        body: emailData.body,
        pdfTemplate: emailData.pdfTemplate || "standard",
        status: "SENT",
        sentBy: "Current User" // 实际应用中应该从用户上下文获取
      }

      setFilteredData(prev => prev.map(po => {
        if (po.id === currentPOForSend.id) {
          return {
            ...po,
            sentToSupplier: true,
            lastSentDate: new Date().toISOString(),
            emailHistory: [...(po.emailHistory || []), newEmailRecord],
            updated: new Date().toISOString(),
          }
        }
        return po
      }))
    }

    // 实际应用中应该调用API发送邮件
    // 成功提示已在弹窗内显示，这里不需要额外的提示
  }

  // 主状态配置（PO Status）- 使用设计系统颜色
  const statusConfig = {
    DRAFT: { label: t('DRAFT'), color: "text-text-secondary" },
    NEW: { label: t('NEW'), color: "text-text-secondary" },
    PROCESSING: { label: t('PROCESSING' as any), color: "text-primary" },
    IN_TRANSIT: { label: t('IN_TRANSIT'), color: "text-primary" },
    WAITING_FOR_RECEIVING: { label: t('WAITING_FOR_RECEIVING'), color: "text-primary" },
    RECEIVING: { label: t('RECEIVING'), color: "text-primary" },
    PARTIAL_RECEIPT: { label: t('PARTIAL_RECEIPT'), color: "text-warning" },
    COMPLETED: { label: t('COMPLETED' as any), color: "text-success" },
    CLOSED: { label: t('CLOSED'), color: "text-success" },
    CANCELLED: { label: t('CANCELLED'), color: "text-text-secondary" },
    EXCEPTION: { label: t('EXCEPTION'), color: "text-destructive" },
  }

  // 运输状态配置（Shipping Status）- 使用设计系统颜色
  const shippingStatusConfig = {
    NOT_SHIPPED: {
      label: t('NOT_SHIPPED'),
      color: "text-text-secondary",
      description: t('noASNCreated')
    },
    ASN_CREATED: {
      label: t('ASN_CREATED'),
      color: "text-primary",
      description: t('asnCreatedNotShipped')
    },
    SHIPPED: {
      label: t('SHIPPED'),
      color: "text-primary",
      description: t('asnMarkedShipped')
    },
    IN_TRANSIT: {
      label: t('IN_TRANSIT'),
      color: "text-primary",
      description: t('carrierEventInTransit')
    },
    ARRIVED_AT_WAREHOUSE: {
      label: t('ARRIVED_AT_WAREHOUSE'),
      color: "text-success",
      description: t('arrivedAtWarehouse')
    },
    SHIPMENT_CLOSED: {
      label: t('SHIPMENT_CLOSED'),
      color: "text-text-secondary",
      description: t('allASNCompleted')
    },
  }

  // 收货状态配置（Receiving Status）- 使用设计系统颜色
  const receivingStatusConfig = {
    NOT_RECEIVED: {
      label: t('NOT_RECEIVED'),
      color: "text-text-secondary",
      description: t('noReceiptRecords')
    },
    IN_RECEIVING: {
      label: t('IN_RECEIVING'),
      color: "text-primary",
      description: t('warehouseStartedReceiving')
    },
    PARTIALLY_RECEIVED: {
      label: t('PARTIALLY_RECEIVED'),
      color: "text-warning",
      description: t('partialLinesReceived')
    },
    FULLY_RECEIVED: {
      label: t('FULLY_RECEIVED'),
      color: "text-success",
      description: t('allLinesReceived')
    },
    OVER_RECEIVED: {
      label: t('OVER_RECEIVED'),
      color: "text-destructive",
      description: t('overReceivedAbnormal')
    },
  }

  // 来源配置
  const dataSourceConfig = {
    MANUAL: { label: t('MANUAL'), color: "text-text-secondary" },
    PR_CONVERSION: { label: t('PR_CONVERSION'), color: "text-text-secondary" },
    API_IMPORT: { label: t('API_IMPORT'), color: "text-text-secondary" },
  }

  // Define filter configurations with simplified status system
  const filterConfigs: FilterConfig[] = [
    // Independent batch filter fields for PO No., Original PO No., Reference No.
    {
      id: "orderNo",
      label: t('poNo'),
      type: "batch",
      placeholder: "PO202403150001\nPO202403150002\nPO202403150003",
    },
    {
      id: "originalPoNo",
      label: t('originalPoNo'),
      type: "batch",
      placeholder: "EXT-PO-2024-001\nEXT-PO-2024-002\nEXT-PO-2024-003",
    },
    {
      id: "referenceNo",
      label: t('referenceNo'),
      type: "batch",
      placeholder: "REF202403150001\nREF202403150002\nREF202403150003",
    },
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "draft", label: t('DRAFT'), value: POStatus.DRAFT },
        { id: "new", label: t('NEW'), value: POStatus.NEW },
        { id: "processing", label: t('PROCESSING' as any), value: POStatus.PROCESSING },
        { id: "in_transit", label: t('IN_TRANSIT'), value: POStatus.IN_TRANSIT },
        { id: "waiting_for_receiving", label: t('WAITING_FOR_RECEIVING'), value: POStatus.WAITING_FOR_RECEIVING },
        { id: "receiving", label: t('RECEIVING'), value: POStatus.RECEIVING },
        { id: "partial_receipt", label: t('PARTIAL_RECEIPT'), value: POStatus.PARTIAL_RECEIPT },
        { id: "completed", label: t('COMPLETED' as any), value: POStatus.COMPLETED },
        { id: "closed", label: t('CLOSED'), value: POStatus.CLOSED },
        { id: "cancelled", label: t('CANCELLED'), value: POStatus.CANCELLED },
        { id: "exception", label: t('EXCEPTION'), value: POStatus.EXCEPTION },
      ],
    },
    {
      id: "shippingStatus",
      label: t('shippingStatus'),
      type: "multiple",
      options: [
        { id: "shipped", label: t('SHIPPED'), value: ShippingStatus.SHIPPED },
        { id: "in_transit", label: t('IN_TRANSIT'), value: ShippingStatus.IN_TRANSIT },
        { id: "arrived", label: t('ARRIVED'), value: ShippingStatus.ARRIVED },
        { id: "shipping_exception", label: t('SHIPPING_EXCEPTION'), value: ShippingStatus.SHIPPING_EXCEPTION },
      ],
    },
    {
      id: "receivingStatus",
      label: t('receivingStatus'),
      type: "multiple",
      options: [
        { id: "not_received", label: t('NOT_RECEIVED'), value: ReceivingStatus.NOT_RECEIVED },
        { id: "partial_received", label: t('PARTIAL_RECEIVED'), value: ReceivingStatus.PARTIAL_RECEIVED },
        { id: "received", label: t('RECEIVED'), value: ReceivingStatus.RECEIVED },
      ],
    },
    {
      id: "supplier",
      label: t('supplierField'),
      type: "multiple",
      options: [
        { id: "abc", label: "ABC Suppliers Inc.", value: "ABC Suppliers Inc." },
        { id: "global", label: "Global Trading Co.", value: "Global Trading Co." },
        { id: "tech", label: "Tech Distributors Ltd.", value: "Tech Distributors Ltd." },
        { id: "premium", label: "Premium Goods Supply", value: "Premium Goods Supply" },
        { id: "reliable", label: "Reliable Parts Co.", value: "Reliable Parts Co." },
        { id: "quality", label: "Quality Components Ltd.", value: "Quality Components Ltd." },
      ],
    },
    {
      id: "warehouse",
      label: t('targetWarehouse'),
      type: "multiple",
      options: [
        { id: "la", label: "Los Angeles", value: "Los Angeles" },
        { id: "ny", label: "New York", value: "New York" },
        { id: "seattle", label: "Seattle", value: "Seattle" },
        { id: "chicago", label: "Chicago", value: "Chicago" },
        { id: "miami", label: "Miami", value: "Miami" },
        { id: "boston", label: "Boston", value: "Boston" },
      ],
    },
    {
      id: "dataSource",
      label: t('dataSource'),
      type: "multiple",
      options: [
        { id: "manual", label: t('MANUAL'), value: "MANUAL" },
        { id: "pr_conversion", label: t('PR_CONVERSION'), value: "PR_CONVERSION" },
        { id: "api_import", label: t('API_IMPORT'), value: "API_IMPORT" },
      ],
    },
  ]

  // Advanced search field configurations
  const advancedSearchFields: SearchField[] = [
    {
      id: "orderNo",
      label: t('poNo'),
      placeholder: "PO202403150001\nPO202403150002\nPO202403150003",
      type: "batch",
      maxItems: 100
    },
    {
      id: "originalPoNo",
      label: t('originalPoNo'),
      placeholder: "e.g., EXT-PO-2024-001"
    },
    {
      id: "prNos",
      label: t('prNos'),
      placeholder: "PR202401100001\nPR202401100002",
      type: "batch",
      maxItems: 100
    },
    { id: "referenceNo", label: t('referenceNo'), placeholder: "e.g., REF202403150001" },
    { id: "supplierName", label: t('supplierName'), placeholder: "e.g., ABC Suppliers Inc." },
    { id: "supplierNo", label: t('supplierNo'), placeholder: "e.g., SUP001" },
  ]

  // Calculate status counts based on simplified status system
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: mockPOs.length,
      [POStatus.DRAFT]: 0,
      [POStatus.NEW]: 0,
      [POStatus.PROCESSING]: 0,
      [POStatus.IN_TRANSIT]: 0,
      [POStatus.WAITING_FOR_RECEIVING]: 0,
      [POStatus.RECEIVING]: 0,
      [POStatus.PARTIAL_RECEIPT]: 0,
      [POStatus.COMPLETED]: 0,
      [POStatus.CLOSED]: 0,
      [POStatus.CANCELLED]: 0,
      [POStatus.EXCEPTION]: 0,
    }

    mockPOs.forEach(po => {
      counts[po.status] = (counts[po.status] || 0) + 1
    })
    return counts
  }, [])

  // Filter logic
  React.useEffect(() => {
    let filtered = mockPOs

    // Tab filter (status)
    if (activeTab === "PROCESSING") {
      filtered = filtered.filter(po => [
        POStatus.PROCESSING,
        POStatus.IN_TRANSIT,
        POStatus.WAITING_FOR_RECEIVING,
        POStatus.RECEIVING,
        POStatus.PARTIAL_RECEIPT
      ].includes(po.status))
    } else if (activeTab !== "all") {
      filtered = filtered.filter(po => po.status === activeTab)
    }

    // Simple search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase()
      filtered = filtered.filter(po =>
        po.orderNo.toLowerCase().includes(searchLower) ||
        po.originalPoNo.toLowerCase().includes(searchLower) ||
        po.referenceNo.toLowerCase().includes(searchLower) ||
        po.supplierName.toLowerCase().includes(searchLower) ||
        po.destination.toLowerCase().includes(searchLower) ||
        po.prNos.some(prNo => prNo.toLowerCase().includes(searchLower))
      )
    }

    // Advanced search filter
    if (Object.keys(advancedSearchValues).length > 0) {
      filtered = filtered.filter(po => {
        return Object.entries(advancedSearchValues).every(([key, value]) => {
          // 处理批量搜索（数组）
          if (Array.isArray(value)) {
            // 特殊处理：prNos字段本身就是数组
            if (key === 'prNos') {
              return po.prNos.some(prNo =>
                value.some(v => prNo.toLowerCase().includes(v.toLowerCase()))
              )
            }

            // 其他字段（如orderNo）
            const poValue = po[key as keyof PurchaseOrder]
            if (typeof poValue === 'string') {
              return value.some(v => poValue.toLowerCase().includes(v.toLowerCase()))
            }
            return false
          }

          // 处理普通搜索（字符串）
          if (typeof value === 'string') {
            // 特殊处理：prNos字段本身就是数组
            if (key === 'prNos') {
              return po.prNos.some(prNo => prNo.toLowerCase().includes(value.toLowerCase()))
            }

            const poValue = po[key as keyof PurchaseOrder]
            if (typeof poValue === 'string') {
              return poValue.toLowerCase().includes(value.toLowerCase())
            }
          }
          return false
        })
      })
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      if (filter.filterId === "orderNo") {
        // PO No. batch filter - split by comma and match any
        const values = filter.optionValue.split(',').map(v => v.trim().toLowerCase())
        filtered = filtered.filter(po =>
          values.some(val => po.orderNo.toLowerCase().includes(val))
        )
      } else if (filter.filterId === "originalPoNo") {
        // Original PO No. batch filter - split by comma and match any
        const values = filter.optionValue.split(',').map(v => v.trim().toLowerCase())
        filtered = filtered.filter(po =>
          values.some(val => po.originalPoNo.toLowerCase().includes(val))
        )
      } else if (filter.filterId === "referenceNo") {
        // Reference No. batch filter - split by comma and match any
        const values = filter.optionValue.split(',').map(v => v.trim().toLowerCase())
        filtered = filtered.filter(po =>
          values.some(val => po.referenceNo.toLowerCase().includes(val))
        )
      } else if (filter.filterId === "status") {
        filtered = filtered.filter(po => po.status === filter.optionValue)
      } else if (filter.filterId === "shippingStatus") {
        filtered = filtered.filter(po => po.shippingStatus === filter.optionValue)
      } else if (filter.filterId === "receivingStatus") {
        filtered = filtered.filter(po => po.receivingStatus === filter.optionValue)
      } else if (filter.filterId === "supplier") {
        filtered = filtered.filter(po => po.supplierName === filter.optionValue)
      } else if (filter.filterId === "warehouse") {
        filtered = filtered.filter(po => po.toCity === filter.optionValue)
      } else if (filter.filterId === "dataSource") {
        filtered = filtered.filter(po => po.dataSource === filter.optionValue)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchValue, activeFilters, advancedSearchValues, activeTab])

  // Define columns with default visibility based on optimized PO system
  const allColumns: Column<PurchaseOrder>[] = [
    {
      id: "orderNo",
      header: t('poNo'),
      accessorKey: "orderNo",
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <OrderNumberCell
          orderNumber={row.orderNo}
          onClick={() => router.push(`/po-detail-v2`)}
        />
      ),
    },
    {
      id: "status",
      header: t('status'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        <StatusBadge status={row.status} language="cn" />
      ),
    },
    {
      id: "originalPoNo",
      header: t('originalPoNo'),
      accessorKey: "originalPoNo",
      width: "160px",
      defaultVisible: true,
      cell: (row) => (
        <OrderNumberCell
          orderNumber={row.originalPoNo}
          className="text-muted-foreground"
        />
      ),
    },
    {
      id: "referenceNo",
      header: t('referenceNo'),
      accessorKey: "referenceNo",
      width: "150px",
      defaultVisible: true,
    },
    {
      id: "shippingStatus",
      header: t('shippingStatus'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        row.shippingStatus ? (
          <StatusBadge status={row.shippingStatus} language="cn" />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      ),
    },
    {
      id: "receivingStatus",
      header: t('receivingStatus'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        row.receivingStatus ? (
          <StatusBadge status={row.receivingStatus} language="cn" />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )
      ),
    },
    {
      id: "supplierName",
      header: t('supplierName'),
      accessorKey: "supplierName",
      width: "200px",
      defaultVisible: true,
    },
    {
      id: "warehouseName",
      header: t('warehouse'),
      accessorKey: "warehouseName",
      width: "180px",
      defaultVisible: true,
      cell: (row) => {
        const warehouseInfo = warehouseMap[row.warehouseName] || { type: "THIRD_PARTY" as const }
        if (warehouseInfo.type === "LOCAL_WAREHOUSE") {
          return t('localWarehouse') || "本地仓库"
        }
        return row.warehouseName
      },
    },
    {
      id: "totalOrderQty",
      header: t('totalOrderQty'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => row.totalOrderQty.toLocaleString(),
    },
    {
      id: "shippedQty",
      header: t('shippedQty'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => (
        <div className="text-center">
          <div className="font-medium">{row.shippedQty.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {row.totalOrderQty > 0 ? `${((row.shippedQty / row.totalOrderQty) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>
      ),
    },
    {
      id: "receivedQty",
      header: t('receivedQty'),
      width: "120px",
      defaultVisible: false,
      cell: (row) => (
        <div className="text-center">
          <div className="font-medium">{row.receivedQty.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">
            {row.totalOrderQty > 0 ? `${((row.receivedQty / row.totalOrderQty) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>
      ),
    },

    {
      id: "asnCount",
      header: t('asnCount'),
      width: "100px",
      defaultVisible: false,
      cell: (row) => (
        <div className="text-center text-text-secondary text-sm">
          {row.asnCount}
        </div>
      ),
    },
    {
      id: "dataSource",
      header: t('dataSource'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => {
        const config = dataSourceConfig[row.dataSource]
        return (
          <span className={`${config.color} text-sm`}>
            {config.label}
          </span>
        )
      },
    },
    {
      id: "sentToSupplier",
      header: "Sent to Supplier",
      width: "120px",
      defaultVisible: true,
      cell: (row) => (
        <div className="flex items-center justify-center">
          {row.sentToSupplier ? (
            <div className="flex flex-col items-center gap-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700">
                <Mail className="h-3 w-3 mr-1" />
                Sent
              </Badge>
              {row.lastSentDate && (
                <span className="text-xs text-muted-foreground">
                  {new Date(row.lastSentDate).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Not Sent
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "totalPrice",
      header: t('totalPrice'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-right font-medium">
          {row.currency} {row.totalPrice.toLocaleString()}
        </div>
      ),
    },
    {
      id: "created",
      header: t('created'),
      width: "180px",
      defaultVisible: true,
      cell: (row) => new Date(row.created).toLocaleString(),
    },
    {
      id: "expectedArrivalDate",
      header: t('expectedArrivalDate'),
      accessorKey: "expectedArrivalDate",
      width: "180px",
      defaultVisible: true,
      cell: (row) => new Date(row.expectedArrivalDate).toLocaleString(),
    },
    {
      id: "prNos",
      header: t('prNos'),
      width: "200px",
      defaultVisible: false,
      cell: (row) => (
        <div className="flex flex-wrap gap-xs text-xs text-text-secondary">
          {row.prNos.slice(0, 2).map((prNo, index) => (
            <span key={index}>
              {prNo}
            </span>
          ))}
          {row.prNos.length > 2 && (
            <span>
              +{row.prNos.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "exceptions",
      header: t('exceptions'),
      width: "100px",
      defaultVisible: false,
      cell: (row) => (
        row.exceptions.length > 0 ? (
          <div className="flex items-center gap-xs text-destructive text-xs">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{row.exceptions.length}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      id: "shippingCarrier",
      header: t('shippingCarrier'),
      accessorKey: "shippingCarrier",
      width: "150px",
      defaultVisible: false,
    },
    {
      id: "toCity",
      header: t('toCity'),
      accessorKey: "toCity",
      width: "120px",
      defaultVisible: false,
    },
    {
      id: "toState",
      header: t('toState'),
      accessorKey: "toState",
      width: "100px",
      defaultVisible: false,
    },
    {
      id: "toCountry",
      header: t('toCountry'),
      accessorKey: "toCountry",
      width: "120px",
      defaultVisible: false,
    },
    {
      id: "updated",
      header: t('updated'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => new Date(row.updated).toLocaleString(),
    },
    {
      id: "shippingService",
      header: t('shippingService'),
      accessorKey: "shippingService",
      width: "150px",
      defaultVisible: false,
    },
    {
      id: "shippingNotes",
      header: t('shippingNotes'),
      accessorKey: "shippingNotes",
      width: "200px",
      defaultVisible: false,
    },
    {
      id: "purchaseOrderDate",
      header: t('purchaseOrderDate'),
      accessorKey: "purchaseOrderDate",
      width: "180px",
      defaultVisible: false,
    },
    {
      id: "actions",
      header: t('actions'),
      width: "80px",
      defaultVisible: true,
      cell: (row) => {
        // 判断仓库类型
        const warehouseInfo = warehouseMap[row.warehouseName] || { type: "THIRD_PARTY" as const }
        const isLocalWarehouse = warehouseInfo.type === "LOCAL_WAREHOUSE"

        // Define available actions based on status
        const getAvailableActions = () => {
          switch (row.status) {
            case POStatus.NEW:
              return [
                {
                  label: t('send'), action: () => {
                    setCurrentPOForSend(row)
                    setShowSendDialog(true)
                  }, variant: undefined, disabled: undefined
                },
                { label: t('createShipment'), action: () => router.push(`/purchase/shipments/create?poId=${row.id}`), variant: undefined, disabled: undefined },
                {
                  label: t('createReceipt'), action: () => {
                    // 本地仓库：打开弹窗，一步完成入库和收货
                    // 第三方仓库：跳转到入库请求创建页面
                    if (isLocalWarehouse) {
                      setCurrentPOForReceipt(row)
                      setShowLocalWarehouseReceiptDialog(true)
                    } else {
                      router.push(`/purchase/receipts/create?poId=${row.id}`)
                    }
                  }, variant: undefined, disabled: undefined
                },
                { label: t('cancel'), action: () => console.log("Cancel PO", row.orderNo), variant: "destructive", disabled: undefined },
              ]
            case POStatus.PROCESSING:
            case POStatus.IN_TRANSIT:
            case POStatus.WAITING_FOR_RECEIVING:
            case POStatus.RECEIVING:
            case POStatus.PARTIAL_RECEIPT:
              // 运输中和收货相关状态的操作 - 根据实际状态动态判断
              const processingActions: { label: string; action: () => void; variant?: string; disabled?: boolean }[] = [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
              ]

              // 未发送邮件 -> 可以发送
              if (!row.sentToSupplier) {
                processingActions.push({
                  label: t('send'),
                  action: () => {
                    setCurrentPOForSend(row)
                    setShowSendDialog(true)
                  },
                  variant: undefined,
                  disabled: undefined
                })
              }

              // 未全部发运 (shippedQty < totalOrderQty) -> 可以创建发运
              if (row.shippedQty < row.totalOrderQty) {
                processingActions.push({
                  label: t('createShipment'),
                  action: () => router.push(`/purchase/shipments/create?poId=${row.id}`),
                  variant: undefined,
                  disabled: undefined
                })
              }

              // 物流状态不是已到达 -> 可以标记到达
              if (row.shippingStatus && row.shippingStatus !== ShippingStatus.ARRIVED) {
                processingActions.push({
                  label: t('markArrived'),
                  action: () => {
                    setFilteredData(prev => prev.map(po => {
                      if (po.id === row.id) {
                        return {
                          ...po,
                          shippingStatus: ShippingStatus.ARRIVED,
                          updated: new Date().toISOString(),
                        }
                      }
                      return po
                    }))
                    console.log("Mark arrived", row.orderNo)
                  },
                  variant: undefined,
                  disabled: undefined
                })
              }

              // 未全部收货 (receivedQty < totalOrderQty) -> 可以创建收货/入库单
              if (row.receivedQty < row.totalOrderQty) {
                processingActions.push({
                  label: t('createReceipt'),
                  action: () => {
                    if (isLocalWarehouse) {
                      setCurrentPOForReceipt(row)
                      setShowLocalWarehouseReceiptDialog(true)
                    } else {
                      router.push(`/purchase/receipts/create?poId=${row.id}`)
                    }
                  },
                  variant: undefined,
                  disabled: undefined
                })
              }

              return processingActions
            case POStatus.CLOSED:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('copy'), action: () => console.log("Copy as new PO", row.orderNo), variant: undefined, disabled: undefined },
              ]
            case POStatus.CANCELLED:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('reopen'), action: () => console.log("Reopen PO", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('copy'), action: () => console.log("Copy as new PO", row.orderNo), variant: undefined, disabled: undefined },
              ]
            case POStatus.EXCEPTION:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('reopen'), action: () => console.log("Reopen PO", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('copy'), action: () => console.log("Copy as new PO", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('viewReason'), action: () => console.log("View exception reason", row.orderNo), variant: undefined, disabled: undefined },
              ]
            default:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
              ]
          }
        }

        const actions = getAvailableActions()

        if (actions.length === 0) {
          return null
        }

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4 text-text-secondary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                {actions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={action.action}
                    disabled={action.disabled}
                    className={`text-sm ${action.variant === "destructive"
                      ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                      : ""
                      }`}
                  >
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
    label: col.header,
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

  // Get selected rows data and their statuses
  const selectedRowsData = React.useMemo(() => {
    return filteredData.filter(row => selectedRows.includes(row.id))
  }, [filteredData, selectedRows])

  const selectedStatuses = React.useMemo(() => {
    return [...new Set(selectedRowsData.map(row => row.status))]
  }, [selectedRowsData])

  // Determine available batch actions based on selected statuses
  const availableBatchActions = React.useMemo(() => {
    if (selectedRows.length === 0) return []

    // If all selected rows have the same status
    if (selectedStatuses.length === 1) {
      const status = selectedStatuses[0]
      switch (status) {
        case POStatus.NEW:
          return [
            { label: t('batchSend'), action: () => console.log("Batch send", selectedRows) },
            { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment", selectedRows) },
            { label: t('batchCreateReceipt'), action: () => console.log("Batch create receipt", selectedRows) },
            { label: t('batchCancel'), action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
          ]
        case POStatus.IN_TRANSIT:
        case POStatus.WAITING_FOR_RECEIVING:
        case POStatus.RECEIVING:
        case POStatus.PARTIAL_RECEIPT:
          return [
            { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment", selectedRows) },
            {
              label: t('batchMarkArrived'), action: () => {
                // 批量标记送达：更新选中PO的运输状态
                setFilteredData(prev => prev.map(po => {
                  if (selectedRows.includes(po.id) &&
                    (po.status === POStatus.IN_TRANSIT ||
                      po.status === POStatus.WAITING_FOR_RECEIVING ||
                      po.status === POStatus.RECEIVING ||
                      po.status === POStatus.PARTIAL_RECEIPT)) {
                    return {
                      ...po,
                      shippingStatus: ShippingStatus.ARRIVED,
                      updated: new Date().toISOString(),
                    }
                  }
                  return po
                }))
                setSelectedRows([])
                console.log("Batch mark arrived", selectedRows)
              }
            },
            { label: t('batchCreateReceipt'), action: () => console.log("Batch create receipt", selectedRows) },
          ]
        case POStatus.CANCELLED:
          return [
            { label: t('batchReopen'), action: () => console.log("Batch reopen", selectedRows) },
          ]
        case POStatus.EXCEPTION:
          return [
            { label: t('batchReopen'), action: () => console.log("Batch reopen", selectedRows) },
          ]
        default:
          return []
      }
    }

    // If selected rows have mixed statuses, only show common actions
    return [
      { label: t('batchExport'), action: () => console.log("Batch export", selectedRows) },
    ]
  }, [selectedRows, selectedStatuses, t])

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{t('purchaseOrders')}</h1>
            <p className="text-sm text-text-secondary mt-sm">
              {t('managePurchaseOrders')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Export", selectedRows.length > 0 ? selectedRows : "all")}
              className="text-sm font-normal"
            >
              <Download className="mr-2 h-4 w-4" />
              {selectedRows.length > 0 ? `${t('export')} (${selectedRows.length})` : t('export')}
            </Button>

            {/* New PO Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('newPO')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/purchase/po/create")}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {t('createManuallyPO')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => importPOFileInputRef.current?.click()} disabled={importPOLoading}>
                  <Upload className="mr-2 h-4 w-4" />
                  {importPOLoading ? '解析中...' : t('importFromFilePO')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDownloadPOTemplate}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadTemplatePO')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Simplified Status Tabs: All, New, Processing, Closed, Cancelled, Exception */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === "all" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.DRAFT}>
              {t('DRAFT')}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === POStatus.DRAFT && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts[POStatus.DRAFT] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.NEW}>
              {t('NEW')}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === POStatus.NEW && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts[POStatus.NEW] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="PROCESSING">
              Processing
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === "PROCESSING" && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {(statusCounts[POStatus.PROCESSING] || 0) +
                  (statusCounts[POStatus.IN_TRANSIT] || 0) +
                  (statusCounts[POStatus.WAITING_FOR_RECEIVING] || 0) +
                  (statusCounts[POStatus.RECEIVING] || 0) +
                  (statusCounts[POStatus.PARTIAL_RECEIPT] || 0)}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.CLOSED}>
              {t('CLOSED')}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === POStatus.CLOSED && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts[POStatus.CLOSED] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.CANCELLED}>
              {t('CANCELLED')}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === POStatus.CANCELLED && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts[POStatus.CANCELLED] || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.EXCEPTION}>
              {t('EXCEPTION')}
              <Badge
                variant="secondary"
                className={cn(
                  "ml-2",
                  activeTab === POStatus.EXCEPTION && "bg-primary-foreground/20 text-primary-foreground border-0"
                )}
              >
                {statusCounts[POStatus.EXCEPTION] || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <FilterBar
          searchPlaceholder={t('searchPOPlaceholder')}
          onSearchChange={setSearchValue}
          filters={filterConfigs}
          onFiltersChange={setActiveFilters}
          columns={columnConfigs}
          onColumnsChange={handleColumnsChange}
          advancedSearchFields={advancedSearchFields}
          onAdvancedSearch={(values, filters) => {
            setAdvancedSearchValues(values)
            setAdvancedSearchFilters(filters || [])
          }}
        />

        {/* Batch Operations Bar */}
        {selectedRows.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {t('selected')} <span className="text-primary">{selectedRows.length}</span> {t('items')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRows([])}
                    className="h-8 text-xs"
                  >
                    {t('clearSelection')}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => console.log("Batch export", selectedRows)}
                  >
                    <Download className="h-4 w-4" />
                    {t('batchExport')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => console.log("Batch print", selectedRows)}
                  >
                    <FileText className="h-4 w-4" />
                    批量打印
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        {t('moreActions')}
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => console.log("Batch cancel", selectedRows)}>
                        <X className="mr-2 h-4 w-4" />
                        {t('batchCancel')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => console.log("Batch close", selectedRows)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        批量关闭
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => console.log("Batch delete", selectedRows)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        {t('batchDelete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              onRowClick={(row) => console.log("Row clicked:", row)}
              hideColumnControl={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* 本地仓库收货弹窗 */}
      {currentPOForReceipt && (
        <LocalWarehouseReceiptDialog
          open={showLocalWarehouseReceiptDialog}
          onOpenChange={setShowLocalWarehouseReceiptDialog}
          po={convertPOToPOInfo(currentPOForReceipt)}
          onConfirm={handleLocalWarehouseReceiptConfirm}
        />
      )}

      {/* PO发送邮件弹窗 */}
      {currentPOForSend && (
        <POSendDialog
          open={showSendDialog}
          onOpenChange={setShowSendDialog}
          poData={{
            orderNo: currentPOForSend.orderNo,
            supplierName: currentPOForSend.supplierName,
            supplierEmail: `${currentPOForSend.supplierNo.toLowerCase()}@supplier.com`, // Mock email
            totalAmount: currentPOForSend.totalPrice,
            currency: currentPOForSend.currency,
            itemCount: currentPOForSend.itemCount,
          }}
          onSend={handleSendPO}
        />
      )}

      {/* Hidden file input for PO import */}
      <input
        ref={importPOFileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleImportPOFileChange}
      />

      {/* Import PO Preview Dialog */}
      <Dialog open={showImportPODialog} onOpenChange={(open) => {
        if (!open) { setShowImportPODialog(false); setImportPORows([]) }
      }}>
        <DialogContent className="max-w-5xl max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden">
          {/* Dialog Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Upload className="h-5 w-5 text-primary" />
              导入 PO 预览
            </DialogTitle>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-muted-foreground">
                共解析 <span className="font-semibold text-foreground">{importPORows.length}</span> 行，将生成
                <span className="font-semibold text-foreground mx-1">{importPOPreviews.length}</span> 张 PO
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {importPOPreviews.filter(g => !g.hasErrors).length} 张可导入
              </span>
              {importPOPreviews.some(g => g.hasErrors) && (
                <span className="flex items-center gap-1 text-destructive font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {importPOPreviews.filter(g => g.hasErrors).length} 张有误（将跳过）
                </span>
              )}
            </div>
          </DialogHeader>

          {/* PO Groups */}
          <div className="overflow-auto flex-1 px-6 py-4 space-y-4">
            {importPOPreviews.map((group, gIdx) => (
              <div
                key={group.groupKey}
                className={`rounded-xl border overflow-hidden shadow-sm ${group.hasErrors
                  ? 'border-destructive/40 bg-destructive/5'
                  : 'border-border bg-card'
                  }`}
              >
                {/* PO Group Header */}
                <div className={`px-4 py-3 flex items-center justify-between ${group.hasErrors ? 'bg-destructive/10' : 'bg-muted/40'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${group.hasErrors ? 'bg-destructive/20' : 'bg-emerald-100'
                      }`}>
                      {group.hasErrors
                        ? <X className="h-3.5 w-3.5 text-destructive" />
                        : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <span>PO {gIdx + 1}</span>
                        <span className="text-muted-foreground font-normal">•</span>
                        <span>{group.supplierName}</span>
                        {group.supplierCode && (
                          <span className="text-xs text-muted-foreground font-mono">({group.supplierCode})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>📦 {group.warehouse}</span>
                        <span>📅 预计到货：{group.expectedDeliveryDate}</span>
                        <span>🚢 {group.shippingMethod || '—'} {group.incoterm ? `· ${group.incoterm}` : ''}</span>
                        <span>📋 {group.lines.length} 个产品明细</span>
                      </div>
                    </div>
                  </div>
                  {group.hasErrors && (
                    <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md px-2 py-1">
                      含错误行，将跳过整张 PO
                    </span>
                  )}
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/20 text-xs">
                        <TableHead className="text-xs w-[50px]">行号</TableHead>
                        <TableHead className="text-xs w-[50px]">状态</TableHead>
                        <TableHead className="text-xs">SKU Code</TableHead>
                        <TableHead className="text-xs">产品名称</TableHead>
                        <TableHead className="text-xs">规格</TableHead>
                        <TableHead className="text-xs w-[70px] text-right">数量</TableHead>
                        <TableHead className="text-xs w-[60px]">单位</TableHead>
                        <TableHead className="text-xs w-[90px] text-right">单价</TableHead>
                        <TableHead className="text-xs w-[80px] text-right">税率(%)</TableHead>
                        <TableHead className="text-xs w-[110px] text-right">含税行金额</TableHead>
                        <TableHead className="text-xs">备注 / 错误</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.lines.map((line, lIdx) => {
                        const hasErr = line._errors.length > 0
                        const sub = line.quantity * line.unitPrice
                        const lineAmt = sub * (1 + line.taxRate / 100)
                        return (
                          <TableRow
                            key={lIdx}
                            className={hasErr ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/20'}
                          >
                            <TableCell className="text-xs text-muted-foreground">{line._rowIndex}</TableCell>
                            <TableCell>
                              <div className={`h-4 w-4 rounded-full flex items-center justify-center mx-auto ${hasErr ? 'bg-destructive/15' : 'bg-emerald-100'
                                }`}>
                                {hasErr
                                  ? <X className="h-2.5 w-2.5 text-destructive" />
                                  : <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                                }
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-mono">{line.skuCode || <span className="italic text-destructive">（空）</span>}</TableCell>
                            <TableCell className="text-xs">{line.productName || <span className="italic text-destructive">（空）</span>}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{line.specifications || '—'}</TableCell>
                            <TableCell className="text-xs text-right">{line.quantity}</TableCell>
                            <TableCell className="text-xs">{line.uom}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{line.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-xs text-right">{line.taxRate}%</TableCell>
                            <TableCell className="text-xs text-right font-semibold">{lineAmt.toFixed(2)}</TableCell>
                            <TableCell className="text-xs">
                              {hasErr ? (
                                <div className="space-y-0.5">
                                  {line._errors.map((err, i) => (
                                    <div key={i} className="flex items-center gap-1 text-destructive">
                                      <AlertCircle className="h-3 w-3 shrink-0" />
                                      {err}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">{line.lineNotes || '—'}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Group Total */}
                {!group.hasErrors && (
                  <div className="px-4 py-2 border-t bg-muted/20 flex justify-end gap-6 text-xs text-muted-foreground">
                    <span>
                      总数量：<span className="font-semibold text-foreground">
                        {group.lines.reduce((s, l) => s + l.quantity, 0)} 件
                      </span>
                    </span>
                    <span>
                      含税总额（{group.lines[0]?.currency || 'USD'}）：<span className="font-semibold text-foreground">
                        {group.lines.reduce((s, l) => {
                          const sub = l.quantity * l.unitPrice
                          return s + sub * (1 + l.taxRate / 100)
                        }, 0).toFixed(2)}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {importPOPreviews.some(g => g.hasErrors) && (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  含错误行的 PO 将整张跳过，仅导入完全正确的 PO 单据
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setShowImportPODialog(false); setImportPORows([]) }}
              >
                取消
              </Button>
              <Button
                onClick={handleConfirmImportPO}
                disabled={importPOPreviews.filter(g => !g.hasErrors).length === 0}
                className="min-w-[150px]"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                确认创建 {importPOPreviews.filter(g => !g.hasErrors).length} 张 PO
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
