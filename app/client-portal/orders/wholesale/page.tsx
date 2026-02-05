"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { DataTable } from "@/components/data-table/data-table"
import { FileText, Package, Users, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/client-portal",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    title: "Orders",
    href: "/client-portal/orders",
    icon: <FileText className="h-4 w-4" />,
    children: [
      {
        title: "Wholesale Orders",
        href: "/client-portal/orders/wholesale",
      },
      {
        title: "Retail Orders",
        href: "/client-portal/orders/retail",
      },
    ],
  },
  {
    title: "Products",
    href: "/client-portal/products",
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: "Profile",
    href: "/client-portal/profile",
    icon: <Users className="h-4 w-4" />,
  },
]

const columns = [
  { key: "orderNo", label: "Order No.", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "customer", label: "Customer", sortable: true },
  { key: "quantity", label: "Quantity", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "status", label: "Status", sortable: true },
]

const mockData = [
  { 
    id: "1", 
    orderNo: "WHL-001", 
    date: "2024-01-15", 
    customer: "ABC Wholesale Co.", 
    quantity: "500 units",
    amount: "$12,500", 
    status: <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>
  },
  { 
    id: "2", 
    orderNo: "WHL-002", 
    date: "2024-01-16", 
    customer: "XYZ Distribution", 
    quantity: "1,200 units",
    amount: "$28,900", 
    status: <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Processing</Badge>
  },
  { 
    id: "3", 
    orderNo: "WHL-003", 
    date: "2024-01-17", 
    customer: "Global Traders Inc", 
    quantity: "800 units",
    amount: "$19,200", 
    status: <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Shipped</Badge>
  },
  { 
    id: "4", 
    orderNo: "WHL-004", 
    date: "2024-01-18", 
    customer: "Mega Wholesale Ltd", 
    quantity: "2,000 units",
    amount: "$45,000", 
    status: <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Processing</Badge>
  },
]

export default function WholesaleOrdersPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Client Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Wholesale Orders</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage bulk orders for wholesale customers
          </p>
        </div>

        <DataTable
          columns={columns}
          data={mockData}
          searchable
          searchPlaceholder="Search wholesale orders..."
        />
      </div>
    </MainLayout>
  )
}
