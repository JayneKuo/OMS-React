"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, ArrowLeft, Edit, Send, Download, Eye, Copy, AlertCircle, Calendar, Building, User, MapPin, Clock, TrendingUp, RefreshCw, ExternalLink, Phone, Mail } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "Shipments", href: "/purchase/shipments", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// Mock PO Detail Data
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
  shippedQty: 75,
  receivedQty: 50,
  totalAmount: 12500.00,
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
  
  // Line Items
  lineItems: [
    {
      id: "1",
      lineNo: 1,
      skuCode: "SKU001",
      productName: "iPhone 15 Pro",
      specifications: "256GB, Natural Titanium",
      quantity: 100,
      uom: "PCS",
      unitPrice: 50.00,
      lineAmount: 5000.00,
      shippedQty: 0,
      receivedQty: 0,
      returnedQty: 0,
    },
    {
      id: "2",
      lineNo: 2,
      skuCode: "SKU002",
      productName: "MacBook Pro",
      specifications: "14-inch, M3 Pro, 512GB SSD",
      quantity: 50,
      uom: "PCS",
      unitPrice: 150.00,
      lineAmount: 7500.00,
      shippedQty: 0,
      receivedQty: 0,
      returnedQty: 0,
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
      estimatedArrival: "2024-01-25",
      shippingDate: "2024-01-18",
      fromAddress: "456 Supplier Ave, New York, NY 10001",
      toAddress: "1234 Warehouse St, Los Angeles, CA 90001",
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
      estimatedArrival: "2024-01-22",
      actualArrival: "2024-01-22",
      shippingDate: "2024-01-15",
      fromAddress: "456 Supplier Ave, New York, NY 10001",
      toAddress: "1234 Warehouse St, Los Angeles, CA 90001",
      createdBy: "供应商",
      createdDate: "2024-01-15T10:30:00Z",
      notes: "加急发货，已按时到达",
    },
    {
      id: "3",
      shipmentNo: "SHP202401100001",
      shippedQty: 30,
      carrier: "UPS",
      trackingNo: "5555666677",
      shippingStatus: "IN_TRANSIT",
      estimatedArrival: "2024-01-28",
      shippingDate: "2024-01-20",
      fromAddress: "456 Supplier Ave, New York, NY 10001",
      toAddress: "1234 Warehouse St, Los Angeles, CA 90001",
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
    },
    {
      id: "2",
      receiptNo: "RCP202401180001",
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
    },
    {
      id: "3",
      receiptNo: "RCP202401220001",
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
}

// Mock Routing History
const mockRoutingHistory = [
  { date: "07/30/2025 10:33:21 PM", status: "Dispatched", user: "System" },
]

// Mock Event History
const mockEventHistory = [
  { date: "10/19/2025 10:33:21 PM", status: "Approved", user: "Admin" },
  { date: "10/19/2025 10:33:21 PM", status: "Created", user: "System" },
]

interface PODetailPageProps {
  params: {
    id: string
  }
}
