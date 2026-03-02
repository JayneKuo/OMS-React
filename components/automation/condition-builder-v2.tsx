"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Plus,
    X,
    Trash2,
    Search,
    ChevronRight,
    ChevronDown,
    Filter,
    ArrowRight
} from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"
import { fieldDefinitions, type FieldDefinition } from "./condition-fields"
import type { RoutingRuleCondition, ConditionLogic, ConditionOperator, RuleType } from "@/lib/types/routing-rule"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

interface ConditionBuilderV2Props {
    conditions: RoutingRuleCondition[]
    conditionLogic: ConditionLogic
    onChange: (conditions: RoutingRuleCondition[], conditionLogic: ConditionLogic) => void
    locale?: "en" | "zh"
    ruleType?: RuleType | string
}

export function ConditionBuilderV2({
    conditions,
    conditionLogic,
    onChange,
    locale = "zh",
    ruleType = "CUSTOM"
}: ConditionBuilderV2Props) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en
    const [searchQuery, setSearchQuery] = React.useState("")
    const [openCategories, setOpenCategories] = React.useState<string[]>([])

    // 1. Filter fields based on rule type and search query
    const filteredFields = React.useMemo(() => {
        let fields = fieldDefinitions

        // Filter by rule type
        if (ruleType && ruleType !== "CUSTOM") {
            fields = fields.filter(f =>
                !f.applicableRuleTypes || f.applicableRuleTypes.includes(ruleType as RuleType)
            )
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            fields = fields.filter(f =>
                f.label.toLowerCase().includes(query) ||
                f.labelZh.toLowerCase().includes(query) ||
                f.id.toLowerCase().includes(query)
            )
        }

        return fields
    }, [ruleType, searchQuery])

    // 2. Group fields by category
    const groupedFields = React.useMemo(() => {
        const groups: Record<string, FieldDefinition[]> = {}
        filteredFields.forEach(field => {
            const categoryKey = locale === "zh" ? field.categoryZh : field.category
            if (!groups[categoryKey]) {
                groups[categoryKey] = []
            }
            groups[categoryKey].push(field)
        })
        return groups
    }, [filteredFields, locale])

    // Initialize open categories
    React.useEffect(() => {
        if (openCategories.length === 0 && Object.keys(groupedFields).length > 0) {
            // Open first category by default
            setOpenCategories([Object.keys(groupedFields)[0]])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // Intentionally empty dependency array to run only once or when groupedFields changes significantly enough to warrant reset is confusing so just once is fine basically.
    // Actually, let's just default open all if searching.
    React.useEffect(() => {
        if (searchQuery.trim()) {
            setOpenCategories(Object.keys(groupedFields))
        }
    }, [searchQuery, groupedFields])


    const toggleCategory = (category: string) => {
        setOpenCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        )
    }

    const getFieldDefinition = (fieldId: string) => {
        return fieldDefinitions.find(f => f.id === fieldId)
    }

    const handleAddCondition = (fieldId: string) => {
        const fieldDef = getFieldDefinition(fieldId)
        const newCondition: RoutingRuleCondition = {
            id: `cond-${Date.now()}`,
            field: fieldId as any,
            operator: fieldDef?.operators?.[0] || "equals",
            value: "",
            logic: "AND"
        }
        onChange([...conditions, newCondition], conditionLogic)
    }

    const handleRemoveCondition = (index: number) => {
        const newConditions = [...conditions]
        newConditions.splice(index, 1)
        onChange(newConditions, conditionLogic)
    }

    const handleUpdateCondition = (index: number, updates: Partial<RoutingRuleCondition>) => {
        const newConditions = [...conditions]
        newConditions[index] = { ...newConditions[index], ...updates }
        onChange(newConditions, conditionLogic)
    }

    const renderOperatorOptions = (fieldId: string) => {
        const fieldDef = getFieldDefinition(fieldId)
        if (!fieldDef) return null

        const operatorLabels: Record<string, { en: string, zh: string }> = {
            "equals": { en: "Equals", zh: "等于" },
            "notEquals": { en: "Does not equal", zh: "不等于" },
            "contains": { en: "Contains", zh: "包含" },
            "notContains": { en: "Does not contain", zh: "不包含" },
            "greaterThan": { en: "Greater than", zh: "大于" },
            "lessThan": { en: "Less than", zh: "小于" },
            "greaterThanOrEqual": { en: "Greater than or equal", zh: "大于等于" },
            "lessThanOrEqual": { en: "Less than or equal", zh: "小于等于" },
            "in": { en: "In list", zh: "在列表中" },
            "notIn": { en: "Not in list", zh: "不在列表中" },
            "startsWith": { en: "Starts with", zh: "开头是" },
            "endsWith": { en: "Ends with", zh: "结尾是" },
            "isEmpty": { en: "Is empty", zh: "为空" },
            "isNotEmpty": { en: "Is not empty", zh: "不为空" },
            "before": { en: "Before", zh: "早于" },
            "after": { en: "After", zh: "晚于" },
            "between": { en: "Between", zh: "介于" }
        }

        return fieldDef.operators.map(op => (
            <SelectItem key={op} value={op}>
                {locale === "zh" ? operatorLabels[op]?.zh || op : operatorLabels[op]?.en || op}
            </SelectItem>
        ))
    }

    const renderValueInput = (condition: RoutingRuleCondition, index: number) => {
        const fieldDef = getFieldDefinition(condition.field)
        if (!fieldDef) return <Input disabled />

        // Boolean Type
        if (fieldDef.type === "boolean") {
            return (
                <Select
                    value={String(condition.value)}
                    onValueChange={(v) => handleUpdateCondition(index, { value: v === "true" })}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">{t("True / Yes", "是")}</SelectItem>
                        <SelectItem value="false">{t("False / No", "否")}</SelectItem>
                    </SelectContent>
                </Select>
            )
        }

        // Select Type (Predefined Options)
        if (fieldDef.options && fieldDef.options.length > 0) {
            // Multi-select for "in" / "notIn" operators
            if (condition.operator === "in" || condition.operator === "notIn") {
                const selectedValues = Array.isArray(condition.value)
                    ? condition.value as string[]
                    : String(condition.value || "").split(",").filter(Boolean)

                return (
                    <MultiSelect
                        options={fieldDef.options.map(opt => ({
                            label: locale === "zh" ? opt.labelZh : opt.label,
                            value: opt.value
                        }))}
                        selected={selectedValues}
                        onChange={(vals) => handleUpdateCondition(index, { value: vals })}
                        placeholder={t("Select values...", "选择值...")}
                        searchPlaceholder={t("Search...", "搜索...")}
                    />
                )
            }

            // Single Select for other operators
            return (
                <Select
                    value={String(condition.value)}
                    onValueChange={(v) => handleUpdateCondition(index, { value: v })}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder={t("Select value", "选择值")} />
                    </SelectTrigger>
                    <SelectContent>
                        {fieldDef.options.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {locale === "zh" ? opt.labelZh : opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        }

        // Date Type
        if (fieldDef.type === "date") {
            return (
                <div className="relative">
                    <Input
                        type="date"
                        value={String(condition.value)}
                        onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                        className="w-full h-9"
                    />
                </div>
            )
        }

        // Default: Text / Number Input
        return (
            <Input
                type={fieldDef.type === "number" ? "number" : "text"}
                value={String(condition.value)}
                onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                placeholder={fieldDef.placeholder || t("Enter value", "输入值")}
                className="h-9"
            />
        )
    }

    return (
        <div className="flex h-[500px] border rounded-lg overflow-hidden bg-background">
            {/* LEFT SIDEBAR: FIELD SELECTOR */}
            <div className="w-[280px] bg-muted/10 border-r flex flex-col flex-shrink-0">
                {/* Search Header */}
                <div className="p-4 border-b space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Filter className="h-4 w-4 text-primary" />
                        {t("Select Condition", "选择条件")}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("Search fields...", "搜索字段...")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background pl-9 h-9"
                        />
                    </div>
                </div>

                {/* Field List - Flat */}
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-0.5">
                        {filteredFields.map(field => (
                            <Button
                                key={field.id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs h-8 text-muted-foreground hover:text-foreground hover:bg-primary/10 hover:border-l-2 hover:border-primary rounded-none rounded-r-md pl-3 transition-all"
                                onClick={() => handleAddCondition(field.id)}
                            >
                                {locale === "zh" ? field.labelZh : field.label}
                            </Button>
                        ))}
                        {filteredFields.length === 0 && (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                                {t("No fields found matching your search.", "未找到匹配的字段。")}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT CONTENT: CONDITION CANVAS */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950">
                {/* Canvas Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 bg-muted/5">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            {t("Match Logic:", "匹配方式：")}
                        </span>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button
                                onClick={() => onChange(conditions, "AND")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    conditionLogic === "AND"
                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {t("Match ALL (AND)", "所有条件 (AND)")}
                            </button>
                            <button
                                onClick={() => onChange(conditions, "OR")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                    conditionLogic === "OR"
                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {t("Match ANY (OR)", "任一条件 (OR)")}
                            </button>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {conditionLogic === "AND"
                                ? t("Order must meet ALL conditions below", "订单须同时满足下方所有条件才会被拦截")
                                : t("Order must meet ANY one condition below", "订单满足下方任意一个条件即会被拦截")
                            }
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {conditions.length > 0 && (
                            <>
                                <span>{t(`${conditions.length} condition(s) added`, `已添加 ${conditions.length} 个条件`)}</span>
                                <button
                                    onClick={() => onChange([], conditionLogic)}
                                    className="flex items-center gap-1 text-destructive hover:text-destructive/80 transition-colors ml-1"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    <span>{t("Clear all", "清空全部")}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Canvas Area */}
                <ScrollArea className="flex-1 bg-muted/5">
                    <div className="p-6">
                        {conditions.length === 0 ? (
                            <div className="h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-white/50 dark:bg-zinc-900/50">
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <Filter className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-base font-semibold text-foreground mb-1">
                                    {t("No Conditions Added", "未添加条件")}
                                </h3>
                                <p className="text-sm max-w-[250px]">
                                    {t("Select fields from the sidebar to add filtering conditions.", "从左侧侧边栏选择字段以添加条件。")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {conditions.map((condition, index) => {
                                    const fieldDef = getFieldDefinition(condition.field)

                                    return (
                                        <div
                                            key={index}
                                            className="group relative flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm hover:shadow-md transition-all"
                                        >
                                            {/* Logic Connector Line */}
                                            {index > 0 && (
                                                <div className="absolute -top-4 left-[26px] w-0.5 h-4 bg-border/50" />
                                            )}

                                            {/* Logic Badge */}
                                            <div className="flex-shrink-0 pt-2">
                                                <div className={cn(
                                                    "flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold border",
                                                    conditionLogic === "AND"
                                                        ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                                        : "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800"
                                                )}>
                                                    {index === 0 ? t("IF", "如果") : (conditionLogic === "AND" ? "&" : "||")}
                                                </div>
                                            </div>

                                            {/* Field Input Group */}
                                            <div className="flex-1 grid grid-cols-12 gap-3">
                                                {/* Field Name Display */}
                                                <div className="col-span-12 sm:col-span-4 flex flex-col justify-center bg-muted/30 rounded-lg px-3 py-1.5 border border-transparent group-hover:border-border/50 transition-colors">
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {locale === "zh" ? fieldDef?.labelZh : fieldDef?.label}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {locale === "zh" ? fieldDef?.categoryZh : fieldDef?.category}
                                                    </span>
                                                </div>

                                                {/* Operator Selector */}
                                                <div className="col-span-12 sm:col-span-3">
                                                    <Select
                                                        value={condition.operator}
                                                        onValueChange={(val) => handleUpdateCondition(index, { operator: val as ConditionOperator })}
                                                    >
                                                        <SelectTrigger className="h-9 bg-transparent">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fieldDef ? renderOperatorOptions(condition.field) : <SelectItem value="equals">{t("Equals", "等于")}</SelectItem>}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Value Input */}
                                                <div className="col-span-12 sm:col-span-5">
                                                    {renderValueInput(condition, index)}
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                                                onClick={() => handleRemoveCondition(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
