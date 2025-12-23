"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Package } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { createPurchaseSidebarItems } from "@/lib/purchase-sidebar-items"

// PO Line Item Interface
interface POLineItem {
  id: string
  lineNo: number
  skuCode: string
  productName: string
  specifications: string
  quantity: number
  uom: string
  receivedQty: number // 已收货数量
}

// PO Info Interface
interface POInfo {
  id: string
  orderNo: string
  supplierName: string
  warehouseName: string
  warehouseId: string
  lineItems: POLineItem[]
}

// Mock PO Data
const mockPOs: Record<string, POInfo> = {
  "1": {
    id: "1",
    orderNo: "PO202403150001",
    supplierName: "ABC Suppliers Inc.",
    warehouseName: "Main Warehouse",
    warehouseId: "WH001",
    lineItems: [
      {
        id: "1",
        lineNo: 1,
        skuCode: "SKU001",
        productName: "iPhone 15 Pro",
        specifications: "256GB, Natural Titanium",
        quantity: 100,
        uom: "PCS",
        receivedQty: 0,
      },
      {
        id: "2",
        lineNo: 2,
        skuCode: "SKU002",
        productName: "MacBook Pro",
        specifications: "14-inch, M3 Pro, 512GB SSD",
        quantity: 50,
        uom: "PCS",
        receivedQty: 0,
      },
    ],
  },
  "2": {
    id: "2",
    orderNo: "PO202403150002",
    supplierName: "Global Trading Co.",
    warehouseName: "East DC",
    warehouseId: "WH002",
    lineItems: [
      {
        id: "1",
        lineNo: 1,
        skuCode: "SKU003",
        productName: "iPad Air",
        specifications: "11-inch, M2, 256GB",
        quantity: 200,
        uom: "PCS",
        receivedQty: 0,
      },
    ],
  },
  "8": {
    id: "8",
    orderNo: "PO202403150008",
    supplierName: "Digital Products Co.",
    warehouseName: "West FC",
    warehouseId: "WH003",
    lineItems: [
      {
        id: "1",
        lineNo: 1,
        skuCode: "SKU004",
        productName: "AirPods Pro",
        specifications: "2nd Generation, USB-C",
        quantity: 300,
        uom: "PCS",
        receivedQty: 0,
      },
      {
        id: "2",
        lineNo: 2,
        skuCode: "SKU005",
        productName: "Apple Watch Series 9",
        specifications: "45mm, GPS, Midnight",
        quantity: 150,
        uom: "PCS",
        receivedQty: 0,
      },
      {
        id: "3",
        lineNo: 3,
        skuCode: "SKU006",
        productName: "Magic Keyboard",
        specifications: "For iPad Pro 12.9-inch",
        quantity: 150,
        uom: "PCS",
        receivedQty: 0,
      },
    ],
  },
}

