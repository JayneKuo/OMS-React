"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Package, Users, TrendingUp } from "lucide-react"

export default function ClientPortalProfilePage() {
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
          <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">John Doe</h2>
                <p className="text-sm text-muted-foreground">john.doe@example.com</p>
              </div>
            </div>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="+1 234 567 8900" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" defaultValue="Acme Corporation" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
