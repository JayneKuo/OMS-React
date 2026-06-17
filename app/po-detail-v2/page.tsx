"use client"

import * as React from "react"
import { Suspense } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { POSendDialog } from "@/components/purchase/po-send-dialog"
import { ProductSelectionDialog } from "@/components/purchase/product-selection-dialog"
import { TransferOrderDetail, type TransferOrder } from "@/components/purchase/transfer-order-detail"
import { CreateTransferOrderDialog } from "@/components/purchase/create-transfer-order-dialog"
import { type TransferOrderDraft, type SupplyDemandLine, WAREHOUSE_OPTIONS } from "@/components/purchase/transfer-order-types"
import { toast } from "sonner"
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
  AlertDialogTrigger,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  FileText, ShoppingCart, Truck, Package, CheckCircle, ArrowLeft, Edit, Send,
  Download, Eye, Copy, Check, AlertCircle, Calendar, Building, User, MapPin, Clock,
  TrendingUp, RefreshCw, ExternalLink, Phone, Mail, History, Info, XCircle,
  FilePlus, Loader2, Lock, MoreHorizontal, Pencil, Ban, Plus
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/components/i18n-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { cn } from "@/lib/utils"

type SupplyLineDraft = {
  sourceLineNo: number
  skuCode: string
  productName: string
  quantity: number
  allocatedQty?: number
  uom: string
}

type TransferOrderDraft = {
  id: string
  fromWarehouseCode: string
  fromWarehouseName: string
  viaWarehouseCode?: string
  viaWarehouseName?: string
  toWarehouseCode: string
  toWarehouseName: string
  lineQtys: Record<string, number>
  isOriginal?: boolean
}

/** @deprecated Kept for backward compat during migration */
type VendorAllocationDraft = {
  id: string
  sourceName: string
  sourceCode: string
  sourceWarehouseName: string
  sourceWarehouseCode: string
  routeType: "DIRECT" | "VIA_FG"
  intermediateWarehouseName?: string
  destinationWarehouseName: string
  destinationWarehouseCode: string
  soStrategy: "BY_VENDOR_PO" | "BY_MASTER_PO"
  lineQtys: Record<string, number>
  isOriginal?: boolean
}

