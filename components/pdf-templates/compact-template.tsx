import * as React from "react"

interface CompactTemplateProps {
  poData: any
  buyerInfo: any
  subtotal: number
  taxAmount: number
  total: number
}

export function CompactTemplate({ poData, buyerInfo, subtotal, taxAmount, total }: CompactTemplateProps) {
  return (
    <div className="p-8 print:p-6">
      {/* Compact Header - Single Line */}
      <div className="flex justify-between items-center border-b-2 border-gray-800 pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">PURCHASE ORDER</h1>
        </div>
        <div className="text-right text-sm">
          <div><span className="font-semibold">PO#:</span> {poData.orderNo}</div>
          <div><span className="font-semibold">Date:</span> {poData.orderDate}</div>
        </div>
      </div>

      {/* Compact Info Grid - 2 Columns */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        {/* From */}
        <div>
          <div className="font-bold mb-1">FROM:</div>
          <div>{buyerInfo.companyName}</div>
          {buyerInfo.address && <div>{buyerInfo.address}</div>}
          {(buyerInfo.city || buyerInfo.state) && (
            <div>{[buyerInfo.city, buyerInfo.state, buyerInfo.zipCode].filter(Boolean).join(', ')}</div>
          )}
          {buyerInfo.phone && <div>Tel: {buyerInfo.phone}</div>}
        </div>

        {/* To */}
        <div>
          <div className="font-bold mb-1">TO:</div>
          <div className="font-semibold">{poData.vendor.companyName}</div>
          <div>{poData.vendor.address}</div>
          <div>{poData.vendor.city}, {poData.vendor.state} {poData.vendor.zipCode}</div>
          <div>Attn: {poData.vendor.contactPerson}</div>
        </div>
      </div>

      {/* Compact Line Items */}
      <table className="w-full text-xs border-collapse mb-4">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="border border-gray-700 p-1.5 text-left">#</th>
            <th className="border border-gray-700 p-1.5 text-left">Description</th>
            <th className="border border-gray-700 p-1.5 text-center">Qty</th>
            <th className="border border-gray-700 p-1.5 text-right">Price</th>
            <th className="border border-gray-700 p-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {poData.lineItems.map((item: any) => (
            <tr key={item.lineNo}>
              <td className="border border-gray-300 p-1.5 text-center">{item.lineNo}</td>
              <td className="border border-gray-300 p-1.5">
                <div className="font-medium">{item.description}</div>
                <div className="text-gray-600">SKU: {item.partNumber}</div>
              </td>
              <td className="border border-gray-300 p-1.5 text-center">{item.quantity}</td>
              <td className="border border-gray-300 p-1.5 text-right">${item.unitPrice.toFixed(2)}</td>
              <td className="border border-gray-300 p-1.5 text-right font-medium">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Compact Totals */}
      <div className="flex justify-end mb-4">
        <div className="w-64 text-xs">
          <div className="flex justify-between py-1">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Tax:</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-t border-gray-800 font-bold">
            <span>TOTAL:</span>
            <span>${total.toFixed(2)} {poData.terms.currency}</span>
          </div>
        </div>
      </div>

      {/* Compact Footer */}
      <div className="text-xs text-center text-gray-600 border-t pt-3">
        <p>Terms: {poData.terms.paymentTerms} | Ship: {poData.terms.shippingMethod}</p>
        <p className="mt-1">{buyerInfo.companyName} • {buyerInfo.phone} • {buyerInfo.email}</p>
      </div>
    </div>
  )
}
