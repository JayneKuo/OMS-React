"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, ArrowLeft, User, AlertTriangle, Download, Clock, Building, MapPin, Calendar, ChevronDown, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PRActionConfirmDialog } from "@/components/purchase/pr-action-confirm-dialog"
import { SimplePODialog } from "@/components/purchase/simple-po-dialog"
import { QuoteFileManager } from "@/components/purchase/quote-file-manager"
import { useI18n } from "@/components/i18n-provider"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// Define status type
type PRStatus = "DRAFT" | "SUBMITTED" | "APPROVING" | "APPROVED" | "REJECTED" | "CANCELLED" | "EXCEPTION" | "PARTIAL_PO" | "FULL_PO" | "CLOSED"

// Mock PR data
const mockPR = {
  id: "1",
  prNo: "PR202401100001",
  businessNo: "PROJ-2024-001",
  businessEntity: "UT",
  department: "ECOM Dept",
  requester: "张三",
  requesterNo: "EMP001",
  currentApprover: "李经理",
  status: "PARTIAL_PO" as PRStatus,
  prType: "常规采购",
  priority: "NORMAL" as const,
  poGenerated: "PARTIALLY_GENERATED" as const,
  created: "2024-01-10T09:30:00Z",
  expectedDeliveryDate: "2024-01-25",
  targetWarehouses: ["Main Warehouse - LA"],
  skuCount: 15,
  totalQty: 500,
  estimatedAmount: 12500.00,
  currency: "USD",
  updated: "2024-01-12T14:20:00Z",
  exceptions: [] as string[],
  budgetProject: "Q1-Marketing",
  notes: "促销活动备货",
  latestShipDate: "2024-01-20", // 最晚发货日期
  lineItems: [
    {
      id: "1",
      lineNo: 1,
      skuCode: "SKU001",
      skuName: "iPhone 15 Pro",
      productName: "iPhone 15 Pro",
      specifications: "256GB Space Black",
      quantity: 100,
      unit: "PCS",
      targetWarehouse: "Main Warehouse - LA",
      expectedDeliveryDate: "2024-01-25",
      businessPurpose: "促销活动",
      projectNo: "PROMO-2024-Q1",
      estimatedUnitPrice: 100.00,
      notes: "优先级商品",
      supplier: "Apple Inc.",
      supplierCode: "APPLE001",
    },
    {
      id: "2",
      lineNo: 2,
      skuCode: "SKU002",
      skuName: "MacBook Pro",
      productName: "MacBook Pro",
      specifications: "14-inch M3 Pro",
      quantity: 50,
      unit: "PCS",
      targetWarehouse: "Main Warehouse - LA",
      expectedDeliveryDate: "2024-01-25",
      businessPurpose: "促销活动",
      projectNo: "PROMO-2024-Q1",
      estimatedUnitPrice: 200.00,
      notes: "",
      supplier: "Apple Inc.",
      supplierCode: "APPLE001",
    },
  ],
  approvalHistory: [
    {
      id: "1",
      step: 1,
      approver: "张三",
      action: "提交",
      status: "APPROVED",
      timestamp: "2024-01-10T09:30:00Z",
      comments: "申请提交",
    },
    {
      id: "2",
      step: 2,
      approver: "李经理",
      action: "审批",
      status: "PENDING",
      timestamp: null,
      comments: "",
    },
  ]
}



