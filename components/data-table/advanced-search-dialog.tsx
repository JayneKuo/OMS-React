"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export interface SearchField {
  id: string
  label: string
  placeholder?: string
  type?: "text" | "textarea" | "batch" // 字段类型
  maxItems?: number // 批量输入最大数量
}

export interface AdvancedSearchValues {
  [key: string]: string | string[] // 支持字符串或字符串数组
}

export interface AdvancedSearchFilter {
  fieldId: string
  fieldLabel: string
  value: string | string[]
  displayValue: string // 用于显示的值
}

interface AdvancedSearchDialogProps {
  fields: SearchField[]
  onSearch: (values: AdvancedSearchValues, filters: AdvancedSearchFilter[]) => void
  trigger?: React.ReactNode
}

export function AdvancedSearchDialog({
  fields,
  onSearch,
  trigger,
}: AdvancedSearchDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [values, setValues] = React.useState<AdvancedSearchValues>({})
  const [batchParsedItems, setBatchParsedItems] = React.useState<Record<string, string[]>>({})

  const handleValueChange = (fieldId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  // 解析批量输入
  const parseBatchInput = (value: string, maxItems: number = 100): string[] => {
    const items = value
      .split(/[\n,，;；\s]+/)
      .map(item => item.trim())
      .filter(Boolean)
    
    const uniqueItems = Array.from(new Set(items))
    return uniqueItems.slice(0, maxItems)
  }

  // 处理批量输入字段的变化
  const handleBatchValueChange = (fieldId: string, value: string, maxItems: number = 100) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
    
    const parsed = parseBatchInput(value, maxItems)
    setBatchParsedItems(prev => ({
      ...prev,
      [fieldId]: parsed
    }))
  }

  const handleClear = () => {
    setValues({})
    setBatchParsedItems({})
  }

  const handleSearch = () => {
    const filteredValues: AdvancedSearchValues = {}
    const filters: AdvancedSearchFilter[] = []
    
    fields.forEach(field => {
      const value = values[field.id]
      
      if (!value) return
      
      if (field.type === "batch" || field.type === "textarea") {
        // 批量输入字段
        const items = parseBatchInput(value as string, field.maxItems)
        if (items.length > 0) {
          filteredValues[field.id] = items
          filters.push({
            fieldId: field.id,
            fieldLabel: field.label,
            value: items,
            displayValue: items.length > 3 
              ? `${items.slice(0, 3).join(", ")} +${items.length - 3}` 
              : items.join(", ")
          })
        }
      } else {
        // 普通文本字段
        const trimmedValue = (value as string).trim()
        if (trimmedValue) {
          filteredValues[field.id] = trimmedValue
          filters.push({
            fieldId: field.id,
            fieldLabel: field.label,
            value: trimmedValue,
            displayValue: trimmedValue
          })
        }
      }
    })
    
    if (filters.length > 0) {
      onSearch(filteredValues, filters)
      setOpen(false)
    }
  }

  const hasValues = Object.values(values).some(v => {
    if (Array.isArray(v)) return v.length > 0
    return typeof v === 'string' && v.trim()
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Search className="mr-2 h-4 w-4" />
            Advanced Search
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Advanced Search</DialogTitle>
          <DialogDescription>
            Search by specific fields for more precise results
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {fields.map((field) => {
            const isBatch = field.type === "batch" || field.type === "textarea"
            const fieldValue = values[field.id] || ""
            const parsedCount = batchParsedItems[field.id]?.length || 0
            const maxItems = field.maxItems || 100
            
            return (
              <div key={field.id} className="grid gap-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {isBatch && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (支持批量输入，最多{maxItems}个)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  {isBatch ? (
                    <>
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder || `输入${field.label}，支持换行、逗号、空格分隔...`}
                        value={fieldValue as string}
                        onChange={(e) => handleBatchValueChange(field.id, e.target.value, maxItems)}
                        className="min-h-[100px] font-mono text-sm"
                      />
                      {parsedCount > 0 && (
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            已识别 {parsedCount} 个{field.label}
                          </span>
                          {parsedCount > maxItems && (
                            <span className="text-destructive">
                              超出限制！最多 {maxItems} 个
                            </span>
                          )}
                        </div>
                      )}
                      {parsedCount > 0 && parsedCount <= 20 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {batchParsedItems[field.id]?.map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs font-mono">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Input
                        id={field.id}
                        placeholder={field.placeholder || `输入${field.label}...`}
                        value={fieldValue as string}
                        onChange={(e) => handleValueChange(field.id, e.target.value)}
                        className="pr-8"
                      />
                      {fieldValue && (
                        <button
                          onClick={() => handleValueChange(field.id, "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!hasValues}
          >
            Clear All
          </Button>
          <Button onClick={handleSearch}>
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
