import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function OrdersPage() {
  const orders = [
    { id: "ORD-001", customer: "John Doe", status: "Pending", amount: "$299.00", date: "2024-01-15" },
    { id: "ORD-002", customer: "Jane Smith", status: "Processing", amount: "$450.00", date: "2024-01-14" },
    { id: "ORD-003", customer: "Bob Johnson", status: "Shipped", amount: "$199.00", date: "2024-01-13" },
    { id: "ORD-004", customer: "Alice Brown", status: "Delivered", amount: "$350.00", date: "2024-01-12" },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all your orders
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>A list of all orders in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{order.amount}</p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "Delivered" ? "bg-green-100 text-green-800" :
                      order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                      order.status === "Processing" ? "bg-yellow-100 text-yellow-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
