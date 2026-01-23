"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  POStatus, 
  ShippingStatus, 
  ReceivingStatus,
  getStatusStyle,
  getStatusLabel
} from "@/lib/enums/po-status"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: POStatus | ShippingStatus | ReceivingStatus
  language?: 'en' | 'cn'
  showIcon?: boolean
}

export function StatusBadge({ 
  className, 
  status, 
  language = 'cn', 
  showIcon = false, 
  ...props 
}: StatusBadgeProps) {
  const statusStyle = getStatusStyle(status)
  
  // Use the utility function from po-status.ts
  const statusLabel = getStatusLabel(status, language)
  
  // 根据状态变体获取对应的Badge样式类
  const getBadgeClassName = () => {
    switch (statusStyle.variant) {
      case 'success':
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case 'warning':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case 'processing':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case 'error':
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }
  
  // 根据状态获取对应的图标
  const getStatusIcon = () => {
    if (!showIcon) return null
    
    switch (statusStyle.variant) {
      case 'processing':
        return (
          <div className="mr-1 h-2 w-2 rounded-full bg-current animate-pulse" />
        )
      case 'success':
        return (
          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'error':
        return (
          <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Badge
      className={cn(getBadgeClassName(), "text-xs", className)}
      title={statusStyle.description}
      {...props}
    >
      {getStatusIcon()}
      {statusLabel}
    </Badge>
  )
}
