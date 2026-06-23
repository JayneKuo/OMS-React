# SAO / RN Revision Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the Allocate Supply dialog secondary action to Cancel and make the PO detail experience clearly route RN reallocation-type changes back through Supply Allocation revision.

**Architecture:** Keep the existing PO detail page and document-generation logic intact. Implement this as a focused UI/content change inside `app/po-detail-v2/page.tsx`: one footer button label update in the allocation dialog, plus concise RN-origin messaging near the generated target-RN / SAO detail areas so users understand that allocation-result changes must go through `Revise Allocation` rather than direct RN editing.

**Tech Stack:** Next.js App Router, React 19, TypeScript, shadcn/ui, Tailwind CSS

---

### Task 1: Update Allocate Supply dialog footer wording

**Files:**
- Modify: `app/po-detail-v2/page.tsx`
- Test: `app/po-detail-v2/page.tsx`

- [ ] **Step 1: Read the Allocate Supply dialog footer block**

Locate the footer under the `showSupplyAllocationDialog` dialog. It currently renders the secondary action as `Save Draft` and the primary action as `Generate Vendor PO / SO`.

Expected block to update:

```tsx
<DialogFooter>
  <Button variant="outline" onClick={() => setShowSupplyAllocationDialog(false)}>
    {tf("Save Draft", "保存草稿")}
  </Button>
  <Button onClick={handleGenerateAllocation}>
    {tf("Generate Vendor PO / SO", "生成 Vendor PO / SO")}
  </Button>
</DialogFooter>
```

- [ ] **Step 2: Change the secondary action label to Cancel**

Replace the secondary button text only. Do not change button behavior or the primary action.

```tsx
<DialogFooter>
  <Button variant="outline" onClick={() => setShowSupplyAllocationDialog(false)}>
    {tf("Cancel", "取消")}
  </Button>
  <Button onClick={handleGenerateAllocation}>
    {tf("Generate Vendor PO / SO", "生成 Vendor PO / SO")}
  </Button>
</DialogFooter>
```

- [ ] **Step 3: Run lint for the modified file**

Run:

```bash
pnpm exec eslint "app/po-detail-v2/page.tsx"
```

Expected: command exits successfully with no lint errors for `app/po-detail-v2/page.tsx`.

### Task 2: Add RN-origin messaging to the SAO detail flow

**Files:**
- Modify: `app/po-detail-v2/page.tsx`
- Test: `app/po-detail-v2/page.tsx`

- [ ] **Step 1: Locate the Supply Allocation Order right-side detail panel**

Find the selected allocation detail branch inside the `TabsContent value="supply-allocation"` section. The message should live in the right-side detail content, close to the allocation summary / related-documents area, so users see it while reviewing the generated chain.

Relevant structure to keep intact:

```tsx
<TabsContent value="supply-allocation" className="mt-4">
  <Card>
    <CardContent className="p-0">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t">
        <div className="md:col-span-1 border-r">...</div>
        <div className="md:col-span-3">
          {selectedAllocationOrder && (() => {
            const order = poData.supplyAllocationOrders.find(item => item.id === selectedAllocationOrder)
            if (!order) return null
            // selected order detail content
          })()}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

- [ ] **Step 2: Insert a concise RN-origin guidance block in the selected allocation detail**

Add one compact bordered guidance block after the fulfillment chain and before the summary cards, or directly above the related-documents section if that reads better in the current file. Use the existing `tf()` bilingual pattern.

Code to add:

```tsx
<div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
  <div className="font-medium">{tf("RN is generated from Supply Allocation", "RN 由 Supply Allocation 生成")}</div>
  <div className="mt-1 text-xs text-amber-800/90">
    {tf(
      "To change warehouse, qty, vendor split, or routing, revise the allocation plan instead of editing RN directly.",
      "如需修改目标仓、数量、vendor 分配或路径，请返回分配方案修订，而不是直接编辑 RN。"
    )}
  </div>
