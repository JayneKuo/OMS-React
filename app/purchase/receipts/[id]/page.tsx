"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  ArrowLeft, Edit, Download, Package, Truck, MapPin, 
  Building2, FileText, ExternalLink, Clock, AlertTriangle,
  Copy, Send, RefreshCw, Phone, Mail, CheckCircle, User, Calendar
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Receipt Detail Interface - 根据新增页面字段完善
interface ReceiptDetail {
  id: string
  receiptNo: string // 入库请求单号
  actualReceiptNo?: string // 收货单号
  receiptType: "REGULAR" | "TRANSLOAD" | "RETURN_FROM_END_USER" | "INVENTORY_RECEIPT" | "CUSTOMER_TRANSFER"
  source: "MANUAL" | "EDI" | "SYSTEM_AUTO"
  title?: string // 货主
  relatedNo?: string // 关联单号
  warehouse: {
    id: string
    name: string
    code: string
    type: "VIRTUAL" | "THIRD_PARTY"
    address?: {
      address1: string
      address2?: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    contactPerson?: string
    contactPhone?: string
    contactEmail?: string
  }
  autoReceiving: "YES" | "NO"
  supplier?: string
  poNos: string[] // 多个PO单号
  poIds: string[]
  shipmentNos?: string[]
  shipmentIds?: string[]
  transportMode?: "FTL" | "LTL" | "EXPRESS" | "SMALL_PARCEL" | "AIR_CARGO" | "OCEAN_FCL" | "OCEAN_LCL" | "RAIL" | "INTERMODAL" | "INTERNAL" | "VIRTUAL"
  carrier?: string
  trackingNumber?: string
  appointmentTime?: string
  inYardTime?: string
  // 运输方式相关字段
  trailerNo?: string
  trailerSize?: string
  sealNo?: string
  containerNo?: string
  containerSize?: string
  bol?: string
  mawb?: string
  hawb?: string
  mbl?: string
  hbl?: string
  vessel?: string
  voyage?: string
  flightNo?: string
  airlineCode?: string
  licensePlate?: string
  driverName?: string
  driverPhone?: string
  proNumber?: string
  consolidationWarehouse?: string
  trainNo?: string
  railCarNumber?: string
  operator?: string
  internalShipmentNo?: string
  status: "NEW" | "PENDING" | "IN_RECEIVING" | "PARTIALLY_RECEIVED" | "COMPLETED" | "EXCEPTION"
  receivedBy?: string
  receivedDate?: string
  created: string
  updated: string
  expectedQty: number
  receivedQty: number
  totalLines: number
  completedLines: number
  damageQty?: number
  rejectedQty?: number
  notes?: string
  attachments?: string[]
  receiptLines: ReceiptLineItem[]
  relatedPOs?: {
    poNo: string
    poId: string
    supplierName: string
    status: string
    orderedQty: number
    receivedQty: number
    remainingQty: number
    created: string
  }[]
  relatedShipments?: {
    shipmentNo: string
    shipmentId: string
    carrier: string
    trackingNumber: string
    status: string
    created: string
  }[]
  relatedReceiptConfirms?: {
    receiptConfirmNo: string
    receiptConfirmId: string
    status: string
    receivedQty: number
    receivedDate: string
    receivedBy?: string
    created: string
  }[]
  relatedRCNo?: string // 关联RC单号
}

interface ReceiptLineItem {
  id: string
  lineNo: number
  sku: string
  itemName: string
  poNo?: string
  poLineNo?: number
  orderedQty: number
  receivedQty: number
  thisReceiptQty: number
  palletCount?: number
  uom: string
  location?: string
  batchNo?: string // Lot/Batch No
  serialNo?: string // Serial No
  lineRemark?: string
  qualityStatus?: "PENDING" | "PASSED" | "FAILED" | "PARTIAL_DAMAGE"
  damageQty?: number
  rejectedQty?: number
}

// Mock Receipt Detail Data - 根据新增页面字段完善
const mockReceiptDetail: ReceiptDetail = {
  id: "1",
  receiptNo: "RCP-2024-001",
  actualReceiptNo: "RN-2024-001",
  receiptType: "REGULAR",
  source: "MANUAL",
  title: "ABC Company",
  relatedNo: "REF-2024-001",
  warehouse: {
    id: "WH001",
    name: "Main Warehouse - Los Angeles",
    code: "WH001",
    type: "VIRTUAL",
    address: {
      address1: "1234 Warehouse St",
      address2: "Building A",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "US",
    },
    contactPerson: "John Smith",
    contactPhone: "+1-555-0100",
    contactEmail: "warehouse@example.com",
  },
  autoReceiving: "YES",
  supplier: "ABC Suppliers Inc.",
  poNos: ["PO-2024-001", "PO-2024-002"],
  poIds: ["PO-001", "PO-002"],
  shipmentNos: ["SHIP-2024-001"],
  shipmentIds: ["SHIP-001"],
  transportMode: "FTL",
  carrier: "FedEx",
  trackingNumber: "FX123456789",
  appointmentTime: "2024-01-20T10:00:00Z",
  inYardTime: "2024-01-20T10:30:00Z",
  trailerNo: "TRL-001",
  trailerSize: "53ft",
  sealNo: "SEAL-001",
  status: "IN_RECEIVING",
  receivedBy: "Jane Doe",
  receivedDate: "2024-01-20T10:30:00Z",
  created: "2024-01-20T09:00:00Z",
  updated: "2024-01-20T10:30:00Z",
  expectedQty: 150,
  receivedQty: 80,
  totalLines: 3,
  completedLines: 1,
  damageQty: 0,
  rejectedQty: 0,
  notes: "部分货物已到达，正在验收中",
  attachments: ["receipt.pdf", "packing_list.pdf"],
  receiptLines: [
    {
      id: "line1",
      lineNo: 1,
      sku: "SKU-001",
      itemName: "Product A",
      poNo: "PO-2024-001",
      poLineNo: 1,
      orderedQty: 50,
      receivedQty: 30,
      thisReceiptQty: 30,
      palletCount: 2,
      uom: "PCS",
      location: "A区-01-001",
      batchNo: "BATCH-2024-001",
      serialNo: "SN001,SN002,SN003",
      lineRemark: "Good condition",
      qualityStatus: "PASSED",
      damageQty: 0,
      rejectedQty: 0,
    },
    {
      id: "line2",
      lineNo: 2,
      sku: "SKU-002",
      itemName: "Product B",
      poNo: "PO-2024-001",
      poLineNo: 2,
      orderedQty: 50,
      receivedQty: 0,
      thisReceiptQty: 0,
      palletCount: 0,
      uom: "PCS",
      qualityStatus: "PENDING",
    },
    {
      id: "line3",
      lineNo: 3,
      sku: "SKU-003",
      itemName: "Product C",
      poNo: "PO-2024-002",
      poLineNo: 1,
      orderedQty: 50,
      receivedQty: 50,
      thisReceiptQty: 50,
      palletCount: 3,
      uom: "PCS",
      location: "B区-02-001",
      batchNo: "BATCH-2024-002",
      serialNo: "SN101,SN102,SN103,SN104,SN105",
      qualityStatus: "PASSED",
    },
  ],
  relatedPOs: [
    {
      poNo: "PO-2024-001",
      poId: "PO-001",
      supplierName: "ABC Suppliers Inc.",
      status: "CONFIRMED",
      orderedQty: 100,
      receivedQty: 30,
      remainingQty: 70,
      created: "2024-01-15T10:00:00Z",
    },
    {
      poNo: "PO-2024-002",
      poId: "PO-002",
      supplierName: "Global Trading Co.",
      status: "CONFIRMED",
      orderedQty: 50,
      receivedQty: 50,
      remainingQty: 0,
      created: "2024-01-16T10:00:00Z",
    },
  ],
  relatedShipments: [
    {
      shipmentNo: "SHIP-2024-001",
      shipmentId: "SHIP-001",
      carrier: "FedEx",
      trackingNumber: "FX123456789",
      status: "IN_TRANSIT",
      created: "2024-01-18T10:00:00Z",
    },
  ],
  relatedReceiptConfirms: [
    {
      receiptConfirmNo: "RC-2024-001",
      receiptConfirmId: "RC-001",
      status: "COMPLETED",
      receivedQty: 80,
      receivedDate: "2024-01-20T10:30:00Z",
      receivedBy: "张三",
      created: "2024-01-20T10:30:00Z",
    },
  ],
  relatedRCNo: "RC-2024-001",
}

interface ReceiptDetailPageProps {
  params: {
    id: string
  }
}

export default function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("lines")
  const [isLoading, setIsLoading] = React.useState(false)
  const [showReceivingDialog, setShowReceivingDialog] = React.useState(false)
  const [receivingQuantities, setReceivingQuantities] = React.useState<Record<string, number>>({})
  const [receivingBatchNos, setReceivingBatchNos] = React.useState<Record<string, string>>({})
  const [receivingSerialNos, setReceivingSerialNos] = React.useState<Record<string, string>>({})
  const [receivingLocations, setReceivingLocations] = React.useState<Record<string, string>>({})
  const [receivingNotes, setReceivingNotes] = React.useState("")
  
