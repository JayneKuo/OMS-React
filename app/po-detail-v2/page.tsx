"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { POSendDialog } from "@/components/purchase/po-send-dialog"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  FileText, ShoppingCart, Truck, Package, CheckCircle, ArrowLeft, Edit, Send,
  Download, Eye, Copy, AlertCircle, Calendar, Building, User, MapPin, Clock,
  TrendingUp, RefreshCw, ExternalLink, Phone, Mail, History, Info, XCircle,
  FilePlus, Loader2, Lock, MoreHorizontal, Pencil, Ban
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"

// Mock PO Detail Data - ALL data from original file
const mockPODetail = {
  id: "1",
  orderNo: "PO202403150001",
  originalPoNo: "EXT-PO-2024-001",
  referenceNo: "REF202403150001",
  status: "CONFIRMED",
  shippingStatus: "SHIPMENT_CREATED",
  receivingStatus: "PARTIALLY_RECEIVED",
  dataSource: "PR_CONVERSION",

  // Basic Info
  supplierName: "ABC Suppliers Inc.",
  supplierCode: "SUP001",
  contactPerson: "John Smith",
  contactPhone: "+1-555-0123",
  contactEmail: "john.smith@abcsuppliers.com",

  // Addresses
  supplierAddress: "456 Supplier Ave, New York, NY 10001",
  warehouseName: "Main Warehouse",
  warehouseAddress: "1234 Warehouse St, Los Angeles, CA 90001",
  warehouseCode: "WH001",

  // Financial
  totalOrderQty: 500,
  shippedQty: 260,
  receivedQty: 265,
  subtotal: 29500.00,
  taxAmount: 3835.00,
  shippingCost: 200.00,
  shippingTaxAmount: 26.00,
  handlingFee: 50.00,
  otherCharge: 0.00,
  totalAmount: 33611.00,
  currency: "USD",
  paymentTerms: "NET 30",
  deliveryTerms: "FOB Destination",

  // Timeline
  created: "2024-01-15T10:30:00Z",
  updated: "2024-01-16T14:20:00Z",
  expectedArrivalDate: "2024-01-25",
  requestedDeliveryDate: "2024-01-22",

  // Related PRs
  relatedPRs: ["PR202401100001", "PR202401100002"],

  // Email tracking
  sentToSupplier: true,
  lastSentDate: "2024-01-15T11:00:00Z",

  // Line Items - 体现所有编辑场景
  lineItems: [
    {
      id: "1",
      lineNo: 1,
      skuCode: "SKU001",
      productName: "iPhone 15 Pro",
      specifications: "256GB, Natural Titanium",
      length: 14.66,
      width: 7.06,
      height: 0.83,
      volume: 85.95,
      quantity: 100,
      uom: "PCS",
      unitPrice: 50.00,
      taxRate: 13,
      taxAmount: 650.00,
      lineAmount: 5650.00,
      shippedQty: 60,
      receivedQty: 70,
      fulfilledQty: 80,
      returnedQty: 0,
      requiresSerialNumber: true,
      requiresLotNumber: false,
      specifiedSerialNumbers: ["SN-IP15-001", "SN-IP15-002"],
      specifiedLotNumbers: [],
      supplierName: "ABC Suppliers Inc.",
      notes: "首批加急发货",
    },
    {
      id: "2",
      lineNo: 2,
      skuCode: "SKU002",
      productName: "MacBook Pro",
      specifications: "14-inch, M3 Pro",
      length: 31.26,
      width: 22.12,
      height: 1.55,
      volume: 1071.76,
      quantity: 50,
      uom: "PCS",
      unitPrice: 150.00,
      taxRate: 13,
      taxAmount: 975.00,
      lineAmount: 8475.00,
      shippedQty: 0,
      receivedQty: 0,
      fulfilledQty: 0,
      returnedQty: 0,
      requiresSerialNumber: true,
      requiresLotNumber: false,
      specifiedSerialNumbers: [],
      specifiedLotNumbers: [],
      supplierName: "ABC Suppliers Inc.",
      notes: "",
    },
    {
      id: "3",
      lineNo: 3,
      skuCode: "SKU003",
      productName: "iPad Pro",
      specifications: "12.9-inch, M2",
      length: 28.06,
      width: 21.49,
      height: 0.64,
      volume: 385.93,
      quantity: 100,
      uom: "PCS",
      unitPrice: 80.00,
      taxRate: 13,
      taxAmount: 1040.00,
      lineAmount: 9040.00,
      shippedQty: 30,
      receivedQty: 15,
      fulfilledQty: 30,
      returnedQty: 0,
      requiresSerialNumber: true,
      requiresLotNumber: true,
      specifiedSerialNumbers: [],
      specifiedLotNumbers: ["LOT20240110"],
      supplierName: "ABC Suppliers Inc.",
      notes: "包含教育版配件",
    },
    {
      id: "4",
      lineNo: 4,
      skuCode: "SKU004",
      productName: "AirPods Pro",
      specifications: "2nd Gen",
      length: 6.06,
      width: 4.52,
      height: 2.17,
      volume: 59.44,
      quantity: 200,
      uom: "PCS",
      unitPrice: 25.00,
      taxRate: 13,
      taxAmount: 650.00,
      lineAmount: 5650.00,
      shippedQty: 200,
      receivedQty: 200,
      fulfilledQty: 200,
      returnedQty: 0,
      requiresSerialNumber: false,
      requiresLotNumber: true,
      specifiedSerialNumbers: [],
      specifiedLotNumbers: ["LOT240101-A", "LOT240101-B"],
      supplierName: "Audio Tech Ltd.",
      notes: "",
    },
    {
      id: "5",
      lineNo: 5,
      skuCode: "SKU005",
      productName: "Apple Watch Ultra",
      specifications: "49mm, Titanium",
      length: 4.9,
      width: 4.4,
      height: 1.44,
      volume: 31.05,
      quantity: 50,
      uom: "PCS",
      unitPrice: 80.00,
      taxRate: 13,
      taxAmount: 520.00,
      lineAmount: 4520.00,
      shippedQty: 0,
      receivedQty: 25,
      fulfilledQty: 25,
      returnedQty: 0,
      requiresSerialNumber: true,
      requiresLotNumber: false,
      specifiedSerialNumbers: [],
      specifiedLotNumbers: [],
      supplierName: "Wearable Inc.",
      notes: "钛金属版直接入库",
    },
  ],

  // Shipment Records
  shipmentRecords: [
    {
      id: "1",
      shipmentNo: "SHP202401150001",
      shippedQty: 75,
      carrier: "FedEx",
      trackingNo: "1234567890",
      shippingStatus: "SHIPPED",
      shippingMethod: "Air Freight",
      deliveryService: "Express",
      flightNo: "FX5432",
      airlineCode: "FDX",
      departureAirport: "JFK",
      arrivalAirport: "LAX",
      packageNo: "PKG-001-2024",
      packageCount: 3,
      palletNo: "PLT-A-001",
      palletCount: 1,
      estimatedArrival: "2024-01-25",
      shippingDate: "2024-01-18",
      fromAddress: "456 Supplier Ave, New York, NY 10001",
      fromCity: "New York",
      fromCountry: "USA",
      toAddress: "1234 Warehouse St, Los Angeles, CA 90001",
      toCity: "Los Angeles",
      toCountry: "USA",
      createdBy: "供应商",
      createdDate: "2024-01-18T08:00:00Z",
      notes: "标准发货，预计3-5个工作日到达",
    },
    {
      id: "2",
      shipmentNo: "SHP202401120001",
      shippedQty: 25,
      carrier: "DHL",
      trackingNo: "9876543210",
      shippingStatus: "DELIVERED",
      shippingMethod: "Ground",
      deliveryService: "Standard",
      vehicleNo: "TRK-8899",
      driverName: "John Driver",
      driverPhone: "+1-555-9988",
      packageNo: "PKG-002-2024",
      packageCount: 1,
      palletNo: "PLT-B-001",
      palletCount: 1,
      estimatedArrival: "2024-01-22",
      actualArrival: "2024-01-22",
      shippingDate: "2024-01-15",
      fromAddress: "456 Supplier Ave, New York, NY 10001",
      fromCity: "New York",
      fromCountry: "USA",
      toAddress: "1234 Warehouse St, Los Angeles, CA 90001",
      toCity: "Los Angeles",
      toCountry: "USA",
      createdBy: "供应商",
      createdDate: "2024-01-15T10:30:00Z",
      notes: "加急发货，已按时到达",
    },
    {
      id: "3",
      shipmentNo: "SHP202401100001",
      shippedQty: 30,
      carrier: "Maersk Line",
      trackingNo: "5555666677",
      shippingStatus: "IN_TRANSIT",
      shippingMethod: "Sea Freight",
      deliveryService: "FCL",
      vesselName: "MSC OSCAR",
      voyageNo: "VOY-2024-001",
      containerNo: "MSCU1234567",
      containerType: "40HC",
      containerCount: 1,
      portOfLoading: "Shanghai Port",
      portOfDischarge: "Los Angeles Port",
      estimatedArrival: "2024-01-28",
      shippingDate: "2024-01-20",
      fromAddress: "Building 5, Export Processing Zone, Shanghai, China",
      fromCity: "Shanghai",
      fromCountry: "China",
      toAddress: "1234 Warehouse St, Los Angeles, CA 90001",
      toCity: "Los Angeles",
      toCountry: "USA",
      createdBy: "供应商",
      createdDate: "2024-01-20T14:15:00Z",
      notes: "补发货物，运输中",
    },
  ],

  // Receipt Records
  receiptRecords: [
    {
      id: "1",
      receiptNo: "RCP202401200001",
      wmsReceiptNo: "RN-2024-001", // WMS Receipt Number
      receiptDate: "2024-01-20T09:30:00Z",
      receivedQty: 50,
      receivedBy: "张三",
      receiptStatus: "CLOSED",
      notes: "部分收货，剩余货物预计明日到达",
      relatedShipment: "SHP202401150001",
      warehouseLocation: "A区-01-001",
      qualityStatus: "PASSED",
      damageQty: 0,
      rejectedQty: 0,
      pushedToWarehouse: true,
      pushedDate: "2024-01-20T10:00:00Z",
    },
    {
      id: "2",
      receiptNo: "RCP202401180001",
      wmsReceiptNo: "RN-2024-002", // WMS Receipt Number
      receiptDate: "2024-01-18T14:15:00Z",
      receivedQty: 25,
      receivedBy: "李四",
      receiptStatus: "CLOSED",
      notes: "货物状态良好，已入库",
      relatedShipment: "SHP202401120001",
      warehouseLocation: "A区-01-002",
      qualityStatus: "PASSED",
      damageQty: 0,
      rejectedQty: 0,
      pushedToWarehouse: true,
      pushedDate: "2024-01-18T15:00:00Z",
    },
    {
      id: "3",
      receiptNo: "RCP202401220001",
      wmsReceiptNo: "RN-2024-003", // WMS Receipt Number
      receiptDate: "2024-01-22T11:45:00Z",
      receivedQty: 18,
      receivedBy: "王五",
      receiptStatus: "PARTIAL_DAMAGE",
      notes: "部分货物包装破损，已分拣处理",
      relatedShipment: "SHP202401100001",
      warehouseLocation: "A区-01-003",
      qualityStatus: "PARTIAL_DAMAGE",
      damageQty: 2,
      rejectedQty: 0,
      pushedToWarehouse: false,
      pushedDate: null,
    },
    {
      id: "4",
      receiptNo: "RCP202401250001",
      wmsReceiptNo: null, // 未推送到仓库，没有WMS单号
      receiptDate: "2024-01-25T16:30:00Z",
      receivedQty: 35,
      receivedBy: "赵六",
      receiptStatus: "NEW",
      notes: "新收货单，待推送到仓库",
      relatedShipment: "SHP202401150001",
      warehouseLocation: "待分配",
      qualityStatus: "PENDING",
      damageQty: 0,
      rejectedQty: 0,
      pushedToWarehouse: false,
      pushedDate: null,
    },
  ],

  // RTV Records (Return to Vendor)
  rtvRecords: [
    {
      id: "1",
      rtvNo: "RTV202401250001",
      returnDate: "2024-01-25T10:00:00Z",
      returnedQty: 2,
      returnReason: "DAMAGED",
      returnStatus: "APPROVED",
      returnedBy: "王五",
      notes: "包装破损，无法销售",
      relatedReceipt: "RCP202401220001",
      supplierApproval: "APPROVED",
      approvalDate: "2024-01-25T15:30:00Z",
      refundAmount: 300.00,
      refundStatus: "PENDING",
    },
    {
      id: "2",
      rtvNo: "RTV202401260001",
      returnDate: "2024-01-26T14:20:00Z",
      returnedQty: 1,
      returnReason: "QUALITY_ISSUE",
      returnStatus: "PENDING_APPROVAL",
      returnedBy: "张三",
      notes: "产品功能异常，需要退回供应商检测",
      relatedReceipt: "RCP202401200001",
      supplierApproval: "PENDING",
      approvalDate: null,
      refundAmount: 150.00,
      refundStatus: "PENDING",
    },
  ],

  // Email History
  emailHistory: [
    {
      id: "email-1",
      sentDate: "2024-01-15T11:00:00Z",
      from: "purchasing@company.com",
      recipients: ["john.smith@abcsuppliers.com"],
      cc: ["manager@company.com"],
      subject: "Purchase Order PO202403150001 - ABC Suppliers Inc.",
      body: "Dear ABC Suppliers Inc.,\n\nPlease find attached Purchase Order PO202403150001 for your review and confirmation.\n\nOrder Summary:\n- PO Number: PO202403150001\n- Total Items: 15\n- Total Amount: USD 12,500.00\n\nPlease confirm receipt and provide your estimated delivery date.\n\nBest regards",
      pdfTemplate: "standard",
      status: "SENT",
      sentBy: "John Doe"
    },
    {
      id: "email-2",
      sentDate: "2024-01-16T09:30:00Z",
      from: "purchasing@company.com",
      recipients: ["john.smith@abcsuppliers.com"],
      subject: "Follow-up: Purchase Order PO202403150001",
      body: "Dear John,\n\nThis is a follow-up on PO202403150001. Please confirm receipt and provide delivery timeline.\n\nThank you.",
      pdfTemplate: "compact",
      status: "SENT",
      sentBy: "Jane Smith"
    }
  ],
}


