import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus } from "lucide-react"

const sidebarItems = [
  { title: "Purchase Request", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "Purchase Order", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

export default function ReceiptConfirmPage() {
  const confirms = [
    { id: "RCF-001", receipt: "RCP-001", actualQty: 50, confirmedBy: "John Doe", status: "Partial", date: "2024-01-20 10:30" },
    { id: "RCF-002", receipt: "RCP-001", actualQty: 50, confirmedBy: "John Doe", status: "Completed", date: "2024-01-20 14:15" },
    { id: "RCF-003", receipt: "RCP-002", actualQty: 150, confirmedBy: "Jane Smith", status: "Completed", date: "2024-01-22 09:00" },
  ]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Receipt Confirmations</h1>
            <p className="text-muted-foreground">Actual received quantity confirmations</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Confirm Receipt
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Receipt Confirmations</CardTitle>
            <CardDescription>1 Receipt → Multiple Receipt Confirms (split receiving)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {confirms.map((confirm) => (
                <div key={confirm.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{confirm.id}</p>
                    <p className="text-xs text-muted-foreground">Receipt: {confirm.receipt} • Actual: {confirm.actualQty} units • By {confirm.confirmedBy}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{confirm.status}</p>
                    <p className="text-xs text-muted-foreground">{confirm.date}</p>
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
