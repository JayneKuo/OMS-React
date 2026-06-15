# PO Detail Layout And PO Type Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the PO detail page so static order info leaves the right-side tab panel and repair the PO list so purchase type shows business meaning (`Factory Direct`) while stage shows `Pending Vendor` instead of `Missing FG warehouse`.

**Architecture:** Keep the existing page files and mock data model, but change information placement: static summary fields move into the main content area, the right rail becomes process-only (`Routing` / `Events`), and the PO list purchase-type column is split conceptually into business type plus stage badge. This is a UI information-architecture correction, not a backend workflow rewrite.

**Tech Stack:** Next.js App Router, React 19, TypeScript, shadcn/ui, Tailwind CSS, existing in-file mock state in `app/po-detail-v2/page.tsx`

---

## File Structure

**Modify:** `app/po-detail-v2/page.tsx`
- Remove the `Info` tab from the right-side panel.
- Move the important static fields now rendered in the `Info` tab into top-of-page summary sections inside the main content column.
- Keep the right-side panel focused on process-only information (`Routing`, `Events`).
- Preserve current PO detail mock behavior and tab content.

**Modify:** `app/purchase/po/page.tsx`
- Update the `purchaseType` table column so the base badge stays business-oriented (`Standard Purchase` / `Factory Direct`).
- Replace the red `Missing FG warehouse` badge with a stage badge like `Pending Vendor` where applicable.

**Verify:** `app/purchase/po/[id]/page.tsx`
- Read-only verification step to ensure there is no second purchase-detail page that also needs the same list/detail semantics.

**Test/Verify:** no dedicated test file exists currently for these mock-heavy pages; verification is via lint plus manual UI inspection.

---

### Task 1: Fix PO list purchase-type semantics

**Files:**
- Modify: `app/purchase/po/page.tsx:1461-1508`
- Verify: `app/purchase/po/[id]/page.tsx`

- [ ] **Step 1: Read the current purchase-type cell logic and identify the stage badge branch**

Read and confirm the current structure:

```tsx
const isFactoryDirect = row.purchaseType === "FACTORY_DIRECT"
const missingFgWarehouse = isFactoryDirect && row.fulfillmentRoute === "VIA_FG" && !row.vendorFgWarehouseName
```

Expected finding:
- The base type badge already says `Factory Direct`.
- The incorrect part is the extra red badge `Missing FG warehouse`.

- [ ] **Step 2: Change the stage badge from technical cause to business stage**

Update the conditional badge logic from this:

```tsx
{missingFgWarehouse && (
  <Badge variant="outline" className="border-red-200 bg-red-50 text-[10px] text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
    Missing FG warehouse
  </Badge>
)}
```

To this shape:

```tsx
{missingFgWarehouse && (
  <Badge
    variant="outline"
    className="border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
  >
    Pending Vendor
  </Badge>
)}
```

Requirement:
- Keep `Factory Direct` as the type badge.
- Use `Pending Vendor` as the stage badge.
- Remove red/error semantics because this is a normal business step, not an exception.

- [ ] **Step 3: Verify no other list cell uses the same bad wording**

Run a targeted search command:

```bash
grep -n "Missing FG warehouse\|缺少供应商仓库\|Pending Vendor" "app/purchase/po/page.tsx"
```

Expected:
- No remaining user-facing `Missing FG warehouse` in the PO list purchase-type cell.
- `Pending Vendor` appears in the intended location.

- [ ] **Step 4: Commit the list-page semantic fix**

```bash
git add app/purchase/po/page.tsx
git commit -m "refactor: show business stage for factory-direct PO list"
```

---

### Task 2: Remove the right-side Info tab from PO detail

**Files:**
- Modify: `app/po-detail-v2/page.tsx`

- [ ] **Step 1: Locate the right-side tab definition and identify `Info` trigger/content blocks**

Read the tab setup and confirm there are three triggers today:

```tsx
<TabsTrigger value="routing">Routing</TabsTrigger>
<TabsTrigger value="events">Events</TabsTrigger>
<TabsTrigger value="info">Info</TabsTrigger>
```

Expected finding:
- There is a full `TabsContent value="info"` block further down containing static order info, supplier address, receiving address, terms, and logistics summary.

- [ ] **Step 2: Remove the `Info` trigger from the right rail**

Change the trigger set so it becomes process-only:

```tsx
<TabsTrigger value="routing">Routing</TabsTrigger>
<TabsTrigger value="events">Events</TabsTrigger>
```

Requirement:
- Keep the right rail as process/history only.
- Do not leave an empty third slot in the tab list; adjust grid classes if needed.

- [ ] **Step 3: Remove the `TabsContent value="info"` block from the right rail**

Delete the static-info content block entirely from the aside tabs.

Requirement:
- Remove the duplicated static order-detail rendering from the right rail.
- Preserve `Routing` and `Events` behavior untouched.

- [ ] **Step 4: Run a search to ensure no dangling `value="info"` remains**

Run:

```bash
grep -n 'value="info"\|>Info<' "app/po-detail-v2/page.tsx"
```

Expected:
- No remaining `Info` side-tab definitions in the detail page.

- [ ] **Step 5: Commit the right-rail cleanup**

```bash
git add app/po-detail-v2/page.tsx
git commit -m "refactor: keep PO detail side rail process-focused"
```

---

### Task 3: Move key static PO info into the main content summary area

