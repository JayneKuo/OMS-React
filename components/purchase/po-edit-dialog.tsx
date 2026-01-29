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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Trash2, AlertTriangle, Lock, Loader2, Edit, Save, Info
} from "lucide-react"
import { toast } from "sonner"

// 行项目类型
interface LineItem {
  id: string
  lineNo: number
  skuCode: string
  productName: string
  specifications: string
  quantity: number
  uom: string
  unitPrice: number
  lineAmount: number
  shippedQty: number
  receivedQty: number
  returnedQty: number
}

// PO 数据类型
interface POData {
  id: string
  orderNo: string
  status: string
  shippingStatus: string
  receivingStatus: string
  totalOrderQty: number
  shippedQty: number
  receivedQty: number
  lineItems: LineItem[]
  warehouseAddress?: string
  warehouseName?: string
}

interface POEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poData: POData
  onSave?: (updatedData: POData) => void
}

// 计算行的已执行实绩（底线）
const getExecutedQty = (item: LineItem) => {
  return Math.max(item.shippedQty, item.receivedQty)
}

// 校验数量修改
const validateQuantityChange = (newQty: number, executedQty: number) => {
  if (newQty < executedQty) {
    return {
      valid: false,
      message: `数量不能少于已执行实绩(${executedQty})。`
    }
  }
  return { valid: true, message: "" }
}

// 获取删除按钮配置
const getDeleteButtonConfig = (item: LineItem) => {
  const hasExecution = item.shippedQty > 0 || item.receivedQty > 0
  return hasExecution 
    ? { label: "结案", variant: "warning" as const, action: "close" as const, remainingQty: item.quantity - getExecutedQty(item) }
    : { label: "删除", variant: "destructive" as const, action: "delete" as const, remainingQty: item.quantity }
}