// NEW MOCK DATA - Progress Data
const progressData = [
  {
    step: 1,
    label: "Imported",
    status: "completed",
    timestamp: "2024-01-15T10:30:00Z",
    description: "PO imported from supplier system"
  },
  {
    step: 2,
    label: "Allocated",
    status: "completed",
    timestamp: "2024-01-15T11:15:00Z",
    description: "Inventory allocated to warehouse"
  },
  {
    step: 3,
    label: "Warehouse-Processing",
    status: "in-progress",
    timestamp: "2024-01-18T08:00:00Z",
    description: "Processing at warehouse facility"
  },
  {
    step: 4,
    label: "Shipped",
    status: "pending",
    timestamp: null,
    description: "Awaiting shipment completion"
  },
]

// NEW MOCK DATA - Routing History
const routingHistory = [
  {
    id: "route-1",
    timestamp: "2024-01-15T10:30:00Z",
    action: "Initial Routing",
    details: "PO automatically routed to Main Warehouse (WH001) based on supplier location",
    user: "System Auto-Routing"
  },
  {
    id: "route-2",
    timestamp: "2024-01-16T14:20:00Z",
    action: "Route Modified",
    details: "Changed delivery warehouse from WH001 to WH002 due to capacity constraints",
    user: "John Doe"
  },
  {
    id: "route-3",
    timestamp: "2024-01-17T09:15:00Z",
    action: "Route Confirmed",
    details: "Final routing confirmed: Main Warehouse (WH001) - Capacity issue resolved",
    user: "Jane Smith"
  },
  {
    id: "route-4",
    timestamp: "2024-01-18T08:00:00Z",
    action: "Carrier Assigned",
    details: "FedEx assigned as primary carrier for shipment SHP202401150001",
    user: "System"
  },
]

// NEW MOCK DATA - Event History
const eventHistory = [
  {
    id: "event-1",
    timestamp: "2024-01-15T10:30:00Z",
    event: "PO Created",
    description: "Purchase Order created from PR conversion",
    user: "System"
  },
  {
    id: "event-2",
    timestamp: "2024-01-15T11:00:00Z",
    event: "Email Sent",
    description: "PO sent to supplier via email (john.smith@abcsuppliers.com)",
    user: "John Doe"
  },
  {
    id: "event-3",
    timestamp: "2024-01-15T15:30:00Z",
    event: "Status Changed",
    description: "Status updated from CREATED to CONFIRMED",
    user: "Supplier Portal"
  },
  {
    id: "event-4",
    timestamp: "2024-01-18T08:00:00Z",
    event: "Shipment Created",
    description: "Shipment SHP202401150001 created (75 units)",
    user: "Supplier"
  },
  {
    id: "event-5",
    timestamp: "2024-01-20T09:30:00Z",
    event: "Partial Receipt",
    description: "Received 50 units at warehouse (Receipt: RCP202401200001)",
    user: "张三"
  },
  {
    id: "event-6",
    timestamp: "2024-01-22T11:45:00Z",
    event: "Quality Issue",
    description: "2 units damaged during receipt inspection",
    user: "王五"
  },
  {
    id: "event-7",
    timestamp: "2024-01-25T10:00:00Z",
    event: "RTV Initiated",
    description: "Return to vendor initiated for 2 damaged units (RTV202401250001)",
    user: "王五"
  },
]

