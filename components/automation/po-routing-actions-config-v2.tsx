"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Plus,
    X,
    Package,
    Settings,
    Info,
    Truck,
    Warehouse,
    Mail,
    Tag,
    AlertTriangle,
    Scissors,
    CheckCircle,
    User,
    Webhook,
    FileText,
    Calendar,
    ChevronDown,
    ChevronUp,
    GripVertical
} from "lucide-react"
import type { RuleAction, WorkflowAction, WarehouseAction, NotificationAction, TagAction, PriorityAction, HoldAction, SplitAction } from "@/lib/types/routing-rule"
import { cn } from "@/lib/utils"

// ============================================================================
// ACTION TYPES CONFIGURATION
// ============================================================================

interface ActionTypeConfig {
    type: RuleAction["type"]
    label: string
    labelZh: string
    description: string
    descriptionZh: string
    icon: React.ReactNode
    category: "workflow" | "assignment" | "notification" | "metadata" | "control"
}

const actionTypes: ActionTypeConfig[] = [
    // Workflow Actions
    {
        type: "SET_WORKFLOW",
        label: "Set Workflow",
        labelZh: "设置工作流",
        description: "Configure the fulfillment workflow type",
        descriptionZh: "配置履行工作流类型",
        icon: <Package className="h-4 w-4" />,
        category: "workflow"
    },
    {
        type: "ASSIGN_WAREHOUSE",
        label: "Assign Warehouse",
        labelZh: "分配仓库",
        description: "Route PO to specific warehouse",
        descriptionZh: "将采购单路由到指定仓库",
        icon: <Warehouse className="h-4 w-4" />,
        category: "assignment"
    },
    // Notification Actions
    {
        type: "SEND_NOTIFICATION",
        label: "Send Notification",
        labelZh: "发送通知",
        description: "Send email, SMS, or webhook notification",
        descriptionZh: "发送邮件、短信或Webhook通知",
        icon: <Mail className="h-4 w-4" />,
        category: "notification"
    },
    {
        type: "TRIGGER_WEBHOOK",
        label: "Trigger Webhook",
        labelZh: "触发Webhook",
        description: "Call external API endpoint",
        descriptionZh: "调用外部API接口",
        icon: <Webhook className="h-4 w-4" />,
        category: "notification"
    },
    // Metadata Actions
    {
        type: "ADD_TAG",
        label: "Add Tags",
        labelZh: "添加标签",
        description: "Add tags to the purchase order",
        descriptionZh: "为采购单添加标签",
        icon: <Tag className="h-4 w-4" />,
        category: "metadata"
    },
    {
        type: "SET_PRIORITY",
        label: "Set Priority",
        labelZh: "设置优先级",
        description: "Override order priority level",
        descriptionZh: "覆盖订单优先级",
        icon: <AlertTriangle className="h-4 w-4" />,
        category: "metadata"
    },
    {
        type: "ASSIGN_BUYER",
        label: "Assign Buyer",
        labelZh: "分配采购员",
        description: "Assign to specific buyer",
        descriptionZh: "分配给指定采购员",
        icon: <User className="h-4 w-4" />,
        category: "assignment"
    },
    // Control Actions
    {
        type: "HOLD_ORDER",
        label: "Hold Order",
        labelZh: "暂停订单",
        description: "Put order on hold for review",
        descriptionZh: "暂停订单等待审核",
        icon: <AlertTriangle className="h-4 w-4" />,
        category: "control"
    },
    {
        type: "SPLIT_ORDER",
        label: "Split Order",
        labelZh: "拆分订单",
        description: "Split order by criteria",
        descriptionZh: "按条件拆分订单",
        icon: <Scissors className="h-4 w-4" />,
        category: "control"
    },
    {
        type: "AUTO_APPROVE",
        label: "Auto Approve",
        labelZh: "自动审批",
        description: "Automatically approve the PO",
        descriptionZh: "自动审批采购单",
        icon: <CheckCircle className="h-4 w-4" />,
        category: "control"
    },
    {
        type: "CREATE_ASN",
        label: "Create ASN",
        labelZh: "创建ASN",
        description: "Auto-create advance ship notice",
        descriptionZh: "自动创建预发货通知",
        icon: <FileText className="h-4 w-4" />,
        category: "workflow"
    },
    {
        type: "SCHEDULE_RECEIPT",
        label: "Schedule Receipt",
        labelZh: "安排收货",
        description: "Pre-schedule receiving appointment",
        descriptionZh: "预约收货时间",
        icon: <Calendar className="h-4 w-4" />,
        category: "workflow"
    },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PORoutingActionsConfigV2Props {
    actions: RuleAction[]
    onChange: (actions: RuleAction[]) => void
    locale?: "en" | "zh"
    ruleType?: string
    recommendedActions?: RuleAction["type"][]
}

export function PORoutingActionsConfigV2({
    actions,
    onChange,
    locale = "zh",
    ruleType,
    recommendedActions = []
}: PORoutingActionsConfigV2Props) {
    const [showActionPicker, setShowActionPicker] = React.useState(false)
    const [expandedActions, setExpandedActions] = React.useState<Set<number>>(new Set([0]))

    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    // Filter actions based on rule type
    const availableActions = React.useMemo(() => {
        if (!ruleType || ruleType === "CUSTOM" || recommendedActions.length === 0) {
            return actionTypes
        }
        // Show recommended actions first, then others
        const recommended = actionTypes.filter(a => recommendedActions.includes(a.type))
        const others = actionTypes.filter(a => !recommendedActions.includes(a.type))
        return [...recommended, ...others]
    }, [ruleType, recommendedActions])

    const addAction = (type: RuleAction["type"]) => {
        const newAction = createDefaultAction(type)
        if (newAction) {
            onChange([...actions, newAction])
            setExpandedActions(new Set([...expandedActions, actions.length]))
        }
        setShowActionPicker(false)
    }

    const removeAction = (index: number) => {
        onChange(actions.filter((_, i) => i !== index))
        const newExpanded = new Set(expandedActions)
        newExpanded.delete(index)
        setExpandedActions(newExpanded)
    }

    const updateAction = (index: number, updatedAction: RuleAction) => {
        const newActions = [...actions]
        newActions[index] = updatedAction
        onChange(newActions)
    }

    const toggleExpand = (index: number) => {
        const newExpanded = new Set(expandedActions)
        if (newExpanded.has(index)) {
            newExpanded.delete(index)
        } else {
            newExpanded.add(index)
        }
        setExpandedActions(newExpanded)
    }

    const getActionConfig = (type: RuleAction["type"]) => {
        return actionTypes.find(a => a.type === type)
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold">{t("Configure Actions", "配置动作")}</h3>
                    <Badge variant="secondary">{actions.length}</Badge>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowActionPicker(true)}
                    className="h-8"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("Add Action", "添加动作")}
                </Button>
            </div>

            {/* Action Picker */}
            {showActionPicker && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">{t("Select Action Type", "选择动作类型")}</CardTitle>
                        <CardDescription className="text-xs">
                            {t("Choose what should happen when conditions match", "选择条件匹配时执行的动作")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {recommendedActions.length > 0 && ruleType !== "CUSTOM" && (
                            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    {t("⭐ Recommended actions are shown first", "⭐ 推荐动作优先显示")}
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {availableActions.map(actionType => {
                                const isRecommended = recommendedActions.includes(actionType.type)
                                return (
                                    <Button
                                        key={actionType.type}
                                        variant="outline"
                                        className={`h-auto p-3 flex flex-col items-start gap-1 hover:bg-primary/10 hover:border-primary ${isRecommended ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" : ""
                                            }`}
                                        onClick={() => addAction(actionType.type)}
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            {actionType.icon}
                                            <span className="text-sm font-medium">
                                                {locale === "zh" ? actionType.labelZh : actionType.label}
                                            </span>
                                            {isRecommended && <span className="text-xs">⭐</span>}
                                        </div>
                                        <span className="text-xs text-muted-foreground text-left">
                                            {locale === "zh" ? actionType.descriptionZh : actionType.description}
                                        </span>
                                    </Button>
                                )
                            })}
                        </div>
                        <div className="flex justify-end mt-3">
                            <Button variant="ghost" size="sm" onClick={() => setShowActionPicker(false)}>
                                {t("Cancel", "取消")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {actions.length === 0 && !showActionPicker && (
                <div className="flex flex-col items-center justify-center gap-3 text-center p-8 border-2 border-dashed rounded-lg bg-card/50">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">{t("No actions configured", "未配置动作")}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("Click Add Action to configure", "点击添加动作按钮开始配置")}
                        </p>
                    </div>
                </div>
            )}

            {/* Actions List */}
            <div className="space-y-3">
                {actions.map((action, index) => {
                    const config = getActionConfig(action.type)
                    if (!config) return null
                    const isExpanded = expandedActions.has(index)

                    return (
                        <Card key={index} className="border-l-4 border-l-primary overflow-hidden">
                            {/* Action Header */}
                            <div
                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent/50"
                                onClick={() => toggleExpand(index)}
                            >
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        {config.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">
                                                {locale === "zh" ? config.labelZh : config.label}
                                            </span>
                                            <Badge variant="secondary" className="text-xs">
                                                #{index + 1}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {getActionSummary(action, locale)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeAction(index)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Action Config (Expanded) */}
                            {isExpanded && (
                                <CardContent className="pt-0 pb-4 border-t">
                                    <ActionConfigPanel
                                        action={action}
                                        onChange={(updated) => updateAction(index, updated)}
                                        locale={locale}
                                    />
                                </CardContent>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

// ============================================================================
// ACTION CONFIG PANELS
// ============================================================================

interface ActionConfigPanelProps {
    action: RuleAction
    onChange: (action: RuleAction) => void
    locale: "en" | "zh"
}

function ActionConfigPanel({ action, onChange, locale }: ActionConfigPanelProps) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    switch (action.type) {
        case "SET_WORKFLOW":
            return <WorkflowActionPanel action={action} onChange={onChange} locale={locale} />
        case "ASSIGN_WAREHOUSE":
            return <WarehouseActionPanel action={action as WarehouseAction} onChange={onChange} locale={locale} />
        case "SEND_NOTIFICATION":
            return <NotificationActionPanel action={action as NotificationAction} onChange={onChange} locale={locale} />
        case "ADD_TAG":
            return <TagActionPanel action={action as TagAction} onChange={onChange} locale={locale} />
        case "SET_PRIORITY":
            return <PriorityActionPanel action={action as PriorityAction} onChange={onChange} locale={locale} />
        case "HOLD_ORDER":
            return <HoldActionPanel action={action as HoldAction} onChange={onChange} locale={locale} />
        case "SPLIT_ORDER":
            return <SplitActionPanel action={action as SplitAction} onChange={onChange} locale={locale} />
        default:
            return (
                <div className="p-4 text-sm text-muted-foreground">
                    {t("Configuration for this action type is not yet implemented.", "此动作类型的配置尚未实现。")}
                </div>
            )
    }
}

// Workflow Action Panel
function WorkflowActionPanel({ action, onChange, locale }: { action: WorkflowAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en
    const config = action.config || {}

    const updateConfig = (key: string, value: any) => {
        onChange({
            ...action,
            config: { ...config, [key]: value }
        })
    }

    return (
        <div className="space-y-4 pt-4">
            {/* Workflow Type */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Workflow Type", "工作流类型")}</Label>
                <Select
                    value={action.workflow}
                    onValueChange={(value: any) => onChange({ ...action, workflow: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="FACTORY_DIRECT">
                            <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span>{t("Factory Direct", "工厂直发")}</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="STANDARD">{t("Standard Process", "标准流程")}</SelectItem>
                        <SelectItem value="DROPSHIP">{t("Drop Shipping", "代发货")}</SelectItem>
                        <SelectItem value="CROSS_DOCK">{t("Cross-Docking", "越库")}</SelectItem>
                        <SelectItem value="CONSIGNMENT">{t("Consignment", "寄售")}</SelectItem>
                        <SelectItem value="JIT">{t("Just-in-Time", "即时采购")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Factory Direct Options */}
            {action.workflow === "FACTORY_DIRECT" && (
                <>
                    <Separator />
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {t("Factory Direct Settings", "工厂直发设置")}
                        </Label>

                        <div className="space-y-2">
                            <ToggleOption
                                label={t("Enable FG Staging", "启用成品仓")}
                                description={t("Use intermediate staging warehouse", "使用中间成品仓库进行暂存")}
                                checked={config.enableFGStaging || false}
                                onCheckedChange={(checked) => {
                                    updateConfig('enableFGStaging', checked)
                                    if (!checked) {
                                        updateConfig('generateFGReceipt', false)
                                        updateConfig('generateSaleOrder', false)
                                    }
                                }}
                            />

                            {config.enableFGStaging && (
                                <>
                                    <ToggleOption
                                        label={t("Generate FG Receipt", "生成成品入库")}
                                        description={t("Create receipt for staging warehouse", "创建成品仓入库单")}
                                        checked={config.generateFGReceipt || false}
                                        onCheckedChange={(checked) => updateConfig('generateFGReceipt', checked)}
                                        className="ml-4"
                                    />
                                    <ToggleOption
                                        label={t("Generate Sale Order", "生成成品出库")}
                                        description={t("Create outbound order from staging", "创建成品仓出库单")}
                                        checked={config.generateSaleOrder || false}
                                        onCheckedChange={(checked) => updateConfig('generateSaleOrder', checked)}
                                        className="ml-4"
                                    />
                                    {config.generateFGReceipt && config.generateSaleOrder && (
                                        <ToggleOption
                                            label={t("Wait for FG Receipt", "等待成品入库完成")}
                                            description={t("Outbound waits for inbound completion", "出库前等待入库完成")}
                                            checked={config.waitForFGReceipt || false}
                                            onCheckedChange={(checked) => updateConfig('waitForFGReceipt', checked)}
                                            className="ml-8"
                                        />
                                    )}
                                </>
                            )}

                            <ToggleOption
                                label={t("Auto Create Final Receipt", "自动创建最终入库")}
                                description={t("Create final receipt based on DC callback", "收到DC回调后自动创建最终入库单")}
                                checked={config.autoCreateFinalReceipt || false}
                                onCheckedChange={(checked) => updateConfig('autoCreateFinalReceipt', checked)}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Standard Options */}
            {action.workflow === "STANDARD" && (
                <>
                    <Separator />
                    <div className="space-y-2">
                        <ToggleOption
                            label={t("Auto Create Receipt", "自动创建收货单")}
                            description={t("Create receipt when PO status changes", "PO状态变更时自动创建收货单")}
                            checked={config.autoCreateReceipt || false}
                            onCheckedChange={(checked) => updateConfig('autoCreateReceipt', checked)}
                        />
                        <ToggleOption
                            label={t("Push to WMS", "推送到WMS")}
                            description={t("Send data to warehouse management system", "发送数据到仓库管理系统")}
                            checked={config.pushToWMS || false}
                            onCheckedChange={(checked) => updateConfig('pushToWMS', checked)}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

// Warehouse Action Panel
function WarehouseActionPanel({ action, onChange, locale }: { action: WarehouseAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Target Warehouse", "目标仓库")}</Label>
                <Select
                    value={action.warehouseId || ""}
                    onValueChange={(value) => {
                        const names: Record<string, string> = {
                            "US-EAST": "US East Coast",
                            "US-WEST": "US West Coast",
                            "US-CENTRAL": "US Central",
                            "CN-SH": "Shanghai",
                            "BR-SP": "Brazil",
                            "FG-STAGING": "FG Staging"
                        }
                        onChange({ ...action, warehouseId: value, warehouseName: names[value] || value })
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={t("Select warehouse...", "选择仓库...")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="US-EAST">{t("US East Coast", "美国东海岸")}</SelectItem>
                        <SelectItem value="US-WEST">{t("US West Coast", "美国西海岸")}</SelectItem>
                        <SelectItem value="US-CENTRAL">{t("US Central", "美国中部")}</SelectItem>
                        <SelectItem value="CN-SH">{t("Shanghai", "上海")}</SelectItem>
                        <SelectItem value="BR-SP">{t("Brazil", "巴西")}</SelectItem>
                        <SelectItem value="FG-STAGING">{t("FG Staging", "成品暂存仓")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Warehouse Role", "仓库角色")}</Label>
                <Select
                    value={action.warehouseType || "PRIMARY"}
                    onValueChange={(value: any) => onChange({ ...action, warehouseType: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PRIMARY">{t("Primary", "主仓库")}</SelectItem>
                        <SelectItem value="BACKUP">{t("Backup", "备用仓库")}</SelectItem>
                        <SelectItem value="OVERFLOW">{t("Overflow", "溢出仓库")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

// Notification Action Panel  
function NotificationActionPanel({ action, onChange, locale }: { action: NotificationAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Channel", "通知渠道")}</Label>
                <Select
                    value={action.channel || "EMAIL"}
                    onValueChange={(value: any) => onChange({ ...action, channel: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="EMAIL">{t("Email", "邮件")}</SelectItem>
                        <SelectItem value="SMS">{t("SMS", "短信")}</SelectItem>
                        <SelectItem value="WEBHOOK">{t("Webhook", "Webhook")}</SelectItem>
                        <SelectItem value="SLACK">{t("Slack", "Slack")}</SelectItem>
                        <SelectItem value="TEAMS">{t("Microsoft Teams", "Microsoft Teams")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Recipients", "接收人")}</Label>
                <Input
                    value={action.recipients?.join(", ") || ""}
                    onChange={(e) => onChange({ ...action, recipients: e.target.value.split(",").map(r => r.trim()) })}
                    placeholder={t("Enter emails separated by comma", "输入邮箱，逗号分隔")}
                />
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Trigger Event", "触发事件")}</Label>
                <Select
                    value={action.triggerEvent || "IMMEDIATE"}
                    onValueChange={(value: any) => onChange({ ...action, triggerEvent: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="IMMEDIATE">{t("Immediately", "立即")}</SelectItem>
                        <SelectItem value="ON_CREATE">{t("On Create", "创建时")}</SelectItem>
                        <SelectItem value="ON_STATUS_CHANGE">{t("On Status Change", "状态变更时")}</SelectItem>
                        <SelectItem value="ON_RECEIPT">{t("On Receipt", "收货时")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

// Tag Action Panel
function TagActionPanel({ action, onChange, locale }: { action: TagAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Tags", "标签")}</Label>
                <Input
                    value={action.tags?.join(", ") || ""}
                    onChange={(e) => onChange({ ...action, tags: e.target.value.split(",").map(t => t.trim()) })}
                    placeholder={t("Enter tags separated by comma", "输入标签，逗号分隔")}
                />
            </div>
            <ToggleOption
                label={t("Remove Existing Tags", "移除现有标签")}
                description={t("Clear existing tags before adding new ones", "添加新标签前清除现有标签")}
                checked={action.removeExisting || false}
                onCheckedChange={(checked) => onChange({ ...action, removeExisting: checked })}
            />
        </div>
    )
}

// Priority Action Panel
function PriorityActionPanel({ action, onChange, locale }: { action: PriorityAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Priority Level", "优先级")}</Label>
                <Select
                    value={action.priority || "MEDIUM"}
                    onValueChange={(value: any) => onChange({ ...action, priority: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CRITICAL">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                {t("Critical", "紧急")}
                            </div>
                        </SelectItem>
                        <SelectItem value="HIGH">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500" />
                                {t("High", "高")}
                            </div>
                        </SelectItem>
                        <SelectItem value="MEDIUM">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                {t("Medium", "中")}
                            </div>
                        </SelectItem>
                        <SelectItem value="LOW">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {t("Low", "低")}
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Reason (Optional)", "原因（可选）")}</Label>
                <Input
                    value={action.reason || ""}
                    onChange={(e) => onChange({ ...action, reason: e.target.value })}
                    placeholder={t("Enter reason for priority change", "输入优先级变更原因")}
                />
            </div>
        </div>
    )
}

// Hold Action Panel
function HoldActionPanel({ action, onChange, locale }: { action: HoldAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="space-y-4 pt-4">
            {/* Hold Type */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Hold Type", "暂停类型")}</Label>
                <Select
                    value={action.holdType || "REVIEW"}
                    onValueChange={(value: any) => onChange({ ...action, holdType: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CREDIT">{t("Credit Hold", "信用暂停")}</SelectItem>
                        <SelectItem value="COMPLIANCE">{t("Compliance Hold", "合规暂停")}</SelectItem>
                        <SelectItem value="REVIEW">{t("Manual Review", "人工审核")}</SelectItem>
                        <SelectItem value="CAPACITY">{t("Capacity Hold", "产能暂停")}</SelectItem>
                        <SelectItem value="RISK">{t("Risk Control", "风险控制")}</SelectItem>
                        <SelectItem value="CUSTOM">{t("Custom", "自定义")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Reason", "原因")}</Label>
                <Input
                    value={action.reason || ""}
                    onChange={(e) => onChange({ ...action, reason: e.target.value })}
                    placeholder={t("Enter hold reason", "输入暂停原因")}
                />
            </div>

            <Separator />

            {/* Duration Type */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Hold Duration", "暂停时长")}</Label>
                <Select
                    value={action.durationType || "MANUAL"}
                    onValueChange={(value: any) => onChange({ ...action, durationType: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="HOURS">{t("Hours", "小时")}</SelectItem>
                        <SelectItem value="DAYS">{t("Days", "天")}</SelectItem>
                        <SelectItem value="DATE_RANGE">{t("Date Range", "时间段")}</SelectItem>
                        <SelectItem value="MANUAL">{t("Manual Release", "手动释放")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Duration Value (for HOURS/DAYS) */}
            {(action.durationType === "HOURS" || action.durationType === "DAYS") && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">
                        {action.durationType === "HOURS" ? t("Number of Hours", "小时数") : t("Number of Days", "天数")}
                    </Label>
                    <Input
                        type="number"
                        value={action.durationValue || ""}
                        onChange={(e) => onChange({ ...action, durationValue: Number(e.target.value) })}
                        placeholder={t("Enter duration", "输入时长")}
                    />
                </div>
            )}

            {/* Date Range (for DATE_RANGE) */}
            {action.durationType === "DATE_RANGE" && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">{t("Start Date", "开始日期")}</Label>
                        <Input
                            type="date"
                            value={action.durationStartDate || ""}
                            onChange={(e) => onChange({ ...action, durationStartDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">{t("End Date", "结束日期")}</Label>
                        <Input
                            type="date"
                            value={action.durationEndDate || ""}
                            onChange={(e) => onChange({ ...action, durationEndDate: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <Separator />

            {/* Auto Release */}
            <ToggleOption
                label={t("Auto Release", "自动释放")}
                description={t("Automatically release hold when conditions are met", "满足条件时自动释放暂停")}
                checked={action.autoRelease || false}
                onCheckedChange={(checked) => onChange({ ...action, autoRelease: checked })}
            />

            {/* Release Conditions */}
            {action.autoRelease && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">{t("Release Trigger", "释放触发条件")}</Label>
                        <Select
                            value={action.releaseConditions?.type || "TIME_BASED"}
                            onValueChange={(value: any) => onChange({
                                ...action,
                                releaseConditions: { ...action.releaseConditions, type: value }
                            })}
                        >
                            <SelectTrigger className="bg-white dark:bg-zinc-900">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TIME_BASED">{t("Time Based (Auto expire)", "基于时间 (自动过期)")}</SelectItem>
                                <SelectItem value="APPROVAL_BASED">{t("Approval Based (Manual approve)", "基于审批 (人工批准)")}</SelectItem>
                                <SelectItem value="CONDITION_BASED">{t("Condition Based (System event)", "基于条件 (系统事件)")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dynamic config based on release type */}
                    {action.releaseConditions?.type === "CONDITION_BASED" && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                {t("Specify the system condition to release this hold:", "指定触发释放的系统条件：")}
                            </Label>
                            <Input
                                placeholder={t("e.g. Uploaded Valid ID, Payment Verified...", "例如：已上传有效证件，支付已验证...")}
                                value={action.releaseConditions?.conditions?.[0] || ""}
                                onChange={(e) => onChange({
                                    ...action,
                                    releaseConditions: {
                                        ...action.releaseConditions,
                                        type: "CONDITION_BASED",
                                        conditions: [e.target.value]
                                    }
                                })}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Approval - Applicable to ALL hold types */}
            <Separator />
            <ToggleOption
                label={t("Requires Approval", "需要审批")}
                description={t("Hold must be released by approver", "暂停必须由审批人解除")}
                checked={action.requiresApproval || false}
                onCheckedChange={(checked) => onChange({ ...action, requiresApproval: checked })}
            />

            {/* Risk Details - ONLY for RISK hold type */}
            {action.holdType === "RISK" && (
                <div className="space-y-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 mt-4">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        {t("Risk Details", "风险详情")}
                    </Label>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t("Risk Level", "风险等级")}</Label>
                            <Select
                                value={action.riskLevel || "MEDIUM"}
                                onValueChange={(value: any) => onChange({ ...action, riskLevel: value })}
                            >
                                <SelectTrigger className="h-9 bg-white dark:bg-zinc-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            {t("Low", "低")}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="MEDIUM">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            {t("Medium", "中")}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="HIGH">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                            {t("High", "高")}
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CRITICAL">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            {t("Critical", "紧急")}
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">{t("Risk Category", "风险类别")}</Label>
                            <Select
                                value={action.riskCategory || "OTHER"}
                                onValueChange={(value: any) => onChange({ ...action, riskCategory: value })}
                            >
                                <SelectTrigger className="h-9 bg-white dark:bg-zinc-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FRAUD">{t("Fraud", "欺诈")}</SelectItem>
                                    <SelectItem value="CREDIT">{t("Credit", "信用")}</SelectItem>
                                    <SelectItem value="COMPLIANCE">{t("Compliance", "合规")}</SelectItem>
                                    <SelectItem value="QUALITY">{t("Quality", "质量")}</SelectItem>
                                    <SelectItem value="PAYMENT">{t("Payment", "支付")}</SelectItem>
                                    <SelectItem value="OTHER">{t("Other", "其他")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Split Action Panel
function SplitActionPanel({ action, onChange, locale }: { action: SplitAction; onChange: (a: RuleAction) => void; locale: "en" | "zh" }) {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    return (
        <div className="space-y-4 pt-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium">{t("Split By", "拆分依据")}</Label>
                <Select
                    value={action.splitBy || "SKU"}
                    onValueChange={(value: any) => onChange({ ...action, splitBy: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="SKU">{t("SKU", "SKU")}</SelectItem>
                        <SelectItem value="WAREHOUSE">{t("Warehouse", "仓库")}</SelectItem>
                        <SelectItem value="SUPPLIER">{t("Supplier", "供应商")}</SelectItem>
                        <SelectItem value="SHIP_DATE">{t("Ship Date", "发货日期")}</SelectItem>
                        <SelectItem value="CATEGORY">{t("Category", "产品类别")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ToggleOption
                label={t("Create Separate POs", "创建独立PO")}
                description={t("Each split creates a new purchase order", "每次拆分创建新的采购单")}
                checked={action.createSeparatePOs || false}
                onCheckedChange={(checked) => onChange({ ...action, createSeparatePOs: checked })}
            />
        </div>
    )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface ToggleOptionProps {
    label: string
    description: string
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    className?: string
}

function ToggleOption({ label, description, checked, onCheckedChange, className }: ToggleOptionProps) {
    return (
        <div className={cn("flex items-start justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", className)}>
            <div className="space-y-0.5 flex-1">
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function createDefaultAction(type: RuleAction["type"]): RuleAction | null {
    switch (type) {
        case "SET_WORKFLOW":
            return {
                type: "SET_WORKFLOW",
                workflow: "STANDARD",
                config: {}
            }
        case "ASSIGN_WAREHOUSE":
            return {
                type: "ASSIGN_WAREHOUSE",
                warehouseId: "",
                warehouseName: ""
            }
        case "SEND_NOTIFICATION":
            return {
                type: "SEND_NOTIFICATION",
                channel: "EMAIL",
                recipients: []
            }
        case "ADD_TAG":
            return {
                type: "ADD_TAG",
                tags: []
            }
        case "SET_PRIORITY":
            return {
                type: "SET_PRIORITY",
                priority: "MEDIUM"
            }
        case "HOLD_ORDER":
            return {
                type: "HOLD_ORDER",
                reason: "",
                holdType: "REVIEW",
                requiresApproval: true
            }
        case "SPLIT_ORDER":
            return {
                type: "SPLIT_ORDER",
                splitBy: "SKU"
            }
        case "AUTO_APPROVE":
            return {
                type: "AUTO_APPROVE",
                approvalLevel: 1
            }
        case "ASSIGN_BUYER":
            return {
                type: "ASSIGN_BUYER",
                buyerId: "",
                buyerName: ""
            }
        case "TRIGGER_WEBHOOK":
            return {
                type: "TRIGGER_WEBHOOK",
                webhookUrl: "",
                method: "POST"
            }
        case "CREATE_ASN":
            return {
                type: "CREATE_ASN",
                autoPopulate: true
            }
        case "SCHEDULE_RECEIPT":
            return {
                type: "SCHEDULE_RECEIPT",
                daysBeforeArrival: 1
            }
        default:
            return {
                type: "CUSTOM",
                actionName: "",
                parameters: {}
            }
    }
}

function getActionSummary(action: RuleAction, locale: "en" | "zh"): string {
    const t = (en: string, zh: string) => locale === "zh" ? zh : en

    switch (action.type) {
        case "SET_WORKFLOW":
            return t(`Workflow: ${action.workflow}`, `工作流: ${action.workflow}`)
        case "ASSIGN_WAREHOUSE":
            return action.warehouseName ? t(`To: ${action.warehouseName}`, `分配至: ${action.warehouseName}`) : t("No warehouse selected", "未选择仓库")
        case "SEND_NOTIFICATION":
            return t(`${action.channel} to ${action.recipients?.length || 0} recipients`, `${action.channel} 发送给 ${action.recipients?.length || 0} 人`)
        case "ADD_TAG":
            return action.tags?.length ? t(`Tags: ${action.tags.join(", ")}`, `标签: ${action.tags.join(", ")}`) : t("No tags", "无标签")
        case "SET_PRIORITY":
            return t(`Priority: ${action.priority}`, `优先级: ${action.priority}`)
        case "HOLD_ORDER":
            return t(`Hold: ${action.holdType}`, `暂停: ${action.holdType}`)
        case "SPLIT_ORDER":
            return t(`Split by: ${action.splitBy}`, `按 ${action.splitBy} 拆分`)
        default:
            return t("Click to configure", "点击配置")
    }
}

export { actionTypes }
