"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Check, X, Store, Package } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface ChannelMapping {
  id?: string
  channel: string
  channelSku: string
  enabled: boolean
}

interface WarehouseMapping {
  id?: string
  warehouse: string
  warehouseSku: string
  enabled: boolean
}

interface SkuMappingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skuCode: string
  skuName: string
  channelMappings?: ChannelMapping[]
  warehouseMappings?: WarehouseMapping[]
  availableChannels?: string[]
  availableWarehouses?: string[]
  availableChannelSkus?: string[]
  availableWarehouseSkus?: string[]
  onSave?: (data: { channelMappings: ChannelMapping[]; warehouseMappings: WarehouseMapping[] }) => void
}

export function SkuMappingDialogV2({
  open,
  onOpenChange,
  skuCode,
  skuName,
  channelMappings: initialChannelMappings = [
    { channel: "Amazon US", channelSku: "AMZ-US-12345", enabled: true },
    { channel: "Shopify Store", channelSku: "SHOP-67890", enabled: true },
  ],
  warehouseMappings: initialWarehouseMappings = [
    { warehouse: "US West Warehouse", warehouseSku: "WH-US-W-001", enabled: true },
    { warehouse: "EU Central Warehouse", warehouseSku: "WH-EU-C-002", enabled: false },
  ],
  availableChannels = ["Amazon US", "Amazon UK", "Shopify Store", "eBay", "Walmart"],
  availableWarehouses = ["US West Warehouse", "US East Warehouse", "EU Central Warehouse", "Asia Pacific Warehouse"],
  availableChannelSkus = ["AMZ-US-12345", "AMZ-UK-67890", "SHOP-67890", "EBAY-11111"],
  availableWarehouseSkus = ["WH-US-W-001", "WH-US-E-002", "WH-EU-C-002", "WH-AP-003"],
  onSave,
}: SkuMappingDialogProps) {
  const [channelMappings, setChannelMappings] = React.useState<ChannelMapping[]>(initialChannelMappings)
  const [warehouseMappings, setWarehouseMappings] = React.useState<WarehouseMapping[]>(initialWarehouseMappings)
  const [editingChannel, setEditingChannel] = React.useState<number | null>(null)
  const [editingWarehouse, setEditingWarehouse] = React.useState<number | null>(null)
  const [isModified, setIsModified] = React.useState(false)

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setChannelMappings([...initialChannelMappings])
      setWarehouseMappings([...initialWarehouseMappings])
      setEditingChannel(null)
      setEditingWarehouse(null)
      setIsModified(false)
    }
  }, [open])

  const handleAddChannel = () => {
    setChannelMappings([...channelMappings, { channel: "", channelSku: "", enabled: true }])
    setEditingChannel(channelMappings.length)
    setIsModified(true)
  }

  const handleAddWarehouse = () => {
    setWarehouseMappings([...warehouseMappings, { warehouse: "", warehouseSku: "", enabled: true }])
    setEditingWarehouse(warehouseMappings.length)
    setIsModified(true)
  }

  const handleDeleteChannel = (index: number) => {
    setChannelMappings(channelMappings.filter((_, i) => i !== index))
    setEditingChannel(null)
    setIsModified(true)
  }

  const handleDeleteWarehouse = (index: number) => {
    setWarehouseMappings(warehouseMappings.filter((_, i) => i !== index))
    setEditingWarehouse(null)
    setIsModified(true)
  }

  const handleSave = () => {
    // Validate
    const hasEmptyChannel = channelMappings.some(m => !m.channel || !m.channelSku)
    const hasEmptyWarehouse = warehouseMappings.some(m => !m.warehouse || !m.warehouseSku)
    
    if (hasEmptyChannel || hasEmptyWarehouse) {
      toast.error("Please fill in all required fields")
      return
    }

    // Check for duplicate warehouse SKUs
    const warehouseSkuCounts = warehouseMappings.reduce((acc, m) => {
      acc[m.warehouseSku] = (acc[m.warehouseSku] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const duplicateWarehouseSku = Object.entries(warehouseSkuCounts).find(([_, count]) => count > 1)
    if (duplicateWarehouseSku) {
      toast.error(`Warehouse SKU "${duplicateWarehouseSku[0]}" can only be mapped once`)
      return
    }

    onSave?.({ channelMappings, warehouseMappings })
    toast.success("Mappings saved successfully")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">SKU Mapping Management</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            <span className="font-mono text-primary">{skuCode}</span> - {skuName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-2 space-y-6">
          {/* Channel Mappings Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Channel Mappings</h3>
                <Badge variant="secondary" className="text-xs">{channelMappings.length}</Badge>
              </div>
              <Button variant="outline" size="sm" className="h-8" onClick={handleAddChannel}>
                <Plus className="h-3 w-3 mr-1" />
                Add Channel
              </Button>
            </div>
            
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[60px] h-9 text-xs font-semibold text-center">#</TableHead>
                    <TableHead className="w-[200px] h-9 text-xs font-semibold">Channel</TableHead>
                    <TableHead className="h-9 text-xs font-semibold">Channel SKU</TableHead>
                    <TableHead className="w-[100px] h-9 text-xs font-semibold text-center">Enabled</TableHead>
                    <TableHead className="w-[80px] h-9 text-xs font-semibold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {channelMappings.length > 0 ? (
                    channelMappings.map((mapping, idx) => {
                      const isEditing = editingChannel === idx
                      return (
                        <TableRow key={idx} className="hover:bg-muted/30 group">
                          <TableCell className="py-2.5 text-center text-xs font-medium text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          {isEditing ? (
                            <>
                              <TableCell className="py-2.5">
                                <Select
                                  value={mapping.channel}
                                  onValueChange={(value) => {
                                    const newMappings = [...channelMappings]
                                    newMappings[idx].channel = value
                                    setChannelMappings(newMappings)
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select channel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableChannels.map((channel) => (
                                      <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="space-y-1">
                                  <Select
                                    value={mapping.channelSku}
                                    onValueChange={(value) => {
                                      const newMappings = [...channelMappings]
                                      newMappings[idx].channelSku = value
                                      setChannelMappings(newMappings)
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs font-mono">
                                      <SelectValue placeholder="Select SKU or type below" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableChannelSkus.map((sku) => (
                                        <SelectItem key={sku} value={sku} className="font-mono">{sku}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Or type custom SKU"
                                    value={mapping.channelSku}
                                    onChange={(e) => {
                                      const newMappings = [...channelMappings]
                                      newMappings[idx].channelSku = e.target.value
                                      setChannelMappings(newMappings)
                                    }}
                                    className="h-7 text-xs font-mono"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 text-center">
                                <Switch
                                  checked={mapping.enabled}
                                  onCheckedChange={(checked) => {
                                    const newMappings = [...channelMappings]
                                    newMappings[idx].enabled = checked
                                    setChannelMappings(newMappings)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      setEditingChannel(null)
                                      setIsModified(true)
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      if (!mapping.channel && !mapping.channelSku) {
                                        handleDeleteChannel(idx)
                                      } else {
                                        setEditingChannel(null)
                                      }
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="py-2.5 text-sm font-medium">{mapping.channel}</TableCell>
                              <TableCell className="py-2.5 text-xs font-mono text-muted-foreground">{mapping.channelSku}</TableCell>
                              <TableCell className="py-2.5 text-center">
                                <Switch
                                  checked={mapping.enabled}
                                  onCheckedChange={(checked) => {
                                    const newMappings = [...channelMappings]
                                    newMappings[idx].enabled = checked
                                    setChannelMappings(newMappings)
                                    setIsModified(true)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setEditingChannel(idx)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteChannel(idx)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Store className="h-8 w-8 opacity-20" />
                          <p className="text-sm">No channel mappings</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Warehouse Mappings Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Warehouse Mappings</h3>
                <Badge variant="secondary" className="text-xs">{warehouseMappings.length}</Badge>
              </div>
              <Button variant="outline" size="sm" className="h-8" onClick={handleAddWarehouse}>
                <Plus className="h-3 w-3 mr-1" />
                Add Warehouse
              </Button>
            </div>
            
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[60px] h-9 text-xs font-semibold text-center">#</TableHead>
                    <TableHead className="w-[220px] h-9 text-xs font-semibold">Warehouse</TableHead>
                    <TableHead className="h-9 text-xs font-semibold">Warehouse SKU</TableHead>
                    <TableHead className="w-[100px] h-9 text-xs font-semibold text-center">Enabled</TableHead>
                    <TableHead className="w-[80px] h-9 text-xs font-semibold"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseMappings.length > 0 ? (
                    warehouseMappings.map((mapping, idx) => {
                      const isEditing = editingWarehouse === idx
                      const isDuplicate = warehouseMappings.filter(m => m.warehouseSku === mapping.warehouseSku).length > 1
                      return (
                        <TableRow key={idx} className={cn("hover:bg-muted/30 group", isDuplicate && "bg-destructive/5")}>
                          <TableCell className="py-2.5 text-center text-xs font-medium text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          {isEditing ? (
                            <>
                              <TableCell className="py-2.5">
                                <Select
                                  value={mapping.warehouse}
                                  onValueChange={(value) => {
                                    const newMappings = [...warehouseMappings]
                                    newMappings[idx].warehouse = value
                                    setWarehouseMappings(newMappings)
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select warehouse" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableWarehouses.map((warehouse) => (
                                      <SelectItem key={warehouse} value={warehouse}>{warehouse}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="space-y-1">
                                  <Select
                                    value={mapping.warehouseSku}
                                    onValueChange={(value) => {
                                      const newMappings = [...warehouseMappings]
                                      newMappings[idx].warehouseSku = value
                                      setWarehouseMappings(newMappings)
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-xs font-mono">
                                      <SelectValue placeholder="Select SKU or type below" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableWarehouseSkus.map((sku) => (
                                        <SelectItem key={sku} value={sku} className="font-mono">{sku}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Or type custom SKU"
                                    value={mapping.warehouseSku}
                                    onChange={(e) => {
                                      const newMappings = [...warehouseMappings]
                                      newMappings[idx].warehouseSku = e.target.value
                                      setWarehouseMappings(newMappings)
                                    }}
                                    className="h-7 text-xs font-mono"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 text-center">
                                <Switch
                                  checked={mapping.enabled}
                                  onCheckedChange={(checked) => {
                                    const newMappings = [...warehouseMappings]
                                    newMappings[idx].enabled = checked
                                    setWarehouseMappings(newMappings)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      setEditingWarehouse(null)
                                      setIsModified(true)
                                    }}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => {
                                      if (!mapping.warehouse && !mapping.warehouseSku) {
                                        handleDeleteWarehouse(idx)
                                      } else {
                                        setEditingWarehouse(null)
                                      }
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="py-2.5 text-sm font-medium">{mapping.warehouse}</TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-muted-foreground">{mapping.warehouseSku}</span>
                                  {isDuplicate && (
                                    <Badge variant="destructive" className="text-[10px] h-4">Duplicate</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-2.5 text-center">
                                <Switch
                                  checked={mapping.enabled}
                                  onCheckedChange={(checked) => {
                                    const newMappings = [...warehouseMappings]
                                    newMappings[idx].enabled = checked
                                    setWarehouseMappings(newMappings)
                                    setIsModified(true)
                                  }}
                                />
                              </TableCell>
                              <TableCell className="py-2.5">
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() => setEditingWarehouse(idx)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteWarehouse(idx)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Package className="h-8 w-8 opacity-20" />
                          <p className="text-sm">No warehouse mappings</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row justify-between items-center">
          <div>
            {isModified && (
              <Badge variant="secondary" className="text-xs">
                Unsaved Changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isModified}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
