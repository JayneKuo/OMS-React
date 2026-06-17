"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PORoutingRuleDialogV4 } from "@/components/automation/po-routing-rule-dialog-v4"
import { cn } from "@/lib/utils"
import type { RoutingRule } from "@/lib/types/routing-rule"
import {
  ArrowLeftRight,
  Box,
  Copy,
  Download,
  Filter,
  Globe,
  Mail,
  MoreHorizontal,
  Network,
  Package,
  PauseCircle,
  Plus,
  Route,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  Warehouse,
  Webhook,
  Edit,
  Save,
} from "lucide-react"
import { toast } from "sonner"

interface GlobalDefaultSettings {
  autoCreateReceipt: boolean
  receiptTrigger: string
  pushToWMS: boolean
  autoClosePO: boolean
  allowOverReceipt: boolean
  allowPartialReceipt: boolean
  requiresInspection: boolean
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
    ],
  },
  {
    title: "Purchase Order",
    href: "/automation/purchase-order",
    icon: <ShoppingCart className="h-4 w-4" />,
    children: [
      { title: "PO Order Routing", href: "/automation/purchase-order/routing", icon: <Route className="h-4 w-4" /> },
    ],
  },
  {
    title: "Inventory",
    href: "/automation/inventory",
    icon: <Box className="h-4 w-4" />,
    children: [
      { title: "Inventory Sync Rules", href: "/automation/inventory/sync-rules", icon: <Box className="h-4 w-4" /> },
    ],
  },
  {
    title: "Logistics",
    href: "/automation/logistics",
    icon: <Truck className="h-4 w-4" />,
    children: [
      { title: "Carrier Account", href: "/automation/logistics/carrier-account", icon: <Store className="h-4 w-4" /> },
      { title: "Carrier & Delivery Service", href: "/automation/logistics/carrier-delivery-service", icon: <Truck className="h-4 w-4" /> },
      { title: "Delivery Order Routing", href: "/automation/logistics/delivery-order-routing", icon: <Route className="h-4 w-4" /> },
    ],
  },
  { title: "Email Notification", href: "/automation/email-notification", icon: <Mail className="h-4 w-4" /> },
  { title: "Webhook", href: "/automation/webhook", icon: <Webhook className="h-4 w-4" /> },
]

