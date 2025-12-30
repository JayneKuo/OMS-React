"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface OrderNumberCellProps {
  orderNumber: string
  onClick?: () => void
  className?: string
}

export function OrderNumberCell({ orderNumber, onClick, className }: OrderNumberCellProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      toast.success("已复制", { description: `${orderNumber} 已复制到剪贴板` })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("复制失败", { description: "无法复制到剪贴板" })
    }
  }

  return (
    <div className={cn("flex items-center gap-2 group", className)}>
      <span 
        className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer transition-colors"
        onClick={onClick}
      >
        {orderNumber}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
        )}
      </Button>
    </div>
  )
}
