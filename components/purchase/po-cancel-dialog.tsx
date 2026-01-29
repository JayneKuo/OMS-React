"use client"

import * as React from "react"
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
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, XCircle, Info } from "lucide-react"
import { toast } from "sonner"

interface POCancelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  poData: {
    orderNo: string
    totalOrderQty: number
    shippedQty: number
    receivedQty: number
    status: string
  }
  onConfirm?: (action: "cancel" | "close") => void
}

// 判断取消场景
const getCancelScenario = (poData: POCancelDialogProps["poData"]) => {
  const hasExecution = poData.shippedQty > 0 || poData.receivedQty > 0
  const remainingQty = poData.totalOrderQty - Math.max(poData.shippedQty, poData.receivedQty)
  
  if (!hasExecution) {
    return {
      type: "cancel" as const,
      title: "取消订单",
      description: "确定要取消此订单吗？取消后订单将无法恢复。",
      actionLabel: "确认取消",
      canProceed: true,
      remainingQty: poData.totalOrderQty,
      atpAction: "全量释放"
    }
  } else {
    return {
      type: "close" as const,
      title: "无法整单取消",
      description: `订单包含已发运/已收货明细，无法整单作废。建议执行"结案"操作，关闭剩余 ${remainingQty} 个未执行的数量。`,
      actionLabel: "执行结案",
      canProceed: true,
      remainingQty,
      atpAction: `释放剩余 ${remainingQty} 个 ATP`
    }
  }
}

export function POCancelDialog({ open, onOpenChange, poData, onConfirm }: POCancelDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const scenario = getCancelScenario(poData)

  const handleConfirm = async () => {
    setIsLoading(true)
    
    if (scenario.type === "cancel") {
      toast.loading("正在取消订单...", { id: "cancel-po" })
    } else {
      toast.loading("正在执行结案...", { id: "cancel-po" })
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    if (scenario.type === "cancel") {
      toast.success("订单已取消", { id: "cancel-po" })
    } else {
      toast.success(`已结案，释放 ${scenario.remainingQty} 个 ATP`, { id: "cancel-po" })
    }

    onConfirm?.(scenario.type)
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {scenario.type === "cancel" ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
            {scenario.title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>{scenario.description}</p>
              
              <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">订单号:</span>
                  <span className="font-mono font-medium">{poData.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">订单数量:</span>
                  <span>{poData.totalOrderQty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">已发货:</span>
                  <span className={poData.shippedQty > 0 ? "text-purple-600 font-medium" : ""}>
                    {poData.shippedQty}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">已收货:</span>
                  <span className={poData.receivedQty > 0 ? "text-green-600 font-medium" : ""}>
                    {poData.receivedQty}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-muted-foreground">ATP 操作:</span>
                  <Badge variant="outline" className="text-xs">{scenario.atpAction}</Badge>
                </div>
              </div>

              {scenario.type === "close" && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Info className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-800 dark:text-orange-200">
                    结案操作将保留已执行的实绩，仅关闭未执行的剩余数量。
                  </p>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={scenario.type === "cancel" 
              ? "bg-red-600 hover:bg-red-700" 
              : "bg-orange-600 hover:bg-orange-700"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              scenario.actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default POCancelDialog