type VendorRnStatus = "NO_RN" | "RN_CREATED" | "PUSH_FAILED" | "WAITING_ACCEPT" | "REJECTED" | "ACCEPTED" | "RN_CANCELLED"

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
  purchaseType: "FACTORY_DIRECT",
  factoryFulfillmentStatus: "PARTIALLY_RELEASED",

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

  unallocatedSupplyDemand: {
    status: "PENDING_ALLOCATION",
    destinationWarehouseName: "Main Warehouse - Los Angeles",
    destinationWarehouseCode: "WH001",
    lines: [
      { sourceLineNo: 1, skuCode: "SKU001", productName: "iPhone 15 Pro", quantity: 100, allocatedQty: 0, uom: "PCS" },
      { sourceLineNo: 3, skuCode: "SKU003", productName: "iPad Pro", quantity: 80, allocatedQty: 0, uom: "PCS" },
    ],
  },

  supplyAllocationOrders: [
    {
      id: "sao-2",
      allocationNo: "SAO202403150001-02",
      allocationName: "Factory direct supply allocation - allocated",
      sourceType: "VENDOR_WAREHOUSE",
      sourceName: "Shenzhen Smart Factory",
      sourceCode: "FAC-SZ01",
      sourceWarehouseName: "Shenzhen Smart Factory Warehouse",
      sourceWarehouseCode: "FAC-WH-SZ01",
      routeType: "VIA_FG",
      intermediateWarehouseName: "Shenzhen Vendor FG Warehouse",
      destinationWarehouseName: "Main Warehouse - Los Angeles",
      destinationWarehouseCode: "WH001",
      vendorReceiptNo: "VRN-SZ01-0008",
      outboundOrderNo: "SO-FAC-SZ01-0008",
      finalReceiptNo: "RN-PO202403150001",
      vendorRnStatus: "PUSH_FAILED" as VendorRnStatus,
      vendorRnError: "Kafka publish failed: broker timeout after 30s",
      vendorRnMessageId: "oms.vendor-rn.202403150001.02",
      vendorRnLastPushedAt: "2024-03-15T09:42:00Z",
      vendorRnRetryCount: 2,
      status: "ALLOCATED",
      canChangeVendor: true,
      lines: [
        { sourceLineNo: 1, skuCode: "SKU001", productName: "iPhone 15 Pro", quantity: 60, allocatedQty: 60, uom: "PCS" },
        { sourceLineNo: 2, skuCode: "SKU002", productName: "MacBook Pro", quantity: 50, allocatedQty: 50, uom: "PCS" },
      ],
    },
  ],

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
      relatedOrderNo: "SO202401100012",
      outboundNo: "OB202401150001",
      shippedQty: 280,
      carrier: "FedEx",
      trackingNo: "1234567890",
      bolNo: "BOL-2024-FX-001",
      masterBolNo: "MBOL-2024-FX-001",
      loadNo: "LD-2024-0118-A",
      shippingStatus: "SHIPPED",
      shippingMethod: "Air Freight",
      deliveryService: "Express",
      flightNo: "FX5432",
      airlineCode: "FDX",
      departureAirport: "JFK",
      arrivalAirport: "LAX",
      packageNo: "PKG-001-2024",
      packageCount: 6,
      palletNo: "PLT-A-001",
      palletCount: 3,
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
      relatedOrderNo: "SO202401080005",
      outboundNo: "OB202401120002",
      shippedQty: 83,
      carrier: "DHL",
      trackingNo: "9876543210",
      bolNo: "",
      masterBolNo: "MBOL-2024-DHL-002",
      loadNo: "LD-2024-0115-B",
      shippingStatus: "DELIVERED",
      shippingMethod: "Ground",
      deliveryService: "Standard",
      vehicleNo: "TRK-8899",
      driverName: "John Driver",
      driverPhone: "+1-555-9988",
      packageNo: "PKG-002-2024",
      packageCount: 3,
      palletNo: "",
      palletCount: 0,
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
      relatedOrderNo: "SO202401050018",
      outboundNo: "OB202401100003",
      shippedQty: 385,
      carrier: "Maersk Line",
      trackingNo: "5555666677",
      bolNo: "BOL-2024-MSK-003",
      masterBolNo: "MBOL-2024-MSK-001",
      loadNo: "LD-2024-0120-C",
      shippingStatus: "IN_TRANSIT",
      shippingMethod: "Sea Freight",
      deliveryService: "FCL",
      vesselName: "MSC OSCAR",
      voyageNo: "VOY-2024-001",
      containerNo: "MSCU1234567 / MSCU7654321",
      containerType: "40HC",
      containerCount: 2,
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
      id: "vrn-sz01-0008",
      receiptNo: "VRN-SZ01-0008",
      wmsReceiptNo: "WMS-VRN-SZ01-0008",
      receiptType: "VENDOR_WAREHOUSE_RECEIPT",
      sourceAllocationNo: "SAO202403150001-02",
      sourceWarehouseName: "Shenzhen Smart Factory Warehouse",
      sourceWarehouseCode: "FAC-WH-SZ01",
      targetWarehouseName: "Shenzhen Vendor FG Warehouse",
      targetWarehouseCode: "VFG-SZ01",
      finalReceiptNo: "RN-PO202403150001",
      outboundOrderNo: "SO-FAC-SZ01-0008",
      receiptDate: "2024-01-20T09:30:00Z",
      receivedQty: 110,
      expectedQty: 110,
      receivedBy: "Factory Dock Team",
      receiptStatus: "CLOSED",
      notes: "Vendor warehouse receipt generated from Transfer Order SAO202403150001-02.",
      relatedShipment: "Internal factory transfer",
      warehouseLocation: "VFG-SZ01 / FG-A-01",
      qualityStatus: "PASSED",
      damageQty: 0,
      rejectedQty: 0,
      pushedToWarehouse: true,
      pushedDate: "2024-01-20T10:00:00Z",
      lines: [
        { sourceLineNo: 1, skuCode: "SKU001", productName: "iPhone 15 Pro", expectedQty: 60, receivedQty: 60, uom: "PCS" },
        { sourceLineNo: 2, skuCode: "SKU002", productName: "MacBook Pro", expectedQty: 50, receivedQty: 50, uom: "PCS" },
      ],
    },
    {
      id: "rn-po202403150001",
      receiptNo: "RN-PO202403150001",
      wmsReceiptNo: "WMS-RN-PO202403150001",
      receiptType: "FINAL_WAREHOUSE_RECEIPT",
      sourceAllocationNo: "SAO202403150001-02",
      sourceWarehouseName: "Shenzhen Vendor FG Warehouse",
      sourceWarehouseCode: "VFG-SZ01",
      targetWarehouseName: "Main Warehouse - Los Angeles",
      targetWarehouseCode: "WH001",
      finalReceiptNo: "RN-PO202403150001",
      outboundOrderNo: "SO-FAC-SZ01-0008",
      receiptDate: "2024-01-25T16:30:00Z",
      receivedQty: 0,
      expectedQty: 110,
      receivedBy: "LA Receiving Team",
      receiptStatus: "NEW",
      notes: "Main warehouse receipt for the original PO. It receives goods from the vendor FG warehouse after outbound/SO execution.",
      relatedShipment: "SO-FAC-SZ01-0008",
      warehouseLocation: "Pending putaway",
      qualityStatus: "PENDING",
      damageQty: 0,
      rejectedQty: 0,
      pushedToWarehouse: false,
      pushedDate: null,
      lines: [
        { sourceLineNo: 1, skuCode: "SKU001", productName: "iPhone 15 Pro", expectedQty: 60, receivedQty: 0, uom: "PCS" },
        { sourceLineNo: 2, skuCode: "SKU002", productName: "MacBook Pro", expectedQty: 50, receivedQty: 0, uom: "PCS" },
      ],
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

const missingFgWarehousePODetail = {
  ...mockPODetail,
  id: "fd-missing-fg",
  orderNo: "PO202403150099",
  originalPoNo: "EXT-PO-2024-099",
  referenceNo: "REF202403150099",
  status: "PROCESSING",
  shippingStatus: null,
  receivingStatus: "NOT_RECEIVED",
  supplierName: "Shenzhen Smart Factory",
  supplierCode: "FAC-SZ01",
  contactPerson: "Factory Ops Team",
  contactPhone: "+86-755-0100-0099",
  contactEmail: "ops@sz-smart-factory.example",
  totalOrderQty: 320,
  shippedQty: 0,
  receivedQty: 0,
  totalAmount: 89600.00,
  created: "2024-02-05T09:30:00Z",
  updated: "2024-02-05T09:30:00Z",
  expectedArrivalDate: "2024-02-20",
  relatedPRs: ["PR202402010099"],
  factoryFulfillmentStatus: "PENDING_VENDOR_ASSIGNMENT",
  unallocatedSupplyDemand: {
    status: "PENDING_ALLOCATION",
    destinationWarehouseName: "Main Warehouse - Los Angeles",
    destinationWarehouseCode: "WH001",
    routeType: "VIA_FG",
    missingRequirement: "VENDOR_FG_WAREHOUSE",
    lines: [
      { sourceLineNo: 1, skuCode: "SKU099-A", productName: "Smart Speaker Hub", quantity: 120, allocatedQty: 0, uom: "PCS" },
      { sourceLineNo: 2, skuCode: "SKU099-B", productName: "Factory Direct Tablet", quantity: 200, allocatedQty: 0, uom: "PCS" },
    ],
  },
  supplyAllocationOrders: [],
  receiptRecords: [
    {
      id: "rn-destination-precreated-099",
      receiptNo: "RN-PO202403150099",
      receiptType: "FINAL_WAREHOUSE_RECEIPT",
      receiptDate: "2024-02-05T09:45:00Z",
      sourceAllocationNo: null,
      sourceWarehouseName: "Pending Vendor FG Warehouse",
      targetWarehouseName: "Main Warehouse - Los Angeles",
      targetWarehouseCode: "WH001",
      sourceDocumentNo: "PO202403150099",
      pushedToWarehouse: false,
      receivedQty: 0,
      expectedQty: 320,
      receivedBy: null,
      receiptStatus: "NEW",
      notes: "Destination RN was created first. VIA_FG route is blocked until a Vendor FG warehouse is assigned.",
      relatedShipment: null,
      warehouseLocation: "Pending",
      qualityStatus: "PENDING",
      damageQty: 0,
      rejectedQty: 0,
    },
  ],
  emailHistory: [],
}

const poDetailScenarios: Record<string, typeof mockPODetail> = {
  [mockPODetail.orderNo]: mockPODetail,
  [missingFgWarehousePODetail.orderNo]: missingFgWarehousePODetail,
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

// Shipment Units Mock Data - Package-level detail for unified table
// Types for hierarchical shipment unit data
type ShipmentSku = { sku: string; productName: string; qty: number; uom: string }
type ShipmentCarton = {
  packageId: string
  trackingNo: string
  dimension: string
  weight: string
  isSIOC?: boolean
  skus: ShipmentSku[]
}
type ShipmentPallet = { palletId: string; cartons: ShipmentCarton[] }
type ShipmentContainer = { containerId: string; pallets: ShipmentPallet[] }

type ShipmentUnitData = {
  // Hierarchical: containers → pallets → cartons
  containers?: ShipmentContainer[]
  // Flat pallets (no container, e.g. air freight)
  pallets?: ShipmentPallet[]
  // Flat cartons (no container/pallet, e.g. express direct)
  cartons?: ShipmentCarton[]
}

// Helper: flatten hierarchical data into renderable rows
function flattenShipmentUnits(data: ShipmentUnitData) {
  const rows: Array<{
    containerId?: string; containerRowSpan?: number; isFirstInContainer?: boolean
    palletId?: string; palletRowSpan?: number; isFirstInPallet?: boolean
    carton: ShipmentCarton; cartonRowSpan: number; isFirstInCarton: boolean
    sku: ShipmentSku
    // For visual separation
    isLastSkuInCarton: boolean
    isLastCartonInPallet: boolean
    isLastPalletInContainer: boolean
    skuIndexInCarton: number
  }> = []

  const hasContainers = !!data.containers?.length
  const hasPallets = hasContainers || !!data.pallets?.length

  // Normalize into a unified structure
  const allContainers: Array<{ containerId?: string; pallets: Array<{ palletId?: string; cartons: ShipmentCarton[] }> }> = []

  if (data.containers?.length) {
    data.containers.forEach(c => {
      allContainers.push({ containerId: c.containerId, pallets: c.pallets.map(p => ({ palletId: p.palletId, cartons: p.cartons })) })
    })
  } else if (data.pallets?.length) {
    allContainers.push({ containerId: undefined, pallets: data.pallets.map(p => ({ palletId: p.palletId, cartons: p.cartons })) })
  } else if (data.cartons?.length) {
    allContainers.push({ containerId: undefined, pallets: [{ palletId: undefined, cartons: data.cartons }] })
  }

  allContainers.forEach((container, cIdx) => {
    const containerSkuCount = container.pallets.reduce((s, p) => s + p.cartons.reduce((s2, ct) => s2 + ct.skus.length, 0), 0)

    container.pallets.forEach((pallet, pIdx) => {
      const palletSkuCount = pallet.cartons.reduce((s, ct) => s + ct.skus.length, 0)

      pallet.cartons.forEach((carton, ctIdx) => {
        carton.skus.forEach((sku, skIdx) => {
          rows.push({
            containerId: container.containerId,
            containerRowSpan: containerSkuCount,
            isFirstInContainer: pIdx === 0 && ctIdx === 0 && skIdx === 0,
            palletId: pallet.palletId,
            palletRowSpan: palletSkuCount,
            isFirstInPallet: ctIdx === 0 && skIdx === 0,
            carton,
            cartonRowSpan: carton.skus.length,
            isFirstInCarton: skIdx === 0,
            sku,
            isLastSkuInCarton: skIdx === carton.skus.length - 1,
            isLastCartonInPallet: ctIdx === pallet.cartons.length - 1,
            isLastPalletInContainer: pIdx === container.pallets.length - 1,
            skuIndexInCarton: skIdx,
          })
        })
      })
    })
  })

  return { rows, hasContainers, hasPallets }
}

const shipmentUnitsData: Record<string, ShipmentUnitData> = {
  // Shipment 1: Air Freight — 3 Pallets, multiple Cartons each (no container)
  "1": {
    pallets: [
      {
        palletId: "PLT-A-001",
        cartons: [
          {
            packageId: "PKG-001-A",
            trackingNo: "1Z999AA10123456784",
            dimension: "40×30×25 cm",
            weight: "8.5 kg",
            skus: [
              { sku: "SKU001", productName: "iPhone 15 Pro", qty: 30, uom: "PCS" },
              { sku: "SKU003", productName: "iPad Pro", qty: 15, uom: "PCS" },
            ],
          },
          {
            packageId: "PKG-001-B",
            trackingNo: "1Z999AA10123456785",
            dimension: "50×40×30 cm",
            weight: "12.3 kg",
            skus: [
              { sku: "SKU001", productName: "iPhone 15 Pro", qty: 30, uom: "PCS" },
            ],
          },
        ],
      },
      {
        palletId: "PLT-A-002",
        cartons: [
          {
            packageId: "PKG-001-C",
            trackingNo: "1Z999AA10123456786",
            dimension: "35×25×20 cm",
            weight: "5.2 kg",
            isSIOC: true,
            skus: [
              { sku: "SKU003", productName: "iPad Pro", qty: 15, uom: "PCS" },
            ],
          },
          {
            packageId: "PKG-001-D",
            trackingNo: "1Z999AA10123456787",
            dimension: "45×35×30 cm",
            weight: "11.0 kg",
            skus: [
              { sku: "SKU004", productName: "AirPods Pro", qty: 60, uom: "PCS" },
              { sku: "SKU005", productName: "Apple Watch Ultra", qty: 10, uom: "PCS" },
            ],
          },
          {
            packageId: "PKG-001-E",
            trackingNo: "1Z999AA10123456788",
            dimension: "38×28×22 cm",
            weight: "6.8 kg",
            skus: [
              { sku: "SKU002", productName: "MacBook Pro", qty: 5, uom: "PCS" },
            ],
          },
        ],
      },
      {
        palletId: "PLT-A-003",
        cartons: [
          {
            packageId: "PKG-001-F",
            trackingNo: "1Z999AA10123456789",
            dimension: "55×45×35 cm",
            weight: "14.6 kg",
            skus: [
              { sku: "SKU001", productName: "iPhone 15 Pro", qty: 20, uom: "PCS" },
              { sku: "SKU004", productName: "AirPods Pro", qty: 40, uom: "PCS" },
              { sku: "SKU003", productName: "iPad Pro", qty: 10, uom: "PCS" },
            ],
          },
        ],
      },
    ],
  },
  // Shipment 2: Ground Express — multiple direct cartons, no container/pallet
  "2": {
    cartons: [
      {
        packageId: "PKG-002-A",
        trackingNo: "9876543210001",
        dimension: "45×35×28 cm",
        weight: "10.1 kg",
        skus: [
          { sku: "SKU004", productName: "AirPods Pro", qty: 25, uom: "PCS" },
        ],
      },
      {
        packageId: "PKG-002-B",
        trackingNo: "9876543210002",
        dimension: "40×30×25 cm",
        weight: "7.5 kg",
        skus: [
          { sku: "SKU001", productName: "iPhone 15 Pro", qty: 10, uom: "PCS" },
          { sku: "SKU005", productName: "Apple Watch Ultra", qty: 15, uom: "PCS" },
        ],
      },
      {
        packageId: "PKG-002-C",
        trackingNo: "9876543210003",
        dimension: "35×25×20 cm",
        weight: "4.2 kg",
        isSIOC: true,
        skus: [
          { sku: "SKU003", productName: "iPad Pro", qty: 8, uom: "PCS" },
        ],
      },
    ],
  },
  // Shipment 3: Sea Freight — 2 Containers, multiple Pallets, multiple Cartons
  "3": {
    containers: [
      {
        containerId: "MSCU1234567",
        pallets: [
          {
            palletId: "PLT-SEA-001",
            cartons: [
              {
                packageId: "CTN-001",
                trackingNo: "5555666677001",
                dimension: "60×50×40 cm",
                weight: "22.0 kg",
                skus: [
                  { sku: "SKU003", productName: "iPad Pro", qty: 20, uom: "PCS" },
                  { sku: "SKU004", productName: "AirPods Pro", qty: 50, uom: "PCS" },
                ],
              },
              {
                packageId: "CTN-002",
                trackingNo: "5555666677002",
                dimension: "55×45×35 cm",
                weight: "18.5 kg",
                isSIOC: true,
                skus: [
                  { sku: "SKU004", productName: "AirPods Pro", qty: 80, uom: "PCS" },
                ],
              },
            ],
          },
          {
            palletId: "PLT-SEA-002",
            cartons: [
              {
                packageId: "CTN-003",
                trackingNo: "5555666677003",
                dimension: "50×40×30 cm",
                weight: "15.8 kg",
                skus: [
                  { sku: "SKU001", productName: "iPhone 15 Pro", qty: 10, uom: "PCS" },
                  { sku: "SKU005", productName: "Apple Watch Ultra", qty: 20, uom: "PCS" },
                ],
              },
              {
                packageId: "CTN-004",
                trackingNo: "5555666677004",
                dimension: "45×35×25 cm",
                weight: "9.2 kg",
                skus: [
                  { sku: "SKU001", productName: "iPhone 15 Pro", qty: 15, uom: "PCS" },
                ],
              },
            ],
          },
        ],
      },
      {
        containerId: "MSCU7654321",
        pallets: [
          {
            palletId: "PLT-SEA-003",
            cartons: [
              {
                packageId: "CTN-005",
                trackingNo: "5555666677005",
                dimension: "65×55×45 cm",
                weight: "28.0 kg",
                skus: [
                  { sku: "SKU002", productName: "MacBook Pro", qty: 10, uom: "PCS" },
                  { sku: "SKU003", productName: "iPad Pro", qty: 30, uom: "PCS" },
                ],
              },
            ],
          },
          {
            palletId: "PLT-SEA-004",
            cartons: [
              {
                packageId: "CTN-006",
                trackingNo: "5555666677006",
                dimension: "50×40×35 cm",
                weight: "16.5 kg",
                skus: [
                  { sku: "SKU005", productName: "Apple Watch Ultra", qty: 40, uom: "PCS" },
                ],
              },
              {
                packageId: "CTN-007",
                trackingNo: "5555666677007",
                dimension: "40×30×25 cm",
                weight: "7.8 kg",
                isSIOC: true,
                skus: [
                  { sku: "SKU004", productName: "AirPods Pro", qty: 100, uom: "PCS" },
                ],
              },
              {
                packageId: "CTN-008",
                trackingNo: "5555666677008",
                dimension: "55×45×30 cm",
                weight: "14.3 kg",
                skus: [
                  { sku: "SKU002", productName: "MacBook Pro", qty: 5, uom: "PCS" },
                  { sku: "SKU001", productName: "iPhone 15 Pro", qty: 25, uom: "PCS" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}

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

function PODetailPageContent() {
  const { t, language } = useI18n()
  const tf = React.useCallback((en: string, zh: string) => language === "zh" ? zh : en, [language])
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedPoNo = searchParams.get("poNo")
  const initialPODetail = requestedPoNo ? (poDetailScenarios[requestedPoNo] || mockPODetail) : mockPODetail
  const sidebarItems = createPurchaseSidebarItems(t)
  const [activeMainTab, setActiveMainTab] = React.useState("items")
  const [activeSideTab, setActiveSideTab] = React.useState("routing")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSendDialog, setShowSendDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)
  const [showCloseLineDialog, setShowCloseLineDialog] = React.useState(false)
  const [showProductSelectionDialog, setShowProductSelectionDialog] = React.useState(false)
  const [showSupplyAllocationDialog, setShowSupplyAllocationDialog] = React.useState(false)
  const [showCreateTransferDialog, setShowCreateTransferDialog] = React.useState(false)
  const [showChangeVendorDialog, setShowChangeVendorDialog] = React.useState(false)
  const [selectedSupplyAllocation, setSelectedSupplyAllocation] = React.useState<typeof mockPODetail.supplyAllocationOrders[0] | null>(null)
  const [showAllocationItemDialog, setShowAllocationItemDialog] = React.useState(false)
  const [allocationMode, setAllocationMode] = React.useState<"allocate" | "revise">("allocate")
  const [editingVendorDraftId, setEditingVendorDraftId] = React.useState<string | null>(null)
  const [allocationDrafts, setAllocationDrafts] = React.useState<VendorAllocationDraft[]>([])
  const [revisionDrafts, setRevisionDrafts] = React.useState<VendorAllocationDraft[]>([])
  const [dialogStep, setDialogStep] = React.useState<"impact" | "plan" | "confirm">("plan")
  const [selectedLineForClose, setSelectedLineForClose] = React.useState<typeof mockPODetail.lineItems[0] | null>(null)
  const [editedLineItems, setEditedLineItems] = React.useState(initialPODetail.lineItems)
  const [editErrors, setEditErrors] = React.useState<Record<string, string>>({})
  const [selectedAllocationOrder, setSelectedAllocationOrder] = React.useState<string | null>(initialPODetail.supplyAllocationOrders[0]?.id || null)
  const [selectedReceipt, setSelectedReceipt] = React.useState<string | null>(initialPODetail.receiptRecords[0]?.id || null)
  const [selectedShipment, setSelectedShipment] = React.useState<string | null>(initialPODetail.shipmentRecords[0]?.id || null)
  const [poData, setPOData] = React.useState(initialPODetail)
  const [copiedField, setCopiedField] = React.useState<string | null>(null)
  const unallocatedSupplyQty = React.useMemo(() => (
    poData.unallocatedSupplyDemand.lines.reduce((sum, line) => sum + line.quantity, 0)
  ), [poData.unallocatedSupplyDemand.lines])
  const missingFgWarehouse = poData.purchaseType === "FACTORY_DIRECT"
    && poData.unallocatedSupplyDemand.routeType === "VIA_FG"
    && poData.unallocatedSupplyDemand.missingRequirement === "VENDOR_FG_WAREHOUSE"
  const activeDrafts = allocationMode === "allocate" ? allocationDrafts : revisionDrafts
  const activeDemandLines = allocationMode === "allocate" ? poData.unallocatedSupplyDemand.lines : (selectedSupplyAllocation?.lines || [])
  const activeEditingDraft = activeDrafts.find((draft) => draft.id === editingVendorDraftId) || null

  const buildDefaultVendorDraft = React.useCallback((id: string, vendor: "DG" | "SZ" = "DG"): VendorAllocationDraft => {
    if (vendor === "SZ") {
      return {
        id,
        sourceName: "Shenzhen Smart Factory",
        sourceCode: "FAC-SZ01",
        sourceWarehouseName: "Shenzhen Smart Factory Warehouse",
        sourceWarehouseCode: "FAC-WH-SZ01",
        routeType: "VIA_FG",
        intermediateWarehouseName: "Shenzhen Vendor FG Warehouse",
        destinationWarehouseName: "Main Warehouse - Los Angeles",
        destinationWarehouseCode: "WH001",
        soStrategy: "BY_VENDOR_PO",
        lineQtys: {},
      }
    }

    return {
      id,
      sourceName: "Dongguan Precision Works",
      sourceCode: "FAC-DG01",
      sourceWarehouseName: "Dongguan Factory Warehouse",
      sourceWarehouseCode: "FAC-WH-DG01",
      routeType: "VIA_FG",
      intermediateWarehouseName: "Dongguan Vendor FG Warehouse",
      destinationWarehouseName: "Main Warehouse - Los Angeles",
      destinationWarehouseCode: "WH001",
      soStrategy: "BY_VENDOR_PO",
      lineQtys: {},
    }
  }, [])

  const getDraftTotal = React.useCallback((draft: VendorAllocationDraft) => {
    return Object.values(draft.lineQtys).reduce((sum, qty) => sum + qty, 0)
  }, [])

  const getLineAllocatedTotal = React.useCallback((line: SupplyLineDraft, drafts: VendorAllocationDraft[]) => {
    return drafts.reduce((sum, draft) => sum + (draft.lineQtys[line.skuCode] || 0), 0)
  }, [])

  const getActiveTotal = React.useCallback((drafts: VendorAllocationDraft[]) => {
    return drafts.reduce((sum, draft) => sum + getDraftTotal(draft), 0)
  }, [getDraftTotal])

  const revisionLineSummary = React.useMemo(() => {
    if (!selectedSupplyAllocation) return []
    return selectedSupplyAllocation.lines.map((line) => {
      const revisedQty = getLineAllocatedTotal(line, revisionDrafts)
      return {
        ...line,
        revisedQty,
        deltaQty: revisedQty - line.allocatedQty,
      }
    })
  }, [getLineAllocatedTotal, revisionDrafts, selectedSupplyAllocation])

  const revisionTotalQty = React.useMemo(() => (
    revisionDrafts.reduce((sum, draft) => sum + getDraftTotal(draft), 0)
  ), [getDraftTotal, revisionDrafts])

  const revisionOriginalQty = React.useMemo(() => (
    selectedSupplyAllocation?.lines.reduce((sum, line) => sum + line.allocatedQty, 0) || 0
  ), [selectedSupplyAllocation])

  const revisionBalanced = revisionLineSummary.length > 0 && revisionLineSummary.every((line) => line.revisedQty === line.allocatedQty)

  const updateDraftLineQty = React.useCallback((draftId: string, skuCode: string, quantity: number, mode: "allocate" | "revise") => {
    const updater = (drafts: VendorAllocationDraft[]) => drafts.map((draft) => {
      if (draft.id !== draftId) return draft
      const nextLineQtys = { ...draft.lineQtys }
      if (quantity <= 0) {
        delete nextLineQtys[skuCode]
      } else {
        nextLineQtys[skuCode] = quantity
      }
      return { ...draft, lineQtys: nextLineQtys }
    })

    if (mode === "allocate") {
      setAllocationDrafts(updater)
    } else {
      setRevisionDrafts(updater)
    }
  }, [])

  const addVendorDraft = React.useCallback((mode: "allocate" | "revise") => {
    const id = `${mode}-vendor-${Date.now()}`
    const nextDraft = buildDefaultVendorDraft(id, "DG")
    if (mode === "allocate") {
      setAllocationDrafts((drafts) => [...drafts, nextDraft])
    } else {
      setRevisionDrafts((drafts) => [...drafts, nextDraft])
    }
  }, [buildDefaultVendorDraft])

  const removeVendorDraft = React.useCallback((mode: "allocate" | "revise", draftId: string) => {
    if (mode === "allocate") {
      setAllocationDrafts((drafts) => drafts.filter((draft) => draft.id !== draftId))
      return
    }

    setRevisionDrafts((drafts) => drafts.filter((draft) => draft.id !== draftId))
  }, [])

  const openItemPicker = React.useCallback((mode: "allocate" | "revise", draftId: string) => {
    setAllocationMode(mode)
    setEditingVendorDraftId(draftId)
    setShowAllocationItemDialog(true)
  }, [])

  const openAllocateSupplyDialog = React.useCallback(() => {
    const firstDraft = buildDefaultVendorDraft("allocate-vendor-1", "DG")
    firstDraft.lineQtys = Object.fromEntries(poData.unallocatedSupplyDemand.lines.map((line) => [line.skuCode, line.quantity]))
    setAllocationMode("allocate")
    setDialogStep("plan")
    setSelectedSupplyAllocation(poData.unallocatedSupplyDemand as any)
    setAllocationDrafts([firstDraft])
    setShowSupplyAllocationDialog(true)
  }, [buildDefaultVendorDraft, poData.unallocatedSupplyDemand])

  const openReviseAllocationDialog = React.useCallback((order: typeof mockPODetail.supplyAllocationOrders[0]) => {
    const vendorType = order.sourceCode === "FAC-SZ01" ? "SZ" : "DG"
    const draft = buildDefaultVendorDraft("revise-vendor", vendorType)
    draft.isOriginal = true
    draft.lineQtys = Object.fromEntries(order.lines.map((line) => [line.skuCode, line.allocatedQty]))

    setAllocationMode("revise")
    setDialogStep("impact")
    setSelectedSupplyAllocation(order)
    setRevisionDrafts([draft])
    setShowChangeVendorDialog(true)
  }, [buildDefaultVendorDraft])

  const updateSupplyAllocationOrder = React.useCallback((orderId: string, updater: (order: typeof mockPODetail.supplyAllocationOrders[0]) => typeof mockPODetail.supplyAllocationOrders[0]) => {
    setPOData((current) => ({
      ...current,
      supplyAllocationOrders: current.supplyAllocationOrders.map((order) => (
        order.id === orderId ? updater(order) : order
      )),
    }))
  }, [])

  const handleRetryVendorRnPush = React.useCallback((order: typeof mockPODetail.supplyAllocationOrders[0]) => {
    updateSupplyAllocationOrder(order.id, (currentOrder) => ({
      ...currentOrder,
      vendorRnStatus: "WAITING_ACCEPT" as VendorRnStatus,
      vendorRnError: "",
      vendorRnMessageId: currentOrder.vendorRnMessageId || `oms.vendor-rn.${currentOrder.allocationNo}`,
      vendorRnLastPushedAt: new Date().toISOString(),
      vendorRnRetryCount: (currentOrder.vendorRnRetryCount || 0) + 1,
    }))
    toast.success(tf("Vendor RN pushed again", "Vendor RN 已重新推送"), {
      description: tf("Waiting for downstream acceptance.", "正在等待下游接收。"),
    })
  }, [tf, updateSupplyAllocationOrder])

  const handleCancelVendorRn = React.useCallback((order: typeof mockPODetail.supplyAllocationOrders[0]) => {
    updateSupplyAllocationOrder(order.id, (currentOrder) => ({
      ...currentOrder,
      vendorReceiptNo: "",
      outboundOrderNo: "",
      vendorRnStatus: "RN_CANCELLED" as VendorRnStatus,
      vendorRnError: tf("Vendor RN was cancelled manually. Recreate it from the vendor order.", "Vendor RN 已人工取消，需要从 Vendor Order 重新创建。"),
      vendorRnLastPushedAt: new Date().toISOString(),
      canChangeVendor: true,
    }))
    setPOData((current) => ({
      ...current,
      receiptRecords: current.receiptRecords.map((receipt: any) => (
        receipt.sourceAllocationNo === order.allocationNo && receipt.receiptType === "VENDOR_WAREHOUSE_RECEIPT"
          ? { ...receipt, receiptStatus: "CANCELLED", pushedToWarehouse: false, notes: `${receipt.notes} Vendor RN cancelled before downstream acceptance.` }
          : receipt
      )),
    }))
    toast.success(tf("Vendor RN cancelled", "Vendor RN 已取消"), {
      description: tf("The vendor order can create a new RN now.", "当前 Vendor Order 现在可以重新创建 RN。"),
    })
  }, [tf, updateSupplyAllocationOrder])

  const handleCreateVendorRn = React.useCallback((order: typeof mockPODetail.supplyAllocationOrders[0]) => {
    const suffix = `${Date.now()}`.slice(-4)
    const newVendorReceiptNo = `VRN-${order.sourceCode.replace("FAC-", "")}-${suffix}`
    const newOutboundOrderNo = `SO-${order.sourceCode}-${suffix}`

    updateSupplyAllocationOrder(order.id, (currentOrder) => ({
      ...currentOrder,
      vendorReceiptNo: newVendorReceiptNo,
      outboundOrderNo: newOutboundOrderNo,
      vendorRnStatus: "RN_CREATED" as VendorRnStatus,
      vendorRnError: "",
      vendorRnMessageId: "",
      vendorRnLastPushedAt: null,
      vendorRnRetryCount: 0,
    }))
    toast.success(tf("Vendor RN recreated", "Vendor RN 已重新创建"), {
      description: newVendorReceiptNo,
    })
  }, [tf, updateSupplyAllocationOrder])

  const buildGeneratedAllocation = React.useCallback((draft: VendorAllocationDraft, lines: SupplyLineDraft[], suffix: string, status: "ALLOCATED" | "REVISED" = "ALLOCATED") => {
    const draftLines = lines
      .map((line) => ({
        sourceLineNo: line.sourceLineNo,
        skuCode: line.skuCode,
        productName: line.productName,
        quantity: draft.lineQtys[line.skuCode] || 0,
        allocatedQty: draft.lineQtys[line.skuCode] || 0,
        uom: line.uom,
      }))
      .filter((line) => line.quantity > 0)

    const receiptNo = `VRN-${draft.sourceCode.replace("FAC-", "")}-${suffix}`
    const outboundNo = `SO-${draft.sourceCode}-${suffix}`

    return {
      id: `sao-${suffix}-${draft.id}`,
      allocationNo: `SAO${poData.orderNo.replace("PO", "")}-${suffix}`,
      allocationName: status === "REVISED" ? "Factory direct supply allocation - revised" : "Factory direct supply allocation - allocated",
      sourceType: "VENDOR_WAREHOUSE",
      sourceName: draft.sourceName,
      sourceCode: draft.sourceCode,
      sourceWarehouseName: draft.sourceWarehouseName,
      sourceWarehouseCode: draft.sourceWarehouseCode,
      routeType: draft.routeType,
      intermediateWarehouseName: draft.routeType === "VIA_FG" ? draft.intermediateWarehouseName : "",
      destinationWarehouseName: draft.destinationWarehouseName,
      destinationWarehouseCode: draft.destinationWarehouseCode,
      vendorReceiptNo: receiptNo,
      outboundOrderNo: outboundNo,
      finalReceiptNo: `RN-${poData.orderNo}`,
      vendorRnStatus: "RN_CREATED" as VendorRnStatus,
      vendorRnError: "",
      vendorRnMessageId: "",
      vendorRnLastPushedAt: null,
      vendorRnRetryCount: 0,
      status: "ALLOCATED",
      canChangeVendor: true,
      lines: draftLines,
    }
  }, [poData.orderNo])

  const buildGeneratedReceipts = React.useCallback((allocation: any) => {
    const expectedQty = allocation.lines.reduce((sum: number, line: any) => sum + line.allocatedQty, 0)
    return [
      {
        id: allocation.vendorReceiptNo.toLowerCase(),
        receiptNo: allocation.vendorReceiptNo,
        wmsReceiptNo: `WMS-${allocation.vendorReceiptNo}`,
        receiptType: "VENDOR_WAREHOUSE_RECEIPT",
        sourceAllocationNo: allocation.allocationNo,
        sourceWarehouseName: allocation.sourceWarehouseName,
        sourceWarehouseCode: allocation.sourceWarehouseCode,
        targetWarehouseName: allocation.intermediateWarehouseName || allocation.destinationWarehouseName,
        targetWarehouseCode: allocation.routeType === "VIA_FG" ? `VFG-${allocation.sourceCode.replace("FAC-", "")}` : allocation.destinationWarehouseCode,
        finalReceiptNo: allocation.finalReceiptNo,
        outboundOrderNo: allocation.outboundOrderNo,
        receiptDate: new Date().toISOString(),
        receivedQty: 0,
        expectedQty,
        receivedBy: "Factory Dock Team",
        receiptStatus: "NEW",
        notes: `Vendor warehouse receipt generated from ${allocation.allocationNo}.`,
        relatedShipment: "Internal factory transfer",
        warehouseLocation: "Pending putaway",
        qualityStatus: "PENDING",
        damageQty: 0,
        rejectedQty: 0,
        pushedToWarehouse: false,
        pushedDate: null,
        lines: allocation.lines.map((line: any) => ({ ...line, expectedQty: line.allocatedQty, receivedQty: 0 })),
      },
      {
        id: `${allocation.finalReceiptNo.toLowerCase()}-${allocation.sourceCode.toLowerCase()}`,
        receiptNo: `${allocation.finalReceiptNo}-${allocation.sourceCode}`,
        wmsReceiptNo: `WMS-${allocation.finalReceiptNo}-${allocation.sourceCode}`,
        receiptType: "FINAL_WAREHOUSE_RECEIPT",
        sourceAllocationNo: allocation.allocationNo,
        sourceWarehouseName: allocation.intermediateWarehouseName || allocation.sourceWarehouseName,
        sourceWarehouseCode: allocation.routeType === "VIA_FG" ? `VFG-${allocation.sourceCode.replace("FAC-", "")}` : allocation.sourceWarehouseCode,
        targetWarehouseName: allocation.destinationWarehouseName,
        targetWarehouseCode: allocation.destinationWarehouseCode,
        finalReceiptNo: allocation.finalReceiptNo,
        outboundOrderNo: allocation.outboundOrderNo,
        receiptDate: new Date().toISOString(),
        receivedQty: 0,
        expectedQty,
        receivedBy: "LA Receiving Team",
        receiptStatus: "NEW",
        notes: `Final warehouse receipt generated from ${allocation.allocationNo}.`,
        relatedShipment: allocation.outboundOrderNo,
        warehouseLocation: "Pending putaway",
        qualityStatus: "PENDING",
        damageQty: 0,
        rejectedQty: 0,
        pushedToWarehouse: false,
        pushedDate: null,
        lines: allocation.lines.map((line: any) => ({ ...line, expectedQty: line.allocatedQty, receivedQty: 0 })),
      },
    ]
  }, [])

  const handleGenerateAllocation = React.useCallback(() => {
    const validDrafts = allocationDrafts.filter((draft) => getDraftTotal(draft) > 0)
    if (validDrafts.length === 0) {
      toast.error(tf("Add at least one vendor and item quantity first", "请先添加至少一个 vendor 并分配商品数量"))
      return
    }

    const hasMissingLine = poData.unallocatedSupplyDemand.lines.some((line) => getLineAllocatedTotal(line, allocationDrafts) !== line.quantity)
    if (hasMissingLine) {
      toast.error(tf("Every PO demand line must be fully allocated before generation", "生成前每一行 PO 需求都必须完整分配"))
      return
    }

    const generatedAllocations = validDrafts.map((draft, index) => buildGeneratedAllocation(draft, poData.unallocatedSupplyDemand.lines, `A${index + 1}`))
    const generatedReceipts = generatedAllocations.flatMap((allocation) => buildGeneratedReceipts(allocation))

    setPOData((current) => ({
      ...current,
      factoryFulfillmentStatus: "ALLOCATED",
      unallocatedSupplyDemand: {
        ...current.unallocatedSupplyDemand,
        status: "ALLOCATED",
        lines: [],
      },
      supplyAllocationOrders: [...current.supplyAllocationOrders, ...generatedAllocations],
      receiptRecords: [...generatedReceipts, ...current.receiptRecords],
    }))
    setSelectedAllocationOrder(generatedAllocations[0]?.id || selectedAllocationOrder)
    setSelectedReceipt(generatedReceipts[0]?.id || selectedReceipt)
    setShowSupplyAllocationDialog(false)
    setActiveMainTab("supply-allocation")
    toast.success(tf("Vendor PO / SO generated", "Vendor PO / SO 已生成"), {
      description: tf("Allocation orders and warehouse receipts were added to this PO.", "已在当前 PO 下新增分配单和入库单。"),
    })
  }, [allocationDrafts, buildGeneratedAllocation, buildGeneratedReceipts, getDraftTotal, getLineAllocatedTotal, poData.unallocatedSupplyDemand.lines, selectedAllocationOrder, selectedReceipt, tf])

  const handleApplyRevision = React.useCallback(() => {
    if (!selectedSupplyAllocation) return

    const validDrafts = revisionDrafts.filter((draft) => getDraftTotal(draft) > 0)
    if (validDrafts.length === 0) {
      toast.error(tf("Keep at least one item line in the revised vendor plan", "修订方案里至少保留一条 item line"))
      return
    }

    const activeDraft = validDrafts[0]
    const hasInvalidQty = selectedSupplyAllocation.lines.some((line) => {
      const qty = activeDraft.lineQtys[line.skuCode]
      return qty !== undefined && qty <= 0
    })
    if (hasInvalidQty) {
      toast.error(tf("Vendor quantities must be greater than 0", "Vendor 数量必须大于 0"))
      return
    }

    const generatedAllocations = validDrafts.map((draft, index) => buildGeneratedAllocation(draft, selectedSupplyAllocation.lines, `R${index + 1}`, "REVISED"))
    const generatedReceipts = generatedAllocations.flatMap((allocation) => buildGeneratedReceipts(allocation))
    const vendorChanged = activeDraft.sourceCode !== selectedSupplyAllocation.sourceCode

    setPOData((current) => ({
      ...current,
      supplyAllocationOrders: [
        ...current.supplyAllocationOrders.map((order) => (
          order.id === selectedSupplyAllocation.id
            ? { ...order, status: "VOIDED", canChangeVendor: false, allocationName: `${order.allocationName} - voided by revision` }
            : order
        )),
        ...generatedAllocations,
      ],
      receiptRecords: [
        ...current.receiptRecords.map((receipt: any) => (
          receipt.sourceAllocationNo === selectedSupplyAllocation.allocationNo
            ? { ...receipt, receiptStatus: "CANCELLED", notes: `${receipt.notes} Cancelled by allocation revision.` }
            : receipt
        )),
        ...generatedReceipts,
      ],
    }))
    setSelectedAllocationOrder(generatedAllocations[0]?.id || selectedAllocationOrder)
    setSelectedReceipt(generatedReceipts[0]?.id || selectedReceipt)
    setShowChangeVendorDialog(false)
    setActiveMainTab("supply-allocation")
    toast.success(tf("Allocation revised", "分配已修订"), {
      description: vendorChanged
        ? tf("Old vendor documents were cancelled before generating the new vendor PO / SO.", "已先取消原 vendor 单据，再生成新的 Vendor PO / SO。")
        : tf("The vendor allocation was updated.", "已更新当前 vendor 的分配方案。"),
    })
  }, [buildGeneratedAllocation, buildGeneratedReceipts, getDraftTotal, revisionDrafts, selectedAllocationOrder, selectedReceipt, selectedSupplyAllocation, tf])

  // Copy helper
  const copyToClipboard = React.useCallback((text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldKey)
    setTimeout(() => setCopiedField(null), 1500)
  }, [])

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

  // ─── Available warehouses for selection (from system) ────────────────────
  const availableWarehouses = React.useMemo(() => [
    { code: "FAC-WH-DG01", name: "Dongguan Factory Warehouse", owner: "Dongguan Precision Works" },
    { code: "FAC-WH-SZ01", name: "Shenzhen Smart Factory Warehouse", owner: "Shenzhen Smart Factory" },
    { code: "WH001", name: "Main Warehouse - Los Angeles", owner: "Self" },
    { code: "WH002", name: "East Coast Warehouse - New York", owner: "Self" },
    { code: "VFG-DG01", name: "Dongguan Vendor FG Warehouse", owner: "Dongguan Precision Works" },
    { code: "VFG-SZ01", name: "Shenzhen Vendor FG Warehouse", owner: "Shenzhen Smart Factory" },
  ], [])

  const renderDraftCards = (mode: "allocate" | "revise") => {
    const drafts = mode === "allocate" ? allocationDrafts : revisionDrafts
    const lines = mode === "allocate" ? poData.unallocatedSupplyDemand.lines : (selectedSupplyAllocation?.lines || [])

    return (
      <div className="space-y-3">
        {drafts.map((draft) => {
          const assignedQty = getDraftTotal(draft)

          return (
            <Card key={draft.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">
                      {draft.sourceName || draft.sourceWarehouseName || tf("New Transfer Source", "新调拨来源")}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {draft.sourceWarehouseCode ? `${draft.sourceWarehouseCode} → ${draft.destinationWarehouseCode || poData.warehouseCode}` : tf("Select source warehouse below", "请在下方选择源仓库")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft.isOriginal && <Badge variant="outline">{tf("Original", "原始")}</Badge>}
                    <Badge variant="secondary">{assignedQty} PCS</Badge>
                    {!draft.isOriginal && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => removeVendorDraft(mode, draft.id)}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        {tf("Remove", "移除")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Row 1: Vendor + Vendor Warehouse + Target Warehouse */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>{tf("Vendor", "Vendor")}</Label>
                    <Select
                      value={draft.sourceCode}
                      onValueChange={(value) => {
                        const vendorType = value === "FAC-SZ01" ? "SZ" : "DG"
                        const next = buildDefaultVendorDraft(draft.id, vendorType)
                        next.lineQtys = draft.lineQtys
                        next.isOriginal = draft.isOriginal
                        const setter = mode === "allocate" ? setAllocationDrafts : setRevisionDrafts
                        setter((items) => items.map((item) => item.id === draft.id ? next : item))
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder={tf("Select vendor", "选择 Vendor")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FAC-DG01">Dongguan Precision Works</SelectItem>
                        <SelectItem value="FAC-SZ01">Shenzhen Smart Factory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{tf("Vendor Warehouse", "Vendor 仓库")}</Label>
                    <Select
                      value={draft.sourceWarehouseCode}
                      onValueChange={(value) => {
                        const wh = availableWarehouses.find(w => w.code === value)
                        const setter = mode === "allocate" ? setAllocationDrafts : setRevisionDrafts
                        setter((items) => items.map((item) => item.id === draft.id ? {
                          ...item,
                          sourceWarehouseCode: value,
                          sourceWarehouseName: wh?.name || value,
                        } : item))
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder={tf("Select warehouse", "选择仓库")} /></SelectTrigger>
                      <SelectContent>
                        {availableWarehouses
                          .filter(w => w.code !== (draft.destinationWarehouseCode || poData.warehouseCode))
                          .map(wh => (
                            <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{tf("Target Warehouse", "目标仓库")}</Label>
                    <Select
                      value={draft.destinationWarehouseCode || poData.warehouseCode}
                      onValueChange={(value) => {
                        const wh = availableWarehouses.find(w => w.code === value)
                        const setter = mode === "allocate" ? setAllocationDrafts : setRevisionDrafts
                        setter((items) => items.map((item) => item.id === draft.id ? {
                          ...item,
                          destinationWarehouseCode: value,
                          destinationWarehouseName: wh?.name || value,
                        } : item))
                      }}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableWarehouses
                          .filter(w => w.code !== draft.sourceWarehouseCode)
                          .map(wh => (
                            <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Via FG toggle */}
                <div className="rounded-lg border bg-muted/10 p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`via-fg-${draft.id}`}
                      className="rounded border-gray-300 h-4 w-4"
                      checked={draft.routeType === "VIA_FG"}
                      onChange={(e) => {
                        const setter = mode === "allocate" ? setAllocationDrafts : setRevisionDrafts
                        setter((items) => items.map((item) => item.id === draft.id ? {
                          ...item,
                          routeType: e.target.checked ? "VIA_FG" as const : "DIRECT" as const,
                          intermediateWarehouseName: e.target.checked ? item.intermediateWarehouseName : "",
                        } : item))
                      }}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`via-fg-${draft.id}`} className="cursor-pointer text-sm font-medium">
                        {tf("Via FG Inbound", "经成品仓入库")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tf("Create inbound receipt at FG warehouse before shipping to target.", "出库前先给成品仓创建入库单。")}
                      </p>
                    </div>
                    {draft.routeType === "VIA_FG" && (
                      <div className="w-[240px]">
                        <Select
                          value={draft.intermediateWarehouseName ? availableWarehouses.find(w => w.name === draft.intermediateWarehouseName)?.code || "VFG-SZ01" : "VFG-SZ01"}
                          onValueChange={(value) => {
                            const wh = availableWarehouses.find(w => w.code === value)
                            const setter = mode === "allocate" ? setAllocationDrafts : setRevisionDrafts
                            setter((items) => items.map((item) => item.id === draft.id ? {
                              ...item,
                              intermediateWarehouseName: wh?.name || "",
                            } : item))
                          }}
                        >
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {availableWarehouses
                              .filter(w => w.code.startsWith("VFG"))
                              .map(wh => (
                                <SelectItem key={wh.code} value={wh.code}>{wh.name}</SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline items table with editable quantities */}
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[40px] text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={lines.every(line => (draft.lineQtys[line.skuCode] || 0) > 0)}
                            onChange={(e) => {
                              const setter = mode === "allocate" ? setAllocationDrafts : setRevisionDrafts
                              setter((items) => items.map((item) => {
                                if (item.id !== draft.id) return item
                                if (e.target.checked) {
                                  const nextQtys: Record<string, number> = {}
                                  lines.forEach(line => { nextQtys[line.skuCode] = line.quantity })
                                  return { ...item, lineQtys: nextQtys }
                                }
                                return { ...item, lineQtys: {} }
                              }))
                            }}
                          />
                        </TableHead>
                        <TableHead className="text-xs">{tf("Line", "行号")}</TableHead>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs">{tf("Product", "商品")}</TableHead>
                        <TableHead className="text-xs text-right">{tf("Demand", "需求")}</TableHead>
                        <TableHead className="text-xs text-right w-[120px]">{tf("Transfer Qty", "调拨数量")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line) => {
                        const qty = draft.lineQtys[line.skuCode] || 0
                        const isChecked = qty > 0
                        return (
                          <TableRow key={`${draft.id}-${line.skuCode}`} className={isChecked ? "bg-primary/5" : ""}>
                            <TableCell className="text-center">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300"
                                checked={isChecked}
                                onChange={(e) => {
                                  updateDraftLineQty(draft.id, line.skuCode, e.target.checked ? line.quantity : 0, mode)
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-xs">{line.sourceLineNo}</TableCell>
                            <TableCell className="font-mono text-xs">{line.skuCode}</TableCell>
                            <TableCell className="text-xs">{line.productName}</TableCell>
                            <TableCell className="text-xs text-right">{line.quantity} {line.uom}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                max={line.quantity}
                                className="h-7 w-[80px] text-xs text-right ml-auto"
                                value={qty || ""}
                                disabled={!isChecked}
                                onChange={(e) => {
                                  const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), line.quantity)
                                  updateDraftLineQty(draft.id, line.skuCode, val, mode)
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
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
                      {missingFgWarehouse && (
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {tf("Pending Transfer Setup", "待配置调拨")}
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
                {missingFgWarehouse && (
                  <Button size="sm" onClick={() => setShowCreateTransferDialog(true)}>
                    <FilePlus className="h-4 w-4" />
                    <span className="ml-2">{tf("Create Transfer Order", "创建调拨单")}</span>
                  </Button>
                )}
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

          {poData.purchaseType === "FACTORY_DIRECT" && unallocatedSupplyQty > 0 && (
            <Card className="border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        {missingFgWarehouse
                          ? tf("Transfer source warehouse is required", "\u9700\u8981\u5148\u6307\u5b9a\u8c03\u62e8\u6765\u6e90\u4ed3")
                          : tf("Factory direct transfer execution is not fully configured", "\u5de5\u5382\u76f4\u53d1\u8c03\u62e8\u6267\u884c\u5c1a\u672a\u914d\u7f6e\u5b8c\u6210")}
                      </div>
                      <div className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                        {missingFgWarehouse
                          ? tf(
                              "Destination RN has been created first. The transfer route still needs a source-side warehouse before execution can continue.",
                              "\u76ee\u6807\u4ed3 RN \u5df2\u4f18\u5148\u521b\u5efa\u3002\u5f53\u524d\u8c03\u62e8\u8def\u5f84\u8fd8\u9700\u8981\u5148\u6307\u5b9a\u6765\u6e90\u4fa7\u4ed3\u5e93\uff0c\u4e4b\u540e\u624d\u80fd\u7ee7\u7eed\u6267\u884c\u3002"
                            )
                          : tf(
                              `${unallocatedSupplyQty} PCS still need source / destination transfer setup. Transfer orders will appear in the Transfer Order tab after saving.`,
                              `${unallocatedSupplyQty} PCS \u8fd8\u9700\u8981\u8865\u9f50\u6765\u6e90\u4ed3 / \u76ee\u6807\u4ed3\u7684\u8c03\u62e8\u914d\u7f6e\u3002\u4fdd\u5b58\u540e\u4f1a\u5728 Transfer Order tab \u91cc\u751f\u6210\u8c03\u62e8\u5355\u3002`
                            )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowCreateTransferDialog(true)}
                  >
                    <FilePlus className="mr-2 h-4 w-4" />
                    {tf("Create Transfer Order", "\u521b\u5efa\u8c03\u62e8\u5355")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}


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
            <div className="lg:col-span-3 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" />{tf("Basic Summary", "基础摘要")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">PO:</span><span className="font-mono font-medium text-right">{poData.orderNo}</span></div>
                    {poData.originalPoNo && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Original PO:</span><span className="font-mono text-right">{poData.originalPoNo}</span></div>}
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Reference:</span><span className="font-mono text-right">{poData.referenceNo}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Data Source", "数据来源")}:</span><span className="text-right">{poData.dataSource === 'PR_CONVERSION' ? tf('PR Conversion', 'PR转单') : tf('Manual', '手动创建')}</span></div>
                    {poData.relatedPRs.length > 0 && <div className="space-y-1"><div className="text-muted-foreground">Related PRs</div><div className="flex flex-wrap gap-1">{poData.relatedPRs.map((prNo) => <Badge key={prNo} variant="outline" className="text-[10px]">{prNo}</Badge>)}</div></div>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Building className="h-4 w-4 text-cyan-600" />{tf("Transfer Summary", "调拨摘要")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Transfer Orders", "调拨单数")}:</span><span className="font-medium text-right">{poData.purchaseType === "FACTORY_DIRECT" ? Math.max(poData.supplyAllocationOrders.length, missingFgWarehouse ? 0 : 1) : 1}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Current Stage", "当前阶段")}:</span><span className="text-right">{missingFgWarehouse ? tf("Pending Setup", "待配置") : tf("In Fulfillment", "履约中")}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Status", "状态")}:</span><span className="text-right">{poData.supplyAllocationOrders.length > 0 ? tf("Confirmed", "已确认") : tf("Pending", "待创建")}</span></div>
                    <div className="space-y-1 pt-1">
                      <div className="text-muted-foreground">{tf("Source Warehouses", "源仓库预览")}</div>
                      <div className="rounded-md border bg-muted/20 p-2 text-foreground">
                        {poData.supplyAllocationOrders.length > 0
                          ? (() => {
                              const whNames = Array.from(new Set(poData.supplyAllocationOrders.map((order) => order.sourceWarehouseName || order.sourceName)))
                              const preview = whNames.slice(0, 2).join(", ")
                              const moreCount = whNames.length - 2
                              return moreCount > 0 ? `${preview} +${moreCount}` : preview
                            })()
                          : tf("No sources configured", "尚未配置来源仓库")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-green-600" />{tf("Receiving Summary", "收货摘要")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Warehouse", "仓库")}:</span><span className="font-medium text-right">{poData.warehouseName}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">Code:</span><span className="text-right">{poData.warehouseCode}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Expected Arrival", "预计到货")}:</span><span className="text-right">{new Date(poData.expectedArrivalDate).toLocaleDateString()}</span></div>
                    <div className="space-y-1 pt-1"><div className="text-muted-foreground">{tf("Receiving Address", "收货地址")}</div><div className="rounded-md border bg-muted/20 p-2 text-foreground">{poData.warehouseAddress}</div></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-purple-600" />{tf("Terms & Fulfillment", "条款与履约")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Shipping Method", "运输方式")}:</span><span className="text-right">Air Freight</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Delivery Terms", "贸易条款")}:</span><span className="text-right">{poData.deliveryTerms}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{tf("Payment Terms", "付款条款")}:</span><span className="text-right">{poData.paymentTerms}</span></div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="rounded-md border bg-muted/20 p-2"><div className="text-muted-foreground">{tf("Shipments", "发货单")}</div><div className="font-semibold">{poData.shipmentRecords.length}</div><div className="text-muted-foreground">{tf("Shipped", "已发")}: {poData.shippedQty}</div></div>
                      <div className="rounded-md border bg-muted/20 p-2"><div className="text-muted-foreground">{tf("Receipts", "收货单")}</div><div className="font-semibold">{poData.receiptRecords.length}</div><div className="text-muted-foreground">{tf("Received", "已收")}: {poData.receivedQty}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  {poData.purchaseType === "FACTORY_DIRECT" && (
                    <TabsTrigger value="supply-allocation">Transfer Order</TabsTrigger>
                  )}
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
                {poData.purchaseType === "FACTORY_DIRECT" && (
                  <TabsContent value="supply-allocation" className="mt-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{tf("Transfer Orders", "调拨单")}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t">
                          <div className="md:col-span-1 border-r">
                            <div className="p-3 bg-muted/50 border-b">
                              <input type="text" placeholder="Search transfer no, source, destination" className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background" />
                            </div>
                            <div className="divide-y max-h-[600px] overflow-y-auto">
                              {poData.supplyAllocationOrders.length === 0 && missingFgWarehouse && (
                                <div className="p-4 text-xs text-muted-foreground">
                                  {tf("No transfer orders yet.", "暂无调拨单。")}
                                </div>
                              )}
                              {poData.supplyAllocationOrders.map((order) => {
                                const totalQty = order.lines.reduce((sum, line) => sum + line.quantity, 0)
                                const transferredQty = order.lines.reduce((sum, line) => sum + line.allocatedQty, 0)
                                const statusMeta = {
                                  PENDING_ALLOCATION: { label: tf("Draft", "\u8349\u7a3f"), className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
                                  ALLOCATED: { label: tf("Confirmed", "\u5df2\u786e\u8ba4"), className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
                                  RELEASED: { label: tf("In Transit", "\u5728\u9014"), className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
                                  VOIDED: { label: tf("Voided", "\u5df2\u4f5c\u5e9f"), className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
                                }[order.status as "PENDING_ALLOCATION" | "ALLOCATED" | "RELEASED" | "VOIDED"] || { label: order.status, className: "bg-gray-100 text-gray-800" }

                                return (
                                  <div key={order.id} onClick={() => setSelectedAllocationOrder(order.id)} className={cn("p-3 cursor-pointer transition-colors border-l-4", selectedAllocationOrder === order.id ? "bg-primary/10 border-l-primary" : "hover:bg-muted/50 border-l-transparent")}>
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                      <div>
                                        <div className="font-mono text-sm font-medium">{order.allocationNo || "-"}</div>
                                        <div className="mt-1 text-xs text-muted-foreground">{order.lines.length} {tf("items", "商品行")}</div>
                                      </div>
                                      <Badge className={statusMeta.className}>{statusMeta.label}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div className="flex items-center gap-1">
                                        <Building className="h-3 w-3" />
                                        <span>{order.sourceWarehouseName || order.sourceName}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{order.destinationWarehouseName}</span>
                                      </div>
                                      <div className="text-xs">
                                        {tf("Qty", "\u6570\u91cf")}: {transferredQty}/{totalQty} PCS
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          <div className="md:col-span-3">
                            {!selectedAllocationOrder && missingFgWarehouse && (
                              <div className="flex min-h-[320px] items-center justify-center p-6">
                                <div className="max-w-md text-center space-y-2">
                                  <div className="text-sm font-medium">{tf("No transfer orders yet", "暂无调拨单")}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {tf(
                                      "No transfer orders yet. They will appear here after the transfer setup is completed.",
                                      "当前还没有生成调拨单，完成来源/目标配置后会在这里显示。"
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedAllocationOrder && (() => {
                              const order = poData.supplyAllocationOrders.find(item => item.id === selectedAllocationOrder)
                              if (!order) return null

                              const pushStatusMap: Record<VendorRnStatus, TransferOrder["pushStatus"]> = {
                                NO_RN: "NONE",
                                RN_CREATED: "CREATED",
                                PUSH_FAILED: "PUSH_FAILED",
                                WAITING_ACCEPT: "WAITING_ACCEPT",
                                REJECTED: "REJECTED",
                                ACCEPTED: "ACCEPTED",
                                RN_CANCELLED: "CANCELLED",
                              }

                              const transferStatusMap: Record<string, TransferOrder["status"]> = {
                                PENDING_ALLOCATION: "DRAFT",
                                ALLOCATED: "ALLOCATED",
                                RELEASED: "IN_TRANSIT",
                                VOIDED: "VOIDED",
                              }

                              const vendorRnStatus = (order.vendorRnStatus || (order.vendorReceiptNo ? "RN_CREATED" : "NO_RN")) as VendorRnStatus
                              const transferOrder: TransferOrder = {
                                id: order.id,
                                transferNo: order.allocationNo || tf("PO Demand", "PO 需求"),
                                status: transferStatusMap[order.status] || "DRAFT",
                                fromWarehouseName: order.sourceWarehouseName || order.sourceName,
                                fromWarehouseCode: order.sourceWarehouseCode || order.sourceCode,
                                viaWarehouseName: order.intermediateWarehouseName,
                                viaWarehouseCode: order.routeType === "VIA_FG" ? `VFG-${order.sourceCode.replace("FAC-", "")}` : undefined,
                                toWarehouseName: order.destinationWarehouseName,
                                toWarehouseCode: order.destinationWarehouseCode,
                                sourceName: order.sourceName,
                                sourceCode: order.sourceCode,
                                lines: order.lines.map((line) => ({
                                  lineNo: line.sourceLineNo,
                                  skuCode: line.skuCode,
                                  productName: line.productName,
                                  plannedQty: line.quantity,
                                  transferredQty: line.allocatedQty,
                                  uom: line.uom,
                                })),
                                sourceInboundNo: order.vendorReceiptNo,
                                outboundOrderNo: order.outboundOrderNo,
                                targetInboundNo: order.finalReceiptNo,
                                pushStatus: pushStatusMap[vendorRnStatus],
                                pushError: order.vendorRnError,
                                pushMessageId: order.vendorRnMessageId,
                                lastPushedAt: order.vendorRnLastPushedAt,
                                retryCount: order.vendorRnRetryCount,
                                createdAt: poData.created,
                                canRevise: order.canChangeVendor,
                              }

                              return (
                                <TransferOrderDetail
                                  order={transferOrder}
                                  tf={tf}
                                  onRevise={() => openReviseAllocationDialog(order)}
                                  onCreateInbound={() => handleCreateVendorRn(order)}
                                  onRetryPush={() => handleRetryVendorRnPush(order)}
                                  onCancelInbound={() => handleCancelVendorRn(order)}
                                />
                              )
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

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
                              placeholder="Search receipt no, allocation, warehouse"
                              className="w-full h-8 px-3 text-xs border border-input rounded-md bg-background"
                            />
                          </div>
                          <div className="divide-y max-h-[600px] overflow-y-auto">
                            {poData.receiptRecords.map((receipt) => (
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
                                        : receipt.receiptStatus === 'NEW'
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                    }>
                                      {receipt.receiptStatus === 'CLOSED' ? 'Closed' : receipt.receiptStatus === 'NEW' ? 'New' : 'In Progress'}
                                    </Badge>
                                    {!receipt.pushedToWarehouse && (
                                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                                        Not Pushed
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>{receipt.receiptType === "VENDOR_WAREHOUSE_RECEIPT" ? "Vendor RN / FG Receipt" : "Target RN"}</div>
                                  <div>{receipt.sourceWarehouseName} {"->"} {receipt.targetWarehouseName}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right: Receipt Detail - 3/4 width */}
                        <div className="md:col-span-3">
                          {selectedReceipt && (() => {
                            const receipt = poData.receiptRecords.find(r => r.id === selectedReceipt)
                            if (!receipt) return null
                            const receiptLines = receipt.lines || []
                            const isVendorRN = receipt.receiptType === "VENDOR_WAREHOUSE_RECEIPT"
                            const receiptTypeLabel = isVendorRN ? "Vendor RN / FG Receipt" : "Target RN"

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
                                          : receipt.receiptStatus === 'NEW'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                      }>
                                        {receipt.receiptStatus === 'CLOSED' ? 'Closed' : receipt.receiptStatus === 'NEW' ? 'New' : 'In Progress'}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {receiptTypeLabel} {"->"} {new Date(receipt.receiptDate).toLocaleString()}
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

                                {(receipt.sourceAllocationNo || missingFgWarehouse) && (
                                  <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                                    <div className="font-medium">
                                      {missingFgWarehouse
                                        ? tf("Target RN is pre-created", "目标仓 RN 已预创建")
                                        : isVendorRN
                                          ? tf("Vendor RN is separate from Target RN", "Vendor RN 与目标仓 RN 是分开的单据")
                                          : tf("Target RN is fulfilled by the allocation chain", "目标仓 RN 由分配链路履约")}
                                    </div>
                                    <div className="mt-1 text-xs text-amber-800/90">
                                      {missingFgWarehouse
                                        ? tf(
                                            "This target RN is waiting for Vendor FG warehouse assignment before the Via FG fulfillment chain can continue.",
                                            "该目标仓 RN 正在等待 Vendor 成品仓指派，之后才能继续经成品仓履约链路。"
                                          )
                                        : isVendorRN
                                          ? tf(
                                              "This Vendor RN receives goods into the vendor / FG warehouse. It does not replace the target warehouse RN.",
                                              "该 Vendor RN 用于 vendor / 成品仓入库，不替代目标仓 RN。"
                                            )
                                          : tf(
                                              "This target RN is the final receiving demand. Change vendor, qty, or routing through Revise Allocation.",
                                              "该目标仓 RN 是最终收货需求。如需修改 vendor、数量或路径，请通过 Revise Allocation。"
                                            )}
                                    </div>
                                  </div>
                                )}

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
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${receipt.receiptStatus === 'CLOSED'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {receipt.receiptStatus === 'CLOSED' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Clock className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${receipt.receiptStatus === 'CLOSED' ? '' : 'text-muted-foreground'
                                          }`}>Pending Receipt</div>
                                        <div className="text-xs text-muted-foreground">Waiting</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${receipt.receiptStatus === 'CLOSED'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* Receiving */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${receipt.receiptStatus === 'CLOSED'
                                        ? 'bg-green-100 dark:bg-green-900/20'
                                        : 'bg-gray-100 dark:bg-gray-800'
                                        }`}>
                                        {receipt.receiptStatus === 'CLOSED' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Package className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={`text-sm font-medium ${receipt.receiptStatus === 'CLOSED' ? '' : 'text-muted-foreground'
                                          }`}>Receiving</div>
                                        <div className="text-xs text-muted-foreground">In Process</div>
                                      </div>
                                    </div>
                                    <div className={`flex-1 h-0.5 mx-2 ${receipt.receiptStatus === 'CLOSED'
                                      ? 'bg-green-300 dark:bg-green-700'
                                      : 'bg-gray-200 dark:bg-gray-700'
                                      }`} />

                                    {/* Received */}
                                    <div className="flex flex-col items-center flex-1">
                                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", receipt.receiptStatus === 'CLOSED' ? "bg-green-100 dark:bg-green-900/20" : "bg-gray-100 dark:bg-gray-800")}>
                                        {receipt.receiptStatus === 'CLOSED' ? (
                                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Package className="h-4 w-4 text-gray-400" />
                                        )}
                                      </div>
                                      <div className="mt-2 text-center">
                                        <div className={cn("text-sm font-medium", receipt.receiptStatus !== 'CLOSED' && "text-muted-foreground")}>Received</div>
                                        <div className="text-xs text-muted-foreground">{receipt.receivedQty} / {receipt.expectedQty}</div>
                                      </div>
                                    </div>
                                    <div className={cn("flex-1 h-0.5 mx-2", receipt.receiptStatus === 'CLOSED' ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700")} />

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
                                        <TableHead className="text-xs p-3 text-center">Expected</TableHead>
                                        <TableHead className="text-xs p-3">UOM</TableHead>
                                        <TableHead className="text-xs p-3 text-right">Pallet Count</TableHead>
                                        <TableHead className="text-xs p-3">SN Product</TableHead>
                                        <TableHead className="text-xs p-3 text-right">Lot No.</TableHead>
                                        <TableHead className="text-xs p-3 text-right">SN No.</TableHead>
                                        <TableHead className="text-xs p-3">Notes</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {receiptLines.length > 0 ? receiptLines.map((line) => (
                                        <TableRow key={`${line.sourceLineNo}-${line.skuCode}`} className="hover:bg-muted/50">
                                          <TableCell className="text-xs p-3">
                                            <div className="font-medium">{line.productName}</div>
                                            <div className="text-muted-foreground font-mono">{line.skuCode}</div>
                                          </TableCell>
                                          <TableCell className="text-xs p-3 text-center font-medium">{line.receivedQty}</TableCell>
                                          <TableCell className="text-xs p-3 text-center font-mono">{line.expectedQty}</TableCell>
                                          <TableCell className="text-xs p-3">
                                            <Badge variant="outline" className="text-xs">{line.uom}</Badge>
                                          </TableCell>
                                          <TableCell className="text-xs p-3 text-right font-medium text-muted-foreground">-</TableCell>
                                          <TableCell className="text-xs p-3 text-muted-foreground">-</TableCell>
                                          <TableCell className="text-xs p-3 text-right text-muted-foreground">-</TableCell>
                                          <TableCell className="text-xs p-3 text-right text-muted-foreground">-</TableCell>
                                          <TableCell className="text-xs p-3 text-muted-foreground">Allocation {receipt.sourceAllocationNo}</TableCell>
                                        </TableRow>
                                      )) : (
                                        <TableRow>
                                          <TableCell colSpan={9} className="h-20 text-center text-sm text-muted-foreground">
                                            {tf("No receipt lines yet. This destination RN is waiting for fulfillment configuration.", "暂无入库明细。该目的地 RN 正在等待履约配置。")}
                                          </TableCell>
                                        </TableRow>
                                      )}
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
                                        <span className="text-muted-foreground">Expected / Received:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{receipt.expectedQty} / {receipt.receivedQty}</span>
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
                                        <span className="text-muted-foreground">Target Warehouse:</span>
                                        <span className="font-medium">{receipt.targetWarehouseName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Target Code:</span>
                                        <Badge variant="outline" className="text-xs font-mono">
                                          {receipt.targetWarehouseCode}
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
                                          {receipt.qualityStatus === 'PASSED' ? 'Passed' : 'Pending'}
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Source Allocation:</span>
                                        <span className="font-mono text-xs">{receipt.sourceAllocationNo}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Outbound / SO:</span>
                                        <span className="font-mono text-xs">{receipt.outboundOrderNo || "-"}</span>
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

                                {/* Row-Spanning Unified Table */}
                                {(() => {
                                  const unitData = shipmentUnitsData[shipment.id]
                                  if (!unitData) return null

                                  const { rows, hasContainers, hasPallets } = flattenShipmentUnits(unitData)
                                  if (rows.length === 0) return null

                                  // Calculate totals
                                  const allCartonIds = new Set(rows.map(r => r.carton.packageId))
                                  const totalCartons = allCartonIds.size
                                  const totalItems = rows.reduce((sum, r) => sum + r.sku.qty, 0)
                                  const totalWeight = Array.from(allCartonIds).reduce((sum, pkgId) => {
                                    const row = rows.find(r => r.carton.packageId === pkgId)
                                    return sum + (row ? parseFloat(row.carton.weight) : 0)
                                  }, 0)
                                  const totalPallets = hasPallets ? new Set(rows.filter(r => r.palletId).map(r => r.palletId)).size : 0
                                  const totalContainers = hasContainers ? new Set(rows.filter(r => r.containerId).map(r => r.containerId)).size : 0

                                  return (
                                    <div>
                                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Package className="h-4 w-4 text-primary" />
                                        Package & SKU Details
                                      </h4>
                                      <div className="border rounded-lg overflow-hidden overflow-x-auto">
                                        <table className="w-full text-xs">
                                          <thead>
                                            <tr className="bg-muted/50 text-left">
                                              {hasContainers && (
                                                <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Container</th>
                                              )}
                                              {hasPallets && (
                                                <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Pallet</th>
                                              )}
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Package ID</th>
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Tracking No</th>
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Dimension</th>
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Weight</th>
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">SKU</th>
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap">Product Name</th>
                                              <th className="p-2.5 font-medium text-muted-foreground border-r whitespace-nowrap text-center">Qty</th>
                                              <th className="p-2.5 font-medium text-muted-foreground whitespace-nowrap">UOM</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {rows.map((row, rowIdx) => {
                                              const isLastRow = rowIdx === rows.length - 1
                                              // Heavy border between containers
                                              const showHeavyBorder = !isLastRow && row.isLastSkuInCarton && row.isLastCartonInPallet && row.isLastPalletInContainer
                                              // Medium border between pallets within same container
                                              const showMediumBorder = !isLastRow && !showHeavyBorder && row.isLastSkuInCarton && row.isLastCartonInPallet
                                              // Light border between cartons within same pallet
                                              const showLightBorder = !isLastRow && !showHeavyBorder && !showMediumBorder && row.isLastSkuInCarton

                                              return (
                                                <tr
                                                  key={`row-${rowIdx}`}
                                                  className={`
                                                    ${row.skuIndexInCarton % 2 === 1 ? 'bg-muted/20' : ''}
                                                    ${showHeavyBorder ? 'border-b-[3px] border-border' : ''}
                                                    ${showMediumBorder ? 'border-b-2 border-border/70' : ''}
                                                    ${showLightBorder ? 'border-b border-border/50' : ''}
                                                    ${!showHeavyBorder && !showMediumBorder && !showLightBorder && !isLastRow ? 'border-b border-border/20' : ''}
                                                  `}
                                                >
                                                  {/* Container column */}
                                                  {hasContainers && row.isFirstInContainer && (
                                                    <td
                                                      className="p-2.5 border-r align-top font-mono text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50/50 dark:bg-indigo-900/10"
                                                      rowSpan={row.containerRowSpan}
                                                    >
                                                      <div className="flex items-center gap-1">
                                                        <Package className="h-3 w-3 flex-shrink-0" />
                                                        {row.containerId}
                                                      </div>
                                                    </td>
                                                  )}
                                                  {/* Pallet column */}
                                                  {hasPallets && row.isFirstInPallet && (
                                                    <td
                                                      className="p-2.5 border-r align-top font-mono text-amber-700 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-900/5"
                                                      rowSpan={row.palletRowSpan}
                                                    >
                                                      {row.palletId || '-'}
                                                    </td>
                                                  )}
                                                  {/* Package ID */}
                                                  {row.isFirstInCarton && (
                                                    <td className="p-2.5 border-r align-top font-mono font-medium" rowSpan={row.cartonRowSpan}>
                                                      <div className="flex items-center gap-1">
                                                        {row.carton.packageId}
                                                        {row.carton.isSIOC && (
                                                          <span className="inline-flex items-center text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-1 rounded" title="Ships In Own Container">🏷️ SIOC</span>
                                                        )}
                                                      </div>
                                                    </td>
                                                  )}
                                                  {/* Tracking No */}
                                                  {row.isFirstInCarton && (
                                                    <td className="p-2.5 border-r align-top font-mono text-blue-600 dark:text-blue-400" rowSpan={row.cartonRowSpan}>
                                                      {row.carton.trackingNo}
                                                    </td>
                                                  )}
                                                  {/* Dimension */}
                                                  {row.isFirstInCarton && (
                                                    <td className="p-2.5 border-r align-top text-muted-foreground" rowSpan={row.cartonRowSpan}>
                                                      {row.carton.dimension}
                                                    </td>
                                                  )}
                                                  {/* Weight */}
                                                  {row.isFirstInCarton && (
                                                    <td className="p-2.5 border-r align-top font-medium" rowSpan={row.cartonRowSpan}>
                                                      {row.carton.weight}
                                                    </td>
                                                  )}
                                                  {/* SKU detail columns */}
                                                  <td className="p-2.5 border-r font-mono">{row.sku.sku}</td>
                                                  <td className="p-2.5 border-r">{row.sku.productName}</td>
                                                  <td className="p-2.5 border-r text-center font-medium text-purple-600 dark:text-purple-400">{row.sku.qty}</td>
                                                  <td className="p-2.5">
                                                    <Badge variant="secondary" className="text-[10px]">{row.sku.uom}</Badge>
                                                  </td>
                                                </tr>
                                              )
                                            })}
                                          </tbody>
                                          {/* Footer - Aggregation */}
                                          <tfoot>
                                            <tr className="bg-muted/50 font-medium border-t-2 border-border">
                                              <td
                                                className="p-2.5 text-right text-muted-foreground"
                                                colSpan={(hasContainers ? 1 : 0) + (hasPallets ? 1 : 0) + 4}
                                              >
                                                Totals:
                                              </td>
                                              <td className="p-2.5 border-r" colSpan={2}>
                                                {hasContainers && (
                                                  <span className="mr-2">
                                                    <span className="text-muted-foreground">Containers:</span>{' '}
                                                    <span className="font-semibold">{totalContainers}</span>
                                                  </span>
                                                )}
                                                {hasPallets && totalPallets > 0 && (
                                                  <span className="mr-2">
                                                    <span className="text-muted-foreground">Pallets:</span>{' '}
                                                    <span className="font-semibold">{totalPallets}</span>
                                                  </span>
                                                )}
                                                <span>
                                                  <span className="text-muted-foreground">Cartons:</span>{' '}
                                                  <span className="font-semibold">{totalCartons}</span>
                                                </span>
                                              </td>
                                              <td className="p-2.5 border-r text-center">
                                                <span className="font-semibold text-purple-600 dark:text-purple-400">{totalItems}</span>
                                              </td>
                                              <td className="p-2.5">
                                                <span className="text-muted-foreground text-[10px]">Chg.Wt:</span>{' '}
                                                <span className="font-semibold">{totalWeight.toFixed(1)} kg</span>
                                              </td>
                                            </tr>
                                          </tfoot>
                                        </table>
                                      </div>
                                    </div>
                                  )
                                })()}

                                {/* Shipment Details Grid */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-semibold">Reference Numbers</h4>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => {
                                              const lines: string[] = []
                                              lines.push(`Shipment No: ${shipment.shipmentNo}`)
                                              if (shipment.relatedOrderNo) lines.push(`Order No: ${shipment.relatedOrderNo}`)
                                              if (shipment.outboundNo) lines.push(`Outbound No: ${shipment.outboundNo}`)
                                              lines.push(`Master Tracking: ${shipment.trackingNo}`)
                                              if (shipment.bolNo) lines.push(`BOL No: ${shipment.bolNo}`)
                                              if (shipment.masterBolNo) lines.push(`Master BOL: ${shipment.masterBolNo}`)
                                              if (shipment.loadNo) lines.push(`Load No: ${shipment.loadNo}`)
                                              if (shipment.flightNo) lines.push(`Flight No: ${shipment.flightNo}`)
                                              if (shipment.vesselName) lines.push(`Vessel: ${shipment.vesselName}`)
                                              if (shipment.voyageNo) lines.push(`Voyage No: ${shipment.voyageNo}`)
                                              if (shipment.vehicleNo) lines.push(`Vehicle No: ${shipment.vehicleNo}`)
                                              // collect tracking nos
                                              const unitData = shipmentUnitsData[shipment.id]
                                              if (unitData) {
                                                const tns: string[] = []
                                                const collect = (cartons: ShipmentCarton[]) => { cartons.forEach(c => { if (c.trackingNo && !tns.includes(c.trackingNo)) tns.push(c.trackingNo) }) }
                                                if (unitData.containers) unitData.containers.forEach(c => c.pallets.forEach(p => collect(p.cartons)))
                                                else if (unitData.pallets) unitData.pallets.forEach(p => collect(p.cartons))
                                                else if (unitData.cartons) collect(unitData.cartons)
                                                if (tns.length > 0) lines.push(`Tracking Nos: ${tns.join(', ')}`)
                                              }
                                              copyToClipboard(lines.join('\n'), 'all-refs')
                                            }}
                                          >
                                            {copiedField === 'all-refs' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs">
                                          {copiedField === 'all-refs' ? 'Copied!' : 'Copy All'}
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between items-center group">
                                        <span className="text-muted-foreground">Shipment No:</span>
                                        <span className="font-mono font-medium flex items-center gap-1">
                                          {shipment.shipmentNo}
                                          <button onClick={() => copyToClipboard(shipment.shipmentNo, 'shipmentNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                            {copiedField === 'shipmentNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                          </button>
                                        </span>
                                      </div>
                                      {shipment.relatedOrderNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Order No:</span>
                                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            {shipment.relatedOrderNo}
                                            <button onClick={() => copyToClipboard(shipment.relatedOrderNo, 'relatedOrderNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'relatedOrderNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.outboundNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Outbound No:</span>
                                          <span className="font-mono font-medium flex items-center gap-1">
                                            {shipment.outboundNo}
                                            <button onClick={() => copyToClipboard(shipment.outboundNo, 'outboundNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'outboundNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      <div className="flex justify-between items-center group">
                                        <span className="text-muted-foreground">Master Tracking:</span>
                                        <span className="font-mono font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                          {shipment.trackingNo}
                                          <button onClick={() => copyToClipboard(shipment.trackingNo, 'trackingNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                            {copiedField === 'trackingNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                          </button>
                                        </span>
                                      </div>
                                      {shipment.bolNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">BOL No:</span>
                                          <span className="font-mono font-medium flex items-center gap-1">
                                            {shipment.bolNo}
                                            <button onClick={() => copyToClipboard(shipment.bolNo, 'bolNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'bolNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.masterBolNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Master BOL:</span>
                                          <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                            {shipment.masterBolNo}
                                            <button onClick={() => copyToClipboard(shipment.masterBolNo, 'masterBolNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'masterBolNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.loadNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Load No:</span>
                                          <span className="font-mono font-medium flex items-center gap-1">
                                            {shipment.loadNo}
                                            <button onClick={() => copyToClipboard(shipment.loadNo, 'loadNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'loadNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.flightNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Flight No:</span>
                                          <span className="font-mono font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                            {shipment.flightNo}
                                            <button onClick={() => copyToClipboard(shipment.flightNo, 'flightNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'flightNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.vesselName && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Vessel:</span>
                                          <span className="font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                            {shipment.vesselName}
                                            <button onClick={() => copyToClipboard(shipment.vesselName, 'vesselName')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'vesselName' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.voyageNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Voyage No:</span>
                                          <span className="font-mono font-medium flex items-center gap-1">
                                            {shipment.voyageNo}
                                            <button onClick={() => copyToClipboard(shipment.voyageNo, 'voyageNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'voyageNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                      {shipment.vehicleNo && (
                                        <div className="flex justify-between items-center group">
                                          <span className="text-muted-foreground">Vehicle No:</span>
                                          <span className="font-mono font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                            {shipment.vehicleNo}
                                            <button onClick={() => copyToClipboard(shipment.vehicleNo, 'vehicleNo')} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted">
                                              {copiedField === 'vehicleNo' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
                                            </button>
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {/* Tracking No List — from package-level data */}
                                    {(() => {
                                      const unitData = shipmentUnitsData[shipment.id]
                                      if (!unitData) return null
                                      const trackingNos: string[] = []
                                      const collectTrackingNos = (cartons: ShipmentCarton[]) => {
                                        cartons.forEach(c => { if (c.trackingNo && !trackingNos.includes(c.trackingNo)) trackingNos.push(c.trackingNo) })
                                      }
                                      if (unitData.containers) unitData.containers.forEach(c => c.pallets.forEach(p => collectTrackingNos(p.cartons)))
                                      else if (unitData.pallets) unitData.pallets.forEach(p => collectTrackingNos(p.cartons))
                                      else if (unitData.cartons) collectTrackingNos(unitData.cartons)
                                      if (trackingNos.length === 0) return null
                                      return (
                                        <div className="pt-2 border-t border-border/50">
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Tracking No ({trackingNos.length})</span>
                                            <button
                                              onClick={() => copyToClipboard(trackingNos.join('\n'), 'all-tracking')}
                                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                            >
                                              {copiedField === 'all-tracking' ? <><Check className="h-3 w-3 text-green-600" /> Copied</> : <><Copy className="h-3 w-3" /> Copy All</>}
                                            </button>
                                          </div>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {trackingNos.map((tn, i) => (
                                              <Badge
                                                key={i}
                                                variant="outline"
                                                className="text-[10px] font-mono cursor-pointer hover:bg-muted transition-colors"
                                                onClick={() => copyToClipboard(tn, `tn-${i}`)}
                                              >
                                                {tn}
                                                {copiedField === `tn-${i}` ? <Check className="h-2.5 w-2.5 ml-1 text-green-600" /> : <Copy className="h-2.5 w-2.5 ml-1 opacity-50" />}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    })()}
                                  </div>

                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold">Carrier & Route</h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Carrier:</span>
                                        <span className="font-medium">{shipment.carrier}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Service:</span>
                                        <span>
                                          <Badge variant="outline" className="text-xs">{shipment.shippingMethod}</Badge>
                                          <span className="ml-1 text-muted-foreground text-xs">{shipment.deliveryService}</span>
                                        </span>
                                      </div>
                                      {shipment.airlineCode && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Airline:</span>
                                          <Badge variant="outline" className="text-xs font-mono">{shipment.airlineCode}</Badge>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">From:</span>
                                        <span className="font-medium text-right">{shipment.fromCity}, {shipment.fromCountry}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">To:</span>
                                        <span className="font-medium text-right">{shipment.toCity}, {shipment.toCountry}</span>
                                      </div>
                                      {shipment.departureAirport && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Departure Airport:</span>
                                          <span className="font-medium">{shipment.departureAirport}</span>
                                        </div>
                                      )}
                                      {shipment.arrivalAirport && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Arrival Airport:</span>
                                          <span className="font-medium">{shipment.arrivalAirport}</span>
                                        </div>
                                      )}
                                      {shipment.portOfLoading && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Port of Loading:</span>
                                          <span className="font-medium">{shipment.portOfLoading}</span>
                                        </div>
                                      )}
                                      {shipment.portOfDischarge && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Port of Discharge:</span>
                                          <span className="font-medium">{shipment.portOfDischarge}</span>
                                        </div>
                                      )}
                                      {shipment.driverName && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Driver:</span>
                                          <span className="font-medium">{shipment.driverName}</span>
                                        </div>
                                      )}
                                      {shipment.driverPhone && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Driver Phone:</span>
                                          <span className="font-mono">{shipment.driverPhone}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ship Date:</span>
                                        <span className="font-medium">{shipment.shippingDate}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Est. Arrival:</span>
                                        <span className="font-medium">{shipment.estimatedArrival}</span>
                                      </div>
                                      {shipment.actualArrival && (
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Actual Arrival:</span>
                                          <span className="font-medium text-green-600 dark:text-green-400">{shipment.actualArrival}</span>
                                        </div>
                                      )}
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
                    <TabsList className="grid grid-cols-2 w-auto inline-grid">
                      <TabsTrigger value="routing" className="px-4">Routing</TabsTrigger>
                      <TabsTrigger value="events" className="px-4">Events</TabsTrigger>
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

        {/* ─── Generic Create Transfer Order Dialog (通用调拨单创建弹窗) ─── */}
        <CreateTransferOrderDialog
          open={showCreateTransferDialog}
          onOpenChange={setShowCreateTransferDialog}
          mode="po"
          tf={tf}
          defaultTransferType="PURCHASE_INBOUND"
          defaultTargetWarehouse={{
            code: poData.warehouseCode,
            name: poData.warehouseName || "Main Warehouse - Los Angeles",
            type: "OWN",
          }}
          sourceDocument={{ type: "PO", no: poData.orderNo }}
          demandLines={poData.unallocatedSupplyDemand.lines.map((line) => ({
            sourceLineNo: line.sourceLineNo,
            skuCode: line.skuCode,
            productName: line.productName,
            quantity: line.quantity,
            allocatedQty: line.allocatedQty,
            uom: line.uom,
          }))}
          onSubmit={(drafts) => {
            // Bridge: convert generic drafts into the existing page logic
            if (drafts.length === 0) return
            // Trigger the existing allocation generation flow
            openAllocateSupplyDialog()
            toast.success(tf("Transfer order created", "调拨单已创建"), {
              description: tf(`${drafts.length} transfer order(s) generated.`, `已生成 ${drafts.length} 张调拨单。`),
            })
          }}
        />

        <Dialog open={showSupplyAllocationDialog} onOpenChange={setShowSupplyAllocationDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{tf("Create Transfer Order", "\u521b\u5efa\u8c03\u62e8\u5355")}</DialogTitle>
              <DialogDescription>
                {tf("Configure source warehouses and assign items to create transfer orders from PO demand.", "\u914d\u7f6e\u6e90\u4ed3\u5e93\u5e76\u5206\u914d\u5546\u54c1\uff0c\u4ece PO \u9700\u6c42\u521b\u5efa\u8c03\u62e8\u5355\u3002")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary bar */}
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">PO</div>
                  <div className="mt-1 font-mono font-medium">{poData.orderNo}</div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">{tf("Pending transfer qty", "\u5f85\u8c03\u62e8\u6570\u91cf")}</div>
                  <div className="mt-1 font-medium">{unallocatedSupplyQty} PCS</div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">{tf("Target Warehouse", "\u76ee\u6807\u4ed3")}</div>
                  <div className="mt-1 font-medium">{poData.warehouseCode}</div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="text-xs text-muted-foreground">{tf("Configured qty", "\u5df2\u914d\u7f6e\u6570\u91cf")}</div>
                  <div className="mt-1 font-medium">{getActiveTotal(allocationDrafts)} PCS</div>
                </div>
              </div>

              {/* Transfer source cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{tf("Transfer Sources", "\u8c03\u62e8\u6765\u6e90")}</h3>
                    <p className="text-xs text-muted-foreground">{tf("Each source creates one transfer order. Select warehouse and assign items with quantities.", "\u6bcf\u4e2a\u6765\u6e90\u751f\u6210\u4e00\u5f20\u8c03\u62e8\u5355\u3002\u9009\u62e9\u4ed3\u5e93\u5e76\u5206\u914d\u5546\u54c1\u6570\u91cf\u3002")}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => addVendorDraft("allocate")}><Plus className="mr-2 h-4 w-4" />{tf("Add Source", "\u6dfb\u52a0\u6765\u6e90")}</Button>
                </div>

                {renderDraftCards("allocate")}
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setShowSupplyAllocationDialog(false)}>{tf("Cancel", "\u53d6\u6d88")}</Button><Button onClick={handleGenerateAllocation}>{tf("Generate Transfer Order", "\u751f\u6210\u8c03\u62e8\u5355")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showChangeVendorDialog} onOpenChange={setShowChangeVendorDialog}>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-auto">
            <DialogHeader>
              <DialogTitle>{tf("Revise Transfer", "调整调拨")}</DialogTitle>
              <DialogDescription>
                {tf(
                  "Review affected documents first, then rebuild the transfer execution plan.",
                  "先检查受影响单据，再重建调拨执行方案。"
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">{tf("Affected documents", "受影响单据")}</div>
                    <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                      <span>{tf("Transfer Order", "调拨单")}: <span className="font-mono text-foreground">{selectedSupplyAllocation?.allocationNo || "-"}</span></span>
                      <span>{tf("Vendor RN", "Vendor RN")}: <span className="font-mono text-foreground">{selectedSupplyAllocation?.vendorReceiptNo || "-"}</span></span>
                      <span>{tf("Outbound / SO", "出库单 / SO")}: <span className="font-mono text-foreground">{selectedSupplyAllocation?.outboundOrderNo || "-"}</span></span>
                      <span>{tf("Target RN", "目标仓 RN")}: <span className="font-mono text-foreground">{selectedSupplyAllocation?.finalReceiptNo || "-"}</span></span>
                    </div>
                  </div>
                  <Badge variant="outline">{revisionTotalQty} / {revisionOriginalQty} PCS</Badge>
                </div>
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-900">
                  {tf(
                    "Saving will cancel the old execution chain first, then generate the revised transfer execution chain.",
                    "保存时会先取消旧执行链路，再生成修订后的调拨执行链路。"
                  )}
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{tf("Transfer execution plans", "调拨执行方案")}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {tf(
                          "Add source parties first, configure each transfer route, then assign items and quantities inside each source block.",
                          "先添加发货方，再配置每条调拨路径，最后在对应 block 内分配商品和数量。"
                        )}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => addVendorDraft("revise")}>
                      <Plus className="mr-2 h-4 w-4" />
                      {tf("Add Source", "添加发货方")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  {selectedSupplyAllocation && revisionDrafts.length > 0 ? (
                    <>
                      {renderDraftCards("revise")}
                    </>
                  ) : (
                    <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                      {tf("Add a source party to start rebuilding the transfer execution plan.", "添加一个发货方，开始重建调拨执行方案。")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChangeVendorDialog(false)}>{tf("Cancel", "取消")}</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>{tf("Save transfer changes", "保存调拨调整")}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tf("Confirm source change", "确认切换发货方")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {revisionDrafts[0]?.sourceCode !== selectedSupplyAllocation?.sourceCode
                        ? tf("Changing the source party will cancel the old execution chain first, then generate the new transfer execution chain. Continue?", "切换发货方后，会先取消原执行链路，再生成新的调拨执行链路。是否继续？")
                        : tf("This will save the updated quantities for the current transfer plan. Continue?", "将保存当前调拨方案中的数量变更。是否继续？")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tf("Back", "返回")}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApplyRevision}>{tf("Confirm", "确认")}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAllocationItemDialog} onOpenChange={setShowAllocationItemDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{tf("Assign Transfer Lines", "分配调拨明细")}</DialogTitle>
              <DialogDescription>
                {activeEditingDraft
                  ? tf("Select PO lines and enter the quantity this source party will execute.", "选择 PO 行，并输入当前发货方要执行的调拨数量。")
                  : tf("Choose a source party first.", "请先选择一个发货方。")}
              </DialogDescription>
            </DialogHeader>

            {activeEditingDraft && (
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{activeEditingDraft.sourceName}</div>
                      <div className="text-xs text-muted-foreground">{activeEditingDraft.sourceWarehouseName}</div>
                    </div>
                    <Badge variant="secondary">{getDraftTotal(activeEditingDraft)} PCS</Badge>
                  </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>{tf("Line", "行号")}</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>{tf("Product", "商品")}</TableHead>
                        <TableHead className="text-right">{tf("Demand Qty", "需求数量")}</TableHead>
                        <TableHead className="text-right">{tf("Allocated by all sources", "全部发货方已分配")}</TableHead>
                        <TableHead className="w-36 text-right">{tf("This source", "当前发货方")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeDemandLines.map((line) => {
                        const currentQty = activeEditingDraft.lineQtys[line.skuCode] || 0
                        const totalAllocated = getLineAllocatedTotal(line, activeDrafts)
                        const otherAllocated = totalAllocated - currentQty
                        const maxQty = Math.max(0, line.quantity - otherAllocated)

                        return (
                          <TableRow key={`picker-${line.skuCode}`}>
                            <TableCell>{line.sourceLineNo}</TableCell>
                            <TableCell className="font-mono text-xs">{line.skuCode}</TableCell>
                            <TableCell>{line.productName}</TableCell>
                            <TableCell className="text-right">{line.quantity} {line.uom}</TableCell>
                            <TableCell className="text-right">
                              <span className={cn(totalAllocated === line.quantity ? "text-green-600" : totalAllocated > line.quantity ? "text-red-600" : "text-amber-600")}>
                                {totalAllocated} / {line.quantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={0}
                                max={maxQty}
                                value={currentQty}
                                className="text-right"
                                onChange={(event) => {
                                  const nextQty = Math.max(0, Math.min(maxQty, Number(event.target.value) || 0))
                                  updateDraftLineQty(activeEditingDraft.id, line.skuCode, nextQty, allocationMode)
                                }}
                              />
                              <div className="mt-1 text-right text-[11px] text-muted-foreground">
                                {tf("Max", "最多")} {maxQty}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAllocationItemDialog(false)}>{tf("Cancel", "取消")}</Button>
              <Button onClick={() => setShowAllocationItemDialog(false)}>{tf("Apply", "应用")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

export default function PODetailPage() {
  return (
    <Suspense fallback={null}>
      <PODetailPageContent />
    </Suspense>
  )
}
