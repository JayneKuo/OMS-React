"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { getCompanyConfigSync, type CompanyConfig } from "@/lib/company-config"
import { type PDFTemplate } from "@/lib/pdf-templates"
import { CompactTemplate } from "@/components/pdf-templates/compact-template"
import { MinimalTemplate } from "@/components/pdf-templates/minimal-template"

// Mock PO data - in real implementation, fetch from API
const mockPOData = {
  orderNo: "PO202403150001",
  orderDate: "2024-03-15",
  requiredDate: "2024-04-15",
  
  // Buyer Information
  buyer: {
    companyName: "ABC Corporation",
    address: "1234 Business Park Drive",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    email: "purchasing@abccorp.com",
    taxId: "12-3456789",
  },
  
  // Vendor Information
  vendor: {
    companyName: "XYZ Suppliers Inc.",
    vendorNo: "SUP001",
    address: "456 Supplier Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 987-6543",
    email: "sales@xyzsuppliers.com",
    taxId: "98-7654321",
    contactPerson: "John Smith",
  },
  
  // Ship To Information
  shipTo: {
    companyName: "ABC Corporation - Main Warehouse",
    address: "5678 Warehouse Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90002",
    country: "United States",
    phone: "+1 (555) 111-2222",
    attention: "Receiving Department",
  },
  
  // Terms and Conditions
  terms: {
    paymentTerms: "Net 30",
    shippingMethod: "FOB Destination",
    deliveryTerms: "Standard Delivery",
    currency: "USD",
  },
  
  // Line Items
  lineItems: [
    {
      lineNo: 1,
      partNumber: "SKU001",
      description: "iPhone 15 Pro - 256GB, Natural Titanium",
      quantity: 100,
      uom: "EA",
      unitPrice: 50.00,
      discount: 0,
      taxRate: 8.5,
      amount: 5000.00,
    },
    {
      lineNo: 2,
      partNumber: "SKU002",
      description: "MacBook Pro - 14-inch, M3 Pro, 512GB SSD",
      quantity: 50,
      uom: "EA",
      unitPrice: 150.00,
      discount: 0,
      taxRate: 8.5,
      amount: 7500.00,
    },
    {
      lineNo: 3,
      partNumber: "SKU003",
      description: "AirPods Pro - 2nd Generation, USB-C",
      quantity: 200,
      uom: "EA",
      unitPrice: 25.00,
      discount: 5,
      taxRate: 8.5,
      amount: 4750.00,
    },
  ],
  
  // Notes
  notes: "Please confirm receipt of this purchase order within 24 hours. All items must be delivered by the required date. Contact purchasing department for any questions.",
  
  // Approval
  preparedBy: "Jane Doe",
  approvedBy: "Michael Johnson",
  approvalDate: "2024-03-15",
}

