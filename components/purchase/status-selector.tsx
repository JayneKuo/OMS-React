"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  POStatus,
  ShippingStatus,
  ReceivingStatus,
  getPOStatusOptions,
  getShippingStatusOptions,
  getReceivingStatusOptions,
  getStatusLabel
} from "@/lib/enums/po-status"

type StatusType = 'po' | 'shipping' | 'receiving'
type StatusValue = POStatus | ShippingStatus | ReceivingStatus

interface StatusSelectorProps {
  type: StatusType
  value?: StatusValue
  onValueChange?: (value: StatusValue) => void
  placeholder?: string
  language?: 'en' | 'cn'
  disabled?: boolean
  className?: string
}

export function StatusSelector({
  type,
  value,
  onValueChange,
  placeholder,
  language = 'cn',
  disabled = false,
  className
}: StatusSelectorProps) {
  const [open, setOpen] = React.useState(false)

  // 根据类型获取选项
  const getOptions = () => {
    switch (type) {
      case 'po':
        return getPOStatusOptions(language)
      case 'shipping':
        return getShippingStatusOptions(language)
      case 'receiving':
        return getReceivingStatusOptions(language)
      default:
        return []
    }
  }

  const options = getOptions()
  const selectedOption = options.find(option => option.value === value)

  // 获取占位符文本
  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    const placeholders = {
      po: language === 'cn' ? '选择PO状态' : 'Select PO Status',
      shipping: language === 'cn' ? '选择运输状态' : 'Select Shipping Status',
      receiving: language === 'cn' ? '选择收货状态' : 'Select Receiving Status'
    }
    
    return placeholders[type]
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? (
            <StatusBadge 
              status={selectedOption.value} 
              language={language}
              className="border-0 bg-transparent p-0 text-inherit"
            />
          ) : (
            <span className="text-muted-foreground">{getPlaceholder()}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={language === 'cn' ? '搜索状态...' : 'Search status...'}
          />
          <CommandEmpty>
            {language === 'cn' ? '未找到状态' : 'No status found'}
          </CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  const selectedValue = currentValue as StatusValue
                  onValueChange?.(selectedValue)
                  setOpen(false)
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <StatusBadge 
                    status={option.value} 
                    language={language}
                    showIcon
                  />
                  <div className="ml-2 text-xs text-muted-foreground">
                    {option.style.description}
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// 便捷组件
export function POStatusSelector(props: Omit<StatusSelectorProps, 'type'>) {
  return <StatusSelector {...props} type="po" />
}

export function ShippingStatusSelector(props: Omit<StatusSelectorProps, 'type'>) {
  return <StatusSelector {...props} type="shipping" />
}

export function ReceivingStatusSelector(props: Omit<StatusSelectorProps, 'type'>) {
  return <StatusSelector {...props} type="receiving" />
}