export function POEditDialog({ open, onOpenChange, poData, onSave }: POEditDialogProps) {
  const [editedItems, setEditedItems] = React.useState<LineItem[]>([])
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = React.useState(false)
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean
    type: "close_line" | "address_change" | "cancel_order" | "close_order" | null
    data?: any
  }>({ open: false, type: null })

  // 初始化编辑数据
  React.useEffect(() => {
    if (open && poData) {
      setEditedItems([...poData.lineItems])
      setErrors({})
    }
  }, [open, poData])

  // 处理数量修改
  const handleQuantityChange = (itemId: string, newValue: string) => {
    const newQty = parseInt(newValue) || 0
    const item = editedItems.find(i => i.id === itemId)
    if (!item) return

    const executedQty = getExecutedQty(item)
    const validation = validateQuantityChange(newQty, executedQty)

    if (!validation.valid) {
      setErrors(prev => ({ ...prev, [itemId]: validation.message }))
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[itemId]
        return newErrors
      })
    }

    setEditedItems(prev => prev.map(i => 
      i.id === itemId 
        ? { ...i, quantity: newQty, lineAmount: newQty * i.unitPrice }
        : i
    ))
  }

  // 处理删除/结案行
  const handleDeleteLine = (item: LineItem) => {
    const config = getDeleteButtonConfig(item)
    
    if (config.action === "close") {
      // 有实绩，弹出结案确认
      setConfirmDialog({
        open: true,
        type: "close_line",
        data: { item, remainingQty: config.remainingQty }
      })
    } else {
      // 无实绩，直接删除（后台尝试拦截）
      handleDeleteLineConfirm(item)
    }
  }

  // 确认删除行
  const handleDeleteLineConfirm = async (item: LineItem) => {
    setIsLoading(true)
    toast.loading("正在尝试拦截...", { id: "delete-line" })
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setEditedItems(prev => prev.filter(i => i.id !== item.id))
    toast.success("行项目已删除", { id: "delete-line" })
    setIsLoading(false)
  }

  // 确认结案行
  const handleCloseLineConfirm = async () => {
    if (!confirmDialog.data?.item) return
    
    setIsLoading(true)
    const { item, remainingQty } = confirmDialog.data
    
    toast.loading(`正在关闭剩余 ${remainingQty} 个...`, { id: "close-line" })
    
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 更新数量为已执行实绩
    const executedQty = getExecutedQty(item)
    setEditedItems(prev => prev.map(i => 
      i.id === item.id 
        ? { ...i, quantity: executedQty, lineAmount: executedQty * i.unitPrice }
        : i
    ))
    
    toast.success(`已关闭剩余 ${remainingQty} 个`, { id: "close-line" })
    setConfirmDialog({ open: false, type: null })
    setIsLoading(false)
  }

  // 保存修改
  const handleSave = async () => {
    // 检查是否有错误
    if (Object.keys(errors).length > 0) {
      toast.error("请先修正错误后再保存")
      return
    }

    setIsLoading(true)
    toast.loading("正在保存...", { id: "save-po" })

    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1500))

    const updatedData = {
      ...poData,
      lineItems: editedItems,
      totalOrderQty: editedItems.reduce((sum, item) => sum + item.quantity, 0)
    }

    onSave?.(updatedData)
    toast.success("保存成功", { id: "save-po" })
    setIsLoading(false)
    onOpenChange(false)
  }

  // 计算汇总
  const totalQty = editedItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = editedItems.reduce((sum, item) => sum + item.lineAmount, 0)
  const hasChanges = JSON.stringify(editedItems) !== JSON.stringify(poData.lineItems)

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              编辑 PO - {poData.orderNo}
            </DialogTitle>
            <DialogDescription>
              修改订单数量或删除行项目。已执行的实绩（已发货/已收货）不可逆。
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            {/* 提示信息 */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">编辑规则：</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• 数量不能少于已执行实绩（已发货或已收货的最大值）</li>
                    <li>• 有实绩的行只能"结案"，不能删除</li>
                    <li>• 增加数量无限制</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 行项目表格 */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-sm font-medium p-3 w-16">行号</TableHead>
                    <TableHead className="text-sm font-medium p-3">产品</TableHead>
                    <TableHead className="text-sm font-medium p-3 w-32 text-center">数量</TableHead>
                    <TableHead className="text-sm font-medium p-3 w-20 text-center">已发</TableHead>
                    <TableHead className="text-sm font-medium p-3 w-20 text-center">已收</TableHead>
                    <TableHead className="text-sm font-medium p-3 w-24 text-right">金额</TableHead>
                    <TableHead className="text-sm font-medium p-3 w-24 text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editedItems.map((item) => {
                    const executedQty = getExecutedQty(item)
                    const deleteConfig = getDeleteButtonConfig(item)
                    const hasError = !!errors[item.id]

                    return (
                      <TableRow key={item.id} className={hasError ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-muted/50"}>
                        <TableCell className="text-xs p-3">
                          <Badge variant="outline" className="text-xs">
                            {item.lineNo.toString().padStart(2, '0')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs p-3">
                          <div className="space-y-1">
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-muted-foreground">SKU: {item.skuCode}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs p-3">
                          <div className="space-y-1">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              min={executedQty}
                              className={`h-8 text-center ${hasError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {hasError && (
                              <p className="text-xs text-red-600 dark:text-red-400">
                                {errors[item.id]}
                              </p>
                            )}
                            {executedQty > 0 && (
                              <p className="text-xs text-muted-foreground">
                                底线: {executedQty}
                              </p>
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
                        <TableCell className="text-xs p-3 text-right font-mono">
                          ${item.lineAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-xs p-3 text-center">
                          {deleteConfig.action === "close" ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:hover:bg-orange-900/20"
                                  onClick={() => handleDeleteLine(item)}
                                  disabled={isLoading}
                                >
                                  <Lock className="h-3 w-3 mr-1" />
                                  结案
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>该行已有实绩，只能结案剩余 {deleteConfig.remainingQty} 个</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteLine(item)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              删除
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* 汇总 */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">总数量:</span>
                  <span className="font-medium">{totalQty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">总金额:</span>
                  <span className="font-bold">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">行数:</span>
                  <span className="font-medium">{editedItems.length}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              取消
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || Object.keys(errors).length > 0 || !hasChanges}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存修改
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 结案确认弹窗 */}
      <AlertDialog open={confirmDialog.open && confirmDialog.type === "close_line"} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              确认结案
            </AlertDialogTitle>
            <AlertDialogDescription>
              该行已有实绩，无法删除。是否关闭剩余 <span className="font-bold text-foreground">{confirmDialog.data?.remainingQty}</span> 个？
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">
                结案后，剩余数量的 ATP 将被释放。
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCloseLineConfirm}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                "确认结案"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}

export default POEditDialog
