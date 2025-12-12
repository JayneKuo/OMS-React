import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "All Products", href: "/product" },
  { title: "Categories", href: "/product/categories" },
  { title: "Brands", href: "/product/brands" },
  { title: "Attributes", href: "/product/attributes" },
  { title: "Import/Export", href: "/product/import-export" },
]

export default function ProductPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Product">
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
