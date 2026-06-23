# Transfer Order Status And Exception Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the transfer order UI so main status and execution-document-creation status are separated, add the new `PROCESSING` main status, and add an Exception tab on the list page.

**Architecture:** Keep the existing transfer order module structure and extend its data model in place. Add one new business-facing status layer for execution document creation, wire it through typed mock data, then update list/detail presentation and filtering logic without introducing backend integration or unrelated refactors.

**Tech Stack:** Next.js App Router, React 19, TypeScript, shadcn/ui, existing DataTable/Badge/Tabs components

---

## File map

- **Modify:** `components/purchase/transfer-order-types.ts`
  - Extend transfer order main status with `PROCESSING`
  - Add execution document creation status type and related fields
- **Modify:** `app/purchase/transfer-orders/page.tsx`
  - Expand mock rows with execution document creation state
  - Add badge mapping, table column, and Exception tab filtering
- **Modify:** `app/purchase/transfer-orders/[id]/page.tsx`
  - Update detail mock data to reflect new status model
- **Modify:** `components/purchase/transfer-order-detail.tsx`
  - Split main status from execution document creation status in the detail UI
  - Adjust button gating to use the new business-facing state

---

### Task 1: Extend transfer order types

**Files:**
- Modify: `components/purchase/transfer-order-types.ts`

- [ ] **Step 1: Add failing type expectations in the existing type file usage targets**

Add these usages mentally as the contract to satisfy in later files:

```ts
const mainStatus: TransferOrderStatus = "PROCESSING"
const creationStatus: ExecutionDocumentCreationStatus = "FAILED"
```

Expected breakage before implementation: TypeScript would reject these values because they do not exist yet.

- [ ] **Step 2: Add the new type definitions**

Update `components/purchase/transfer-order-types.ts` so `TransferOrderStatus` includes `PROCESSING`, and add a new execution-document-creation status type plus fields on `TransferOrder`:

```ts
export type TransferOrderStatus =
  | "DRAFT"
  | "CREATED"
  | "PROCESSING"
  | "INBOUND_AT_SOURCE"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "CLOSED"
  | "VOIDED"
  | "CANCELLED"

export type ExecutionDocumentCreationStatus =
  | "PENDING"
  | "CREATING"
  | "FAILED"
  | "PARTIAL_SUCCESS"
  | "SUCCESS"
  | "CANCELLED"
```

Add these fields to `TransferOrder`:

```ts
executionDocCreationStatus: ExecutionDocumentCreationStatus
executionDocCreationError?: string
executionDocCreatedCount?: number
executionDocTargetCount?: number
executionDocLastUpdatedAt?: string | null
executionDocRetryCount?: number
```

- [ ] **Step 3: Update legacy mapping defaults minimally**

In `legacyToTransferOrder`, set sensible defaults so old data still maps cleanly:

```ts
executionDocCreationStatus: "PENDING",
executionDocCreationError: undefined,
executionDocCreatedCount: 0,
executionDocTargetCount: undefined,
executionDocLastUpdatedAt: null,
executionDocRetryCount: 0,
```

- [ ] **Step 4: Run typecheck-oriented verification through lint**

Run: `pnpm lint -- components/purchase/transfer-order-types.ts`

Expected: no TypeScript or ESLint errors from the updated type file.

- [ ] **Step 5: Commit**

```bash
git add components/purchase/transfer-order-types.ts
git commit -m "feat: extend transfer order status model"
```

---

### Task 2: Update transfer order list data and status presentation

**Files:**
- Modify: `app/purchase/transfer-orders/page.tsx`

- [ ] **Step 1: Make the row type fail until the new field is added**

Update `TransferOrderRow` usage targets so every mock row is expected to provide the new execution-document-creation status:

```ts
interface TransferOrderRow {
  id: string
  transferNo: string
  transferType: TransferOrderType
  status: TransferOrderStatus
  executionDocCreationStatus: ExecutionDocumentCreationStatus
  executionDocCreationError?: string
  fromWarehouseName: string
  fromWarehouseCode: string
  viaWarehouseName?: string
  toWarehouseName: string
  toWarehouseCode: string
  sourceDocumentNo?: string
  totalQty: number
  transferredQty: number
  carrier?: string
  expectedShipDate?: string
  expectedArrivalDate?: string
  createdAt: string
}
```

Expected: all existing mock rows fail typecheck until populated.

- [ ] **Step 2: Import the new status type and expand mock data**

