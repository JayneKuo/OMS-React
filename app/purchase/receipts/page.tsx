import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ShoppingCart, Truck, Package, CheckCircle } from "lucide-react"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

export default function ReceiptsPage() {
  const receipts = [
    { id: "RCP-001", asn: "ASN-001", expectedQty: 100, warehouse: "WH-01", status: "Expected", date: "2024-01-20" },
    { id: "RCP-002", asn: "ASN-002", expectedQty: 150, warehouse: "WH-01", status: "Partial", date: "2024-01-22" },
    { id: "RCP-003", asn: "ASN-003", expectedQty: 200, warehouse: "WH-02", status: "Completed", date: "2024-01-21" },
  ]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
          <p className="text-muted-foreground">Expected receipts based on ASN</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expected Receipts</CardTitle>
            <CardDescription>1 ASN → 1 Receipt (expected receiving)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{receipt.id}</p>
                    <p className="text-xs text-muted-foreground">ASN: {receipt.asn} • {receipt.warehouse} • Expected: {receipt.expectedQty} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{receipt.status}</p>
                    <p className="text-xs text-muted-foreground">{receipt.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
