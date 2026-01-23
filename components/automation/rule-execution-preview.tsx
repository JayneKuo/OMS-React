"use client"

import * as React from "react"
import {
    RuleGroup,
    RoutingRule,
    TestOrder,
    ExecutionSimulationResult,
} from "@/lib/types/routing-rule"
import { simulateRuleExecution, getActionSummary, formatTestOrder } from "@/lib/utils/rule-executor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Play,
    ChevronDown,
    ChevronRight,
    CheckCircle2,
    XCircle,
    SkipForward,
    ArrowRight,
    Zap,
    AlertTriangle,
} from "lucide-react"

interface RuleExecutionPreviewProps {
    groups: RuleGroup[]
    rules: RoutingRule[]
}

// Sample test orders for quick testing
const SAMPLE_ORDERS: { name: string; order: TestOrder }[] = [
    {
        name: "标准订单",
        order: {
            poNumber: "PO-2024-001",
            poType: "STANDARD",
            supplier: "ABC Manufacturing",
            supplierType: "DOMESTIC",
            totalAmount: 5000,
            category: "Electronics",
            country: "US",
            isUrgent: false,
        },
    },
    {
        name: "急单 - 高价值",
        order: {
            poNumber: "PO-2024-002",
            poType: "RUSH",
            supplier: "XYZ Supplier",
            supplierType: "PREFERRED",
            totalAmount: 50000,
            category: "Components",
            country: "US",
            isUrgent: true,
            priority: "HIGH",
        },
    },
    {
        name: "进口订单",
        order: {
            poNumber: "PO-2024-003",
            poType: "IMPORT",
            supplier: "Global Trade Co",
            supplierType: "INTERNATIONAL",
            totalAmount: 25000,
            category: "Raw Materials",
            country: "CN",
            incoterm: "FOB",
        },
    },
    {
        name: "Dropship订单",
        order: {
            poNumber: "PO-2024-004",
            poType: "DROPSHIP",
            supplier: "Direct Supplier",
            supplierType: "DROPSHIP",
            totalAmount: 1500,
            category: "Finished Goods",
            country: "US",
        },
    },
]

