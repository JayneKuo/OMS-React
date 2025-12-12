"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Search, Bell, Settings, User, Check, Building2, Store, ChevronDown, Globe, Clock, Sun, Moon, Monitor, LogOut } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const tenants = [
  {
    id: "tenant-1",
    name: "Acme Corporation",
    merchants: [
      { id: "merchant-1", name: "Acme Store US" },
      { id: "merchant-2", name: "Acme Store EU" },
      { id: "merchant-3", name: "Acme Store Asia" },
    ],
  },
  {
    id: "tenant-2",
    name: "Global Retail Inc",
    merchants: [
      { id: "merchant-4", name: "Global Shop North" },
      { id: "merchant-5", name: "Global Shop South" },
    ],
  },
  {
    id: "tenant-3",
    name: "TechMart Solutions",
    merchants: [
      { id: "merchant-6", name: "TechMart Online" },
      { id: "merchant-7", name: "TechMart Wholesale" },
      { id: "merchant-8", name: "TechMart Retail" },
    ],
  },
]

export function HeaderSimple() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  
  // Use I18n context for language management
  const { t, language: i18nLanguage, setLanguage: setI18nLanguage } = useI18n()

  // 使用 useMemo 缓存导航项，避免每次渲染都重新创建
  const mainNavItems = React.useMemo(() => [
    { title: t('dashboard'), href: "/dashboard" },
    { title: t('orders'), href: "/orders" },
    { title: t('returns'), href: "/returns" },
    { title: t('purchase'), href: "/purchase" },
    { title: t('logistics'), href: "/logistics" },
    { title: t('inventory'), href: "/inventory" },
    { title: t('product'), href: "/product" },
    { title: t('events'), href: "/events" },
    { title: t('integrations'), href: "/integrations" },
    { title: t('pom'), href: "/pom" },
    { title: t('automation'), href: "/automation" },
    { title: t('customerManagement'), href: "/customer-management" },
    { title: t('merchantManagement'), href: "/merchant-management" },
  ], [t])
  
  const [selectedTenant, setSelectedTenant] = React.useState(tenants[0])
  const [selectedMerchant, setSelectedMerchant] = React.useState(tenants[0].merchants[0])
  const [switcherOpen, setSwitcherOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [timezoneMenuOpen, setTimezoneMenuOpen] = React.useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = React.useState(false)
  const [tenantSearch, setTenantSearch] = React.useState("")
  const [merchantSearch, setMerchantSearch] = React.useState("")
  const [timezone, setTimezone] = React.useState("UTC")

  // Convert i18n language to display format
  const displayLanguage = i18nLanguage === 'zh' ? '中文简体' : 'English'

  // Load timezone preference from localStorage on mount
  React.useEffect(() => {
    const savedTimezone = localStorage.getItem("oms-timezone")
    if (savedTimezone) setTimezone(savedTimezone)
  }, [])

  const filteredTenants = React.useMemo(() => {
    if (!tenantSearch) return tenants
    return tenants.filter((t) =>
      t.name.toLowerCase().includes(tenantSearch.toLowerCase())
    )
  }, [tenantSearch])

  const filteredMerchants = React.useMemo(() => {
    if (!merchantSearch) return selectedTenant.merchants
    return selectedTenant.merchants.filter((m) =>
      m.name.toLowerCase().includes(merchantSearch.toLowerCase())
    )
  }, [merchantSearch, selectedTenant])

  const handleTenantSelect = (tenant: typeof tenants[0]) => {
    setSelectedTenant(tenant)
    setSelectedMerchant(tenant.merchants[0])
    setTenantSearch("")
  }

  const handleMerchantSelect = (merchant: typeof tenants[0]["merchants"][0]) => {
    setSelectedMerchant(merchant)
    setMerchantSearch("")
  }

  const handleApply = () => {
    setSwitcherOpen(false)
    setTenantSearch("")
    setMerchantSearch("")
  }

  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-6 gap-4">
        {/* Left: Logo + Tenant/Merchant */}
        <div className="flex items-center space-x-4 flex-shrink-0 relative">
          <div className="flex items-center space-x-2">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <span className="text-lg font-bold text-primary-foreground">O</span>
              </div>
              <span className="text-lg font-bold">OMS</span>
            </Link>
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-2 hover:bg-accent rounded-md px-2 py-1 transition-colors"
            >
              <div className="flex flex-col -space-y-0.5">
                <span className="text-xs text-muted-foreground text-left whitespace-nowrap">
                  {selectedTenant.name}
                </span>
                <span className="text-xs text-muted-foreground text-left whitespace-nowrap">
                  {selectedMerchant.name}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          {/* Combined Tenant & Merchant Switcher */}
          {switcherOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setSwitcherOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-50 w-[600px] rounded-lg border bg-popover shadow-lg">
                  <div className="flex h-[400px]">
                    {/* Left: Tenants */}
                    <div className="flex-1 border-r">
                      <div className="p-3 border-b">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">{t('tenant')}</span>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder={t('searchTenants')}
                            value={tenantSearch}
                            onChange={(e) => setTenantSearch(e.target.value)}
                            className="pl-9 h-9"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[calc(400px-120px)]">
                        <div className="p-2">
                          {filteredTenants.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              {t('noTenantsFound')}
                            </div>
                          ) : (
                            filteredTenants.map((tenant) => {
                              const isSelected = selectedTenant.id === tenant.id
                              return (
                                <button
                                  key={tenant.id}
                                  onClick={() => handleTenantSelect(tenant)}
                                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent ${
                                    isSelected ? "bg-accent" : ""
                                  }`}
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                    <span className="text-sm font-semibold text-primary">
                                      {tenant.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {tenant.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {tenant.merchants.length} {t('merchants')}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                  )}
                                </button>
                              )
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Right: Merchants */}
                    <div className="flex-1">
                      <div className="p-3 border-b">
                        <div className="flex items-center gap-2 mb-2">
                          <Store className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">{t('merchant')}</span>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder={t('searchMerchants')}
                            value={merchantSearch}
                            onChange={(e) => setMerchantSearch(e.target.value)}
                            className="pl-9 h-9"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[calc(400px-120px)]">
                        <div className="p-2">
                          {filteredMerchants.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              {t('noMerchantsFound')}
                            </div>
                          ) : (
                            filteredMerchants.map((merchant) => {
                              const isSelected = selectedMerchant.id === merchant.id
                              return (
                                <button
                                  key={merchant.id}
                                  onClick={() => handleMerchantSelect(merchant)}
                                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-accent ${
                                    isSelected ? "bg-accent" : ""
                                  }`}
                                >
                                  <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {merchant.name}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-primary shrink-0" />
                                  )}
                                </button>
                              )
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Footer with Apply button */}
                  <div className="border-t p-3 flex justify-end">
                    <Button onClick={handleApply} size="sm">
                      {t('apply')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          <div className="h-6 w-px bg-border" />
        </div>

        {/* Center: Main Navigation */}
        <nav className="flex items-center space-x-1 overflow-x-auto flex-1 min-w-0">
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  console.log('Navigation clicked:', item.title, item.href)
                }}
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
        
        {/* Right: Search + Actions */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          <div className="relative w-64 hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search')}
              className="h-9 pl-9"
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 ${userMenuOpen ? 'bg-accent' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('User menu button clicked, current state:', userMenuOpen)
                  setUserMenuOpen(!userMenuOpen)
                }}
              >
                <User className="h-4 w-4" />
              </Button>

              {/* User Menu Dropdown - 简化版本 */}
              {userMenuOpen && (
                <div className="fixed inset-0 z-50" onClick={() => setUserMenuOpen(false)}>
                  <div 
                    className="absolute right-6 top-14 w-64 rounded-lg border bg-white shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      zIndex: 9999,
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">Admin User</div>
                          <div className="text-xs text-muted-foreground">admin@example.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {/* Language - Hover to show submenu */}
                      <div 
                        className="relative"
                        onMouseEnter={() => setLanguageMenuOpen(true)}
                        onMouseLeave={() => setLanguageMenuOpen(false)}
                      >
                        <button className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-accent rounded">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>{t('language')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-primary font-medium">{displayLanguage}</span>
                            <ChevronDown className="h-3 w-3 -rotate-90" />
                          </div>
                        </button>
                        {/* Submenu - positioned to the left */}
                        {languageMenuOpen && (
                          <div className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-popover shadow-lg z-[60]">
                            <div className="p-1">
                              {[
                                { code: 'en', display: 'English' },
                                { code: 'zh', display: '中文简体' }
                              ].map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    console.log('Language switch clicked:', lang.code)
                                    setI18nLanguage(lang.code as 'zh' | 'en')
                                    setLanguageMenuOpen(false)
                                    setUserMenuOpen(false)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center justify-between ${
                                    i18nLanguage === lang.code ? "text-primary font-medium bg-accent" : ""
                                  }`}
                                >
                                  {lang.display}
                                  {i18nLanguage === lang.code && <Check className="h-3 w-3" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timezone - Hover to show submenu */}
                      <div 
                        className="relative"
                        onMouseEnter={() => setTimezoneMenuOpen(true)}
                        onMouseLeave={() => setTimezoneMenuOpen(false)}
                      >
                        <button className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-accent rounded">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{t('timezone')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-primary font-medium">{timezone}</span>
                            <ChevronDown className="h-3 w-3 -rotate-90" />
                          </div>
                        </button>
                        {/* Submenu - positioned to the left */}
                        {timezoneMenuOpen && (
                          <div className="absolute right-full top-0 mr-1 w-48 rounded-lg border bg-popover shadow-lg z-[60]">
                            <div className="p-1">
                              {["UTC", "Asia/Shanghai", "America/New_York", "Europe/London"].map((tz) => (
                                <button
                                  key={tz}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setTimezone(tz)
                                    setTimezoneMenuOpen(false)
                                    // Store in localStorage for persistence
                                    localStorage.setItem("oms-timezone", tz)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center justify-between ${
                                    timezone === tz ? "text-primary font-medium bg-accent" : ""
                                  }`}
                                >
                                  {tz}
                                  {timezone === tz && <Check className="h-3 w-3" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Theme - Hover to show submenu */}
                      <div 
                        className="relative"
                        onMouseEnter={() => setThemeMenuOpen(true)}
                        onMouseLeave={() => setThemeMenuOpen(false)}
                      >
                        <button className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-accent rounded">
                          <div className="flex items-center gap-2">
                            {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "light" ? <Sun className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                            <span>{t('theme')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-primary font-medium capitalize">{theme || "system"}</span>
                            <ChevronDown className="h-3 w-3 -rotate-90" />
                          </div>
                        </button>
                        {/* Submenu - positioned to the left */}
                        {themeMenuOpen && (
                          <div className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-popover shadow-lg z-[60]">
                            <div className="p-1">
                              {[
                                { value: "light", label: t('light'), icon: Sun },
                                { value: "dark", label: t('dark'), icon: Moon },
                                { value: "system", label: t('system'), icon: Monitor },
                              ].map((themeOption) => (
                                <button
                                  key={themeOption.value}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setTheme(themeOption.value)
                                    setThemeMenuOpen(false)
                                  }}
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center gap-2 ${
                                    theme === themeOption.value ? "text-primary font-medium bg-accent" : ""
                                  }`}
                                >
                                  <themeOption.icon className="h-3 w-3" />
                                  {themeOption.label}
                                  {theme === themeOption.value && <Check className="h-3 w-3 ml-auto" />}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="my-2" />

                      {/* Logout */}
                      <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground rounded">
                        <LogOut className="h-4 w-4" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
