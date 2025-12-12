"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, AlertCircle, Download, Upload, FileDown, FilePlus, Eye, Edit, Send, X, RotateCcw, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

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
  
  // 主状态（PO Status）- 真正影响 PO 生命周期的唯一状态机
  status: "DRAFT" | "CREATED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "PARTIALLY_RECEIVED" | "CLOSED" | "REJECTED" | "CANCELLED" | "EXCEPTION"
  
  // 运输状态（Shipping Status）- 扩展视图字段，不影响状态机
  shippingStatus: "NOT_SHIPPED" | "ASN_CREATED" | "SHIPPED" | "IN_TRANSIT" | "ARRIVED" | "RECEIVING" | "SHIPMENT_COMPLETED" | null
  
  // 收货状态（Receiving Status）- 扩展视图字段，用于展示收货进度
  receivingStatus: "NOT_RECEIVED" | "PARTIALLY_RECEIVED" | "FULLY_RECEIVED" | "OVER_RECEIVED" | null
  
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
}

// Mock data with optimized status system
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
    status: "CONFIRMED",
    shippingStatus: "ASN_CREATED",
    receivingStatus: "NOT_RECEIVED",
    dataSource: "PR_CONVERSION",
    totalOrderQty: 500,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 12500.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-15T10:30:00Z",
    updated: "2024-01-16T14:20:00Z",
    expectedArrivalDate: "2024-01-25",
    purchaseOrderDate: "2024-01-15",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "Handle with care - fragile items",
    itemCount: 15,
    exceptions: [],
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
    status: "CONFIRMED",
    shippingStatus: "ARRIVED_AT_WAREHOUSE",
    receivingStatus: "IN_RECEIVING",
    dataSource: "MANUAL",
    totalOrderQty: 1200,
    shippedQty: 1200,
    receivedQty: 0,
    totalPrice: 35000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-14T09:15:00Z",
    updated: "2024-01-18T11:45:00Z",
    expectedArrivalDate: "2024-01-23",
    purchaseOrderDate: "2024-01-14",
    toCity: "New York",
    toState: "NY",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Signature required",
    itemCount: 28,
    exceptions: ["Delayed shipment"],
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
    status: "CLOSED",
    shippingStatus: "SHIPMENT_COMPLETED",
    receivingStatus: "FULLY_RECEIVED",
    dataSource: "PR_CONVERSION",
    totalOrderQty: 850,
    shippedQty: 850,
    receivedQty: 850,
    totalPrice: 28000.00,
    currency: "USD",
    asnCount: 3,
    created: "2024-01-10T13:20:00Z",
    updated: "2024-01-17T10:35:00Z",
    expectedArrivalDate: "2024-01-17",
    purchaseOrderDate: "2024-01-10",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "",
    itemCount: 42,
    exceptions: [],
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
    status: "EXCEPTION",
    shippingStatus: null,
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
    expectedArrivalDate: "2024-01-27",
    purchaseOrderDate: "2024-01-16",
    toCity: "Chicago",
    toState: "IL",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "FedEx",
    shippingNotes: "Hold for inspection",
    itemCount: 35,
    exceptions: ["Payment pending", "Quality check required"],
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
    status: "PARTIALLY_RECEIVED",
    shippingStatus: "ARRIVED_AT_WAREHOUSE",
    receivingStatus: "PARTIALLY_RECEIVED",
    dataSource: "MANUAL",
    totalOrderQty: 2000,
    shippedQty: 2000,
    receivedQty: 1200,
    totalPrice: 67000.00,
    currency: "USD",
    asnCount: 4,
    created: "2024-01-12T15:45:00Z",
    updated: "2024-01-20T09:30:00Z",
    expectedArrivalDate: "2024-01-22",
    purchaseOrderDate: "2024-01-12",
    toCity: "Miami",
    toState: "FL",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Partial delivery expected",
    itemCount: 18,
    exceptions: [],
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
    status: "DRAFT",
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
  },
]

