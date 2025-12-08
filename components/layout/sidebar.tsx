"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  ShoppingCart,
  RotateCcw,
  ShoppingBag,
  Truck,
  Package,
  Box,
  Calendar,
  Plug,
  FileText,
  Zap,
  Users,
  Store,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Returns",
    href: "/returns",
    icon: RotateCcw,
  },
  {
    title: "Purchase",
    href: "/purchase",
    icon: ShoppingBag,
  },
  {
    title: "Logistics",
    href: "/logistics",
    icon: Truck,
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    title: "Product",
    href: "/product",
    icon: Box,
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Integrations",
    href: "/integrations",
    icon: Plug,
  },
  {
    title: "POM",
    href: "/pom",
    icon: FileText,
  },
  {
    title: "Automation",
    href: "/automation",
    icon: Zap,
  },
  {
    title: "Customer Management",
    href: "/customer-management",
    icon: Users,
  },
  {
    title: "Merchant Management",
    href: "/merchant-management",
    icon: Store,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-bold text-primary-foreground">I</span>
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">Item OMS</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      
      <Separator />
      
      <div className="p-4">
        <div className="flex items-center space-x-3 rounded-md bg-sidebar-accent px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-sidebar-foreground">User Name</p>
            <p className="text-xs text-muted-foreground">user@item.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
