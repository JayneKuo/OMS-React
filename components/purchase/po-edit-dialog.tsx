"use client"

import * as React from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Edit, Info, Loader2, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"

export interface VendorPOLineItem {
  sourceLineNo: number
  skuCode: string
  productName: string
  quantity: number
  uom: string
}

export interface VendorOption {
  code: string
  name: string
}

export interface VendorPOData {
  id: string
  vendorPoNo: string
  vendorName: string
  vendorCode: string
  status: string
  routeType: string
  shipFromWarehouseName: string
  targetWarehouseName: string
  masterReceiptNo: string
  lines: VendorPOLineItem[]
}

interface POEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poData: VendorPOData
  vendorOptions: VendorOption[]
  onSave?: (updatedData: VendorPOData) => void
}

const getLineKey = (item: VendorPOLineItem) => `${item.sourceLineNo}-${item.skuCode}`

export function POEditDialog({ open, onOpenChange, poData, vendorOptions, onSave }: POEditDialogProps) {
  const [editedVendorCode, setEditedVendorCode] = React.useState("")
  const [editedItems, setEditedItems] = React.useState<VendorPOLineItem[]>([])
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [confirmReplaceVendorOpen, setConfirmReplaceVendorOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      return
    }

    setEditedVendorCode(poData.vendorCode)
    setEditedItems(poData.lines.map((item) => ({ ...item })))
    setErrors({})
    setConfirmReplaceVendorOpen(false)
  }, [open, poData])

  const selectedVendor = React.useMemo(
    () => vendorOptions.find((vendor) => vendor.code === editedVendorCode),
    [editedVendorCode, vendorOptions]
  )

  const vendorChanged = editedVendorCode !== poData.vendorCode

  const handleQuantityChange = (itemKey: string, newValue: string) => {
    const nextQty = Number.parseInt(newValue, 10)

    setEditedItems((prev) => prev.map((item) => (
      getLineKey(item) === itemKey
        ? { ...item, quantity: Number.isNaN(nextQty) ? 0 : nextQty }
        : item
    )))

    setErrors((prev) => {
      const nextErrors = { ...prev }
      if (Number.isNaN(nextQty) || nextQty <= 0) {
        nextErrors[itemKey] = "数量必须大于 0"
      } else {
        delete nextErrors[itemKey]
      }
      return nextErrors
    })
  }

  const handleDeleteLine = (itemKey: string) => {
    setEditedItems((prev) => prev.filter((item) => getLineKey(item) !== itemKey))
    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors[itemKey]
      return nextErrors
    })
  }

  const doSave = async () => {
    setIsLoading(true)
    toast.loading("正在保存调拨执行单...", { id: "save-vendor-po" })

    await new Promise((resolve) => setTimeout(resolve, 800))

    const updatedData: VendorPOData = {
      ...poData,
      vendorCode: selectedVendor?.code ?? editedVendorCode,
      vendorName: selectedVendor?.name ?? poData.vendorName,
      lines: editedItems,
    }

    onSave?.(updatedData)
    toast.success(vendorChanged ? "调拨执行单已更新，原执行链路将先取消" : "调拨执行单已保存", { id: "save-vendor-po" })
    setIsLoading(false)
    setConfirmReplaceVendorOpen(false)
    onOpenChange(false)
  }

  const handleSave = async () => {
    if (!selectedVendor) {
      toast.error("请选择发货方")
      return
    }

    if (editedItems.length === 0) {
      toast.error("至少保留一条调拨明细")
      return
    }

    if (Object.keys(errors).length > 0) {
      toast.error("请先修正调拨数量后再保存")
      return
    }

    if (vendorChanged) {
      setConfirmReplaceVendorOpen(true)
      return
    }

    await doSave()
  }

  const totalQty = editedItems.reduce((sum, item) => sum + item.quantity, 0)
  const hasChanges =
    vendorChanged || JSON.stringify(editedItems) !== JSON.stringify(poData.lines)

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              调整调拨执行单 - {poData.vendorPoNo}
            </DialogTitle>
            <DialogDescription>
              可直接调整发货方、调拨数量或移除执行明细。
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-auto pr-1">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                <Info className="mt-0.5 h-4 w-4" />
                <div className="space-y-1">
                  <p className="font-medium">执行调整说明</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 当前弹窗用于维护调拨执行明细，不改变底层生成逻辑。</li>
                    <li>• 删除明细会从当前调拨执行单中移除该行。</li>
                    <li>• 若更换发货方，保存时会二次确认，并提示先取消原执行链路。</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm font-medium">发货方 / Source Party</div>
                <Select value={editedVendorCode} onValueChange={setEditedVendorCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择发货方" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorOptions.map((vendor) => (
                      <SelectItem key={vendor.code} value={vendor.code}>
                        {vendor.name} ({vendor.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                <div className="text-xs text-muted-foreground">当前执行状态</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline">{poData.status}</Badge>
                  {vendorChanged && <Badge className="bg-amber-100 text-amber-800">发货方已变更</Badge>}
                </div>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div>来源仓: {poData.shipFromWarehouseName}</div>
                  <div>目标仓: {poData.targetWarehouseName}</div>
                  <div>路径: {poData.routeType === "VIA_FG" ? "经中转/成品仓" : "直接调拨"}</div>
                  <div>主入库单: {poData.masterReceiptNo}</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-20">Line</TableHead>
                    <TableHead>SKU / Product</TableHead>
                    <TableHead className="w-36 text-center">Qty</TableHead>
                    <TableHead className="w-24 text-center">UOM</TableHead>
                    <TableHead className="w-24 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedItems.map((item) => {
                    const itemKey = getLineKey(item)
                    const hasError = Boolean(errors[itemKey])

                    return (
                      <TableRow key={itemKey} className={hasError ? "bg-red-50 dark:bg-red-900/10" : undefined}>
                        <TableCell>
                          <Badge variant="outline">{String(item.sourceLineNo).padStart(2, "0")}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{item.skuCode}</div>
                            <div className="text-sm text-muted-foreground">{item.productName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(event) => handleQuantityChange(itemKey, event.target.value)}
                              className={`text-center ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {hasError && <p className="text-xs text-red-600 dark:text-red-400">{errors[itemKey]}</p>}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.uom}</TableCell>
                        <TableCell className="text-right">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                onClick={() => handleDeleteLine(itemKey)}
                                disabled={isLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>删除此调拨明细</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm md:grid-cols-4">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">执行明细</span>
                <span className="font-medium">{editedItems.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">总调拨数量</span>
                <span className="font-medium">{totalQty}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">发货方</span>
                <span className="font-medium">{selectedVendor?.name ?? "-"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">目标仓</span>
                <span className="font-medium">{poData.targetWarehouseName}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存调拨调整
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReplaceVendorOpen} onOpenChange={setConfirmReplaceVendorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              确认切换发货方
            </AlertDialogTitle>
            <AlertDialogDescription>
              切换发货方后，系统会先取消原执行链路，再按新的发货方重建当前调拨执行单。
              <br />
              <span className="mt-2 block text-xs text-muted-foreground">
                原发货方：{poData.vendorName}（{poData.vendorCode}）
                <br />
                新发货方：{selectedVendor?.name}（{selectedVendor?.code}）
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>返回修改</AlertDialogCancel>
            <AlertDialogAction onClick={doSave} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认切换"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}

export default POEditDialog
