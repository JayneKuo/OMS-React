"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
  Globe
} from "lucide-react"
import { toast } from "sonner"

// Global default settings
interface GlobalSettings {
  autoCreateReceipt: boolean
  receiptTrigger?: "NEW" | "IN_TRANSIT" | "WAITING_FOR_RECEIVING" // PO状态触发
  autoCompleteReceipt: boolean // 自动完成入库（仅本地仓）
  autoCreateProduct: boolean // 商品不存在时自动创建
  pushToWMS: boolean
  wmsTrigger?: "RECEIPT_CREATED" // Receipt状态触发（仅非本地仓）
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

  // Global default settings
  const [globalSettings, setGlobalSettings] = React.useState<GlobalSettings>({
    autoCreateReceipt: true,
    receiptTrigger: "IN_TRANSIT",
    autoCompleteReceipt: false,
    autoCreateProduct: false,
    pushToWMS: false,
    wmsTrigger: "RECEIPT_CREATED"
  })

  const handleSaveGlobal = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success("Settings saved successfully")
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
      </div>
    </MainLayout>
  )
}
