"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Search, Bell, Settings, User, Check, Building2, Store, ChevronDown, Globe, Clock, Sun, Moon, Monitor, LogOut, Menu, X } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const tenants = [
  {
    id: "tenant-1",
    name: "Acme Corporation",
    merchants: [
      { id: "merchant-1", name: "Acme Store US", customerCode: "ACM-US-001" },
      { id: "merchant-2", name: "Acme Store EU", customerCode: "ACM-EU-002" },
      { id: "merchant-3", name: "Acme Store Asia", customerCode: "ACM-AS-003" },
      { id: "merchant-4", name: "Acme Store Canada", customerCode: "ACM-CA-004" },
      { id: "merchant-5", name: "Acme Store Mexico", customerCode: "ACM-MX-005" },
      { id: "merchant-6", name: "Acme Store Brazil", customerCode: "ACM-BR-006" },
      { id: "merchant-7", name: "Acme Store UK", customerCode: "ACM-UK-007" },
      { id: "merchant-8", name: "Acme Store France", customerCode: "ACM-FR-008" },
      { id: "merchant-9", name: "Acme Store Germany", customerCode: "ACM-DE-009" },
      { id: "merchant-10", name: "Acme Store Spain", customerCode: "ACM-ES-010" },
      { id: "merchant-11", name: "Acme Store Italy", customerCode: "ACM-IT-011" },
      { id: "merchant-12", name: "Acme Store Japan", customerCode: "ACM-JP-012" },
      { id: "merchant-13", name: "Acme Store Korea", customerCode: "ACM-KR-013" },
      { id: "merchant-14", name: "Acme Store Singapore", customerCode: "ACM-SG-014" },
      { id: "merchant-15", name: "Acme Store Australia", customerCode: "ACM-AU-015" },
    ],
  },
  {
    id: "tenant-2",
    name: "Global Retail Inc",
    merchants: [
      { id: "merchant-16", name: "Global Shop North", customerCode: "GLB-NO-016" },
      { id: "merchant-17", name: "Global Shop South", customerCode: "GLB-SO-017" },
      { id: "merchant-18", name: "Global Shop East", customerCode: "GLB-EA-018" },
      { id: "merchant-19", name: "Global Shop West", customerCode: "GLB-WE-019" },
      { id: "merchant-20", name: "Global Shop Central", customerCode: "GLB-CE-020" },
      { id: "merchant-21", name: "Global Shop Pacific", customerCode: "GLB-PA-021" },
      { id: "merchant-22", name: "Global Shop Atlantic", customerCode: "GLB-AT-022" },
      { id: "merchant-23", name: "Global Shop Nordic", customerCode: "GLB-NO-023" },
      { id: "merchant-24", name: "Global Shop Baltic", customerCode: "GLB-BA-024" },
      { id: "merchant-25", name: "Global Shop Mediterranean", customerCode: "GLB-ME-025" },
    ],
  },
  {
    id: "tenant-3",
    name: "TechMart Solutions",
    merchants: [
      { id: "merchant-26", name: "TechMart Online", customerCode: "TCH-ON-026" },
      { id: "merchant-27", name: "TechMart Wholesale", customerCode: "TCH-WH-027" },
      { id: "merchant-28", name: "TechMart Retail", customerCode: "TCH-RT-028" },
      { id: "merchant-29", name: "TechMart Enterprise", customerCode: "TCH-EN-029" },
      { id: "merchant-30", name: "TechMart SMB", customerCode: "TCH-SM-030" },
      { id: "merchant-31", name: "TechMart Education", customerCode: "TCH-ED-031" },
      { id: "merchant-32", name: "TechMart Government", customerCode: "TCH-GO-032" },
      { id: "merchant-33", name: "TechMart Healthcare", customerCode: "TCH-HC-033" },
      { id: "merchant-34", name: "TechMart Finance", customerCode: "TCH-FI-034" },
      { id: "merchant-35", name: "TechMart Manufacturing", customerCode: "TCH-MF-035" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = React.useState(false)
  const [timezoneMenuOpen, setTimezoneMenuOpen] = React.useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = React.useState(false)
  const [tenantSearch, setTenantSearch] = React.useState("")
  const [merchantSearch, setMerchantSearch] = React.useState("")
  const [merchantSearchField, setMerchantSearchField] = React.useState<'name' | 'code'>('name')
  const [merchantPage, setMerchantPage] = React.useState(1)
  const [timezone, setTimezone] = React.useState("UTC")
  const [useSecondaryNav, setUseSecondaryNav] = React.useState(false)
  
  // Refs for submenu close delays
  const languageCloseTimer = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const timezoneCloseTimer = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const themeCloseTimer = React.useRef<NodeJS.Timeout | undefined>(undefined)
  const navContainerRef = React.useRef<HTMLDivElement>(null)
  const searchBoxRef = React.useRef<HTMLDivElement>(null)
  const tenantScrollRef = React.useRef<HTMLDivElement>(null)
  const merchantScrollRef = React.useRef<HTMLDivElement>(null)

  // Convert i18n language to display format
  const displayLanguage = i18nLanguage === 'zh' ? '中文简体' : 'English'

  // Load timezone preference from localStorage on mount
  React.useEffect(() => {
    const savedTimezone = localStorage.getItem("oms-timezone")
    if (savedTimezone) setTimezone(savedTimezone)
  }, [])
  
  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      if (languageCloseTimer.current) clearTimeout(languageCloseTimer.current)
      if (timezoneCloseTimer.current) clearTimeout(timezoneCloseTimer.current)
      if (themeCloseTimer.current) clearTimeout(themeCloseTimer.current)
    }
  }, [])

  // 检测导航是否需要换到第二行
  React.useEffect(() => {
    let resizeTimer: NodeJS.Timeout | undefined

    const checkOverlap = () => {
      // 小屏幕直接使用汉堡菜单
      if (window.innerWidth < 1024) {
        setUseSecondaryNav(false)
        return
      }

      if (!navContainerRef.current || !searchBoxRef.current) {
        setUseSecondaryNav(false)
        return
      }

      const nav = navContainerRef.current
      const searchBox = searchBoxRef.current
      
      // 获取header的总宽度和padding
      const header = nav.closest('header')
      if (!header) {
        setUseSecondaryNav(false)
        return
      }

      const headerRect = header.getBoundingClientRect()
      const headerPadding = 48 // px-6 = 24px * 2
      
      // 临时显示导航以测量（无论当前是否隐藏）
      const wasHidden = nav.classList.contains('hidden')
      if (wasHidden) {
        nav.style.visibility = 'hidden'
        nav.style.position = 'absolute'
        nav.classList.remove('hidden')
        nav.classList.add('flex')
      }

      // 强制重排
      void nav.offsetHeight

      // 获取所有导航项并计算总宽度
      const navItems = nav.querySelectorAll('a')
      let totalNavWidth = 0
      navItems.forEach(item => {
        totalNavWidth += item.getBoundingClientRect().width
      })
      
      // 加上导航项之间的间距 (space-x-1 = 4px * (items - 1))
      totalNavWidth += (navItems.length - 1) * 4

      // 恢复原始状态
      if (wasHidden) {
        nav.style.visibility = ''
        nav.style.position = ''
        nav.classList.remove('flex')
        nav.classList.add('hidden')
      }

      // 获取左侧区域（Logo + Tenant）和右侧区域（搜索 + 按钮）的宽度
      const leftSection = header.querySelector('.flex.items-center.space-x-4.flex-shrink-0')
      const rightSection = searchBox // searchBoxRef 本身就是右侧区域
      
      if (!leftSection || !rightSection) {
        setUseSecondaryNav(false)
        return
      }

      const leftWidth = leftSection.getBoundingClientRect().width
      const rightWidth = rightSection.getBoundingClientRect().width
      
      // 计算导航可用空间 = header总宽度 - 左侧 - 右侧 - padding - 安全边距
      const safeMargin = 100 // 安全边距
      const availableSpace = headerRect.width - leftWidth - rightWidth - headerPadding - safeMargin
      
      const needSecondaryNav = totalNavWidth > availableSpace

      console.log('📏 Navigation Space Check:', {
        headerWidth: headerRect.width,
        leftWidth: leftWidth,
        rightWidth: rightWidth,
        totalNavWidth: totalNavWidth,
        availableSpace: availableSpace,
        safeMargin: safeMargin,
        needSecondaryNav: needSecondaryNav,
        currentState: useSecondaryNav
      })

      setUseSecondaryNav(needSecondaryNav)
    }

    // 防抖的resize处理
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(checkOverlap, 150)
    }

    // 初始检测
    const initTimer = setTimeout(checkOverlap, 100)
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      clearTimeout(initTimer)
      if (resizeTimer) clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
    }
  }, [mainNavItems, useSecondaryNav])

  const filteredTenants = React.useMemo(() => {
    if (!tenantSearch) return tenants
    return tenants.filter((t) =>
      t.name.toLowerCase().includes(tenantSearch.toLowerCase())
    )
  }, [tenantSearch])

  const filteredMerchants = React.useMemo(() => {
    if (!merchantSearch) return selectedTenant.merchants
    const searchLower = merchantSearch.toLowerCase()
    return selectedTenant.merchants.filter((m) => {
      if (merchantSearchField === 'name') {
        return m.name.toLowerCase().includes(searchLower)
      } else {
        // code
        return m.customerCode.toLowerCase().includes(searchLower)
      }
    })
  }, [merchantSearch, selectedTenant, merchantSearchField])

  // 分页逻辑
  const merchantsPerPage = 10
  const totalMerchantPages = Math.ceil(filteredMerchants.length / merchantsPerPage)
  const paginatedMerchants = React.useMemo(() => {
    const startIndex = (merchantPage - 1) * merchantsPerPage
    return filteredMerchants.slice(startIndex, startIndex + merchantsPerPage)
  }, [filteredMerchants, merchantPage])

  // 当搜索或切换租户时重置页码
  React.useEffect(() => {
    setMerchantPage(1)
  }, [merchantSearch, selectedTenant])

  // 当切换器打开时，滚动到选中的租户和商户
  React.useEffect(() => {
    if (switcherOpen) {
      // 延迟执行以确保DOM已渲染
      setTimeout(() => {
        // 滚动到选中的租户
        const selectedTenantButton = document.querySelector(`button[data-tenant-id="${selectedTenant.id}"]`)
        if (selectedTenantButton && tenantScrollRef.current) {
          selectedTenantButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        // 滚动到选中的商户
        const selectedMerchantButton = document.querySelector(`button[data-merchant-id="${selectedMerchant.id}"]`)
        if (selectedMerchantButton && merchantScrollRef.current) {
          selectedMerchantButton.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    }
  }, [switcherOpen, selectedTenant.id, selectedMerchant.id])

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
              className="flex items-center gap-2 hover:bg-primary/10 rounded-md px-2 py-1 transition-colors group"
            >
              <div className="flex flex-col -space-y-0.5">
                <span className="text-xs text-muted-foreground group-hover:text-primary text-left whitespace-nowrap transition-colors">
                  {selectedTenant.name}
                </span>
                <span className="text-xs text-muted-foreground group-hover:text-primary text-left whitespace-nowrap transition-colors">
                  {selectedMerchant.name}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
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
                      <ScrollArea className="h-[calc(400px-120px)]" ref={tenantScrollRef}>
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
                                  data-tenant-id={tenant.id}
                                  onClick={() => handleTenantSelect(tenant)}
                                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-primary-hover/10 hover:text-primary ${
                                    isSelected ? "bg-primary-hover/10 text-primary" : ""
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
                        <div className="flex gap-2">
                          <Select value={merchantSearchField} onValueChange={(v: 'name' | 'code') => setMerchantSearchField(v)}>
                            <SelectTrigger className="w-20 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name</SelectItem>
                              <SelectItem value="code">No.</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                            <Input
                              placeholder={t('searchMerchants')}
                              value={merchantSearch}
                              onChange={(e) => setMerchantSearch(e.target.value)}
                              className="pl-9 h-9"
                            />
                          </div>
                        </div>
                      </div>
                      <ScrollArea className="h-[calc(400px-120px)]" ref={merchantScrollRef}>
                        <div className="p-2">
                          {filteredMerchants.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              {t('noMerchantsFound')}
                            </div>
                          ) : (
                            paginatedMerchants.map((merchant) => {
                              const isSelected = selectedMerchant.id === merchant.id
                              return (
                                <button
                                  key={merchant.id}
                                  data-merchant-id={merchant.id}
                                  onClick={() => handleMerchantSelect(merchant)}
                                  className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-primary-hover/10 hover:text-primary ${
                                    isSelected ? "bg-primary-hover/10 text-primary" : ""
                                  }`}
                                >
                                  <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {merchant.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {merchant.customerCode}
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
                      {/* 分页控件 - 底部 */}
                      {totalMerchantPages > 1 && (
                        <div className="p-2 flex items-center justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setMerchantPage(p => Math.max(1, p - 1))}
                            disabled={merchantPage === 1}
                          >
                            ‹
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {merchantPage} / {totalMerchantPages}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setMerchantPage(p => Math.min(totalMerchantPages, p + 1))}
                            disabled={merchantPage === totalMerchantPages}
                          >
                            ›
                          </Button>
                        </div>
                      )}
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
        <nav ref={navContainerRef} className={cn("items-center space-x-1 flex-1 min-w-0", useSecondaryNav ? "hidden" : "hidden lg:flex")}>
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
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>
        
        {/* Right: Search + Actions */}
        <div ref={searchBoxRef} className="flex items-center space-x-4 flex-shrink-0 px-6">
          <div className="relative w-64 hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('search')}
              className="h-9 pl-9"
            />
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
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
                    className="absolute right-6 top-14 w-64 rounded-lg border bg-popover shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      zIndex: 9999,
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
                        onMouseEnter={() => {
                          if (languageCloseTimer.current) clearTimeout(languageCloseTimer.current)
                          setLanguageMenuOpen(true)
                        }}
                        onMouseLeave={() => {
                          languageCloseTimer.current = setTimeout(() => setLanguageMenuOpen(false), 200)
                        }}
                      >
                        <button className="w-full flex items-center justify-between px-2 py-2 text-sm text-muted-foreground hover:bg-primary-hover/10 hover:text-primary rounded transition-colors">
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
                          <div 
                            className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-popover shadow-lg z-[60]"
                            onMouseEnter={() => {
                              if (languageCloseTimer.current) clearTimeout(languageCloseTimer.current)
                            }}
                            onMouseLeave={() => {
                              languageCloseTimer.current = setTimeout(() => setLanguageMenuOpen(false), 200)
                            }}
                          >
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
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-primary-hover/10 hover:text-primary flex items-center justify-between transition-colors ${
                                    i18nLanguage === lang.code ? "text-primary font-medium bg-primary-hover/10" : "text-muted-foreground"
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
                        onMouseEnter={() => {
                          if (timezoneCloseTimer.current) clearTimeout(timezoneCloseTimer.current)
                          setTimezoneMenuOpen(true)
                        }}
                        onMouseLeave={() => {
                          timezoneCloseTimer.current = setTimeout(() => setTimezoneMenuOpen(false), 200)
                        }}
                      >
                        <button className="w-full flex items-center justify-between px-2 py-2 text-sm text-muted-foreground hover:bg-primary-hover/10 hover:text-primary rounded transition-colors">
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
                          <div 
                            className="absolute right-full top-0 mr-1 w-48 rounded-lg border bg-popover shadow-lg z-[60]"
                            onMouseEnter={() => {
                              if (timezoneCloseTimer.current) clearTimeout(timezoneCloseTimer.current)
                            }}
                            onMouseLeave={() => {
                              timezoneCloseTimer.current = setTimeout(() => setTimezoneMenuOpen(false), 200)
                            }}
                          >
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
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-primary-hover/10 hover:text-primary flex items-center justify-between transition-colors ${
                                    timezone === tz ? "text-primary font-medium bg-primary-hover/10" : "text-muted-foreground"
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
                        onMouseEnter={() => {
                          if (themeCloseTimer.current) clearTimeout(themeCloseTimer.current)
                          setThemeMenuOpen(true)
                        }}
                        onMouseLeave={() => {
                          themeCloseTimer.current = setTimeout(() => setThemeMenuOpen(false), 200)
                        }}
                      >
                        <button className="w-full flex items-center justify-between px-2 py-2 text-sm text-muted-foreground hover:bg-primary-hover/10 hover:text-primary rounded transition-colors">
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
                          <div 
                            className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-popover shadow-lg z-[60]"
                            onMouseEnter={() => {
                              if (themeCloseTimer.current) clearTimeout(themeCloseTimer.current)
                            }}
                            onMouseLeave={() => {
                              themeCloseTimer.current = setTimeout(() => setThemeMenuOpen(false), 200)
                            }}
                          >
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
                                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-primary-hover/10 hover:text-primary flex items-center gap-2 transition-colors ${
                                    theme === themeOption.value ? "text-primary font-medium bg-primary-hover/10" : "text-muted-foreground"
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

                      {/* UI Guidelines */}
                      <button 
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:bg-primary-hover/10 hover:text-primary rounded transition-colors"
                        onClick={() => {
                          window.open('/ui-guidelines', '_blank')
                          setUserMenuOpen(false)
                        }}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        UI Design Guidelines
                      </button>

                      <Separator className="my-2" />

                      {/* Logout */}
                      <button className="w-full flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:bg-primary-hover/10 hover:text-primary rounded">
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

      {/* Secondary Navigation Row */}
      {useSecondaryNav && (
        <div className="border-t bg-background relative z-40">
          <nav className="flex items-center px-6 py-2 space-x-1">
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
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="p-4 space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