  const receipt = mockReceiptDetail // In real app, fetch by params.id
  const sidebarItems = createPurchaseSidebarItems(t)

  // Status configurations
  const statusConfig = {
    NEW: { label: t('NEW'), color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
    PENDING: { label: t('PENDING'), color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200" },
    IN_RECEIVING: { label: t('IN_RECEIVING'), color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200" },
    PARTIALLY_RECEIVED: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" },
    COMPLETED: { label: t('COMPLETED'), color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
  }

  const receiptTypeConfig = {
    REGULAR: { label: t('regularReceipt'), color: "bg-blue-50 text-blue-700" },
    TRANSLOAD: { label: t('transload'), color: "bg-green-50 text-green-700" },
    RETURN_FROM_END_USER: { label: t('returnFromEndUser'), color: "bg-orange-50 text-orange-700" },
    INVENTORY_RECEIPT: { label: t('inventoryReceipt'), color: "bg-purple-50 text-purple-700" },
    CUSTOMER_TRANSFER: { label: t('customerTransfer'), color: "bg-indigo-50 text-indigo-700" },
  }

  const sourceConfig = {
    MANUAL: { label: t('manual'), color: "bg-blue-50 text-blue-700" },
    EDI: { label: t('edi'), color: "bg-green-50 text-green-700" },
    SYSTEM_AUTO: { label: t('systemAuto'), color: "bg-purple-50 text-purple-700" },
  }

  // Get available actions based on status
  const getAvailableActions = () => {
    switch (receipt.status) {
      case "NEW":
        return [
          { label: t('edit'), icon: <Edit className="h-4 w-4" />, action: () => router.push(`/purchase/receipts/${receipt.id}/edit`) },
          { label: t('pushToWarehouse'), icon: <Send className="h-4 w-4" />, action: () => console.log("Push to warehouse") },
        ]
      case "PENDING":
      case "IN_RECEIVING":
      case "PARTIALLY_RECEIVED":
        return [
          { label: t('receiving'), icon: <Package className="h-4 w-4" />, action: () => handleOpenReceivingDialog() },
        ]
      case "COMPLETED":
        return [
          { label: t('download'), icon: <Download className="h-4 w-4" />, action: () => console.log("Download receipt") },
        ]
      default:
        return []
    }
  }

  const availableActions = getAvailableActions()

  // 刷新数据
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // 计算汇总数据
  const summaryData = React.useMemo(() => {
    const receivingProgress = receipt.expectedQty > 0 ? (receipt.receivedQty / receipt.expectedQty) * 100 : 0
    return {
      totalLines: receipt.totalLines,
      completedLines: receipt.completedLines,
      receivingProgress,
      pendingQty: receipt.expectedQty - receipt.receivedQty,
    }
  }, [])

  // 打开收货对话框
  const handleOpenReceivingDialog = () => {
    const initialQuantities: Record<string, number> = {}
    const initialBatchNos: Record<string, string> = {}
    const initialSerialNos: Record<string, string> = {}
    const initialLocations: Record<string, string> = {}
    
    receipt.receiptLines.forEach(line => {
      initialQuantities[line.id] = 0
      initialBatchNos[line.id] = line.batchNo || ""
      initialSerialNos[line.id] = line.serialNo || ""
      initialLocations[line.id] = line.location || ""
    })
    
    setReceivingQuantities(initialQuantities)
    setReceivingBatchNos(initialBatchNos)
    setReceivingSerialNos(initialSerialNos)
    setReceivingLocations(initialLocations)
    setReceivingNotes("")
    setShowReceivingDialog(true)
  }

  // 处理收货数量变化
  const handleReceivingQtyChange = (lineId: string, value: number) => {
    setReceivingQuantities(prev => ({ ...prev, [lineId]: Math.max(0, value) }))
  }

  // 确认收货
  const handleConfirmReceiving = () => {
    const hasAnyQty = receipt.receiptLines.some(line => {
      const qty = receivingQuantities[line.id] || 0
      return qty > 0
    })

    if (!hasAnyQty) {
      alert(t('pleaseEnterReceivingQty'))
      return
    }

    console.log("Complete Receiving", {
      receiptId: receipt.id,
      receivingQuantities,
      receivingBatchNos,
      receivingSerialNos,
      receivingLocations,
      receivingNotes,
    })

    setShowReceivingDialog(false)
    setReceivingQuantities({})
    setReceivingBatchNos({})
    setReceivingSerialNos({})
    setReceivingLocations({})
    setReceivingNotes("")
  }

  // 格式化地址
  const formatAddress = (address?: { address1: string; address2?: string; city: string; state: string; zipCode: string; country: string }) => {
    if (!address) return "-"
    return `${address.address1}${address.address2 ? `, ${address.address2}` : ""}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`
  }

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-4">
          {/* 顶部标题栏 - 参考PO详情页 */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{receipt.receiptNo}</h1>
                      {receipt.actualReceiptNo && (
                        <span className="text-lg text-muted-foreground">({receipt.actualReceiptNo})</span>
                      )}
                      
                      {/* 状态徽章 */}
                      <div className="flex items-center gap-2">
                        <Badge className={statusConfig[receipt.status].color}>
                          {statusConfig[receipt.status].label}
                        </Badge>
                        <Badge variant="outline" className={receiptTypeConfig[receipt.receiptType].color}>
                          {receiptTypeConfig[receipt.receiptType].label}
                        </Badge>
                        <Badge variant="outline" className={sourceConfig[receipt.source].color}>
                          {sourceConfig[receipt.source].label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building2 className="h-3 w-3" />
                      <span>{t('warehouse')}: {receipt.warehouse.name}</span>
                      {receipt.supplier && (
                        <>
                          <span>•</span>
                          <span>{t('supplierName')}: {receipt.supplier}</span>
                        </>
                      )}
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>{t('created')}: {new Date(receipt.created).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 操作按钮 */}
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
                    <p>{t('refresh')}</p>
                  </TooltipContent>
                </Tooltip>
                
                {availableActions.map((action, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={action.action}>
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 核心信息 - 3列布局 - 重新整理字段 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 基本信息（包含供应商信息） */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  {t('basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('receiptType')}:</span>
                    <Badge variant="outline" className="text-xs h-5">{receiptTypeConfig[receipt.receiptType].label}</Badge>
                  </div>
                  {receipt.title && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('title')}:</span>
                      <span className="font-medium">{receipt.title}</span>
                    </div>
                  )}
                  {receipt.relatedNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('relatedNo')}:</span>
                      <span className="font-mono text-xs">{receipt.relatedNo}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('autoReceiving')}:</span>
                    <Badge variant="outline" className="text-xs h-5">{receipt.autoReceiving === "YES" ? t('yes') : t('no')}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('warehouse')}:</span>
                    <span className="font-medium text-right text-xs">{receipt.warehouse.name}</span>
                  </div>
                  {receipt.warehouse.contactPerson && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('contactPerson')}:</span>
                      <span className="text-xs">{receipt.warehouse.contactPerson}</span>
                    </div>
                  )}
                  {receipt.supplier && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('supplierName')}:</span>
                      <span className="font-medium text-right">{receipt.supplier}</span>
                    </div>
                  )}
                  {receipt.poNos && receipt.poNos.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('poNo')}:</div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {receipt.poNos.map((poNo, idx) => {
                          const poId = receipt.poIds?.[idx]
                          return (
                            <Button 
                              key={idx}
                              variant="link" 
                              className="h-auto p-0 text-xs font-mono" 
                              onClick={() => poId && router.push(`/purchase/po/${poId}`)}
                            >
                              {poNo}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 运输信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-orange-600" />
                  {t('transportInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 text-xs">
                  {receipt.transportMode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('transportMode')}:</span>
                      <span className="font-medium">{t(receipt.transportMode.toLowerCase())}</span>
                    </div>
                  )}
                  {receipt.carrier && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('carrier')}:</span>
                      <span className="font-medium">{receipt.carrier}</span>
                    </div>
                  )}
                  {receipt.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('trackingNo')}:</span>
                      <span className="font-mono text-xs">{receipt.trackingNumber}</span>
                    </div>
                  )}
                  {receipt.appointmentTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('appointmentTime')}:</span>
                      <span className="text-xs">{new Date(receipt.appointmentTime).toLocaleDateString()}</span>
                    </div>
                  )}
                  {receipt.inYardTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('inYardTime')}:</span>
                      <span className="text-xs">{new Date(receipt.inYardTime).toLocaleDateString()}</span>
                    </div>
                  )}
                  {/* FTL/LTL 相关字段 */}
                  {(receipt.transportMode === "FTL" || receipt.transportMode === "LTL") && (
                    <>
                      {receipt.trailerNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('trailerNo')}:</span>
                          <span className="font-mono text-xs">{receipt.trailerNo}</span>
                        </div>
                      )}
                      {receipt.trailerSize && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('trailerSize')}:</span>
                          <span className="text-xs">{receipt.trailerSize}</span>
                        </div>
                      )}
                      {receipt.sealNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('sealNo')}:</span>
                          <span className="font-mono text-xs">{receipt.sealNo}</span>
                        </div>
                      )}
                      {receipt.bol && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('bol')}:</span>
                          <span className="font-mono text-xs">{receipt.bol}</span>
                        </div>
                      )}
                      {receipt.licensePlate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('licensePlate')}:</span>
                          <span className="font-mono text-xs">{receipt.licensePlate}</span>
                        </div>
                      )}
                      {receipt.driverName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('driverName')}:</span>
                          <span className="text-xs">{receipt.driverName}</span>
                        </div>
                      )}
                      {receipt.driverPhone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('driverPhone')}:</span>
                          <span className="text-xs">{receipt.driverPhone}</span>
                        </div>
                      )}
                      {receipt.proNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('proNumber')}:</span>
                          <span className="font-mono text-xs">{receipt.proNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* AIR_CARGO 相关字段 */}
                  {receipt.transportMode === "AIR_CARGO" && (
                    <>
                      {receipt.mawb && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MAWB:</span>
                          <span className="font-mono text-xs">{receipt.mawb}</span>
                        </div>
                      )}
                      {receipt.hawb && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HAWB:</span>
                          <span className="font-mono text-xs">{receipt.hawb}</span>
                        </div>
                      )}
                      {receipt.flightNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('flightNo')}:</span>
                          <span className="font-mono text-xs">{receipt.flightNo}</span>
                        </div>
                      )}
                      {receipt.airlineCode && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('airlineCode')}:</span>
                          <span className="text-xs">{receipt.airlineCode}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* OCEAN_FCL/OCEAN_LCL 相关字段 */}
                  {(receipt.transportMode === "OCEAN_FCL" || receipt.transportMode === "OCEAN_LCL") && (
                    <>
                      {receipt.mbl && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">MBL:</span>
                          <span className="font-mono text-xs">{receipt.mbl}</span>
                        </div>
                      )}
                      {receipt.hbl && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">HBL:</span>
                          <span className="font-mono text-xs">{receipt.hbl}</span>
                        </div>
                      )}
                      {receipt.vessel && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('vessel')}:</span>
                          <span className="text-xs">{receipt.vessel}</span>
                        </div>
                      )}
                      {receipt.voyage && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('voyage')}:</span>
                          <span className="font-mono text-xs">{receipt.voyage}</span>
                        </div>
                      )}
                      {receipt.containerNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('containerNo')}:</span>
                          <span className="font-mono text-xs">{receipt.containerNo}</span>
                        </div>
                      )}
                      {receipt.containerSize && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('containerSize')}:</span>
                          <span className="text-xs">{receipt.containerSize}</span>
                        </div>
                      )}
                      {receipt.sealNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('sealNo')}:</span>
                          <span className="font-mono text-xs">{receipt.sealNo}</span>
                        </div>
                      )}
                      {receipt.transportMode === "OCEAN_LCL" && receipt.consolidationWarehouse && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('consolidationWarehouse')}:</span>
                          <span className="text-xs">{receipt.consolidationWarehouse}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* RAIL 相关字段 */}
                  {receipt.transportMode === "RAIL" && (
                    <>
                      {receipt.trainNo && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('trainNo')}:</span>
                          <span className="font-mono text-xs">{receipt.trainNo}</span>
                        </div>
                      )}
                      {receipt.railCarNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('railCarNumber')}:</span>
                          <span className="font-mono text-xs">{receipt.railCarNumber}</span>
                        </div>
                      )}
                      {receipt.operator && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('operator')}:</span>
                          <span className="text-xs">{receipt.operator}</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* INTERMODAL 相关字段 */}
                  {receipt.transportMode === "INTERMODAL" && receipt.containerNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('containerNo')}:</span>
                      <span className="font-mono text-xs">{receipt.containerNo}</span>
                    </div>
                  )}
                  {/* INTERNAL/VIRTUAL 相关字段 */}
                  {(receipt.transportMode === "INTERNAL" || receipt.transportMode === "VIRTUAL") && receipt.internalShipmentNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('internalShipmentNo')}:</span>
                      <span className="font-mono text-xs">{receipt.internalShipmentNo}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 收货汇总 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  {t('receivingSummary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('expectedQty')}:</span>
                    <span className="font-medium">{receipt.expectedQty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('receivedQty')}:</span>
                    <span className="font-medium text-green-600">{receipt.receivedQty.toLocaleString()}</span>
                  </div>
                  {receipt.receivedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('receivedBy')}:</span>
                      <span className="text-xs">{receipt.receivedBy}</span>
                    </div>
                  )}
                  {receipt.receivedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('receivedDate')}:</span>
                      <span className="text-xs">{new Date(receipt.receivedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {receipt.relatedReceiptConfirms && receipt.relatedReceiptConfirms.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('receiptNo')}:</div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {receipt.relatedReceiptConfirms.map((rc, idx) => (
                          <Button 
                            key={idx}
                            variant="link" 
                            className="h-auto p-0 text-xs font-mono" 
                            onClick={() => router.push(`/purchase/receipt-confirm/${rc.receiptConfirmId}`)}
                          >
                            {rc.receiptConfirmNo}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="lines">{t('productLines') || '商品明细'}</TabsTrigger>
              <TabsTrigger value="receiptConfirm">{t('receiptLines')}</TabsTrigger>
              <TabsTrigger value="transport">{t('transportInfo')}</TabsTrigger>
              <TabsTrigger value="purchase">{t('purchaseInfo') || '采购信息'}</TabsTrigger>
            </TabsList>

            {/* 商品明细 */}
            <TabsContent value="lines" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('productLines') || '商品明细'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{t('lineNo')}</TableHead>
                        <TableHead>{t('item')}</TableHead>
                        <TableHead className="text-center">{t('poNo')}</TableHead>
                        <TableHead className="text-center">{t('orderedQty')}</TableHead>
                        <TableHead className="text-center">{t('receivedQty')}</TableHead>
                        <TableHead className="text-center">{t('thisReceiptQty')}</TableHead>
                        <TableHead className="text-center">{t('palletCount')}</TableHead>
                        <TableHead className="text-center">{t('location')}</TableHead>
                        <TableHead className="text-center">{t('lotBatchNo')}</TableHead>
                        <TableHead className="text-center">{t('serialNo')}</TableHead>
                        <TableHead className="text-center">{t('uom')}</TableHead>
                        <TableHead>{t('remark')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receipt.receiptLines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <Badge variant="outline">{line.lineNo}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{line.itemName}</div>
                              <div className="text-xs text-muted-foreground">SKU: {line.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {line.poNo && (
                              <Button 
                                variant="link" 
                                className="h-auto p-0 text-xs" 
                                onClick={() => line.poNo && router.push(`/purchase/po/${receipt.poIds?.[0] || ''}`)}
                              >
                                {line.poNo}
                                {line.poLineNo && `-${line.poLineNo}`}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{line.orderedQty.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{line.receivedQty.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{line.thisReceiptQty.toLocaleString()}</TableCell>
                          <TableCell className="text-center">{line.palletCount || 0}</TableCell>
                          <TableCell className="text-center">{line.location || "-"}</TableCell>
                          <TableCell className="text-center">
                            {line.batchNo ? (
                              <Badge variant="outline" className="text-xs">{line.batchNo}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {line.serialNo ? (
                              <div className="text-xs">
                                {line.serialNo.split(',').slice(0, 3).map((sn, idx) => (
                                  <Badge key={idx} variant="outline" className="mr-1 mb-1">{sn.trim()}</Badge>
                                ))}
                                {line.serialNo.split(',').length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{line.serialNo.split(',').length - 3}</Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{line.uom}</TableCell>
                          <TableCell className="text-sm">{line.lineRemark || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 收货明细 */}
            <TabsContent value="receiptConfirm" className="space-y-4">
              {receipt.relatedReceiptConfirms && receipt.relatedReceiptConfirms.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('receiptLines')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('receiptConfirmNo')}</TableHead>
                          <TableHead className="text-center">{t('status')}</TableHead>
                          <TableHead className="text-center">{t('receivedQty')}</TableHead>
                          <TableHead>{t('receivedBy')}</TableHead>
                          <TableHead>{t('receivedDate')}</TableHead>
                          <TableHead>{t('created')}</TableHead>
                          <TableHead>{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipt.relatedReceiptConfirms.map((rc) => (
                          <TableRow key={rc.receiptConfirmId}>
                            <TableCell>
                              <Button 
                                variant="link" 
                                className="h-auto p-0 font-mono" 
                                onClick={() => router.push(`/purchase/receipt-confirm/${rc.receiptConfirmId}`)}
                              >
                                {rc.receiptConfirmNo}
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{rc.status}</Badge>
                            </TableCell>
                            <TableCell className="text-center">{rc.receivedQty.toLocaleString()}</TableCell>
                            <TableCell>{rc.receivedBy || '-'}</TableCell>
                            <TableCell>{new Date(rc.receivedDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(rc.created).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="link" 
                                className="h-auto p-0 text-xs" 
                                onClick={() => router.push(`/purchase/receipt-confirm/${rc.receiptConfirmId}`)}
                              >
                                {t('view')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {t('noReceiptConfirms') || '暂无收货明细'}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* 运输信息 */}
            <TabsContent value="transport" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('transportInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {receipt.transportMode && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('transportMode')}</Label>
                        <div className="text-sm font-medium">{t(receipt.transportMode.toLowerCase())}</div>
                      </div>
                    )}
                    {receipt.carrier && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('carrier')}</Label>
                        <div className="text-sm font-medium">{receipt.carrier}</div>
                      </div>
                    )}
                    {receipt.trackingNumber && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('trackingNo')}</Label>
                        <div className="text-sm font-medium">{receipt.trackingNumber}</div>
                      </div>
                    )}
                    {receipt.appointmentTime && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('appointmentTime')}</Label>
                        <div className="text-sm font-medium">{new Date(receipt.appointmentTime).toLocaleString()}</div>
                      </div>
                    )}
                    {receipt.inYardTime && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('inYardTime')}</Label>
                        <div className="text-sm font-medium">{new Date(receipt.inYardTime).toLocaleString()}</div>
                      </div>
                    )}
                    {receipt.trailerNo && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('trailerNo')}</Label>
                        <div className="text-sm font-medium">{receipt.trailerNo}</div>
                      </div>
                    )}
                    {receipt.trailerSize && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('trailerSize')}</Label>
                        <div className="text-sm font-medium">{receipt.trailerSize}</div>
                      </div>
                    )}
                    {receipt.sealNo && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('sealNo')}</Label>
                        <div className="text-sm font-medium">{receipt.sealNo}</div>
                      </div>
                    )}
                    {receipt.containerNo && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('containerNo')}</Label>
                        <div className="text-sm font-medium">{receipt.containerNo}</div>
                      </div>
                    )}
                    {receipt.containerSize && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('containerSize')}</Label>
                        <div className="text-sm font-medium">{receipt.containerSize}</div>
                      </div>
                    )}
                    {receipt.bol && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('bol')}</Label>
                        <div className="text-sm font-medium">{receipt.bol}</div>
                      </div>
                    )}
                    {receipt.mawb && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('mawb')}</Label>
                        <div className="text-sm font-medium">{receipt.mawb}</div>
                      </div>
                    )}
                    {receipt.hawb && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('hawb')}</Label>
                        <div className="text-sm font-medium">{receipt.hawb}</div>
                      </div>
                    )}
                    {receipt.vessel && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('vessel')}</Label>
                        <div className="text-sm font-medium">{receipt.vessel}</div>
                      </div>
                    )}
                    {receipt.voyage && (
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('voyage')}</Label>
                        <div className="text-sm font-medium">{receipt.voyage}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 采购信息 */}
            <TabsContent value="purchase" className="space-y-4">
              {/* PO单据 */}
              {receipt.relatedPOs && receipt.relatedPOs.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('relatedPOs')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('poNo')}</TableHead>
                          <TableHead>{t('supplierName')}</TableHead>
                          <TableHead className="text-center">{t('status')}</TableHead>
                          <TableHead className="text-center">{t('orderedQty')}</TableHead>
                          <TableHead className="text-center">{t('receivedQty')}</TableHead>
                          <TableHead className="text-center">{t('remainingQty')}</TableHead>
                          <TableHead>{t('created')}</TableHead>
                          <TableHead>{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipt.relatedPOs.map((po) => (
                          <TableRow key={po.poId}>
                            <TableCell>
                              <Button 
                                variant="link" 
                                className="h-auto p-0 font-mono" 
                                onClick={() => router.push(`/purchase/po/${po.poId}`)}
                              >
                                {po.poNo}
                              </Button>
                            </TableCell>
                            <TableCell>{po.supplierName}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{po.status}</Badge>
                            </TableCell>
                            <TableCell className="text-center">{po.orderedQty.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{po.receivedQty.toLocaleString()}</TableCell>
                            <TableCell className="text-center">{po.remainingQty.toLocaleString()}</TableCell>
                            <TableCell>{new Date(po.created).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="link" 
                                className="h-auto p-0 text-xs" 
                                onClick={() => router.push(`/purchase/po/${po.poId}`)}
                              >
                                {t('view')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {t('noRelatedPOs') || '暂无关联PO单据'}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* 收货对话框 - 包含SN、Lot数据 */}
          <Dialog open={showReceivingDialog} onOpenChange={setShowReceivingDialog}>
            <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('receiving')}</DialogTitle>
                <DialogDescription>
                  {t('inboundRequestNo')}: {receipt.receiptNo}
                  {receipt.receivedQty > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      ({t('receivedQty')}: {receipt.receivedQty} / {receipt.expectedQty})
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t('receiptLines')}</Label>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">{t('lineNo')}</TableHead>
                          <TableHead>{t('item')}</TableHead>
                          <TableHead className="text-center">{t('orderedQty')}</TableHead>
                          <TableHead className="text-center">{t('receivedQty')}</TableHead>
                          <TableHead className="text-center">{t('thisReceiptQty')} *</TableHead>
                          <TableHead className="text-center">{t('location')}</TableHead>
                          <TableHead className="text-center">{t('lotBatchNo')}</TableHead>
                          <TableHead className="text-center">{t('serialNo')}</TableHead>
                          <TableHead className="text-center">{t('uom')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receipt.receiptLines.map((line) => {
                          const maxQty = line.orderedQty - line.receivedQty
                          const receivingQty = receivingQuantities[line.id] || 0
                          const batchNo = receivingBatchNos[line.id] || ""
                          const serialNo = receivingSerialNos[line.id] || ""
                          const location = receivingLocations[line.id] || ""
                          return (
                            <TableRow key={line.id}>
                              <TableCell>
                                <Badge variant="outline">{line.lineNo}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">{line.itemName}</div>
                                  <div className="text-xs text-muted-foreground">SKU: {line.sku}</div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{line.orderedQty.toLocaleString()}</TableCell>
                              <TableCell className="text-center">{line.receivedQty.toLocaleString()}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min={0}
                                  max={maxQty}
                                  value={receivingQty}
                                  onChange={(e) => handleReceivingQtyChange(line.id, parseInt(e.target.value) || 0)}
                                  className="w-24 mx-auto"
                                  placeholder="0"
                                />
                                {maxQty > 0 && (
                                  <div className="text-xs text-muted-foreground text-center mt-1">
                                    {t('remainingQty')}: {maxQty}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={location}
                                  onChange={(e) => setReceivingLocations(prev => ({ ...prev, [line.id]: e.target.value }))}
                                  placeholder={t('enterLocation')}
                                  className="w-32 mx-auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={batchNo}
                                  onChange={(e) => setReceivingBatchNos(prev => ({ ...prev, [line.id]: e.target.value }))}
                                  placeholder={t('enterLotBatchNo')}
                                  className="w-32 mx-auto"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={serialNo}
                                  onChange={(e) => setReceivingSerialNos(prev => ({ ...prev, [line.id]: e.target.value }))}
                                  placeholder={t('enterSerialNo')}
                                  className="w-40 mx-auto"
                                />
                                <div className="text-xs text-muted-foreground text-center mt-1">
                                  {t('serialNoHint') || "多个用逗号分隔"}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{line.uom}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div>
                  <Label htmlFor="receivingNotes">{t('notes')}</Label>
                  <Textarea
                    id="receivingNotes"
                    value={receivingNotes}
                    onChange={(e) => setReceivingNotes(e.target.value)}
                    placeholder={t('enterNotes')}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowReceivingDialog(false)
                  setReceivingQuantities({})
                  setReceivingBatchNos({})
                  setReceivingSerialNos({})
                  setReceivingLocations({})
                  setReceivingNotes("")
                }}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleConfirmReceiving}>
                  {t('confirm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}
