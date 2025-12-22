import * as React from "react"
import { FileText, ShoppingCart, Truck, Package, CheckCircle } from "lucide-react"
import { TranslationKey } from "@/lib/i18n"

export const createPurchaseSidebarItems = (t: (key: TranslationKey) => string) => [
  { title: t('purchaseRequest'), href: "/purchase/pr", icon: React.createElement(FileText, { className: "h-4 w-4" }) },
  { title: t('purchaseOrder'), href: "/purchase/po", icon: React.createElement(ShoppingCart, { className: "h-4 w-4" }) },
  { title: t('receipts'), href: "/purchase/receipts", icon: React.createElement(Package, { className: "h-4 w-4" }) },
  { title: t('receiptConfirm'), href: "/purchase/receipt-confirm", icon: React.createElement(CheckCircle, { className: "h-4 w-4" }) },
  { title: t('advanceShipNotice'), href: "/purchase/asn", icon: React.createElement(Truck, { className: "h-4 w-4" }) },
]