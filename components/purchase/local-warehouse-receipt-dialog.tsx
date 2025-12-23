"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Package, AlertCircle, CheckCircle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

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

interface LocalWarehouseReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  po: POInfo | null
  onConfirm: (data: {
    poId: string
    poNo: string
    warehouseId: string
    warehouseName: string
    supplierName: string
    items: Array<{
      poLineNo: number
      itemId: string
      sku: string
      productName: string
      expectedQty: number
      receivedQty: number
      uom: string
      location?: string
      batchNo?: string
      serialNo?: string
      notes?: string
    }>
    remark?: string
  }) => void
}


export function LocalWarehouseReceiptDialog({
  open,
  onOpenChange,
  po,
  onConfirm,
}: LocalWarehouseReceiptDialogProps) {
  const { t } = useI18n()
  const [receivingQuantities, setReceivingQuantities] = React.useState<Record<string, number>>({})
  const [receivingLocations, setReceivingLocations] = React.useState<Record<string, string>>({})
  const [receivingBatchNos, setReceivingBatchNos] = React.useState<Record<string, string>>({})
  const [receivingSerialNos, setReceivingSerialNos] = React.useState<Record<string, string>>({})
  const [receivingNotes, setReceivingNotes] = React.useState<Record<string, string>>({})
  const [remark, setRemark] = React.useState("")
  const [errorMessage, setErrorMessage] = React.useState<string>("")
  const [successMessage, setSuccessMessage] = React.useState<string>("")
  const contentRef = React.useRef<HTMLDivElement>(null)

  // 当PO变化时，初始化数据
  React.useEffect(() => {
    if (po) {
      const initialQuantities: Record<string, number> = {}
      po.lineItems.forEach(item => {
        initialQuantities[item.id] = 0
      })
      setReceivingQuantities(initialQuantities)
      setReceivingLocations({})
      setReceivingBatchNos({})
      setReceivingSerialNos({})
      setReceivingNotes({})
      setRemark("")
      setErrorMessage("")
      setSuccessMessage("")
    }
  }, [po])

  // 处理收货数量变化
  const handleQuantityChange = (lineId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setReceivingQuantities(prev => ({
      ...prev,
      [lineId]: numValue
    }))
    // 清除错误信息
    if (errorMessage) {
      setErrorMessage("")
    }
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
      setErrorMessage(t('pleaseEnterReceivingQty') || "请输入收货数量")
      return false
    }

    // 验证收货数量不超过剩余数量
    const invalidLines = po.lineItems.filter(item => {
      const qty = receivingQuantities[item.id] || 0
      const maxQty = item.quantity - item.receivedQty
      return qty > maxQty
    })

    if (invalidLines.length > 0) {
      setErrorMessage(t('receivingQtyExceedsRemaining') || "收货数量不能超过剩余数量")
      return false
    }

    setErrorMessage("")
    return true
  }

  // 处理确认
  const handleConfirm = () => {
    if (!po) return
    if (!validateForm()) {
      // 滚动到顶部显示错误信息
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
      return
    }

    const receiptData = {
      poId: po.id,
      poNo: po.orderNo,
      warehouseId: po.warehouseId,
      warehouseName: po.warehouseName,
      supplierName: po.supplierName,
      items: po.lineItems.map(item => ({
        poLineNo: item.lineNo,
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

    // 显示成功消息
    setSuccessMessage(t('receiptCreatedSuccessfully') || "收货确认单创建成功，入库和收货已完成")
    setErrorMessage("")
    
    // 滚动到顶部显示成功消息
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    
    // 延迟关闭弹窗，让用户看到成功消息
    setTimeout(() => {
      onConfirm(receiptData)
      onOpenChange(false)
      setSuccessMessage("")
    }, 1500)
  }

  // 处理取消
  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!po) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('localWarehouseReceipt') || "本地仓库收货"}
          </DialogTitle>
          <DialogDescription>
            {t('localWarehouseOneStepComplete') || "本地仓库：一步完成入库和收货"}
          </DialogDescription>
        </DialogHeader>

        <div ref={contentRef} className="flex-1 overflow-y-auto px-6 space-y-4">
          {/* 成功提示 */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {/* 错误提示 */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* PO基本信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-md">
            <div>
              <Label className="text-muted-foreground text-xs">{t('poNo') || "PO编号"}</Label>
              <p className="font-medium text-sm">{po.orderNo}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('supplierName') || "供应商"}</Label>
              <p className="font-medium text-sm">{po.supplierName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('warehouseName') || "仓库"}</Label>
              <p className="font-medium text-sm">{po.warehouseName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">{t('warehouseType') || "仓库类型"}</Label>
              <p className="font-medium text-sm text-blue-600">{t('localWarehouse') || "本地仓库"}</p>
            </div>
          </div>

          {/* 收货明细 */}
          <div className="border rounded-md">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-medium text-sm">{t('receivingDetails') || "收货明细"}</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">{t('lineNo') || "行号"}</TableHead>
                    <TableHead className="min-w-[120px]">{t('sku') || "SKU"}</TableHead>
                    <TableHead className="min-w-[150px]">{t('productName') || "产品名称"}</TableHead>
                    <TableHead className="min-w-[120px]">{t('specifications') || "规格"}</TableHead>
                    <TableHead className="w-24">{t('orderedQty') || "订购数量"}</TableHead>
                    <TableHead className="w-24">{t('receivedQty') || "已收货"}</TableHead>
                    <TableHead className="w-32 text-red-600">{t('receivingQty') || "收货数量 *"}</TableHead>
                    <TableHead className="w-20">{t('uom') || "单位"}</TableHead>
                    <TableHead className="w-32">{t('location') || "库位"}</TableHead>
                    <TableHead className="w-32">{t('batchNo') || "批次号"}</TableHead>
                    <TableHead className="w-32">{t('serialNo') || "序列号"}</TableHead>
                    <TableHead className="w-40">{t('notes') || "备注"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {po.lineItems.map((item) => {
                    const remainingQty = item.quantity - item.receivedQty
                    const receivingQty = receivingQuantities[item.id] || 0
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <span className="font-medium text-sm">{item.lineNo}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs">{item.skuCode}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm">{item.productName}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{item.specifications}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.quantity.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{item.receivedQty.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max={remainingQty}
                            value={receivingQty}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-full h-8 text-sm"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('remaining') || "剩余"}: {remainingQty.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{item.uom}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingLocations[item.id] || ""}
                            onChange={(e) => handleLocationChange(item.id, e.target.value)}
                            className="w-full h-8 text-sm"
                            placeholder={t('enterLocation') || "输入库位"}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingBatchNos[item.id] || ""}
                            onChange={(e) => handleBatchNoChange(item.id, e.target.value)}
                            className="w-full h-8 text-sm"
                            placeholder={t('enterBatchNo') || "输入批次号"}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingSerialNos[item.id] || ""}
                            onChange={(e) => handleSerialNoChange(item.id, e.target.value)}
                            className="w-full h-8 text-sm"
                            placeholder={t('enterSerialNo') || "输入序列号"}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            value={receivingNotes[item.id] || ""}
                            onChange={(e) => handleNoteChange(item.id, e.target.value)}
                            className="w-full h-8 text-sm"
                            placeholder={t('enterNotes') || "输入备注"}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label>{t('remark') || "备注"}</Label>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="min-h-[80px]"
              placeholder={t('enterRemark') || "请输入备注"}
            />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background">
          <Button variant="outline" onClick={handleCancel}>
            {t('cancel') || "取消"}
          </Button>
          <Button onClick={handleConfirm}>
            {t('saveAndComplete') || "保存并完成"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

