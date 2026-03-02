"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Settings, Check, PauseCircle, CalendarRange, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { ConditionBuilderV2 } from "./condition-builder-v2"
import type { RoutingRule, RoutingRuleCondition, ConditionLogic, RuleType } from "@/lib/types/routing-rule"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

// ============================================================================
// DATE RANGE PICKER COMPONENT
// ============================================================================

interface DateRangePickerProps {
    start: string
    end: string
    onStartChange: (v: string) => void
    onEndChange: (v: string) => void
    locale?: "en" | "zh"
}

function DateRangePicker({ start, end, onStartChange, onEndChange, locale = "zh" }: DateRangePickerProps) {
    const [open, setOpen] = React.useState(false)
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    const displayValue = start && end
        ? `${start.replace("T", " ")} ~ ${end.replace("T", " ")}`
        : start
            ? `${start.replace("T", " ")} ~ ...`
            : t("Select date range", "选择时间范围")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className={cn(
                    "flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm transition-colors hover:bg-muted/50",
                    !start && !end && "text-muted-foreground"
                )}>
                    <CalendarRange className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="whitespace-nowrap">{displayValue}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 space-y-3" align="start">
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("Start", "开始时间")}</Label>
                    <Input
                        type="datetime-local"
                        value={start}
                        onChange={e => onStartChange(e.target.value)}
                        className="h-9 w-56"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t("End", "结束时间")}</Label>
                    <Input
                        type="datetime-local"
                        value={end}
                        min={start || undefined}
                        onChange={e => onEndChange(e.target.value)}
                        className="h-9 w-56"
                    />
                </div>
                <div className="flex justify-end pt-1">
                    <Button size="sm" onClick={() => setOpen(false)} disabled={!start || !end}>
                        {t("Confirm", "确认")}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

// ============================================================================
// TYPES
// ============================================================================

interface SOHoldRuleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    rule: RoutingRule | null
    onSave: (rule: RoutingRule) => void
    locale?: "en" | "zh"
}

// ============================================================================
// RULE TYPE CONFIGURATIONS
// ============================================================================

interface RuleTypeConfig {
    type: RuleType
    label: string
    labelZh: string
    description: string
    descriptionZh: string
    icon: React.ReactNode
    recommendedActions: string[]
}

