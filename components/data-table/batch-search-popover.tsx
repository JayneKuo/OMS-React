"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, X, Eraser, ChevronDown, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface BatchSearchField {
    label: string
    value: string
    placeholder?: string
}

interface BatchSearchPopoverProps {
    onSearchAction: (criteria: Record<string, string[]>) => void
    fields?: BatchSearchField[]
    maxItems?: number
    trigger: React.ReactNode
}

export function BatchSearchPopover({
    onSearchAction,
    fields = [{ label: "订单编号", value: "orderNo" }],
    maxItems = 100,
    trigger
}: BatchSearchPopoverProps) {
    const [open, setOpen] = useState(false)
    // Store input values for each field: { orderNo: "...", refNo: "..." }
    const [inputValues, setInputValues] = useState<Record<string, string>>({})
    // Track parsed items count for UI feedback
    const [parsedCounts, setParsedCounts] = useState<Record<string, number>>({})

    // 解析输入的订单号
    const parseInput = (value: string) => {
        // 支持换行、逗号、空格、分号分隔
        return value
            .split(/[\n,，;；\s]+/)
            .map(item => item.trim())
            .filter(Boolean)
    }

    const handleInputChange = (fieldValue: string, value: string) => {
        setInputValues(prev => ({ ...prev, [fieldValue]: value }))

        // Update count immediately for feedback
        const items = parseInput(value)
        // 去重
        const uniqueItems = new Set(items)
        setParsedCounts(prev => ({ ...prev, [fieldValue]: uniqueItems.size }))
    }

    const handleSearch = () => {
        const criteria: Record<string, string[]> = {}
        let hasValidInput = false

        fields.forEach(field => {
            const rawValue = inputValues[field.value] || ""
            const items = parseInput(rawValue)
            if (items.length > 0) {
                // Deduplicate
                const uniqueItems = Array.from(new Set(items))
                if (uniqueItems.length > 0) {
                    criteria[field.value] = uniqueItems
                    hasValidInput = true
                }
            }
        })

        if (!hasValidInput) {
            return
        }

        onSearchAction(criteria)
        setOpen(false)
        // Optional: Clear input or keep it? Usually better to keep for refinement, but popover unmounts often.
        // Let's clear for now to match previous behavior, or we can make it controlled.
        setInputValues({})
        setParsedCounts({})
    }

    const handleReset = () => {
        setInputValues({})
        setParsedCounts({})
    }

    const totalCount = Object.values(parsedCounts).reduce((a, b) => a + b, 0)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger}
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="end">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-sm font-semibold">批量组合搜索</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="max-h-[500px] overflow-y-auto p-3 space-y-4">
                    <div className="text-xs text-muted-foreground mb-2">
                        同时输入多个条件，将执行“且” (AND) 查询。单个框内多个值执行“或” (OR) 查询。
                    </div>

                    {fields.map(field => (
                        <div key={field.value} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-foreground">{field.label}</Label>
                                {parsedCounts[field.value] > 0 && (
                                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                                        {parsedCounts[field.value]}
                                    </Badge>
                                )}
                            </div>
                            <Textarea
                                placeholder={field.placeholder || `请输入${field.label}...`}
                                value={inputValues[field.value] || ""}
                                onChange={(e) => handleInputChange(field.value, e.target.value)}
                                className="min-h-[80px] font-mono text-xs resize-none focus-visible:ring-1"
                            />
                        </div>
                    ))}

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <span>共识别: <span className="text-primary font-bold">{totalCount}</span> 项</span>
                        {totalCount > 0 && (
                            <button onClick={handleReset} className="text-muted-foreground hover:text-foreground flex items-center">
                                <Eraser className="h-3 w-3 mr-1" />清空所有
                            </button>
                        )}
                    </div>
                </div>

                <div className="p-2 border-t bg-muted/50 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                    >
                        取消
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSearch}
                        disabled={totalCount === 0}
                        className="w-24"
                    >
                        <Search className="mr-2 h-4 w-4" />
                        搜索
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
