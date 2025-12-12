"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimplePODialog } from "@/components/purchase/simple-po-dialog"
import { I18nProvider } from "@/components/i18n-provider"

// 测试数据 - 多个供应商的商品
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
    targetWarehouse: "Main Warehouse",
    expectedDeliveryDate: "2024-02-15"
  },
  {
    id: "2", 
    lineNo: 2,
    skuCode: "SKU002",
    skuName: "MacBook Pro",
    specifications: "14-inch M3 Pro",
    quantity: 5,
    unit: "pcs",
    estimatedUnitPrice: 1999,
    supplier: "Apple Inc",
    targetWarehouse: "Main Warehouse",
    expectedDeliveryDate: "2024-02-20"
  },
  {
    id: "3",
    lineNo: 3,
    skuCode: "SKU003", 
    skuName: "Samsung Galaxy S24",
    specifications: "512GB Phantom Black",
    quantity: 15,
    unit: "pcs",
    estimatedUnitPrice: 899,
    supplier: "Samsung Electronics",
    targetWarehouse: "Main Warehouse",
    expectedDeliveryDate: "2024-02-18"
  },
  {
    id: "4",
    lineNo: 4,
    skuCode: "SKU004",
    skuName: "Dell XPS 13",
    specifications: "Intel i7 16GB RAM",
    quantity: 8,
    unit: "pcs", 
    estimatedUnitPrice: 1299,
    supplier: "Dell Technologies",
    targetWarehouse: "Main Warehouse",
    expectedDeliveryDate: "2024-02-25"
  }
]

function TestContent() {
  const [showPODialog, setShowPODialog] = React.useState(false)

  const handlePOConfirm = (data: any) => {
    console.log("PO Generation Data:", data)
    alert(`生成PO成功！\n选中商品: ${data.selectedItems.length} 个\n涉及供应商: ${Object.keys(data.supplierInfos).length} 个`)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>SimplePODialog 测试页面</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              测试多供应商PO生成对话框，每个供应商有独立的发货地址和交易条款
            </div>
            
            <Button onClick={() => setShowPODialog(true)}>
              打开PO生成对话框
            </Button>
            
            <div className="text-xs text-muted-foreground">
              测试数据包含4个商品，来自3个不同供应商：Apple Inc, Samsung Electronics, Dell Technologies
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

export default function TestButtonPage() {
  return (
    <I18nProvider>
      <TestContent />
    </I18nProvider>
  )
}