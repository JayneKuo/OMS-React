"use client"

import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    DollarSign,
    Package,
    ArrowRight,
    Sparkles,
    Calculator,
    Check,
    RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BatchEditDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: "price" | "inventory"
    selectedProducts: any[]
}

export function BatchEditDialog({
    open,
    onOpenChange,
    type,
    selectedProducts,
}: BatchEditDialogProps) {
    const { t } = useI18n()
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Batch values for quick fill
    const [batchRegValue, setBatchRegValue] = React.useState("")
    const [batchSaleValue, setBatchSaleValue] = React.useState("")
    const [batchInvValue, setBatchInvValue] = React.useState("")

    // Individual SKU data
    const [skuData, setSkuData] = React.useState<Record<string, { reg: string, sale: string, inv: string }>>({})
    const [selectedSkuIds, setSelectedSkuIds] = React.useState<Set<string>>(new Set())

    // Initialize when opening
    React.useEffect(() => {
        if (open) {
            const initialData: Record<string, { reg: string, sale: string, inv: string }> = {}
            const initialSelected = new Set<string>()

            selectedProducts.forEach(p => {
                p.skus?.forEach((sku: any) => {
                    initialData[sku.id] = {
                        reg: sku.price?.toString() || "",
                        sale: sku.salePrice?.toString() || "",
                        inv: sku.inventory?.toString() || ""
                    }
                    initialSelected.add(sku.id)
                })
            })
            setSkuData(initialData)
            setSelectedSkuIds(initialSelected)
            setBatchRegValue("")
            setBatchSaleValue("")
            setBatchInvValue("")
        }
    }, [open, selectedProducts])

    const handleBatchFill = () => {
        if (selectedSkuIds.size === 0) {
            toast.error(t('noSkuSelected'))
            return
        }

        setSkuData(prev => {
            const next = { ...prev }
            selectedSkuIds.forEach(id => {
                if (type === "price") {
                    if (batchRegValue) next[id].reg = batchRegValue
                    if (batchSaleValue) next[id].sale = batchSaleValue
                } else {
                    if (batchInvValue) next[id].inv = batchInvValue
                }
            })
            return next
        })
        toast.success(t('batchApplyBtn'))
    }

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
        const isAllSourced = skuIds.every(id => selectedSkuIds.has(id))

        setSelectedSkuIds(prev => {
            const next = new Set(prev)
            if (isAllSourced) {
                skuIds.forEach(id => next.delete(id))
            } else {
                skuIds.forEach(id => next.add(id))
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

    const handleSubmit = async () => {
        setIsSubmitting(true)
        await new Promise(r => setTimeout(r, 1500))
        setIsSubmitting(false)
        toast.success(t('confirmExecution'))
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1000px] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[85vh]">
                {/* Header Section */}
                <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 tracking-tight text-foreground">
                        {type === "price" ? <DollarSign className="h-5 w-5 text-[#753BBD]" /> : <Package className="h-5 w-5 text-[#753BBD]" />}
                        {type === "price" ? t('batchPriceCenter') : t('inventoryAllocation')}
                    </DialogTitle>
                </div>

                {/* Batch Operation Bar */}
                <div className="bg-white border-b p-4 flex items-center gap-6 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Calculator className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{t('batchQuickFill')}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                        {type === "price" ? (
                            <>
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">{t('originalPriceShort')}</span>
                                    <Input
                                        className="h-10 pl-10 bg-gray-50 border-gray-100 focus:bg-white transition-all text-sm font-bold"
                                        placeholder="0.00"
                                        value={batchRegValue}
                                        onChange={e => setBatchRegValue(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-green-600 uppercase">{t('salePriceShort')}</span>
                                    <Input
                                        className="h-10 pl-10 bg-green-50/20 border-green-100 focus:bg-white transition-all text-sm font-bold"
                                        placeholder="0.00"
                                        value={batchSaleValue}
                                        onChange={e => setBatchSaleValue(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-orange-600 uppercase">{t('stockAndStatus')}</span>
                                <Input
                                    className="h-10 pl-16 bg-orange-50/10 border-orange-100 focus:bg-white transition-all text-sm font-bold"
                                    placeholder="0"
                                    value={batchInvValue}
                                    onChange={e => setBatchInvValue(e.target.value)}
                                />
                            </div>
                        )}
                        <Button
                            onClick={handleBatchFill}
                            className="bg-[#753BBD] hover:bg-[#753BBD]/90 px-6 h-10 font-bold gap-2 shadow-md shadow-purple-100 transition-all active:scale-95"
                        >
                            {t('batchApplyBtn')} <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {/* SKU Table Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="bg-gray-50/80 px-4 py-2 border-b flex items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground mr-auto">{t('individualEditTitle')}</span>
                        {selectedSkuIds.size > 0 && (
                            <Badge variant="outline" className="text-[10px] bg-white border-purple-200 text-primary font-bold">
                                {selectedSkuIds.size} SKUS Selected
                            </Badge>
                        )}
                    </div>

                    <ScrollArea className="flex-1">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-20 shadow-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[50px] text-center px-4">
                                        <Checkbox checked={selectedSkuIds.size > 0} onCheckedChange={toggleAll} />
                                    </TableHead>
                                    <TableHead className="w-[250px] font-bold">{t('variantInfo')}</TableHead>
                                    <TableHead className="w-[180px] font-bold">{t('currentValue')}</TableHead>
                                    {type === "price" ? (
                                        <>
                                            <TableHead className="min-w-[140px] font-bold text-center">{t('regularPriceLabel')}</TableHead>
                                            <TableHead className="min-w-[140px] font-bold text-center">{t('salePriceLabel')}</TableHead>
                                        </>
                                    ) : (
                                        <TableHead className="min-w-[160px] font-bold text-center">{t('stockAndStatus')}</TableHead>
                                    )}
                                    <TableHead className="w-[80px] text-center">{t('status')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedProducts.map(product => (
                                    <React.Fragment key={product.id}>
                                        <TableRow className="bg-muted/10 hover:bg-muted/20 transition-colors">
                                            <TableCell className="text-center px-4 py-4"> {/* Increased padding */}
                                                <Checkbox
                                                    checked={product.skus?.every((s: any) => selectedSkuIds.has(s.id))}
                                                    onCheckedChange={() => toggleSpu(product)}
                                                />
                                            </TableCell>
                                            <TableCell colSpan={type === "price" ? 5 : 4} className="py-4 px-1"> {/* Increased padding */}
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-8 border rounded-lg overflow-hidden shrink-0 shadow-sm border-white bg-white">
                                                        <img src={product.image} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-[13px] font-black text-gray-800 truncate leading-tight">{product.title}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-white/50 border-gray-200 text-gray-400 font-bold">SPU: {product.spuCode}</Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        {product.skus?.map((sku: any) => {
                                            const isSelected = selectedSkuIds.has(sku.id)
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
                                                                <img src={sku.image || product.image} className="h-full w-full object-cover grayscale-[0.2]" />
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
                                                    <TableCell>
                                                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 invisible group-hover:visible whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <span>Current</span>
                                                                <span className="text-gray-900">${sku.price}</span>
                                                            </div>
                                                            {sku.salePrice > 0 && (
                                                                <div className="flex flex-col">
                                                                    <span>Current Sale</span>
                                                                    <span className="text-green-600">${sku.salePrice}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span>Stock</span>
                                                                <span className="text-orange-500">{sku.inventory}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    {type === "price" ? (
                                                        <>
                                                            <TableCell className="w-[150px]">
                                                                <Input
                                                                    className="h-9 text-right font-black border-transparent bg-gray-100/50 focus:bg-white focus:border-primary transition-all pr-4"
                                                                    value={skuData[sku.id]?.reg || ""}
                                                                    onChange={e => setSkuData(prev => ({ ...prev, [sku.id]: { ...prev[sku.id], reg: e.target.value } }))}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="w-[150px]">
                                                                <Input
                                                                    className="h-9 text-right font-black border-transparent bg-green-50/30 text-green-700 focus:bg-white focus:border-green-500 transition-all pr-4"
                                                                    value={skuData[sku.id]?.sale || ""}
                                                                    onChange={e => setSkuData(prev => ({ ...prev, [sku.id]: { ...prev[sku.id], sale: e.target.value } }))}
                                                                />
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        <TableCell className="w-[200px]">
                                                            <Input
                                                                className="h-9 text-right font-black border-transparent bg-orange-50/30 text-orange-700 focus:bg-white focus:border-orange-500 transition-all pr-4"
                                                                value={skuData[sku.id]?.inv || ""}
                                                                onChange={e => setSkuData(prev => ({ ...prev, [sku.id]: { ...prev[sku.id], inv: e.target.value } }))}
                                                            />
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="text-center">
                                                        {isSelected ? (
                                                            <div className="flex justify-center"><Check className="h-4 w-4 text-green-500" /></div>
                                                        ) : (
                                                            <span className="text-[10px] text-muted-foreground">Skip</span>
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
                <div className="p-4 bg-gray-50 border-t shrink-0 flex items-center justify-end gap-3 px-6">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="font-bold text-gray-400 h-11 px-8 rounded-xl"
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        className="bg-[#753BBD] hover:bg-[#9561D0] h-11 px-10 rounded-xl font-black shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedSkuIds.size === 0}
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('confirmExecution')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