export default function CreateReceiptConfirmPage() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const poId = searchParams.get("poId")
  const sidebarItems = createPurchaseSidebarItems(t)

  const [po, setPO] = React.useState<POInfo | null>(null)
  const [receivingQuantities, setReceivingQuantities] = React.useState<Record<string, number>>({})
  const [receivingLocations, setReceivingLocations] = React.useState<Record<string, string>>({})
  const [receivingBatchNos, setReceivingBatchNos] = React.useState<Record<string, string>>({})
  const [receivingSerialNos, setReceivingSerialNos] = React.useState<Record<string, string>>({})
  const [receivingNotes, setReceivingNotes] = React.useState<Record<string, string>>({})
  const [remark, setRemark] = React.useState("")

  // 加载PO数据
  React.useEffect(() => {
    if (poId && mockPOs[poId]) {
      setPO(mockPOs[poId])
      // 初始化收货数量为0
      const initialQuantities: Record<string, number> = {}
      mockPOs[poId].lineItems.forEach(item => {
        initialQuantities[item.id] = 0
      })
      setReceivingQuantities(initialQuantities)
    } else if (poId) {
      // 实际应用中应该调用API获取PO数据
      console.warn("PO not found:", poId)
    }
  }, [poId])

  // 处理收货数量变化
  const handleQuantityChange = (lineId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setReceivingQuantities(prev => ({
      ...prev,
      [lineId]: numValue
    }))
  }

  // 处理库位变化
  const handleLocationChange = (lineId: string, value: string) => {
    setReceivingLocations(prev => ({
      ...prev,
      [lineId]: value
    }))
  }

  // 处理批次号变化
  const handleBatchNoChange = (lineId: string, value: string) => {
    setReceivingBatchNos(prev => ({
      ...prev,
      [lineId]: value
    }))
  }

  // 处理序列号变化
  const handleSerialNoChange = (lineId: string, value: string) => {
    setReceivingSerialNos(prev => ({
      ...prev,
      [lineId]: value
    }))
  }

  // 处理备注变化
  const handleNoteChange = (lineId: string, value: string) => {
    setReceivingNotes(prev => ({
      ...prev,
      [lineId]: value
    }))
  }

  // 验证表单
  const validateForm = () => {
    if (!po) return false
    
    // 检查是否有至少一条明细行的收货数量大于0
    const hasAnyQty = po.lineItems.some(item => {
      const qty = receivingQuantities[item.id] || 0
      return qty > 0
    })

    if (!hasAnyQty) {
      alert(t('pleaseEnterReceivingQty') || "请输入收货数量")
      return false
    }

    // 验证收货数量不超过剩余数量
    const invalidLines = po.lineItems.filter(item => {
      const qty = receivingQuantities[item.id] || 0
      const maxQty = item.quantity - item.receivedQty
      return qty > maxQty
    })

    if (invalidLines.length > 0) {
      alert(t('receivingQtyExceedsRemaining') || "收货数量不能超过剩余数量")
      return false
    }

    return true
  }

  // 保存并完成入库和收货
  const handleSave = () => {
    if (!po || !validateForm()) return

    const receiptConfirmData = {
      poId: po.id,
      poNo: po.orderNo,
      warehouseId: po.warehouseId,
      warehouseName: po.warehouseName,
      supplierName: po.supplierName,
      receivedTime: Date.now(),
      receiptType: "REGULAR_RECEIPT" as const,
      status: "CLOSED" as const,
      items: po.lineItems.map(item => ({
        poLineNo: item.lineNo.toString(),
        itemId: item.skuCode,
        sku: item.skuCode,
        productName: item.productName,
        expectedQty: item.quantity - item.receivedQty,
        receivedQty: receivingQuantities[item.id] || 0,
        uom: item.uom,
        location: receivingLocations[item.id] || "",
        batchNo: receivingBatchNos[item.id] || "",
        serialNo: receivingSerialNos[item.id] || "",
        notes: receivingNotes[item.id] || "",
      })).filter(item => item.receivedQty > 0), // 只包含有收货数量的行
      remark,
    }

    console.log("Create Receipt Confirm (Virtual Warehouse - One Step Complete):", receiptConfirmData)

    // 实际应用中应该调用API创建收货确认单并完成入库和收货
    // 这里模拟成功后跳转
    alert(t('receiptCreatedSuccessfully') || "收货确认单创建成功，入库和收货已完成")
    router.push("/purchase/receipt-confirm")
  }

  if (!po) {
    return (
      <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-muted-foreground">{t('poNotFound') || "采购订单不存在"}</p>
            <Button variant="outline" onClick={() => router.push("/purchase/po")} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToPOList') || "返回采购订单列表"}
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('createReceiptConfirm') || "创建收货确认（虚拟仓库）"}</h1>
            <p className="text-muted-foreground">
              {t('virtualWarehouseOneStepComplete') || "虚拟仓库：一步完成入库和收货"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/purchase/po")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('back') || "返回"}
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {t('saveAndComplete') || "保存并完成"}
            </Button>
          </div>
        </div>

        {/* PO基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('poInfo') || "采购订单信息"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">{t('poNo') || "PO编号"}</Label>
                <p className="font-medium">{po.orderNo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('supplierName') || "供应商"}</Label>
                <p className="font-medium">{po.supplierName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('warehouseName') || "仓库"}</Label>
                <p className="font-medium">{po.warehouseName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('warehouseType') || "仓库类型"}</Label>
                <p className="font-medium text-blue-600">{t('virtualWarehouse') || "虚拟仓库"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 收货明细 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('receivingDetails') || "收货明细"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t('lineNo') || "行号"}</TableHead>
                    <TableHead>{t('sku') || "SKU"}</TableHead>
                    <TableHead>{t('productName') || "产品名称"}</TableHead>
                    <TableHead>{t('specifications') || "规格"}</TableHead>
                    <TableHead>{t('orderedQty') || "订购数量"}</TableHead>
                    <TableHead>{t('receivedQty') || "已收货数量"}</TableHead>
                    <TableHead className="text-red-600">{t('receivingQty') || "收货数量 *"}</TableHead>
                    <TableHead>{t('uom') || "单位"}</TableHead>
                    <TableHead>{t('location') || "库位"}</TableHead>
                    <TableHead>{t('batchNo') || "批次号"}</TableHead>
                    <TableHead>{t('serialNo') || "序列号"}</TableHead>
                    <TableHead>{t('notes') || "备注"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.lineItems.map((item) => {
                    const remainingQty = item.quantity - item.receivedQty
                    const receivingQty = receivingQuantities[item.id] || 0
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="font-medium">{item.lineNo}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{item.skuCode}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.productName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{item.specifications}</span>
                        </TableCell>
                        <TableCell>
                          <span>{item.quantity.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{item.receivedQty.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={remainingQty}
                            value={receivingQty}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-24"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('remaining') || "剩余"}: {remainingQty.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span>{item.uom}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingLocations[item.id] || ""}
                            onChange={(e) => handleLocationChange(item.id, e.target.value)}
                            className="w-32"
                            placeholder={t('enterLocation') || "输入库位"}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingBatchNos[item.id] || ""}
                            onChange={(e) => handleBatchNoChange(item.id, e.target.value)}
                            className="w-32"
                            placeholder={t('enterBatchNo') || "输入批次号"}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingSerialNos[item.id] || ""}
                            onChange={(e) => handleSerialNoChange(item.id, e.target.value)}
                            className="w-32"
                            placeholder={t('enterSerialNo') || "输入序列号"}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingNotes[item.id] || ""}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            className="w-40"
                            placeholder={t('enterNotes') || "输入备注"}
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

        {/* 备注 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('remark') || "备注"}</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder={t('enterRemark') || "请输入备注"}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

