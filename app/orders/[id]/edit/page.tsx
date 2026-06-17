"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { OrderForm } from "@/components/orders/order-form"
import { Button } from "@/components/ui/button"
import { useDemoOrders } from "@/lib/orders/demo-store"

const sidebarItems = [
  { title: "All Orders", href: "/orders" },
  { title: "Create Order", href: "/orders/create" },
  { title: "AI Exception Handler", href: "/orders/exception-ai" },
]

export default function SalesOrderEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { orders } = useDemoOrders()
  const order = orders.find((item) => item.id === params.id) ?? orders[0]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Orders">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Edit Sales Order</h1>
            <p className="text-sm text-muted-foreground">Update header, customer, channel, and fulfillment line details.</p>
          </div>
        </div>
        <OrderForm mode="edit" order={order} />
      </div>
    </MainLayout>
  )
}
