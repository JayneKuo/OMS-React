"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Settings,
    Filter,
    Zap,
    Check,
    AlertCircle,
    ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import { ConditionBuilderV2 } from "./condition-builder-v2"
import { PORoutingActionsConfigV2 } from "./po-routing-actions-config-v2"
import type { RoutingRule, RoutingRuleCondition, ConditionLogic, ExecutionMode, RuleAction, RuleType } from "@/lib/types/routing-rule"

// ============================================================================
// TYPES
// ============================================================================

interface PORoutingRuleDialogV3Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    rule: RoutingRule | null
    onSave: (rule: RoutingRule) => void
    locale?: "en" | "zh"
}

// ============================================================================
// MAIN COMPONENT - SINGLE PAGE LAYOUT
// ============================================================================

export function PORoutingRuleDialogV3({ open, onOpenChange, rule, onSave, locale = "zh" }: PORoutingRuleDialogV3Props) {
    // Form state
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [type, setType] = React.useState<RuleType>("PO_ROUTING")
    const [enabled, setEnabled] = React.useState(true)
    const [executionMode, setExecutionMode] = React.useState<ExecutionMode>("FIRST_MATCH")
    const [conditions, setConditions] = React.useState<RoutingRuleCondition[]>([])
    const [conditionLogic, setConditionLogic] = React.useState<ConditionLogic>("AND")
    const [actions, setActions] = React.useState<RuleAction[]>([])

    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    // Initialize form when dialog opens
    React.useEffect(() => {
        if (open) {
            if (rule) {
                setName(rule.name)
                setDescription(rule.description || "")
                setType(rule.type as RuleType || "PO_ROUTING")
                setEnabled(rule.enabled)
                setExecutionMode(rule.executionMode || "FIRST_MATCH")
                setConditions(rule.conditions || [])
                setConditionLogic(rule.conditionLogic || "AND")
                setActions(rule.actions || [])
            } else {
                setName("")
                setDescription("")
                setType("PO_ROUTING")
                setEnabled(true)
                setExecutionMode("FIRST_MATCH")
                setConditions([])
                setConditionLogic("AND")
                setActions([])
            }
        }
    }, [open, rule])

    const handleSave = () => {
        if (!name.trim()) {
            toast.error(t("Please enter rule name", "请输入规则名称"))
            return
        }

        const savedRule: RoutingRule = {
            id: rule?.id || `rule-${Date.now()}`,
            name: name.trim(),
            description: description.trim(),
            type: type,
            enabled,
            priority: rule?.priority || 1,
            executionMode,
            conditions,
            conditionLogic,
            actions,
            createdAt: rule?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        onSave(savedRule)
        onOpenChange(false)
        toast.success(rule ? t("Rule updated successfully", "规则更新成功") : t("Rule created successfully", "规则创建成功"))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[1400px] max-h-[95vh] p-0 flex flex-col">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl">
                                {rule ? t("Edit Routing Rule", "编辑路由规则") : t("Create Routing Rule", "创建路由规则")}
                            </DialogTitle>
                            <DialogDescription>
                                {t("Configure PO routing rule: set conditions and actions", "配置采购订单自动路由规则：设置触发条件和执行动作")}
                            </DialogDescription>
                        </div>

                        {/* Rule Preview Summary */}
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                                <Filter className="h-4 w-4" />
                                <span className="font-medium">{conditions.length}</span>
                                <span className="text-blue-600/70 dark:text-blue-400/70">{t("Conditions", "条件")}</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                                <Zap className="h-4 w-4" />
                                <span className="font-medium">{actions.length}</span>
                                <span className="text-green-600/70 dark:text-green-400/70">{t("Actions", "动作")}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content - Three Column Layout */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[calc(95vh-180px)]">
                        <div className="p-6 space-y-6">

                            {/* Top Section: Basic Config */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-base">{t("Basic Configuration", "基本配置")}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Rule Name */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                {t("Rule Name", "规则名称")} <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder={t("e.g., Brazil Warehouse Routing", "例如：巴西仓库路由规则")}
                                                className="h-10"
                                            />
                                        </div>

                                        {/* Rule Type */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t("Rule Type", "规则类型")}</Label>
                                            <Select value={type} onValueChange={(v) => setType(v as RuleType)}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PO_ROUTING">{t("PO Inbound Routing", "采购入库路由")}</SelectItem>
                                                    <SelectItem value="ORDER_RISK">{t("Order Risk Control", "订单风控规则")}</SelectItem>
                                                    <SelectItem value="CUSTOM">{t("Custom Logic", "自定义逻辑")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t("Description", "规则描述")}</Label>
                                            <Input
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder={t("Describe the purpose of this rule", "描述此规则的用途")}
                                                className="h-10"
                                            />
                                        </div>

                                        {/* Execution Mode & Enable */}
                                        <div className="flex items-end gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label className="text-sm font-medium">{t("Execution Mode", "执行模式")}</Label>
                                                <Select value={executionMode} onValueChange={(v) => setExecutionMode(v as ExecutionMode)}>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="FIRST_MATCH">🎯 {t("First Match", "首次匹配")}</SelectItem>
                                                        <SelectItem value="CHAIN">🔗 {t("Chain Execution", "链式执行")}</SelectItem>
                                                        <SelectItem value="ALL_MATCH">🎭 {t("All Match", "全部匹配")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/30">
                                                <Switch checked={enabled} onCheckedChange={setEnabled} />
                                                <Label className="text-sm font-medium cursor-pointer">
                                                    {enabled ? t("Enabled", "启用") : t("Disabled", "禁用")}
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* IF-THEN Vertical Layout */}
                            <div className="space-y-6">
                                {/* IF: Conditions */}
                                <Card className="border-l-4 border-l-blue-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs font-bold">
                                                    IF
                                                </Badge>
                                                <CardTitle className="text-base">{t("Trigger Conditions", "触发条件")}</CardTitle>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {conditions.length === 0 ? t("No conditions set, matches all orders", "未设置条件，匹配所有订单") : `${conditions.length} ${t("conditions", "个条件")}`}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <ConditionBuilderV2
                                            conditions={conditions}
                                            conditionLogic={conditionLogic}
                                            onChange={(newConditions, newLogic) => {
                                                setConditions(newConditions)
                                                setConditionLogic(newLogic)
                                            }}
                                            locale={locale}
                                            ruleType={type}
                                        />
                                    </CardContent>
                                </Card>

                                {/* THEN: Actions */}
                                <Card className="border-l-4 border-l-green-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs font-bold">
                                                    THEN
                                                </Badge>
                                                <CardTitle className="text-base">{t("Execution Actions", "执行动作")}</CardTitle>
                                            </div>
                                            <CardDescription className="text-xs">
                                                {actions.length === 0 ? t("No actions configured", "未配置动作") : `${actions.length} ${t("actions", "个动作")}`}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <PORoutingActionsConfigV2
                                            actions={actions}
                                            onChange={setActions}
                                            locale={locale}
                                            ruleType={type}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Info Banner */}
                            {(conditions.length > 0 || actions.length > 0) && (
                                <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-medium">{t("Rule Preview", "规则预览")}</p>
                                            <p className="text-muted-foreground mt-1">
                                                <span className="font-mono bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300">
                                                    IF
                                                </span>
                                                {" "}
                                                {conditions.length === 0
                                                    ? t("matches all purchase orders", "匹配所有采购订单")
                                                    : t(`matches ${conditions.length} condition(s) (${conditionLogic === "AND" ? "ALL" : "ANY"})`, `满足 ${conditions.length} 个条件（${conditionLogic === "AND" ? "全部" : "任一"}）`)
                                                }
                                                {" "}
                                                <span className="font-mono bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-green-700 dark:text-green-300">
                                                    THEN
                                                </span>
                                                {" "}
                                                {actions.length === 0
                                                    ? t("perform no actions", "不执行任何动作")
                                                    : t(`perform ${actions.length} action(s)`, `执行 ${actions.length} 个动作`)
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="text-sm text-muted-foreground">
                            {!name.trim() && <span className="text-destructive">{t("Please enter rule name", "请输入规则名称")}</span>}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                {t("Cancel", "取消")}
                            </Button>
                            <Button onClick={handleSave} disabled={!name.trim()}>
                                <Check className="h-4 w-4 mr-1" />
                                {rule ? t("Save Changes", "保存更改") : t("Create Rule", "创建规则")}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default PORoutingRuleDialogV3
