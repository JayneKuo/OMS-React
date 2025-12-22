"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable, Column } from "@/components/data-table/data-table"
import { FilterBar, FilterConfig, ActiveFilter } from "@/components/data-table/filter-bar"
import { SearchField, AdvancedSearchValues } from "@/components/data-table/advanced-search-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus, AlertCircle, Download, Upload, FileDown, FilePlus, Eye, Edit, Send, X, RotateCcw, Copy, Clock, UserCheck, UserX, PlayCircle, Pause, CheckSquare, AlertTriangle } from "lucide-react"
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

// Enhanced PO Status System based on your specification
type POStatus = 
  | "DRAFT" 
  | "NEW" 
  | "PENDING_APPROVAL" 
  | "REJECTED" 
  | "APPROVED" 
  | "PENDING_SUPPLIER_CONFIRMATION" 
  | "CONFIRMED" 
  | "IN_FULFILLMENT" 
  | "PARTIALLY_SHIPPED" 
  | "FULLY_SHIPPED" 
  | "PARTIALLY_RECEIVED" 
  | "FULLY_RECEIVED" 
  | "EXCEPTION" 
  | "CLOSED" 
  | "CANCELLED"

// PO Data Interface with enhanced status system
interface PurchaseOrder {
  id: string
  orderNo: string
  originalPoNo: string
  prNos: string[]
  referenceNo: string
  supplierName: string
  supplierNo: string
  destination: string
  warehouseName: string
  
  // Enhanced status system
  status: POStatus
  
  // Additional metadata
  dataSource: "MANUAL" | "PR_CONVERSION" | "API_IMPORT"
  
  // Quantities and amounts
  totalOrderQty: number
  shippedQty: number
  receivedQty: number
  totalPrice: number
  currency: string
  
  // Time information
  created: string
  updated: string
  expectedArrivalDate: string
  purchaseOrderDate: string
  
  // Location information
  toCity: string
  toState: string
  toCountry: string
  
  // Shipping information
  shippingService: string
  shippingCarrier: string
  shippingNotes: string
  
  // Other
  itemCount: number
  exceptions: string[]
  asnCount: number
}

