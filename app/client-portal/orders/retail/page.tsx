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
  { key: "items", label: "Items", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "status", label: "Status", sortable: true },
]

const mockData = [
  { 
    id: "1", 
    orderNo: "RTL-001", 
    date: "2024-01-15", 
    customer: "John Doe", 
    items: "3 items",
    amount: "$250", 
    status: <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Delivered</Badge>
  },
  { 
    id: "2", 
    orderNo: "RTL-002", 
    date: "2024-01-16", 
    customer: "Jane Smith", 
    items: "1 item",
    amount: "$89", 
    status: <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Shipped</Badge>
  },
  { 
    id: "3", 
    orderNo: "RTL-003", 
    date: "2024-01-17", 
    customer: "Bob Johnson", 
    items: "5 items",
    amount: "$420", 
    status: <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Processing</Badge>
  },
  { 
    id: "4", 
    orderNo: "RTL-004", 
    date: "2024-01-18", 
    customer: "Alice Williams", 
    items: "2 items",
    amount: "$175", 
    status: <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Delivered</Badge>
  },
  { 
    id: "5", 
    orderNo: "RTL-005", 
    date: "2024-01-19", 
    customer: "Charlie Brown", 
    items: "4 items",
    amount: "$310", 
    status: <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Processing</Badge>
  },
]

export default function RetailOrdersPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Client Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Retail Orders</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage individual customer orders
          </p>
        </div>

        <DataTable
          columns={columns}
          data={mockData}
          searchable
          searchPlaceholder="Search retail orders..."
        />
      </div>
    </MainLayout>
  )
}
