"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, ArrowLeft, Edit, Send, Download, Eye, Copy, AlertCircle, Calendar, Building, User, MapPin } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
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
  shippingStatus: "ASN_CREATED",
  receivingStatus: "NOT_RECEIVED",
  dataSource: "PR_CONVERSION",
  
  // Basic Info
  supplierName: "ABC Suppliers Inc.",
  supplierCode: "SUP001",
  contactPerson: "John Smith",
  contactPhone: "+1-555-0123",
  contactEmail: "john.smith@abcsuppliers.com",
  
  warehouseName: "Main Warehouse",
  warehouseAddress: "1234 Warehouse St, Los Angeles, CA 90001",
  
  totalOrderQty: 500,
  shippedQty: 0,
  receivedQty: 0,
  totalAmount: 12500.00,
  currency: "USD",
  
  created: "2024-01-15T10:30:00Z",
  updated: "2024-01-16T14:20:00Z",
  expectedArrivalDate: "2024-01-25",
  
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
  
  // ASN Records
  asnRecords: [
    {
      id: "1",
      asnNo: "ASN202401150001",
      shippedQty: 75,
      carrier: "FedEx",
      trackingNo: "1234567890",
      shippingStatus: "SHIPPED",
      estimatedArrival: "2024-01-25",
    },
  ],
  
  // Receipt Records
  receiptRecords: [],
  
  // RTV Records
  rtvRecords: [],
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

  // Status configurations
  const statusConfig = {
    DRAFT: { label: "草稿", color: "bg-gray-100 text-gray-800" },
    CREATED: { label: "已创建", color: "bg-blue-100 text-blue-800" },
    PENDING_CONFIRMATION: { label: "待确认", color: "bg-yellow-100 text-yellow-800" },
    CONFIRMED: { label: "已确认", color: "bg-green-100 text-green-800" },
    PARTIALLY_RECEIVED: { label: "部分收货", color: "bg-orange-100 text-orange-800" },
    CLOSED: { label: "已关闭", color: "bg-teal-100 text-teal-800" },
    REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800" },
    CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" },
    EXCEPTION: { label: "异常", color: "bg-red-100 text-red-800" },
  }

  const shippingStatusConfig = {
    NOT_SHIPPED: { label: "未发货", color: "bg-gray-50 text-gray-600" },
    ASN_CREATED: { label: "ASN已创建", color: "bg-blue-50 text-blue-600" },
    SHIPPED: { label: "已发货", color: "bg-purple-50 text-purple-600" },
    IN_TRANSIT: { label: "运输中", color: "bg-indigo-50 text-indigo-600" },
    ARRIVED_AT_WAREHOUSE: { label: "已到仓", color: "bg-green-50 text-green-600" },
    SHIPMENT_COMPLETED: { label: "发货完成", color: "bg-teal-50 text-teal-600" },
  }

  const receivingStatusConfig = {
    NOT_RECEIVED: { label: "未收货", color: "bg-gray-50 text-gray-600" },
    IN_RECEIVING: { label: "收货中", color: "bg-blue-50 text-blue-600" },
    PARTIALLY_RECEIVED: { label: "部分收货", color: "bg-orange-50 text-orange-600" },
    FULLY_RECEIVED: { label: "收货完成", color: "bg-green-50 text-green-600" },
    OVER_RECEIVED: { label: "超量收货", color: "bg-red-50 text-red-600" },
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
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-4">
        {/* 顶部状态栏 - 专业ERP风格 */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{mockPODetail.orderNo}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>供应商: {mockPODetail.supplierName}</span>
                  <span>•</span>
                  <span>创建时间: {new Date(mockPODetail.created).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {availableActions.map((action, index) => (
                <Button key={index} variant="outline" size="sm" onClick={action.action}>
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* 关键指标一行显示 */}
          <div className="grid grid-cols-6 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">订单状态</div>
              <Badge className={statusConfig[mockPODetail.status as keyof typeof statusConfig].color}>
                {statusConfig[mockPODetail.status as keyof typeof statusConfig].label}
              </Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">发货状态</div>
              <Badge variant="outline" className={shippingStatusConfig[mockPODetail.shippingStatus as keyof typeof shippingStatusConfig].color}>
                {shippingStatusConfig[mockPODetail.shippingStatus as keyof typeof shippingStatusConfig].label}
              </Badge>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">收货状态</div>
              <Badge variant="outline" className={receivingStatusConfig[mockPODetail.receivingStatus as keyof typeof receivingStatusConfig].color}>
                {receivingStatusConfig[mockPODetail.receivingStatus as keyof typeof receivingStatusConfig].label}
              </Badge>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">订单数量</div>
              <div className="font-bold text-blue-600">{mockPODetail.totalOrderQty.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">已收数量</div>
              <div className="font-bold text-green-600">{mockPODetail.receivedQty.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded">
              <div className="text-xs text-muted-foreground mb-1">订单金额</div>
              <div className="font-bold text-orange-600">{mockPODetail.currency} {mockPODetail.totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 主体内容 - 左右分栏布局 */}
        <div className="grid grid-cols-4 gap-4">
          {/* 左侧主要内容 */}
          <div className="col-span-3 space-y-4">

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="lines">商品明细</TabsTrigger>
                <TabsTrigger value="asn">发货记录</TabsTrigger>
                <TabsTrigger value="receipts">收货记录</TabsTrigger>
                <TabsTrigger value="rtv">退货记录</TabsTrigger>
              </TabsList>

              {/* 商品明细 */}
              <TabsContent value="lines" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="w-[60px]">行号</TableHead>
                          <TableHead className="min-w-[200px]">商品信息</TableHead>
                          <TableHead className="w-[80px]">订单数量</TableHead>
                          <TableHead className="w-[80px]">已发数量</TableHead>
                          <TableHead className="w-[80px]">已收数量</TableHead>
                          <TableHead className="w-[80px]">退货数量</TableHead>
                          <TableHead className="w-[100px]">单价</TableHead>
                          <TableHead className="w-[120px]">行金额</TableHead>
                          <TableHead className="w-[80px]">收货进度</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockPODetail.lineItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">{item.lineNo}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{item.productName}</div>
                                <div className="text-xs text-muted-foreground">SKU: {item.skuCode}</div>
                                <div className="text-xs text-muted-foreground">{item.specifications}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-medium">{item.quantity.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{item.shippedQty.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{item.receivedQty.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{item.returnedQty.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{mockPODetail.currency} {item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-right font-medium">{mockPODetail.currency} {item.lineAmount.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${item.quantity > 0 ? Math.min((item.receivedQty / item.quantity) * 100, 100) : 0}%` }}
                                />
                              </div>
                              <div className="text-xs text-center mt-1">
                                {item.quantity > 0 ? ((item.receivedQty / item.quantity) * 100).toFixed(0) : 0}%
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 发货记录 */}
              <TabsContent value="asn" className="mt-4">
                <Card>
                  <CardContent>
                    {mockPODetail.asnRecords.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Truck className="mx-auto h-12 w-12 mb-4 opacity-50" />
                        <p>暂无发货记录</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ASN编号</TableHead>
                            <TableHead>发货数量</TableHead>
                            <TableHead>承运商</TableHead>
                            <TableHead>运单号</TableHead>
                            <TableHead>发货状态</TableHead>
                            <TableHead>预计到达</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockPODetail.asnRecords.map((asn) => (
                            <TableRow key={asn.id}>
                              <TableCell className="font-medium">{asn.asnNo}</TableCell>
                              <TableCell>{asn.shippedQty.toLocaleString()}</TableCell>
                              <TableCell>{asn.carrier}</TableCell>
                              <TableCell>{asn.trackingNo}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{asn.shippingStatus}</Badge>
                              </TableCell>
                              <TableCell>{asn.estimatedArrival}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 收货记录 */}
              <TabsContent value="receipts" className="mt-4">
                <Card>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>暂无收货记录</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 退货记录 */}
              <TabsContent value="rtv" className="mt-4">
                <Card>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>暂无退货记录</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧信息面板 */}
          <div className="space-y-4">
            {/* 基本信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO编号:</span>
                    <span className="font-medium">{mockPODetail.orderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">原始PO:</span>
                    <span>{mockPODetail.originalPoNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">参考编号:</span>
                    <span>{mockPODetail.referenceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">预计到货:</span>
                    <span>{mockPODetail.expectedArrivalDate}</span>
                  </div>
                </div>
                
                {mockPODetail.relatedPRs.length > 0 && (
                  <div>
                    <div className="text-muted-foreground mb-2">关联PR:</div>
                    <div className="flex flex-wrap gap-1">
                      {mockPODetail.relatedPRs.map((prNo, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  供应商信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground">供应商名称</div>
                  <div className="font-medium">{mockPODetail.supplierName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">供应商代码</div>
                  <div>{mockPODetail.supplierCode}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">联系人</div>
                  <div>{mockPODetail.contactPerson}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">联系电话</div>
                  <div>{mockPODetail.contactPhone}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">邮箱</div>
                  <div className="text-xs break-all">{mockPODetail.contactEmail}</div>
                </div>
              </CardContent>
            </Card>

            {/* 仓库信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  仓库信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground">仓库名称</div>
                  <div className="font-medium">{mockPODetail.warehouseName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">仓库地址</div>
                  <div className="text-xs">{mockPODetail.warehouseAddress}</div>
                </div>
              </CardContent>
            </Card>

            {/* 收货进度 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  收货进度
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>收货进度</span>
                    <span className="font-medium">
                      {mockPODetail.totalOrderQty > 0 ? ((mockPODetail.receivedQty / mockPODetail.totalOrderQty) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${mockPODetail.totalOrderQty > 0 ? Math.min((mockPODetail.receivedQty / mockPODetail.totalOrderQty) * 100, 100) : 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单数量:</span>
                    <span className="font-medium">{mockPODetail.totalOrderQty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">已发数量:</span>
                    <span className="text-purple-600">{mockPODetail.shippedQty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">已收数量:</span>
                    <span className="text-green-600 font-medium">{mockPODetail.receivedQty.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

// Add Label component if not imported
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props}>
      {children}
    </label>
  )
}