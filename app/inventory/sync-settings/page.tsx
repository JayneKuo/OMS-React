"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Settings2,
  RefreshCw,
  Warehouse,
  Package,
  SlidersHorizontal,
} from "lucide-react"
import { mockSyncChannels, mockWarehouses } from "@/lib/inventory/mock-data"
import type { SyncChannel, SyncMode } from "@/lib/inventory/types"

const sidebarItems = [
  { title: "Overview & Analytics", href: "/inventory" },
  { title: "Warehouses", href: "/inventory/warehouses" },
  { title: "SKU Inventory", href: "/inventory/sku" },
  { title: "Ledger", href: "/inventory/ledger" },

  { title: "Safety Stock", href: "/inventory/safety-stock" },
  { title: "Sync Settings", href: "/inventory/sync-settings" },
]

const syncModeLabel: Record<SyncMode, string> = {
  realtime: "Real-time",
  "15min": "Every 15 min",
  hourly: "Every hour",
  manual: "Manual only",
}

const syncStatusConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Synced",
    color: "text-green-600",
  },
  partial: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Partial",
    color: "text-yellow-600",
  },
  failed: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Failed",
    color: "text-red-500",
  },
  pending: {
    icon: <Clock className="h-4 w-4" />,
    label: "Pending",
    color: "text-muted-foreground",
  },
}

const platformIcon: Record<string, string> = {
  Shopify: "🛍️",
  Amazon: "📦",
}

export default function SyncSettingsPage() {
  const [channels, setChannels] = useState<SyncChannel[]>(mockSyncChannels)
  const [editingChannel, setEditingChannel] = useState<SyncChannel | null>(null)
  const [editForm, setEditForm] = useState<Partial<SyncChannel>>({})

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    )
  }

  const openEdit = (channel: SyncChannel) => {
    setEditingChannel(channel)
    setEditForm({
      syncMode: channel.syncMode,
      bufferStock: channel.bufferStock,
      syncRatio: channel.syncRatio,
      warehouses: [...channel.warehouses],
      skuFilter: channel.skuFilter,
    })
  }

  const saveEdit = () => {
    if (!editingChannel) return
    setChannels((prev) =>
      prev.map((c) => (c.id === editingChannel.id ? { ...c, ...editForm } : c))
    )
    setEditingChannel(null)
  }

  const toggleWarehouseInEdit = (whId: string) => {
    setEditForm((prev) => {
      const whs = prev.warehouses ?? []
      return {
        ...prev,
        warehouses: whs.includes(whId) ? whs.filter((w) => w !== whId) : [...whs, whId],
      }
    })
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Inventory">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sync Settings</h1>
          <p className="text-muted-foreground">
            Configure how inventory is synced to each sales channel
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Channels", value: channels.length },
            { label: "Active Sync", value: channels.filter((c) => c.enabled).length, color: "text-green-600" },
            { label: "Pending Updates", value: channels.reduce((s, c) => s + c.pendingUpdates, 0), color: "text-yellow-600" },
            { label: "Sync Issues", value: channels.filter((c) => c.lastSyncStatus === "failed" || c.lastSyncStatus === "partial").length, color: "text-red-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color ?? ""}`}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Channel Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => {
            const syncStatus = syncStatusConfig[channel.lastSyncStatus]
            const whNames = channel.warehouses
              .map((id) => mockWarehouses.find((w) => w.id === id)?.code)
              .filter(Boolean)

            return (
              <Card key={channel.id} className={!channel.enabled ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platformIcon[channel.platform] ?? "🔗"}</span>
                      <div>
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">{channel.platform}</p>
                      </div>
                    </div>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Sync Status */}
                  <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <div className={`flex items-center gap-1.5 ${syncStatus.color}`}>
                      {syncStatus.icon}
                      <span className="text-sm font-medium">{syncStatus.label}</span>
                      {channel.pendingUpdates > 0 && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          {channel.pendingUpdates} pending
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(channel.lastSyncAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Config Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sync Mode</p>
                        <p className="font-medium">{syncModeLabel[channel.syncMode]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Sync Ratio</p>
                        <p className="font-medium">{channel.syncRatio}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Buffer Stock</p>
                        <p className="font-medium">{channel.bufferStock} units</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">SKU Filter</p>
                        <p className="font-medium capitalize">{channel.skuFilter}</p>
                      </div>
                    </div>
                  </div>

                  {/* Warehouses */}
                  <div>
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Warehouse className="h-3.5 w-3.5" />
                      Warehouses syncing from
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {whNames.length > 0 ? (
                        whNames.map((name) => (
                          <Badge key={name} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None configured</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t pt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(channel)}>
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" disabled={!channel.enabled}>
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Sync Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={!!editingChannel} onOpenChange={(open) => !open && setEditingChannel(null)}>
        <SheetContent className="w-[420px] overflow-y-auto sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>
              {platformIcon[editingChannel?.platform ?? ""] ?? "🔗"} {editingChannel?.name}
            </SheetTitle>
            <SheetDescription>Configure inventory sync settings for this channel</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Sync Mode */}
            <div className="space-y-1.5">
              <Label>Sync Mode</Label>
              <Select
                value={editForm.syncMode}
                onValueChange={(v) => setEditForm((f) => ({ ...f, syncMode: v as SyncMode }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="hourly">Every hour</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buffer Stock */}
            <div className="space-y-1.5">
              <Label>Buffer Stock (units)</Label>
              <p className="text-xs text-muted-foreground">
                Units withheld from sync to prevent overselling during latency windows
              </p>
              <Input
                type="number"
                min={0}
                value={editForm.bufferStock}
                onChange={(e) => setEditForm((f) => ({ ...f, bufferStock: Number(e.target.value) }))}
              />
            </div>

            {/* Sync Ratio */}
            <div className="space-y-1.5">
              <Label>Sync Ratio (%)</Label>
              <p className="text-xs text-muted-foreground">
                What percentage of available inventory to publish to this channel (e.g. 80% = keep 20% back)
              </p>
              <Input
                type="number"
                min={1}
                max={100}
                value={editForm.syncRatio}
                onChange={(e) => setEditForm((f) => ({ ...f, syncRatio: Number(e.target.value) }))}
              />
            </div>

            {/* Warehouses */}
            <div className="space-y-2">
              <Label>Source Warehouses</Label>
              <p className="text-xs text-muted-foreground">
                Select which warehouses contribute inventory to this channel
              </p>
              <div className="space-y-2">
                {mockWarehouses.map((wh) => {
                  const selected = (editForm.warehouses ?? []).includes(wh.id)
                  return (
                    <div
                      key={wh.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                        selected ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                      }`}
                      onClick={() => toggleWarehouseInEdit(wh.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{wh.name}</p>
                          <p className="text-xs text-muted-foreground">{wh.region}</p>
                        </div>
                      </div>
                      {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SKU Filter */}
            <div className="space-y-1.5">
              <Label>SKU Filter Strategy</Label>
              <Select
                value={editForm.skuFilter}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, skuFilter: v as "all" | "whitelist" | "blacklist" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SKUs</SelectItem>
                  <SelectItem value="whitelist">Whitelist (only selected)</SelectItem>
                  <SelectItem value="blacklist">Blacklist (exclude selected)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="mt-8">
            <Button variant="outline" onClick={() => setEditingChannel(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </MainLayout>
  )
}