// Receipt Confirmation Mock Data
const receiptConfirmations = [
  {
    id: "RC-001",
    receiptConfirmNo: "RC-2024-001",
    status: "NEW",
    referenceNo: "REF-2024-001",
    receiptNo: "RCP-2024-001",
    inboundReceiptNo: "RN-2024-001",
    receiptType: "REGULAR_RECEIPT",
    warehouse: "Main Warehouse - Los Angeles",
    customer: "ABC Company",
    carrierName: "FedEx",
    containerNo: "CONT-123456",
    poNo: "PO-2024-001",
    totalReceivedQty: 80,
    totalExpectedQty: 150,
    receivedBy: "John Smith",
    receivedTime: "2024-01-20T10:30:00Z",
  },
  {
    id: "RC-002",
    receiptConfirmNo: "RC-2024-002",
    status: "CLOSED",
    referenceNo: "REF-2024-002",
    receiptNo: "RCP-2024-002",
    inboundReceiptNo: "RN-2024-002",
    receiptType: "REGULAR_RECEIPT",
    warehouse: "New York Warehouse",
    customer: "XYZ Corporation",
    carrierName: "UPS",
    poNo: "PO-2024-002",
    totalReceivedQty: 200,
    totalExpectedQty: 200,
    receivedBy: "Jane Doe",
    receivedTime: "2024-01-18T14:15:00Z",
  },
  {
    id: "RC-003",
    receiptConfirmNo: "RC-2024-003",
    status: "CLOSED",
    referenceNo: "REF-2024-003",
    receiptNo: "RCP-2024-001",
    inboundReceiptNo: "RN-2024-003",
    receiptType: "REGULAR_RECEIPT",
    warehouse: "Main Warehouse - Los Angeles",
    customer: "ABC Company",
    carrierName: "DHL",
    containerNo: "CONT-789012",
    poNo: "PO-2024-001",
    totalReceivedQty: 70,
    totalExpectedQty: 150,
    receivedBy: "Mike Johnson",
    receivedTime: "2024-01-21T09:00:00Z",
  },
]

// Progress Steps Generator - 根据PO状态生成不同的进度流程
const getProgressSteps = (poStatus: string) => {
  // 基础步骤
  const baseSteps = [
    {
      step: 1,
      label: "New",
      key: "NEW",
      description: "PO created",
      timestamp: "2024-01-15T10:30:00Z",
    },
    {
      step: 2,
      label: "Processing",
      key: "PROCESSING",
      description: "Order processing",
      timestamp: "2024-01-15T11:15:00Z",
    },
  ]

  // 根据不同状态定义不同的终点
  const endpointMap: Record<string, any> = {
    CLOSED: {
      step: 3,
      label: "Closed",
      key: "CLOSED",
      description: "Order completed and closed",
      timestamp: "2024-01-20T09:30:00Z",
    },
    CANCELLED: {
      step: 3,
      label: "Cancelled",
      key: "CANCELLED",
      description: "Order cancelled",
      timestamp: "2024-01-16T14:00:00Z",
    },
    EXCEPTION: {
      step: 3,
      label: "Exception",
      key: "EXCEPTION",
      description: "Order has exceptions",
      timestamp: "2024-01-18T10:00:00Z",
    },
  }

  // 确定当前状态和终点
  const endpoint = endpointMap[poStatus] || endpointMap.CLOSED

  // 组合完整步骤
  const allSteps = [...baseSteps, endpoint]

  // 根据当前状态设置每个步骤的状态
  return allSteps.map((step, index) => {
    let status = 'pending'

    if (poStatus === 'NEW') {
      status = index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'pending'
    } else if (poStatus === 'PROCESSING' || poStatus === 'IN_TRANSIT' || poStatus === 'RECEIVING') {
      status = index === 0 ? 'completed' : index === 1 ? 'in-progress' : 'pending'
    } else if (poStatus === 'CLOSED' || poStatus === 'COMPLETED') {
      status = 'completed'
    } else if (poStatus === 'CANCELLED') {
      status = index === 0 ? 'completed' : index === 1 ? 'completed' : index === 2 ? 'cancelled' : 'pending'
    } else if (poStatus === 'EXCEPTION') {
      status = index === 0 ? 'completed' : index === 1 ? 'completed' : index === 2 ? 'exception' : 'pending'
    }

    return {
      ...step,
      status,
    }
  })
}

