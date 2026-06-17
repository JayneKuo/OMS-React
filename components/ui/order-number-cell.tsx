"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrderNumberCellProps {
  orderNumber: string
  onClick?: () => void
  className?: string
}

export function OrderNumberCell({ orderNumber, onClick, className }: OrderNumberCellProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(orderNumber)
      setCopied(true)
      toast.success("Copied", { description: `${orderNumber} copied to clipboard` })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Copy failed", { description: "Unable to copy to clipboard" })
    }
  }

  return (
    <div className={cn("group flex items-center gap-2", className)}>
      <span
        className={cn(
          "font-medium transition-colors",
          onClick
            ? "cursor-pointer text-primary hover:text-primary/80 hover:underline"
            : "text-foreground"
        )}
        onClick={onClick}
      >
        {orderNumber}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleCopy}
        aria-label={`Copy ${orderNumber}`}
      >
        {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
      </Button>
    </div>
  )
}
