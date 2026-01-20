"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { POSendDialog } from "@/components/purchase/po-send-dialog"
import { Send } from "lucide-react"

export default function POSendTestPage() {
  const [showDialog, setShowDialog] = React.useState(false)

  const mockPOData = {
    orderNo: "PO202403150001",
    supplierName: "ABC Suppliers Inc.",
    supplierEmail: "supplier@abcsuppliers.com",
    totalAmount: 12500.00,
    currency: "USD",
    itemCount: 15,
  }

  const handleSend = (emailData: any) => {
    console.log("Email sent:", emailData)
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">PO Send Dialog Test</h1>
          <p className="text-muted-foreground mt-2">
            Test the PO send email functionality with PDF generation and preview
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test PO Send Dialog</CardTitle>
            <CardDescription>
              Click the button below to open the send dialog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold">Mock PO Data:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">PO Number:</span>
                  <span className="ml-2 font-mono">{mockPOData.orderNo}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="ml-2">{mockPOData.supplierName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <span className="ml-2">{mockPOData.supplierEmail}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="ml-2 font-semibold">
                    {mockPOData.currency} {mockPOData.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Item Count:</span>
                  <span className="ml-2">{mockPOData.itemCount}</span>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowDialog(true)} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Open Send Dialog
            </Button>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm mb-2">Features:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Set sender email address (From field)</li>
                <li>✓ Add multiple recipients and CC</li>
                <li>✓ Email validation</li>
                <li>✓ Customizable subject and body</li>
                <li>✓ Generate US standard PO PDF</li>
                <li>✓ Preview PDF in new window</li>
                <li>✓ Print and download PDF</li>
                <li>✓ Default values from PO data</li>
                <li>✓ Loading states and error handling</li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-sm mb-2">PDF Preview:</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The PDF follows US industry standards for Purchase Orders including:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Standard 8.5" x 11" letter format</li>
                <li>• Professional header with PO number and dates</li>
                <li>• Buyer and Vendor information sections</li>
                <li>• Ship To address</li>
                <li>• Terms & Conditions</li>
                <li>• Detailed line items table</li>
                <li>• Subtotal, Tax, and Total calculations</li>
                <li>• Notes and special instructions</li>
                <li>• Signature lines for approval</li>
                <li>• Print-optimized layout</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <POSendDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          poData={mockPOData}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
