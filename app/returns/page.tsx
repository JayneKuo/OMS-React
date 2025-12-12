import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sidebarItems = [
  { title: "All Returns", href: "/returns" },
  { title: "Pending Review", href: "/returns/pending" },
  { title: "Approved", href: "/returns/approved" },
  { title: "Rejected", href: "/returns/rejected" },
  { title: "Completed", href: "/returns/completed" },
]

export default function ReturnsPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Returns">
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
