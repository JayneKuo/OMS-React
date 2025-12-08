import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReturnsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Returns</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Return Requests</CardTitle>
            <CardDescription>Track and process return requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No return requests at the moment.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
