"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, AlertCircle, Download, Upload, FileDown, FilePlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/components/i18n-provider"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// PO Data Interface based on international standards
interface PurchaseOrder {
  id: string
  orderNo: string
  originalPoNo: string // Original PO number from external system
  prNos: string[] // Related PR numbers (multiple PRs can be consolidated into one PO)
  referenceNo: string
  supplierName: string
  supplierNo: string
  destination: string
  status: "DRAFT" | "SUBMITTED" | "CONFIRMED" | "SHIPPED" | "RECEIVED" | "CANCELLED" | "ON_HOLD"
  receiptType: "STANDARD" | "CROSS_DOCK" | "DROP_SHIP" | "RETURN_TO_VENDOR" | "TRANSFER"
  exceptions: string[]
  created: string
  expectedShipDate: string
  expectedArrivalDate: string
  actualArrivalDate: string | null
  totalPrice: number
  currency: string
  toCity: string
  toState: string
  toCountry: string
  updated: string
  shippingService: string
  shippingCarrier: string
  shippingNotes: string
  purchaseOrderDate: string
  // Additional fields
  warehouseName: string
  itemCount: number
  totalQty: number
}

// Mock data with comprehensive fields
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
    status: "CONFIRMED",
    receiptType: "STANDARD",
    exceptions: [],
    created: "2024-01-15T10:30:00Z",
    expectedShipDate: "2024-01-20",
    expectedArrivalDate: "2024-01-25",
    actualArrivalDate: null,
    totalPrice: 12500.00,
    currency: "USD",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    updated: "2024-01-16T14:20:00Z",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "Handle with care - fragile items",
    purchaseOrderDate: "2024-01-15",
    warehouseName: "Main Warehouse",
    itemCount: 15,
    totalQty: 500,
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
    status: "SHIPPED",
    receiptType: "CROSS_DOCK",
    exceptions: ["Delayed shipment"],
    created: "2024-01-14T09:15:00Z",
    expectedShipDate: "2024-01-18",
    expectedArrivalDate: "2024-01-23",
    actualArrivalDate: null,
    totalPrice: 35000.00,
    currency: "USD",
    toCity: "New York",
    toState: "NY",
    toCountry: "USA",
    updated: "2024-01-18T11:45:00Z",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Signature required",
    purchaseOrderDate: "2024-01-14",
    warehouseName: "East DC",
    itemCount: 28,
    totalQty: 1200,
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
    status: "RECEIVED",
    receiptType: "STANDARD",
    exceptions: [],
    created: "2024-01-10T13:20:00Z",
    expectedShipDate: "2024-01-12",
    expectedArrivalDate: "2024-01-17",
    actualArrivalDate: "2024-01-17T10:30:00Z",
    totalPrice: 28000.00,
    currency: "USD",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    updated: "2024-01-17T10:35:00Z",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "",
    purchaseOrderDate: "2024-01-10",
    warehouseName: "West FC",
    itemCount: 42,
    totalQty: 850,
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
    status: "ON_HOLD",
    receiptType: "DROP_SHIP",
    exceptions: ["Payment pending", "Quality check required"],
    created: "2024-01-16T08:00:00Z",
    expectedShipDate: "2024-01-22",
    expectedArrivalDate: "2024-01-27",
    actualArrivalDate: null,
    totalPrice: 45000.00,
    currency: "USD",
    toCity: "Chicago",
    toState: "IL",
    toCountry: "USA",
    updated: "2024-01-16T16:30:00Z",
    shippingService: "Standard",
    shippingCarrier: "FedEx",
    shippingNotes: "Hold for inspection",
    purchaseOrderDate: "2024-01-16",
    warehouseName: "Central WH",
    itemCount: 35,
    totalQty: 1500,
  },
]

// 状态配置将在组件内部使用 t() 函数动态获取标签