Update imports to include the new type:

```ts
import {
  type TransferOrderStatus,
  type TransferOrderType,
  type ExecutionDocumentCreationStatus,
  TRANSFER_ORDER_TYPE_OPTIONS,
  WAREHOUSE_OPTIONS,
} from "@/components/purchase/transfer-order-types"
```

Populate `mockData` with representative combinations:

```ts
const mockData: TransferOrderRow[] = [
  {
    id: "to-1",
    transferNo: "TO202401150001",
    transferType: "PURCHASE_INBOUND",
    status: "CREATED",
    executionDocCreationStatus: "FAILED",
    executionDocCreationError: "Target inbound document creation failed",
    fromWarehouseName: "Shenzhen Smart Factory Warehouse",
    fromWarehouseCode: "FAC-WH-SZ01",
    viaWarehouseName: "Shenzhen Vendor FG Warehouse",
    toWarehouseName: "Main Warehouse - Los Angeles",
    toWarehouseCode: "WH001",
    sourceDocumentNo: "PO202403150001",
    totalQty: 110,
    transferredQty: 0,
    carrier: "DHL",
    expectedShipDate: "2024-01-20",
    expectedArrivalDate: "2024-02-05",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "to-2",
    transferNo: "TO202401160001",
    transferType: "PURCHASE_INBOUND",
    status: "PROCESSING",
    executionDocCreationStatus: "SUCCESS",
    fromWarehouseName: "Dongguan Factory Warehouse",
    fromWarehouseCode: "FAC-WH-DG01",
    toWarehouseName: "Main Warehouse - Los Angeles",
    toWarehouseCode: "WH001",
    sourceDocumentNo: "PO202403150001",
    totalQty: 40,
    transferredQty: 0,
    carrier: "FedEx",
    expectedArrivalDate: "2024-01-28",
    createdAt: "2024-01-16T08:00:00Z",
  },
  {
    id: "to-3",
    transferNo: "TO202401180001",
    transferType: "WAREHOUSE_TRANSFER",
    status: "IN_TRANSIT",
    executionDocCreationStatus: "SUCCESS",
    fromWarehouseName: "Main Warehouse - Los Angeles",
    fromWarehouseCode: "WH001",
    toWarehouseName: "East Coast Warehouse - New York",
    toWarehouseCode: "WH002",
    totalQty: 200,
    transferredQty: 200,
    carrier: "UPS",
    createdAt: "2024-01-18T14:00:00Z",
  },
  {
    id: "to-4",
    transferNo: "TO202401200001",
    transferType: "REPLENISHMENT",
    status: "DRAFT",
    executionDocCreationStatus: "PENDING",
    fromWarehouseName: "Main Warehouse - Los Angeles",
    fromWarehouseCode: "WH001",
    toWarehouseName: "East Coast Warehouse - New York",
    toWarehouseCode: "WH002",
    totalQty: 50,
    transferredQty: 0,
    createdAt: "2024-01-20T09:15:00Z",
  },
  {
    id: "to-5",
    transferNo: "TO202401220001",
    transferType: "RETURN_TRANSFER",
    status: "CREATED",
    executionDocCreationStatus: "PARTIAL_SUCCESS",
    fromWarehouseName: "East Coast Warehouse - New York",
    fromWarehouseCode: "WH002",
    toWarehouseName: "Main Warehouse - Los Angeles",
    toWarehouseCode: "WH001",
    totalQty: 15,
    transferredQty: 0,
    createdAt: "2024-01-22T11:30:00Z",
  },
]
```

- [ ] **Step 3: Add badge maps for the new status vocabulary**

Extend `statusBadge` with `PROCESSING`:

```ts
PROCESSING: { label: "执行中", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
```

Add a new `executionDocCreationBadge` map:

```ts
const executionDocCreationBadge: Record<ExecutionDocumentCreationStatus, { label: string; className: string }> = {
  PENDING: { label: "待创建", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  CREATING: { label: "创建中", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  FAILED: { label: "创建失败", className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  PARTIAL_SUCCESS: { label: "部分成功", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  SUCCESS: { label: "全部成功", className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  CANCELLED: { label: "已取消", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
}
```

- [ ] **Step 4: Add the Exception tab and filtering logic**

Update the tab filter block inside `filteredData`:

