import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function InventoryPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage stock levels and warehouse inventory</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Stock Overview</CardTitle>
            <CardDescription>Current inventory levels across all warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Inventory data loading...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
