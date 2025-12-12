"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ShoppingCart, Truck, Package, CheckCircle } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export default function PurchasePage() {
  const { t } = useI18n()

  const sidebarItems = [
    { title: `PR (${t('purchaseRequest')})`, href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
    { title: `PO (${t('purchaseOrder')})`, href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
    { title: `ASN (${t('advanceShipNotice')})`, href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
    { title: t('receipts'), href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
    { title: t('receiptConfirm'), href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
  ]
  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('purchase')}</h1>
          <p className="text-muted-foreground">
            Manage the complete purchase workflow: PR → PO → ASN → Receipt → Receipt Confirm
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PR</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Purchase Requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PO</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Purchase Orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ASN</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-muted-foreground">Advance Ship Notices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receipts</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">Expected Receipts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Receipt Confirms</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Workflow</CardTitle>
            <CardDescription>Complete purchase process flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">PR (Purchase Request)</h3>
                  <p className="text-sm text-muted-foreground">Create purchase requests for needed items</p>
                </div>
              </div>
              <div className="ml-5 border-l-2 border-dashed h-8" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">PO (Purchase Order)</h3>
                  <p className="text-sm text-muted-foreground">Multiple PRs can be consolidated into one PO</p>
                </div>
              </div>
              <div className="ml-5 border-l-2 border-dashed h-8" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">ASN (Advance Ship Notice)</h3>
                  <p className="text-sm text-muted-foreground">1 PO → Multiple ASNs (split shipments) or Multiple POs → 1 ASN (combined shipment)</p>
                </div>
              </div>
              <div className="ml-5 border-l-2 border-dashed h-8" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Receipt</h3>
                  <p className="text-sm text-muted-foreground">Expected receipt based on ASN (1 ASN → 1 Receipt)</p>
                </div>
              </div>
              <div className="ml-5 border-l-2 border-dashed h-8" />
              
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Receipt Confirm</h3>
                  <p className="text-sm text-muted-foreground">Actual received confirmation (1 Receipt → Multiple Receipt Confirms for split receiving)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
