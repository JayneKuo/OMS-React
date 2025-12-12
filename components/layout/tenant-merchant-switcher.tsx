"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Building2, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface TenantMerchantSwitcherProps {
  onTenantChange?: (tenantName: string) => void
  onMerchantChange?: (merchantName: string) => void
}

export const TenantMerchantSwitcher = React.forwardRef<
  { openTenantSwitcher: () => void; openMerchantSwitcher: () => void },
  TenantMerchantSwitcherProps
>(({ onTenantChange, onMerchantChange }, ref) => {
  const [selectedTenant, setSelectedTenant] = React.useState(tenants[0])
  const [selectedMerchant, setSelectedMerchant] = React.useState(tenants[0].merchants[0])
  const [tenantOpen, setTenantOpen] = React.useState(false)
  const [merchantOpen, setMerchantOpen] = React.useState(false)
  const [tenantSearch, setTenantSearch] = React.useState("")
  const [merchantSearch, setMerchantSearch] = React.useState("")

  React.useImperativeHandle(ref, () => ({
    openTenantSwitcher: () => setTenantOpen(true),
    openMerchantSwitcher: () => setMerchantOpen(true),
  }))

  React.useEffect(() => {
    onTenantChange?.(selectedTenant.name)
  }, [selectedTenant, onTenantChange])

  React.useEffect(() => {
    onMerchantChange?.(selectedMerchant.name)
  }, [selectedMerchant, onMerchantChange])

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
    setTenantOpen(false)
    setTenantSearch("")
  }

  const handleMerchantSelect = (merchant: typeof tenants[0]["merchants"][0]) => {
    setSelectedMerchant(merchant)
    setMerchantOpen(false)
    setMerchantSearch("")
  }

  return (
    <div className="flex items-center gap-2">
      {/* Tenant Switcher */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setTenantOpen(!tenantOpen)}
          className="h-9 justify-between gap-2 min-w-[180px]"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{selectedTenant.name}</span>
          </div>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>

        {tenantOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setTenantOpen(false)}
            />
            <div className="absolute left-0 top-full mt-2 z-50 w-80 rounded-lg border bg-popover shadow-lg">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tenants..."
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="pl-9 h-9"
                    autoFocus
                  />
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {filteredTenants.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No tenants found
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
                              {tenant.merchants.length} merchants
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
          </>
        )}
      </div>

      <div className="text-muted-foreground">/</div>

      {/* Merchant Switcher */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setMerchantOpen(!merchantOpen)}
          className="h-9 justify-between gap-2 min-w-[180px]"
        >
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{selectedMerchant.name}</span>
          </div>
          <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
        </Button>

        {merchantOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMerchantOpen(false)}
            />
            <div className="absolute left-0 top-full mt-2 z-50 w-80 rounded-lg border bg-popover shadow-lg">
              <div className="p-3 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{selectedTenant.name}</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search merchants..."
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                    className="pl-9 h-9"
                    autoFocus
                  />
                </div>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {filteredMerchants.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No merchants found
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
          </>
        )}
      </div>
    </div>
  )
})

TenantMerchantSwitcher.displayName = "TenantMerchantSwitcher"
