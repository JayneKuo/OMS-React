# PR/PO Module UI Compliance Review & Fixes

## Issues Identified

### 1. Order Number Links - Hover Color & Text Style
**Problem**: Order numbers (PR No, PO No, etc.) don't have proper hover states
- Missing hover color (should be purple)
- Missing hover underline
- Text color should be primary (purple) not default

**Solution**: Update all order number cells to use:
```tsx
<div className="font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer">
  {row.prNo}
</div>
```

### 2. Copy Button for Order Numbers
**Problem**: No copy button next to order numbers
**Solution**: Add copy icon button with toast notification

### 3. PO Status Badge Display
**Problem**: PO module uses text-based status display instead of proper Badge component
**Solution**: Replace with Badge component following design system:
- Success states: `bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`
- Warning states: `bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`
- Info states: `bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400`
- Error states: `bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400`

### 4. Font Size & Color Compliance
**Problem**: Inconsistent font sizes and colors across PO module
**Solution**: Follow design system:
- Table headers: `text-sm` (14px) `font-medium`
- Table body: `text-xs` (12px)
- Labels: `text-xs` (12px) `text-muted-foreground`
- Values: `text-xs` (12px) `font-medium`
- Page titles: `text-3xl` (24px) `font-semibold`
- Descriptions: `text-sm` (14px) `text-muted-foreground`

## Files to Update

1. `app/purchase/pr/page.tsx` - PR list page
2. `app/purchase/po/page.tsx` - PO list page
3. `app/purchase/asn/page.tsx` - ASN list page (if exists)
4. `app/purchase/shipments/create/page.tsx` - Shipment creation
5. `app/real-layout-demo/page.tsx` - Demo page
6. `components/ui/status-badge.tsx` - Status badge component
7. All PO detail pages and dialogs

## Implementation Plan

1. Create reusable OrderNumberCell component with copy button
2. Update StatusBadge component to use proper Badge styling
3. Update all list pages to use new components
4. Audit all font sizes and colors
5. Test in both light and dark modes
