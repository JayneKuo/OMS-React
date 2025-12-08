import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomerManagementPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer information and relationships</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>View and manage all customer records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No customers found.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
