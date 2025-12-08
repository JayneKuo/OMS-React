"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, Settings, User, Moon, Sun, Globe, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mainNavItems = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Orders", href: "/orders" },
  { title: "Returns", href: "/returns" },
  { title: "Purchase", href: "/purchase" },
  { title: "Logistics", href: "/logistics" },
  { title: "Inventory", href: "/inventory" },
  { title: "Product", href: "/product" },
  { title: "Events", href: "/events" },
  { title: "Integrations", href: "/integrations" },
  { title: "POM", href: "/pom" },
  { title: "Automation", href: "/automation" },
  { title: "Customer Management", href: "/customer-management" },
  { title: "Merchant Management", href: "/merchant-management" },
]

export function Header() {
  const pathname = usePathname()
  const { setTheme } = useTheme()
  const [language, setLanguage] = React.useState("English")
  const [timezone, setTimezone] = React.useState("UTC")

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">I</span>
            </div>
            <span className="text-lg font-bold">Item OMS</span>
          </Link>
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
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" title={`Language: ${language}`}>
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage("English")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("中文简体")}>
                  中文简体
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("中文繁體")}>
                  中文繁體
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("日本語")}>
                  日本語
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Timezone Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9" title={`Timezone: ${timezone}`}>
                  <Clock className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTimezone("UTC")}>
                  UTC
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimezone("Asia/Shanghai (UTC+8)")}>
                  Asia/Shanghai (UTC+8)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimezone("America/New_York (UTC-5)")}>
                  America/New_York (UTC-5)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimezone("Europe/London (UTC+0)")}>
                  Europe/London (UTC+0)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
      </div>

      {/* Main Navigation */}
      <div className="border-t">
        <nav className="flex items-center space-x-1 px-6 py-2 overflow-x-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
