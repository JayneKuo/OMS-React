import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogisticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logistics</h1>
          <p className="text-muted-foreground">Track shipments and manage logistics</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Shipment Tracking</CardTitle>
            <CardDescription>Monitor all shipments in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No active shipments.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
