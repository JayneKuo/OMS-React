"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  XCircle, 
  Plus, 
  X, 
  Warehouse, 
  Package, 
  Route,
  AlertCircle,
  Settings,
  Filter,
  Zap,
  ChevronRight,
  Info
} from "lucide-react"
import { toast } from "sonner"

interface RoutingRule {
  id: string
  name: string
  description: string
  enabled: boolean
  priority: number
  conditions: {
    suppliers?: string[]
    warehouses?: string[]
    productCategories?: string[]
    skus?: string[]
  }
  actions: {
    autoCreateReceipt: boolean
    autoReceiveVirtualWarehouse: boolean
    pushToWMS: boolean
    wmsEndpoint?: string
    warehouseRouting?: {
      type: "SINGLE" | "SPLIT_BY_SKU" | "SPLIT_BY_QUANTITY"
      warehouses: string[]
    }
  }
  createdAt: string
  updatedAt: string
}

interface PORoutingRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: RoutingRule | null
  onSave: (rule: RoutingRule) => void
}

export function PORoutingRuleDialog({ open, onOpenChange, rule, onSave }: PORoutingRuleDialogProps) {
  const [formData, setFormData] = React.useState<Partial<RoutingRule>>({
    name: "",
    description: "",
    enabled: true,
    priority: 1,
    conditions: {},
    actions: {
      autoCreateReceipt: false,
      autoReceiveVirtualWarehouse: false,
      pushToWMS: false
    }
  })

  const [newSupplier, setNewSupplier] = React.useState("")
  const [newWarehouse, setNewWarehouse] = React.useState("")
  const [newCategory, setNewCategory] = React.useState("")
  const [newSku, setNewSku] = React.useState("")
  const [newRoutingWarehouse, setNewRoutingWarehouse] = React.useState("")

  // Initialize form when dialog opens or rule changes
  React.useEffect(() => {
    if (open) {
      if (rule) {
        setFormData(rule)
      } else {
        setFormData({
          name: "",
          description: "",
          enabled: true,
          priority: 1,
          conditions: {},
          actions: {
            autoCreateReceipt: false,
            autoReceiveVirtualWarehouse: false,
            pushToWMS: false
          }
        })
      }
    }
  }, [open, rule])

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error("Please enter a rule name")
      return
    }

    const savedRule: RoutingRule = {
      id: rule?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description || "",
      enabled: formData.enabled ?? true,
      priority: formData.priority || 1,
      conditions: formData.conditions || {},
      actions: formData.actions || {
        autoCreateReceipt: false,
        autoReceiveVirtualWarehouse: false,
        pushToWMS: false
      },
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(savedRule)
    toast.success(rule ? "Rule updated successfully" : "Rule created successfully")
  }

  // Condition handlers
  const addSupplier = () => {
    if (newSupplier.trim()) {
      setFormData({
        ...formData,
        conditions: {
          ...formData.conditions,
          suppliers: [...(formData.conditions?.suppliers || []), newSupplier.trim()]
        }
      })
      setNewSupplier("")
    }
  }

  const removeSupplier = (supplier: string) => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        suppliers: formData.conditions?.suppliers?.filter(s => s !== supplier)
      }
    })
  }

  const addWarehouse = () => {
    if (newWarehouse.trim()) {
      setFormData({
        ...formData,
        conditions: {
          ...formData.conditions,
          warehouses: [...(formData.conditions?.warehouses || []), newWarehouse.trim()]
        }
      })
      setNewWarehouse("")
    }
  }

  const removeWarehouse = (warehouse: string) => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        warehouses: formData.conditions?.warehouses?.filter(w => w !== warehouse)
      }
    })
  }

  const addCategory = () => {
    if (newCategory.trim()) {
      setFormData({
        ...formData,
        conditions: {
          ...formData.conditions,
          productCategories: [...(formData.conditions?.productCategories || []), newCategory.trim()]
        }
      })
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        productCategories: formData.conditions?.productCategories?.filter(c => c !== category)
      }
    })
  }

  const addRoutingWarehouse = () => {
    if (newRoutingWarehouse.trim()) {
      setFormData({
        ...formData,
        actions: {
          ...formData.actions!,
          warehouseRouting: {
            type: formData.actions?.warehouseRouting?.type || "SINGLE",
            warehouses: [...(formData.actions?.warehouseRouting?.warehouses || []), newRoutingWarehouse.trim()]
          }
        }
      })
      setNewRoutingWarehouse("")
    }
  }

  const removeRoutingWarehouse = (warehouse: string) => {
    setFormData({
      ...formData,
      actions: {
        ...formData.actions!,
        warehouseRouting: {
          ...formData.actions?.warehouseRouting!,
          warehouses: formData.actions?.warehouseRouting?.warehouses?.filter(w => w !== warehouse) || []
        }
      }
    })
  }

  // Check if rule has any conditions
  const hasConditions = () => {
    const conditions = formData.conditions || {}
    return (
      (conditions.suppliers && conditions.suppliers.length > 0) ||
      (conditions.warehouses && conditions.warehouses.length > 0) ||
      (conditions.productCategories && conditions.productCategories.length > 0) ||
      (conditions.skus && conditions.skus.length > 0)
    )
  }

  // Check if rule has any actions
  const hasActions = () => {
    const actions = formData.actions
    if (!actions) return false
    return (
      actions.autoCreateReceipt ||
      actions.autoReceiveVirtualWarehouse ||
      actions.pushToWMS ||
      (actions.warehouseRouting && actions.warehouseRouting.warehouses.length > 0)
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>{rule ? "Edit Routing Rule" : "Create Routing Rule"}</DialogTitle>
          <DialogDescription>
            Configure automated routing behavior for purchase orders
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Left Side - Input Forms */}
          <div className="flex-1 border-r overflow-y-auto p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
                <p className="text-sm text-muted-foreground">
                  Configure the rule name, priority, and status
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Virtual Warehouse Auto-Receive"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
                  />
                  <p className="text-xs text-muted-foreground">Lower number = higher priority</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this rule does..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Rule</Label>
                    <p className="text-xs text-muted-foreground">
                      Activate this rule immediately
                    </p>
                  </div>
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Conditions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Conditions</h3>
                <p className="text-sm text-muted-foreground">
                  Define when this rule should apply (leave empty to match all POs)
                </p>
              </div>

              {/* Suppliers */}
              <div className="space-y-2">
                <Label>Suppliers</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="Enter supplier name"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSupplier())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addSupplier}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Warehouses */}
              <div className="space-y-2">
                <Label>Warehouses</Label>
                <div className="flex gap-2">
                  <Input
                    value={newWarehouse}
                    onChange={(e) => setNewWarehouse(e.target.value)}
                    placeholder="Enter warehouse name"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addWarehouse())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addWarehouse}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product Categories */}
              <div className="space-y-2">
                <Label>Product Categories</Label>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Define what happens when this rule matches a PO
                </p>
              </div>

              {/* Auto Create Receipt */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <Label className="text-sm font-medium">Auto Create Receipt</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically create receipt when PO arrives
                  </p>
                </div>
                <Switch
                  checked={formData.actions?.autoCreateReceipt}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    actions: { ...formData.actions!, autoCreateReceipt: checked }
                  })}
                />
              </div>

              {/* Auto Receive Virtual Warehouse */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-green-600" />
                    <Label className="text-sm font-medium">Auto Receive for Virtual Warehouse</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically mark as received for virtual warehouses
                  </p>
                </div>
                <Switch
                  checked={formData.actions?.autoReceiveVirtualWarehouse}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    actions: { ...formData.actions!, autoReceiveVirtualWarehouse: checked }
                  })}
                />
              </div>

              {/* Push to WMS */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-medium">Push to Downstream WMS</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Send PO data to external WMS system
                    </p>
                  </div>
                  <Switch
                    checked={formData.actions?.pushToWMS}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: { ...formData.actions!, pushToWMS: checked }
                    })}
                  />
                </div>

                {formData.actions?.pushToWMS && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="wmsEndpoint" className="text-sm">WMS API Endpoint</Label>
                      <Input
                        id="wmsEndpoint"
                        value={formData.actions?.wmsEndpoint || ""}
                        onChange={(e) => setFormData({
                          ...formData,
                          actions: { ...formData.actions!, wmsEndpoint: e.target.value }
                        })}
                        placeholder="https://wms.example.com/api/po"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Warehouse Routing */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-orange-600" />
                  <Label className="text-sm font-medium">Warehouse Routing</Label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">Routing Type</Label>
                    <Select
                      value={formData.actions?.warehouseRouting?.type || "SINGLE"}
                      onValueChange={(value: "SINGLE" | "SPLIT_BY_SKU" | "SPLIT_BY_QUANTITY") => setFormData({
                        ...formData,
                        actions: {
                          ...formData.actions!,
                          warehouseRouting: {
                            type: value,
                            warehouses: formData.actions?.warehouseRouting?.warehouses || []
                          }
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single Warehouse</SelectItem>
                        <SelectItem value="SPLIT_BY_SKU">Split by SKU</SelectItem>
                        <SelectItem value="SPLIT_BY_QUANTITY">Split by Quantity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Target Warehouses</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newRoutingWarehouse}
                        onChange={(e) => setNewRoutingWarehouse(e.target.value)}
                        placeholder="Enter warehouse name"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRoutingWarehouse())}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={addRoutingWarehouse}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview/Summary */}
          <div className="w-96 overflow-y-auto p-6 bg-muted/30">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Rule Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Preview of your routing rule configuration
                </p>
              </div>

              {/* Basic Info Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{formData.name || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <p className="font-medium">#{formData.priority}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p>
                      <Badge variant={formData.enabled ? "default" : "secondary"}>
                        {formData.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </p>
                  </div>
                  {formData.description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="text-xs mt-1">{formData.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conditions Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasConditions() ? (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>No conditions set. Rule will apply to all POs.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.conditions?.suppliers && formData.conditions.suppliers.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Suppliers:</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.conditions.suppliers.map((supplier, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {supplier}
                                <button
                                  onClick={() => removeSupplier(supplier)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.conditions?.warehouses && formData.conditions.warehouses.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Warehouses:</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.conditions.warehouses.map((warehouse, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {warehouse}
                                <button
                                  onClick={() => removeWarehouse(warehouse)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {formData.conditions?.productCategories && formData.conditions.productCategories.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {formData.conditions.productCategories.map((category, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {category}
                                <button
                                  onClick={() => removeCategory(category)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasActions() ? (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>No actions configured yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.actions?.autoCreateReceipt && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Auto Create Receipt</p>
                            <p className="text-xs text-muted-foreground">Receipt will be created automatically</p>
                          </div>
                        </div>
                      )}

                      {formData.actions?.autoReceiveVirtualWarehouse && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Auto Receive Virtual Warehouse</p>
                            <p className="text-xs text-muted-foreground">Goods will be marked as received</p>
                          </div>
                        </div>
                      )}

                      {formData.actions?.pushToWMS && (
                        <div className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Push to WMS</p>
                            {formData.actions.wmsEndpoint && (
                              <p className="text-xs text-muted-foreground break-all">{formData.actions.wmsEndpoint}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {formData.actions?.warehouseRouting && formData.actions.warehouseRouting.warehouses.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">Warehouse Routing</p>
                              <p className="text-xs text-muted-foreground">
                                Type: {formData.actions.warehouseRouting.type === "SINGLE" ? "Single Warehouse" : 
                                       formData.actions.warehouseRouting.type === "SPLIT_BY_SKU" ? "Split by SKU" : 
                                       "Split by Quantity"}
                              </p>
                            </div>
                          </div>
                          <div className="ml-6">
                            <p className="text-xs text-muted-foreground mb-1">Target Warehouses:</p>
                            <div className="flex flex-wrap gap-1">
                              {formData.actions.warehouseRouting.warehouses.map((warehouse, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {warehouse}
                                  <button
                                    onClick={() => removeRoutingWarehouse(warehouse)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {rule ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