const ruleTypeConfigs: RuleTypeConfig[] = [
    {
        type: "HOLD_ORDER",
        label: "Hold Order",
        labelZh: "暂停订单",
        description: "Automatically hold orders that meet criteria",
        descriptionZh: "自动暂停符合条件的订单",
        icon: <PauseCircle className="h-4 w-4" />,
        recommendedActions: ["HOLD_ORDER", "SEND_NOTIFICATION", "SET_PRIORITY", "ADD_TAG"]
    },
    {
        type: "CUSTOM",
        label: "Custom Rule",
        labelZh: "自定义规则",
        description: "Create custom automation rule with any actions",
        descriptionZh: "创建自定义自动化规则，可使用任意动作",
        icon: <Settings className="h-4 w-4" />,
        recommendedActions: []
    }
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SOHoldRuleDialog({ open, onOpenChange, rule, onSave, locale = "zh" }: SOHoldRuleDialogProps) {
    // Form state
    const [name, setName] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [ruleType, setRuleType] = React.useState<RuleType>("HOLD_ORDER")
    const [enabled, setEnabled] = React.useState(true)
    const [priority, setPriority] = React.useState<number>(1)
    const [conditions, setConditions] = React.useState<RoutingRuleCondition[]>([])
    const [conditionLogic, setConditionLogic] = React.useState<ConditionLogic>("AND")
    // Hold action – always HOLD_ORDER, not configurable
    // holdType: "NORMAL" = 普通暂停, "RISK" = 风险暂停
    const [holdType, setHoldType] = React.useState<"NORMAL" | "RISK">("NORMAL")
    // Normal hold: duration until auto-release
    const [holdDurationMode, setHoldDurationMode] = React.useState<"DURATION" | "UNTIL">("DURATION")
    const [holdDurationUnit, setHoldDurationUnit] = React.useState<"HOURS" | "DAYS">("HOURS")
    const [holdDurationValue, setHoldDurationValue] = React.useState<number>(24)
    const [holdUntilDatetime, setHoldUntilDatetime] = React.useState<string>("")
    const [holdUntilDatetimeEnd, setHoldUntilDatetimeEnd] = React.useState<string>("")
    // Risk hold: simple condition-based release
    const [riskReleaseRecommendations, setRiskReleaseRecommendations] = React.useState<string[]>([])
    const [riskReleaseLevels, setRiskReleaseLevels] = React.useState<string[]>([])
    const [riskReleaseConditionLogic, setRiskReleaseConditionLogic] = React.useState<"AND" | "OR">("OR")
    // Risk hold: failsafe
    const [failsafeAction, setFailsafeAction] = React.useState<"RELEASE" | "KEEP">("RELEASE")
    const [failsafeDurationUnit, setFailsafeDurationUnit] = React.useState<"HOURS" | "DAYS">("HOURS")
    const [failsafeDurationValue, setFailsafeDurationValue] = React.useState<number>(48)

    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    // Get current rule type config
    const currentRuleTypeConfig = ruleTypeConfigs.find(c => c.type === ruleType)

    // Initialize form when dialog opens
    React.useEffect(() => {
        if (open) {
            if (rule) {
                setName(rule.name)
                setDescription(rule.description || "")
                setRuleType(rule.type)
                setEnabled(rule.enabled)
                setPriority(rule.priority || 1)
                setConditions(rule.conditions || [])
                setConditionLogic(rule.conditionLogic || "AND")
                // Restore hold action fields
                const holdAction = rule.actions?.find((a: any) => a.type === "HOLD_ORDER") as any
                setHoldType(holdAction?.holdType || "NORMAL")
                setHoldDurationMode(holdAction?.holdDurationMode || "DURATION")
                setHoldDurationUnit(holdAction?.holdDurationUnit || "HOURS")
                setHoldDurationValue(holdAction?.holdDurationValue || 24)
                setHoldUntilDatetime(holdAction?.holdUntilDatetime || "")
                setHoldUntilDatetimeEnd(holdAction?.holdUntilDatetimeEnd || "")
                setRiskReleaseRecommendations(holdAction?.riskRelease?.recommendations || [])
                setRiskReleaseLevels(holdAction?.riskRelease?.levels || [])
                setRiskReleaseConditionLogic(holdAction?.riskRelease?.logic || "OR")
                setFailsafeAction(holdAction?.failsafe?.action || "RELEASE")
                setFailsafeDurationUnit(holdAction?.failsafe?.unit || "HOURS")
                setFailsafeDurationValue(holdAction?.failsafe?.value || 48)
            } else {
                setName("")
                setDescription("")
                setRuleType("HOLD_ORDER")
                setEnabled(true)
                setPriority(1)
                setConditions([])
                setConditionLogic("AND")
                setHoldType("NORMAL")
                setHoldDurationMode("DURATION")
                setHoldDurationUnit("HOURS")
                setHoldDurationValue(24)
                setHoldUntilDatetime("")
                setHoldUntilDatetimeEnd("")
                setRiskReleaseRecommendations([])
                setRiskReleaseLevels([])
                setRiskReleaseConditionLogic("OR")
                setFailsafeAction("RELEASE")
                setFailsafeDurationUnit("HOURS")
                setFailsafeDurationValue(48)
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
            type: ruleType,
            enabled,
            priority,
            conditions,
            conditionLogic,
            actions: [{
                type: "HOLD_ORDER",
                holdType,
                holdDurationMode: holdType === "NORMAL" ? holdDurationMode : undefined,
                holdDurationUnit: holdType === "NORMAL" && holdDurationMode === "DURATION" ? holdDurationUnit : undefined,
                holdDurationValue: holdType === "NORMAL" && holdDurationMode === "DURATION" ? holdDurationValue : undefined,
                holdUntilDatetime: holdType === "NORMAL" && holdDurationMode === "UNTIL" ? holdUntilDatetime : undefined,
                holdUntilDatetimeEnd: holdType === "NORMAL" && holdDurationMode === "UNTIL" ? holdUntilDatetimeEnd : undefined,
                riskRelease: holdType === "RISK" ? {
                    recommendations: riskReleaseRecommendations,
                    levels: riskReleaseLevels,
                    logic: riskReleaseConditionLogic
                } : undefined,
                failsafe: holdType === "RISK" ? {
                    action: failsafeAction,
                    unit: failsafeAction === "RELEASE" ? failsafeDurationUnit : undefined,
                    value: failsafeAction === "RELEASE" ? failsafeDurationValue : undefined
                } : undefined
            } as any],
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
                                {rule ? t("Edit Hold Rule", "编辑拦截规则") : t("Create Hold Rule", "创建拦截规则")}
                            </DialogTitle>
                            <DialogDescription>
                                {t("Configure sales order hold rule: set conditions and actions", "配置销售订单拦截规则：设置触发条件和执行动作")}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-[calc(95vh-180px)]">
                        <div className="p-6 space-y-6">

                            {/* Basic Configuration */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-base">{t("Basic Configuration", "基本配置")}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                                        {/* Row 1: Rule Name | Rule Type | Priority */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                {t("Rule Name", "规则名称")} <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder={t("e.g., High Risk Address Hold", "例如：高风险地址拦截")}
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">
                                                {t("Rule Type", "规则类型")} <span className="text-destructive">*</span>
                                            </Label>
                                            <Select value={ruleType} onValueChange={(v) => setRuleType(v as RuleType)}>
                                                <SelectTrigger className="h-10">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ruleTypeConfigs.map(config => (
                                                        <SelectItem key={config.type} value={config.type}>
                                                            <div className="flex items-center gap-2">
                                                                {config.icon}
                                                                <span>{locale === "zh" ? config.labelZh : config.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">{t("Priority", "优先级")}</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={999}
                                                    value={priority}
                                                    onChange={(e) => setPriority(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="h-10 w-24"
                                                />
                                                <span className="text-xs text-muted-foreground">{t("Higher number = higher priority. Priority must be unique.", "数字越大优先级越高，优先级不可重复")}</span>
                                            </div>
                                        </div>

                                        {/* Row 2: Description (span 2) | Enable Switch */}
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-sm font-medium">{t("Description", "规则描述")}</Label>
                                            <Input
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder={t("Describe the purpose of this rule", "描述此规则的用途")}
                                                className="h-10"
                                            />
                                        </div>

                                        <div className="flex items-end">
                                            <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/30 w-full">
                                                <Switch checked={enabled} onCheckedChange={setEnabled} />
                                                <Label className="text-sm font-medium cursor-pointer">
                                                    {enabled ? t("Enabled", "启用") : t("Disabled", "禁用")}
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rule Type Info Banner - removed */}

                            {/* IF-THEN Layout */}
                            <div className="space-y-6">
                                {/* IF: Conditions */}
                                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base">{t("Trigger Conditions", "触发条件")}</CardTitle>
                                            </div>
                                            <CardDescription className="text-xs mt-1">
                                                {t("Define when this rule should be triggered. Orders matching these conditions will be held automatically.", "定义此规则的触发时机。满足以下条件的订单将被自动拦截。")}
                                            </CardDescription>
                                            <CardDescription className="text-xs">
                                                {conditions.length > 0 && `${conditions.length} ${t("conditions", "个条件")}`}
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
                                            ruleType="SO_HOLD"
                                        />
                                    </CardContent>
                                </Card>

                                {/* Execution Actions - fixed HOLD_ORDER */}
                                <Card className="border-l-4 border-l-green-500 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base">{t("Execution Actions", "执行动作")}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">

                                            {/* Fixed action badge */}
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                                                <PauseCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                <span className="text-sm font-medium text-green-800 dark:text-green-200">{t("Hold Order", "暂停订单")}</span>
                                            </div>

                                            {/* Hold Type */}
                                            <div className="w-48 space-y-2">
                                                <Label className="text-sm font-medium">{t("Hold Type", "暂停类型")}</Label>
                                                <Select value={holdType} onValueChange={(v) => setHoldType(v as "NORMAL" | "RISK")}>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="NORMAL">{t("Normal Hold", "普通暂停")}</SelectItem>
                                                        <SelectItem value="RISK">{t("Risk Hold", "风险暂停")}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* ── Normal Hold: duration config ── */}
                                            {holdType === "NORMAL" && (
                                                <div className="space-y-2 pt-3 border-t">
                                                    <Label className="text-sm font-medium">{t("Hold Duration", "Hold 时长")}</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Select value={holdDurationMode} onValueChange={(v) => setHoldDurationMode(v as "DURATION" | "UNTIL")}>
                                                            <SelectTrigger className="h-9 w-32">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="DURATION">{t("Duration", "时长")}</SelectItem>
                                                                <SelectItem value="UNTIL">{t("Until date/time", "指定时间")}</SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        {holdDurationMode === "DURATION" && (
                                                            <>
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    value={holdDurationValue}
                                                                    onChange={e => setHoldDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                                                                    className="h-9 w-20"
                                                                />
                                                                <Select value={holdDurationUnit} onValueChange={(v) => setHoldDurationUnit(v as "HOURS" | "DAYS")}>
                                                                    <SelectTrigger className="h-9 w-24">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="HOURS">{t("Hours", "小时")}</SelectItem>
                                                                        <SelectItem value="DAYS">{t("Days", "天")}</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="text-sm text-muted-foreground">{t("then auto-release", "后自动释放")}</span>
                                                            </>
                                                        )}

                                                        {holdDurationMode === "UNTIL" && (
                                                            <>
                                                                <DateRangePicker
                                                                    start={holdUntilDatetime}
                                                                    end={holdUntilDatetimeEnd}
                                                                    onStartChange={setHoldUntilDatetime}
                                                                    onEndChange={setHoldUntilDatetimeEnd}
                                                                    locale={locale}
                                                                />
                                                                <span className="text-sm text-muted-foreground">{t("then auto-release", "后自动释放")}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── Risk Hold config ── */}
                                            {holdType === "RISK" && (
                                                <div className="space-y-4 pt-3 border-t">

                                                    {/* Condition-based release */}
                                                    <div className="space-y-3">
                                                        <div>
                                                            <Label className="text-sm font-medium">{t("Hold until the condition is met", "满足条件时释放")}</Label>
                                                            <p className="text-xs text-muted-foreground mt-0.5">{t("Order will be released when any/all of the following conditions are satisfied.", "当以下条件满足时，订单将自动释放。")}</p>
                                                        </div>

                                                        {/* Logic toggle */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground">{t("Match:", "匹配方式：")}</span>
                                                            <div className="flex items-center bg-muted rounded-md p-0.5">
                                                                {(["OR", "AND"] as const).map(logic => (
                                                                    <button
                                                                        key={logic}
                                                                        onClick={() => setRiskReleaseConditionLogic(logic)}
                                                                        className={cn(
                                                                            "px-2.5 py-1 text-xs font-medium rounded transition-all",
                                                                            riskReleaseConditionLogic === logic
                                                                                ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                                                                                : "text-muted-foreground hover:text-foreground"
                                                                        )}
                                                                    >
                                                                        {logic === "OR" ? t("Any", "任一") : t("All", "全部")}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Risk Recommendation — dropdown multi-select */}
                                                        <div className="space-y-1.5">
                                                            <span className="text-xs font-medium text-muted-foreground">{t("Risk Recommendation", "风险评估建议")}</span>
                                                            {(() => {
                                                                const recOpts = [
                                                                    { value: "ACCEPT", label: t("Accept", "接受") },
                                                                    { value: "INVESTIGATE", label: t("Investigate", "调查") },
                                                                    { value: "CANCEL", label: t("Cancel", "取消") },
                                                                    { value: "NONE", label: t("None", "无") },
                                                                ]
                                                                const recDisplay = riskReleaseRecommendations.length === 0
                                                                    ? t("Select...", "请选择...")
                                                                    : recOpts.filter(o => riskReleaseRecommendations.includes(o.value)).map(o => o.label).join(", ")
                                                                return (
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button className="flex items-center justify-between gap-2 h-9 px-3 w-56 rounded-md border border-input bg-background text-sm hover:bg-muted/50 transition-colors">
                                                                                <span className={cn("truncate", riskReleaseRecommendations.length === 0 && "text-muted-foreground")}>{recDisplay}</span>
                                                                                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-56 p-1" align="start">
                                                                            {recOpts.map(opt => (
                                                                                <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer text-sm">
                                                                                    <Checkbox
                                                                                        checked={riskReleaseRecommendations.includes(opt.value)}
                                                                                        onCheckedChange={(checked) => setRiskReleaseRecommendations(prev =>
                                                                                            checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value)
                                                                                        )}
                                                                                    />
                                                                                    {opt.label}
                                                                                </label>
                                                                            ))}
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                )
                                                            })()}
                                                        </div>

                                                        {/* Risk Level — dropdown multi-select */}
                                                        <div className="space-y-1.5">
                                                            <span className="text-xs font-medium text-muted-foreground">{t("Risk Level", "风险等级")}</span>
                                                            {(() => {
                                                                const levelOpts = [
                                                                    { value: "HIGH", label: t("High", "高风险") },
                                                                    { value: "MEDIUM", label: t("Medium", "中风险") },
                                                                    { value: "LOW", label: t("Low", "低风险") },
                                                                    { value: "NONE", label: t("None", "无风险") },
                                                                ]
                                                                const levelDisplay = riskReleaseLevels.length === 0
                                                                    ? t("Select...", "请选择...")
                                                                    : levelOpts.filter(o => riskReleaseLevels.includes(o.value)).map(o => o.label).join(", ")
                                                                return (
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button className="flex items-center justify-between gap-2 h-9 px-3 w-56 rounded-md border border-input bg-background text-sm hover:bg-muted/50 transition-colors">
                                                                                <span className={cn("truncate", riskReleaseLevels.length === 0 && "text-muted-foreground")}>{levelDisplay}</span>
                                                                                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-56 p-1" align="start">
                                                                            {levelOpts.map(opt => (
                                                                                <label key={opt.value} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer text-sm">
                                                                                    <Checkbox
                                                                                        checked={riskReleaseLevels.includes(opt.value)}
                                                                                        onCheckedChange={(checked) => setRiskReleaseLevels(prev =>
                                                                                            checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value)
                                                                                        )}
                                                                                    />
                                                                                    {opt.label}
                                                                                </label>
                                                                            ))}
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                )
                                                            })()}
                                                        </div>
                                                    </div>

                                                    {/* Failsafe Release */}
                                                    <div className="space-y-2 pt-3 border-t">
                                                        <Label className="text-sm font-medium">{t("Failsafe Release", "兜底释放")}</Label>
                                                        <p className="text-xs text-muted-foreground">{t("If the condition is never met, decide what happens after a set duration.", "如果条件始终未满足，设定时长后的处理方式。")}</p>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={failsafeDurationValue}
                                                                onChange={e => setFailsafeDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="h-9 w-20"
                                                            />
                                                            <Select value={failsafeDurationUnit} onValueChange={(v) => setFailsafeDurationUnit(v as "HOURS" | "DAYS")}>
                                                                <SelectTrigger className="h-9 w-24">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="HOURS">{t("Hours", "小时")}</SelectItem>
                                                                    <SelectItem value="DAYS">{t("Days", "天")}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Select value={failsafeAction} onValueChange={(v) => setFailsafeAction(v as "RELEASE" | "KEEP")}>
                                                                <SelectTrigger className="h-9 w-40">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="RELEASE">{t("then auto-release", "后自动释放")}</SelectItem>
                                                                    <SelectItem value="KEEP">{t("then keep on hold", "后保持暂停")}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                </div>
                                            )}

                                        </div>
                                    </CardContent>
                                </Card>
                            </div>


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

export default SOHoldRuleDialog
