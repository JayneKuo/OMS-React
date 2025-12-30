"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Building2, Store, Search, X, ChevronRight, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// 模拟数据 - 实际使用时应该从API获取
const tenants = [
  {
    id: "tenant-1",
    name: "Acme Corporation",
    code: "ACME",
    description: "Global retail and e-commerce platform",
    merchants: [
      { id: "merchant-1", name: "Acme Store US", code: "US", region: "North America", status: "active" },
      { id: "merchant-2", name: "Acme Store EU", code: "EU", region: "Europe", status: "active" },
      { id: "merchant-3", name: "Acme Store Asia", code: "ASIA", region: "Asia Pacific", status: "active" },
    ],
  },
  {
    id: "tenant-2",
    name: "Global Retail Inc",
    code: "GRI",
    description: "International retail chain",
    merchants: [
      { id: "merchant-4", name: "Global Shop North", code: "NORTH", region: "North America", status: "active" },
      { id: "merchant-5", name: "Global Shop South", code: "SOUTH", region: "South America", status: "active" },
    ],
  },
  {
    id: "tenant-3",
    name: "TechMart Solutions",
    code: "TMS",
    description: "Technology and electronics retailer",
    merchants: [
      { id: "merchant-6", name: "TechMart Online", code: "ONLINE", region: "Global", status: "active" },
      { id: "merchant-7", name: "TechMart Wholesale", code: "WHOLESALE", region: "North America", status: "active" },
      { id: "merchant-8", name: "TechMart Retail", code: "RETAIL", region: "Europe", status: "active" },
    ],
  },
]

type ViewMode = "tenant" | "merchant"

export function TenantSwitcherOptimized() {
  const [selectedTenant, setSelectedTenant] = React.useState(tenants[0])
  const [selectedMerchant, setSelectedMerchant] = React.useState(tenants[0].merchants[0])
  const [viewMode, setViewMode] = React.useState<ViewMode>("tenant")
  const [tempTenant, setTempTenant] = React.useState(tenants[0])
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleTenantSelect = (tenant: typeof tenants[0]) => {
    setTempTenant(tenant)
    setViewMode("merchant")
    setSearchQuery("")
  }

  const handleMerchantSelect = (merchant: typeof tenants[0]["merchants"][0]) => {
    setSelectedTenant(tempTenant)
    setSelectedMerchant(merchant)
    setIsOpen(false)
    setViewMode("tenant")
    setSearchQuery("")
  }

  const handleBack = () => {
    setViewMode("tenant")
    setSearchQuery("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setViewMode("tenant")
      setTempTenant(selectedTenant)
      setSearchQuery("")
    }
  }

  // 过滤租户
  const filteredTenants = React.useMemo(() => {
    if (!searchQuery) return tenants
    return tenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // 过滤商户
  const filteredMerchants = React.useMemo(() => {
    if (!searchQuery) return tempTenant.merchants
    return tempTenant.merchants.filter(merchant =>
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.region.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, tempTenant.merchants])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto flex-col items-start px-3 py-2 hover:bg-primary-hover/20 transition-colors"
        >
          <div className="flex items-center gap-2 w-full">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                {selectedTenant.name.charAt(0)}
              </span>
            </div>
            <div className="flex flex-col items-start flex-1 min-w-0">
              <div className="flex items-center gap-1 w-full">
                <span className="text-sm font-semibold truncate">
                  {selectedTenant.name}
                </span>
                <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
              </div>
              <span className="text-xs text-muted-foreground truncate w-full">
                {selectedMerchant.name}
              </span>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            {viewMode === "tenant" ? (
              <>
                <Building2 className="h-5 w-5 text-primary" />
                Select Tenant
              </>
            ) : (
              <>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span className="text-sm">Back</span>
                </button>
                <Separator orientation="vertical" className="h-4" />
                <Store className="h-5 w-5 text-primary" />
                Select Merchant
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                viewMode === "tenant"
                  ? "Search tenants..."
                  : "Search merchants..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-80">
          <div className="px-2 pb-6">
            {viewMode === "tenant" ? (
              <>
                {filteredTenants.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No tenants found
                  </div>
                ) : (
                  filteredTenants.map((tenant) => {
                    const isSelected = selectedTenant.id === tenant.id
                    return (
                      <button
                        key={tenant.id}
                        onClick={() => handleTenantSelect(tenant)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 mx-2 rounded-lg transition-colors",
                          "hover:bg-primary-hover/20",
                          isSelected && "bg-primary/10 border border-primary/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <span className="text-sm font-semibold">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{tenant.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {tenant.code}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {tenant.merchants.length} merchants
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    )
                  })
                )}
              </>
            ) : (
              <>
                <div className="px-4 py-2 mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
                      <span className="text-xs font-semibold text-primary">
                        {tempTenant.name.charAt(0)}
                      </span>
                    </div>
                    <span>{tempTenant.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {tempTenant.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tempTenant.description}
                  </p>
                </div>
                
                <Separator className="mb-4" />
                
                {filteredMerchants.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No merchants found
                  </div>
                ) : (
                  filteredMerchants.map((merchant) => {
                    const isSelected =
                      selectedTenant.id === tempTenant.id &&
                      selectedMerchant.id === merchant.id

                    return (
                      <button
                        key={merchant.id}
                        onClick={() => handleMerchantSelect(merchant)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 mx-2 rounded-lg transition-colors",
                          "hover:bg-primary-hover/20",
                          isSelected && "bg-primary/10 border border-primary/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                          )}>
                            <Store className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{merchant.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {merchant.code}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {merchant.region}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    )
                  })
                )}
              </>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Users className="h-4 w-4" />
                Manage Tenants
              </button>
              <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}