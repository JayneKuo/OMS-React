import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "All Integrations", href: "/integrations" },
  { title: "E-commerce", href: "/integrations/ecommerce" },
  { title: "Shipping", href: "/integrations/shipping" },
  { title: "Payment", href: "/integrations/payment" },
  { title: "API Keys", href: "/integrations/api-keys" },
]

export default function IntegrationsPage() {
  return (
    <MainLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Connect with third-party services</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>Connect your OMS with external platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No integrations configured.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