```ts
if (activeTab === "in_transit") data = data.filter((d) => d.status === "IN_TRANSIT")
else if (activeTab === "draft") data = data.filter((d) => d.status === "DRAFT")
else if (activeTab === "completed") data = data.filter((d) => d.status === "RECEIVED" || d.status === "CLOSED")
else if (activeTab === "exception") {
  data = data.filter((d) => ["FAILED", "PARTIAL_SUCCESS"].includes(d.executionDocCreationStatus))
}
```

Add the new tab in the render block:

```tsx
<TabsTrigger value="exception">
  异常
  <Badge variant="secondary" className="ml-2">
    {mockData.filter((d) => ["FAILED", "PARTIAL_SUCCESS"].includes(d.executionDocCreationStatus)).length}
  </Badge>
</TabsTrigger>
```

- [ ] **Step 5: Add the new table column**

Insert a column after main status:

```ts
{
  id: "executionDocCreationStatus",
  header: "执行单据创建状态",
  width: "140px",
  defaultVisible: true,
  cell: (row) => {
    const meta = executionDocCreationBadge[row.executionDocCreationStatus]
    return <Badge className={meta.className}>{meta.label}</Badge>
  },
},
```

- [ ] **Step 6: Run lint on the list page**

Run: `pnpm lint -- app/purchase/transfer-orders/page.tsx`

