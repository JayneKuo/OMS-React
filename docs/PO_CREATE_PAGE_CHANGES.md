# PO Create Page - Required Changes

## Summary
The PO detail page has been successfully refactored. Now we need to apply similar changes to the create page at `app/purchase/po/create/page.tsx`.

## Key Changes

### 1. Import Factory Direct Component
Add to imports:
```typescript
import { FactoryDirectShippingConfig, FactoryDirectConfig } from "@/components/purchase/factory-direct-shipping-config"
```

### 2. Add State for Factory Direct Config
Add after existing state declarations:
```typescript
const [factoryDirectConfig, setFactoryDirectConfig] = React.useState<FactoryDirectConfig>({
  viaFinishedGoodsWarehouse: true,
  factoryId: "",
  factoryName: "",
  finishedGoodsWarehouseId: "",
  finishedGoodsWarehouseName: "",
  finalDestinationId: "",
  finalDestinationType: "CUSTOMER",
  finalDestinationName: "",
})
```

### 3. Update Purchase Type Dropdown
Change the purchaseType Select to include factory direct option:
```typescript
<Select value={purchaseType} onValueChange={setPurchaseType}>
  <SelectTrigger>
    <SelectValue placeholder={t('selectPurchaseType')} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="REGULAR">{t('regularPurchase')}</SelectItem>
    <SelectItem value="REPLENISHMENT">{t('stockReplenishment')}</SelectItem>
    <SelectItem value="FACTORY_DIRECT">工厂直发</SelectItem>
  </SelectContent>
</Select>
```

### 4. Add Supplier Fields to Basic Information Card
In the Basic Information card, after budgetProject field, add:
```typescript
<div className="space-y-2">
  <Label htmlFor="supplierName">{t('supplierName')} *</Label>
  <Input
    id="supplierName"
    value={supplierInfo.supplierName}
    onChange={(e) => setSupplierInfo({...supplierInfo, supplierName: e.target.value})}
    placeholder={t('enterSupplierName')}
  />
</div>

<div className="space-y-2">
  <Label htmlFor="supplierCode">供应商编码</Label>
  <Input
    id="supplierCode"
    value={supplierInfo.supplierCode || ""}
    onChange={(e) => setSupplierInfo({...supplierInfo, supplierCode: e.target.value})}
    placeholder="输入供应商编码"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="contactPerson">联系人</Label>
  <Input
    id="contactPerson"
    value={supplierInfo.contactPerson}
    onChange={(e) => setSupplierInfo({...supplierInfo, contactPerson: e.target.value})}
    placeholder={t('enterContactPerson')}
  />
</div>

<div className="space-y-2">
  <Label htmlFor="contactPhone">联系电话</Label>
  <Input
    id="contactPhone"
    value={supplierInfo.contactPhone}
    onChange={(e) => setSupplierInfo({...supplierInfo, contactPhone: e.target.value})}
    placeholder={t('enterContactPhone')}
  />
</div>
```
