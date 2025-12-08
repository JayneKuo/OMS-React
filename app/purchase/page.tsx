import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "All Purchase Orders", href: "/purchase" },
  { title: "Draft", href: "/purchase/draft" },
  { title: "Pending Approval", href: "/purchase/pending" },
  { title: "Approved", href: "/purchase/approved" },
  { title: "Received", href: "/purchase/received" },
]

export default function PurchasePage() {
  return (
    <MainLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase</h1>
          <p className="text-muted-foreground">Manage purchase orders and suppliers</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>View and manage purchase orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No purchase orders available.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
