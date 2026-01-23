"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PORoutingRuleDialogV2 } from "@/components/automation/po-routing-rule-dialog-v2"
import type { RoutingRule } from "@/lib/types/routing-rule"

export default function TestDialogV2Page() {
  const [open, setOpen] = React.useState(false)

  const handleSave = (rule: RoutingRule) => {
    console.log("Saved rule:", rule)
    setOpen(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">测试 PORoutingRuleDialogV2</h1>
      <Button onClick={() => setOpen(true)}>打开 Dialog</Button>
      
      <PORoutingRuleDialogV2
        open={open}
        onOpenChange={setOpen}
        rule={null}
        onSave={handleSave}
      />
    </div>
  )
}
