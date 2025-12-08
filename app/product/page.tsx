import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProductPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Product Catalog</CardTitle>
            <CardDescription>Browse and manage all products</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No products available.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
