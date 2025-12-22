"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  RefreshCw, Download, Edit, Eye, CheckCircle, Package, 
  Building2, Truck, FileText, ArrowLeft
} from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Receipt Confirm Detail接口 - 根据API报文结构
interface ReceiptConfirmDetail {
  receiptId: string
  receiptReferenceNo: string
  facility: number
  customer?: string
  carrierName?: string
  carrierScac?: string
  titleId?: string
  containerNo?: string
  poNo?: string
  receivedTime: number
  receiptType: "REGULAR_RECEIPT" | "RETURN" | "XDOCK"
  status: "CLOSED" | "PARTIAL" | "EXCEPTION"
  shippingMethod?: string
  inYardTime?: number
  containerSize?: string
  isResend?: boolean
  timeZone?: string
  receiveTaskId?: string
  inboundSeal?: string
  outboundSeal?: string
  sealMismatchFlag?: boolean
  photos?: string[]
  items: ReceiptConfirmLineItem[]
  // 兼容字段（用于显示）
  receiptNo?: string
  receiptConfirmNo?: string
  warehouse?: {
    name: string
    address?: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
      addressLine2?: string
    }
    contactPerson?: string
    contactPhone?: string
  }
  receivedBy?: string
  receivedDate?: string
  notes?: string
}

interface ReceiptConfirmLineItem {
  poLineNo: string
  itemId: string
  itemName: string
  expectedQty: number
  receivedQty: number
  receivedBaseQty: number
  palletQty: number
  uom: string
  goodsType: "GOOD" | "DAMAGE" | "RETURN"
  snList: string[]
  putawayLocation?: string
  differenceQty: number
  differenceType: "NONE" | "SHORT" | "OVER"
  reasonCode?: string
  qcStatus: "PASS" | "FAIL" | "SKIPPED"
  damageQty: number
  damageType?: string
  // 兼容字段
  id?: string
  lineNo?: number
  sku?: string
  location?: string
  batchNo?: string
  serialNo?: string
  qualityStatus?: "PASSED" | "FAILED" | "PARTIAL_DAMAGE"
  rejectedQty?: number
  lineRemark?: string
  palletCount?: number
}

// Mock数据 - 根据API报文结构
const mockReceiptConfirmDetail: ReceiptConfirmDetail = {
  receiptId: "RC-001",
  receiptReferenceNo: "RC-2024-001",
  receiptConfirmNo: "RC-2024-001",
  facility: 1001,
  customer: "ABC Company",
  carrierName: "FedEx",
  carrierScac: "FDEG",
  titleId: "TITLE-001",
  containerNo: "CONT-123456",
  poNo: "PO-2024-001",
  receivedTime: 1705747800000, // 2024-01-20T10:30:00Z
  receiptType: "REGULAR_RECEIPT",
  status: "PARTIAL",
  shippingMethod: "LTL",
  inYardTime: 1705746000000, // 2024-01-20T10:00:00Z
  containerSize: "40FT",
  isResend: false,
  timeZone: "America/Los_Angeles",
  receiveTaskId: "TASK-001",
  inboundSeal: "SEAL-IN-001",
  outboundSeal: "SEAL-OUT-001",
  sealMismatchFlag: false,
  photos: [],
  receiptNo: "RCP-2024-001",
  warehouse: {
    name: "Main Warehouse - Los Angeles",
    address: {
      street: "1234 Warehouse Blvd",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      country: "USA",
    },
    contactPerson: "John Warehouse",
    contactPhone: "+1-555-0101",
  },
  receivedBy: "John Smith",
  receivedDate: "2024-01-20T10:30:00Z",
  notes: "部分货物已收货，剩余货物预计明天到达",
  items: [
    {
      poLineNo: "1",
      itemId: "SKU-001",
      itemName: "Product A",
      expectedQty: 50,
      receivedQty: 30,
      receivedBaseQty: 30,
      palletQty: 2,
      uom: "EA",
      goodsType: "GOOD",
      snList: ["SN001", "SN002", "SN003"],
      putawayLocation: "A区-01-001",
      differenceQty: 0,
      differenceType: "NONE",
      qcStatus: "PASS",
      damageQty: 0,
      // 兼容字段
      id: "line1",
      lineNo: 1,
      sku: "SKU-001",
      location: "A区-01-001",
      batchNo: "BATCH-2024-001",
      serialNo: "SN001,SN002,SN003",
      qualityStatus: "PASSED",
      palletCount: 2,
      lineRemark: "Good condition",
    },
    {
      poLineNo: "2",
      itemId: "SKU-002",
      itemName: "Product B",
      expectedQty: 50,
      receivedQty: 50,
      receivedBaseQty: 50,
      palletQty: 3,
      uom: "EA",
      goodsType: "GOOD",
      snList: ["SN101", "SN102", "SN103"],
      putawayLocation: "A区-01-002",
      differenceQty: 0,
      differenceType: "NONE",
      qcStatus: "PASS",
      damageQty: 0,
      // 兼容字段
      id: "line2",
      lineNo: 2,
      sku: "SKU-002",
      location: "A区-01-002",
      batchNo: "BATCH-2024-002",
      serialNo: "SN101,SN102,SN103",
      qualityStatus: "PASSED",
      palletCount: 3,
    },
    {
      poLineNo: "3",
      itemId: "SKU-003",
      itemName: "Product C",
      expectedQty: 50,
      receivedQty: 0,
      receivedBaseQty: 0,
      palletQty: 0,
      uom: "EA",
      goodsType: "GOOD",
      snList: [],
      differenceQty: 50,
      differenceType: "SHORT",
      reasonCode: "NOT_RECEIVED",
      qcStatus: "SKIPPED",
      damageQty: 0,
      // 兼容字段
      id: "line3",
      lineNo: 3,
      sku: "SKU-003",
    },
  ],
}

