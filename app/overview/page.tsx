import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OverviewPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">System overview and key metrics</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>High-level view of your OMS</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Overview content coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
