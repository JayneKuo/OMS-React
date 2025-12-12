import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "All Merchants", href: "/merchant-management" },
  { title: "Pending Approval", href: "/merchant-management/pending" },
  { title: "Active Merchants", href: "/merchant-management/active" },
  { title: "Merchant Analytics", href: "/merchant-management/analytics" },
]

export default function MerchantManagementPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Merchant Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Merchant Management</h1>
          <p className="text-muted-foreground">Manage merchant accounts and partnerships</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Merchant Directory</CardTitle>
            <CardDescription>View and manage all merchant accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No merchants registered.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