interface ReceiptConfirmDetailPageProps {
  params: {
    id: string
  }
}

export default function ReceiptConfirmDetailPage({ params }: ReceiptConfirmDetailPageProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  
  const confirm = mockReceiptConfirmDetail // In real app, fetch by params.id
  const sidebarItems = createPurchaseSidebarItems(t)

  // Status configurations
  const statusConfig = {
    CLOSED: { label: t('CLOSED'), color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" },
    PARTIAL: { label: t('PARTIALLY_RECEIVED'), color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200" },
    EXCEPTION: { label: t('EXCEPTION'), color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200" },
  }

  // Receipt Type configurations
  const receiptTypeConfig = {
    REGULAR_RECEIPT: { label: t('REGULAR_RECEIPT'), color: "bg-blue-100 text-blue-800" },
    RETURN: { label: t('RETURN'), color: "bg-orange-100 text-orange-800" },
    XDOCK: { label: t('XDOCK'), color: "bg-purple-100 text-purple-800" },
  }

  // 刷新数据
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // 格式化地址
  const formatAddress = (address: ReceiptConfirmDetail['warehouse']['address']) => {
    if (!address) return ""
    const parts = [
      address.street,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country,
    ].filter(Boolean)
    return parts.join("\n")
  }

  return (
    <TooltipProvider>
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">{confirm.receiptReferenceNo || confirm.receiptConfirmNo}</h1>
                  <Badge className={statusConfig[confirm.status]?.color || "bg-gray-100 text-gray-800"}>
                    {statusConfig[confirm.status]?.label || confirm.status}
                  </Badge>
                  <Badge className={receiptTypeConfig[confirm.receiptType]?.color || "bg-gray-100 text-gray-800"}>
                    {receiptTypeConfig[confirm.receiptType]?.label || confirm.receiptType}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {confirm.receiptNo && `${t('inboundRequestNo')}: ${confirm.receiptNo}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
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
              <Button variant="outline" onClick={() => {
                console.log("Download receipt confirm:", confirm.receiptId)
                // TODO: 实现下载收货确认单的逻辑
              }}>
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
            </div>
          </div>

          {/* 核心信息 - 3列布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* 基本信息 */}
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
                    <span className="text-muted-foreground">{t('receiptReferenceNo')}:</span>
                    <span className="font-mono text-xs font-medium">{confirm.receiptReferenceNo || confirm.receiptConfirmNo}</span>
                  </div>
                  {confirm.receiptNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('inboundRequestNo')}:</span>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-xs font-mono" 
                        onClick={() => router.push(`/purchase/receipts/${confirm.receiptId}`)}
                      >
                        {confirm.receiptNo}
                      </Button>
                    </div>
                  )}
                  {confirm.customer && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('customer')}:</span>
                      <span className="font-medium text-right">{confirm.customer}</span>
                    </div>
                  )}
                  {confirm.poNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('poNo')}:</span>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-xs font-mono" 
                        onClick={() => router.push(`/purchase/po/${confirm.poNo}`)}
                      >
                        {confirm.poNo}
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('facility')}:</span>
                    <span className="font-medium text-right text-xs">{confirm.warehouse?.name || `Facility ${confirm.facility}`}</span>
                  </div>
                  {confirm.warehouse?.contactPerson && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('contactPerson')}:</span>
                      <span className="text-xs">{confirm.warehouse.contactPerson}</span>
                    </div>
                  )}
                  {confirm.carrierName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('carrierName')}:</span>
                      <span className="text-xs">{confirm.carrierName}</span>
                    </div>
                  )}
                  {confirm.containerNo && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('containerNo')}:</span>
                      <span className="font-mono text-xs">{confirm.containerNo}</span>
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
                  {confirm.items && confirm.items.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('expectedQty')}:</span>
                        <span className="font-medium">{confirm.items.reduce((sum, item) => sum + item.expectedQty, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('receivedQty')}:</span>
                        <span className="font-medium text-green-600">{confirm.items.reduce((sum, item) => sum + item.receivedQty, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('totalLines')}:</span>
                        <span className="font-medium">{confirm.items.length}</span>
                      </div>
                    </>
                  )}
                  {confirm.receivedBy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('receivedBy')}:</span>
                      <span className="text-xs">{confirm.receivedBy}</span>
                    </div>
                  )}
                  {confirm.receivedTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('receivedTime')}:</span>
                      <span className="text-xs">{new Date(confirm.receivedTime).toLocaleString()}</span>
                    </div>
                  )}
                  {confirm.inYardTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('inYardTime')}:</span>
                      <span className="text-xs">{new Date(confirm.inYardTime).toLocaleString()}</span>
                    </div>
                  )}
                  {confirm.sealMismatchFlag && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('sealMismatchFlag')}:</span>
                      <Badge className="bg-red-100 text-red-800 text-xs">{t('yes')}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 仓库信息 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-600" />
                  {t('warehouse')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('warehouse')}:</span>
                    <span className="font-medium text-right text-xs">{confirm.warehouse.name}</span>
                  </div>
                  {confirm.warehouse.address && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('address')}:</div>
                      <div className="text-xs whitespace-pre-line text-right">
                        {formatAddress(confirm.warehouse.address)}
                      </div>
                    </div>
                  )}
                  {confirm.warehouse.contactPerson && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('contactPerson')}:</span>
                      <span className="text-xs">{confirm.warehouse.contactPerson}</span>
                    </div>
                  )}
                  {confirm.warehouse.contactPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('contactPhone') || '联系电话'}:</span>
                      <span className="text-xs">{confirm.warehouse.contactPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 收货明细 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('receiptLines')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">{t('poLineNo')}</TableHead>
                      <TableHead>{t('item')}</TableHead>
                      <TableHead className="text-center">{t('expectedQty')}</TableHead>
                      <TableHead className="text-center">{t('receivedQty')}</TableHead>
                      <TableHead className="text-center">{t('receivedBaseQty')}</TableHead>
                      <TableHead className="text-center">{t('palletQty')}</TableHead>
                      <TableHead className="text-center">{t('putawayLocation')}</TableHead>
                      <TableHead className="text-center">{t('differenceQty')}</TableHead>
                      <TableHead className="text-center">{t('differenceType')}</TableHead>
                      <TableHead className="text-center">{t('goodsType')}</TableHead>
                      <TableHead className="text-center">{t('qcStatus')}</TableHead>
                      <TableHead className="text-center">{t('damageQty')}</TableHead>
                      <TableHead className="text-center">{t('snList')}</TableHead>
                      <TableHead className="text-center">{t('uom')}</TableHead>
                      <TableHead>{t('reasonCode')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirm.items.map((line, index) => (
                      <TableRow key={line.id || line.itemId || index}>
                        <TableCell>
                          <Badge variant="outline">{line.poLineNo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{line.itemName}</div>
                            <div className="text-xs text-muted-foreground">ID: {line.itemId}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{line.expectedQty.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <span className={line.receivedQty > 0 ? "font-medium text-green-600" : ""}>
                            {line.receivedQty.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{line.receivedBaseQty.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{line.palletQty || 0}</TableCell>
                        <TableCell className="text-center">{line.putawayLocation || line.location || "-"}</TableCell>
                        <TableCell className="text-center">
                          {line.differenceQty !== 0 ? (
                            <span className={line.differenceQty > 0 ? "text-green-600" : "text-red-600"}>
                              {line.differenceQty > 0 ? "+" : ""}{line.differenceQty.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {line.differenceType !== "NONE" && (
                            <Badge 
                              variant="outline" 
                              className={
                                line.differenceType === "OVER" ? "bg-green-50 text-green-700" :
                                line.differenceType === "SHORT" ? "bg-red-50 text-red-700" :
                                "bg-gray-50 text-gray-700"
                              }
                            >
                              {t(line.differenceType)}
                            </Badge>
                          )}
                          {line.differenceType === "NONE" && <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={
                              line.goodsType === "GOOD" ? "bg-green-50 text-green-700" :
                              line.goodsType === "DAMAGE" ? "bg-red-50 text-red-700" :
                              "bg-orange-50 text-orange-700"
                            }
                          >
                            {t(line.goodsType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={
                              line.qcStatus === "PASS" ? "bg-green-50 text-green-700" :
                              line.qcStatus === "FAIL" ? "bg-red-50 text-red-700" :
                              "bg-gray-50 text-gray-700"
                            }
                          >
                            {t(line.qcStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {line.damageQty > 0 ? (
                            <span className="text-red-600 font-medium">{line.damageQty.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {line.snList && line.snList.length > 0 ? (
                            <div className="text-xs">
                              {line.snList.slice(0, 3).map((sn, idx) => (
                                <Badge key={idx} variant="outline" className="mr-1 mb-1">{sn}</Badge>
                              ))}
                              {line.snList.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{line.snList.length - 3}</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">{line.uom}</TableCell>
                        <TableCell className="text-sm">{line.reasonCode || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* 备注 */}
            {confirm.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('notes')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{confirm.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </MainLayout>
    </TooltipProvider>
  )
}

