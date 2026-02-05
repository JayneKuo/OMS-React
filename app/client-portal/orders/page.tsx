"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { DataTable } from "@/components/data-table/data-table"
import { FileText, Package, Users, TrendingUp } from "lucide-react"

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
  { key: "amount", label: "Amount", sortable: true },
  { key: "status", label: "Status", sortable: true },
]

const mockData = [
  { id: "1", orderNo: "ORD-001", date: "2024-01-15", customer: "John Doe", amount: "$1,250", status: "Completed" },
  { id: "2", orderNo: "ORD-002", date: "2024-01-16", customer: "Jane Smith", amount: "$890", status: "Processing" },
  { id: "3", orderNo: "ORD-003", date: "2024-01-17", customer: "Bob Johnson", amount: "$2,100", status: "Shipped" },
]

export default function ClientPortalOrdersPage() {
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Client Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground mt-2">
            View and manage your orders
          </p>
        </div>

        <DataTable
          columns={columns}
          data={mockData}
          searchable
          searchPlaceholder="Search orders..."
        />
      </div>
    </MainLayout>
  )
}
