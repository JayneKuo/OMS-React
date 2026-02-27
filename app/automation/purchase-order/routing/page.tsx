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
import { PORoutingRuleDialogV4 } from "@/components/automation/po-routing-rule-dialog-v4"
import { cn } from "@/lib/utils"
import type { RoutingRule, FactoryDirectActions } from "@/lib/types/routing-rule"
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
  Save,
  AlertCircle,
  Globe,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Copy,
  MoreVertical,
  ChevronRight,
  Archive,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Global default settings
interface GlobalSettings {
  // Automation
  autoCreateReceipt: boolean
  receiptTrigger: string
  pushToWMS: boolean
  wmsTrigger?: "RECEIPT_CREATED"
  autoClosePO: boolean

  // Receiving
  autoCompleteReceipt: boolean
  autoCreateProduct: boolean
  allowOverReceipt: boolean
  allowPartialReceipt: boolean
  requiresInspection: boolean
  receivingTolerance: number
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

export default function POOrderRoutingPage() {
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
    autoCreateReceipt: true,
    receiptTrigger: "IN_TRANSIT",
    pushToWMS: false,
    wmsTrigger: "RECEIPT_CREATED",
    autoClosePO: true,

    autoCompleteReceipt: false,
    autoCreateProduct: false,
    allowOverReceipt: true,
    allowPartialReceipt: true,
    requiresInspection: false,
    receivingTolerance: 10
  })

  // Routing Rules
  const [routingRules, setRoutingRules] = React.useState<RoutingRule[]>([
    {
      id: "rule-1",
      name: "Factory Direct Fulfillment",
      description: "Route factory-direct POs through FG staging warehouse",
      type: "PO_ROUTING",
      enabled: true,
      priority: 1,
      executionMode: "FIRST_MATCH",
      conditionLogic: "AND",
      conditions: [
        {
          id: "cond-1",
          field: "purchaseType",
          operator: "equals",
          value: "FACTORY_DIRECT",
          logic: "AND"
        }
      ],
      actions: [
        {
          type: "SET_WORKFLOW",
          workflow: "FACTORY_DIRECT",
          config: {
            enableFGStaging: true,
            generateFGReceipt: true,
            generateSaleOrder: true,
            waitForFGReceipt: false,
            autoCreateFinalReceipt: true
          }
        }
      ],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z"
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
      toast.success("Rule updated successfully")
    } else {
      setRoutingRules([...routingRules, { ...rule, priority: routingRules.length + 1 }])
      toast.success("Rule created successfully")
    }
  }

  const handleAddRule = () => {
    const newRule: RoutingRule = {
      id: `rule-${Date.now()}`,
      name: "",
      description: "",
      type: "CUSTOM",
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
            <h1 className="text-3xl font-bold tracking-tight">Order Routing Rules</h1>
            <p className="text-muted-foreground">
              Configure how purchase orders are fulfilled, routed, and automated.
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
              <TabsTrigger value="rules">Routing Rules (路由规则)</TabsTrigger>
              <TabsTrigger value="settings">Global Settings (全局设置)</TabsTrigger>
            </TabsList>
          </div>

          {/* ==================== TAB 1: ROUTING RULES ==================== */}
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
                  <Route className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Routing Rules Yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
                  Create rules to automatically route orders to specific warehouses or workflows based on criteria.
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
                        rule.enabled ? "bg-primary" : "bg-muted-foreground/30"
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
                          rule.type === "PO_ROUTING" ? "bg-purple-100 text-purple-600" :
                            rule.type === "SPLIT_PO" ? "bg-blue-100 text-blue-600" :
                              rule.type === "SPLIT_PR" ? "bg-green-100 text-green-600" :
                                "bg-gray-100 text-gray-600"
                        )}>
                          {rule.type === "PO_ROUTING" ? <Truck className="h-5 w-5" /> : <Route className="h-5 w-5" />}
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
                              <Zap className="h-3 w-3 text-amber-500" />
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

            {/* V4 Dialog Component - With Rule Type Support */}
            <PORoutingRuleDialogV4
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
                <div className="bg-primary/10 p-2 rounded-md">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Global Default Configuration</h3>
                  <p className="text-sm text-muted-foreground">These settings apply when NO routing rules match an order.</p>
                </div>
              </div>
              <Button onClick={handleSaveGlobal} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. Receiving Controls */}
              <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Archive className="h-4 w-4 text-primary" /> Receiving Controls
                  </CardTitle>
                  <CardDescription>Rules for warehouse receiving process</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="cursor-pointer">Allow Over Receipt (允许超收)</Label>
                      <p className="text-xs text-muted-foreground">Allow receiving quantity greater than ordered quantity (允许入库数量大于订单数量)</p>
                    </div>
                    <Switch checked={globalSettings.allowOverReceipt} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, allowOverReceipt: c })} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="cursor-pointer">Allow Partial Receipt (允许分批到货)</Label>
                      <p className="text-xs text-muted-foreground">Allow multiple receipts for a single purchase order (允许一个PO分多次收货)</p>
                    </div>
                    <Switch checked={globalSettings.allowPartialReceipt} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, allowPartialReceipt: c })} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="cursor-pointer">Requires Inspection (质检控制)</Label>
                      <p className="text-xs text-muted-foreground">Flag new receipts for quality inspection by default (默认标记新入库单需要质检)</p>
                    </div>
                    <Switch checked={globalSettings.requiresInspection} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, requiresInspection: c })} />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Receiving Tolerance (%)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        className="w-24"
                        value={globalSettings.receivingTolerance}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, receivingTolerance: Number(e.target.value) })}
                      />
                      <span className="text-muted-foreground text-sm self-center">Max excess</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Automation Triggers */}
              <Card className="md:col-span-1 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" /> Automation Triggers
                  </CardTitle>
                  <CardDescription>Auto-creation and syncing logic</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="space-y-3 bg-muted/20 p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="font-medium">Auto-Create Receipt (自动创建入库单)</Label>
                        <p className="text-xs text-muted-foreground">Automatically create a receiving document when PO status matches (当采购单状态匹配时自动创建入库通知)</p>
                      </div>
                      <Switch checked={globalSettings.autoCreateReceipt} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, autoCreateReceipt: c })} />
                    </div>
                    {globalSettings.autoCreateReceipt && (
                      <div className="pl-2 border-l-2 border-primary/20 space-y-3 pt-1">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Trigger Status</Label>
                          <Select value={globalSettings.receiptTrigger} onValueChange={(v: any) => setGlobalSettings({ ...globalSettings, receiptTrigger: v })}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">New</SelectItem>
                              <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                              <SelectItem value="WAITING_FOR_RECEIVING">Waiting for Receiving</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Push to WMS (推送到WMS)</Label>
                      <p className="text-xs text-muted-foreground">Synchronize receipt data with the warehouse management system (将入库数据同步至仓库管理系统)</p>
                    </div>
                    <Switch checked={globalSettings.pushToWMS} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, pushToWMS: c })} />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label>Auto-Close PO (自动关单)</Label>
                      <p className="text-xs text-muted-foreground">Automatically close PO when fully received (全额收货后自动关闭采购单)</p>
                    </div>
                    <Switch checked={globalSettings.autoClosePO} onCheckedChange={(c) => setGlobalSettings({ ...globalSettings, autoClosePO: c })} />
                  </div>

                </CardContent>
              </Card>

              {/* 3. System Defaults */}
              <Card className="md:col-span-2 shadow-sm bg-muted/5 border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> System Defaults (Fallbacks)
                  </CardTitle>
                  <CardDescription>Applied only when NO rules are matched</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Default Target Warehouse</Label>
                    <Select defaultValue="US-EAST">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US-EAST">US East Coast (Primary)</SelectItem>
                        <SelectItem value="US-WEST">US West Coast</SelectItem>
                        <SelectItem value="CN-SH">Shanghai Consolidation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Fulfillment Workflow</Label>
                    <Select defaultValue="STANDARD">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard Receipt</SelectItem>
                        <SelectItem value="CROSS_DOCK">Cross Dock</SelectItem>
                      </SelectContent>
                    </Select>
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
