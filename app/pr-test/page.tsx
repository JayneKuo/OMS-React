"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SimplePODialog } from "@/components/purchase/simple-po-dialog"

// 测试数据
const mockLineItems = [
  {
    id: "1",
    lineNo: 1,
    skuCode: "SKU001",
    skuName: "iPhone 15 Pro",
    specifications: "256GB Space Black",
    quantity: 10,
    unit: "pcs",
    estimatedUnitPrice: 999,
    supplier: "Apple Inc",
  },
  {
    id: "2", 
    lineNo: 2,
    skuCode: "SKU002",
    skuName: "Samsung Galaxy S24",
    specifications: "512GB Phantom Black",
    quantity: 15,
    unit: "pcs",
    estimatedUnitPrice: 899,
    supplier: "Samsung Electronics",
  }
]

export default function PRTestPage() {
  const [showPODialog, setShowPODialog] = React.useState(false)

  const handlePOConfirm = (data: any) => {
    console.log("PO Generation Data:", data)
    alert(`生成PO成功！\n选中商品: ${data.selectedItems.length} 个\n涉及供应商: ${Object.keys(data.supplierInfos).length} 个`)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>PR功能测试页面</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              测试修复后的SimplePODialog功能
            </div>
            
            <Button onClick={() => setShowPODialog(true)}>
              打开PO生成对话框
            </Button>
            
            <div className="text-xs text-muted-foreground">
              应该不再有useI18n错误
            </div>
          </div>
        </CardContent>
      </Card>

      <SimplePODialog
        open={showPODialog}
        onOpenChange={setShowPODialog}
        lineItems={mockLineItems}
        prNo="PR202401100001"
        onConfirm={handlePOConfirm}
      />
    </div>
  )
}