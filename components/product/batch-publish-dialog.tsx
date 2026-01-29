"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useI18n } from "@/lib/i18n"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Loader2,
    Upload,
    Check,
    AlertCircle,
    Store
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { BatchResultDialog } from "./batch-result-dialog"

interface BatchPublishDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedProducts: any[]
}

export function BatchPublishDialog({
    open,
    onOpenChange,
    selectedProducts,
}: BatchPublishDialogProps) {
    const { t } = useI18n()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [showResults, setShowResults] = React.useState(false)
    const [results, setResults] = React.useState<any[]>([])

    // Channel selection for each SKU
    const [skuChannels, setSkuChannels] = React.useState<Record<string, string[]>>({})
    const [selectedSkuIds, setSelectedSkuIds] = React.useState<Set<string>>(new Set())

    // Available channels
    const availableChannels = [
        { id: "amazon", name: "Amazon US", icon: "🛒" },
        { id: "shopify", name: "Shopify Store", icon: "🛍️" },
        { id: "ebay", name: "eBay", icon: "📦" },
        { id: "walmart", name: "Walmart", icon: "🏪" },
    ]

    // Initialize when opening
    React.useEffect(() => {
        if (open) {
            const initialChannels: Record<string, string[]> = {}
            const initialSelected = new Set<string>()

            selectedProducts.forEach(p => {
                p.skus?.forEach((sku: any) => {
                    initialChannels[sku.id] = []
                    initialSelected.add(sku.id)
                })
            })
            setSkuChannels(initialChannels)
            setSelectedSkuIds(initialSelected)
        }
    }, [open, selectedProducts])

    const toggleSku = (id: string) => {
        setSelectedSkuIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleSpu = (product: any) => {
        const skuIds = product.skus?.map((s: any) => s.id) || []
        const isAllSelected = skuIds.every((id: string) => selectedSkuIds.has(id))

        setSelectedSkuIds(prev => {
            const next = new Set(prev)
            if (isAllSelected) {
                skuIds.forEach((id: string) => next.delete(id))
            } else {
                skuIds.forEach((id: string) => next.add(id))
            }
            return next
        })
    }

    const toggleAll = () => {
        const allIds: string[] = []
        selectedProducts.forEach(p => p.skus?.forEach((s: any) => allIds.push(s.id)))

        if (selectedSkuIds.size === allIds.length) {
            setSelectedSkuIds(new Set())
        } else {
            setSelectedSkuIds(new Set(allIds))
        }
    }

    const toggleChannel = (skuId: string, channelId: string) => {
        setSkuChannels(prev => {
            const current = prev[skuId] || []
            const next = current.includes(channelId)
                ? current.filter(c => c !== channelId)
                : [...current, channelId]
            return { ...prev, [skuId]: next }
        })
    }

    const batchSelectChannel = (channelId: string) => {
        if (selectedSkuIds.size === 0) {
            toast.error("请先选择要上架的 SKU")
            return
        }

        setSkuChannels(prev => {
            const next = { ...prev }
            selectedSkuIds.forEach(skuId => {
                const current = next[skuId] || []
                if (!current.includes(channelId)) {
                    next[skuId] = [...current, channelId]
                }
            })
            return next
        })
        toast.success(`已为选中的 SKU 添加 ${availableChannels.find(c => c.id === channelId)?.name}`)
    }

    const handleSubmit = async () => {
        // Validate: at least one SKU with at least one channel
        const hasValidSelection = Array.from(selectedSkuIds).some(skuId => {
            const channels = skuChannels[skuId] || []
            return channels.length > 0
        })

        if (!hasValidSelection) {
            toast.error("请至少为一个 SKU 选择上架渠道")
            return
        }

        setIsSubmitting(true)
        
        // Simulate API call with random success/failure
        await new Promise(r => setTimeout(r, 2000))
        
        // Generate mock results
        const mockResults: any[] = []
        selectedProducts.forEach(product => {
            product.skus?.forEach((sku: any) => {
                if (selectedSkuIds.has(sku.id)) {
                    const channels = skuChannels[sku.id] || []
                    if (channels.length > 0) {
                        const random = Math.random()
                        const channelNames = channels.map(id => 
                            availableChannels.find(c => c.id === id)?.name || id
                        )
                        
                        if (random > 0.8) {
                            // Failed
                            mockResults.push({
                                skuCode: sku.skuCode,
                                skuName: sku.skuName || `${product.title} - ${sku.color} ${sku.size}`,
                                channels: channelNames,
                                status: "failed",
                                errorMessage: "网络连接超时，请重试"
                            })
                        } else if (random > 0.6) {
                            // Partial success
                            const successCount = Math.floor(channels.length / 2) || 1
                            mockResults.push({
                                skuCode: sku.skuCode,
                                skuName: sku.skuName || `${product.title} - ${sku.color} ${sku.size}`,
                                channels: channelNames,
                                status: "partial",
                                successChannels: channelNames.slice(0, successCount),
                                failedChannels: channelNames.slice(successCount),
                                errorMessage: "部分渠道上架失败"
                            })
                        } else {
                            // Success
                            mockResults.push({
                                skuCode: sku.skuCode,
                                skuName: sku.skuName || `${product.title} - ${sku.color} ${sku.size}`,
                                channels: channelNames,
                                status: "success"
                            })
                        }
                    }
                }
            })
        })
        
        setIsSubmitting(false)
        setResults(mockResults)
        setShowResults(true)
        onOpenChange(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[1100px] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[85vh]">
                {/* Header Section */}
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 tracking-tight text-foreground">
                        <Upload className="h-5 w-5 text-[#753BBD]" />
                        批量上架商品
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-white border-purple-200 text-primary font-bold">
                            {selectedProducts.length} 个商品
                        </Badge>
                    </div>
                </div>

                {/* Batch Channel Selection Bar */}
                <div className="bg-white border-b p-4 flex items-center gap-6 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Store className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">快速选择渠道</span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                        {availableChannels.map(channel => (
                            <Button
                                key={channel.id}
                                variant="outline"
                                size="sm"
                                onClick={() => batchSelectChannel(channel.id)}
                                className="h-9 px-4 font-medium hover:bg-primary/5 hover:border-primary/30 transition-all"
                            >
                                <span className="mr-2">{channel.icon}</span>
                                {channel.name}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Info Bar */}
                <div className="bg-blue-50/50 px-4 py-2 border-b flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-700">
                        请为每个 SKU 选择要上架的销售渠道。可以使用上方快速选择按钮批量添加渠道。
                    </span>
                    {selectedSkuIds.size > 0 && (
                        <Badge variant="outline" className="text-[10px] bg-white border-blue-200 text-blue-600 font-bold ml-auto">
                            已选 {selectedSkuIds.size} 个 SKU
                        </Badge>
                    )}
                </div>

                {/* SKU Table Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <ScrollArea className="flex-1">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-20 shadow-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[50px] text-center px-4">
                                        <Checkbox checked={selectedSkuIds.size > 0} onCheckedChange={toggleAll} />
                                    </TableHead>
                                    <TableHead className="w-[280px] font-bold">商品信息</TableHead>
                                    <TableHead className="w-[120px] font-bold text-center">当前状态</TableHead>
                                    <TableHead className="min-w-[400px] font-bold">上架渠道</TableHead>
                                    <TableHead className="w-[80px] text-center font-bold">状态</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedProducts.map(product => (
                                    <React.Fragment key={product.id}>
                                        <TableRow className="bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <TableCell className="text-center px-4 py-4">
                                                <Checkbox
                                                    checked={product.skus?.every((s: any) => selectedSkuIds.has(s.id))}
                                                    onCheckedChange={() => toggleSpu(product)}
                                                />
                                            </TableCell>
                                            <TableCell colSpan={4} className="py-4 px-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-8 border rounded-lg overflow-hidden shrink-0 shadow-sm border-white bg-white">
                                                        <img src={product.image} className="h-full w-full object-cover" alt={product.title} />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-[13px] font-black text-gray-800 truncate leading-tight">{product.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-white/50 border-gray-200 text-gray-400 font-bold">
                                                                SPU: {product.spuCode}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-white/50 border-gray-200 text-gray-400 font-bold">
                                                                {product.skus?.length || 0} 个 SKU
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {product.skus?.map((sku: any) => {
                                            const isSelected = selectedSkuIds.has(sku.id)
                                            const selectedChannels = skuChannels[sku.id] || []
                                            return (
                                                <TableRow key={sku.id} className={cn(
                                                    "transition-colors group",
                                                    isSelected ? "bg-white" : "bg-gray-50/50 opacity-50"
                                                )}>
                                                    <TableCell className="text-center px-4">
                                                        <Checkbox checked={isSelected} onCheckedChange={() => toggleSku(sku.id)} />
                                                    </TableCell>
                                                    <TableCell className="py-4">
                                                        <div className="flex items-center gap-3 min-w-[240px]">
                                                            <div className="h-12 w-10 border rounded-md overflow-hidden shrink-0 bg-muted/30 shadow-inner">
                                                                <img src={sku.image || product.image} className="h-full w-full object-cover grayscale-[0.2]" alt={sku.skuCode} />
                                                            </div>
                                                            <div className="flex flex-col gap-1.5">
                                                                <span className="text-[11px] font-bold tracking-tight text-gray-900 leading-none">{sku.skuCode}</span>
                                                                <div className="flex gap-1.5">
                                                                    <span className="text-[9px] text-gray-500 font-black uppercase bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-sm">{sku.color}</span>
                                                                    <span className="text-[9px] text-gray-500 font-black uppercase bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-sm">{sku.size}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge 
                                                            variant={sku.status === "published" ? "default" : "secondary"}
                                                            className="text-[10px] font-bold"
                                                        >
                                                            {sku.status === "published" ? "已上架" : "未上架"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-2">
                                                            {availableChannels.map(channel => {
                                                                const isChannelSelected = selectedChannels.includes(channel.id)
                                                                return (
                                                                    <button
                                                                        key={channel.id}
                                                                        onClick={() => toggleChannel(sku.id, channel.id)}
                                                                        disabled={!isSelected}
                                                                        className={cn(
                                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all",
                                                                            isChannelSelected
                                                                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                                                : "bg-white border-gray-200 text-gray-600 hover:border-primary/30 hover:bg-primary/5",
                                                                            !isSelected && "opacity-30 cursor-not-allowed"
                                                                        )}
                                                                    >
                                                                        <span>{channel.icon}</span>
                                                                        <span>{channel.name}</span>
                                                                        {isChannelSelected && <Check className="h-3 w-3" />}
                                                                    </button>
                                                                )
                                                            })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {isSelected && selectedChannels.length > 0 ? (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Check className="h-4 w-4 text-green-500" />
                                                                <span className="text-[10px] text-green-600 font-bold">{selectedChannels.length} 渠道</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground">未选择</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* Footer Section */}
                <div className="p-4 bg-gray-50 border-t shrink-0 flex items-center justify-between gap-3 px-6">
                    <div className="text-sm text-muted-foreground">
                        已选择 <span className="font-bold text-primary">{selectedSkuIds.size}</span> 个 SKU，
                        其中 <span className="font-bold text-green-600">
                            {Array.from(selectedSkuIds).filter(id => (skuChannels[id] || []).length > 0).length}
                        </span> 个已配置渠道
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="font-bold text-gray-400 h-11 px-8 rounded-xl"
                        >
                            取消
                        </Button>
                        <Button
                            className="bg-[#753BBD] hover:bg-[#9561D0] h-11 px-10 rounded-xl font-black shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={isSubmitting || selectedSkuIds.size === 0}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    上架中...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    确认上架
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <BatchResultDialog
            open={showResults}
            onOpenChange={setShowResults}
            results={results}
            operationType="publish"
        />
    </>
    )
}