**Files:**
- Modify: `app/po-detail-v2/page.tsx`

- [ ] **Step 1: Define the top summary groups to migrate from the old Info tab**

Use these four groups only; do not recreate the full giant info panel:

```text
1. Basic Summary
   - PO Number
   - Original PO
   - Reference
   - Data Source
   - Related PRs

2. Supplier Summary
   - Supplier
   - Supplier Code
   - Contact
   - Phone

3. Receiving Summary
   - Warehouse
   - Warehouse Code
   - Receiving Address

4. Terms / Fulfillment Summary
   - Expected Arrival
   - Latest Shipping Time
   - Shipping Method
   - Delivery Terms
   - Payment Terms
   - Shipment count / Receipt count / shipped qty / received qty
```

Constraint:
- This is a summary strip / grouped summary section, not a full form-like dump.

- [ ] **Step 2: Insert a new summary section in the main content column above the business tabs**

Add a compact summary section before:

```tsx
<Tabs value={activeMainTab} onValueChange={setActiveMainTab}>
```

Recommended structure:

```tsx
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  <Card>{/* Basic Summary */}</Card>
  <Card>{/* Supplier Summary */}</Card>
  <Card>{/* Receiving Summary */}</Card>
  <Card>{/* Terms / Fulfillment Summary */}</Card>
</div>
```

Implementation rules:
- Reuse the existing `mockPODetail` / `poData` fields already rendered in the deleted `Info` tab.
- Show only the highest-value fields from each group.
- Keep field labels compact.
- Keep cards readable at common laptop widths.

- [ ] **Step 3: Move Related PRs into the Basic Summary card instead of a long right-rail block**

Render them as compact badges or chips:

```tsx
<div className="flex flex-wrap gap-1">
  {mockPODetail.relatedPRs.map((prNo) => (
    <Badge key={prNo} variant="outline">{prNo}</Badge>
  ))}
</div>
```

Requirement:
- Related PRs remain visible without requiring a tab switch.

- [ ] **Step 4: Keep addresses concise**

Do not recreate large address cards with excess spacing. Render addresses as short summary content, for example:

```tsx
<div className="space-y-1 text-xs text-muted-foreground">
  <div className="font-medium text-foreground">{mockPODetail.warehouseName}</div>
  <div>Code: {mockPODetail.warehouseCode}</div>
  <div>{mockPODetail.warehouseAddress}</div>
</div>
```

Requirement:
- Users should be able to scan key destination/supplier information in seconds.

- [ ] **Step 5: Keep shipment / receipt summary in the summary section, not the side rail**

Render only the compact totals:

```tsx
<div className="grid grid-cols-2 gap-2 text-xs">
  <div>Shipments: {mockPODetail.shipmentRecords.length}</div>
  <div>Receipts: {mockPODetail.receiptRecords.length}</div>
  <div>Shipped: {mockPODetail.shippedQty}</div>
  <div>Received: {mockPODetail.receivedQty}</div>
</div>
```

Requirement:
- Preserve quick fulfillment visibility on the main page.

- [ ] **Step 6: Commit the summary migration**

```bash
git add app/po-detail-v2/page.tsx
git commit -m "refactor: move static PO info into main summary area"
```

---

### Task 4: Verify layout integrity and interaction flow

**Files:**
- Modify: `app/po-detail-v2/page.tsx` (if final polish is required)
- Verify: `app/purchase/po/page.tsx`

- [ ] **Step 1: Run lint after all UI changes**

Run:

```bash
pnpm lint
```

Expected:
- Command exits successfully.
- Existing repo warnings may remain, but no new errors are introduced.

- [ ] **Step 2: Manually verify the PO detail page flow in the browser**

Check these behaviors:

```text
1. Header shows PO number, status, type, current-stage label, and primary action.
2. The main column now shows summary cards before the tabs.
3. The right rail has only Routing and Events.
4. No static Info tab remains.
5. Supply Allocation unallocated state still uses the single top-right CTA and light empty state.
6. Allocated SAO detail still renders correctly after the summary changes.
```

Expected:
- Users can identify the order and next action without switching side tabs.

- [ ] **Step 3: Manually verify the PO list purchase-type column**

Check these rows:

```text
1. Standard purchase row -> shows only Standard Purchase.
2. Factory-direct row with pending vendor state -> shows Factory Direct + Pending Vendor.
3. Factory-direct row after allocation -> shows Factory Direct + Allocated/Released if available.
```

Expected:
- The list no longer uses technical wording like `Missing FG warehouse` as the visible business label.

- [ ] **Step 4: Commit final verification-safe polish if needed**

```bash
git add app/po-detail-v2/page.tsx app/purchase/po/page.tsx
git commit -m "refactor: clarify PO detail summary and factory-direct stage labels"
```

---

## Self-Review

### Spec coverage
- PO detail right rail becomes process-only: covered by Task 2.
- Static Info moves into main summary: covered by Task 3.
- PO list business type vs stage semantics: covered by Task 1.
- Manual verification of the end-to-end interaction model: covered by Task 4.

### Placeholder scan
- No TBD/TODO placeholders remain.
- Every task lists concrete files, code targets, and verification commands.

### Type consistency
- Uses existing `poData`, `mockPODetail`, and `purchaseType` terms consistently.
- `Pending Vendor` is treated as a stage badge, not a replacement for the `Factory Direct` purchase type.