// 状态配置将在组件内部使用 t() 函数动态获取标签

export default function POPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<PurchaseOrder[]>(mockPOs)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // 主状态配置（PO Status）
  const statusConfig = {
    DRAFT: { label: t('DRAFT'), color: "bg-gray-100 text-gray-800" },
    CREATED: { label: t('CREATED'), color: "bg-blue-100 text-blue-800" },
    PENDING_CONFIRMATION: { label: t('PENDING_CONFIRMATION'), color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: t('CONFIRMED'), color: "bg-green-100 text-green-800" },
    PARTIALLY_RECEIVED: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800" },
    CLOSED: { label: t('CLOSED'), color: "bg-teal-100 text-teal-800" },
    REJECTED: { label: t('REJECTED'), color: "bg-red-100 text-red-800" },
    CANCELLED: { label: t('CANCELLED'), color: "bg-red-100 text-red-800" },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-red-100 text-red-800" },
  }

  // 运输状态配置（Shipping Status）- 基于实际触发事件
  const shippingStatusConfig = {
    NOT_SHIPPED: { 
      label: t('NOT_SHIPPED'), 
      color: "bg-gray-50 text-gray-600",
      description: t('noASNCreated')
    },
    ASN_CREATED: { 
      label: t('ASN_CREATED'), 
      color: "bg-blue-50 text-blue-600",
      description: t('asnCreatedNotShipped')
    },
    SHIPPED: { 
      label: t('SHIPPED'), 
      color: "bg-purple-50 text-purple-600",
      description: t('asnMarkedShipped')
    },
    IN_TRANSIT: { 
      label: t('IN_TRANSIT'), 
      color: "bg-indigo-50 text-indigo-600",
      description: t('carrierEventInTransit')
    },
    ARRIVED_AT_WAREHOUSE: { 
      label: t('ARRIVED_AT_WAREHOUSE'), 
      color: "bg-green-50 text-green-600",
      description: t('arrivedAtWarehouse')
    },
    SHIPMENT_COMPLETED: { 
      label: t('SHIPMENT_COMPLETED'), 
      color: "bg-teal-50 text-teal-600",
      description: t('allASNCompleted')
    },
  }

  // 收货状态配置（Receiving Status）- 基于实际触发事件
  const receivingStatusConfig = {
    NOT_RECEIVED: { 
      label: t('NOT_RECEIVED'), 
      color: "bg-gray-50 text-gray-600",
      description: t('noReceiptRecords')
    },
    IN_RECEIVING: { 
      label: t('IN_RECEIVING'), 
      color: "bg-blue-50 text-blue-600",
      description: t('warehouseStartedReceiving')
    },
    PARTIALLY_RECEIVED: { 
      label: t('PARTIALLY_RECEIVED'), 
      color: "bg-orange-50 text-orange-600",
      description: t('partialLinesReceived')
    },
    FULLY_RECEIVED: { 
      label: t('FULLY_RECEIVED'), 
      color: "bg-green-50 text-green-600",
      description: t('allLinesReceived')
    },
    OVER_RECEIVED: { 
      label: t('OVER_RECEIVED'), 
      color: "bg-red-50 text-red-600",
      description: t('overReceivedAbnormal')
    },
  }

  // 来源配置
  const dataSourceConfig = {
    MANUAL: { label: t('MANUAL'), color: "bg-blue-50 text-blue-700" },
    PR_CONVERSION: { label: t('PR_CONVERSION'), color: "bg-green-50 text-green-700" },
    API_IMPORT: { label: t('API_IMPORT'), color: "bg-purple-50 text-purple-700" },
  }

  // Define filter configurations based on optimized PO system
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "draft", label: t('DRAFT'), value: "DRAFT" },
        { id: "created", label: t('CREATED'), value: "CREATED" },
        { id: "pending_confirmation", label: t('PENDING_CONFIRMATION'), value: "PENDING_CONFIRMATION" },
        { id: "confirmed", label: t('CONFIRMED'), value: "CONFIRMED" },
        { id: "partially_received", label: t('PARTIALLY_RECEIVED'), value: "PARTIALLY_RECEIVED" },
        { id: "closed", label: t('CLOSED'), value: "CLOSED" },
        { id: "rejected", label: t('REJECTED'), value: "REJECTED" },
        { id: "cancelled", label: t('CANCELLED'), value: "CANCELLED" },
        { id: "exception", label: t('EXCEPTION'), value: "EXCEPTION" },
      ],
    },
    {
      id: "shippingStatus",
      label: t('shippingStatus'),
      type: "multiple",
      options: [
        { id: "not_shipped", label: t('NOT_SHIPPED'), value: "NOT_SHIPPED" },
        { id: "asn_created", label: t('ASN_CREATED'), value: "ASN_CREATED" },
        { id: "shipped", label: t('SHIPPED'), value: "SHIPPED" },
        { id: "in_transit", label: t('IN_TRANSIT'), value: "IN_TRANSIT" },
        { id: "arrived_at_warehouse", label: t('ARRIVED_AT_WAREHOUSE'), value: "ARRIVED_AT_WAREHOUSE" },
        { id: "shipment_completed", label: t('SHIPMENT_COMPLETED'), value: "SHIPMENT_COMPLETED" },
      ],
    },
    {
      id: "receivingStatus",
      label: t('receivingStatus'),
      type: "multiple",
      options: [
        { id: "not_received", label: t('NOT_RECEIVED'), value: "NOT_RECEIVED" },
        { id: "in_receiving", label: t('IN_RECEIVING'), value: "IN_RECEIVING" },
        { id: "partially_received", label: t('PARTIALLY_RECEIVED'), value: "PARTIALLY_RECEIVED" },
        { id: "fully_received", label: t('FULLY_RECEIVED'), value: "FULLY_RECEIVED" },
        { id: "over_received", label: t('OVER_RECEIVED'), value: "OVER_RECEIVED" },
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
    { id: "orderNo", label: t('poNo'), placeholder: "e.g., PO202403150001" },
    { id: "originalPoNo", label: t('originalPoNo'), placeholder: "e.g., EXT-PO-2024-001" },
    { id: "prNos", label: t('prNos'), placeholder: "e.g., PR202401100001" },
    { id: "referenceNo", label: t('referenceNo'), placeholder: "e.g., REF202403150001" },
    { id: "supplierName", label: t('supplierName'), placeholder: "e.g., ABC Suppliers Inc." },
    { id: "supplierNo", label: t('supplierNo'), placeholder: "e.g., SUP001" },
  ]

  // Calculate status counts based on status
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: mockPOs.length,
      DRAFT: 0,
      CREATED: 0,
      PENDING_CONFIRMATION: 0,
      CONFIRMED: 0,
      PARTIALLY_RECEIVED: 0,
      CLOSED: 0,
      REJECTED: 0,
      CANCELLED: 0,
      EXCEPTION: 0,
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
    if (activeTab !== "all") {
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
          // Handle PR Nos search specially since it's an array
          if (key === 'prNos') {
            return po.prNos.some(prNo => prNo.toLowerCase().includes(value.toLowerCase()))
          }
          
          const poValue = po[key as keyof PurchaseOrder]
          if (typeof poValue === 'string') {
            return poValue.toLowerCase().includes(value.toLowerCase())
          }
          return false
        })
      })
    }

    // Apply active filters
    activeFilters.forEach(filter => {
      if (filter.filterId === "status") {
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
        <div className="font-medium cursor-pointer hover:text-blue-600" onClick={() => router.push(`/purchase/po/${row.id}`)}>
          {row.orderNo}
        </div>
      ),
    },
    {
      id: "originalPoNo",
      header: t('originalPoNo'),
      accessorKey: "originalPoNo",
      width: "160px",
      defaultVisible: true,
      cell: (row) => (
        <div className="text-muted-foreground">{row.originalPoNo}</div>
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
      id: "status",
      header: t('status'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => {
        const config = statusConfig[row.status]
        return (
          <Badge className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "shippingStatus",
      header: t('shippingStatus'),
      width: "140px",
      defaultVisible: true,
      cell: (row) => (
        row.shippingStatus ? (
          <Badge variant="outline" className={shippingStatusConfig[row.shippingStatus].color}>
            {shippingStatusConfig[row.shippingStatus].label}
          </Badge>
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
          <Badge variant="outline" className={receivingStatusConfig[row.receivingStatus].color}>
            {receivingStatusConfig[row.receivingStatus].label}
          </Badge>
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
        <div className="text-center">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {row.asnCount}
          </Badge>
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
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        )
      },
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
    },
    {
      id: "prNos",
      header: t('prNos'),
      width: "200px",
      defaultVisible: false,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.prNos.slice(0, 2).map((prNo, index) => (
            <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
              {prNo}
            </Badge>
          ))}
          {row.prNos.length > 2 && (
            <Badge variant="outline" className="bg-gray-50 text-gray-600 text-xs">
              +{row.prNos.length - 2}
            </Badge>
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
          <div className="flex items-center gap-1 text-red-600">
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
      width: "240px",
      defaultVisible: true,
      cell: (row) => {
        // Define available actions based on status
        const getAvailableActions = () => {
          switch (row.status) {
            case "DRAFT":
              return [
                { label: t('edit'), icon: <Edit className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}/edit`), variant: undefined, disabled: undefined },
                { label: t('send'), icon: <Send className="h-3 w-3" />, action: () => console.log("Send to supplier", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('delete'), icon: <X className="h-3 w-3" />, action: () => console.log("Delete", row.orderNo), variant: "destructive", disabled: undefined },
              ]
            case "CREATED":
              return [
                { label: t('edit'), icon: <Edit className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}/edit`), variant: undefined, disabled: undefined },
                { label: t('send'), icon: <Send className="h-3 w-3" />, action: () => console.log("Send to supplier", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", row.orderNo), variant: "destructive", disabled: undefined },
              ]
            case "PENDING_CONFIRMATION":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('resend'), icon: <Send className="h-3 w-3" />, action: () => console.log("Resend", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", row.orderNo), variant: "destructive", disabled: undefined },
              ]
            case "CONFIRMED":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createASN'), icon: <Truck className="h-3 w-3" />, action: () => console.log("Create ASN", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('viewASN'), icon: <Package className="h-3 w-3" />, action: () => console.log("View ASN", row.orderNo), variant: undefined, disabled: row.asnCount === 0 },
              ]
            case "PARTIALLY_RECEIVED":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('viewReceipts'), icon: <CheckCircle className="h-3 w-3" />, action: () => console.log("View receipts", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('viewRTV'), icon: <RotateCcw className="h-3 w-3" />, action: () => console.log("View RTV", row.orderNo), variant: undefined, disabled: undefined },
              ]
            case "CLOSED":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('copy'), icon: <Copy className="h-3 w-3" />, action: () => console.log("Copy as new PO", row.orderNo), variant: undefined, disabled: undefined },
              ]
            case "REJECTED":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('copy'), icon: <Copy className="h-3 w-3" />, action: () => console.log("Copy as new PO", row.orderNo), variant: undefined, disabled: undefined },
              ]
            case "CANCELLED":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('copy'), icon: <Copy className="h-3 w-3" />, action: () => console.log("Copy as new PO", row.orderNo), variant: undefined, disabled: undefined },
              ]
            case "EXCEPTION":
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('resume'), icon: <RotateCcw className="h-3 w-3" />, action: () => console.log("Resume", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", row.orderNo), variant: "destructive", disabled: undefined },
              ]
            default:
              return [
                { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
              ]
          }
        }

        const actions = getAvailableActions()

        return (
          <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === "destructive" ? "destructive" : "outline"}
                size="sm"
                onClick={action.action}
                disabled={action.disabled}
                className="text-xs px-2 py-1 h-7 flex items-center gap-1"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
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
        case "DRAFT":
          return [
            { label: t('batchSend'), action: () => console.log("Batch send", selectedRows) },
            { label: t('batchDelete'), action: () => console.log("Batch delete", selectedRows), variant: "destructive" },
          ]
        case "CREATED":
          return [
            { label: t('batchSend'), action: () => console.log("Batch send", selectedRows) },
            { label: t('batchCancel'), action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
          ]
        case "PENDING_CONFIRMATION":
          return [
            { label: t('batchResend'), action: () => console.log("Batch resend", selectedRows) },
            { label: t('batchCancel'), action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
          ]
        case "CONFIRMED":
          return [
            { label: t('batchCreateASN'), action: () => console.log("Batch create ASN", selectedRows) },
          ]
        case "EXCEPTION":
          return [
            { label: t('batchResume'), action: () => console.log("Batch resume", selectedRows) },
            { label: t('batchCancel'), action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('purchaseOrders')}</h1>
            <p className="text-muted-foreground">
              {t('managePurchaseOrders')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => console.log("Export", selectedRows.length > 0 ? selectedRows : "all")}
            >
              <Download className="mr-2 h-4 w-4" />
              {selectedRows.length > 0 ? `${t('export')} (${selectedRows.length})` : t('export')}
            </Button>
            
            {/* Batch Actions Dropdown - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={selectedRows.length === 0}>
                  <Package className="mr-2 h-4 w-4" />
                  {t('batchActions')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {selectedRows.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    {t('selectRowsToSeeActions')}
                  </div>
                ) : (
                  <>
                    {selectedStatuses.length === 1 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {t('status')}: {statusConfig[selectedStatuses[0] as keyof typeof statusConfig]?.label}
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {selectedStatuses.length > 1 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {t('mixedStatus')} ({selectedStatuses.length} {t('types')})
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {availableBatchActions.length > 0 ? (
                      availableBatchActions.map((action, index) => (
                        <DropdownMenuItem
                          key={index}
                          onClick={action.action}
                          className={action.variant === "destructive" ? "text-destructive" : ""}
                        >
                          {action.label}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        {t('noAvailableActions')}
                      </div>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedRows.length > 0 && (
              <Button variant="outline" onClick={() => setSelectedRows([])}>
                {t('clearSelection')}
              </Button>
            )}

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
                <DropdownMenuItem onClick={() => console.log("Import from file")}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('importFromFilePO')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => console.log("Download template")}>
                  <FileDown className="mr-2 h-4 w-4" />
                  {t('downloadTemplatePO')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contract State Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')} <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="DRAFT">
              {t('DRAFT')} <Badge variant="secondary" className="ml-2">{statusCounts.DRAFT}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CREATED">
              {t('CREATED')} <Badge variant="secondary" className="ml-2">{statusCounts.CREATED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="PENDING_CONFIRMATION">
              {t('PENDING_CONFIRMATION')} <Badge variant="secondary" className="ml-2">{statusCounts.PENDING_CONFIRMATION}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CONFIRMED">
              {t('CONFIRMED')} <Badge variant="secondary" className="ml-2">{statusCounts.CONFIRMED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="PARTIALLY_RECEIVED">
              {t('PARTIALLY_RECEIVED')} <Badge variant="secondary" className="ml-2">{statusCounts.PARTIALLY_RECEIVED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CLOSED">
              {t('CLOSED')} <Badge variant="secondary" className="ml-2">{statusCounts.CLOSED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="EXCEPTION">
              {t('EXCEPTION')} <Badge variant="secondary" className="ml-2">{statusCounts.EXCEPTION}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CANCELLED">
              {t('CANCELLED')} <Badge variant="secondary" className="ml-2">{statusCounts.CANCELLED}</Badge>
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
              onRowClick={(row) => console.log("Row clicked:", row)}
              hideColumnControl={true}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