const priorityConfig = {
  NORMAL: { label: "普通", color: "bg-gray-50 text-gray-700 border-gray-200" },
  URGENT: { label: "紧急", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  VERY_URGENT: { label: "非常紧急", color: "bg-red-50 text-red-700 border-red-200" },
}

const poGeneratedConfig = {
  NOT_GENERATED: { label: "未生成PO", color: "bg-gray-50 text-gray-700 border-gray-200" },
  PARTIALLY_GENERATED: { label: "部分生成PO", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  FULLY_GENERATED: { label: "已完全生成PO", color: "bg-green-50 text-green-700 border-green-200" },
}

export default function PRDetailPage({ params }: { params: { id: string } }) {
  const { t } = useI18n()
  const pr = mockPR // In real app, fetch by params.id
  
  // Status configuration with translations
  const statusConfig = React.useMemo(() => ({
    DRAFT: { label: t('DRAFT'), color: "bg-gray-100 text-gray-800" },
    SUBMITTED: { label: t('SUBMITTED'), color: "bg-blue-100 text-blue-800" },
    APPROVING: { label: t('APPROVING'), color: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: t('APPROVED'), color: "bg-green-100 text-green-800" },
    REJECTED: { label: t('REJECTED'), color: "bg-red-100 text-red-800" },
    CANCELLED: { label: t('CANCELLED'), color: "bg-gray-100 text-gray-800" },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-orange-100 text-orange-800" },
    PARTIAL_PO: { label: t('PARTIAL_PO'), color: "bg-purple-100 text-purple-800" },
    FULL_PO: { label: t('FULL_PO'), color: "bg-indigo-100 text-indigo-800" },
    CLOSED: { label: t('CLOSED'), color: "bg-slate-100 text-slate-800" },
  }), [t])
  
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean
    action: string
    newStatus: string
    message: string
  }>({
    open: false,
    action: "",
    newStatus: "",
    message: "",
  })
  const [showPODialog, setShowPODialog] = React.useState(false)
  
  // PO detail expansion state
  const [expandedPOs, setExpandedPOs] = React.useState<Set<string>>(new Set())
  
  // Toggle PO detail expansion
  const togglePOExpansion = (poId: string) => {
    const newExpanded = new Set(expandedPOs)
    if (newExpanded.has(poId)) {
      newExpanded.delete(poId)
    } else {
      newExpanded.add(poId)
    }
    setExpandedPOs(newExpanded)
  }
  
  // Quote file management state
  const [quoteFiles] = React.useState([
    {
      id: "1",
      fileName: "Apple_Quote_2024.pdf",
      fileSize: "2.3 MB",
      uploadDate: "2024-01-15",
      supplierName: "Apple Inc.",
      fileType: "PDF",
      description: "iPhone 15 Pro 报价单",
      status: "APPROVED" as const
    },
    {
      id: "2",
      fileName: "Apple_MacBook_Quote.xlsx",
      fileSize: "1.8 MB",
      uploadDate: "2024-01-14",
      supplierName: "Apple Inc.",
      fileType: "XLSX",
      description: "MacBook Pro 报价表",
      status: "APPROVED" as const
    }
  ])
  
  const [quoteRequests] = React.useState([
    {
      id: "1",
      supplierName: "Apple Inc.",
      requestDate: "2024-01-10",
      dueDate: "2024-01-20",
      status: "RECEIVED" as const,
      notes: "已收到最新报价"
    }
  ])

  // 状态更新函数
  const updatePRStatus = (newStatus: string, message: string, action: string) => {
    setConfirmDialog({
      open: true,
      action,
      newStatus,
      message,
    })
  }

  // 确认操作
  const handleConfirmAction = (reason?: string) => {
    console.log(`${confirmDialog.message} PR ${pr.prNo}, 新状态: ${confirmDialog.newStatus}`)
    if (reason) {
      console.log(`原因: ${reason}`)
    }
    alert(`${confirmDialog.message}成功！`)
    // 实际应用中应该刷新数据或更新状态
  }

  // 处理PO生成
  const handlePOGeneration = (data: any) => {
    console.log("生成PO数据:", data)
    alert(`成功生成PO！选择了 ${data.selectedItems.length} 个商品行`)
    // 实际应用中应该调用API生成PO
  }

  // Get available actions based on status
  const getAvailableActions = () => {
    switch (pr.status) {
      case "DRAFT":
        return [
          { label: t('edit'), action: () => window.location.href = `/purchase/pr/${pr.id}/edit` },
          { label: t('delete'), action: () => updatePRStatus("DELETED", t('delete'), "delete"), variant: "destructive" },
          { label: t('submit'), action: () => updatePRStatus("SUBMITTED", t('submit'), "submit") },
          { label: t('cancel'), action: () => updatePRStatus("CANCELLED", t('cancel'), "cancel"), variant: "destructive" },
        ]
      case "SUBMITTED":
        return [
          { label: t('edit'), action: () => window.location.href = `/purchase/pr/${pr.id}/edit` },
          { label: t('submitForApproval'), action: () => updatePRStatus("APPROVING", t('submitForApproval'), "submit") },
          { label: t('cancel'), action: () => updatePRStatus("CANCELLED", t('cancel'), "cancel"), variant: "destructive" },
        ]
      case "APPROVING":
        return [
          { label: t('approve'), action: () => updatePRStatus("APPROVED", t('approve'), "approve") },
          { label: t('reject'), action: () => updatePRStatus("REJECTED", t('reject'), "reject"), variant: "destructive" },
          { label: t('cancel'), action: () => updatePRStatus("CANCELLED", t('cancel'), "cancel"), variant: "destructive" },
        ]
      case "APPROVED":
        return [
          { label: "生成PO", action: () => setShowPODialog(true) },
          { label: "取消", action: () => updatePRStatus("CANCELLED", "取消", "cancel"), variant: "destructive" },
        ]
      case "REJECTED":
        return [
          { label: "编辑", action: () => window.location.href = `/purchase/pr/${pr.id}/edit` },
          { label: "复制", action: () => window.location.href = `/purchase/pr/create?copy=${pr.id}` },
        ]
      case "CANCELLED":
        return [
          { label: "复制", action: () => window.location.href = `/purchase/pr/create?copy=${pr.id}` },
        ]
      case "EXCEPTION":
        return [
          { label: "修复", action: () => window.location.href = `/purchase/pr/${pr.id}/edit` },
          { label: "取消", action: () => updatePRStatus("CANCELLED", "取消", "cancel"), variant: "destructive" },
        ]
      case "PARTIAL_PO":
        return [
          { label: "继续生成PO", action: () => setShowPODialog(true) },
          { label: "查看PO", action: () => console.log("View PO", pr.prNo) },
          { label: "取消未挂PO商品", action: () => updatePRStatus("FULL_PO", "取消未挂PO商品", "cancelUnlinkedPO"), variant: "destructive" },
        ]
      case "FULL_PO":
        return [
          { label: "查看PO", action: () => console.log("View PO", pr.prNo) },
        ]
      case "CLOSED":
        return [
          { label: "查看PO", action: () => console.log("View PO", pr.prNo) },
        ]
      default:
        return []
    }
  }

  const actions = getAvailableActions()

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{pr.prNo}</h1>
                <Badge className={statusConfig[pr.status].color}>
                  {statusConfig[pr.status].label}
                </Badge>
                {pr.exceptions.length > 0 && (
                  <div className="flex items-center gap-1 text-red-600" title={pr.exceptions.join(", ")}>
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{t('EXCEPTION')}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t('created')}: {new Date(pr.created).toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t('updated')}: {new Date(pr.updated).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t('export')}
            </Button>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant === "destructive" ? "destructive" : index === 0 ? "default" : "outline"}
                size="sm"
                onClick={action.action}
                className="min-w-[60px]"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo') || '基本信息'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {t('requestNumber')}
                </div>
                <div className="font-medium">{pr.prNo}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {t('departmentBusinessUnit')}
                </div>
                <div className="font-medium">{pr.department}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {t('requesterName')}
                </div>
                <div className="font-medium">{pr.requester} ({pr.requesterNo})</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {t('prTypeField')}
                </div>
                <div className="font-medium">{pr.prType}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  {t('priorityField')}
                </div>
                <Badge variant="outline" className={priorityConfig[pr.priority].color}>
                  {priorityConfig[pr.priority].label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {t('poGenerationStatus')}
                </div>
                <Badge variant="outline" className={poGeneratedConfig[pr.poGenerated].color}>
                  {poGeneratedConfig[pr.poGenerated].label}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t('creationTimeLabel')}
                </div>
                <div className="font-medium">{new Date(pr.created).toLocaleString()}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('expectedDeliveryTimeDetail')}
                </div>
                <div className="font-medium">{pr.expectedDeliveryDate}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('latestShipDateDetail')}
                </div>
                <div className="font-medium">{pr.latestShipDate}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {t('targetWarehouseDetail')}
                </div>
                <div className="font-medium">
                  {pr.targetWarehouses.length === 1 ? (
                    pr.targetWarehouses[0]
                  ) : (
                    `${t('multiWarehouse')}（${pr.targetWarehouses.length}）`
                  )}
                </div>
              </div>

              {pr.businessNo && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {t('businessNumber')}
                  </div>
                  <div className="font-medium">{pr.businessNo}</div>
                </div>
              )}

              {pr.budgetProject && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    {t('budgetProjectCostCenter')}
                  </div>
                  <div className="font-medium">{pr.budgetProject}</div>
                </div>
              )}

              {pr.currentApprover && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {t('currentApprover')}
                  </div>
                  <div className="font-medium">{pr.currentApprover}</div>
                </div>
              )}
            </div>

            {pr.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {t('notesField')}
                </div>
                <div className="text-sm bg-muted p-3 rounded-md">{pr.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              {t('deliveryRequirements')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {t('targetWarehouseDetail')}
                </div>
                <div className="font-medium">
                  {pr.targetWarehouses.length === 1 ? (
                    pr.targetWarehouses[0]
                  ) : (
                    `${t('multiWarehouse')}（${pr.targetWarehouses.length}）`
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('expectedDeliveryTimeDetail')}
                </div>
                <div className="font-medium">{pr.expectedDeliveryDate}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('latestShipDateDetail')}
                </div>
                <div className="font-medium">{pr.latestShipDate}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {t('shippingContactPersonDetail')}
                </div>
                <div className="font-medium">张三 ({t('receivingContactPersonLabel')})</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {t('contactPhoneLabel')}
                </div>
                <div className="font-medium">+1-555-0123</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {t('contactEmailLabel')}
                </div>
                <div className="font-medium">warehouse@company.com</div>
              </div>
            </div>

            {/* 收货地址 */}
            <div className="mt-6 space-y-4">
              <div className="text-base font-medium">{t('shippingAddressDetail')}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('countryLabel')}</div>
                  <div className="font-medium">United States</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('stateProvinceLabel')}</div>
                  <div className="font-medium">California</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('cityLabel')}</div>
                  <div className="font-medium">Los Angeles</div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <div className="text-sm text-muted-foreground">{t('detailedAddressLabel')}</div>
                  <div className="font-medium">1234 Main Street, Suite 100</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">{t('zipCodeLabel')}</div>
                  <div className="font-medium">90001</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{pr.skuCount}</div>
                <div className="text-sm text-muted-foreground">{t('skuCount')}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{pr.totalQty.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{t('totalQty')}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{pr.currency} {pr.estimatedAmount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">{t('estimatedAmount')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>{t('productDetailsLabel')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">{t('lineNumber')}</TableHead>
                    <TableHead className="min-w-[200px]">{t('productInfo')}</TableHead>
                    <TableHead className="w-[80px]">{t('quantityField')}</TableHead>
                    <TableHead className="w-[60px]">{t('unitField')}</TableHead>
                    <TableHead className="w-[100px]">{t('unitPriceField')}</TableHead>
                    <TableHead className="w-[120px]">{t('taxInclusiveSubtotal')}</TableHead>
                    <TableHead className="min-w-[150px]">{t('supplierField')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('targetWarehouseDetail')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('businessPurpose')}</TableHead>
                    <TableHead className="min-w-[120px]">{t('notesFieldTable')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pr.lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.lineNo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">SKU: {item.skuCode}</div>
                          <div className="text-xs text-muted-foreground">{item.specifications}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.quantity.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.unit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{pr.currency} {item.estimatedUnitPrice.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-green-600">
                          {pr.currency} {(item.quantity * item.estimatedUnitPrice).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {item.supplier ? (
                            <div>
                              <div className="font-medium">{item.supplier}</div>
                              <div className="text-xs text-muted-foreground">{item.supplierCode}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.targetWarehouse}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.businessPurpose || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{item.notes || '-'}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                
                {/* 汇总行 */}
                <tfoot className="bg-muted/50 border-t-2">
                  <tr>
                    <td className="px-4 py-3 font-medium text-sm">{t('summary')}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{pr.lineItems.length} {t('products')}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-bold text-blue-600">{pr.totalQty.toLocaleString()}</div>
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-green-600">
                        {pr.currency} {pr.estimatedAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quote File Management */}
        <QuoteFileManager
          quoteFiles={quoteFiles}
          quoteRequests={quoteRequests}
          onFileUpload={() => {}}
          onFileDelete={() => {}}
          onQuoteRequestAdd={() => {}}
          onQuoteRequestUpdate={() => {}}
        />

        {/* PO Information - 显示在部分PO、已关闭等状态下 */}
        {(pr.status === "PARTIAL_PO" || pr.status === "FULL_PO" || pr.status === "CLOSED") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                {t('relatedPOInfoLabel')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* PO列表表格 */}
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]"></TableHead>
                      <TableHead>{t('prNumber')}</TableHead>
                      <TableHead>{t('creationTimeLabel')}</TableHead>
                      <TableHead>{t('supplierLabel')}</TableHead>
                      <TableHead>{t('targetWarehouseDetail')}</TableHead>
                      <TableHead>{t('statusLabel2')}</TableHead>
                      <TableHead>{t('poAmountLabel')}</TableHead>
                      <TableHead>{t('productQuantityLabel')}</TableHead>
                      <TableHead>{t('expectedDeliveryTimeLabel2')}</TableHead>
                      <TableHead className="w-[120px]">{t('actionsLabel2')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        id: "PO001",
                        poNo: "PO202401150001",
                        supplier: "Apple Inc.",
                        status: "CONFIRMED",
                        totalAmount: 10000.00,
                        currency: "USD",
                        createdDate: "2024-01-15T10:30:00Z",
                        expectedDeliveryDate: "2024-01-30",
                        itemCount: 1,
                        warehouse: "Main Warehouse - LA",
                        items: [
                          {
                            id: "1",
                            lineNo: 1,
                            productName: "iPhone 15 Pro",
                            skuCode: "SKU001",
                            specifications: "256GB Space Black",
                            quantity: 100,
                            unitPrice: 100.00,
                            totalAmount: 10000.00
                          }
                        ]
                      },
                      {
                        id: "PO002", 
                        poNo: "PO202401150002",
                        supplier: "Apple Inc.",
                        status: "PENDING",
                        totalAmount: 10000.00,
                        currency: "USD",
                        createdDate: "2024-01-15T14:20:00Z",
                        expectedDeliveryDate: "2024-02-01",
                        itemCount: 1,
                        warehouse: "Main Warehouse - LA",
                        items: [
                          {
                            id: "2",
                            lineNo: 2,
                            productName: "MacBook Pro",
                            skuCode: "SKU002",
                            specifications: "14-inch M3 Pro",
                            quantity: 50,
                            unitPrice: 200.00,
                            totalAmount: 10000.00
                          }
                        ]
                      }
                    ].map((po) => (
                      <React.Fragment key={po.id}>
                        {/* PO主行 */}
                        <TableRow className="hover:bg-muted/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePOExpansion(po.id)}
                              className="h-6 w-6 p-0"
                            >
                              {expandedPOs.has(po.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{po.poNo}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{new Date(po.createdDate).toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{po.supplier}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{po.warehouse}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              po.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                              po.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                              po.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                              po.status === "DELIVERED" ? "bg-purple-100 text-purple-800" :
                              "bg-gray-100 text-gray-800"
                            }>
                              {po.status === "CONFIRMED" ? t('confirmedLabel') :
                               po.status === "PENDING" ? t('pendingLabel') :
                               po.status === "SHIPPED" ? t('shippedLabel') :
                               po.status === "DELIVERED" ? t('deliveredLabel') : t('unknownLabel')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              {po.currency} {po.totalAmount.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{po.itemCount} {t('products')}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{po.expectedDeliveryDate}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => console.log("View PO", po.poNo)}>
                                {t('viewLabel')}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => console.log("Download PO", po.poNo)}>
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* PO明细行 - 可展开 */}
                        {expandedPOs.has(po.id) && (
                          <TableRow>
                            <TableCell colSpan={10} className="p-0">
                              <div className="bg-muted/30 p-4">
                                <div className="text-sm font-medium mb-3 text-muted-foreground">
                                  {po.poNo} {t('productDetailsLabel')}
                                </div>
                                <div className="border rounded-md bg-background">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-[60px]">{t('lineNumber')}</TableHead>
                                        <TableHead>{t('productInfo')}</TableHead>
                                        <TableHead className="w-[80px]">{t('quantityField')}</TableHead>
                                        <TableHead className="w-[100px]">{t('unitPriceField')}</TableHead>
                                        <TableHead className="w-[120px]">{t('taxInclusiveSubtotal')}</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {po.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                              {item.lineNo}
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            <div className="space-y-1">
                                              <div className="font-medium text-sm">{item.productName}</div>
                                              <div className="text-xs text-muted-foreground">SKU: {item.skuCode}</div>
                                              <div className="text-xs text-muted-foreground">{item.specifications}</div>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="font-medium">{item.quantity}</div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="font-medium">{po.currency} {item.unitPrice.toLocaleString()}</div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="font-medium text-green-600">
                                              {po.currency} {item.totalAmount.toLocaleString()}
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>



              {/* 汇总信息 */}
              <div className="bg-muted/50 rounded-lg p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">2</div>
                    <div className="text-sm text-muted-foreground">{t('relatedPOCountLabel')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">2</div>
                    <div className="text-sm text-muted-foreground">{t('convertedToPOProductsLabel')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">USD 20,000</div>
                    <div className="text-sm text-muted-foreground">{t('totalPOAmountLabel')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approval History */}
        <Card>
          <CardHeader>
            <CardTitle>{t('approvalProcessLabel')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pr.approvalHistory.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      step.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      step.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {step.step}
                    </div>
                    {index < pr.approvalHistory.length - 1 && (
                      <div className="w-px h-8 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{step.approver}</div>
                      <Badge variant="outline" className={
                        step.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                        step.status === "REJECTED" ? "bg-red-50 text-red-700 border-red-200" :
                        step.status === "PENDING" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-gray-50 text-gray-700 border-gray-200"
                      }>
                        {step.status === "APPROVED" ? t('approvedLabel') :
                         step.status === "REJECTED" ? t('rejectedLabel') :
                         step.status === "PENDING" ? t('pendingApprovalLabel') : t('unknownLabel')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{step.action}</div>
                    {step.timestamp && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(step.timestamp).toLocaleString()}
                      </div>
                    )}
                    {step.comments && (
                      <div className="text-sm bg-muted p-2 rounded mt-2">{step.comments}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <PRActionConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        action={confirmDialog.action}
        prNo={pr.prNo}
        onConfirm={handleConfirmAction}
      />

      {/* PO Generation Dialog */}
      <SimplePODialog
        open={showPODialog}
        onOpenChange={setShowPODialog}
        lineItems={pr.lineItems}
        prNo={pr.prNo}
        onConfirm={handlePOGeneration}
      />
    </MainLayout>
  )
}