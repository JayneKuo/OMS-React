"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarItem {
  title: string
  href: string
  icon?: React.ReactNode
  children?: Array<{
    title: string
    href: string
    icon?: React.ReactNode
  }>
}

interface SidebarProps {
  items?: SidebarItem[]
  moduleName?: string
}

export function Sidebar({ items = [], moduleName = "Workspace" }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set())

  // 自动展开包含当前路径的父菜单
  React.useEffect(() => {
    const newExpandedItems = new Set<string>()
    items.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => pathname === child.href)
        if (hasActiveChild) {
          newExpandedItems.add(item.title)
        }
      }
    })
    setExpandedItems(newExpandedItems)
  }, [pathname, items])

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className={cn(
      "flex h-full flex-col border-r bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-[280px]"
    )}>
      <div className="flex h-14 items-center justify-between border-b px-3">
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
      
      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col space-y-1 px-3">
          {items.map((item) => {
            const isActive = pathname === item.href
            const isDisabled = item.href === "#"
            const hasChildren = item.children && item.children.length > 0
            const isExpanded = expandedItems.has(item.title)
            const hasActiveChild = hasChildren && item.children!.some(child => pathname === child.href)
            
            if (isDisabled) {
              return (
                <div
                  key={item.title}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 cursor-not-allowed opacity-50",
                    collapsed ? "justify-center px-0" : ""
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </div>
              )
            }

            // 有子菜单的项
            if (hasChildren) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 relative",
                      collapsed ? "justify-center px-0" : "",
                      hasActiveChild
                        ? "text-primary"
                        : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    {item.icon && <span className="shrink-0">{item.icon}</span>}
                    {!collapsed && (
                      <>
                        <span className="truncate flex-1 text-left overflow-hidden">{item.title}</span>
                        <ChevronDown className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          isExpanded ? "rotate-180" : ""
                        )} />
                      </>
                    )}
                    {collapsed && (
                      <ChevronDown className={cn(
                        "h-3 w-3 absolute bottom-1 right-1 transition-transform",
                        isExpanded ? "rotate-180" : ""
                      )} />
                    )}
                  </button>
                  
                  {/* 子菜单 */}
                  {!collapsed && isExpanded && (
                    <div className="mt-1 space-y-1">
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "rounded-md pl-9 pr-3 py-2 text-sm transition-colors flex items-center gap-2 overflow-hidden",
                              isChildActive
                                ? "bg-primary text-primary-foreground"
                                : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
                            )}
                            title={child.title}
                          >
                            {child.icon && <span className="shrink-0">{child.icon}</span>}
                            <span className="truncate overflow-hidden">{child.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }
            
            // 普通菜单项
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2",
                  collapsed ? "justify-center px-0" : "",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-primary/10 hover:text-primary"
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
