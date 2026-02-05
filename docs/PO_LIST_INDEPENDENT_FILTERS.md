# PO List Page - Independent Filter Fields Implementation

## Overview
Added three independent batch filter fields after the keyword search on the PO list page (`/purchase/po`), matching the style used in the product list page.

## Changes Made

### 1. Added Independent Batch Filter Fields
Three new batch filter popovers were added to the `filterConfigs` array:

- **PO No.** (`orderNo`) - Batch filter by Purchase Order Number
- **Original PO No.** (`originalPoNo`) - Batch filter by Original PO Number from external system
- **Reference No.** (`referenceNo`) - Batch filter by Reference Number

### 2. Filter Configuration
```typescript
{
  id: "orderNo",
  label: t('poNo'),
  type: "batch",
  placeholder: "PO202403150001\nPO202403150002\nPO202403150003",
},
{
  id: "originalPoNo",
  label: t('originalPoNo'),
  type: "batch",
  placeholder: "EXT-PO-2024-001\nEXT-PO-2024-002\nEXT-PO-2024-003",
},
{
  id: "referenceNo",
  label: t('referenceNo'),
  type: "batch",
  placeholder: "REF202403150001\nREF202403150002\nREF202403150003",
}
```

### 3. Filter Logic
Updated the filter logic in the `useEffect` to handle batch input (comma-separated values):

```typescript
if (filter.filterId === "orderNo") {
  const values = filter.optionValue.split(',').map(v => v.trim().toLowerCase())
  filtered = filtered.filter(po => 
    values.some(val => po.orderNo.toLowerCase().includes(val))
  )
} else if (filter.filterId === "originalPoNo") {
  const values = filter.optionValue.split(',').map(v => v.trim().toLowerCase())
  filtered = filtered.filter(po => 
    values.some(val => po.originalPoNo.toLowerCase().includes(val))
  )
} else if (filter.filterId === "referenceNo") {
  const values = filter.optionValue.split(',').map(v => v.trim().toLowerCase())
  filtered = filtered.filter(po => 
    values.some(val => po.referenceNo.toLowerCase().includes(val))
  )
}
```

## User Experience

### Visual Layout
The three filter fields appear as button-style popovers after the keyword search field:
- Keyword Search → [PO No.] → [Original PO No.] → [Reference No.] → Other Filters

### Features
- **Batch input popover**: Click button to open a popover with textarea
- **Multi-line input**: Supports comma, space, or newline separation
- **Real-time count**: Shows "已识别: X 个" badge with item count
- **Excel paste support**: Can paste directly from Excel columns
- **Case-insensitive**: Search is not case-sensitive
- **OR logic**: Matches any of the entered values
- **Active filter pills**: Selected filters show as badges below the filter bar with item count
- **Combined filtering**: All filters work together (AND logic between filter types)

### Popover UI
Each batch filter popover includes:
- Header with filter name and clear button
- Large textarea for batch input (140px height)
- Real-time item count badge
- Helper text: "粘贴 Excel 列或手动输入，系统自动识别有效位"
- Cancel and Search buttons

### Responsive Behavior
- The FilterBar component automatically manages visible filters based on available space
- If space is limited, some filters move to the "More" dropdown
- The three new batch filters are positioned first, so they have priority visibility

## Technical Details

### Component Used
- **FilterBar** component from `@/components/data-table/filter-bar`
- Supports `type: "batch"` for batch input with popover UI

### Filter Type
- Type: `"batch"`
- Renders as button with popover containing textarea
- Automatically parses input by comma, space, or newline
- Stores values as comma-separated string internally

### Data Flow
1. User clicks filter button to open popover
2. User enters multiple values (comma/space/newline separated)
3. Real-time count updates as user types
4. User clicks "搜索" button
5. `handleBatchInputChange` updates `activeFilters` state
6. `useEffect` triggers and applies all filters with OR logic for batch values
7. `filteredData` updates
8. DataTable re-renders with filtered results

## Testing
To test the implementation:
1. Navigate to `/purchase/po`
2. Click on any of the three new filter buttons (PO No., Original PO No., Reference No.)
3. Enter multiple values in the textarea (one per line or comma-separated)
4. Verify the count badge updates correctly
5. Click "搜索" to apply the filter
6. Verify that the table filters correctly (matches ANY of the entered values)
7. Test combining multiple filters
8. Test clearing individual filters
9. Test clearing all filters
10. Test pasting from Excel

## Future Enhancements
- Add autocomplete suggestions based on existing PO numbers
- Add validation for PO number format
- Add filter presets for common searches
- Add export functionality for filtered results
