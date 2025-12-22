# Purchase Module Rename Summary

## Changes Made

### 1. Updated Translation Keys
Updated the purchase sub-module names in `lib/i18n.ts`:

**Chinese (zh):**
- purchaseRequest: 'Purchase Request' (was '采购申请')
- purchaseOrder: 'Purchase Order' (was '采购订单') 
- advanceShipNotice: 'Shipment' (was '预发货通知')
- receipts: 'Receipts' (was '收货')
- receiptConfirm: 'Receipt Confirm' (was '收货确认')

**English (en):**
- purchaseRequest: 'Purchase Request' (was 'Requisitions')
- purchaseOrder: 'Purchase Order' (was 'Orders')
- advanceShipNotice: 'Shipment' (was 'Shipments')
- receipts: 'Receipts' (was 'Receiving')
- receiptConfirm: 'Receipt Confirm' (was 'Confirmations')

### 2. Created Shared Sidebar Configuration
Created `lib/purchase-sidebar-items.ts` to centralize sidebar item configuration and ensure consistency across all purchase pages.

### 3. Updated Purchase Pages
Updated the following pages to use the new naming and shared configuration:

- `app/purchase/page.tsx` - Main purchase page
- `app/purchase/pr/page.tsx` - Purchase Request page
- `app/purchase/po/page.tsx` - Purchase Order page
- `app/purchase/asn/page.tsx` - Shipment page
- `app/purchase/receipts/page.tsx` - Receipts page
- `app/purchase/receipt-confirm/page.tsx` - Receipt Confirm page

### 4. Updated UI Text
- Updated page titles and descriptions to use the new naming
- Updated workflow descriptions to reflect "Shipment" instead of "ASN"
- Updated card titles and labels throughout the purchase module

## Result

The purchase module now uses consistent naming:
- **Purchase Request** (instead of 子采购/Requisitions)
- **Purchase Order** (standardized)
- **Shipment** (instead of ASN/Advance Ship Notice)
- **Receipts** (standardized)
- **Receipt Confirm** (standardized)

The workflow now reads: Purchase Request → Purchase Order → Shipment → Receipts → Receipt Confirm

All pages now use the centralized sidebar configuration, making future updates easier and ensuring consistency across the module.