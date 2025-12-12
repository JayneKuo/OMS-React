import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, Plus } from "lucide-react"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

export default function ASNPage() {
  const asns = [
    { id: "ASN-001", po: "PO-001", carrier: "FedEx", eta: "2024-01-20", status: "In Transit", type: "Split Shipment" },
    { id: "ASN-002", po: "PO-001", carrier: "UPS", eta: "2024-01-22", status: "Scheduled", type: "Split Shipment" },
    { id: "ASN-003", po: "PO-002, PO-003", carrier: "DHL", eta: "2024-01-21", status: "In Transit", type: "Combined" },
  ]

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advance Ship Notices (ASN)</h1>
            <p className="text-muted-foreground">Track shipments from suppliers</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New ASN
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Advance Ship Notices</CardTitle>
            <CardDescription>1 PO → Multiple ASNs (split) or Multiple POs → 1 ASN (combined)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {asns.map((asn) => (
                <div key={asn.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{asn.id}</p>
                    <p className="text-xs text-muted-foreground">{asn.po} • {asn.carrier} • {asn.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{asn.status}</p>
                    <p className="text-xs text-muted-foreground">ETA: {asn.eta}</p>
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
