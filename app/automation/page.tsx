import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  Route
} from "lucide-react"

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

export default function AutomationPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Automation">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automation</h1>
          <p className="text-muted-foreground">Configure automated workflows and rules</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
            <CardDescription>Set up automated processes for your operations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No automation rules configured.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
