"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Plus,
    X,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    GripVertical,
    Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { RoutingRuleCondition, ConditionField, ConditionOperator, ConditionLogic } from "@/lib/types/routing-rule"

// ============================================================================
// CONDITION FIELD DEFINITIONS
// ============================================================================

interface FieldDefinition {
    id: ConditionField
    label: string
    labelZh: string
    type: "text" | "number" | "select" | "multiSelect" | "boolean" | "date" | "dateRange"
    category: string
    categoryZh: string
    options?: { value: string; label: string; labelZh: string }[]
    operators: ConditionOperator[]
    placeholder?: string
}

// Comprehensive field definitions for PO routing
const fieldDefinitions: FieldDefinition[] = [
    // === Basic Info ===
    {
        id: "poType",
        label: "PO Type",
        labelZh: "采购类型",
        type: "select",
        category: "Basic Info",
        categoryZh: "基本信息",
        options: [
            { value: "STANDARD", label: "Standard", labelZh: "标准采购" },
            { value: "BLANKET", label: "Blanket PO", labelZh: "一揽子采购" },
            { value: "PLANNED", label: "Planned", labelZh: "计划采购" },
            { value: "CONTRACT", label: "Contract", labelZh: "合同采购" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },
    {
        id: "poStatus",
        label: "PO Status",
        labelZh: "采购状态",
        type: "select",
        category: "Basic Info",
        categoryZh: "基本信息",
        options: [
            { value: "DRAFT", label: "Draft", labelZh: "草稿" },
            { value: "PENDING_APPROVAL", label: "Pending Approval", labelZh: "待审批" },
            { value: "APPROVED", label: "Approved", labelZh: "已审批" },
            { value: "SENT", label: "Sent to Supplier", labelZh: "已发送" },
            { value: "CONFIRMED", label: "Confirmed", labelZh: "已确认" },
            { value: "IN_TRANSIT", label: "In Transit", labelZh: "运输中" },
            { value: "PARTIAL_RECEIVED", label: "Partial Received", labelZh: "部分收货" },
            { value: "RECEIVED", label: "Received", labelZh: "已收货" },
            { value: "COMPLETED", label: "Completed", labelZh: "已完成" },
            { value: "CANCELLED", label: "Cancelled", labelZh: "已取消" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },
    {
        id: "priority",
        label: "Priority",
        labelZh: "优先级",
        type: "select",
        category: "Basic Info",
        categoryZh: "基本信息",
        options: [
            { value: "CRITICAL", label: "Critical", labelZh: "紧急" },
            { value: "HIGH", label: "High", labelZh: "高" },
            { value: "MEDIUM", label: "Medium", labelZh: "中" },
            { value: "LOW", label: "Low", labelZh: "低" },
        ],
        operators: ["equals", "notEquals", "in"]
    },

    // === Supplier ===
    {
        id: "supplier",
        label: "Supplier",
        labelZh: "供应商",
        type: "text",
        category: "Supplier",
        categoryZh: "供应商",
        operators: ["equals", "notEquals", "contains", "startsWith", "isEmpty", "isNotEmpty"],
        placeholder: "Enter supplier name"
    },
    {
        id: "supplierType",
        label: "Supplier Type",
        labelZh: "供应商类型",
        type: "select",
        category: "Supplier",
        categoryZh: "供应商",
        options: [
            { value: "DOMESTIC", label: "Domestic", labelZh: "国内" },
            { value: "INTERNATIONAL", label: "International", labelZh: "国际" },
            { value: "PREFERRED", label: "Preferred", labelZh: "优选" },
            { value: "APPROVED", label: "Approved", labelZh: "已认证" },
            { value: "STRATEGIC", label: "Strategic", labelZh: "战略" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },
    {
        id: "supplierCountry",
        label: "Supplier Country",
        labelZh: "供应商国家",
        type: "select",
        category: "Supplier",
        categoryZh: "供应商",
        options: [
            { value: "US", label: "United States", labelZh: "美国" },
            { value: "CN", label: "China", labelZh: "中国" },
            { value: "MX", label: "Mexico", labelZh: "墨西哥" },
            { value: "CA", label: "Canada", labelZh: "加拿大" },
            { value: "DE", label: "Germany", labelZh: "德国" },
            { value: "JP", label: "Japan", labelZh: "日本" },
            { value: "KR", label: "South Korea", labelZh: "韩国" },
            { value: "VN", label: "Vietnam", labelZh: "越南" },
            { value: "TW", label: "Taiwan", labelZh: "台湾" },
            { value: "BR", label: "Brazil", labelZh: "巴西" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },

    // === Warehouse ===
    {
        id: "destinationWarehouse",
        label: "Destination Warehouse",
        labelZh: "目标仓库",
        type: "select",
        category: "Warehouse",
        categoryZh: "仓库",
        options: [
            { value: "US-EAST", label: "US East Coast", labelZh: "美国东海岸" },
            { value: "US-WEST", label: "US West Coast", labelZh: "美国西海岸" },
            { value: "US-CENTRAL", label: "US Central", labelZh: "美国中部" },
            { value: "CN-SH", label: "Shanghai", labelZh: "上海" },
            { value: "CN-SZ", label: "Shenzhen", labelZh: "深圳" },
            { value: "EU-DE", label: "Germany", labelZh: "德国" },
            { value: "BR-SP", label: "Brazil", labelZh: "巴西" },
            { value: "FG-STAGING", label: "FG Staging", labelZh: "成品暂存仓" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },
    {
        id: "warehouseType",
        label: "Warehouse Type",
        labelZh: "仓库类型",
        type: "select",
        category: "Warehouse",
        categoryZh: "仓库",
        options: [
            { value: "LOCAL", label: "Local (Owned)", labelZh: "自有仓库" },
            { value: "3PL", label: "3PL", labelZh: "第三方物流" },
            { value: "FG_STAGING", label: "FG Staging", labelZh: "成品暂存" },
            { value: "CROSS_DOCK", label: "Cross-Dock", labelZh: "越库" },
            { value: "CONSIGNMENT", label: "Consignment", labelZh: "寄售仓" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },

    // === Amount & Payment ===
    {
        id: "totalAmount",
        label: "Total Amount",
        labelZh: "订单总额",
        type: "number",
        category: "Amount",
        categoryZh: "金额",
        operators: ["equals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "between"],
        placeholder: "Enter amount"
    },
    {
        id: "currency",
        label: "Currency",
        labelZh: "币种",
        type: "select",
        category: "Amount",
        categoryZh: "金额",
        options: [
            { value: "USD", label: "USD", labelZh: "美元" },
            { value: "CNY", label: "CNY", labelZh: "人民币" },
            { value: "EUR", label: "EUR", labelZh: "欧元" },
            { value: "GBP", label: "GBP", labelZh: "英镑" },
            { value: "JPY", label: "JPY", labelZh: "日元" },
            { value: "BRL", label: "BRL", labelZh: "巴西雷亚尔" },
        ],
        operators: ["equals", "notEquals", "in"]
    },
    {
        id: "paymentTerm",
        label: "Payment Term",
        labelZh: "付款条款",
        type: "select",
        category: "Amount",
        categoryZh: "金额",
        options: [
            { value: "PREPAID", label: "Prepaid", labelZh: "预付" },
            { value: "COD", label: "Cash on Delivery", labelZh: "货到付款" },
            { value: "NET15", label: "Net 15", labelZh: "15天账期" },
            { value: "NET30", label: "Net 30", labelZh: "30天账期" },
            { value: "NET45", label: "Net 45", labelZh: "45天账期" },
            { value: "NET60", label: "Net 60", labelZh: "60天账期" },
            { value: "NET90", label: "Net 90", labelZh: "90天账期" },
        ],
        operators: ["equals", "notEquals", "in"]
    },

    // === Logistics ===
    {
        id: "shippingMethod",
        label: "Shipping Method",
        labelZh: "运输方式",
        type: "select",
        category: "Logistics",
        categoryZh: "物流",
        options: [
            { value: "SEA", label: "Ocean Freight", labelZh: "海运" },
            { value: "AIR", label: "Air Freight", labelZh: "空运" },
            { value: "EXPRESS", label: "Express", labelZh: "快递" },
            { value: "GROUND", label: "Ground/Truck", labelZh: "陆运" },
            { value: "RAIL", label: "Rail", labelZh: "铁路" },
            { value: "MULTIMODAL", label: "Multimodal", labelZh: "多式联运" },
        ],
        operators: ["equals", "notEquals", "in", "notIn"]
    },
    {
        id: "incoterm",
        label: "Incoterm",
        labelZh: "贸易术语",
        type: "select",
        category: "Logistics",
        categoryZh: "物流",
        options: [
            { value: "EXW", label: "EXW - Ex Works", labelZh: "EXW 工厂交货" },
            { value: "FOB", label: "FOB - Free on Board", labelZh: "FOB 离岸价" },
            { value: "CIF", label: "CIF - Cost, Insurance & Freight", labelZh: "CIF 到岸价" },
            { value: "DDP", label: "DDP - Delivered Duty Paid", labelZh: "DDP 完税交货" },
            { value: "DAP", label: "DAP - Delivered at Place", labelZh: "DAP 目的地交货" },
            { value: "FCA", label: "FCA - Free Carrier", labelZh: "FCA 货交承运人" },
        ],
        operators: ["equals", "notEquals", "in"]
    },
    {
        id: "leadTime",
        label: "Lead Time (Days)",
        labelZh: "交期(天)",
        type: "number",
        category: "Logistics",
        categoryZh: "物流",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter days"
    },

    // === Product ===
    {
        id: "category",
        label: "Product Category",
        labelZh: "产品分类",
        type: "text",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "notEquals", "contains", "in"],
        placeholder: "Enter category"
    },
    {
        id: "productType",
        label: "Product Type",
        labelZh: "产品类型",
        type: "select",
        category: "Product",
        categoryZh: "产品",
        options: [
            { value: "FINISHED_GOODS", label: "Finished Goods", labelZh: "成品" },
            { value: "RAW_MATERIAL", label: "Raw Material", labelZh: "原材料" },
            { value: "COMPONENT", label: "Component", labelZh: "部件" },
            { value: "PACKAGING", label: "Packaging", labelZh: "包装材料" },
            { value: "MRO", label: "MRO Supplies", labelZh: "MRO耗材" },
        ],
        operators: ["equals", "notEquals", "in"]
    },
    {
        id: "itemCount",
        label: "Line Item Count",
        labelZh: "明细行数",
        type: "number",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "greaterThan", "lessThan", "between"],
        placeholder: "Enter count"
    },
    {
        id: "totalQuantity",
        label: "Total Quantity",
        labelZh: "总数量",
        type: "number",
        category: "Product",
        categoryZh: "产品",
        operators: ["equals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "between"],
        placeholder: "Enter quantity"
    },

    // === Flags ===
    {
        id: "hasSerialNumber",
        label: "Has Serial Number",
        labelZh: "含序列号",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"]
    },
    {
        id: "hasLotNumber",
        label: "Has Lot Number",
        labelZh: "含批次号",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"]
    },
    {
        id: "requiresInspection",
        label: "Requires Inspection",
        labelZh: "需要检验",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"]
    },
    {
        id: "isUrgent",
        label: "Is Urgent",
        labelZh: "是否紧急",
        type: "boolean",
        category: "Flags",
        categoryZh: "标记",
        operators: ["equals"]
    },

    // === Metadata ===
    {
        id: "tags",
        label: "Tags",
        labelZh: "标签",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["contains", "notContains", "isEmpty", "isNotEmpty"],
        placeholder: "Enter tag"
    },
    {
        id: "createdBy",
        label: "Created By",
        labelZh: "创建人",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["equals", "notEquals", "contains"],
        placeholder: "Enter user"
    },
    {
        id: "department",
        label: "Department",
        labelZh: "部门",
        type: "text",
        category: "Metadata",
        categoryZh: "元数据",
        operators: ["equals", "notEquals", "in"],
        placeholder: "Enter department"
    },
]

// Operator labels
const operatorLabels: Record<ConditionOperator, { label: string; labelZh: string }> = {
    equals: { label: "equals", labelZh: "等于" },
    notEquals: { label: "does not equal", labelZh: "不等于" },
    contains: { label: "contains", labelZh: "包含" },
    notContains: { label: "does not contain", labelZh: "不包含" },
    startsWith: { label: "starts with", labelZh: "开头是" },
    endsWith: { label: "ends with", labelZh: "结尾是" },
    matches: { label: "matches pattern", labelZh: "匹配模式" },
    greaterThan: { label: "is greater than", labelZh: "大于" },
    lessThan: { label: "is less than", labelZh: "小于" },
    greaterThanOrEqual: { label: "is at least", labelZh: "大于等于" },
    lessThanOrEqual: { label: "is at most", labelZh: "小于等于" },
    between: { label: "is between", labelZh: "介于" },
    in: { label: "is one of", labelZh: "属于" },
    notIn: { label: "is not one of", labelZh: "不属于" },
    isEmpty: { label: "is empty", labelZh: "为空" },
    isNotEmpty: { label: "is not empty", labelZh: "不为空" },
    before: { label: "is before", labelZh: "早于" },
    after: { label: "is after", labelZh: "晚于" },
    withinDays: { label: "is within days", labelZh: "在N天内" },
}

// ============================================================================
// CONDITION BUILDER COMPONENT
// ============================================================================

interface ConditionBuilderProps {
    conditions: RoutingRuleCondition[]
    conditionLogic: ConditionLogic
    onChange: (conditions: RoutingRuleCondition[], logic: ConditionLogic) => void
    locale?: "en" | "zh"
}

export function ConditionBuilderV2({
    conditions,
    conditionLogic,
    onChange,
    locale = "zh"
}: ConditionBuilderProps) {
    const [searchTerm, setSearchTerm] = React.useState("")
    const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(["Basic Info", "Supplier"]))
    const [selectedFieldId, setSelectedFieldId] = React.useState<ConditionField | null>(null)

    // Group fields by category
    const fieldsByCategory = React.useMemo(() => {
        const grouped: Record<string, FieldDefinition[]> = {}
        fieldDefinitions.forEach(field => {
            const category = locale === "zh" ? field.categoryZh : field.category
            if (!grouped[category]) grouped[category] = []
            if (searchTerm === "" ||
                field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                field.labelZh.includes(searchTerm)) {
                grouped[category].push(field)
            }
        })
        // Remove empty categories
        Object.keys(grouped).forEach(key => {
            if (grouped[key].length === 0) delete grouped[key]
        })
        return grouped
    }, [searchTerm, locale])

    // Add a new condition
    const addCondition = (fieldId: ConditionField) => {
        const field = fieldDefinitions.find(f => f.id === fieldId)
        if (!field) return

        const newCondition: RoutingRuleCondition = {
            id: `cond-${Date.now()}`,
            field: fieldId,
            operator: field.operators[0],
            value: field.type === "boolean" ? true : "",
            logic: conditionLogic
        }
        onChange([...conditions, newCondition], conditionLogic)
        setSelectedFieldId(null)
    }

    // Update a condition
    const updateCondition = (index: number, updates: Partial<RoutingRuleCondition>) => {
        const newConditions = [...conditions]
        newConditions[index] = { ...newConditions[index], ...updates }
        onChange(newConditions, conditionLogic)
    }

    // Remove a condition
    const removeCondition = (index: number) => {
        onChange(conditions.filter((_, i) => i !== index), conditionLogic)
    }

    // Toggle category expansion
    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories)
        if (newExpanded.has(category)) {
            newExpanded.delete(category)
        } else {
            newExpanded.add(category)
        }
        setExpandedCategories(newExpanded)
    }

    // Check if field is already used
    const isFieldUsed = (fieldId: ConditionField) => {
        return conditions.some(c => c.field === fieldId)
    }

    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="flex gap-4 h-full">
            {/* Left: Field Selector */}
            <div className="w-[280px] flex-shrink-0 border rounded-lg bg-card">
                <div className="p-3 border-b">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">{t("Select Conditions", "选择条件")}</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("Search fields...", "搜索字段...")}
                            className="pl-8 h-9"
                        />
                    </div>
                </div>

                <ScrollArea className="h-[400px]">
                    <div className="p-2 space-y-1">
                        {Object.entries(fieldsByCategory).map(([category, fields]) => (
                            <div key={category}>
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors"
                                >
                                    {expandedCategories.has(category) ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                    <span>{category}</span>
                                    <Badge variant="secondary" className="ml-auto text-xs">
                                        {fields.length}
                                    </Badge>
                                </button>

                                {expandedCategories.has(category) && (
                                    <div className="ml-4 mt-1 space-y-0.5">
                                        {fields.map(field => {
                                            const used = isFieldUsed(field.id)
                                            return (
                                                <button
                                                    key={field.id}
                                                    onClick={() => !used && addCondition(field.id)}
                                                    disabled={used}
                                                    className={cn(
                                                        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors text-left",
                                                        used
                                                            ? "opacity-50 cursor-not-allowed bg-muted/30"
                                                            : "hover:bg-primary/10 hover:text-primary cursor-pointer"
                                                    )}
                                                >
                                                    <span>{locale === "zh" ? field.labelZh : field.label}</span>
                                                    {used && (
                                                        <Badge variant="outline" className="ml-auto text-xs">
                                                            {t("Added", "已添加")}
                                                        </Badge>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right: Active Conditions */}
            <div className="flex-1 space-y-4">
                {/* Logic Selector */}
                <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/30">
                    <Label className="text-sm font-medium">{t("Match", "匹配方式")}:</Label>
                    <div className="flex gap-2">
                        <Button
                            variant={conditionLogic === "AND" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onChange(conditions, "AND")}
                            className="h-8"
                        >
                            {t("ALL conditions (AND)", "所有条件 (AND)")}
                        </Button>
                        <Button
                            variant={conditionLogic === "OR" ? "default" : "outline"}
                            size="sm"
                            onClick={() => onChange(conditions, "OR")}
                            className="h-8"
                        >
                            {t("ANY condition (OR)", "任一条件 (OR)")}
                        </Button>
                    </div>
                </div>

                {/* Conditions List */}
                {conditions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-center">
                        <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium mb-2">{t("No conditions added", "未添加条件")}</p>
                        <p className="text-sm text-muted-foreground">
                            {t("Select fields from the left panel to add conditions", "从左侧面板选择字段以添加条件")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conditions.map((condition, index) => {
                            const field = fieldDefinitions.find(f => f.id === condition.field)
                            if (!field) return null

                            return (
                                <Card key={condition.id} className="border-l-4 border-l-primary">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Drag Handle */}
                                            <div className="flex items-center justify-center w-6 h-6 cursor-grab opacity-50 hover:opacity-100">
                                                <GripVertical className="h-4 w-4" />
                                            </div>

                                            {/* Condition Content */}
                                            <div className="flex-1 space-y-3">
                                                {/* Logic connector for 2nd+ conditions */}
                                                {index > 0 && (
                                                    <div className="flex items-center gap-2 -mt-1 mb-2">
                                                        <Badge variant="secondary" className="text-xs font-mono">
                                                            {conditionLogic}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {/* Field label */}
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-medium">
                                                        {locale === "zh" ? field.labelZh : field.label}
                                                    </Badge>
                                                </div>

                                                {/* Operator + Value Row */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Operator Selector */}
                                                    <Select
                                                        value={condition.operator}
                                                        onValueChange={(value) => updateCondition(index, { operator: value as ConditionOperator })}
                                                    >
                                                        <SelectTrigger className="w-[180px] h-9">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.operators.map(op => (
                                                                <SelectItem key={op} value={op}>
                                                                    {locale === "zh" ? operatorLabels[op].labelZh : operatorLabels[op].label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>

                                                    {/* Value Input - varies by type and operator */}
                                                    {!["isEmpty", "isNotEmpty"].includes(condition.operator) && (
                                                        <ConditionValueInput
                                                            field={field}
                                                            condition={condition}
                                                            onChange={(value) => updateCondition(index, { value })}
                                                            locale={locale}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeCondition(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Quick Add Buttons */}
                {conditions.length > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                        <span className="text-sm text-muted-foreground">{t("Quick add:", "快速添加:")}</span>
                        {["supplier", "destinationWarehouse", "totalAmount", "shippingMethod"].map(fieldId => {
                            const field = fieldDefinitions.find(f => f.id === fieldId)
                            if (!field || isFieldUsed(fieldId as ConditionField)) return null
                            return (
                                <Button
                                    key={fieldId}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => addCondition(fieldId as ConditionField)}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {locale === "zh" ? field.labelZh : field.label}
                                </Button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// VALUE INPUT COMPONENT
// ============================================================================

interface ConditionValueInputProps {
    field: FieldDefinition
    condition: RoutingRuleCondition
    onChange: (value: RoutingRuleCondition["value"]) => void
    locale: "en" | "zh"
}

function ConditionValueInput({ field, condition, onChange, locale }: ConditionValueInputProps) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    // Between operator - two inputs
    if (condition.operator === "between") {
        const [min, max] = Array.isArray(condition.value) ? condition.value as [number, number] : [0, 0]
        return (
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    value={min || ""}
                    onChange={(e) => onChange([Number(e.target.value), max])}
                    placeholder={t("Min", "最小值")}
                    className="w-24 h-9"
                />
                <span className="text-muted-foreground">{t("and", "到")}</span>
                <Input
                    type="number"
                    value={max || ""}
                    onChange={(e) => onChange([min, Number(e.target.value)])}
                    placeholder={t("Max", "最大值")}
                    className="w-24 h-9"
                />
            </div>
        )
    }

    // Boolean type
    if (field.type === "boolean") {
        return (
            <Select
                value={String(condition.value)}
                onValueChange={(value) => onChange(value === "true")}
            >
                <SelectTrigger className="w-[120px] h-9">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="true">{t("Yes", "是")}</SelectItem>
                    <SelectItem value="false">{t("No", "否")}</SelectItem>
                </SelectContent>
            </Select>
        )
    }

    // Select type
    if (field.type === "select" && field.options) {
        return (
            <Select
                value={String(condition.value)}
                onValueChange={onChange}
            >
                <SelectTrigger className="w-[200px] h-9">
                    <SelectValue placeholder={t("Select...", "请选择...")} />
                </SelectTrigger>
                <SelectContent>
                    {field.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {locale === "zh" ? opt.labelZh : opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )
    }

    // Number type
    if (field.type === "number") {
        return (
            <Input
                type="number"
                value={condition.value as number || ""}
                onChange={(e) => onChange(Number(e.target.value))}
                placeholder={field.placeholder}
                className="w-32 h-9"
            />
        )
    }

    // Default: text input
    return (
        <Input
            value={String(condition.value || "")}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || t("Enter value", "输入值")}
            className="w-48 h-9"
        />
    )
}

export { fieldDefinitions, operatorLabels }
