"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

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
]

export function TenantSwitcherSimple() {
  const [selectedTenant] = React.useState(tenants[0])
  const [selectedMerchant] = React.useState(tenants[0].merchants[0])

  return (
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
  )
}
