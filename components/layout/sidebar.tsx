"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  items?: Array<{
    title: string
    href: string
    icon?: React.ReactNode
  }>
  moduleName?: string
}

export function Sidebar({ items = [], moduleName = "Workspace" }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex h-14 items-center border-b px-4 justify-between">
        {!collapsed && (
          <span className="text-sm font-medium text-foreground truncate">
            {moduleName}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-3",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                title={collapsed ? item.title : undefined}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                {!collapsed && <span className="truncate">{item.title}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
