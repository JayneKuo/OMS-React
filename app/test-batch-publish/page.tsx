"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { BatchPublishDialog } from "@/components/product/batch-publish-dialog"

const mockProducts = [{
  id: "1",
  spuCode: "SPU-001",
  title: "Test Product",
  image: "https://via.placeholder.com/200",
  skus: [
    { id: "sku-1", skuCode: "SKU-001", skuName: "Test SKU", color: "Black", size: "M", status: "draft" }
  ]
}]

export default function TestPage() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Test Batch Publish</Button>
      <BatchPublishDialog open={open} onOpenChange={setOpen} selectedProducts={mockProducts} />
    </div>
  )
}