export default function POPage() {
  const { t } = useI18n()
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [advancedSearchValues, setAdvancedSearchValues] = React.useState<AdvancedSearchValues>({})
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [filteredData, setFilteredData] = React.useState<PurchaseOrder[]>(mockPOs)
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set())
  const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([])
  const [activeTab, setActiveTab] = React.useState<string>("all")

  // 状态配置
  const statusConfig = {
    DRAFT: { label: t('DRAFT'), color: "bg-gray-100 text-gray-800" },
    SUBMITTED: { label: t('SUBMITTED'), color: "bg-blue-100 text-blue-800" },
    CONFIRMED: { label: t('CONFIRMED'), color: "bg-green-100 text-green-800" },
    SHIPPED: { label: t('SHIPPED'), color: "bg-purple-100 text-purple-800" },
    RECEIVED: { label: t('RECEIVED'), color: "bg-teal-100 text-teal-800" },
    CANCELLED: { label: t('CANCELLED'), color: "bg-red-100 text-red-800" },
    ON_HOLD: { label: t('ON_HOLD'), color: "bg-yellow-100 text-yellow-800" },
  }

  const receiptTypeConfig = {
    STANDARD: { label: t('STANDARD'), color: "bg-blue-50 text-blue-700 border-blue-200" },
    CROSS_DOCK: { label: t('CROSS_DOCK'), color: "bg-purple-50 text-purple-700 border-purple-200" },
    DROP_SHIP: { label: t('DROP_SHIP'), color: "bg-orange-50 text-orange-700 border-orange-200" },
    RETURN_TO_VENDOR: { label: t('RETURN_TO_VENDOR'), color: "bg-red-50 text-red-700 border-red-200" },
    TRANSFER: { label: t('TRANSFER'), color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  }

  // Define filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "draft", label: t('DRAFT'), value: "DRAFT" },
        { id: "submitted", label: t('SUBMITTED'), value: "SUBMITTED" },
        { id: "confirmed", label: t('CONFIRMED'), value: "CONFIRMED" },
        { id: "shipped", label: t('SHIPPED'), value: "SHIPPED" },
        { id: "received", label: t('RECEIVED'), value: "RECEIVED" },
        { id: "on_hold", label: t('ON_HOLD'), value: "ON_HOLD" },
        { id: "cancelled", label: t('CANCELLED'), value: "CANCELLED" },
      ],
    },
    {
      id: "receiptType",
      label: t('prType'),
      type: "multiple",
      options: [
        { id: "standard", label: t('STANDARD'), value: "STANDARD" },
        { id: "cross_dock", label: t('CROSS_DOCK'), value: "CROSS_DOCK" },
        { id: "drop_ship", label: t('DROP_SHIP'), value: "DROP_SHIP" },
        { id: "return_to_vendor", label: t('RETURN_TO_VENDOR'), value: "RETURN_TO_VENDOR" },
        { id: "transfer", label: t('TRANSFER'), value: "TRANSFER" },
      ],
    },
    {
      id: "destination",
      label: t('targetWarehouse'),
      type: "multiple",
      options: [
        { id: "la", label: "Los Angeles", value: "Los Angeles" },
        { id: "ny", label: "New York", value: "New York" },
        { id: "seattle", label: "Seattle", value: "Seattle" },
        { id: "chicago", label: "Chicago", value: "Chicago" },
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
      ],
    },
    {
      id: "carrier",
      label: t('supplierField'),
      type: "multiple",
      options: [
        { id: "fedex", label: "FedEx", value: "FedEx" },
        { id: "ups", label: "UPS", value: "UPS" },
        { id: "dhl", label: "DHL", value: "DHL" },
      ],
    },
  ]

  // Advanced search field configurations
  const advancedSearchFields: SearchField[] = [
    { id: "orderNo", label: t('prNo'), placeholder: "e.g., PO202403150001" },
    { id: "originalPoNo", label: t('businessNo'), placeholder: "e.g., EXT-PO-2024-001" },
    { id: "prNo", label: t('prNo'), placeholder: "e.g., PR202401100001" },
    { id: "referenceNo", label: t('businessNo'), placeholder: "e.g., REF202403150001" },
    { id: "supplierName", label: t('supplierField'), placeholder: "e.g., ABC Suppliers Inc." },
    { id: "supplierNo", label: "Supplier No.", placeholder: "e.g., SUP001" },
  ]

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: mockPOs.length,
      DRAFT: 0,
      SUBMITTED: 0,
      CONFIRMED: 0,
      SHIPPED: 0,
      RECEIVED: 0,
      ON_HOLD: 0,
      CANCELLED: 0,
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
          // Handle PR No. search specially since it's an array
          if (key === 'prNo') {
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
      } else if (filter.filterId === "receiptType") {
        filtered = filtered.filter(po => po.receiptType === filter.optionValue)
      } else if (filter.filterId === "destination") {
        filtered = filtered.filter(po => po.toCity === filter.optionValue)
      } else if (filter.filterId === "supplier") {
        filtered = filtered.filter(po => po.supplierName === filter.optionValue)
      } else if (filter.filterId === "carrier") {
        filtered = filtered.filter(po => po.shippingCarrier === filter.optionValue)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchValue, activeFilters, advancedSearchValues, activeTab])

  // Define columns with default visibility
  const allColumns: Column<PurchaseOrder>[] = [
    {
      id: "orderNo",
      header: t('poNo'),
      accessorKey: "orderNo",
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <div className="font-medium">{row.orderNo}</div>
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
      id: "prNos",
      header: t('prNos'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.prNos.map((prNo, index) => (
            <Badge key={index} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              {prNo}
            </Badge>
          ))}
        </div>
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
      id: "supplierName",
      header: t('supplierName'),
      accessorKey: "supplierName",
      width: "200px",
      defaultVisible: true,
    },
    {
      id: "destination",
      header: t('destination'),
      accessorKey: "destination",
      width: "250px",
      defaultVisible: true,
    },
    {
      id: "status",
      header: t('status'),
      width: "120px",
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
      id: "receiptType",
      header: t('receiptType'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => {
        const config = receiptTypeConfig[row.receiptType]
        return (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "exceptions",
      header: t('exceptions'),
      width: "150px",
      defaultVisible: true,
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
      id: "totalPrice",
      header: t('totalPrice'),
      width: "120px",
      defaultVisible: true,
      cell: (row) => `${row.currency} ${row.totalPrice.toLocaleString()}`,
    },
    {
      id: "shippingCarrier",
      header: t('shippingCarrier'),
      accessorKey: "shippingCarrier",
      width: "150px",
      defaultVisible: true,
    },
    {
      id: "expectedShipDate",
      header: t('expectedShipDate'),
      accessorKey: "expectedShipDate",
      width: "150px",
      defaultVisible: false,
    },
    {
      id: "actualArrivalDate",
      header: t('actualArrivalDate'),
      width: "180px",
      defaultVisible: false,
      cell: (row) => row.actualArrivalDate ? new Date(row.actualArrivalDate).toLocaleString() : "-",
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
      id: "actions",
      header: t('actions'),
      width: "200px",
      defaultVisible: true,
      cell: (row) => {
        // Define available actions based on status
        const getAvailableActions = () => {
          switch (row.status) {
            case "DRAFT":
              return [
                { label: t('edit'), action: () => console.log("Edit", row.orderNo) },
                { label: t('submit'), action: () => console.log("Submit", row.orderNo) },
                { label: t('delete'), action: () => console.log("Delete", row.orderNo), variant: "destructive" },
              ]
            case "SUBMITTED":
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
                { label: t('confirm'), action: () => console.log("Confirm", row.orderNo) },
                { label: t('cancel'), action: () => console.log("Cancel", row.orderNo), variant: "destructive" },
              ]
            case "CONFIRMED":
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
                { label: t('track'), action: () => console.log("Track", row.orderNo) },
              ]
            case "SHIPPED":
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
                { label: t('track'), action: () => console.log("Track", row.orderNo) },
                { label: t('receive'), action: () => console.log("Receive", row.orderNo) },
              ]
            case "RECEIVED":
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
                { label: t('download'), action: () => console.log("Download", row.orderNo) },
              ]
            case "ON_HOLD":
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
                { label: t('resume'), action: () => console.log("Resume", row.orderNo) },
                { label: t('cancel'), action: () => console.log("Cancel", row.orderNo), variant: "destructive" },
              ]
            case "CANCELLED":
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
              ]
            default:
              return [
                { label: t('view'), action: () => console.log("View", row.orderNo) },
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
                className="text-xs px-2 py-1 h-7"
              >
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
            { label: t('batchSubmitPO'), action: () => console.log("Batch submit", selectedRows) },
            { label: t('delete'), action: () => console.log("Batch delete", selectedRows), variant: "destructive" },
          ]
        case "SUBMITTED":
          return [
            { label: t('batchConfirm'), action: () => console.log("Batch confirm", selectedRows) },
            { label: t('batchCancel'), action: () => console.log("Batch cancel", selectedRows), variant: "destructive" },
          ]
        case "CONFIRMED":
          return [
            { label: t('batchTrack'), action: () => console.log("Batch track", selectedRows) },
          ]
        case "ON_HOLD":
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
      { label: t('batchUpdate'), action: () => console.log("Batch update", selectedRows) },
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
                          {t('statusLabel')}: {statusConfig[selectedStatuses[0] as keyof typeof statusConfig]?.label}
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
                <DropdownMenuItem onClick={() => console.log("Create manually")}>
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

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {t('all')} <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="DRAFT">
              {t('draft')} <Badge variant="secondary" className="ml-2">{statusCounts.DRAFT}</Badge>
            </TabsTrigger>
            <TabsTrigger value="SUBMITTED">
              {t('submitted')} <Badge variant="secondary" className="ml-2">{statusCounts.SUBMITTED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CONFIRMED">
              {t('confirmed')} <Badge variant="secondary" className="ml-2">{statusCounts.CONFIRMED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="SHIPPED">
              {t('shipped')} <Badge variant="secondary" className="ml-2">{statusCounts.SHIPPED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="RECEIVED">
              {t('received')} <Badge variant="secondary" className="ml-2">{statusCounts.RECEIVED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ON_HOLD">
              {t('onHold')} <Badge variant="secondary" className="ml-2">{statusCounts.ON_HOLD}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CANCELLED">
              {t('cancelled')} <Badge variant="secondary" className="ml-2">{statusCounts.CANCELLED}</Badge>
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
