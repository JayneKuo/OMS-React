"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search, Building2, Store, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

// 模拟数据
const workspaces = [
  {
    id: "ws-1",
    tenant: { id: "t1", name: "Acme Corporation" },
    merchant: { id: "m1", name: "Acme Store US" },
    role: "Admin",
    lastAccessed: new Date("2024-12-08"),
  },
  {
    id: "ws-2",
    tenant: { id: "t1", name: "Acme Corporation" },
    merchant: { id: "m2", name: "Acme Store EU" },
    role: "Manager",
    lastAccessed: new Date("2024-12-07"),
  },
  {
    id: "ws-3",
    tenant: { id: "t2", name: "Global Retail Inc" },
    merchant: { id: "m3", name: "Global Shop North" },
    role: "Admin",
    lastAccessed: new Date("2024-12-06"),
  },
  {
    id: "ws-4",
    tenant: { id: "t2", name: "Global Retail Inc" },
    merchant: { id: "m4", name: "Global Shop South" },
    role: "Viewer",
    lastAccessed: new Date("2024-12-05"),
  },
  {
    id: "ws-5",
    tenant: { id: "t3", name: "TechMart Solutions" },
    merchant: { id: "m5", name: "TechMart Online" },
    role: "Admin",
    lastAccessed: new Date("2024-12-04"),
  },
]

export function WorkspaceSwitcher() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState(workspaces[0])

  // 过滤和排序
  const filteredWorkspaces = React.useMemo(() => {
    const query = search.toLowerCase()
    const filtered = workspaces.filter(
      (ws) =>
        ws.tenant.name.toLowerCase().includes(query) ||
        ws.merchant.name.toLowerCase().includes(query)
    )
    
    // 按最近访问排序
    return filtered.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
  }, [search])

  // 按租户分组
  const groupedWorkspaces = React.useMemo(() => {
    const groups: Record<string, typeof workspaces> = {}
    filteredWorkspaces.forEach((ws) => {
      if (!groups[ws.tenant.id]) {
        groups[ws.tenant.id] = []
      }
      groups[ws.tenant.id].push(ws)
    })
    return groups
  }, [filteredWorkspaces])

  const handleSelect = (workspace: typeof workspaces[0]) => {
    setSelected(workspace)
    setOpen(false)
    setSearch("")
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="h-auto flex-col items-start px-3 py-2 hover:bg-accent"
      >
        <div className="flex items-center gap-2 w-full">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              {selected.tenant.name.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <div className="flex items-center gap-1 w-full">
              <span className="text-sm font-semibold truncate">
                {selected.tenant.name}
              </span>
              <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
            </div>
            <span className="text-xs text-muted-foreground truncate w-full">
              {selected.merchant.name}
            </span>
          </div>
        </div>
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-50 w-96 rounded-lg border bg-popover p-0 shadow-lg">
            {/* Search */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Workspaces List */}
            <ScrollArea className="h-[400px]">
              <div className="p-2">
                {Object.keys(groupedWorkspaces).length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No workspaces found
                  </div>
                ) : (
                  Object.entries(groupedWorkspaces).map(([tenantId, workspaces]) => (
                    <div key={tenantId} className="mb-4 last:mb-0">
                      {/* Tenant Header */}
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5" />
                        {workspaces[0].tenant.name}
                      </div>

                      {/* Merchants */}
                      <div className="space-y-0.5">
                        {workspaces.map((ws) => {
                          const isSelected = selected.id === ws.id
                          return (
                            <button
                              key={ws.id}
                              onClick={() => handleSelect(ws)}
                              className={`w-full flex items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent ${
                                isSelected ? "bg-accent" : ""
                              }`}
                            >
                              <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {ws.merchant.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {ws.role}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-2">
              <button className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent">
                <Plus className="h-4 w-4" />
                Add Workspace
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