export function RuleExecutionPreview({
    groups,
    rules,
}: RuleExecutionPreviewProps) {
    const [testOrder, setTestOrder] = React.useState<TestOrder>(SAMPLE_ORDERS[0].order)
    const [result, setResult] = React.useState<ExecutionSimulationResult | null>(null)
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())
    const [customFields, setCustomFields] = React.useState<{ key: string, value: string }[]>([])

    const handleRun = () => {
        // Merge custom fields into test order
        const orderWithCustom = { ...testOrder }
        for (const field of customFields) {
            if (field.key && field.value) {
                // Try to parse as number or boolean
                let parsedValue: any = field.value
                if (field.value === "true") parsedValue = true
                else if (field.value === "false") parsedValue = false
                else if (!isNaN(Number(field.value))) parsedValue = Number(field.value)

                orderWithCustom[field.key] = parsedValue
            }
        }

        const simulationResult = simulateRuleExecution(orderWithCustom, groups, rules)
        setResult(simulationResult)

        // Auto-expand groups with matches
        const matchedGroups = simulationResult.groupResults
            .filter(g => g.ruleResults.some(r => r.matched))
            .map(g => g.groupId)
        setExpandedGroups(new Set(matchedGroups))
    }

    const handleSelectSample = (sample: typeof SAMPLE_ORDERS[0]) => {
        setTestOrder(sample.order)
        setResult(null)
    }

    const toggleGroup = (groupId: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId)
        } else {
            newExpanded.add(groupId)
        }
        setExpandedGroups(newExpanded)
    }

    const updateOrderField = (field: string, value: any) => {
        setTestOrder(prev => ({ ...prev, [field]: value }))
        setResult(null)
    }

    const addCustomField = () => {
        setCustomFields([...customFields, { key: "", value: "" }])
    }

    const updateCustomField = (index: number, key: string, value: string) => {
        const updated = [...customFields]
        updated[index] = { key, value }
        setCustomFields(updated)
    }

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index))
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">规则执行预览 Execution Preview</h3>
            </div>
            <p className="text-sm text-muted-foreground">
                输入测试订单数据，预览规则匹配结果和执行的动作
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Panel */}
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">测试订单 Test Order</CardTitle>
                        <CardDescription>选择样本或自定义订单数据</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Sample selector */}
                        <div className="flex flex-wrap gap-2">
                            {SAMPLE_ORDERS.map((sample, idx) => (
                                <Button
                                    key={idx}
                                    variant={testOrder.poNumber === sample.order.poNumber ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleSelectSample(sample)}
                                >
                                    {sample.name}
                                </Button>
                            ))}
                        </div>

                        {/* Order fields */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                                <Label className="text-xs">PO Number</Label>
                                <Input
                                    value={testOrder.poNumber || ""}
                                    onChange={(e) => updateOrderField("poNumber", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">PO Type</Label>
                                <Select
                                    value={testOrder.poType || ""}
                                    onValueChange={(v) => updateOrderField("poType", v)}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="选择类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard</SelectItem>
                                        <SelectItem value="RUSH">Rush</SelectItem>
                                        <SelectItem value="IMPORT">Import</SelectItem>
                                        <SelectItem value="DROPSHIP">Dropship</SelectItem>
                                        <SelectItem value="BLANKET">Blanket</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Supplier</Label>
                                <Input
                                    value={testOrder.supplier || ""}
                                    onChange={(e) => updateOrderField("supplier", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Supplier Type</Label>
                                <Select
                                    value={testOrder.supplierType || ""}
                                    onValueChange={(v) => updateOrderField("supplierType", v)}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder="选择" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DOMESTIC">Domestic</SelectItem>
                                        <SelectItem value="INTERNATIONAL">International</SelectItem>
                                        <SelectItem value="PREFERRED">Preferred</SelectItem>
                                        <SelectItem value="DROPSHIP">Dropship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Total Amount</Label>
                                <Input
                                    type="number"
                                    value={testOrder.totalAmount || ""}
                                    onChange={(e) => updateOrderField("totalAmount", Number(e.target.value))}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Category</Label>
                                <Input
                                    value={testOrder.category || ""}
                                    onChange={(e) => updateOrderField("category", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Country</Label>
                                <Input
                                    value={testOrder.country || ""}
                                    onChange={(e) => updateOrderField("country", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                            <div className="space-y-1 flex items-end">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={testOrder.isUrgent || false}
                                        onCheckedChange={(v) => updateOrderField("isUrgent", v)}
                                    />
                                    <Label className="text-xs">Is Urgent 急单</Label>
                                </div>
                            </div>
                        </div>

                        {/* Custom fields */}
                        {customFields.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">自定义字段</Label>
                                {customFields.map((field, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            placeholder="字段名"
                                            value={field.key}
                                            onChange={(e) => updateCustomField(idx, e.target.value, field.value)}
                                            className="h-8 flex-1"
                                        />
                                        <Input
                                            placeholder="值"
                                            value={field.value}
                                            onChange={(e) => updateCustomField(idx, field.key, e.target.value)}
                                            className="h-8 flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeCustomField(idx)}
                                            className="h-8 w-8 p-0"
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={addCustomField}>
                                + 添加字段
                            </Button>
                            <div className="flex-1" />
                            <Button onClick={handleRun} className="gap-1">
                                <Play className="h-4 w-4" />
                                运行预览
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Result Panel */}
                <Card>
                    <CardHeader className="py-3">
                        <CardTitle className="text-base">执行结果 Results</CardTitle>
                        {result && (
                            <CardDescription>
                                已评估 {result.totalRulesEvaluated} 条规则，
                                匹配 {result.totalRulesMatched} 条，
                                执行 {result.totalActionsExecuted} 个动作
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {!result ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Play className="h-8 w-8 mb-2 opacity-50" />
                                <p className="text-sm">点击"运行预览"查看规则匹配结果</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Summary */}
                                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                                    <div className="font-medium mb-1">测试订单</div>
                                    <div className="text-muted-foreground">{formatTestOrder(result.testOrder)}</div>
                                </div>

                                {/* Group results */}
                                <div className="space-y-2">
                                    {result.groupResults.map((groupResult) => {
                                        const matchedRules = groupResult.ruleResults.filter(r => r.matched)
                                        const isExpanded = expandedGroups.has(groupResult.groupId)

                                        return (
                                            <Collapsible
                                                key={groupResult.groupId}
                                                open={isExpanded}
                                                onOpenChange={() => toggleGroup(groupResult.groupId)}
                                            >
                                                <CollapsibleTrigger asChild>
                                                    <div
                                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/50 ${matchedRules.length > 0 ? "bg-green-50" : "bg-muted/30"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                            <span className="font-medium text-sm">{groupResult.groupName}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {groupResult.executionMode}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {matchedRules.length > 0 ? (
                                                                <Badge className="bg-green-100 text-green-700">
                                                                    {matchedRules.length} 匹配
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary">无匹配</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CollapsibleTrigger>

                                                <CollapsibleContent>
                                                    <div className="pl-6 pt-2 space-y-1">
                                                        {groupResult.ruleResults.map((ruleResult) => (
                                                            <div
                                                                key={ruleResult.ruleId}
                                                                className={`flex items-start gap-2 p-2 rounded text-sm ${ruleResult.matched
                                                                        ? "bg-green-50"
                                                                        : ruleResult.skippedReason
                                                                            ? "bg-yellow-50"
                                                                            : "bg-gray-50"
                                                                    }`}
                                                            >
                                                                {ruleResult.matched ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                                                                ) : ruleResult.skippedReason ? (
                                                                    <SkipForward className="h-4 w-4 text-yellow-500 mt-0.5" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                                                                )}
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{ruleResult.ruleName}</div>
                                                                    {ruleResult.matched && ruleResult.matchedConditions.length > 0 && (
                                                                        <div className="text-xs text-green-600 mt-1">
                                                                            匹配条件: {ruleResult.matchedConditions.join(", ")}
                                                                        </div>
                                                                    )}
                                                                    {ruleResult.skippedReason && (
                                                                        <div className="text-xs text-yellow-600 mt-1">
                                                                            跳过: {ruleResult.skippedReason}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        )
                                    })}
                                </div>

                                {/* Final actions */}
                                {result.finalActions.length > 0 && (
                                    <div className="border-t pt-3">
                                        <div className="text-sm font-medium mb-2 flex items-center gap-2">
                                            <ArrowRight className="h-4 w-4" />
                                            最终执行动作
                                        </div>
                                        <div className="space-y-1">
                                            {getActionSummary(result.finalActions).map((summary, idx) => (
                                                <div
                                                    key={idx}
                                                    className="text-sm p-2 rounded bg-blue-50 text-blue-700"
                                                >
                                                    {summary}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Show overridden actions */}
                                        {result.finalActions.some(a => a.overriddenBy) && (
                                            <div className="mt-2">
                                                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    被覆盖的动作 (不会执行)
                                                </div>
                                                {result.finalActions
                                                    .filter(a => a.overriddenBy)
                                                    .map((action, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="text-xs p-2 rounded bg-gray-100 text-gray-500 line-through"
                                                        >
                                                            {action.actionType} from {action.sourceRuleName} (被 {action.overriddenBy} 覆盖)
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {result.finalActions.length === 0 && (
                                    <div className="text-center py-4 text-sm text-muted-foreground border-t">
                                        没有匹配的规则，不会执行任何动作
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
