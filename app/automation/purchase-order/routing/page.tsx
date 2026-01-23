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
import { PORoutingRuleDialogV2 } from "@/components/automation/po-routing-rule-dialog-v2"
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
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

// Global default settings
interface GlobalSettings {
  autoCreateReceipt: boolean
  receiptTrigger?: "NEW" | "IN_TRANSIT" | "WAITING_FOR_RECEIVING"
  autoCompleteReceipt: boolean
  autoCreateProduct: boolean
  allowOverReceipt: boolean
  pushToWMS: boolean
  wmsTrigger?: "RECEIPT_CREATED"
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

  // Global default settings
  const [globalSettings, setGlobalSettings] = React.useState<GlobalSettings>({
    autoCreateReceipt: true,
    receiptTrigger: "IN_TRANSIT",
    autoCompleteReceipt: false,
    autoCreateProduct: false,
    allowOverReceipt: true,
    pushToWMS: false,
    wmsTrigger: "RECEIPT_CREATED"
  })

  // Routing Rules
  const [routingRules, setRoutingRules] = React.useState<RoutingRule[]>([
    {
      id: "rule-1",
      name: "Factory Direct Fulfillment",
      description: "Route factory-direct POs through FG staging warehouse",
      type: "FACTORY_DIRECT",
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
      // Update existing rule
      const newRules = [...routingRules]
      newRules[existingIndex] = rule
      setRoutingRules(newRules)
      toast.success("Rule updated successfully")
    } else {
      // Add new rule
      setRoutingRules([...routingRules, { ...rule, priority: routingRules.length + 1 }])
      toast.success("Rule created successfully")
    }
  }

  const handleAddRule = () => {
    // Create a new rule with default values using new IF-THEN structure
    const newRule: RoutingRule = {
      id: `rule-${Date.now()}`,
      name: "",
      description: "",
      type: "FACTORY_DIRECT",
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
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">PO Order Routing</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Configure automated routing and receiving behavior for purchase orders
          </p>
        </div>

        {/* Global Default Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Global Default Settings</CardTitle>
                <CardDescription>
                  Configure automated routing behavior for purchase orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Flow Info */}
            <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Business Flow</p>
                  <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                    <li>• <strong>Receipt Creation</strong>: Triggered by PO status (New, In Transit, or Waiting for Receiving)</li>
                    <li>• <strong>Local Warehouse</strong>: Can auto-complete receipt (skip manual receiving)</li>
                    <li>• <strong>Non-Local Warehouse</strong>: Auto-push to WMS when receipt is created</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Auto Create Receipt */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <Label className="text-base font-medium">Auto-Create Receipt</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically create receipt records when PO reaches specified status
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.autoCreateReceipt}
                    onCheckedChange={(checked) => 
                      setGlobalSettings({ ...globalSettings, autoCreateReceipt: checked })
                    }
                  />
                </div>
                
                {globalSettings.autoCreateReceipt && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm">Trigger Node (PO Status)</Label>
                      <Select
                        value={globalSettings.receiptTrigger}
                        onValueChange={(value: any) => 
                          setGlobalSettings({ ...globalSettings, receiptTrigger: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                          <SelectItem value="WAITING_FOR_RECEIVING">Waiting for Receiving (Shipping Arrival)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Receipt will be created when PO reaches this status
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Auto Complete Receipt */}
              <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <Label className="text-base font-medium">Auto-Complete Receipt (Local Warehouse)</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically complete receiving process when receipt is created for local warehouses
                  </p>
                </div>
                <Switch
                  checked={globalSettings.autoCompleteReceipt}
                  onCheckedChange={(checked) => 
                    setGlobalSettings({ ...globalSettings, autoCompleteReceipt: checked })
                  }
                />
              </div>

              {/* Auto Create Product */}
              <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-amber-600" />
                    <Label className="text-base font-medium">Auto-Create Missing Products</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically create product records when receiving items that don't exist in the system
                  </p>
                </div>
                <Switch
                  checked={globalSettings.autoCreateProduct}
                  onCheckedChange={(checked) => 
                    setGlobalSettings({ ...globalSettings, autoCreateProduct: checked })
                  }
                />
              </div>

              {/* Allow Over Receipt */}
              <div className="flex items-start justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <Label className="text-base font-medium">Allow Over Receipt</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow receiving quantities that exceed the ordered amount
                  </p>
                </div>
                <Switch
                  checked={globalSettings.allowOverReceipt}
                  onCheckedChange={(checked) => 
                    setGlobalSettings({ ...globalSettings, allowOverReceipt: checked })
                  }
                />
              </div>

              {/* Push to WMS */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-purple-600" />
                      <Label className="text-base font-medium">Push to WMS (Non-Local Warehouse)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Automatically send data to downstream WMS when receipt is created for non-local warehouses
                    </p>
                  </div>
                  <Switch
                    checked={globalSettings.pushToWMS}
                    onCheckedChange={(checked) => 
                      setGlobalSettings({ ...globalSettings, pushToWMS: checked })
                    }
                  />
                </div>

                {globalSettings.pushToWMS && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm">Trigger Node (Receipt Status)</Label>
                      <Select
                        value={globalSettings.wmsTrigger}
                        onValueChange={(value: any) => 
                          setGlobalSettings({ ...globalSettings, wmsTrigger: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RECEIPT_CREATED">Receipt Created</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Data will be pushed to WMS when receipt is created (NEW status)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Changes apply to all warehouses without specific overrides</span>
              </div>
              <Button onClick={handleSaveGlobal} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Global Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Routing Rules */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Routing Rules</CardTitle>
                  <CardDescription>
                    Configure conditional routing logic for different PO scenarios
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleAddRule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Banner */}
            <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium">How Routing Rules Work</p>
                  <p className="text-muted-foreground">
                    Rules are evaluated in <strong>priority order (top to bottom)</strong>. Each rule can have its own execution mode.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                        🎯 First Match Mode (Default)
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        The first matching rule determines the workflow. Evaluation stops after first match.
                      </p>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 ml-4 space-y-0.5">
                        <li>• Priority 1 matches → Use Priority 1 (stop)</li>
                        <li>• Priority 2 matches → Use Priority 2 (stop)</li>
                        <li>• No match → Use Global Default Settings</li>
                      </ul>
                    </div>
                    
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded border border-amber-200 dark:border-amber-800">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                        🔗 Chain Mode
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Multiple matching rules can be applied in sequence. Each rule adds or overrides settings.
                      </p>
                      <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 ml-4 space-y-0.5">
                        <li>• Priority 1 matches → Apply Priority 1 settings</li>
                        <li>• Priority 2 matches → Merge/Override with Priority 2</li>
                        <li>• Priority 3 matches → Merge/Override with Priority 3</li>
                      </ul>
                    </div>

                    <div className="p-2 bg-purple-50 dark:bg-purple-950/20 rounded border border-purple-200 dark:border-purple-800">
                      <p className="text-xs font-medium text-purple-900 dark:text-purple-100 mb-1">
                        🎭 All Match Mode
                      </p>
                      <p className="text-xs text-purple-800 dark:text-purple-200">
                        All matching rules are merged together. Higher priority wins conflicts.
                      </p>
                      <ul className="text-xs text-purple-700 dark:text-purple-300 mt-1 ml-4 space-y-0.5">
                        <li>• All matching rules contribute settings</li>
                        <li>• Conflicts resolved by priority (higher = wins)</li>
                        <li>• Best for additive configurations</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Tip: Set execution mode when creating/editing each rule. Drag rules to reorder priority.
                  </p>
                </div>
              </div>
            </div>

            {/* Rules List */}
            {routingRules.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Routing Rules</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first routing rule to customize PO fulfillment workflows
                </p>
                <Button onClick={handleAddRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {routingRules
                  .sort((a, b) => a.priority - b.priority)
                  .map((rule, index) => (
                    <div
                      key={rule.id}
                      className={cn(
                        "group relative p-4 border rounded-lg transition-all",
                        rule.enabled 
                          ? "bg-card hover:shadow-md" 
                          : "bg-muted/30 opacity-60"
                      )}
                    >
                      {/* Drag Handle */}
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex items-start gap-4 ml-6">
                        {/* Priority Badge */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                          {index + 1}
                        </div>

                        {/* Rule Content */}
                        <div className="flex-1 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{rule.name}</h4>
                                <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
                                  {rule.enabled ? "Active" : "Disabled"}
                                </Badge>
                                {rule.type === "FACTORY_DIRECT" && (
                                  <Badge variant="outline" className="text-xs">
                                    <Truck className="h-3 w-3 mr-1" />
                                    Factory Direct
                                  </Badge>
                                )}
                                {/* Execution Mode Badge */}
                                {rule.executionMode && rule.executionMode !== "FIRST_MATCH" && (
                                  <Badge variant="secondary" className="text-xs">
                                    {rule.executionMode === "CHAIN" && "🔗 Chain"}
                                    {rule.executionMode === "ALL_MATCH" && "🎭 All Match"}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{rule.description}</p>
                            </div>

                            {/* Actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedRule(rule)
                                  setIsRuleDialogOpen(true)
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Rule
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  const newRule = { ...rule, id: `rule-${Date.now()}`, name: `${rule.name} (Copy)` }
                                  setRoutingRules([...routingRules, newRule])
                                }}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setRoutingRules(routingRules.map(r => 
                                    r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                                  ))
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {rule.enabled ? "Disable" : "Enable"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setRoutingRules(routingRules.filter(r => r.id !== rule.id))
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Conditions */}
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground font-medium">IF:</span>
                            <div className="flex flex-wrap gap-2">
                              {rule.conditions.map((condition, idx) => (
                                <React.Fragment key={idx}>
                                  <Badge variant="secondary" className="font-normal">
                                    {condition.field} {condition.operator} "{condition.value}"
                                  </Badge>
                                  {idx < rule.conditions.length - 1 && (
                                    <span className="text-xs text-muted-foreground self-center font-mono">
                                      {condition.logic || "AND"}
                                    </span>
                                  )}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>

                          {/* Actions Preview */}
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground font-medium">THEN:</span>
                            <div className="flex flex-wrap gap-2">
                              {rule.actions.map((action, idx) => {
                                if (action.type === "SET_WORKFLOW") {
                                  const workflowAction = action as any
                                  return (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      <Package className="h-3 w-3 mr-1" />
                                      {workflowAction.workflow} Workflow
                                    </Badge>
                                  )
                                }
                                if (action.type === "ASSIGN_WAREHOUSE") {
                                  return (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      <Warehouse className="h-3 w-3 mr-1" />
                                      Assign Warehouse
                                    </Badge>
                                  )
                                }
                                if (action.type === "SEND_NOTIFICATION") {
                                  return (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      <Mail className="h-3 w-3 mr-1" />
                                      Send Notification
                                    </Badge>
                                  )
                                }
                                return (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {action.type}
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>

                          {/* Expand to see details */}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => {
                              setSelectedRule(rule)
                              setIsRuleDialogOpen(true)
                            }}
                          >
                            View Details
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Rule Builder Dialog */}
      <PORoutingRuleDialogV2
        open={isRuleDialogOpen}
        onOpenChange={setIsRuleDialogOpen}
        rule={selectedRule}
        onSave={handleSaveRule}
      />
    </MainLayout>
  )
}
