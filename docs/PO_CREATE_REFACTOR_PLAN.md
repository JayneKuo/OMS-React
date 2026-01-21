# PO Create Page Refactor Plan

## Changes Required

### 1. Add Factory Direct Purchase Type
- Add "工厂直发" option to purchase type dropdown
- When selected, show factory direct shipping configuration component
- Include path selection: via finished goods warehouse or direct shipment

### 2. Restructure Basic Information Card
**Add to Basic Information:**
- Supplier Name * (moved from Supplier Information)
- Supplier Code (new field)
- Contact Person (moved from Supplier Information)
- Contact Phone (moved from Supplier Information)

### 3. Rename and Restructure Cards

**Old: "Supplier Information" → New: "发货地址" (Shipping Address)**
- Remove: Supplier Name, Contact Person, Phone (moved to Basic Info)
- Keep: Address fields only (country, state, city, address1, address2, zipCode)

**Old: "Delivery Information" → New: "收货地址" (Delivery Address)**
- Remove logistics terms (moved to new card)
- Keep: Warehouse selection and address fields

### 4. New Card: "物流条款" (Logistics Terms)
Extract from Delivery Information:
- 交货期日 (Expected Delivery Date) *
- 最晚发运时间 (Latest Shipping Time)
- 运输方式 (Shipping Method)
- 运费条款 (Freight Terms)
- 贸易条款 (Incoterm)

### 5. Card Order
1. Basic Information (基本信息)
2. Logistics Terms (物流条款)
3. Shipping Address (发货地址)
4. Delivery Address (收货地址)
5. Product Lines (产品明细)
6. Cost Information (费用信息)
7. Attachments & Notes (附件和备注)

## Implementation Files
- Main file: `app/purchase/po/create/page.tsx`
- Factory direct config: `components/purchase/factory-direct-shipping-config.tsx` (already exists but corrupted)