// Mock data with enhanced status system
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
    status: "DRAFT",
    dataSource: "MANUAL",
    totalOrderQty: 500,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 12500.00,
    currency: "USD",
    asnCount: 0,
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
    status: "NEW",
    dataSource: "PR_CONVERSION",
    totalOrderQty: 1200,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 35000.00,
    currency: "USD",
    asnCount: 0,
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
    exceptions: [],
  },
  {
    id: "3",
    orderNo: "PO202403150003",
    originalPoNo: "EXT-PO-2024-003",
    prNos: ["PR202401050001"],
    referenceNo: "REF202403150003",
    supplierName: "Tech Distributors Ltd.",
    supplierNo: "SUP003",
    destination: "West Fulfillment Center - Seattle",
    warehouseName: "West FC",
    status: "PENDING_APPROVAL",
    dataSource: "MANUAL",
    totalOrderQty: 850,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 28000.00,
    currency: "USD",
    asnCount: 0,
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
    status: "REJECTED",
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
    status: "APPROVED",
    dataSource: "MANUAL",
    totalOrderQty: 2000,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 67000.00,
    currency: "USD",
    asnCount: 0,
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
    status: "PENDING_SUPPLIER_CONFIRMATION",
    dataSource: "PR_CONVERSION",
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
    prNos: ["PR202401060001"],
    referenceNo: "REF202403150007",
    supplierName: "Fast Delivery Inc.",
    supplierNo: "SUP007",
    destination: "Main Warehouse - Los Angeles",
    warehouseName: "Main Warehouse",
    status: "CONFIRMED",
    dataSource: "MANUAL",
    totalOrderQty: 750,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 22500.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-19T14:30:00Z",
    updated: "2024-01-20T16:45:00Z",
    expectedArrivalDate: "2024-01-28",
    purchaseOrderDate: "2024-01-19",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "Rush order",
    itemCount: 12,
    exceptions: [],
  },
  {
    id: "8",
    orderNo: "PO202403150008",
    originalPoNo: "EXT-PO-2024-008",
    prNos: ["PR202401040001"],
    referenceNo: "REF202403150008",
    supplierName: "Bulk Suppliers Co.",
    supplierNo: "SUP008",
    destination: "Central Warehouse - Chicago",
    warehouseName: "Central WH",
    status: "IN_FULFILLMENT",
    dataSource: "API_IMPORT",
    totalOrderQty: 3000,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 95000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-17T09:00:00Z",
    updated: "2024-01-21T12:30:00Z",
    expectedArrivalDate: "2024-01-26",
    purchaseOrderDate: "2024-01-17",
    toCity: "Chicago",
    toState: "IL",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Large shipment",
    itemCount: 45,
    exceptions: [],
  },
  {
    id: "9",
    orderNo: "PO202403150009",
    originalPoNo: "EXT-PO-2024-009",
    prNos: ["PR202401030001"],
    referenceNo: "REF202403150009",
    supplierName: "Express Parts Ltd.",
    supplierNo: "SUP009",
    destination: "West Fulfillment Center - Seattle",
    warehouseName: "West FC",
    status: "PARTIALLY_SHIPPED",
    dataSource: "MANUAL",
    totalOrderQty: 1800,
    shippedQty: 900,
    receivedQty: 0,
    totalPrice: 54000.00,
    currency: "USD",
    asnCount: 3,
    created: "2024-01-16T11:15:00Z",
    updated: "2024-01-22T08:20:00Z",
    expectedArrivalDate: "2024-01-24",
    purchaseOrderDate: "2024-01-16",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "Partial shipment in progress",
    itemCount: 25,
    exceptions: [],
  },
  {
    id: "10",
    orderNo: "PO202403150010",
    originalPoNo: "EXT-PO-2024-010",
    prNos: ["PR202401020001"],
    referenceNo: "REF202403150010",
    supplierName: "Complete Solutions Inc.",
    supplierNo: "SUP010",
    destination: "East Distribution Center - New York",
    warehouseName: "East DC",
    status: "FULLY_SHIPPED",
    dataSource: "PR_CONVERSION",
    totalOrderQty: 1200,
    shippedQty: 1200,
    receivedQty: 0,
    totalPrice: 36000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-15T13:45:00Z",
    updated: "2024-01-23T10:15:00Z",
    expectedArrivalDate: "2024-01-25",
    purchaseOrderDate: "2024-01-15",
    toCity: "New York",
    toState: "NY",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "UPS",
    shippingNotes: "Complete shipment",
    itemCount: 20,
    exceptions: [],
  },
  {
    id: "11",
    orderNo: "PO202403150011",
    originalPoNo: "EXT-PO-2024-011",
    prNos: ["PR202401010001"],
    referenceNo: "REF202403150011",
    supplierName: "Precision Manufacturing",
    supplierNo: "SUP011",
    destination: "South Warehouse - Miami",
    warehouseName: "South WH",
    status: "PARTIALLY_RECEIVED",
    dataSource: "MANUAL",
    totalOrderQty: 2500,
    shippedQty: 2500,
    receivedQty: 1500,
    totalPrice: 75000.00,
    currency: "USD",
    asnCount: 4,
    created: "2024-01-14T16:20:00Z",
    updated: "2024-01-24T14:30:00Z",
    expectedArrivalDate: "2024-01-23",
    purchaseOrderDate: "2024-01-14",
    toCity: "Miami",
    toState: "FL",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "DHL",
    shippingNotes: "Receiving in progress",
    itemCount: 30,
    exceptions: [],
  },
  {
    id: "12",
    orderNo: "PO202403150012",
    originalPoNo: "EXT-PO-2024-012",
    prNos: ["PR202312280001"],
    referenceNo: "REF202403150012",
    supplierName: "Final Goods Supply",
    supplierNo: "SUP012",
    destination: "North Warehouse - Boston",
    warehouseName: "North WH",
    status: "FULLY_RECEIVED",
    dataSource: "API_IMPORT",
    totalOrderQty: 800,
    shippedQty: 800,
    receivedQty: 800,
    totalPrice: 24000.00,
    currency: "USD",
    asnCount: 2,
    created: "2024-01-13T12:00:00Z",
    updated: "2024-01-25T16:45:00Z",
    expectedArrivalDate: "2024-01-24",
    purchaseOrderDate: "2024-01-13",
    toCity: "Boston",
    toState: "MA",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "FedEx",
    shippingNotes: "Delivery completed",
    itemCount: 15,
    exceptions: [],
  },
  {
    id: "13",
    orderNo: "PO202403150013",
    originalPoNo: "EXT-PO-2024-013",
    prNos: ["PR202312270001"],
    referenceNo: "REF202403150013",
    supplierName: "Problem Supplier Ltd.",
    supplierNo: "SUP013",
    destination: "Central Warehouse - Chicago",
    warehouseName: "Central WH",
    status: "EXCEPTION",
    dataSource: "MANUAL",
    totalOrderQty: 1000,
    shippedQty: 500,
    receivedQty: 300,
    totalPrice: 30000.00,
    currency: "USD",
    asnCount: 1,
    created: "2024-01-12T10:30:00Z",
    updated: "2024-01-26T09:15:00Z",
    expectedArrivalDate: "2024-01-22",
    purchaseOrderDate: "2024-01-12",
    toCity: "Chicago",
    toState: "IL",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "UPS",
    shippingNotes: "Quality issues detected",
    itemCount: 18,
    exceptions: ["Quality issue", "Quantity mismatch", "Delayed delivery"],
  },
  {
    id: "14",
    orderNo: "PO202403150014",
    originalPoNo: "EXT-PO-2024-014",
    prNos: ["PR202312260001"],
    referenceNo: "REF202403150014",
    supplierName: "Completed Orders Inc.",
    supplierNo: "SUP014",
    destination: "Main Warehouse - Los Angeles",
    warehouseName: "Main Warehouse",
    status: "CLOSED",
    dataSource: "PR_CONVERSION",
    totalOrderQty: 1500,
    shippedQty: 1500,
    receivedQty: 1500,
    totalPrice: 45000.00,
    currency: "USD",
    asnCount: 3,
    created: "2024-01-11T14:45:00Z",
    updated: "2024-01-27T11:30:00Z",
    expectedArrivalDate: "2024-01-21",
    purchaseOrderDate: "2024-01-11",
    toCity: "Los Angeles",
    toState: "CA",
    toCountry: "USA",
    shippingService: "Standard",
    shippingCarrier: "DHL",
    shippingNotes: "Order completed successfully",
    itemCount: 22,
    exceptions: [],
  },
  {
    id: "15",
    orderNo: "PO202403150015",
    originalPoNo: "EXT-PO-2024-015",
    prNos: ["PR202312250001"],
    referenceNo: "REF202403150015",
    supplierName: "Cancelled Supplier Co.",
    supplierNo: "SUP015",
    destination: "West Fulfillment Center - Seattle",
    warehouseName: "West FC",
    status: "CANCELLED",
    dataSource: "MANUAL",
    totalOrderQty: 600,
    shippedQty: 0,
    receivedQty: 0,
    totalPrice: 18000.00,
    currency: "USD",
    asnCount: 0,
    created: "2024-01-10T09:30:00Z",
    updated: "2024-01-28T15:20:00Z",
    expectedArrivalDate: "2024-01-20",
    purchaseOrderDate: "2024-01-10",
    toCity: "Seattle",
    toState: "WA",
    toCountry: "USA",
    shippingService: "Express",
    shippingCarrier: "FedEx",
    shippingNotes: "Order cancelled by customer",
    itemCount: 10,
    exceptions: [],
  },
]

