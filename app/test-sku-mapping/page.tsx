"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { SkuMappingDialogV2 } from "@/components/product/sku-mapping-dialog-v2"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSkuMappingPage() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">SKU Mapping Dialog Test</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Test the redesigned SKU mapping dialog with all new features
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Features</CardTitle>
          <CardDescription>
            Click the button below to open the SKU mapping dialog and test:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Channel and Warehouse dropdown selection</li>
            <li>SKU: Select from dropdown OR type in the input field below</li>
            <li>Enable/Disable toggle switch for each mapping</li>
            <li>Duplicate warehouse SKU validation (red background + badge)</li>
            <li>Add, edit, and delete mappings</li>
            <li>Two separate tables (Channel and Warehouse) stacked vertically</li>
          </ul>
          
          <div className="pt-4">
            <Button onClick={() => setOpen(true)}>
              Open SKU Mapping Dialog
            </Button>
          </div>
        </CardContent>
      </Card>

      <SkuMappingDialogV2
        open={open}
        onOpenChange={setOpen}
        skuCode="SKU-TEST-001"
        skuName="Test Product Name"
        onSave={(data) => {
          console.log("Saved mappings:", data)
        }}
      />
  )
}

    </div>
  )
}
