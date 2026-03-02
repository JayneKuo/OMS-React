"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SOHoldRuleDialog } from "@/components/automation/so-hold-rule-dialog"
import { cn } from "@/lib/utils"
import type { RoutingRule } from "@/lib/types/routing-rule"
import {
    Network,
    Package,
    Warehouse,
    PauseCircle,
    Filter,
    Settings,
    ArrowLeftRight,
    Mail,
    Webhook,
    Store,
    Truck,
    Box,
    Route,
    ShoppingCart,
    CheckCircle,
    AlertCircle,
    Globe,
    Plus,
    Edit,
    Trash2,
    Copy,
    MoreVertical,
    ChevronRight,
    ShieldAlert,
    Clock
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Global default settings for SO Hold Rules
interface GlobalSettings {
    autoReleaseMatches: boolean
    requireReviewComment: boolean
    notifyHoldEvent: boolean
    defaultHoldReason: string
    maxHoldHours: number
}

const sidebarItems = [
    {
        title: "Sales Order",
        href: "/automation/sales-order",
        icon: <Network className="h-4 w-4" />,
        children: [
            { title: "Sales Order Routing", href: "/automation/sales-order/routing", icon: <Network className="h-4 w-4" /> },
            { title: "Fulfillment Mode", href: "/automation/sales-order/fulfillment-mode", icon: <Package className="h-4 w-4" /> },
            { title: "SKU Designated Warehouse", href: "/automation/sales-order/designated-warehouse", icon: <Warehouse className="h-4 w-4" /> },
            { title: "Hold Order Rules", href: "/automation/sales-order/hold-rules", icon: <PauseCircle className="h-4 w-4" /> },
            { title: "Filter Orders by SKU", href: "/automation/sales-order/filter-by-sku", icon: <Filter className="h-4 w-4" /> },
            { title: "Order Update Settings", href: "/automation/sales-order/update-settings", icon: <Settings className="h-4 w-4" /> },
            { title: "Mapping", href: "/automation/sales-order/mapping", icon: <ArrowLeftRight className="h-4 w-4" /> },
        ]
    },
    {
        title: "Purchase Order",
        href: "/automation/purchase-order",
        icon: <ShoppingCart className="h-4 w-4" />,
        children: [
            { title: "PO Order Routing", href: "/automation/purchase-order/routing", icon: <Route className="h-4 w-4" /> },
        ]
    },
    {
        title: "Inventory",
        href: "/automation/inventory",
        icon: <Box className="h-4 w-4" />,
        children: [
            { title: "Inventory Sync Rules", href: "/automation/inventory/sync-rules", icon: <Box className="h-4 w-4" /> },
        ]
    },
    {
        title: "Logistics",
        href: "/automation/logistics",
        icon: <Truck className="h-4 w-4" />,
        children: [
            { title: "Carrier Account", href: "/automation/logistics/carrier-account", icon: <Store className="h-4 w-4" /> },
            { title: "Carrier & Delivery Service", href: "/automation/logistics/carrier-delivery-service", icon: <Truck className="h-4 w-4" /> },
            { title: "Delivery Order Routing", href: "/automation/logistics/delivery-order-routing", icon: <Route className="h-4 w-4" /> },
        ]
    },
    {
        title: "Email Notification",
        href: "/automation/email-notification",
        icon: <Mail className="h-4 w-4" />
    },
    {
        title: "Webhook",
        href: "/automation/webhook",
        icon: <Webhook className="h-4 w-4" />
    },
]

export default function SOHoldRulesPage() {
    const [isSaving, setIsSaving] = React.useState(false)
    const [selectedRule, setSelectedRule] = React.useState<RoutingRule | null>(null)
    const [isRuleDialogOpen, setIsRuleDialogOpen] = React.useState(false)
    const [locale, setLocale] = React.useState<"en" | "zh">("en")

    // Auto-detect system language
    React.useEffect(() => {
        const browserLang = navigator.language.toLowerCase()
        if (browserLang.includes("zh")) {
            setLocale("zh")
        }
    }, [])

    // Global default settings
    const [globalSettings, setGlobalSettings] = React.useState<GlobalSettings>({
        autoReleaseMatches: false,
        requireReviewComment: true,
        notifyHoldEvent: true,
        defaultHoldReason: "RISK_REVIEW",
        maxHoldHours: 48
    })

    // Routing Rules (Hold Rules)
    const [routingRules, setRoutingRules] = React.useState<RoutingRule[]>([
        {
            id: "rule-1",
            name: "High Value Order Review",
            description: "Hold orders above $1000 for manual review",
            type: "HOLD_ORDER",
            enabled: true,
            priority: 1,
            executionMode: "FIRST_MATCH",
            conditionLogic: "AND",
            conditions: [
                {
                    id: "cond-1",
                    field: "totalAmount",
                    operator: "greater_than",
                    value: "1000",
                    logic: "AND"
                }
            ],
            actions: [
                {
                    type: "HOLD_ORDER",
                    releaseCriteria: {
                        type: "MANUAL_REVIEW",
                        criteriaLogic: "AND",
                        allowedRoles: ["MANAGER", "RISK_ANALYST"]
                    }
                },
                {
                    type: "ADD_TAG",
                    tags: ["HighValue", "RequiresReview"]
                }
            ],
            createdAt: "2024-03-01T10:00:00Z",
            updatedAt: "2024-03-01T10:00:00Z"
        }
    ])

    const handleSaveGlobal = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsSaving(false)
        toast.success("Settings saved successfully")
    }

    const handleSaveRule = (rule: RoutingRule) => {
        const existingIndex = routingRules.findIndex(r => r.id === rule.id)
        if (existingIndex >= 0) {
            const newRules = [...routingRules]
            newRules[existingIndex] = rule
            setRoutingRules(newRules)
        } else {
            setRoutingRules([...routingRules, { ...rule, priority: routingRules.length + 1 }])
        }
    }

    const handleAddRule = () => {
        const newRule: RoutingRule = {
            id: `rule-${Date.now()}`,
            name: "",
            description: "",
            type: "HOLD_ORDER",
            enabled: true,
            priority: routingRules.length + 1,
            executionMode: "FIRST_MATCH",
            conditions: [],
            conditionLogic: "AND",
            actions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        setSelectedRule(newRule)
        setIsRuleDialogOpen(true)
    }

    return (
        <MainLayout sidebarItems={sidebarItems} moduleName="Automation">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Hold Order Rules</h1>
                        <p className="text-muted-foreground">
                            Configure rules to automatically intercept and hold sales orders based on risk factors or order attributes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={locale} onValueChange={(v: "en" | "zh") => setLocale(v)}>
                            <SelectTrigger className="w-[120px]">
                                <Globe className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="zh">中文</SelectItem>
                            </SelectContent>
                        </Select>
                        <Badge variant="outline" className="h-8 px-3 text-sm">
                            {routingRules.filter(r => r.enabled).length} Active Rules
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="rules" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                            <TabsTrigger value="rules">Hold Rules (拦截规则)</TabsTrigger>
                            <TabsTrigger value="settings">Global Settings (全局设置)</TabsTrigger>
                        </TabsList>
                    </div>

                    {/* ==================== TAB 1: RULES ==================== */}
                    <TabsContent value="rules" className="space-y-4">

                        {/* Rules Header & Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Rules are evaluated top-to-bottom. First match wins.
                            </div>
                            <Button onClick={handleAddRule} className="shadow-lg hover:shadow-xl transition-all">
                                <Plus className="h-4 w-4 mr-2" />
                                Create New Rule
                            </Button>
                        </div>

                        {/* Empty State */}
                        {routingRules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                                <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                                    <PauseCircle className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No Hold Rules Yet</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
                                    Create rules to automatically hold suspicious orders or orders needing manual verification.
                                </p>
                                <Button onClick={handleAddRule}>Create First Rule</Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {routingRules
                                    .sort((a, b) => a.priority - b.priority)
                                    .map((rule, index) => (
                                        <div
                                            key={rule.id}
                                            className={cn(
                                                "group relative flex items-stretch border rounded-xl overflow-hidden transition-all hover:shadow-md bg-card",
                                                !rule.enabled && "opacity-60 bg-muted/30"
                                            )}
                                        >
                                            {/* Priority Strip */}
                                            <div className={cn(
                                                "w-1.5 flex-shrink-0",
                                                rule.enabled ? "bg-amber-500" : "bg-muted-foreground/30"
                                            )} />

                                            {/* Drag Handle Area */}
                                            <div className="w-10 flex items-center justify-center border-r bg-muted/5 group-hover:bg-muted/10 cursor-grab">
                                                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex-1 p-4 flex items-center gap-4">

                                                {/* Icon */}
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                    rule.type === "HOLD_ORDER" ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"
                                                )}>
                                                    <PauseCircle className="h-5 w-5" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold truncate">{rule.name}</h4>
                                                        {!rule.enabled && <Badge variant="secondary" className="h-5 text-[10px] px-1.5">Disabled</Badge>}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                        {/* Conditions Summary */}
                                                        <div className="flex items-center gap-1.5">
                                                            <Filter className="h-3 w-3" />
                                                            <span>
                                                                {rule.conditions.length > 0
                                                                    ? `${rule.conditions.length} Condition${rule.conditions.length > 1 ? "s" : ""}`
                                                                    : "No conditions (Always)"}
                                                            </span>
                                                        </div>

                                                        {/* Arrow */}
                                                        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />

                                                        {/* Actions Summary */}
                                                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                                                            <ShieldAlert className="h-3 w-3 text-amber-500" />
                                                            <span>
                                                                {rule.actions.length} Action{rule.actions.length > 1 ? "s" : ""}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quick Actions (Hover) */}
                                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                                                    setSelectedRule(rule)
                                                                    setIsRuleDialogOpen(true)
                                                                }}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit Rule</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => {
                                                                const newRule = { ...rule, id: `rule-${Date.now()}`, name: `${rule.name} (Copy)` }
                                                                setRoutingRules([...routingRules, newRule])
                                                            }}>
                                                                <Copy className="h-4 w-4 mr-2" /> Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-destructive" onClick={() => {
                                                                setRoutingRules(routingRules.filter(r => r.id !== rule.id))
                                                            }}>
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Dialog Component for Hold Rules */}
                        <SOHoldRuleDialog
                            key={selectedRule?.id ?? "new"}
                            open={isRuleDialogOpen}
                            onOpenChange={setIsRuleDialogOpen}
                            rule={selectedRule}
                            onSave={handleSaveRule}
                            locale={locale}
                        />
                    </TabsContent>

                    {/* ==================== TAB 2: GLOBAL SETTINGS ==================== */}
                    <TabsContent value="settings" className="space-y-6">

                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <div className="bg-amber-500/10 p-2 rounded-md">
                                    <Settings className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Global Hold Configuration</h3>
                                    <p className="text-sm text-muted-foreground">General settings for managing intercepted orders.</p>
                                </div>
                            </div>
                            <Button onClick={handleSaveGlobal} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* 1. Review Controls */}
                            <Card className="md:col-span-1 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-primary" /> Review Controls
                                    </CardTitle>
                                    <CardDescription>Rules for reviewing held orders</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="cursor-pointer">Require Review Comment (要求审核意见)</Label>
                                            <p className="text-xs text-muted-foreground">Make comment mandatory when releasing a hold (释放订单时必须填写审核说明)</p>
                                        </div>
                                        <Switch checked={globalSettings.requireReviewComment} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, requireReviewComment: c })} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="cursor-pointer">Auto-release Matches (匹配自动释放)</Label>
                                            <p className="text-xs text-muted-foreground">Release hold if conditions no longer match (如果订单更新后不再满足拦截条件，则自动释放)</p>
                                        </div>
                                        <Switch checked={globalSettings.autoReleaseMatches} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, autoReleaseMatches: c })} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="cursor-pointer">Notify on Hold (拦截通知)</Label>
                                            <p className="text-xs text-muted-foreground">Send system alerts when an order is held (订单被拦截时发送系统通知至相关人员)</p>
                                        </div>
                                        <Switch checked={globalSettings.notifyHoldEvent} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, notifyHoldEvent: c })} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 2. Automation Settings */}
                            <Card className="md:col-span-1 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-600" /> Default Parameters
                                    </CardTitle>
                                    <CardDescription>Fallback values for rule evaluation</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">

                                    <div className="space-y-2">
                                        <Label>Default Hold Reason (默认拦截原因)</Label>
                                        <Select value={globalSettings.defaultHoldReason} onValueChange={(v: string) => setGlobalSettings({ ...globalSettings, defaultHoldReason: v })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="RISK_REVIEW">Risk Review (风控审核)</SelectItem>
                                                <SelectItem value="INVENTORY_CHECK">Inventory Check (库存核查)</SelectItem>
                                                <SelectItem value="MANUAL_EXCEPTION">Manual Exception (人工介入)</SelectItem>
                                                <SelectItem value="ADDRESS_ISSUE">Address Issue (地址异常)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <Label>Maximum Hold Duration (最大挂起时长 - 小时)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                className="w-24"
                                                value={globalSettings.maxHoldHours}
                                                onChange={(e) => setGlobalSettings({ ...globalSettings, maxHoldHours: Number(e.target.value) })}
                                            />
                                            <span className="text-muted-foreground text-sm self-center">Hours before auto-canceling or escalation</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Configure what happens when expected duration is exceeded in SLA settings.</p>
                                    </div>

                                </CardContent>
                            </Card>

                        </div>

                    </TabsContent>
                </Tabs>
            </div>
        </MainLayout>
    )
}