export default function OptimizedPOPage() {
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

  // Enhanced status configuration based on your specification
  const statusConfig = {
    DRAFT: { label: t('DRAFT'), color: "bg-gray-100 text-gray-800", icon: <Edit className="h-3 w-3" /> },
    NEW: { label: t('NEW'), color: "bg-blue-100 text-blue-800", icon: <Plus className="h-3 w-3" /> },
    PENDING_APPROVAL: { label: t('PENDING_APPROVAL'), color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-3 w-3" /> },
    REJECTED: { label: t('REJECTED'), color: "bg-red-100 text-red-800", icon: <X className="h-3 w-3" /> },
    APPROVED: { label: t('APPROVED'), color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
    PENDING_SUPPLIER_CONFIRMATION: { label: t('PENDING_SUPPLIER_CONFIRMATION'), color: "bg-orange-100 text-orange-800", icon: <UserCheck className="h-3 w-3" /> },
    CONFIRMED: { label: t('CONFIRMED'), color: "bg-emerald-100 text-emerald-800", icon: <CheckSquare className="h-3 w-3" /> },
    IN_FULFILLMENT: { label: t('IN_FULFILLMENT'), color: "bg-purple-100 text-purple-800", icon: <PlayCircle className="h-3 w-3" /> },
    PARTIALLY_SHIPPED: { label: t('PARTIALLY_SHIPPED'), color: "bg-indigo-100 text-indigo-800", icon: <Truck className="h-3 w-3" /> },
    FULLY_SHIPPED: { label: t('FULLY_SHIPPED'), color: "bg-cyan-100 text-cyan-800", icon: <Package className="h-3 w-3" /> },
    PARTIALLY_RECEIVED: { label: t('PARTIALLY_RECEIVED'), color: "bg-teal-100 text-teal-800", icon: <Package className="h-3 w-3" /> },
    FULLY_RECEIVED: { label: t('FULLY_RECEIVED'), color: "bg-lime-100 text-lime-800", icon: <CheckCircle className="h-3 w-3" /> },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-red-100 text-red-800", icon: <AlertTriangle className="h-3 w-3" /> },
    CLOSED: { label: t('CLOSED'), color: "bg-slate-100 text-slate-800", icon: <CheckSquare className="h-3 w-3" /> },
    CANCELLED: { label: t('CANCELLED'), color: "bg-gray-100 text-gray-800", icon: <X className="h-3 w-3" /> },
  }

  // Data source configuration
  const dataSourceConfig = {
    MANUAL: { label: t('MANUAL'), color: "bg-blue-50 text-blue-700" },
    PR_CONVERSION: { label: t('PR_CONVERSION'), color: "bg-green-50 text-green-700" },
    API_IMPORT: { label: t('API_IMPORT'), color: "bg-purple-50 text-purple-700" },
  }

  // Enhanced filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t('status'),
      type: "multiple",
      options: [
        { id: "draft", label: t('DRAFT'), value: "DRAFT" },
        { id: "new", label: t('NEW'), value: "NEW" },
        { id: "pending_approval", label: t('PENDING_APPROVAL'), value: "PENDING_APPROVAL" },
        { id: "rejected", label: t('REJECTED'), value: "REJECTED" },
        { id: "approved", label: t('APPROVED'), value: "APPROVED" },
        { id: "pending_supplier_confirmation", label: t('PENDING_SUPPLIER_CONFIRMATION'), value: "PENDING_SUPPLIER_CONFIRMATION" },
        { id: "confirmed", label: t('CONFIRMED'), value: "CONFIRMED" },
        { id: "in_fulfillment", label: t('IN_FULFILLMENT'), value: "IN_FULFILLMENT" },
        { id: "partially_shipped", label: t('PARTIALLY_SHIPPED'), value: "PARTIALLY_SHIPPED" },
        { id: "fully_shipped", label: t('FULLY_SHIPPED'), value: "FULLY_SHIPPED" },
        { id: "partially_received", label: t('PARTIALLY_RECEIVED'), value: "PARTIALLY_RECEIVED" },
        { id: "fully_received", label: t('FULLY_RECEIVED'), value: "FULLY_RECEIVED" },
        { id: "exception", label: t('EXCEPTION'), value: "EXCEPTION" },
        { id: "closed", label: t('CLOSED'), value: "CLOSED" },
        { id: "cancelled", label: t('CANCELLED'), value: "CANCELLED" },
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

  // Calculate status counts
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: mockPOs.length,
      DRAFT: 0,
      NEW: 0,
      PENDING_APPROVAL: 0,
      REJECTED: 0,
      APPROVED: 0,
      PENDING_SUPPLIER_CONFIRMATION: 0,
      CONFIRMED: 0,
      IN_FULFILLMENT: 0,
      PARTIALLY_SHIPPED: 0,
      FULLY_SHIPPED: 0,
      PARTIALLY_RECEIVED: 0,
      FULLY_RECEIVED: 0,
      EXCEPTION: 0,
      CLOSED: 0,
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
      } else if (filter.filterId === "supplier") {
        filtered = filtered.filter(po => po.supplierName === filter.optionValue)
      } else if (filter.filterId === "dataSource") {
        filtered = filtered.filter(po => po.dataSource === filter.optionValue)
      }
    })

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchValue, activeFilters, advancedSearchValues, activeTab])

  // Define available actions based on status according to your specification
  const getAvailableActions = (po: PurchaseOrder) => {
    switch (po.status) {
      case "DRAFT":
        return [
          { label: t('saveAsNew'), icon: <Plus className="h-3 w-3" />, action: () => console.log("Save as NEW", po.orderNo), variant: undefined },
          { label: t('delete'), icon: <X className="h-3 w-3" />, action: () => console.log("Delete", po.orderNo), variant: "destructive" },
        ]
      case "NEW":
        return [
          { label: t('submit'), icon: <Send className="h-3 w-3" />, action: () => console.log("Submit", po.orderNo), variant: undefined },
          { label: t('edit'), icon: <Edit className="h-3 w-3" />, action: () => router.push(`/purchase/po/${po.id}/edit`), variant: undefined },
          { label: t('withdraw'), icon: <RotateCcw className="h-3 w-3" />, action: () => console.log("Withdraw", po.orderNo), variant: undefined },
          { label: t('delete'), icon: <X className="h-3 w-3" />, action: () => console.log("Delete", po.orderNo), variant: "destructive" },
        ]
      case "PENDING_APPROVAL":
        return [
          { label: t('approve'), icon: <CheckCircle className="h-3 w-3" />, action: () => console.log("Approve", po.orderNo), variant: undefined },
          { label: t('reject'), icon: <X className="h-3 w-3" />, action: () => console.log("Reject", po.orderNo), variant: "destructive" },
          { label: t('withdraw'), icon: <RotateCcw className="h-3 w-3" />, action: () => console.log("Withdraw", po.orderNo), variant: undefined },
        ]
      case "REJECTED":
        return [
          { label: t('resubmit'), icon: <Send className="h-3 w-3" />, action: () => console.log("Resubmit", po.orderNo), variant: undefined },
          { label: t('edit'), icon: <Edit className="h-3 w-3" />, action: () => router.push(`/purchase/po/${po.id}/edit`), variant: undefined },
          { label: t('delete'), icon: <X className="h-3 w-3" />, action: () => console.log("Delete", po.orderNo), variant: "destructive" },
        ]
      case "APPROVED":
        return [
          { label: t('sendToSupplier'), icon: <Send className="h-3 w-3" />, action: () => console.log("Send to Supplier", po.orderNo), variant: undefined },
          { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", po.orderNo), variant: "destructive" },
          { label: t('limitedEdit'), icon: <Edit className="h-3 w-3" />, action: () => router.push(`/purchase/po/${po.id}/edit`), variant: undefined },
        ]
      case "PENDING_SUPPLIER_CONFIRMATION":
        return [
          { label: t('supplierAcknowledge'), icon: <UserCheck className="h-3 w-3" />, action: () => console.log("Supplier Acknowledge", po.orderNo), variant: undefined },
          { label: t('supplierReject'), icon: <UserX className="h-3 w-3" />, action: () => console.log("Supplier Reject", po.orderNo), variant: "destructive" },
          { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", po.orderNo), variant: "destructive" },
        ]
      case "CONFIRMED":
        return [
          { label: t('startFulfillment'), icon: <PlayCircle className="h-3 w-3" />, action: () => console.log("Start Fulfillment", po.orderNo), variant: undefined },
          { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", po.orderNo), variant: "destructive" },
        ]
      case "IN_FULFILLMENT":
        return [
          { label: t('shipmentPartial'), icon: <Truck className="h-3 w-3" />, action: () => console.log("Shipment Partial", po.orderNo), variant: undefined },
          { label: t('shipmentFull'), icon: <Package className="h-3 w-3" />, action: () => console.log("Shipment Full", po.orderNo), variant: undefined },
          { label: t('markException'), icon: <AlertTriangle className="h-3 w-3" />, action: () => console.log("Mark Exception", po.orderNo), variant: "destructive" },
        ]
      case "PARTIALLY_SHIPPED":
        return [
          { label: t('continueShipment'), icon: <Truck className="h-3 w-3" />, action: () => console.log("Continue Shipment", po.orderNo), variant: undefined },
          { label: t('receiptPartial'), icon: <Package className="h-3 w-3" />, action: () => console.log("Receipt Partial", po.orderNo), variant: undefined },
          { label: t('receiptFull'), icon: <CheckCircle className="h-3 w-3" />, action: () => console.log("Receipt Full", po.orderNo), variant: undefined },
        ]
      case "FULLY_SHIPPED":
        return [
          { label: t('receiptPartial'), icon: <Package className="h-3 w-3" />, action: () => console.log("Receipt Partial", po.orderNo), variant: undefined },
          { label: t('receiptFull'), icon: <CheckCircle className="h-3 w-3" />, action: () => console.log("Receipt Full", po.orderNo), variant: undefined },
        ]
      case "PARTIALLY_RECEIVED":
        return [
          { label: t('continueReceipt'), icon: <Package className="h-3 w-3" />, action: () => console.log("Continue Receipt", po.orderNo), variant: undefined },
          { label: t('acceptVariance'), icon: <CheckCircle className="h-3 w-3" />, action: () => console.log("Accept Variance", po.orderNo), variant: undefined },
          { label: t('markException'), icon: <AlertTriangle className="h-3 w-3" />, action: () => console.log("Mark Exception", po.orderNo), variant: "destructive" },
        ]
      case "FULLY_RECEIVED":
        return [
          { label: t('autoClose'), icon: <CheckSquare className="h-3 w-3" />, action: () => console.log("Auto Close", po.orderNo), variant: undefined },
          { label: t('manualClose'), icon: <Pause className="h-3 w-3" />, action: () => console.log("Manual Close", po.orderNo), variant: undefined },
        ]
      case "EXCEPTION":
        return [
          { label: t('resolveAndContinue'), icon: <RotateCcw className="h-3 w-3" />, action: () => console.log("Resolve & Continue", po.orderNo), variant: undefined },
          { label: t('acceptVarianceClose'), icon: <CheckCircle className="h-3 w-3" />, action: () => console.log("Accept Variance", po.orderNo), variant: undefined },
          { label: t('cancel'), icon: <X className="h-3 w-3" />, action: () => console.log("Cancel", po.orderNo), variant: "destructive" },
        ]
      case "CLOSED":
      case "CANCELLED":
        return [
          { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${po.id}`), variant: undefined },
        ]
      default:
        return [
          { label: t('view'), icon: <Eye className="h-3 w-3" />, action: () => router.push(`/purchase/po/${po.id}`), variant: undefined },
        ]
    }
  }

  // Define columns
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
      width: "180px",
      defaultVisible: true,
      cell: (row) => {
        const config = statusConfig[row.status]
        return (
          <Badge className={`${config.color} flex items-center gap-1`}>
            {config.icon}
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: "supplierName",
      header: t('supplierName'),
      accessorKey: "supplierName",
      width: "200px",
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
      id: "progress",
      header: t('receivingProgress'),
      width: "150px",
      defaultVisible: true,
      cell: (row) => (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{t('shipped')}: {row.shippedQty}</span>
            <span>{row.totalOrderQty > 0 ? `${((row.shippedQty / row.totalOrderQty) * 100).toFixed(0)}%` : '0%'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${row.totalOrderQty > 0 ? (row.shippedQty / row.totalOrderQty) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs">
            <span>{t('received')}: {row.receivedQty}</span>
            <span>{row.totalOrderQty > 0 ? `${((row.receivedQty / row.totalOrderQty) * 100).toFixed(0)}%` : '0%'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-600 h-1.5 rounded-full" 
              style={{ width: `${row.totalOrderQty > 0 ? (row.receivedQty / row.totalOrderQty) * 100 : 0}%` }}
            ></div>
          </div>
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
      defaultVisible: false,
    },
    {
      id: "exceptions",
      header: t('exceptions'),
      width: "100px",
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
      id: "actions",
      header: t('actions'),
      width: "300px",
      defaultVisible: true,
      cell: (row) => {
        const actions = getAvailableActions(row)

        return (
          <div className="flex gap-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
            {actions.length > 0 ? (
              actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === "destructive" ? "destructive" : "outline"}
                  size="sm"
                  onClick={action.action}
                  className="text-xs px-2 py-1 h-7 flex items-center gap-1"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">{t('none')}</span>
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
            { label: t('batchDelete'), action: () => console.log("Batch delete", selectedRows), variant: "destructive" },
          ]
        case "NEW":
          return [
            { label: t('batchSubmit'), action: () => console.log("Batch submit", selectedRows) },
            { label: t('batchDelete'), action: () => console.log("Batch delete", selectedRows), variant: "destructive" },
          ]
        case "PENDING_APPROVAL":
          return [
            { label: t('batchApprove'), action: () => console.log("Batch approve", selectedRows) },
            { label: t('batchReject'), action: () => console.log("Batch reject", selectedRows), variant: "destructive" },
          ]
        case "APPROVED":
          return [
            { label: t('batchSend'), action: () => console.log("Batch send to supplier", selectedRows) },
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
            <h1 className="text-3xl font-bold tracking-tight">{t('purchaseOrders')} - {t('optimized')}</h1>
            <p className="text-muted-foreground">
              {t('managePurchaseOrders')} - 优化的状态和操作流程
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
            
            {/* Batch Actions Dropdown */}
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

        {/* Enhanced Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">
              {t('all')} <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
            </TabsTrigger>
            <TabsTrigger value="DRAFT">
              {t('DRAFT')} <Badge variant="secondary" className="ml-2">{statusCounts.DRAFT}</Badge>
            </TabsTrigger>
            <TabsTrigger value="NEW">
              {t('NEW')} <Badge variant="secondary" className="ml-2">{statusCounts.NEW}</Badge>
            </TabsTrigger>
            <TabsTrigger value="PENDING_APPROVAL">
              {t('PENDING_APPROVAL')} <Badge variant="secondary" className="ml-2">{statusCounts.PENDING_APPROVAL}</Badge>
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              {t('APPROVED')} <Badge variant="secondary" className="ml-2">{statusCounts.APPROVED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CONFIRMED">
              {t('CONFIRMED')} <Badge variant="secondary" className="ml-2">{statusCounts.CONFIRMED}</Badge>
            </TabsTrigger>
            <TabsTrigger value="EXCEPTION">
              {t('EXCEPTION')} <Badge variant="secondary" className="ml-2">{statusCounts.EXCEPTION}</Badge>
            </TabsTrigger>
            <TabsTrigger value="CLOSED">
              {t('CLOSED')} <Badge variant="secondary" className="ml-2">{statusCounts.CLOSED}</Badge>
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