"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Package, ShoppingCart, Route, PauseCircle, AlertCircle, Warehouse } from "lucide-react"
import type { RoutingRule, FactoryDirectActions } from "@/lib/types/routing-rule"

interface PORoutingRuleEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: RoutingRule | null
  onSave: (rule: RoutingRule) => void
}

export function PORoutingRuleEditor({ open, onOpenChange, rule, onSave }: PORoutingRuleEditorProps) {
  const [formData, setFormData] = React.useState<RoutingRule>(
    rule || {
      id: `rule-${Date.now()}`,
      name: "Factory Direct Fulfillment",
      description: "Route factory-direct POs through FG staging warehouse",
      type: "FACTORY_DIRECT",
      enabled: true,
      priority: 1,
      conditions: [{ field: "purchaseType", operator: "equals", value: "FACTORY_DIRECT" }],
      actions: {
        enableFGStaging: true,
        generateFGReceipt: true,
        generateSaleOrder: true,
        waitForFGReceipt: false,
        autoCreateFinalReceipt: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  )

  React.useEffect(() => {
    if (rule) {
      setFormData(rule)
    }
  }, [rule])

  const actions = formData.actions as FactoryDirectActions

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date().toISOString()
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit Routing Rule" : "Create Routing Rule"}</DialogTitle>
          <DialogDescription>
            Configure the fulfillment workflow for factory-direct purchase orders
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Factory Direct Fulfillment"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this rule"
              />
            </div>
          </div>

          <Separator />

          {/* Factory Direct Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Fulfillment Workflow</h3>
            
            {/* Enable FG Staging */}
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-orange-600" />
                  <Label className="text-sm font-medium">Enable FG Staging Warehouse</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Route goods through intermediate staging warehouse for quality control
                </p>
              </div>
              <Switch
                checked={actions.enableFGStaging}
                onCheckedChange={(checked) => 
                  setFormData({
                    ...formData,
                    actions: { ...actions, enableFGStaging: checked }
                  })
                }
              />
            </div>

            {/* Conditional: FG Staging enabled */}
            {actions.enableFGStaging && (
              <div className="ml-6 space-y-4 pl-4 border-l-2 border-dashed">
                {/* Generate FG Receipt */}
                <div className="flex items-start justify-between p-4 border rounded-lg bg-blue-50/30 dark:bg-blue-950/10">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-medium">Generate FG Inbound Receipt</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create receipt when goods arrive at FG staging warehouse
                    </p>
                  </div>
                  <Switch
                    checked={actions.generateFGReceipt}
                    onCheckedChange={(checked) => 
                      setFormData({
                        ...formData,
                        actions: { ...actions, generateFGReceipt: checked }
                      })
                    }
                  />
                </div>

                {/* Generate Sale Order */}
                <div className="flex items-start justify-between p-4 border rounded-lg bg-purple-50/30 dark:bg-purple-950/10">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-medium">Generate FG Outbound Order</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create outbound order to ship from FG warehouse to final destination
                    </p>
                  </div>
                  <Switch
                    checked={actions.generateSaleOrder}
                    onCheckedChange={(checked) => 
                      setFormData({
                        ...formData,
                        actions: { ...actions, generateSaleOrder: checked }
                      })
                    }
                  />
                </div>

                {/* Wait for FG Receipt */}
                {actions.generateFGReceipt && actions.generateSaleOrder && (
                  <div className="ml-6 p-4 border-l-2 border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10 rounded-r-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <PauseCircle className="h-4 w-4 text-amber-600" />
                          <Label className="text-sm font-medium">Wait for Inbound Before Outbound</Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Create outbound order only after inbound receipt is completed
                        </p>
                      </div>
                      <Switch
                        checked={actions.waitForFGReceipt}
                        onCheckedChange={(checked) => 
                          setFormData({
                            ...formData,
                            actions: { ...actions, waitForFGReceipt: checked }
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Auto Create Final Receipt */}
                {actions.generateSaleOrder && (
                  <div className="flex items-start justify-between p-4 border rounded-lg bg-emerald-50/30 dark:bg-emerald-950/10">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-emerald-600" />
                        <Label className="text-sm font-medium">Auto-Create Final Destination Receipt</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Automatically create receipt at final warehouse based on DC callback
                      </p>
                      <div className="flex items-start gap-2 mt-2 p-2 bg-muted/50 rounded text-xs">
                        <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          <strong>ON:</strong> Receipt created from DC details | <strong>OFF:</strong> Receipt created immediately
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={actions.autoCreateFinalReceipt}
                      onCheckedChange={(checked) => 
                        setFormData({
                          ...formData,
                          actions: { ...actions, autoCreateFinalReceipt: checked }
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
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
