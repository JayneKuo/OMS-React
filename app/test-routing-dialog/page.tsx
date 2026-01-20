"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PORoutingRuleDialog } from "@/components/automation/po-routing-rule-dialog"
import { Plus } from "lucide-react"

export default function TestRoutingDialogPage() {
  const [showDialog, setShowDialog] = React.useState(false)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Routing Dialog</h1>
      
      <Button onClick={() => {
        console.log("Test button clicked")
        setShowDialog(true)
      }}>
        <Plus className="h-4 w-4 mr-2" />
        Open Dialog
      </Button>

      <div className="mt-4">
        <p>Dialog state: {showDialog ? "Open" : "Closed"}</p>
      </div>

      <PORoutingRuleDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        rule={null}
        onSave={(rule) => {
          console.log("Rule saved:", rule)
          setShowDialog(false)
        }}
      />
    </div>
  )
}