function POPDFPreviewContent() {
  const searchParams = useSearchParams()
  const poNo = searchParams.get('poNo') || mockPOData.orderNo
  const template = (searchParams.get('template') as PDFTemplate) || 'standard'
  
  // Get company configuration from URL params or default config
  const companyConfig = getCompanyConfigSync()
  
  // Override with URL parameters if provided
  const buyerInfo = {
    companyName: searchParams.get('companyName') || companyConfig.companyName || mockPOData.buyer.companyName,
    address: searchParams.get('companyAddress') || companyConfig.address || mockPOData.buyer.address,
    city: searchParams.get('companyCity') || companyConfig.city || mockPOData.buyer.city,
    state: searchParams.get('companyState') || companyConfig.state || mockPOData.buyer.state,
    zipCode: searchParams.get('companyZip') || companyConfig.zipCode || mockPOData.buyer.zipCode,
    country: searchParams.get('companyCountry') || companyConfig.country || mockPOData.buyer.country,
    phone: searchParams.get('companyPhone') || companyConfig.phone || mockPOData.buyer.phone,
    email: searchParams.get('companyEmail') || companyConfig.purchasingEmail || companyConfig.email || mockPOData.buyer.email,
    taxId: searchParams.get('companyTaxId') || companyConfig.taxId || mockPOData.buyer.taxId,
  }
  
  // Calculate totals
  const subtotal = mockPOData.lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = mockPOData.lineItems.reduce((sum, item) => {
    return sum + (item.amount * item.taxRate / 100)
  }, 0)
  const total = subtotal + taxAmount

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    window.print() // In real implementation, this would trigger PDF download
  }

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      {/* Action Bar - Hidden when printing */}
      <div className="bg-white border-b p-4 flex justify-between items-center print:hidden sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-semibold">Purchase Order Preview</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* PDF Content - Template Based */}
      <div className="max-w-[8.5in] mx-auto bg-white shadow-lg print:shadow-none my-8 print:my-0">
        {/* Render different templates based on selection */}
        {template === 'compact' && (
          <CompactTemplate 
            poData={mockPOData}
            buyerInfo={buyerInfo}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
          />
        )}
        
        {template === 'minimal' && (
          <MinimalTemplate 
            poData={mockPOData}
            buyerInfo={buyerInfo}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
          />
        )}
        
        {(template === 'standard' || template === 'detailed') && (
          <div className="p-12 print:p-8">
          {/* Standard/Detailed Template - Original Layout */}
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">PURCHASE ORDER</h1>
                <p className="text-sm text-gray-600 mt-1">This is not an invoice</p>
              </div>
              <div className="text-right">
                <div className="text-sm space-y-1">
                  <div className="flex justify-end gap-2">
                    <span className="font-semibold">PO Number:</span>
                    <span className="font-mono">{mockPOData.orderNo}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="font-semibold">Date:</span>
                    <span>{mockPOData.orderDate}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="font-semibold">Required Date:</span>
                    <span>{mockPOData.requiredDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Buyer (From) */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                From (Buyer)
              </h2>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold">{buyerInfo.companyName}</p>
                {buyerInfo.address && <p>{buyerInfo.address}</p>}
                {(buyerInfo.city || buyerInfo.state || buyerInfo.zipCode) && (
                  <p>
                    {[buyerInfo.city, buyerInfo.state, buyerInfo.zipCode].filter(Boolean).join(', ')}
                  </p>
                )}
                {buyerInfo.country && <p>{buyerInfo.country}</p>}
                {buyerInfo.phone && <p className="mt-2">Phone: {buyerInfo.phone}</p>}
                {buyerInfo.email && <p>Email: {buyerInfo.email}</p>}
                {buyerInfo.taxId && <p>Tax ID: {buyerInfo.taxId}</p>}
              </div>
            </div>

            {/* Vendor (To) */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                To (Vendor)
              </h2>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold">{mockPOData.vendor.companyName}</p>
                <p className="text-xs text-gray-600">Vendor #: {mockPOData.vendor.vendorNo}</p>
                <p>{mockPOData.vendor.address}</p>
                <p>{mockPOData.vendor.city}, {mockPOData.vendor.state} {mockPOData.vendor.zipCode}</p>
                <p>{mockPOData.vendor.country}</p>
                <p className="mt-2">Attn: {mockPOData.vendor.contactPerson}</p>
                <p>Phone: {mockPOData.vendor.phone}</p>
                <p>Email: {mockPOData.vendor.email}</p>
              </div>
            </div>
          </div>

          {/* Ship To & Terms */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Ship To */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                Ship To
              </h2>
              <div className="text-sm space-y-0.5">
                <p className="font-semibold">{mockPOData.shipTo.companyName}</p>
                <p>Attn: {mockPOData.shipTo.attention}</p>
                <p>{mockPOData.shipTo.address}</p>
                <p>{mockPOData.shipTo.city}, {mockPOData.shipTo.state} {mockPOData.shipTo.zipCode}</p>
                <p>{mockPOData.shipTo.country}</p>
                <p className="mt-2">Phone: {mockPOData.shipTo.phone}</p>
              </div>
            </div>

            {/* Terms */}
            <div>
              <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                Terms & Conditions
              </h2>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold">Payment Terms:</span>
                  <span>{mockPOData.terms.paymentTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Shipping Method:</span>
                  <span>{mockPOData.terms.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Delivery Terms:</span>
                  <span>{mockPOData.terms.deliveryTerms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Currency:</span>
                  <span>{mockPOData.terms.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="border border-gray-700 p-2 text-left w-12">Line</th>
                  <th className="border border-gray-700 p-2 text-left w-24">Part #</th>
                  <th className="border border-gray-700 p-2 text-left">Description</th>
                  <th className="border border-gray-700 p-2 text-center w-16">Qty</th>
                  <th className="border border-gray-700 p-2 text-center w-16">UOM</th>
                  <th className="border border-gray-700 p-2 text-right w-24">Unit Price</th>
                  <th className="border border-gray-700 p-2 text-right w-20">Tax %</th>
                  <th className="border border-gray-700 p-2 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {mockPOData.lineItems.map((item) => (
                  <tr key={item.lineNo} className="border-b border-gray-300">
                    <td className="border border-gray-300 p-2 text-center">{item.lineNo}</td>
                    <td className="border border-gray-300 p-2 font-mono text-xs">{item.partNumber}</td>
                    <td className="border border-gray-300 p-2">{item.description}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.uom}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2 text-right">{item.taxRate}%</td>
                    <td className="border border-gray-300 p-2 text-right font-mono font-semibold">
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-semibold">Tax:</span>
                  <span className="font-mono">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-800">
                  <span className="font-bold text-base">TOTAL:</span>
                  <span className="font-mono font-bold text-base">${total.toFixed(2)} {mockPOData.terms.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {mockPOData.notes && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase border-b border-gray-300 pb-1">
                Notes / Special Instructions
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-line">{mockPOData.notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-gray-300">
            <div>
              <div className="border-b border-gray-400 mb-2 pb-8"></div>
              <div className="text-sm">
                <p className="font-semibold">Prepared By: {mockPOData.preparedBy}</p>
                <p className="text-gray-600">Purchasing Department</p>
              </div>
            </div>
            <div>
              <div className="border-b border-gray-400 mb-2 pb-8"></div>
              <div className="text-sm">
                <p className="font-semibold">Approved By: {mockPOData.approvedBy}</p>
                <p className="text-gray-600">Date: {mockPOData.approvalDate}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-xs text-gray-600 text-center">
            {companyConfig.pdfFooterText && (
              <p className="mb-1">{companyConfig.pdfFooterText}</p>
            )}
            {companyConfig.pdfTermsAndConditions && (
              <p className="mb-1">{companyConfig.pdfTermsAndConditions}</p>
            )}
            {!companyConfig.pdfFooterText && !companyConfig.pdfTermsAndConditions && (
              <>
                <p className="mb-1">
                  This Purchase Order is subject to the terms and conditions stated herein.
                </p>
                <p>
                  Please acknowledge receipt of this order and confirm acceptance of terms within 24 hours.
                </p>
              </>
            )}
            <p className="mt-2 font-semibold">
              {[
                buyerInfo.companyName,
                buyerInfo.phone,
                buyerInfo.email
              ].filter(Boolean).join(' • ')}
            </p>
            {companyConfig.website && (
              <p className="mt-1">{companyConfig.website}</p>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:my-0 {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }
          
          .print\\:p-8 {
            padding: 2rem !important;
          }
          
          .print\\:bg-white {
            background-color: white !important;
          }
        }
      `}</style>
    </div>
  )
}

export default function POPDFPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading PDF preview...</p>
        </div>
      </div>
    }>
      <POPDFPreviewContent />
    </Suspense>
  )
}
