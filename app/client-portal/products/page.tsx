"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { DataTable } from "@/components/data-table/data-table"
import { FileText, Package, Users, TrendingUp } from "lucide-react"

const columns = [
  { key: "sku", label: "SKU", sortable: true },
  { key: "name", label: "Product Name", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "stock", label: "Stock", sortable: true },
  { key: "price", label: "Price", sortable: true },
]

const mockData = [
  { id: "1", sku: "SKU-001", name: "Product A", category: "Electronics", stock: "150", price: "$299" },
  { id: "2", sku: "SKU-002", name: "Product B", category: "Clothing", stock: "89", price: "$49" },
  { id: "3", sku: "SKU-003", name: "Product C", category: "Home", stock: "234", price: "$129" },
]

export default function ClientPortalProductsPage() {
  const sidebarItems = [
    { title: "Overview", href: "/client-portal", icon: <TrendingUp className="h-4 w-4" /> },
    {
      title: "Orders", href: "/client-portal/orders", icon: <FileText className="h-4 w-4" />,
      children: [
        { title: "Sales Orders", href: "/client-portal/orders/sales" },
        { title: "Wholesale", href: "/client-portal/orders/wholesale" },
        { title: "Retail", href: "/client-portal/orders/retail" },
      ],
    },
    { title: "Products", href: "/client-portal/products", icon: <Package className="h-4 w-4" /> },
    { title: "Profile", href: "/client-portal/profile", icon: <Users className="h-4 w-4" /> },
  ]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Merchant Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-2">Browse and manage your product catalog</p>
        </div>
        <DataTable columns={columns} data={mockData} searchable searchPlaceholder="Search products..." />
      </div>
    </MainLayout>
  )
}
