"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"

const mainNavItems = [
  { title: "Home", href: "/dashboard" },
  { title: "Overview", href: "/overview" },
  { title: "Workspace", href: "/workspace" },
  { title: "Workflow", href: "/workflow" },
  { title: "Integration", href: "/integration" },
  { title: "WCP", href: "/wcp" },
  { title: "Help Center", href: "/help" },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center space-x-8">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">I</span>
          </div>
          <span className="text-lg font-bold">Item OMS</span>
        </Link>
        
        <nav className="flex items-center space-x-1">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="h-9 pl-9"
          />
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
