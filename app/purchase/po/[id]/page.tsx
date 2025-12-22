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
      receiptStatus: "COMPLETED",
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
      receiptStatus: "COMPLETED",
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

interface PODetailPageProps {
  params: {
    id: string
  }
}

export default function PODetailPage({ params }: PODetailPageProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("lines")
  const [isLoading, setIsLoading] = React.useState(false)
  const [refreshKey, setRefreshKey] = React.useState(0)

  // 刷新数据
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true)
    setRefreshKey(prev => prev + 1)
    // 模拟API调用
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // 计算汇总数据
  const summaryData = React.useMemo(() => {
    const totalLines = mockPODetail.lineItems.length
    const completedLines = mockPODetail.lineItems.filter(item => item.receivedQty >= item.quantity).length
    const receivingProgress = mockPODetail.totalOrderQty > 0 ? (mockPODetail.receivedQty / mockPODetail.totalOrderQty) * 100 : 0
    const shippingProgress = mockPODetail.totalOrderQty > 0 ? (mockPODetail.shippedQty / mockPODetail.totalOrderQty) * 100 : 0
    
    return {
      totalLines,
      completedLines,
      receivingProgress,
      shippingProgress,
      pendingQty: mockPODetail.totalOrderQty - mockPODetail.receivedQty,
      averageUnitPrice: mockPODetail.totalAmount / mockPODetail.totalOrderQty
    }
  }, [refreshKey])

  // Status configurations
  const statusConfig = {
    DRAFT: { label: "草稿", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    CREATED: { label: "已创建", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200" },
    PENDING_CONFIRMATION: { label: "待确认", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200" },
    CONFIRMED: { label: "已确认", color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    PARTIALLY_RECEIVED: { label: "部分收货", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" },
    CLOSED: { label: "已关闭", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200" },
    REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
    CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
    EXCEPTION: { label: "异常", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
  }

  const shippingStatusConfig = {
    NOT_SHIPPED: { label: "未发货", color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    SHIPMENT_CREATED: { label: "发货单已创建", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" },
    SHIPPED: { label: "已发货", color: "bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400" },
    IN_TRANSIT: { label: "运输中", color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" },
    ARRIVED_AT_WAREHOUSE: { label: "已到仓", color: "bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400" },
    SHIPMENT_COMPLETED: { label: "发货完成", color: "bg-teal-50 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400" },
  }

  const receivingStatusConfig = {
    NOT_RECEIVED: { label: "未收货", color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    IN_RECEIVING: { label: "收货中", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400" },
    PARTIALLY_RECEIVED: { label: "部分收货", color: "bg-orange-50 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400" },
    FULLY_RECEIVED: { label: "收货完成", color: "bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400" },
    OVER_RECEIVED: { label: "超量收货", color: "bg-red-50 text-red-600 dark:bg-red-900/50 dark:text-red-400" },
  }

  // Get available actions based on status
  const getAvailableActions = () => {
    switch (mockPODetail.status) {
      case "DRAFT":
        return [
          { label: "编辑", icon: <Edit className="h-4 w-4" />, action: () => router.push(`/purchase/po/${params.id}/edit`) },
          { label: "发送", icon: <Send className="h-4 w-4" />, action: () => console.log("Send to supplier") },
        ]
      case "CREATED":
        return [
          { label: "编辑", icon: <Edit className="h-4 w-4" />, action: () => router.push(`/purchase/po/${params.id}/edit`) },
          { label: "发送", icon: <Send className="h-4 w-4" />, action: () => console.log("Send to supplier") },
        ]
      case "CONFIRMED":
        return [
          { label: "创建ASN", icon: <Truck className="h-4 w-4" />, action: () => console.log("Create ASN") },
          { label: "下载", icon: <Download className="h-4 w-4" />, action: () => console.log("Download PO") },
        ]
      case "CLOSED":
        return [
          { label: "复制", icon: <Copy className="h-4 w-4" />, action: () => console.log("Copy as new PO") },
          { label: "下载", icon: <Download className="h-4 w-4" />, action: () => console.log("Download PO") },
        ]
      default:
        return [
          { label: "下载", icon: <Download className="h-4 w-4" />, action: () => console.log("Download PO") },
        ]
    }
  }

  const availableActions = getAvailableActions()

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-4">
          {/* 简化的顶部标题栏 */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{mockPODetail.orderNo}</h1>
                      
                      {/* 状态徽章显示 - 放在标题后面，刷新按钮前面 */}
                      <div className="flex items-center gap-2">
                        {/* 订单状态 - 总是显示 */}
                        <Badge className={statusConfig[mockPODetail.status as keyof typeof statusConfig].color}>
                          {statusConfig[mockPODetail.status as keyof typeof statusConfig].label}
                        </Badge>
                        
                        {/* 发货状态 - 只有当有值时才显示 */}
                        {mockPODetail.shippingStatus && (
                          <Badge variant="outline" className={shippingStatusConfig[mockPODetail.shippingStatus as keyof typeof shippingStatusConfig].color}>
                            {shippingStatusConfig[mockPODetail.shippingStatus as keyof typeof shippingStatusConfig].label}
                          </Badge>
                        )}
                        
                        {/* 收货状态 - 只有当有值时才显示 */}
                        {mockPODetail.receivingStatus && (
                          <Badge variant="outline" className={receivingStatusConfig[mockPODetail.receivingStatus as keyof typeof receivingStatusConfig].color}>
                            {receivingStatusConfig[mockPODetail.receivingStatus as keyof typeof receivingStatusConfig].label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building className="h-3 w-3" />
                      <span>供应商: {mockPODetail.supplierName}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>创建时间: {new Date(mockPODetail.created).toLocaleDateString()}</span>
                      {mockPODetail.originalPoNo && (
                        <>
                          <span>•</span>
                          <span>原始PO: {mockPODetail.originalPoNo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 所有操作按钮都放在顶部右侧，包括刷新按钮 */}
              <div className="flex gap-2">
                {/* 刷新按钮移到右侧 */}
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
                
                {/* 去重后的操作按钮 */}
                {availableActions.map((action, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={action.action}>
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 一屏展示所有关键信息 - 四个卡片一行显示 */}
          <div className="space-y-6">
            {/* 核心信息 - 4列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* 订单基本信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    订单信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* PO编号突出显示 */}
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                    <div className="text-xs text-muted-foreground mb-1">PO编号</div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm font-mono text-blue-800 dark:text-blue-200">{mockPODetail.orderNo}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => navigator.clipboard.writeText(mockPODetail.orderNo)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    {mockPODetail.originalPoNo && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">原始PO:</span>
                        <span className="font-mono text-xs">{mockPODetail.originalPoNo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">参考编号:</span>
                      <span className="font-mono text-xs">{mockPODetail.referenceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">数据来源:</span>
                      <Badge variant="outline" className="text-xs h-5">
                        {mockPODetail.dataSource === 'PR_CONVERSION' ? 'PR转单' : '手动创建'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">创建时间:</span>
                      <span className="text-xs">{new Date(mockPODetail.created).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">预计到货:</span>
                      <span className="font-medium text-orange-600 text-xs">{mockPODetail.expectedArrivalDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">付款条款:</span>
                      <span className="font-medium text-xs">{mockPODetail.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">交货条款:</span>
                      <span className="font-medium text-xs">{mockPODetail.deliveryTerms}</span>
                    </div>
                  </div>

                  {mockPODetail.relatedPRs.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">关联PR ({mockPODetail.relatedPRs.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {mockPODetail.relatedPRs.map((prNo, index) => (
                          <Badge key={index} variant="outline" className="text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/50 h-5">
                            {prNo}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 供应商信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-600" />
                    供应商信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 供应商名称突出显示 */}
                  <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                    <div className="font-bold text-green-800 dark:text-green-200 text-sm mb-1">{mockPODetail.supplierName}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">编码: {mockPODetail.supplierCode}</div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">联系人</div>
                      <div className="font-medium text-sm">{mockPODetail.contactPerson}</div>
                    </div>

                    <div className="space-y-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-7 text-xs" 
                        onClick={() => window.open(`tel:${mockPODetail.contactPhone}`)}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {mockPODetail.contactPhone}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start h-7 text-xs" 
                        onClick={() => window.open(`mailto:${mockPODetail.contactEmail}`)}
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        邮件联系
                      </Button>
                    </div>

                    <div>
                      <div className="text-xs text-muted-foreground mb-1">供应商地址</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{mockPODetail.supplierAddress}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 地址信息 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    地址信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center gap-1">
                      <Building className="h-3 w-3 text-blue-600" />
                      发货地址
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                      <div className="font-medium text-sm">{mockPODetail.supplierName}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{mockPODetail.supplierAddress}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-green-600" />
                      收货地址
                    </div>
                    <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                      <div className="font-medium text-sm">{mockPODetail.warehouseName}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{mockPODetail.warehouseAddress}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        仓库编码: {mockPODetail.warehouseCode}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 物流跟踪 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    物流跟踪
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 物流汇总 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                      <div className="text-muted-foreground mb-1">发货记录</div>
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {mockPODetail.shipmentRecords.length} 条
                      </div>
                      <div className="text-xs text-muted-foreground">
                        已发: {mockPODetail.shippedQty}
                      </div>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                      <div className="text-muted-foreground mb-1">收货记录</div>
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {mockPODetail.receiptRecords.length} 条
                      </div>
                      <div className="text-xs text-muted-foreground">
                        已收: {mockPODetail.receivedQty}
                      </div>
                    </div>
                  </div>

                  {/* 最新发货记录 */}
                  {mockPODetail.shipmentRecords.length > 0 && (
                    <div>
                      <div className="text-xs font-medium mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-blue-600" />
                          最新发货
                        </span>
                        {mockPODetail.shipmentRecords.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-2 text-xs"
                            onClick={() => setActiveTab("shipments")}
                          >
                            查看全部 ({mockPODetail.shipmentRecords.length})
                          </Button>
                        )}
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">运单:</span>
                            <span className="font-mono font-medium">{mockPODetail.shipmentRecords[0].trackingNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">承运商:</span>
                            <span className="font-medium">{mockPODetail.shipmentRecords[0].carrier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">数量:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{mockPODetail.shipmentRecords[0].shippedQty}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 最新收货记录 */}
                  {mockPODetail.receiptRecords.length > 0 ? (
                    <div>
                      <div className="text-xs font-medium mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3 text-green-600" />
                          最新收货
                        </span>
                        {mockPODetail.receiptRecords.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-2 text-xs"
                            onClick={() => setActiveTab("receipts")}
                          >
                            查看全部 ({mockPODetail.receiptRecords.length})
                          </Button>
                        )}
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200 dark:bg-green-900/50 dark:border-green-700">
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">收货单:</span>
                            <span className="font-mono font-medium">{mockPODetail.receiptRecords[0].receiptNo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">数量:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{mockPODetail.receiptRecords[0].receivedQty}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">收货人:</span>
                            <span className="font-medium">{mockPODetail.receiptRecords[0].receivedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Package className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <div className="text-xs">暂无收货记录</div>
                    </div>
                  )}

                  {/* 无记录时的显示 */}
                  {mockPODetail.shipmentRecords.length === 0 && (
                    <div className="text-center py-2 text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Truck className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      <div className="text-xs">暂无发货记录</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 主体内容 - 全宽布局 */}
          <div className="space-y-4">
            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="lines">商品明细</TabsTrigger>
                  <TabsTrigger value="shipments">发货记录</TabsTrigger>
                  <TabsTrigger value="receipts">收货记录</TabsTrigger>
                  <TabsTrigger value="rtv">退货记录</TabsTrigger>
                </TabsList>

                {/* 商品明细 */}
                <TabsContent value="lines" className="mt-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">商品明细</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>总计 {summaryData.totalLines} 个商品行</span>
                          <span>•</span>
                          <span>已完成 {summaryData.completedLines} 行</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[60px] text-center">行号</TableHead>
                              <TableHead className="min-w-[200px]">商品信息</TableHead>
                              <TableHead className="w-[100px] text-center">订单数量</TableHead>
                              <TableHead className="w-[80px] text-center">单位</TableHead>
                              <TableHead className="w-[80px] text-center">币种</TableHead>
                              <TableHead className="w-[120px] text-right">单价</TableHead>
                              <TableHead className="w-[100px] text-center">税率</TableHead>
                              <TableHead className="w-[120px] text-right">行金额</TableHead>
                              <TableHead className="w-[100px] text-center">已发数量</TableHead>
                              <TableHead className="w-[100px] text-center">已收数量</TableHead>
                              <TableHead className="w-[80px] text-center">状态</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockPODetail.lineItems.map((item) => {
                              const receivingProgress = item.quantity > 0 ? (item.receivedQty / item.quantity) * 100 : 0
                              const isCompleted = item.receivedQty >= item.quantity
                              const isOverReceived = item.receivedQty > item.quantity
                              const taxRate = 13 // 默认税率
                              const taxAmount = item.unitPrice * (taxRate / 100)
                              
                              return (
                                <TableRow key={item.id} className={isCompleted ? "bg-green-50/30 dark:bg-green-900/20" : ""}>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {item.lineNo.toString().padStart(2, '0')}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium text-sm">{item.productName}</div>
                                      <div className="text-xs text-muted-foreground">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-mono">
                                          SKU: {item.skuCode}
                                        </span>
                                      </div>
                                      {item.specifications && (
                                        <div className="text-xs text-muted-foreground">{item.specifications}</div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="font-medium">{item.quantity.toLocaleString()}</div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-xs">
                                      {item.uom}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      {mockPODetail.currency}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right font-mono">
                                    {mockPODetail.currency} {item.unitPrice.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="text-sm">{taxRate}%</div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="text-sm font-medium bg-blue-50 dark:bg-blue-900/50 rounded px-2 py-1">
                                      {mockPODetail.currency} {item.lineAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className={item.shippedQty > 0 ? "text-purple-600 dark:text-purple-400 font-medium" : "text-muted-foreground"}>
                                      {item.shippedQty.toLocaleString()}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className={`font-medium ${isOverReceived ? "text-red-600 dark:text-red-400" : item.receivedQty > 0 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                      {item.receivedQty.toLocaleString()}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isCompleted ? (
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        完成
                                      </Badge>
                                    ) : item.receivedQty > 0 ? (
                                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700">
                                        部分
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                        待收
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {/* 汇总行 */}
                      <div className="border-t bg-gray-50 dark:bg-gray-800/50 p-4 space-y-4">
                        {/* 数量和金额汇总 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">总数量:</span>
                            <span className="font-medium">{mockPODetail.totalOrderQty.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">已发数量:</span>
                            <span className="font-medium text-purple-600 dark:text-purple-400">{mockPODetail.shippedQty.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">已收数量:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">{mockPODetail.receivedQty.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">商品小计:</span>
                            <span className="font-bold">{mockPODetail.currency} {mockPODetail.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* 运费和条款信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* 运费信息 */}
                          <div>
                            <h4 className="font-medium mb-3 text-sm">运费信息</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">运费:</span>
                                <span className="font-medium">{mockPODetail.currency} 150.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">手续费:</span>
                                <span className="font-medium">{mockPODetail.currency} 25.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">其他费用:</span>
                                <span className="font-medium">{mockPODetail.currency} 0.00</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="font-medium">运费小计:</span>
                                <span className="font-bold text-orange-600 dark:text-orange-400">{mockPODetail.currency} 175.00</span>
                              </div>
                            </div>
                          </div>

                          {/* 商务条款 */}
                          <div>
                            <h4 className="font-medium mb-3 text-sm">商务条款</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">付款条款:</span>
                                <span className="font-medium">{mockPODetail.paymentTerms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">交货条款:</span>
                                <span className="font-medium">{mockPODetail.deliveryTerms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">运输方式:</span>
                                <span className="font-medium">海运</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">贸易条款:</span>
                                <span className="font-medium">FOB</span>
                              </div>
                            </div>
                          </div>

                          {/* 订单总计 */}
                          <div>
                            <h4 className="font-medium mb-3 text-sm">订单总计</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">商品金额:</span>
                                <span className="font-medium">{mockPODetail.currency} {mockPODetail.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">运费:</span>
                                <span className="font-medium">{mockPODetail.currency} 175.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">税费:</span>
                                <span className="font-medium">{mockPODetail.currency} {(mockPODetail.totalAmount * 0.13).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="font-bold">订单总额:</span>
                                <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                  {mockPODetail.currency} {(mockPODetail.totalAmount + 175 + mockPODetail.totalAmount * 0.13).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 发货记录 */}
                <TabsContent value="shipments" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">发货记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockPODetail.shipmentRecords.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>暂无发货记录</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>发货单号</TableHead>
                              <TableHead>发货数量</TableHead>
                              <TableHead>承运商</TableHead>
                              <TableHead>运单号</TableHead>
                              <TableHead>发货状态</TableHead>
                              <TableHead>发货日期</TableHead>
                              <TableHead>预计到达</TableHead>
                              <TableHead>实际到达</TableHead>
                              <TableHead>创建人</TableHead>
                              <TableHead>备注</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockPODetail.shipmentRecords.map((shipment) => {
                              const statusConfig = {
                                CREATED: { label: "已创建", color: "bg-blue-100 text-blue-800" },
                                SHIPPED: { label: "已发货", color: "bg-purple-100 text-purple-800" },
                                IN_TRANSIT: { label: "运输中", color: "bg-indigo-100 text-indigo-800" },
                                DELIVERED: { label: "已送达", color: "bg-green-100 text-green-800" },
                                CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" },
                                EXCEPTION: { label: "异常", color: "bg-red-100 text-red-800" },
                              }
                              
                              return (
                                <TableRow key={shipment.id}>
                                  <TableCell className="font-medium">{shipment.shipmentNo}</TableCell>
                                  <TableCell>{shipment.shippedQty.toLocaleString()}</TableCell>
                                  <TableCell>{shipment.carrier}</TableCell>
                                  <TableCell className="font-mono">{shipment.trackingNo}</TableCell>
                                  <TableCell>
                                    <Badge className={statusConfig[shipment.shippingStatus as keyof typeof statusConfig].color}>
                                      {statusConfig[shipment.shippingStatus as keyof typeof statusConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{shipment.shippingDate}</TableCell>
                                  <TableCell>{shipment.estimatedArrival}</TableCell>
                                  <TableCell>{shipment.actualArrival || "-"}</TableCell>
                                  <TableCell>{shipment.createdBy}</TableCell>
                                  <TableCell className="max-w-xs truncate">{shipment.notes}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 收货记录 */}
                <TabsContent value="receipts" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">收货记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockPODetail.receiptRecords.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>暂无收货记录</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>收货单号</TableHead>
                              <TableHead>收货数量</TableHead>
                              <TableHead>收货人</TableHead>
                              <TableHead>收货时间</TableHead>
                              <TableHead>关联发货单</TableHead>
                              <TableHead>收货状态</TableHead>
                              <TableHead>质检状态</TableHead>
                              <TableHead>仓库位置</TableHead>
                              <TableHead>损坏数量</TableHead>
                              <TableHead>拒收数量</TableHead>
                              <TableHead>备注</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockPODetail.receiptRecords.map((receipt) => {
                              const receiptStatusConfig = {
                                PENDING: { label: "待收货", color: "bg-yellow-100 text-yellow-800" },
                                IN_PROGRESS: { label: "收货中", color: "bg-blue-100 text-blue-800" },
                                COMPLETED: { label: "收货完成", color: "bg-green-100 text-green-800" },
                                PARTIAL_DAMAGE: { label: "部分损坏", color: "bg-orange-100 text-orange-800" },
                                REJECTED: { label: "已拒收", color: "bg-red-100 text-red-800" },
                              }
                              
                              const qualityStatusConfig = {
                                PASSED: { label: "质检通过", color: "bg-green-100 text-green-800" },
                                PARTIAL_DAMAGE: { label: "部分损坏", color: "bg-orange-100 text-orange-800" },
                                FAILED: { label: "质检不合格", color: "bg-red-100 text-red-800" },
                                PENDING: { label: "待质检", color: "bg-yellow-100 text-yellow-800" },
                              }
                              
                              return (
                                <TableRow key={receipt.id}>
                                  <TableCell className="font-medium">{receipt.receiptNo}</TableCell>
                                  <TableCell>{receipt.receivedQty.toLocaleString()}</TableCell>
                                  <TableCell>{receipt.receivedBy}</TableCell>
                                  <TableCell>{new Date(receipt.receiptDate).toLocaleString()}</TableCell>
                                  <TableCell className="font-mono">{receipt.relatedShipment}</TableCell>
                                  <TableCell>
                                    <Badge className={receiptStatusConfig[receipt.receiptStatus as keyof typeof receiptStatusConfig].color}>
                                      {receiptStatusConfig[receipt.receiptStatus as keyof typeof receiptStatusConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={qualityStatusConfig[receipt.qualityStatus as keyof typeof qualityStatusConfig].color}>
                                      {qualityStatusConfig[receipt.qualityStatus as keyof typeof qualityStatusConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{receipt.warehouseLocation}</TableCell>
                                  <TableCell className={receipt.damageQty > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                                    {receipt.damageQty}
                                  </TableCell>
                                  <TableCell className={receipt.rejectedQty > 0 ? "text-red-600 font-medium" : "text-muted-foreground"}>
                                    {receipt.rejectedQty}
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">{receipt.notes}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 退货记录 */}
                <TabsContent value="rtv" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">退货记录 (RTV - Return to Vendor)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {mockPODetail.rtvRecords.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>暂无退货记录</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>退货单号</TableHead>
                              <TableHead>退货数量</TableHead>
                              <TableHead>退货原因</TableHead>
                              <TableHead>退货状态</TableHead>
                              <TableHead>退货人</TableHead>
                              <TableHead>退货时间</TableHead>
                              <TableHead>关联收货单</TableHead>
                              <TableHead>供应商审批</TableHead>
                              <TableHead>审批时间</TableHead>
                              <TableHead>退款金额</TableHead>
                              <TableHead>退款状态</TableHead>
                              <TableHead>备注</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {mockPODetail.rtvRecords.map((rtv) => {
                              const returnStatusConfig = {
                                PENDING_APPROVAL: { label: "待审批", color: "bg-yellow-100 text-yellow-800" },
                                APPROVED: { label: "已批准", color: "bg-green-100 text-green-800" },
                                REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800" },
                                IN_TRANSIT: { label: "退货中", color: "bg-blue-100 text-blue-800" },
                                COMPLETED: { label: "退货完成", color: "bg-teal-100 text-teal-800" },
                              }
                              
                              const reasonConfig = {
                                DAMAGED: { label: "货物损坏", color: "bg-orange-100 text-orange-800" },
                                QUALITY_ISSUE: { label: "质量问题", color: "bg-red-100 text-red-800" },
                                WRONG_ITEM: { label: "货物错误", color: "bg-purple-100 text-purple-800" },
                                OVERDELIVERY: { label: "超量发货", color: "bg-blue-100 text-blue-800" },
                                OTHER: { label: "其他原因", color: "bg-gray-100 text-gray-800" },
                              }
                              
                              const approvalConfig = {
                                PENDING: { label: "待审批", color: "bg-yellow-100 text-yellow-800" },
                                APPROVED: { label: "已批准", color: "bg-green-100 text-green-800" },
                                REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800" },
                              }
                              
                              const refundStatusConfig = {
                                PENDING: { label: "待退款", color: "bg-yellow-100 text-yellow-800" },
                                PROCESSING: { label: "退款中", color: "bg-blue-100 text-blue-800" },
                                COMPLETED: { label: "已退款", color: "bg-green-100 text-green-800" },
                                FAILED: { label: "退款失败", color: "bg-red-100 text-red-800" },
                              }
                              
                              return (
                                <TableRow key={rtv.id}>
                                  <TableCell className="font-medium">{rtv.rtvNo}</TableCell>
                                  <TableCell>{rtv.returnedQty.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge className={reasonConfig[rtv.returnReason as keyof typeof reasonConfig].color}>
                                      {reasonConfig[rtv.returnReason as keyof typeof reasonConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={returnStatusConfig[rtv.returnStatus as keyof typeof returnStatusConfig].color}>
                                      {returnStatusConfig[rtv.returnStatus as keyof typeof returnStatusConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{rtv.returnedBy}</TableCell>
                                  <TableCell>{new Date(rtv.returnDate).toLocaleString()}</TableCell>
                                  <TableCell className="font-mono">{rtv.relatedReceipt}</TableCell>
                                  <TableCell>
                                    <Badge className={approvalConfig[rtv.supplierApproval as keyof typeof approvalConfig].color}>
                                      {approvalConfig[rtv.supplierApproval as keyof typeof approvalConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{rtv.approvalDate ? new Date(rtv.approvalDate).toLocaleString() : "-"}</TableCell>
                                  <TableCell className="font-mono">${rtv.refundAmount.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Badge className={refundStatusConfig[rtv.refundStatus as keyof typeof refundStatusConfig].color}>
                                      {refundStatusConfig[rtv.refundStatus as keyof typeof refundStatusConfig].label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="max-w-xs truncate">{rtv.notes}</TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}