const createEmptyRule = (): RoutingRule => ({
  id: `rule-${Date.now()}`,
  name: "",
  description: "",
  type: "PO_ROUTING",
  enabled: true,
  priority: 1,
  executionMode: "FIRST_MATCH",
  conditions: [],
  conditionLogic: "AND",
  actions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

const initialRules: RoutingRule[] = [
  {
    id: "rule-1",
    name: "Missing vendor -> auto assign vendors",
    description: "When upstream PO has no vendor, resolve vendors automatically and create downstream execution flow.",
    type: "PO_ROUTING",
    enabled: true,
    priority: 1,
    executionMode: "FIRST_MATCH",
    conditionLogic: "AND",
    conditions: [{ id: "cond-1", field: "supplier", operator: "isEmpty", value: "" }],
    actions: [
      {
        type: "SET_WORKFLOW",
        workflow: "STANDARD",
        config: {
          vendorResolutionMode: "AUTO_ASSIGN_MULTIPLE",
          vendorSelectionBasis: "RULE_MATCH",
          allowVendorSplit: true,
          createVendorPOs: true,
        },
      },
    ],
    createdAt: "2026-06-04T09:00:00Z",
    updatedAt: "2026-06-05T09:20:00Z",
  },
  {
    id: "rule-2",
    name: "Generate RN by vendor + warehouse",
    description: "Split receipt creation by vendor and warehouse, then auto push to warehouse.",
    type: "PO_ROUTING",
    enabled: true,
    priority: 2,
    executionMode: "FIRST_MATCH",
    conditionLogic: "AND",
    conditions: [{ id: "cond-2", field: "poType", operator: "equals", value: "STANDARD" }],
    actions: [
      {
        type: "SET_WORKFLOW",
        workflow: "STANDARD",
        config: {
          receiptGenerationMode: "PER_VENDOR_AND_WAREHOUSE",
          autoPushReceipt: true,
          receiptPushTarget: "WAREHOUSE",
        },
      },
    ],
    createdAt: "2026-06-04T10:00:00Z",
    updatedAt: "2026-06-05T08:10:00Z",
  },
  {
    id: "rule-3",
    name: "Warehouse change -> cancel and recreate RN",
    description: "If user changes warehouse after push, cancel old RN and create new RN number.",
    type: "PO_ROUTING",
    enabled: false,
    priority: 3,
    executionMode: "FIRST_MATCH",
    conditionLogic: "AND",
    conditions: [{ id: "cond-3", field: "warehouseType", operator: "equals", value: "3PL" }],
    actions: [
      {
        type: "SET_WORKFLOW",
        workflow: "STANDARD",
        config: {
          allowWarehouseChangeAfterPush: true,
          warehouseChangePolicy: "CANCEL_AND_RECREATE_RN",
          cancelPreviousReceiptOnWarehouseChange: true,
        },
      },
    ],
    createdAt: "2026-06-04T11:00:00Z",
    updatedAt: "2026-06-04T11:30:00Z",
  },
]

export default function POOrderRoutingPage() {
  const [locale, setLocale] = React.useState<"zh" | "en">("zh")
  const [mainTab, setMainTab] = React.useState("rules")
  const [statusTab, setStatusTab] = React.useState("all")
  const [searchValue, setSearchValue] = React.useState("")
  const [selectedRule, setSelectedRule] = React.useState<RoutingRule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [rules, setRules] = React.useState<RoutingRule[]>(initialRules)
  const [isSavingDefaults, setIsSavingDefaults] = React.useState(false)
  const [globalDefaults, setGlobalDefaults] = React.useState<GlobalDefaultSettings>({
    autoCreateReceipt: true,
    receiptTrigger: "IN_TRANSIT",
    pushToWMS: false,
    autoClosePO: true,
    allowOverReceipt: true,
    allowPartialReceipt: true,
    requiresInspection: false,
  })

  React.useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    if (!browserLang.includes("zh")) setLocale("en")
  }, [])

  const filteredRules = React.useMemo(() => {
    let current = [...rules]

    if (statusTab === "enabled") current = current.filter((rule) => rule.enabled)
    if (statusTab === "disabled") current = current.filter((rule) => !rule.enabled)
    if (statusTab === "vendor") {
      current = current.filter((rule) =>
        rule.actions.some(
          (action) =>
            action.type === "SET_WORKFLOW" &&
            action.workflow === "STANDARD" &&
            action.config.vendorResolutionMode &&
            action.config.vendorResolutionMode !== "KEEP_UPSTREAM"
        )
      )
    }
    if (statusTab === "rn") {
      current = current.filter((rule) =>
        rule.actions.some(
          (action) =>
            action.type === "SET_WORKFLOW" &&
            action.workflow === "STANDARD" &&
            (action.config.receiptGenerationMode || action.config.allowWarehouseChangeAfterPush)
        )
      )
    }

    const query = searchValue.trim().toLowerCase()
    if (query) {
      current = current.filter((rule) => `${rule.name} ${rule.description}`.toLowerCase().includes(query))
    }

    return current.sort((a, b) => a.priority - b.priority)
  }, [rules, searchValue, statusTab])

  const saveRule = (rule: RoutingRule) => {
    setRules((current) => {
      const index = current.findIndex((item) => item.id === rule.id)
      if (index >= 0) {
        const next = [...current]
        next[index] = rule
        return next
      }
      return [...current, { ...rule, priority: current.length + 1 }]
    })
    toast.success("Rule saved")
  }

  const openCreate = () => {
    setSelectedRule(createEmptyRule())
    setIsDialogOpen(true)
  }

  const openEdit = (rule: RoutingRule) => {
    setSelectedRule(rule)
    setIsDialogOpen(true)
  }

  const toggleRule = (ruleId: string) => {
    setRules((current) => current.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)))
  }

  const duplicateRule = (rule: RoutingRule) => {
    setRules((current) => [
      ...current,
      {
        ...rule,
        id: `rule-${Date.now()}`,
        name: `${rule.name} (Copy)`,
        priority: current.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
    toast.success("Rule duplicated")
  }

  const deleteRule = (ruleId: string) => {
    setRules((current) => current.filter((rule) => rule.id !== ruleId))
    toast.success("Rule deleted")
  }

  const saveGlobalDefaults = async () => {
    setIsSavingDefaults(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsSavingDefaults(false)
    toast.success("Global defaults saved")
  }

  const actionSummary = (rule: RoutingRule) => {
    const workflow = rule.actions.find((action) => action.type === "SET_WORKFLOW")
    if (workflow?.type === "SET_WORKFLOW") {
      const labels: string[] = []
      if (workflow.config.vendorResolutionMode === "AUTO_ASSIGN_MULTIPLE") labels.push("多个 Vendor")
      if (workflow.config.vendorResolutionMode === "AUTO_ASSIGN_SINGLE") labels.push("单个 Vendor")
      if (workflow.config.receiptGenerationMode === "PER_VENDOR") labels.push("按 Vendor 生成 RN")
      if (workflow.config.receiptGenerationMode === "PER_VENDOR_AND_WAREHOUSE") labels.push("按 Vendor + 仓库生成 RN")
      if (workflow.config.allowWarehouseChangeAfterPush) labels.push("换仓重建 RN")
      return labels.join(" / ") || "工作流已配置"
    }
    return `${rule.actions.length} 个动作`
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Automation">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">PO Order Routing</h1>
            <p className="mt-1 text-sm text-muted-foreground">管理采购路由规则与全局默认设置。</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={locale} onValueChange={(value: "zh" | "en") => setLocale(value)}>
              <SelectTrigger className="w-[120px]">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh">中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              新建规则
            </Button>
          </div>
        </div>

        <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="rules">规则列表</TabsTrigger>
            <TabsTrigger value="global">全局默认设置</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索规则名称或描述..."
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                筛选
              </Button>
              <Button variant="outline" size="sm">优先级</Button>
              <Button variant="outline" size="sm">最近修改</Button>
            </div>

            <Tabs value={statusTab} onValueChange={setStatusTab}>
              <TabsList>
                <TabsTrigger value="all">全部 ({rules.length})</TabsTrigger>
                <TabsTrigger value="enabled">启用中 ({rules.filter((rule) => rule.enabled).length})</TabsTrigger>
                <TabsTrigger value="disabled">已停用 ({rules.filter((rule) => !rule.enabled).length})</TabsTrigger>
                <TabsTrigger value="vendor">Vendor 规则</TabsTrigger>
                <TabsTrigger value="rn">RN 规则</TabsTrigger>
              </TabsList>
            </Tabs>

            <Card>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="text-sm text-muted-foreground">共 {filteredRules.length} 条规则</div>
                  <div className="text-sm text-muted-foreground">点击状态可快速启停</div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">规则名称</TableHead>
                      <TableHead className="font-semibold">适用条件</TableHead>
                      <TableHead className="font-semibold">系统动作</TableHead>
                      <TableHead className="font-semibold">状态</TableHead>
                      <TableHead className="font-semibold">更新时间</TableHead>
                      <TableHead className="text-right font-semibold">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.name}</span>
                              <Badge variant="outline">#{rule.priority}</Badge>
                            </div>
                            <p className="max-w-[360px] text-sm text-muted-foreground">{rule.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {rule.conditions.length > 0 ? `${rule.conditions.length} 个条件 / ${rule.conditionLogic}` : "始终匹配"}
                        </TableCell>
                        <TableCell className="text-sm">{actionSummary(rule)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-auto px-0 font-normal hover:bg-transparent",
                              rule.enabled ? "text-green-700" : "text-muted-foreground"
                            )}
                            onClick={() => toggleRule(rule.id)}
                          >
                            {rule.enabled ? "启用中" : "已停用"}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(rule.updatedAt).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(rule)}>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => duplicateRule(rule)}>
                                <Copy className="mr-2 h-4 w-4" />
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => deleteRule(rule.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                  <div>显示 1-{filteredRules.length} 条，共 {filteredRules.length} 条记录</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>上一页</Button>
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                    <Button variant="outline" size="sm" disabled>下一页</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>全局默认设置</CardTitle>
                <CardDescription>仅在没有规则命中时生效。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <SettingRow
                      label="自动创建收货单"
                      description="未命中规则时，按默认流程创建 RN。"
                      checked={globalDefaults.autoCreateReceipt}
                      onCheckedChange={(checked) => setGlobalDefaults({ ...globalDefaults, autoCreateReceipt: checked })}
                    />
                    <SettingRow
                      label="推送到 WMS"
                      description="未命中规则时，是否自动推送到 WMS。"
                      checked={globalDefaults.pushToWMS}
                      onCheckedChange={(checked) => setGlobalDefaults({ ...globalDefaults, pushToWMS: checked })}
                    />
                    <SettingRow
                      label="自动关单"
                      description="默认收货完成后自动关闭 PO。"
                      checked={globalDefaults.autoClosePO}
                      onCheckedChange={(checked) => setGlobalDefaults({ ...globalDefaults, autoClosePO: checked })}
                    />
                  </div>

                  <div className="space-y-4">
                    <SettingRow
                      label="允许超收"
                      description="默认允许入库数量大于订单数量。"
                      checked={globalDefaults.allowOverReceipt}
                      onCheckedChange={(checked) => setGlobalDefaults({ ...globalDefaults, allowOverReceipt: checked })}
                    />
                    <SettingRow
                      label="允许分批收货"
                      description="默认允许一个 PO 多次收货。"
                      checked={globalDefaults.allowPartialReceipt}
                      onCheckedChange={(checked) => setGlobalDefaults({ ...globalDefaults, allowPartialReceipt: checked })}
                    />
                    <SettingRow
                      label="默认需要质检"
                      description="默认收货后进入质检流程。"
                      checked={globalDefaults.requiresInspection}
                      onCheckedChange={(checked) => setGlobalDefaults({ ...globalDefaults, requiresInspection: checked })}
                    />
                  </div>
                </div>

                <div className="max-w-[220px] space-y-2">
                  <Label>默认触发状态</Label>
                  <Select
                    value={globalDefaults.receiptTrigger}
                    onValueChange={(value) => setGlobalDefaults({ ...globalDefaults, receiptTrigger: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="WAITING_FOR_RECEIVING">Waiting for Receiving</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button onClick={saveGlobalDefaults} disabled={isSavingDefaults}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingDefaults ? "保存中..." : "保存全局默认设置"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <PORoutingRuleDialogV4
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          rule={selectedRule}
          onSave={saveRule}
          locale={locale}
        />
      </div>
    </MainLayout>
  )
}

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
