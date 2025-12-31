"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"

interface BatchSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch: (orderNumbers: string[]) => void
  fieldLabel?: string
  placeholder?: string
  maxItems?: number
}

export function BatchSearchDialog({
  open,
  onOpenChange,
  onSearch,
  fieldLabel = "订单编号",
  placeholder = "PO-2024-001\nPO-2024-002\nPO-2024-003",
  maxItems = 100,
}: BatchSearchDialogProps) {
  const [inputValue, setInputValue] = useState("")
  const [parsedItems, setParsedItems] = useState<string[]>([])

  // 解析输入的订单号
  const parseInput = (value: string) => {
    // 支持换行、逗号、空格、分号分隔
    const items = value
      .split(/[\n,，;；\s]+/)
      .map(item => item.trim())
      .filter(Boolean)
    
    // 去重
    const uniqueItems = Array.from(new Set(items))
    
    setParsedItems(uniqueItems)
    return uniqueItems
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    parseInput(value)
  }

  const handleSearch = () => {
    const items = parseInput(inputValue)
    if (items.length === 0) {
      return
    }
    if (items.length > maxItems) {
      alert(`最多支持 ${maxItems} 个订单号，当前输入了 ${items.length} 个`)
      return
    }
    onSearch(items)
    onOpenChange(false)
    // 清空输入
    setInputValue("")
    setParsedItems([])
  }

  const handleReset = () => {
    setInputValue("")
    setParsedItems([])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = parsedItems.filter((_, i) => i !== index)
    setInputValue(newItems.join("\n"))
    setParsedItems(newItems)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量搜索{fieldLabel}</DialogTitle>
          <DialogDescription>
            支持换行、逗号、空格分隔，自动去重，最多 {maxItems} 个
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 输入区域 */}
          <div className="space-y-2">
            <Label htmlFor="batch-input">{fieldLabel}</Label>
            <Textarea
              id="batch-input"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>已识别 {parsedItems.length} 个{fieldLabel}</span>
              {parsedItems.length > maxItems && (
                <span className="text-destructive">超出限制！最多 {maxItems} 个</span>
              )}
            </div>
          </div>

          {/* 预览区域 */}
          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <Label>预览（{parsedItems.length}个）</Label>
              <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {parsedItems.slice(0, 50).map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="gap-1 font-mono text-xs"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {parsedItems.length > 50 && (
                    <Badge variant="outline" className="text-xs">
                      还有 {parsedItems.length - 50} 个...
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            清空
          </Button>
          <Button
            onClick={handleSearch}
            disabled={parsedItems.length === 0 || parsedItems.length > maxItems}
          >
            <Search className="mr-2 h-4 w-4" />
            搜索 {parsedItems.length > 0 && `(${parsedItems.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
