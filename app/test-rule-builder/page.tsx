"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { RuleBuilderDialog } from "@/components/automation/rule-builder-dialog"
import type { RoutingRule } from "@/lib/types/routing-rule"

export default function TestRuleBuilderPage() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [rule, setRule] = React.useState<RoutingRule>({
    id: "test-rule",
    name: "",
    description: "",
    type: "FACTORY_DIRECT",
    enabled: true,
    priority: 1,
    executionMode: "FIRST_MATCH",
    conditionLogic: "AND",
    conditions: [],
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })

  const handleSave = (savedRule: RoutingRule) => {
    console.log("Saved rule:", savedRule)
    alert("Rule saved! Check console for details.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">🎯 Test Rule Builder</h1>
          <p className="text-muted-foreground">
            Click the button below to test the new IF-THEN rule builder
          </p>
        </div>

        <Button onClick={() => setIsOpen(true)} size="lg">
          Open Rule Builder
        </Button>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
          <p className="font-medium mb-2">What to test:</p>
          <ul className="text-left space-y-1 text-muted-foreground">
            <li>✅ Add conditions (IF section)</li>
            <li>✅ Add actions (THEN section)</li>
            <li>✅ Change execution mode</li>
            <li>✅ Configure Factory Direct workflow</li>
            <li>✅ Save and check console</li>
          </ul>
        </div>

        <RuleBuilderDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          rule={rule}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