export default function PODetailPage() {
  const { t } = useI18n()
  const router = useRouter()
  const sidebarItems = createPurchaseSidebarItems(t)
  const [activeMainTab, setActiveMainTab] = React.useState("items")
  const [activeSideTab, setActiveSideTab] = React.useState("routing")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSendDialog, setShowSendDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [showCloseLineDialog, setShowCloseLineDialog] = React.useState(false)
  const [showProductSelectionDialog, setShowProductSelectionDialog] = React.useState(false)
  const [selectedLineForClose, setSelectedLineForClose] = React.useState<typeof mockPODetail.lineItems[0] | null>(null)
  const [editedLineItems, setEditedLineItems] = React.useState(mockPODetail.lineItems)
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})
  const [selectedReceipt, setSelectedReceipt] = React.useState<string | null>(mockPODetail.receiptRecords[0]?.id || null)
  const [selectedShipment, setSelectedShipment] = React.useState<string | null>(mockPODetail.shipmentRecords[0]?.id || null)
  const [poData, setPOData] = React.useState(mockPODetail)

  // 根据PO状态生成进度步骤
  const progressSteps = React.useMemo(() => {
    return getProgressSteps(poData.status)
  }, [poData.status])


  // Refresh handler
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // Send PO handler
  const handleSendPO = (emailData: any) => {
    console.log("Send PO Email:", emailData)
  }

  // Status configurations using CSS variables
  const statusConfig = {
    DRAFT: { label: "草稿", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    CREATED: { label: "已创建", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
    PENDING_CONFIRMATION: { label: "待确认", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
    CONFIRMED: { label: "已确认", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
    PARTIALLY_RECEIVED: { label: "部分收货", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
    CLOSED: { label: "已关闭", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400" },
    REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
    CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  }

  const shippingStatusConfig = {
    NOT_SHIPPED: { label: "未发货", color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    SHIPMENT_CREATED: { label: "发货单已创建", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    SHIPPED: { label: "已发货", color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" },
    IN_TRANSIT: { label: "运输中", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" },
    ARRIVED_AT_WAREHOUSE: { label: "已到仓", color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
  }

  const receivingStatusConfig = {
    NOT_RECEIVED: { label: "未收货", color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    IN_RECEIVING: { label: "收货中", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    PARTIALLY_RECEIVED: { label: "部分收货", color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" },
    FULLY_RECEIVED: { label: "收货完成", color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" },
  }

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-4">
          {/* Header with title and action buttons */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{poData.orderNo}</h1>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[poData.status as keyof typeof statusConfig]?.color || "bg-gray-100 text-gray-800"}>
                        {statusConfig[poData.status as keyof typeof statusConfig]?.label || poData.status}
                      </Badge>
                      {poData.shippingStatus && (
                        <Badge variant="outline" className={shippingStatusConfig[poData.shippingStatus as keyof typeof shippingStatusConfig]?.color}>
                          {shippingStatusConfig[poData.shippingStatus as keyof typeof shippingStatusConfig]?.label}
                        </Badge>
                      )}
                      {poData.receivingStatus && (
                        <Badge variant="outline" className={receivingStatusConfig[poData.receivingStatus as keyof typeof receivingStatusConfig]?.color}>
                          {receivingStatusConfig[poData.receivingStatus as keyof typeof receivingStatusConfig]?.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Building className="h-3 w-3" />
                    <span>供应商: {poData.supplierName}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>创建时间: {new Date(poData.created).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>刷新数据</p>
                  </TooltipContent>
                </Tooltip>
                <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                  <Pencil className="h-4 w-4" />
                  <span className="ml-2">编辑明细</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSendDialog(true)}>
                  <Send className="h-4 w-4" />
                  <span className="ml-2">发送</span>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                  <span className="ml-2">下载</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="ml-2">更多</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/purchase/po/${poData.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑订单
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      复制订单
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      取消订单
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>


          {/* Progress Steps Component */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {progressSteps.map((step, index) => {
                  // 根据步骤key选择合适的图标
                  const getStepIcon = () => {
                    if (step.status === 'completed') {
                      return <CheckCircle className="h-5 w-5" />
                    }
                    if (step.status === 'cancelled') {
                      return <XCircle className="h-5 w-5" />
                    }
                    if (step.status === 'exception') {
                      return <AlertCircle className="h-5 w-5" />
                    }

                    // 根据步骤类型选择图标
                    switch (step.key) {
                      case 'NEW':
                        return <FilePlus className="h-5 w-5" />
                      case 'PROCESSING':
                        return <Loader2 className="h-5 w-5" />
                      case 'CLOSED':
                        return <Lock className="h-5 w-5" />
                      case 'CANCELLED':
                        return <XCircle className="h-5 w-5" />
                      case 'EXCEPTION':
                        return <AlertCircle className="h-5 w-5" />
                      default:
                        return <Package className="h-5 w-5" />
                    }
                  }

                  return (
                    <React.Fragment key={step.step}>
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : step.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : step.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                              : step.status === 'exception'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                          }`}>
                          {getStepIcon()}
                        </div>
                        <div className="mt-2 text-center">
                          <div className={`text-sm font-medium ${step.status === 'cancelled' ? 'text-gray-600 dark:text-gray-400' :
                            step.status === 'exception' ? 'text-red-600 dark:text-red-400' : ''
                            }`}>{step.label}</div>
                          <div className="text-xs text-muted-foreground mt-1">{step.description}</div>
                          {step.timestamp && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(step.timestamp).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {index < progressSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-2 ${step.status === 'completed'
                          ? 'bg-green-300 dark:bg-green-700'
                          : step.status === 'cancelled'
                            ? 'bg-gray-300 dark:bg-gray-700'
                            : step.status === 'exception'
                              ? 'bg-red-300 dark:bg-red-700'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Two-column grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* LEFT COLUMN - Main Tabs (3/4 width) */}
            <div className="lg:col-span-3">
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="receipts">Warehouse Receipts</TabsTrigger>
                  <TabsTrigger value="confirmation">Receipt Confirmation</TabsTrigger>
                  <TabsTrigger value="shipments">Shipment Tracking</TabsTrigger>
                  <TabsTrigger value="emails">
                    Email History
                    {mockPODetail.emailHistory && mockPODetail.emailHistory.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {mockPODetail.emailHistory.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>


                {/* Items Tab - Product line items table */}
                <TabsContent value="items" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Product Line Items</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50 whitespace-nowrap">
                              <TableHead className="text-sm font-medium p-3">行号</TableHead>
                              <TableHead className="text-sm font-medium p-3">商品</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-right">需求数</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-center">发货数</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-center">收货数</TableHead>
                              <TableHead className="text-sm font-medium p-3">单位</TableHead>
                              <TableHead className="text-sm font-medium p-3">单价</TableHead>
                              <TableHead className="text-sm font-medium p-3">税率</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-right">税额</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-right">含税总价</TableHead>
                              <TableHead className="text-sm font-medium p-3">SN/批次</TableHead>
                              <TableHead className="text-sm font-medium p-3">备注</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {poData.lineItems.map((item) => (
                              <TableRow key={item.id} className="hover:bg-muted/50">
                                <TableCell className="text-xs p-3">
                                  <Badge variant="outline" className="text-xs bg-white dark:bg-black">
                                    {item.lineNo.toString().padStart(2, '0')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs p-3 min-w-[200px]">
                                  <div className="space-y-1">
                                    <div className="font-semibold text-sm">{item.productName}</div>
                                    <div className="text-muted-foreground">SKU: {item.skuCode}</div>
                                    {item.specifications && (
                                      <div className="text-muted-foreground">{item.specifications}</div>
                                    )}
                                    {item.supplierName && (
                                      <div className="text-xs text-blue-600 dark:text-blue-400">供应商: {item.supplierName}</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs p-3 text-right font-medium">
                                  {item.quantity.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs p-3 text-center">
                                  <span className={item.shippedQty > 0 ? "text-purple-600 dark:text-purple-400 font-medium" : "text-muted-foreground"}>
                                    {item.shippedQty}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs p-3 text-center">
                                  <span className={item.receivedQty > 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                                    {item.receivedQty}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs p-3">
                                  <Badge variant="secondary" className="text-[10px]">{item.uom}</Badge>
                                </TableCell>
                                <TableCell className="text-xs p-3 font-mono">
                                  {mockPODetail.currency} {item.unitPrice.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-xs p-3 text-muted-foreground">
                                  {item.taxRate}%
                                </TableCell>
                                <TableCell className="text-xs p-3 text-right font-mono text-muted-foreground">
                                  +{item.taxAmount?.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-sm p-3 text-right font-semibold">
                                  {mockPODetail.currency} {item.lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-xs p-3 space-y-1 min-w-[120px]">
                                  {(item.requiresSerialNumber || item.requiresLotNumber) ? (
                                    <>
                                      {item.requiresSerialNumber && <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 mr-1 mb-1">SN管控</Badge>}
                                      {item.requiresLotNumber && <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400 mb-1">批次管控</Badge>}
                                      {(item.specifiedSerialNumbers && item.specifiedSerialNumbers.length > 0) && (
                                        <div className="text-[10px] text-muted-foreground mt-1">
                                          已分配: {item.specifiedSerialNumbers.length} 个
                                        </div>
                                      )}
                                      {(item.specifiedLotNumbers && item.specifiedLotNumbers.length > 0) && (
                                        <div className="text-[10px] text-muted-foreground mt-1">
                                          批次: {item.specifiedLotNumbers.join(', ')}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs p-3 text-muted-foreground max-w-[150px] truncate" title={item.notes}>
                                  {item.notes || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="border-t bg-muted/10 p-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                          <div className="flex gap-8 text-sm">
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">总需求数</span>
                              <span className="font-semibold text-lg">{poData.totalOrderQty}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">发货数</span>
                              <span className="font-semibold text-lg text-purple-600 dark:text-purple-400">{poData.shippedQty}</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-muted-foreground">收货数</span>
                              <span className="font-semibold text-lg text-green-600 dark:text-green-400">{poData.receivedQty}</span>
                            </div>
                          </div>
                          <div className="w-full max-w-sm space-y-2 text-sm">
                            <div className="flex justify-between items-center text-muted-foreground">
                              <span>商品小计</span>
                              <span className="font-mono">{poData.currency} {poData.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                              <span>总税额</span>
                              <span className="font-mono">{poData.currency} {poData.taxAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between items-center text-muted-foreground">
                              <span>运费 (含附加税)</span>
                              <span className="font-mono">{poData.currency} {((poData.shippingCost || 0) + (poData.shippingTaxAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {((poData.handlingFee || 0) + (poData.otherCharge || 0)) > 0 && (
                              <div className="flex justify-between items-center text-muted-foreground">
                                <span>其它附加费</span>
                                <span className="font-mono">{poData.currency} {((poData.handlingFee || 0) + (poData.otherCharge || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              </div>
                            )}
                            <div className="pt-3 mt-3 border-t flex justify-between items-end">
                              <span className="font-medium text-base">含税总计</span>
                              <span className="font-bold text-2xl text-primary font-mono">{poData.currency} {poData.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>


                {/* Warehouse Receipts Tab - List-Detail Layout */}
                <TabsContent value="receipts" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Warehouse Receipt Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t">
                        {/* Left: Receipt List */}
                        <div className="md:col-span-1 border-r">
                          <div className="p-3 bg-muted/50 border-b">
                            <input
                              type="text"
                              placeholder="Search by dispatch number, warehouse, staff"
                              className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background"
                            />
                          </div>
                          <div className="divide-y max-h-[600px] overflow-y-auto">
                            {mockPODetail.receiptRecords.map((receipt) => (
                              <div
                                key={receipt.id}
                                onClick={() => setSelectedReceipt(receipt.id)}
                                className={`p-3 cursor-pointer transition-colors ${selectedReceipt === receipt.id
                                  ? 'bg-primary/10 border-l-4 border-l-primary'
                                  : 'hover:bg-muted/50 border-l-4 border-l-transparent'
                                  }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="font-mono text-sm font-medium">{receipt.receiptNo}</div>
                                  <div className="flex flex-col items-end gap-1">
                                    <Badge className={
                                      receipt.receiptStatus === 'CLOSED'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                          : receipt.receiptStatus === 'NEW'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }>
                                      {receipt.receiptStatus === 'CLOSED' ? 'Warehouse Received' :
                                        receipt.receiptStatus === 'PARTIAL_DAMAGE' ? 'Partial Damage' :
                                          receipt.receiptStatus === 'NEW' ? 'New' : 'In Progress'}
                                    </Badge>
                                    {!receipt.pushedToWarehouse && (
                                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                        Not Pushed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>Warehouse: {mockPODetail.warehouseName}</div>
                                  <div>Location: {receipt.warehouseLocation}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Receipt Detail - 3/4 width */}
                        <div className="md:col-span-3">
                          {selectedReceipt && (() => {
                            const receipt = mockPODetail.receiptRecords.find(r => r.id === selectedReceipt)
                            if (!receipt) return null

                            return (
                              <div className="p-6 space-y-6">
                                {/* Header with Status */}
                                <div className="flex items-start justify-between pb-4 border-b">
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-xl font-semibold font-mono">{receipt.receiptNo}</h3>
                                      <Badge className={
                                        receipt.receiptStatus === 'CLOSED'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                          : receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                      }>
                                        {receipt.receiptStatus === 'CLOSED' ? 'Warehouse Received' : receipt.receiptStatus === 'PARTIAL_DAMAGE' ? 'Partial Damage' : 'In Progress'}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {new Date(receipt.receiptDate).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {!receipt.pushedToWarehouse ? (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => {
                                          console.log("Push to warehouse:", receipt.receiptNo)
                                          // 实际应用中调用API推送到仓库
                                        }}
                                      >
                                        <Send className="h-4 w-4 mr-2" />
                                        Push to Warehouse
                                      </Button>
                                    ) : (
                                      <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {/* Receipt Progress Steps */}
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    {/* New */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className="text-sm font-medium">New</div>
                                        <div className="text-xs text-muted-foreground">Created</div>
                                      </div>
                                    </div>
                                    <div className="flex-1 h-0.5 bg-green-300 dark:bg-green-700 mx-2" />

                                    {/* Pending Receipt */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Clock className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE' ? '' : 'text-muted-foreground'
                                          }`}>Pending Receipt</div>
                                        <div className="text-xs text-muted-foreground">Waiting</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* Receiving */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Package className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${receipt.receiptStatus === 'CLOSED' || receipt.receiptStatus === 'PARTIAL_DAMAGE' ? '' : 'text-muted-foreground'
                                          }`}>Receiving</div>
                                        <div className="text-xs text-muted-foreground">In Process</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${receipt.receiptStatus === 'CLOSED'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                        ? 'bg-orange-300 dark:bg-orange-700'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* Partially Received */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                        ? 'bg-orange-100 dark:bg-orange-900/20'
                                        : receipt.receiptStatus === 'CLOSED'
                                          ? 'bg-green-100 dark:bg-green-900/20'
                                          : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {receipt.receiptStatus === 'PARTIAL_DAMAGE' ? (
                                          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        ) : receipt.receiptStatus === 'CLOSED' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <TrendingUp className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${receipt.receiptStatus === 'PARTIAL_DAMAGE' ? 'text-orange-600 dark:text-orange-400' :
                                          receipt.receiptStatus === 'CLOSED' ? '' : 'text-muted-foreground'
                                          }`}>Partially Received</div>
                                        <div className="text-xs text-muted-foreground">Partial</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${receipt.receiptStatus === 'CLOSED'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : receipt.receiptStatus === 'PARTIAL_DAMAGE'
                                        ? 'bg-orange-300 dark:bg-orange-700'
                                        : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* Close/Cancelled/Exception */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${receipt.receiptStatus === 'CLOSED'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : receipt.receiptStatus === 'CANCELLED'
                                          ? 'bg-gray-100 dark:bg-gray-800'
                                          : receipt.receiptStatus === 'EXCEPTION'
                                            ? 'bg-red-100 dark:bg-red-900/20'
                                            : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {receipt.receiptStatus === 'CLOSED' ? (
                                          <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : receipt.receiptStatus === 'CANCELLED' ? (
                                          <XCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                        ) : receipt.receiptStatus === 'EXCEPTION' ? (
                                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        ) : (
                                          <Lock className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${receipt.receiptStatus === 'CLOSED' ? 'text-green-600 dark:text-green-400' :
                                          receipt.receiptStatus === 'CANCELLED' ? 'text-gray-600 dark:text-gray-400' :
                                            receipt.receiptStatus === 'EXCEPTION' ? 'text-red-600 dark:text-red-400' :
                                              'text-muted-foreground'
                                          }`}>
                                          {receipt.receiptStatus === 'CLOSED' ? 'Closed' :
                                            receipt.receiptStatus === 'CANCELLED' ? 'Cancelled' :
                                              receipt.receiptStatus === 'EXCEPTION' ? 'Exception' : 'Closed'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Final</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Items Table */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-3">Items</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="text-xs p-3">Product</TableHead>
                                        <TableHead className="text-xs p-3 text-center">Qty</TableHead>
                                        <TableHead className="text-xs p-3 text-center">Unit Price</TableHead>
                                        <TableHead className="text-xs p-3">UOM</TableHead>
                                        <TableHead className="text-xs p-3 text-right">Pallet Count</TableHead>
                                        <TableHead className="text-xs p-3">SN Product</TableHead>
                                        <TableHead className="text-xs p-3 text-right">Lot No.</TableHead>
                                        <TableHead className="text-xs p-3 text-right">SN No.</TableHead>
                                        <TableHead className="text-xs p-3">Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow className="hover:bg-muted/50">
                                        <TableCell className="text-xs p-3">
                                          <div className="font-medium">SKU: CCC</div>
                                        </TableCell>
                                        <TableCell className="text-xs p-3 text-center font-medium">{receipt.receivedQty}</TableCell>
                                        <TableCell className="text-xs p-3 text-center font-mono">$0.00</TableCell>
                                        <TableCell className="text-xs p-3">
                                          <Badge variant="outline" className="text-xs">EA</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs p-3 text-right font-medium text-muted-foreground">1</TableCell>
                                        <TableCell className="text-xs p-3 text-muted-foreground">-</TableCell>
                                        <TableCell className="text-xs p-3 text-right text-muted-foreground">-</TableCell>
                                        <TableCell className="text-xs p-3 text-right text-muted-foreground">-</TableCell>
                                        <TableCell className="text-xs p-3 text-muted-foreground">-</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Receipt Details Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Receipt Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">RCP No:</span>
                                        <span className="font-mono font-medium">{receipt.receiptNo}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">RN No:</span>
                                        <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{receipt.wmsReceiptNo}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Receipt Date:</span>
                                        <span>{new Date(receipt.receiptDate).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Received By:</span>
                                        <span className="font-medium">{receipt.receivedBy}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Received Qty:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{receipt.receivedQty}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Damage Qty:</span>
                                        <span className={receipt.damageQty > 0 ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"}>
                                          {receipt.damageQty}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rejected Qty:</span>
                                        <span className="text-muted-foreground">{receipt.rejectedQty}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Warehouse & Location</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Warehouse:</span>
                                        <span className="font-medium">{mockPODetail.warehouseName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Warehouse Code:</span>
                                        <Badge variant="outline" className="text-xs font-mono">
                                          {mockPODetail.warehouseCode}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location:</span>
                                        <span className="font-medium">{receipt.warehouseLocation}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Quality Status:</span>
                                        <Badge className={
                                          receipt.qualityStatus === 'PASSED'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                        }>
                                          {receipt.qualityStatus === 'PASSED' ? 'Passed' : 'Partial Damage'}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Related Shipment:</span>
                                        <span className="font-mono text-xs">{receipt.relatedShipment}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {receipt.notes && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Notes</h4>
                                    <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                                      {receipt.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Receipt Confirmation Tab */}
                <TabsContent value="confirmation" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Receipt Confirmation Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="text-sm font-medium p-3">RC No.</TableHead>
                              <TableHead className="text-sm font-medium p-3">Status</TableHead>
                              <TableHead className="text-sm font-medium p-3">Reference No</TableHead>
                              <TableHead className="text-sm font-medium p-3">RCP No.</TableHead>
                              <TableHead className="text-sm font-medium p-3">RN No.</TableHead>
                              <TableHead className="text-sm font-medium p-3">Receipt Type</TableHead>
                              <TableHead className="text-sm font-medium p-3">Warehouse</TableHead>
                              <TableHead className="text-sm font-medium p-3">Carrier</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-right">Received Qty</TableHead>
                              <TableHead className="text-sm font-medium p-3 text-right">Expected Qty</TableHead>
                              <TableHead className="text-sm font-medium p-3">Received By</TableHead>
                              <TableHead className="text-sm font-medium p-3">Received Time</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {receiptConfirmations.map((confirm) => (
                              <TableRow key={confirm.id} className="hover:bg-muted/50">
                                <TableCell className="text-xs p-3 font-mono font-medium">
                                  {confirm.receiptConfirmNo}
                                </TableCell>
                                <TableCell className="text-xs p-3">
                                  <Badge className={
                                    confirm.status === 'NEW'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                      : confirm.status === 'CLOSED'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                  }>
                                    {confirm.status === 'NEW' ? 'New' : confirm.status === 'CLOSED' ? 'Closed' : 'Cancelled'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs p-3 font-mono">
                                  {confirm.referenceNo}
                                </TableCell>
                                <TableCell className="text-xs p-3 font-mono">
                                  {confirm.receiptNo}
                                </TableCell>
                                <TableCell className="text-xs p-3 font-mono text-blue-600 dark:text-blue-400">
                                  {confirm.inboundReceiptNo}
                                </TableCell>
                                <TableCell className="text-xs p-3 text-muted-foreground">
                                  {confirm.receiptType === 'REGULAR_RECEIPT' ? 'Regular Receipt' : confirm.receiptType === 'RETURN' ? 'Return' : 'X-Dock'}
                                </TableCell>
                                <TableCell className="text-xs p-3">
                                  {confirm.warehouse}
                                </TableCell>
                                <TableCell className="text-xs p-3">
                                  {confirm.carrierName}
                                </TableCell>
                                <TableCell className="text-xs p-3 text-right font-medium text-green-600 dark:text-green-400">
                                  {confirm.totalReceivedQty.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs p-3 text-right">
                                  {confirm.totalExpectedQty.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-xs p-3">
                                  {confirm.receivedBy}
                                </TableCell>
                                <TableCell className="text-xs p-3">
                                  {new Date(confirm.receivedTime).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>


                {/* Shipment Tracking Tab - List-Detail Layout */}
                <TabsContent value="shipments" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Shipment Tracking Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t">
                        {/* Left: Shipment List */}
                        <div className="md:col-span-1 border-r">
                          <div className="p-3 bg-muted/50 border-b">
                            <input
                              type="text"
                              placeholder="Search by shipment number, carrier"
                              className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background"
                            />
                          </div>
                          <div className="divide-y max-h-[600px] overflow-y-auto">
                            {mockPODetail.shipmentRecords.map((shipment) => {
                              // 根据运输方式选择显示的关键信息
                              const getShipmentKeyInfo = () => {
                                if (shipment.shippingMethod === 'Air Freight') {
                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <Package className="h-3 w-3 text-blue-600" />
                                        <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{shipment.flightNo}</span>
                                      </div>
                                      <div>{shipment.departureAirport} → {shipment.arrivalAirport}</div>
                                    </>
                                  )
                                } else if (shipment.shippingMethod === 'Sea Freight') {
                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <Truck className="h-3 w-3 text-indigo-600" />
                                        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{shipment.containerNo}</span>
                                      </div>
                                      <div>{shipment.vesselName}</div>
                                    </>
                                  )
                                } else if (shipment.shippingMethod === 'Ground') {
                                  return (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <Truck className="h-3 w-3 text-green-600" />
                                        <span className="font-mono font-medium text-green-600 dark:text-green-400">{shipment.vehicleNo}</span>
                                      </div>
                                      <div>{shipment.driverName}</div>
                                    </>
                                  )
                                }
                                return null
                              }

                              return (
                                <div
                                  key={shipment.id}
                                  onClick={() => setSelectedShipment(shipment.id)}
                                  className={`p-3 cursor-pointer transition-colors ${selectedShipment === shipment.id
                                    ? 'bg-primary/10 border-l-4 border-l-primary'
                                    : 'hover:bg-muted/50 border-l-4 border-l-transparent'
                                    }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="font-mono text-sm font-medium">{shipment.shipmentNo}</div>
                                    <Badge className={
                                      shipment.shippingStatus === 'DELIVERED'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        : shipment.shippingStatus === 'IN_TRANSIT'
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                    }>
                                      {shipment.shippingStatus === 'DELIVERED' ? 'Delivered' : shipment.shippingStatus === 'IN_TRANSIT' ? 'In Transit' : 'Shipped'}
                                    </Badge>
                                  </div>

                                  {/* 运输方式标签 */}
                                  <div className="mb-2">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${shipment.shippingMethod === 'Air Freight'
                                        ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                                        : shipment.shippingMethod === 'Sea Freight'
                                          ? 'border-indigo-300 text-indigo-700 dark:border-indigo-700 dark:text-indigo-400'
                                          : 'border-green-300 text-green-700 dark:border-green-700 dark:text-green-400'
                                        }`}
                                    >
                                      {shipment.shippingMethod}
                                    </Badge>
                                  </div>

                                  {/* 关键信息 */}
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    {getShipmentKeyInfo()}
                                    <div className="flex items-center justify-between pt-1 border-t border-muted">
                                      <span>Carrier: {shipment.carrier}</span>
                                      <span className="font-medium text-purple-600 dark:text-purple-400">Qty: {shipment.shippedQty}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Right: Shipment Detail - 3/4 width */}
                        <div className="md:col-span-3">
                          {selectedShipment && (() => {
                            const shipment = mockPODetail.shipmentRecords.find(s => s.id === selectedShipment)
                            if (!shipment) return null

                            return (
                              <div className="p-6 space-y-6">
                                {/* Header with Status */}
                                <div className="flex items-start justify-between pb-4 border-b">
                                  <div>
                                    <div className="flex items-center gap-3 mb-2">
                                      <h3 className="text-xl font-semibold font-mono">{shipment.shipmentNo}</h3>
                                      <Badge className={
                                        shipment.shippingStatus === 'DELIVERED'
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                          : shipment.shippingStatus === 'IN_TRANSIT'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                      }>
                                        {shipment.shippingStatus === 'DELIVERED' ? 'Delivered' : shipment.shippingStatus === 'IN_TRANSIT' ? 'In Transit' : 'Shipped'}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Shipped: {shipment.shippingDate}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Track
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>

                                {/* Shipping Progress Steps */}
                                <div className="bg-muted/30 rounded-lg p-4">
                                  <div className="flex items-center justify-between">
                                    {/* Created */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className="text-sm font-medium">Created</div>
                                        <div className="text-xs text-muted-foreground">{shipment.createdDate}</div>
                                      </div>
                                    </div>
                                    <div className="flex-1 h-0.5 bg-green-300 dark:bg-green-700 mx-2" />

                                    {/* Shipped */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className="text-sm font-medium">Shipped</div>
                                        <div className="text-xs text-muted-foreground">{shipment.shippingDate}</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${shipment.shippingStatus === 'IN_TRANSIT' || shipment.shippingStatus === 'DELIVERED'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* In Transit */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${shipment.shippingStatus === 'IN_TRANSIT' || shipment.shippingStatus === 'DELIVERED'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {shipment.shippingStatus === 'IN_TRANSIT' || shipment.shippingStatus === 'DELIVERED' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Truck className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${shipment.shippingStatus === 'IN_TRANSIT' || shipment.shippingStatus === 'DELIVERED'
                                          ? ''
                                          : 'text-muted-foreground'
                                          }`}>In Transit</div>
                                        <div className="text-xs text-muted-foreground">-</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${shipment.shippingStatus === 'DELIVERED'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* Delivered */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${shipment.shippingStatus === 'DELIVERED'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {shipment.shippingStatus === 'DELIVERED' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Package className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${shipment.shippingStatus === 'DELIVERED' ? '' : 'text-muted-foreground'
                                          }`}>Delivered</div>
                                        <div className="text-xs text-muted-foreground">
                                          {shipment.actualArrival || shipment.estimatedArrival}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Items Table */}
                                <div>
                                  <h4 className="text-sm font-semibold mb-3">Shipped Items</h4>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="text-xs p-3">Product</TableHead>
                                        <TableHead className="text-xs p-3 text-center">Shipped Qty</TableHead>
                                        <TableHead className="text-xs p-3">UOM</TableHead>
                                        <TableHead className="text-xs p-3 text-right">Unit Price</TableHead>
                                        <TableHead className="text-xs p-3 text-right">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {mockPODetail.lineItems.slice(0, 2).map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/50">
                                          <TableCell className="text-xs p-3">
                                            <div className="space-y-1">
                                              <div className="font-medium">{item.productName}</div>
                                              <div className="text-muted-foreground">SKU: {item.skuCode}</div>
                                              {item.specifications && (
                                                <div className="text-muted-foreground">{item.specifications}</div>
                                              )}
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-xs p-3 text-center font-medium text-purple-600 dark:text-purple-400">
                                            {Math.floor(shipment.shippedQty / 2)}
                                          </TableCell>
                                          <TableCell className="text-xs p-3">
                                            <Badge variant="outline" className="text-xs">{item.uom}</Badge>
                                          </TableCell>
                                          <TableCell className="text-xs p-3 text-right font-mono">
                                            {mockPODetail.currency} {item.unitPrice.toFixed(2)}
                                          </TableCell>
                                          <TableCell className="text-xs p-3 text-right font-medium font-mono">
                                            {mockPODetail.currency} {(item.unitPrice * Math.floor(shipment.shippedQty / 2)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>

                                {/* Shipment Details Grid - Single Column for Better Layout */}
                                <div className="space-y-6">
                                  {/* Shipment Information */}
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Shipment Information</h4>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipment No:</span>
                                        <span className="font-mono font-medium">{shipment.shipmentNo}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tracking No:</span>
                                        <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{shipment.trackingNo}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Carrier:</span>
                                        <span className="font-medium">{shipment.carrier}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping Method:</span>
                                        <Badge variant="outline" className="text-xs">
                                          {shipment.shippingMethod}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery Service:</span>
                                        <span>{shipment.deliveryService}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipped Qty:</span>
                                        <span className="font-medium text-purple-600 dark:text-purple-400">{shipment.shippedQty}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping Date:</span>
                                        <span>{shipment.shippingDate}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Est. Arrival:</span>
                                        <span>{shipment.estimatedArrival}</span>
                                      </div>
                                      {shipment.actualArrival && (
                                        <>
                                          <div className="flex justify-between col-span-2">
                                            <span className="text-muted-foreground">Actual Arrival:</span>
                                            <span className="font-medium text-green-600 dark:text-green-400">{shipment.actualArrival}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Transport-Specific Details */}
                                  {shipment.shippingMethod === 'Air Freight' && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-600" />
                                        Air Freight Details
                                      </h4>
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Flight No:</span>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{shipment.flightNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Airline Code:</span>
                                            <Badge variant="outline" className="text-xs font-mono">{shipment.airlineCode}</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Departure:</span>
                                            <span className="font-medium">{shipment.departureAirport}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Arrival:</span>
                                            <span className="font-medium">{shipment.arrivalAirport}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Package No:</span>
                                            <span className="font-mono text-xs">{shipment.packageNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Packages:</span>
                                            <span className="font-medium">{shipment.packageCount} boxes</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {shipment.shippingMethod === 'Sea Freight' && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-indigo-600" />
                                        Sea Freight Details
                                      </h4>
                                      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Vessel Name:</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{shipment.vesselName}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Voyage No:</span>
                                            <span className="font-mono font-medium">{shipment.voyageNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Container No:</span>
                                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{shipment.containerNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Container Type:</span>
                                            <Badge variant="outline" className="text-xs">{shipment.containerType}</Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Containers:</span>
                                            <span className="font-medium">{shipment.containerCount} x {shipment.containerType}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Port of Loading:</span>
                                            <span className="font-medium">{shipment.portOfLoading}</span>
                                          </div>
                                          <div className="flex justify-between col-span-2">
                                            <span className="text-muted-foreground">Port of Discharge:</span>
                                            <span className="font-medium">{shipment.portOfDischarge}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {shipment.shippingMethod === 'Ground' && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-semibold flex items-center gap-2">
                                        <Truck className="h-4 w-4 text-green-600" />
                                        Ground Transport Details
                                      </h4>
                                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Vehicle No:</span>
                                            <span className="font-mono font-bold text-green-600 dark:text-green-400">{shipment.vehicleNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Driver Name:</span>
                                            <span className="font-medium">{shipment.driverName}</span>
                                          </div>
                                          <div className="flex justify-between col-span-2">
                                            <span className="text-muted-foreground">Driver Phone:</span>
                                            <span className="font-mono">{shipment.driverPhone}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Package No:</span>
                                            <span className="font-mono text-xs">{shipment.packageNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Packages:</span>
                                            <span className="font-medium">{shipment.packageCount} boxes</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pallet No:</span>
                                            <span className="font-mono text-xs">{shipment.palletNo}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-muted-foreground">Pallets:</span>
                                            <span className="font-medium">{shipment.palletCount} {shipment.palletCount === 1 ? 'pallet' : 'pallets'}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <Separator />

                                  {/* Address Information */}
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-purple-600" />
                                      Route Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="text-xs font-medium mb-2 flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                          <MapPin className="h-3 w-3" />
                                          Origin
                                        </div>
                                        <div className="space-y-1 text-xs">
                                          <div className="font-medium">{shipment.fromCity}, {shipment.fromCountry}</div>
                                          <div className="text-muted-foreground">{shipment.fromAddress}</div>
                                        </div>
                                      </div>
                                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="text-xs font-medium mb-2 flex items-center gap-1 text-green-600 dark:text-green-400">
                                          <MapPin className="h-3 w-3" />
                                          Destination
                                        </div>
                                        <div className="space-y-1 text-xs">
                                          <div className="font-medium">{shipment.toCity}, {shipment.toCountry}</div>
                                          <div className="text-muted-foreground">{shipment.toAddress}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2">
                                      <span className="text-muted-foreground">Created By:</span>
                                      <span className="font-medium">{shipment.createdBy}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes */}
                                {shipment.notes && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Notes</h4>
                                    <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                                      {shipment.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Email History Tab */}
                <TabsContent value="emails" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-600" />
                        Email Sending Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!mockPODetail.emailHistory || mockPODetail.emailHistory.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No email records</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {mockPODetail.emailHistory.map((email, index) => (
                            <Card key={email.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="pt-6">
                                <div className="space-y-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                          {email.status === 'SENT' ? '已发送' : '发送中'}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                          #{mockPODetail.emailHistory!.length - index}
                                        </span>
                                      </div>
                                      <div className="text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Clock className="h-4 w-4" />
                                          <span>{new Date(email.sentDate).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                          <User className="h-4 w-4" />
                                          <span>Sent by: {email.sentBy}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {email.pdfTemplate}
                                    </Badge>
                                  </div>
                                  <Separator />
                                  <div className="space-y-3 text-sm">
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Subject</div>
                                      <div className="font-medium">{email.subject}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Recipients</div>
                                      <div className="flex flex-wrap gap-1">
                                        {email.recipients.map((recipient, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs font-mono">
                                            {recipient}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Body</div>
                                      <div className="bg-muted/50 p-3 rounded-md text-xs whitespace-pre-wrap font-mono">
                                        {email.body}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      View PDF
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs">
                                      <Send className="h-3 w-3 mr-1" />
                                      Resend
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>


            {/* RIGHT COLUMN - Side Tabs (1/4 width) */}
            <div className="lg:col-span-1">
              <Card>
                <Tabs value={activeSideTab} onValueChange={setActiveSideTab}>
                  <CardHeader className="pb-3">
                    <TabsList className="grid grid-cols-3 w-auto inline-grid">
                      <TabsTrigger value="routing" className="px-4">Routing</TabsTrigger>
                      <TabsTrigger value="events" className="px-4">Events</TabsTrigger>
                      <TabsTrigger value="info" className="px-4">Info</TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  {/* Routing History Tab */}
                  <TabsContent value="routing" className="mt-0">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span>Routing History</span>
                        </div>
                        <div className="space-y-3">
                          {routingHistory.map((route, index) => (
                            <div key={route.id} className="relative pl-6 pb-4 border-l-2 border-blue-200 dark:border-blue-800 last:border-l-0 last:pb-0">
                              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-background" />
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-sm font-medium">{route.action}</div>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(route.timestamp).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {route.details}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
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

                  {/* Event History Tab */}
                  <TabsContent value="events" className="mt-0">
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <History className="h-4 w-4 text-green-600" />
                          <span>Event History</span>
                        </div>
                        <div className="space-y-3">
                          {eventHistory.map((event, index) => (
                            <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-green-200 dark:border-green-800 last:border-l-0 last:pb-0">
                              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
                              <div className="space-y-1">
                                <div className="text-sm font-medium">{event.event}</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(event.timestamp).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {event.description}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
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


                  {/* Order Info Tab - Combined info from original 4 cards */}
                  <TabsContent value="info" className="mt-0">
                    <CardContent>
                      <div className="space-y-6">
                        {/* Basic Information - Now includes supplier info */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span>基本信息</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">PO Number:</span>
                              <span className="font-mono font-medium">{mockPODetail.orderNo}</span>
                            </div>
                            {mockPODetail.originalPoNo && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Original PO:</span>
                                <span className="font-mono">{mockPODetail.originalPoNo}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Reference:</span>
                              <span className="font-mono">{mockPODetail.referenceNo}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">供应商:</span>
                              <span className="font-medium">{mockPODetail.supplierName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">供应商编码:</span>
                              <Badge variant="outline" className="text-xs h-5">
                                {mockPODetail.supplierCode}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">联系人:</span>
                              <span className="font-medium">{mockPODetail.contactPerson}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">联系电话:</span>
                              <span className="font-mono text-xs">{mockPODetail.contactPhone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Data Source:</span>
                              <Badge variant="outline" className="text-xs h-5">
                                {mockPODetail.dataSource === 'PR_CONVERSION' ? 'PR转单' : '手动创建'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{new Date(mockPODetail.created).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {mockPODetail.relatedPRs.length > 0 && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Related PRs ({mockPODetail.relatedPRs.length})</div>
                              <div className="flex flex-wrap gap-1">
                                {mockPODetail.relatedPRs.map((prNo, index) => (
                                  <Badge key={index} variant="outline" className="text-xs h-5">
                                    {prNo}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        {/* Shipping Address (发货地址) - Supplier Address */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Building className="h-4 w-4 text-blue-600" />
                            <span>发货地址</span>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="font-medium text-sm text-blue-800 dark:text-blue-200 mb-1">
                              {mockPODetail.supplierName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {mockPODetail.supplierAddress}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Delivery Address (收货地址) - Warehouse Address */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span>收货地址</span>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">
                              {mockPODetail.warehouseName}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-400 mb-2">
                              Code: {mockPODetail.warehouseCode}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {mockPODetail.warehouseAddress}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Logistics Terms (物流条款) */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Truck className="h-4 w-4 text-purple-600" />
                            <span>物流条款</span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">交货期日:</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">
                                {new Date(mockPODetail.expectedArrivalDate).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">最晚发运时间:</span>
                              <span className="font-medium">2024-01-20 18:00:00</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">运输方式:</span>
                              <Badge variant="outline" className="text-xs h-5">
                                Air Freight
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">运费条款:</span>
                              <span className="font-medium">FOB</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">贸易条款:</span>
                              <span className="font-medium">{mockPODetail.deliveryTerms}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">付款条款:</span>
                              <span className="font-medium">{mockPODetail.paymentTerms}</span>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Logistics Summary */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Package className="h-4 w-4 text-indigo-600" />
                            <span>物流汇总</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                              <div className="text-muted-foreground mb-1">发货单</div>
                              <div className="font-bold text-blue-600 dark:text-blue-400">
                                {mockPODetail.shipmentRecords.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                已发: {mockPODetail.shippedQty}
                              </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                              <div className="text-muted-foreground mb-1">收货单</div>
                              <div className="font-bold text-green-600 dark:text-green-400">
                                {mockPODetail.receiptRecords.length}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                已收: {mockPODetail.receivedQty}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>

        {/* PO Send Dialog */}
        <POSendDialog
          open={showSendDialog}
          onOpenChange={setShowSendDialog}
          poData={{
            orderNo: poData.orderNo,
            supplierName: poData.supplierName,
            supplierEmail: poData.contactEmail,
            totalAmount: poData.totalAmount,
            currency: poData.currency,
            itemCount: poData.lineItems.length,
          }}
          onSend={handleSendPO}
        />

        {/* PO Edit Dialog - Inline Implementation */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open)
          if (open) {
            setEditedLineItems([...poData.lineItems])
            setEditErrors({})
          }
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                编辑 PO 明细 - {poData.orderNo}
              </DialogTitle>
              <DialogDescription>
                修改订单数量、删除行项目或新增商品。已执行的实绩（已发货/已收货）不可逆。
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-auto">
              {/* 提示信息 */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Edit Rules:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• <span className="text-green-600">Increase Qty</span>: No restrictions</li>
                      <li>• <span className="text-orange-600">Decrease Qty</span>: Min value is Fulfilled (max of shipped/received)</li>
                      <li>• <span className="text-orange-600">Close Line</span>: Set qty to Fulfilled, release remaining ATP</li>
                      <li>• <span className="text-red-600">Delete</span>: Only lines with no fulfillment can be deleted</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 新增商品按钮 */}
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProductSelectionDialog(true)}
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {/* 行项目表格 */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-sm font-medium p-3 w-16">Line</TableHead>
                      <TableHead className="text-sm font-medium p-3">Product</TableHead>
                      <TableHead className="text-sm font-medium p-3 w-28 text-center">Order Qty</TableHead>
                      <TableHead className="text-sm font-medium p-3 w-20 text-center">Shipped</TableHead>
                      <TableHead className="text-sm font-medium p-3 w-20 text-center">Received</TableHead>
                      <TableHead className="text-sm font-medium p-3 w-20 text-center">Fulfilled</TableHead>
                      <TableHead className="text-sm font-medium p-3 w-24 text-right">Amount</TableHead>
                      <TableHead className="text-sm font-medium p-3 w-32 text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedLineItems.map((item) => {
                      // fulfilledQty 由后端计算，用于校验最小可减数量
                      const fulfilledQty = (item as any).fulfilledQty || 0
                      const hasExecution = fulfilledQty > 0
                      const remainingQty = item.quantity - fulfilledQty
                      const hasError = !!editErrors[item.id]
                      const isNew = item.id.startsWith('new-')

                      return (
                        <TableRow key={item.id} className={`hover:bg-muted/50 ${hasError ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                          <TableCell className="text-xs p-3">
                            <Badge variant={isNew ? "default" : "outline"} className="text-xs">
                              {isNew ? "新" : item.lineNo.toString().padStart(2, '0')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs p-3">
                            <div className="space-y-1">
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-muted-foreground">SKU: {item.skuCode || "待选择"}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs p-3">
                            <div className="space-y-1">
                              <Input
                                type="number"
                                value={item.quantity}
                                min={fulfilledQty}
                                onChange={(e) => {
                                  const newQty = parseInt(e.target.value) || 0
                                  if (newQty < fulfilledQty) {
                                    setEditErrors(prev => ({
                                      ...prev,
                                      [item.id]: `Cannot be less than Fulfilled (${fulfilledQty})`
                                    }))
                                  } else {
                                    setEditErrors(prev => {
                                      const newErrors = { ...prev }
                                      delete newErrors[item.id]
                                      return newErrors
                                    })
                                  }
                                  setEditedLineItems(prev => prev.map(i =>
                                    i.id === item.id
                                      ? { ...i, quantity: newQty, lineAmount: newQty * i.unitPrice }
                                      : i
                                  ))
                                }}
                                className={`h-8 w-20 text-center ${hasError ? "border-red-500" : ""}`}
                              />
                              {hasError && (
                                <p className="text-xs text-red-600">{editErrors[item.id]}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs p-3 text-center">
                            <span className={item.shippedQty > 0 ? "text-purple-600 dark:text-purple-400 font-medium" : "text-muted-foreground"}>
                              {item.shippedQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs p-3 text-center">
                            <span className={item.receivedQty > 0 ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                              {item.receivedQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs p-3 text-center">
                            <span className={fulfilledQty > 0 ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"}>
                              {fulfilledQty}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs p-3 text-right font-mono">
                            ${item.lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-xs p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {hasExecution ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20"
                                      onClick={() => {
                                        setSelectedLineForClose(item)
                                        setShowCloseLineDialog(true)
                                      }}
                                      disabled={item.quantity === fulfilledQty}
                                    >
                                      <Lock className="h-3 w-3 mr-1" />
                                      {item.quantity === fulfilledQty ? "Closed" : "Close Line"}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {item.quantity === fulfilledQty
                                      ? "This line is already closed"
                                      : `Close remaining ${remainingQty} units, release ATP`
                                    }
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  onClick={() => {
                                    setEditedLineItems(prev => prev.filter(i => i.id !== item.id))
                                  }}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* 汇总 */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总数量:</span>
                    <span className="font-medium">{editedLineItems.reduce((sum, i) => sum + i.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总金额:</span>
                    <span className="font-bold">${editedLineItems.reduce((sum, i) => sum + i.lineAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">行数:</span>
                    <span className="font-medium">{editedLineItems.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">变更:</span>
                    <span className={JSON.stringify(editedLineItems) !== JSON.stringify(poData.lineItems) ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                      {JSON.stringify(editedLineItems) !== JSON.stringify(poData.lineItems) ? "Modified" : "No Changes"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setPOData(prev => ({
                    ...prev,
                    lineItems: editedLineItems as typeof prev.lineItems,
                    totalOrderQty: editedLineItems.reduce((sum, i) => sum + i.quantity, 0),
                    totalAmount: editedLineItems.reduce((sum, i) => sum + i.lineAmount, 0),
                  }))
                  setShowEditDialog(false)
                }}
                disabled={Object.keys(editErrors).length > 0}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Line Confirmation Dialog */}
        <AlertDialog open={showCloseLineDialog} onOpenChange={setShowCloseLineDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Confirm Close Line
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  <p>
                    This line has fulfillment and cannot be deleted. Set quantity to Fulfilled value{' '}
                    <span className="font-bold text-foreground">
                      {selectedLineForClose ? (selectedLineForClose as any).fulfilledQty || 0 : 0}
                    </span>
                    {' '}and close remaining{' '}
                    <span className="font-bold text-foreground">
                      {selectedLineForClose ? selectedLineForClose.quantity - ((selectedLineForClose as any).fulfilledQty || 0) : 0}
                    </span>
                    {' '}units?
                  </p>

                  {selectedLineForClose && (
                    <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product:</span>
                        <span className="font-medium">{selectedLineForClose.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Qty:</span>
                        <span>{selectedLineForClose.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipped:</span>
                        <span className="text-purple-600">{selectedLineForClose.shippedQty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span className="text-green-600">{selectedLineForClose.receivedQty}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-muted-foreground">Qty After Close:</span>
                        <span className="font-bold text-orange-600">
                          {(selectedLineForClose as any).fulfilledQty || 0}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-800 dark:text-orange-200">
                      After closing, remaining ATP will be released. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (selectedLineForClose) {
                    const fulfilledQty = (selectedLineForClose as any).fulfilledQty || 0
                    setEditedLineItems(prev => prev.map(i =>
                      i.id === selectedLineForClose.id
                        ? { ...i, quantity: fulfilledQty, lineAmount: fulfilledQty * i.unitPrice }
                        : i
                    ))
                  }
                  setShowCloseLineDialog(false)
                  setSelectedLineForClose(null)
                }}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirm Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Product Selection Dialog */}
        <ProductSelectionDialog
          open={showProductSelectionDialog}
          onOpenChange={setShowProductSelectionDialog}
          onProductsSelected={(products) => {
            const newItems = products.map((product, index) => ({
              id: `new-${Date.now()}-${index}`,
              lineNo: editedLineItems.length + index + 1,
              skuCode: product.sku,
              productName: product.productName,
              specifications: product.specifications,
              quantity: 1,
              uom: product.uom,
              unitPrice: product.unitPrice,
              lineAmount: product.unitPrice,
              shippedQty: 0,
              receivedQty: 0,
              returnedQty: 0,
            }))
            setEditedLineItems(prev => [...prev, ...newItems])
          }}
          selectedProductIds={editedLineItems.map(item => item.skuCode)}
        />

        {/* PO Cancel Dialog - Inline Implementation */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {poData.shippedQty > 0 || poData.receivedQty > 0 ? (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {poData.shippedQty > 0 || poData.receivedQty > 0 ? "Cannot Cancel Entire Order" : "Cancel Order"}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-4">
                  {poData.shippedQty > 0 || poData.receivedQty > 0 ? (
                    <p>Order has shipped/received items and cannot be voided. Recommend executing "Close" operation to close remaining {poData.totalOrderQty - Math.max(poData.shippedQty, poData.receivedQty)} unfulfilled units.</p>
                  ) : (
                    <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                  )}

                  <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order No:</span>
                      <span className="font-mono font-medium">{poData.orderNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Qty:</span>
                      <span>{poData.totalOrderQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipped:</span>
                      <span className={poData.shippedQty > 0 ? "text-purple-600 font-medium" : ""}>
                        {poData.shippedQty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Received:</span>
                      <span className={poData.receivedQty > 0 ? "text-green-600 font-medium" : ""}>
                        {poData.receivedQty}
                      </span>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (poData.shippedQty > 0 || poData.receivedQty > 0) {
                    setPOData(prev => ({ ...prev, status: "CLOSED" }))
                  } else {
                    setPOData(prev => ({ ...prev, status: "CANCELLED" }))
                  }
                }}
                className={poData.shippedQty > 0 || poData.receivedQty > 0
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-red-600 hover:bg-red-700"
                }
              >
                {poData.shippedQty > 0 || poData.receivedQty > 0 ? "Close Order" : "Confirm Cancel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainLayout>
    </TooltipProvider>
  )
}
