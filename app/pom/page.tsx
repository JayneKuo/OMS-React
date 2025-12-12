import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "Overview", href: "/pom" },
  { title: "Purchase Orders", href: "/pom/orders" },
  { title: "Suppliers", href: "/pom/suppliers" },
  { title: "Contracts", href: "/pom/contracts" },
]

export default function POMPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="POM">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POM</h1>
          <p className="text-muted-foreground">Purchase Order Management</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>POM Dashboard</CardTitle>
            <CardDescription>Manage purchase order workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">POM module coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
