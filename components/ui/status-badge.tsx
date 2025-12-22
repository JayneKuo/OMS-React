"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { 
  POStatus, 
  ShippingStatus, 
  ReceivingStatus,
  getStatusStyle
} from "@/lib/enums/po-status"
import { useI18n } from "@/components/i18n-provider"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        processing: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        warning: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        error: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: POStatus | ShippingStatus | ReceivingStatus
  language?: 'en' | 'cn'
  showIcon?: boolean
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, language = 'cn', showIcon = false, ...props }, ref) => {
    const { t } = useI18n()
    const statusStyle = getStatusStyle(status)
    
    // 获取状态标签，使用i18n系统
    const getStatusLabel = () => {
      // 将枚举值转换为翻译键
      switch (status) {
        case POStatus.NEW:
          return t('NEW')
        case POStatus.IN_TRANSIT:
          return t('IN_TRANSIT')
        case POStatus.WAITING_FOR_RECEIVING:
          return t('WAITING_FOR_RECEIVING')
        case POStatus.RECEIVING:
          return t('RECEIVING')
        case POStatus.PARTIAL_RECEIPT:
          return t('PARTIAL_RECEIPT')
        case POStatus.COMPLETED:
          return t('COMPLETED')
        case POStatus.CANCELLED:
          return t('CANCELLED')
        case POStatus.EXCEPTION:
          return t('EXCEPTION')
        case ShippingStatus.SHIPPED:
          return t('SHIPPED')
        case ShippingStatus.IN_TRANSIT:
          return t('IN_TRANSIT')
        case ShippingStatus.ARRIVED:
          return t('ARRIVED')
        case ShippingStatus.SHIPPING_EXCEPTION:
          return t('SHIPPING_EXCEPTION')
        case ReceivingStatus.NOT_RECEIVED:
          return t('NOT_RECEIVED')
        case ReceivingStatus.PARTIAL_RECEIVED:
          return t('PARTIAL_RECEIVED')
        case ReceivingStatus.RECEIVED:
          return t('RECEIVED')
        default:
          return status
      }
    }
    
    const statusLabel = getStatusLabel()
    
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
      <div
        className={cn(statusBadgeVariants({ variant: statusStyle.variant }), className)}
        ref={ref}
        title={statusStyle.description}
        {...props}
      >
        {getStatusIcon()}
        {statusLabel}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge, statusBadgeVariants }