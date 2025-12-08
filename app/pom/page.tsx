import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function POMPage() {
  return (
    <MainLayout>
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
