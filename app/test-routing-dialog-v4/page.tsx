"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PORoutingRuleDialogV4 } from "@/components/automation/po-routing-rule-dialog-v4"
import type { RoutingRule } from "@/lib/types/routing-rule"
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react"

const initialRules: RoutingRule[] = [
  {
    id: "rule-1",
    name: "Brazil vendor auto resolution",
    description: "Resolve vendor automatically and create RN by vendor + warehouse for Brazil inbound POs.",
    type: "PO_ROUTING",
    enabled: true,
    priority: 1,
    executionMode: "FIRST_MATCH",
    conditionLogic: "AND",
    conditions: [
      {
        id: "cond-1",
        field: "country",
        operator: "equals",
        value: "BR",
      },
    ],
    actions: [
      {
        type: "SET_WORKFLOW",
        workflow: "STANDARD",
        config: {
          autoCreateReceipt: true,
          pushToWMS: true,
          vendorResolutionMode: "AUTO_ASSIGN_MULTIPLE",
          vendorSelectionBasis: "RULE_MATCH",
          allowVendorSplit: true,
          createVendorPOs: true,
          receiptGenerationMode: "PER_VENDOR_AND_WAREHOUSE",
          autoPushReceipt: true,
          receiptPushTarget: "WAREHOUSE",
          allowWarehouseChangeAfterPush: true,
          warehouseChangePolicy: "CANCEL_AND_RECREATE_RN",
          cancelPreviousReceiptOnWarehouseChange: true,
        },
      },
    ],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "rule-2",
    name: "Electronics to US East",
    description: "Assign warehouse for electronics PO lines.",
    type: "PO_ROUTING",
    enabled: true,
    priority: 2,
    executionMode: "FIRST_MATCH",
    conditionLogic: "AND",
    conditions: [
      {
        id: "cond-2",
        field: "category",
        operator: "equals",
        value: "Electronics",
      },
    ],
    actions: [
      {
        type: "ASSIGN_WAREHOUSE",
        warehouseId: "US-EAST",
        warehouseName: "US East Coast",
      },
      {
        type: "ADD_TAG",
        tags: ["electronics", "priority-routing"],
      },
    ],
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
]

export default function TestRoutingDialogV4Page() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingRule, setEditingRule] = React.useState<RoutingRule | null>(null)
  const [rules, setRules] = React.useState<RoutingRule[]>(initialRules)

  const handleCreateRule = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }

  const handleEditRule = (rule: RoutingRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleSaveRule = (rule: RoutingRule) => {
    setRules((current) => {
      const exists = current.some((item) => item.id === rule.id)
      return exists ? current.map((item) => (item.id === rule.id ? rule : item)) : [...current, rule]
    })
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules((current) => current.filter((rule) => rule.id !== ruleId))
  }

  const handleToggleRule = (ruleId: string) => {
    setRules((current) =>
      current.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Routing Dialog V4 Test</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Minimal playground for the typed PO routing dialog, including vendor auto-resolution and RN orchestration settings.
          </p>
        </div>
        <Button onClick={handleCreateRule}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-base">What this page checks</CardTitle>
          <CardDescription>
            The dialog can open, edit existing PO routing rules, and persist the new workflow config fields without crashing.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{rule.name}</CardTitle>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    <Badge variant="outline">{rule.type}</Badge>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleToggleRule(rule.id)}>
                    {rule.enabled ? <Power className="h-4 w-4 text-green-600" /> : <PowerOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <div>Priority: <span className="font-medium text-foreground">{rule.priority}</span></div>
              <div>Conditions: <span className="font-medium text-foreground">{rule.conditions.length}</span></div>
              <div>Actions: <span className="font-medium text-foreground">{rule.actions.length}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PORoutingRuleDialogV4
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rule={editingRule}
        onSave={handleSaveRule}
        locale="zh"
      />
    </div>
  )
}
