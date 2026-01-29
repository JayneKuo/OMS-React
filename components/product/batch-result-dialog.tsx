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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    CheckCircle2,
    XCircle,
    AlertCircle,
    Download,
    Copy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface BatchResultItem {
    skuCode: string
    skuName: string
    channels: string[]
    status: "success" | "failed" | "partial"
    successChannels?: string[]
    failedChannels?: string[]
    errorMessage?: string
}

interface BatchResultDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    results: BatchResultItem[]
    operationType: "publish" | "price" | "inventory"
}

export function BatchResultDialog({
    open,
    onOpenChange,
    results,
    operationType = "publish"
}: BatchResultDialogProps) {
    const successCount = results.filter(r => r.status === "success").length
    const failedCount = results.filter(r => r.status === "failed").length
    const partialCount = results.filter(r => r.status === "partial").length
    const totalCount = results.length

    const getOperationTitle = () => {
        switch (operationType) {
            case "publish": return "批量上架"
            case "price": return "批量改价"
            case "inventory": return "批量改库存"
            default: return "批量操作"
        }
    }

    const exportResults = () => {
        const csvContent = [
            ["SKU代码", "SKU名称", "渠道", "状态", "错误信息"].join(","),
            ...results.map(r => [
                r.skuCode,
                r.skuName,
                r.channels.join(";"),
                r.status === "success" ? "成功" : r.status === "failed" ? "失败" : "部分成功",
                r.errorMessage || ""
            ].join(","))
        ].join("\n")

        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${getOperationTitle()}_结果_${new Date().getTime()}.csv`
        link.click()
        toast.success("结果已导出")
    }

    const copyFailedSkus = () => {
        const failedSkus = results
            .filter(r => r.status === "failed" || r.status === "partial")
            .map(r => r.skuCode)
            .join("\n")
        navigator.clipboard.writeText(failedSkus)
        toast.success("已复制失败的 SKU 代码")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden border-none shadow-2xl flex flex-col h-[80vh]">
                {/* Header Section */}
                <div className="bg-white border-b px-6 py-4 shrink-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3 tracking-tight text-foreground">
                        {successCount === totalCount ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : failedCount === totalCount ? (
                            <XCircle className="h-6 w-6 text-destructive" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                        )}
                        {getOperationTitle()}结果
                    </DialogTitle>
                    
                    {/* Summary Stats */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">总计:</span>
                            <Badge variant="outline" className="font-bold">{totalCount}</Badge>
                        </div>
                        {successCount > 0 && (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-bold text-green-600">{successCount} 成功</span>
                            </div>
                        )}
                        {partialCount > 0 && (
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-bold text-orange-600">{partialCount} 部分成功</span>
                            </div>
                        )}
                        {failedCount > 0 && (
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-destructive" />
                                <span className="text-sm font-bold text-destructive">{failedCount} 失败</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                {(failedCount > 0 || partialCount > 0) && (
                    <div className="bg-orange-50/50 px-6 py-3 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                            <AlertCircle className="h-4 w-4" />
                            <span>部分操作未成功，请查看详情并重试</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyFailedSkus}
                            className="h-8 text-xs"
                        >
                            <Copy className="h-3 w-3 mr-1" />
                            复制失败SKU
                        </Button>
                    </div>
                )}

                {/* Results Table */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <Table>
                            <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[50px] text-center font-bold">#</TableHead>
                                    <TableHead className="w-[80px] text-center font-bold">状态</TableHead>
                                    <TableHead className="w-[180px] font-bold">SKU代码</TableHead>
                                    <TableHead className="min-w-[200px] font-bold">SKU名称</TableHead>
                                    <TableHead className="w-[200px] font-bold">渠道</TableHead>
                                    <TableHead className="min-w-[250px] font-bold">详情</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((result, idx) => (
                                    <TableRow 
                                        key={idx}
                                        className={cn(
                                            "transition-colors",
                                            result.status === "success" && "bg-green-50/30",
                                            result.status === "failed" && "bg-red-50/30",
                                            result.status === "partial" && "bg-orange-50/30"
                                        )}
                                    >
                                        <TableCell className="text-center text-xs text-muted-foreground font-medium">
                                            {idx + 1}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {result.status === "success" ? (
                                                <div className="flex justify-center">
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                </div>
                                            ) : result.status === "failed" ? (
                                                <div className="flex justify-center">
                                                    <XCircle className="h-5 w-5 text-destructive" />
                                                </div>
                                            ) : (
                                                <div className="flex justify-center">
                                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold">
                                            {result.skuCode}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {result.skuName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {result.status === "success" && result.channels.map(channel => (
                                                    <Badge key={channel} variant="outline" className="text-[10px] bg-green-50 border-green-200 text-green-700">
                                                        {channel}
                                                    </Badge>
                                                ))}
                                                {result.status === "partial" && (
                                                    <>
                                                        {result.successChannels?.map(channel => (
                                                            <Badge key={channel} variant="outline" className="text-[10px] bg-green-50 border-green-200 text-green-700">
                                                                ✓ {channel}
                                                            </Badge>
                                                        ))}
                                                        {result.failedChannels?.map(channel => (
                                                            <Badge key={channel} variant="outline" className="text-[10px] bg-red-50 border-red-200 text-red-700">
                                                                ✗ {channel}
                                                            </Badge>
                                                        ))}
                                                    </>
                                                )}
                                                {result.status === "failed" && result.channels.map(channel => (
                                                    <Badge key={channel} variant="outline" className="text-[10px] bg-red-50 border-red-200 text-red-700">
                                                        {channel}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {result.status === "success" ? (
                                                <span className="text-xs text-green-600 font-medium">操作成功</span>
                                            ) : result.status === "partial" ? (
                                                <span className="text-xs text-orange-600">
                                                    {result.successChannels?.length || 0} 个渠道成功，
                                                    {result.failedChannels?.length || 0} 个失败
                                                </span>
                                            ) : (
                                                <span className="text-xs text-destructive">
                                                    {result.errorMessage || "操作失败"}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t shrink-0 flex items-center justify-between gap-3 px-6">
                    <div className="text-sm text-muted-foreground">
                        {successCount === totalCount ? (
                            <span className="text-green-600 font-medium">✓ 所有操作已成功完成</span>
                        ) : failedCount === totalCount ? (
                            <span className="text-destructive font-medium">✗ 所有操作均失败</span>
                        ) : (
                            <span className="text-orange-600 font-medium">
                                ⚠ {successCount + partialCount} 个成功，{failedCount} 个失败
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={exportResults}
                            className="h-10 px-6 font-medium"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            导出结果
                        </Button>
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="bg-[#753BBD] hover:bg-[#9561D0] h-10 px-8 font-bold"
                        >
                            完成
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
