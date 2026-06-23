# SAO / RN Revision Flow Design

## Context

In the current PO detail experience, target-warehouse RN is generated as a downstream result of Supply Allocation and vendor fulfillment planning. The user wants two product clarifications:

1. In the `Allocate Supply` dialog, the footer action `Save Draft` should become `Cancel` because this is no longer a draft-oriented flow.
2. When users want to change the target-warehouse RN after PO creation, the product should not treat RN as an independently editable source document for allocation-level changes. Instead, changes to warehouse, quantity, vendor split, or routing should flow back to Supply Allocation revision and rebuild the downstream chain.

The intended outcome is to keep the business model consistent: SAO is the source of truth for fulfillment allocation; RN is a generated result.

## Product Decision

### Core Rule

Target-warehouse RN is **not** the primary editing surface for allocation-result changes.

If the user wants to change any of the following:
- target warehouse
- allocated quantity
- vendor split
- route / whether it goes via FG warehouse
- other fulfillment-plan structure

Then the user must go back to **Supply Allocation / Revise Allocation** and let the system rebuild the downstream documents.

### Why

This keeps the chain consistent:
- Supply Allocation Order
- Vendor Receipt
- Outbound / SO
- Final Receipt / target RN

Allowing direct RN edits for allocation-result fields would create conflicting sources of truth and make the chain difficult to reason about.

## UI Decisions

### 1. Allocate Supply Dialog

In `app/po-detail-v2/page.tsx`:
- Change footer action label from `Save Draft` to `Cancel`
- Keep the primary action as `Generate Vendor PO / SO`

This aligns the dialog with the actual behavior: it is an execution/rebuild flow, not a draft persistence flow.

### 2. RN Behavior Messaging

For target-warehouse RN related UI, the product should clearly state that RN is generated from Supply Allocation.

Recommended copy:
- English: `This RN is generated from Supply Allocation. To change warehouse, qty, or routing, revise the allocation plan instead.`
- Chinese: `该 RN 由 Supply Allocation 生成。如需修改目标仓、数量或路径，请返回分配方案修订。`

### 3. Action Entry Point

Users should be routed toward the existing SAO revision entry point, not a new RN-editing flow.

Preferred action wording:
- `Revise Allocation`
- or `Rebuild from Supply Allocation`

The current preferred action is to keep using `Revise Allocation` for consistency with the rest of the page.

## Scope Boundary

### In Scope

- Change the allocation dialog secondary footer action text from `Save Draft` to `Cancel`
- Add or refine explanatory messaging near RN / SAO detail where helpful
- Make the product rule explicit: RN allocation-result changes must go through SAO revision

### Out of Scope

- A new dedicated RN edit flow
- Direct editing of RN allocation-result fields
- Refactoring the underlying allocation / receipt generation model
- Changing `handleApplyRevision`, generated document logic, or draft structures beyond messaging/navigation affordances

## Data / Workflow Rule

### Allowed Direct RN Changes

For this design, direct RN changes are **not** introduced for allocation-result fields.

If future iterations allow direct RN edits, they must be limited to execution-state or note-like fields that do not change allocation truth, such as:
- remarks
- attachments
- operator notes
- appointment-like execution metadata

### Disallowed Direct RN Changes

These must go back to SAO revision:
- target warehouse
- qty changes affecting allocation result
- vendor reassignment
- route changes
- FG-vs-direct path changes

## Implementation Targets

Primary file:
- `app/po-detail-v2/page.tsx`

Relevant areas:
- `Allocate Supply` dialog footer
- Supply Allocation Order detail / related RN messaging area
- Any existing target-RN detail text that currently implies RN is independently editable

## Verification

1. Open the PO detail page.
2. Open `Allocate Supply` dialog.
3. Verify the secondary footer button reads `Cancel` instead of `Save Draft`.
4. Navigate to Supply Allocation / target RN related detail.
5. Verify the UI communicates that RN is generated from Supply Allocation.
6. Verify the user is still directed to `Revise Allocation` for reallocation-type changes.
7. Run static verification:
   - `pnpm exec eslint "app/po-detail-v2/page.tsx"`
   - `pnpm exec tsc --noEmit --pretty false` and confirm no new `app/po-detail-v2/page.tsx` errors
