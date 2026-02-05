"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useI18n } from "@/components/i18n-provider"
import { Users, FileText, Package, TrendingUp } from "lucide-react"

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

export default function ClientPortalPage() {
  const { t } = useI18n()

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Client Portal">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Client Portal Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome to your client portal
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-semibold">156</p>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-semibold">89</p>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-semibold">$45.2K</p>
              </div>
            </div>
          </div>

          <div className="bg-card text-card-foreground border rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-semibold">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
