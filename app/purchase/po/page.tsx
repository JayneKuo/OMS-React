"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, AlertCircle, Download, Upload, FileDown, FilePlus, Eye, Edit, Send, X, RotateCcw, Copy, MapPin, FileCheck, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { StatusBadge } from "@/components/ui/status-badge"
import { POStatus, ShippingStatus, ReceivingStatus } from "@/lib/enums/po-status"
import { LocalWarehouseReceiptDialog } from "@/components/purchase/local-warehouse-receipt-dialog"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"

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
    status: POStatus.PARTIAL_RECEIPT,
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
    status: POStatus.RECEIVING,
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
    status: POStatus.WAITING_FOR_RECEIVING,
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
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<PurchaseOrder[]>(mockPOs)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [showLocalWarehouseReceiptDialog, setShowLocalWarehouseReceiptDialog] = React.useState(false)
  const [currentPOForReceipt, setCurrentPOForReceipt] = React.useState<PurchaseOrder | null>(null)

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
          receivingStatus: isFullyReceived ? ReceivingStatus.FULLY_RECEIVED : ReceivingStatus.PARTIAL_RECEIVED,
          updated: new Date().toISOString(),
        }
      }
      return po
    }))
  }

  // 主状态配置（PO Status）- 使用设计系统颜色
  const statusConfig = {
    NEW: { label: t('NEW'), color: "text-text-secondary" },
    IN_TRANSIT: { label: t('IN_TRANSIT'), color: "text-primary" },
    WAITING_FOR_RECEIVING: { label: t('WAITING_FOR_RECEIVING'), color: "text-primary" },
    RECEIVING: { label: t('RECEIVING'), color: "text-primary" },
    PARTIAL_RECEIPT: { label: t('PARTIAL_RECEIPT'), color: "text-warning" },
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

  // Define filter configurations based on optimized PO system
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "new", label: t('NEW'), value: POStatus.NEW },
        { id: "in_transit", label: t('IN_TRANSIT'), value: POStatus.IN_TRANSIT },
        { id: "waiting_for_receiving", label: t('WAITING_FOR_RECEIVING'), value: POStatus.WAITING_FOR_RECEIVING },
        { id: "receiving", label: t('RECEIVING'), value: POStatus.RECEIVING },
        { id: "partial_receipt", label: t('PARTIAL_RECEIPT'), value: POStatus.PARTIAL_RECEIPT },
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
      [POStatus.NEW]: 0,
      [POStatus.IN_TRANSIT]: 0,
      [POStatus.WAITING_FOR_RECEIVING]: 0,
      [POStatus.RECEIVING]: 0,
      [POStatus.PARTIAL_RECEIPT]: 0,
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
                { label: t('send'), action: () => console.log("Send to supplier", row.orderNo), variant: undefined, disabled: undefined },
                { label: t('createShipment'), action: () => router.push(`/purchase/shipments/create?poId=${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createReceipt'), action: () => {
                  // 本地仓库：打开弹窗，一步完成入库和收货
                  // 第三方仓库：跳转到入库请求创建页面
                  if (isLocalWarehouse) {
                    setCurrentPOForReceipt(row)
                    setShowLocalWarehouseReceiptDialog(true)
                  } else {
                    router.push(`/purchase/receipts/create?poId=${row.id}`)
                  }
                }, variant: undefined, disabled: undefined },
                { label: t('cancel'), action: () => console.log("Cancel PO", row.orderNo), variant: "destructive", disabled: undefined },
              ]
            case POStatus.IN_TRANSIT:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createShipment'), action: () => router.push(`/purchase/shipments/create?poId=${row.id}`), variant: undefined, disabled: undefined },
                { label: t('markArrived'), action: () => {
                  // 标记送达：更新PO状态和运输状态
                  setFilteredData(prev => prev.map(po => {
                    if (po.id === row.id) {
                      return {
                        ...po,
                        status: POStatus.WAITING_FOR_RECEIVING,
                        shippingStatus: ShippingStatus.ARRIVED,
                        updated: new Date().toISOString(),
                      }
                    }
                    return po
                  }))
                  // 实际应用中应该调用API更新状态
                  console.log("Mark arrived", row.orderNo)
                }, variant: undefined, disabled: undefined },
              ]
            case POStatus.WAITING_FOR_RECEIVING:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createShipment'), action: () => router.push(`/purchase/shipments/create?poId=${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createReceipt'), action: () => {
                  // 本地仓库：打开弹窗，一步完成入库和收货
                  // 第三方仓库：跳转到入库请求创建页面
                  if (isLocalWarehouse) {
                    setCurrentPOForReceipt(row)
                    setShowLocalWarehouseReceiptDialog(true)
                  } else {
                    router.push(`/purchase/receipts/create?poId=${row.id}`)
                  }
                }, variant: undefined, disabled: undefined },
              ]
            case POStatus.RECEIVING:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createShipment'), action: () => router.push(`/purchase/shipments/create?poId=${row.id}`), variant: undefined, disabled: undefined },
              ]
            case POStatus.PARTIAL_RECEIPT:
              return [
                { label: t('view'), action: () => router.push(`/purchase/po/${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createShipment'), action: () => router.push(`/purchase/shipments/create?poId=${row.id}`), variant: undefined, disabled: undefined },
                { label: t('createReceipt'), action: () => {
                  // 本地仓库：打开弹窗，一步完成入库和收货
                  // 第三方仓库：跳转到入库请求创建页面
                  if (isLocalWarehouse) {
                    setCurrentPOForReceipt(row)
                    setShowLocalWarehouseReceiptDialog(true)
                  } else {
                    router.push(`/purchase/receipts/create?poId=${row.id}`)
                  }
                }, variant: undefined, disabled: undefined },
              ]
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
                    className={`text-sm ${
                      action.variant === "destructive" 
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
          return [
            { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment", selectedRows) },
            { label: t('batchMarkArrived'), action: () => {
              // 批量标记送达：更新选中PO的状态和运输状态
              setFilteredData(prev => prev.map(po => {
                if (selectedRows.includes(po.id) && po.status === POStatus.IN_TRANSIT) {
                  return {
                    ...po,
                    status: POStatus.WAITING_FOR_RECEIVING,
                    shippingStatus: ShippingStatus.ARRIVED,
                    updated: new Date().toISOString(),
                  }
                }
                return po
              }))
              setSelectedRows([])
              // 实际应用中应该调用API批量更新状态
              console.log("Batch mark arrived", selectedRows)
            } },
          ]
        case POStatus.WAITING_FOR_RECEIVING:
          return [
            { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment", selectedRows) },
            { label: t('batchCreateReceipt'), action: () => console.log("Batch create receipt", selectedRows) },
          ]
        case POStatus.RECEIVING:
          return [
            { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment", selectedRows) },
          ]
        case POStatus.PARTIAL_RECEIPT:
          return [
            { label: t('batchCreateShipment'), action: () => console.log("Batch create shipment", selectedRows) },
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
            
            {/* Batch Actions Dropdown - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={selectedRows.length === 0} className="text-sm font-normal">
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
            <TabsTrigger value={POStatus.NEW}>
              {t('NEW')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.NEW] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.IN_TRANSIT}>
              {t('IN_TRANSIT')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.IN_TRANSIT] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.WAITING_FOR_RECEIVING}>
              {t('WAITING_FOR_RECEIVING')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.WAITING_FOR_RECEIVING] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.RECEIVING}>
              {t('RECEIVING')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.RECEIVING] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.PARTIAL_RECEIPT}>
              {t('PARTIAL_RECEIPT')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.PARTIAL_RECEIPT] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.CLOSED}>
              {t('CLOSED')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.CLOSED] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.CANCELLED}>
              {t('CANCELLED')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.CANCELLED] || 0}</Badge>
            </TabsTrigger>
            <TabsTrigger value={POStatus.EXCEPTION}>
              {t('EXCEPTION')} <Badge variant="secondary" className="ml-2">{statusCounts[POStatus.EXCEPTION] || 0}</Badge>
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

      {/* 本地仓库收货弹窗 */}
      {currentPOForReceipt && (
        <LocalWarehouseReceiptDialog
          open={showLocalWarehouseReceiptDialog}
          onOpenChange={setShowLocalWarehouseReceiptDialog}
          po={convertPOToPOInfo(currentPOForReceipt)}
          onConfirm={handleLocalWarehouseReceiptConfirm}
        />
      )}
    </MainLayout>
  )
}
