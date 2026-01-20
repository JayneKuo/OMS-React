import * as React from "react"

interface MinimalTemplateProps {
  poData: any
  buyerInfo: any
  subtotal: number
  taxAmount: number
  total: number
}

export function MinimalTemplate({ poData, buyerInfo, subtotal, taxAmount, total }: MinimalTemplateProps) {
  return (
    <div className="p-8 print:p-6">
      {/* Minimal Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">PURCHASE ORDER</h1>
        <div className="flex justify-between text-sm">
          <div>
            <div>PO Number: <span className="font-mono font-bold">{poData.orderNo}</span></div>
            <div>Date: {poData.orderDate}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{buyerInfo.companyName}</div>
            <div>{buyerInfo.email}</div>
          </div>
        </div>
      </div>

      {/* Vendor Info - Minimal */}
      <div className="mb-6 p-3 bg-gray-50 rounded">
        <div className="text-sm">
          <span className="font-semibold">Vendor:</span> {poData.vendor.companyName}
          <span className="mx-2">•</span>
          <span>{poData.vendor.contactPerson}</span>
          <span className="mx-2">•</span>
          <span>{poData.vendor.email}</span>
        </div>
      </div>

      {/* Minimal Line Items - No borders */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-2 text-left">Item</th>
            <th className="py-2 text-center w-20">Qty</th>
            <th className="py-2 text-right w-24">Price</th>
            <th className="py-2 text-right w-28">Total</th>
          </tr>
        </thead>
        <tbody>
          {poData.lineItems.map((item: any, index: number) => (
            <tr key={item.lineNo} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2">
                <div className="font-medium">{item.description}</div>
                <div className="text-xs text-gray-600">{item.partNumber}</div>
              </td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="py-2 text-right font-medium">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Minimal Totals */}
      <div className="flex justify-end">
        <div className="w-80">
          <div className="flex justify-between py-2 text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span>Tax:</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-gray-800 text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="mt-8 pt-4 border-t text-xs text-gray-600 text-center">
        <p>Payment Terms: {poData.terms.paymentTerms}</p>
      </div>
    </div>
  )
}
