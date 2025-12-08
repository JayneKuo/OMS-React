"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft } from "lucide-react"

interface SidebarProps {
  items?: Array<{
    title: string
    href: string
  }>
}

export function Sidebar({ items = [] }: SidebarProps) {
  const pathname = usePathname()

  if (items.length === 0) {
    return null
  }

  return (
    <div className="flex h-full w-60 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center border-b px-4">
        <button className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span>Workspace</span>
        </button>
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
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