</div>
```

- [ ] **Step 3: Make the guidance point to the existing action vocabulary**

If the surrounding copy already mentions reallocation, keep the terminology consistent with the current button label `Revise Allocation`. If there is a short nearby caption or helper line, make sure it uses the same wording.

Target wording style:

```tsx
{tf("Use Revise Allocation to rebuild the downstream chain.", "请使用 Revise Allocation 重新生成下游单据链路。")}
```

Only add this line if the section needs it. Do not introduce a new button or new flow.

- [ ] **Step 4: Keep the business behavior unchanged**

Do not modify:

```tsx
openReviseAllocationDialog(order)
handleApplyRevision()
buildGeneratedAllocation(...)
buildGeneratedReceipts(...)
```

The change is explanatory and navigational only.

### Task 3: Add matching RN-origin guidance to the target-RN detail area

**Files:**
- Modify: `app/po-detail-v2/page.tsx`
- Test: `app/po-detail-v2/page.tsx`

- [ ] **Step 1: Identify the Warehouse Receipts right-side detail section for generated target RN records**

Inside the `TabsContent value="receipts"` list-detail layout, locate the right-side selected receipt detail branch. This is where users inspect generated receipts after allocation.

Relevant structure to preserve:

```tsx
<TabsContent value="receipts" className="mt-4">
  <Card>
    <CardContent className="p-0">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t">
        <div className="md:col-span-1 border-r">...</div>
        <div className="md:col-span-3">
          {selectedReceipt && (() => {
            const receipt = poData.receiptRecords.find(r => r.id === selectedReceipt)
            if (!receipt) return null
            // selected receipt detail content
          })()}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

- [ ] **Step 2: Add guidance only for generated supply-allocation receipts**

Insert a conditional message block in the receipt detail for receipts tied to Supply Allocation. The current data already includes `receipt.sourceAllocationNo`, so gate the message on that field.

Code to add:

```tsx
{receipt.sourceAllocationNo && (
  <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
    <div className="font-medium">{tf("This RN comes from Supply Allocation", "该 RN 来自 Supply Allocation")}</div>
    <div className="mt-1 text-xs text-amber-800/90">
      {tf(
        "If you need to change warehouse, qty, vendor split, or routing, go back to Revise Allocation to rebuild the chain.",
        "如果你需要修改目标仓、数量、vendor 分配或路径，请返回 Revise Allocation 重新生成链路。"
      )}
    </div>
  </div>
)}
```

Place it near the top of the receipt detail content so the rule is visible before users assume RN is directly editable.

- [ ] **Step 3: Preserve all existing receipt actions and status rendering**

Do not change current receipt detail behavior such as:

```tsx
setSelectedReceipt(receipt.id)
receipt.receiptStatus
receipt.pushedToWarehouse
Push to Warehouse button
Download button
```

The message should clarify the product rule without removing valid receipt-execution actions.

### Task 4: Verify the end-to-end UI behavior

**Files:**
- Modify: `app/po-detail-v2/page.tsx`
- Test: `app/po-detail-v2/page.tsx`

- [ ] **Step 1: Run lint for the modified file**

Run:

```bash
pnpm exec eslint "app/po-detail-v2/page.tsx"
```

Expected: exit success, no lint errors for the file.

- [ ] **Step 2: Run TypeScript verification**

Run:

```bash
pnpm exec tsc --noEmit --pretty false
```

Expected: no new errors from `app/po-detail-v2/page.tsx`. Existing failures from unrelated `temp-original-po-detail.tsx` may still appear and should be noted explicitly rather than treated as regressions from this change.

- [ ] **Step 3: Manually verify the Allocate Supply dialog wording**

Open the PO detail page and confirm the allocation dialog footer reads:

- secondary: `Cancel`
- primary: `Generate Vendor PO / SO`

- [ ] **Step 4: Manually verify SAO → RN guidance**

In the PO detail page:

1. Open `Supply Allocation Order`
2. Select an allocation
3. Confirm the detail panel explains that RN is generated from Supply Allocation and allocation-result changes must go through `Revise Allocation`
4. Open the related Warehouse Receipt detail
5. Confirm the generated RN view repeats the same rule when `sourceAllocationNo` exists

- [ ] **Step 5: Leave business logic untouched**

Re-check that the flow still routes through the existing functions and actions:

```tsx
openReviseAllocationDialog(order)
handleApplyRevision()
handleGenerateAllocation()
```

No new edit flow for RN should exist after this change.