Expected: no ESLint or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add app/purchase/transfer-orders/page.tsx
git commit -m "feat: add transfer order exception tab"
```

---

### Task 3: Update transfer order detail mock data

**Files:**
- Modify: `app/purchase/transfer-orders/[id]/page.tsx`

- [ ] **Step 1: Make the page mock object fail until it includes the new fields**

Update the mock order contract so it must contain:

```ts
status: "CREATED"
executionDocCreationStatus: "FAILED"
executionDocCreationError: "Target inbound document creation failed"
executionDocCreatedCount: 1
executionDocTargetCount: 3
executionDocLastUpdatedAt: "2024-01-15T11:00:00Z"
executionDocRetryCount: 2
```

Expected: the page object shape is incomplete until the fields are added.

- [ ] **Step 2: Add representative detail mock data**

Update `mockOrder` to include the new fields and use the new main status vocabulary:

```ts
const mockOrder = {
  id: "to-1",
  transferNo: "TO202401150001",
  transferType: "PURCHASE_INBOUND",
  status: "CREATED",
  executionDocCreationStatus: "FAILED",
  executionDocCreationError: "Target inbound document creation failed",
  executionDocCreatedCount: 1,
  executionDocTargetCount: 3,
  executionDocLastUpdatedAt: "2024-01-15T11:00:00Z",
  executionDocRetryCount: 2,
  fromWarehouseName: "Shenzhen Smart Factory Warehouse",
  fromWarehouseCode: "FAC-WH-SZ01",
  viaWarehouseName: "Shenzhen Vendor FG Warehouse",
  viaWarehouseCode: "VFG-SZ01",
  toWarehouseName: "Main Warehouse - Los Angeles",
  toWarehouseCode: "WH001",
  sourceName: "Shenzhen Smart Factory",
  sourceCode: "FAC-SZ01",
  sourceDocumentNo: "PO202403150001",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-16T14:20:00Z",
  pushStatus: "PUSH_FAILED",
  pushMessageId: "msg-12345",
  lastPushedAt: "2024-01-15T11:00:00Z",
  retryCount: 2,
  lines: [
    { lineNo: 1, skuCode: "SKU001", productName: "iPhone 15 Pro", plannedQty: 60, transferredQty: 0, uom: "PCS" },
    { lineNo: 2, skuCode: "SKU002", productName: "MacBook Pro", plannedQty: 50, transferredQty: 0, uom: "PCS" },
  ],
  relatedDocuments: [
    { docNo: "VRN-SZ01-A1", docType: "INBOUND", warehouseName: "Shenzhen Vendor FG Warehouse", warehouseCode: "VFG-SZ01", status: "CREATED", expectedQty: 110 },
    { docNo: "SO-FAC-SZ01-A1", docType: "OUTBOUND", warehouseName: "Shenzhen Vendor FG Warehouse", warehouseCode: "VFG-SZ01", status: "FAILED", expectedQty: 110 },
    { docNo: "RN-PO202403150001", docType: "INBOUND", warehouseName: "Main Warehouse - Los Angeles", warehouseCode: "WH001", status: "NONE", expectedQty: 110 },
  ],
}
```

- [ ] **Step 3: Align the page-level main status badge map**

Replace the old `ALLOCATED` badge definition with `CREATED` and add `PROCESSING`:

```ts
CREATED: { label: "已创建", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
PROCESSING: { label: "执行中", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
```

Keep the rest of the existing status styling consistent.

- [ ] **Step 4: Update the step-index mapping minimally**

Use the new status semantics:

```ts
switch (order.status) {
  case "DRAFT": return -1
  case "CREATED": return 0
  case "PROCESSING": return 1
  case "INBOUND_AT_SOURCE": return 1
  case "IN_TRANSIT": return hasVia ? 2 : 2
  case "RECEIVED":
  case "CLOSED": return steps.length - 1
  default: return -1
}
```

If the UI reads better with `PROCESSING` and `INBOUND_AT_SOURCE` sharing a visual slot, keep the logic simple and explicit rather than over-abstracting it.

- [ ] **Step 5: Run lint on the detail page**

Run: `pnpm lint -- app/purchase/transfer-orders/[id]/page.tsx`

Expected: no ESLint or TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add app/purchase/transfer-orders/[id]/page.tsx
git commit -m "feat: align transfer order detail mock state"
```

---

### Task 4: Update transfer order detail component UI

**Files:**
- Modify: `components/purchase/transfer-order-detail.tsx`

- [ ] **Step 1: Add the new fields to the component contract**

Update the local `TransferOrderStatus` union and `TransferOrder` interface so they match the new model:

```ts
export type TransferOrderStatus = "DRAFT" | "CREATED" | "PROCESSING" | "INBOUND_AT_SOURCE" | "IN_TRANSIT" | "RECEIVED" | "CLOSED" | "VOIDED"
export type ExecutionDocumentCreationStatus = "PENDING" | "CREATING" | "FAILED" | "PARTIAL_SUCCESS" | "SUCCESS" | "CANCELLED"

export interface TransferOrder {
  id: string
  transferNo: string
  status: TransferOrderStatus
  executionDocCreationStatus: ExecutionDocumentCreationStatus
  executionDocCreationError?: string
  executionDocCreatedCount?: number
  executionDocTargetCount?: number
  executionDocLastUpdatedAt?: string | null
  executionDocRetryCount?: number
  fromWarehouseName: string
  fromWarehouseCode: string
  viaWarehouseName?: string
  viaWarehouseCode?: string
  toWarehouseName: string
  toWarehouseCode: string
  sourceName?: string
  sourceCode?: string
  lines: TransferOrderLine[]
  relatedDocuments?: RelatedDocument[]
  sourceInboundNo?: string
  outboundOrderNo?: string
  targetInboundNo?: string
  pushStatus: InboundPushStatus
  pushError?: string
  pushMessageId?: string
  lastPushedAt?: string | null
  retryCount?: number
  createdAt?: string
  canRevise?: boolean
}
```

- [ ] **Step 2: Update the main status and creation-status badge maps**

Revise `statusMeta` to use `CREATED` and `PROCESSING`:

```ts
CREATED: { label: tf("Created", "已创建"), className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
PROCESSING: { label: tf("Processing", "执行中"), className: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400" },
```

Add a new `executionDocCreationMeta` map:

```ts
const executionDocCreationMeta: Record<ExecutionDocumentCreationStatus, { label: string; className: string }> = {
  PENDING: { label: tf("Pending", "待创建"), className: "border-gray-200 bg-gray-50 text-gray-700" },
  CREATING: { label: tf("Creating", "创建中"), className: "border-blue-200 bg-blue-50 text-blue-700" },
  FAILED: { label: tf("Failed", "创建失败"), className: "border-red-200 bg-red-50 text-red-700" },
  PARTIAL_SUCCESS: { label: tf("Partial Success", "部分成功"), className: "border-orange-200 bg-orange-50 text-orange-700" },
  SUCCESS: { label: tf("Success", "全部成功"), className: "border-green-200 bg-green-50 text-green-700" },
  CANCELLED: { label: tf("Cancelled", "已取消"), className: "border-gray-300 bg-gray-100 text-gray-700" },
}
```

- [ ] **Step 3: Separate main status from execution document creation status in the header area**

Keep the main status badge in the header and add a second badge for execution document creation status nearby:

```tsx
<div className="flex items-center gap-3">
  <h3 className="text-xl font-semibold font-mono">{order.transferNo}</h3>
  <Badge className={statusMeta[order.status].className}>{statusMeta[order.status].label}</Badge>
  <Badge variant="outline" className={cn("text-[10px]", executionDocCreationMeta[order.executionDocCreationStatus].className)}>
    {tf("Execution Doc Creation", "执行单据创建")}: {executionDocCreationMeta[order.executionDocCreationStatus].label}
  </Badge>
</div>
```

- [ ] **Step 4: Add a dedicated execution-document-creation detail block**

Insert a compact card or bordered section above the existing push/sync details:

```tsx
<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-sm flex items-center gap-2">
      <FilePlus className="h-4 w-4 text-blue-600" />
      {tf("Execution Document Creation", "执行单据创建状态")}
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-xs">
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{tf("Status", "状态")}:</span>
      <Badge variant="outline" className={cn("text-[10px]", executionDocCreationMeta[order.executionDocCreationStatus].className)}>
        {executionDocCreationMeta[order.executionDocCreationStatus].label}
      </Badge>
    </div>
    {(order.executionDocCreatedCount !== undefined || order.executionDocTargetCount !== undefined) && (
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">{tf("Progress", "创建进度")}:</span>
        <span>{order.executionDocCreatedCount ?? 0}/{order.executionDocTargetCount ?? 0}</span>
      </div>
    )}
    {order.executionDocLastUpdatedAt && (
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">{tf("Last Updated", "最近创建时间")}:</span>
        <span>{new Date(order.executionDocLastUpdatedAt).toLocaleString()}</span>
      </div>
    )}
    {order.executionDocRetryCount !== undefined && order.executionDocRetryCount > 0 && (
      <div className="flex justify-between gap-3">
        <span className="text-muted-foreground">{tf("Retry Count", "重试次数")}:</span>
        <span>{order.executionDocRetryCount}</span>
      </div>
    )}
    {order.executionDocCreationError && (
      <div className="rounded-md border border-red-200 bg-red-50 p-2 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300">
        <div className="font-medium">{tf("Failure Reason", "失败原因")}</div>
        <div className="mt-1">{order.executionDocCreationError}</div>
      </div>
    )}
  </CardContent>
</Card>
```

- [ ] **Step 5: Adjust action gating to follow the new status layer**

Replace the old push-driven booleans with creation-status-driven rules:

```ts
const canCreate = ["PENDING", "CANCELLED", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
const canRetry = ["FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
const canCancel = ["PENDING", "CREATING", "FAILED", "PARTIAL_SUCCESS"].includes(order.executionDocCreationStatus)
```

This keeps button behavior aligned with the business-facing status rather than low-level push wording.

- [ ] **Step 6: Run lint on the detail component**

Run: `pnpm lint -- components/purchase/transfer-order-detail.tsx`

Expected: no ESLint or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add components/purchase/transfer-order-detail.tsx
git commit -m "feat: separate transfer execution document state"
```

---

### Task 5: Verify the UI behavior manually

**Files:**
- Verify: `app/purchase/transfer-orders/page.tsx`
- Verify: `app/purchase/transfer-orders/[id]/page.tsx`

- [ ] **Step 1: Start the dev server**

Run: `pnpm dev`
Expected: Next.js starts successfully and serves the app locally.

- [ ] **Step 2: Open the transfer order list page and verify tabs and columns**

Check:
- The new "异常" tab is visible.
- The new "执行单据创建状态" column is visible.
- Rows with `FAILED` and `PARTIAL_SUCCESS` appear under the Exception tab.
- Draft/in-transit/completed tabs still filter correctly.

Expected: filters and counts match the mock data.

- [ ] **Step 3: Open a transfer order detail page and verify status separation**

Check:
- Main status shows "已创建" independently.
- Execution document creation status shows "创建失败" independently.
- Failure reason and progress values are visible.
- Existing route, line-item, and related-document sections still render.

Expected: users can distinguish main business phase from downstream document-creation outcome at a glance.

- [ ] **Step 4: Run a focused lint pass for all touched files**

Run: `pnpm lint -- app/purchase/transfer-orders/page.tsx app/purchase/transfer-orders/[id]/page.tsx components/purchase/transfer-order-detail.tsx components/purchase/transfer-order-types.ts`

Expected: PASS with no new errors.

- [ ] **Step 5: Commit**

```bash
git add app/purchase/transfer-orders/page.tsx app/purchase/transfer-orders/[id]/page.tsx components/purchase/transfer-order-detail.tsx components/purchase/transfer-order-types.ts
git commit -m "feat: clarify transfer order execution states"
```
