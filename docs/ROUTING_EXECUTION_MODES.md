# Routing Rule Execution Modes

## Overview

The PO Routing system supports three execution modes to handle scenarios where multiple rules match a purchase order. This provides flexibility for different business requirements.

## Execution Modes

### 1. FIRST_MATCH (Default) 🎯

**Behavior:** Stop at the first matching rule

**Use Case:** Simple, deterministic routing where only one rule should apply

**Example Scenario:**
```
Rules:
1. Priority 1: Factory Direct (purchaseType = FACTORY_DIRECT)
2. Priority 2: Supplier A (supplier = Supplier_A)
3. Priority 3: Default Warehouse (all orders)

PO: purchaseType = FACTORY_DIRECT, supplier = Supplier_A

Result: Only Rule 1 applies (Factory Direct workflow)
```

**Advantages:**
- ✅ Simple and predictable
- ✅ Fast evaluation (stops at first match)
- ✅ Easy to understand and debug
- ✅ No conflict resolution needed

**Disadvantages:**
- ❌ Cannot combine multiple rules
- ❌ Rule order is critical

---

### 2. CHAIN Mode 🔗

**Behavior:** Apply all matching rules in sequence, later rules override earlier ones

**Use Case:** Layered configuration where base settings are refined by more specific rules

**Example Scenario:**
```
Rules:
1. Priority 1: Base Factory Direct Settings
   - enableFGStaging: true
   - generateFGReceipt: true
   - generateSaleOrder: true

2. Priority 2: Supplier A Override
   - waitForFGReceipt: true (override)
   - autoCreateFinalReceipt: false (override)

3. Priority 3: High Value Order Override
   - autoCreateFinalReceipt: true (override)

PO: purchaseType = FACTORY_DIRECT, supplier = Supplier_A, amount = $10,000

Result: All three rules apply in sequence
Final Settings:
- enableFGStaging: true (from Rule 1)
- generateFGReceipt: true (from Rule 1)
- generateSaleOrder: true (from Rule 1)
- waitForFGReceipt: true (from Rule 2)
- autoCreateFinalReceipt: true (from Rule 3, overrides Rule 2)
```

**Advantages:**
- ✅ Flexible layered configuration
- ✅ Reusable base rules
- ✅ Specific overrides without duplicating base settings
- ✅ Good for inheritance patterns

**Disadvantages:**
- ❌ More complex to understand
- ❌ Requires careful rule design
- ❌ Override behavior must be well-documented

---

### 3. ALL_MATCH Mode 🎭

**Behavior:** Merge all matching rules, with conflict resolution based on priority

**Use Case:** Additive configuration where multiple rules contribute different aspects

**Example Scenario:**
```
Rules:
1. Priority 1: Factory Direct Base
   - enableFGStaging: true
   - generateFGReceipt: true

2. Priority 2: Supplier Quality Check
   - waitForFGReceipt: true
   - qualityCheckRequired: true

3. Priority 3: Express Shipping
   - expressShipping: true
   - autoCreateFinalReceipt: true

PO: Matches all three rules

Result: Merge all settings
Final Settings:
- enableFGStaging: true (Rule 1)
- generateFGReceipt: true (Rule 1)
- waitForFGReceipt: true (Rule 2)
- qualityCheckRequired: true (Rule 2)
- expressShipping: true (Rule 3)
- autoCreateFinalReceipt: true (Rule 3)

If conflict: Higher priority wins
```

**Advantages:**
- ✅ Maximum flexibility
- ✅ Rules can be independent and focused
- ✅ Easy to add new aspects without modifying existing rules
- ✅ Good for feature flags and additive settings

**Disadvantages:**
- ❌ Most complex to understand
- ❌ Conflict resolution can be tricky
- ❌ Harder to predict final outcome
- ❌ Performance impact (evaluates all rules)

---

## Comparison Table

| Feature | FIRST_MATCH | CHAIN | ALL_MATCH |
|---------|-------------|-------|-----------|
| **Evaluation** | Stop at first match | All matching rules | All matching rules |
| **Application** | Single rule | Sequential override | Merge with priority |
| **Complexity** | Low | Medium | High |
| **Performance** | Fast | Medium | Slower |
| **Predictability** | High | Medium | Low |
| **Flexibility** | Low | High | Highest |
| **Best For** | Simple routing | Layered config | Additive features |

---

## Implementation Recommendations

### Phase 1: Current Implementation
- ✅ Implement **FIRST_MATCH** mode (default)
- ✅ Document the behavior clearly
- ✅ Provide visual indicators in UI

### Phase 2: Future Enhancement
- 🔄 Add **CHAIN** mode support
- 🔄 Add execution mode selector in rule configuration
- 🔄 Add rule simulation/preview feature

### Phase 3: Advanced Features
- 🔄 Add **ALL_MATCH** mode support
- 🔄 Add conflict resolution strategies
- 🔄 Add rule dependency visualization

---

## UI Considerations

### Rule List Display
- Show execution mode badge on each rule
- Highlight which rules would match for a sample PO
- Show final merged configuration in preview

### Rule Editor
- Add execution mode selector (dropdown)
- Show warning if mode conflicts with rule design
- Provide examples for each mode

### Testing Tools
- Rule simulator: Input PO details, see which rules match
- Configuration preview: See final merged settings
- Conflict detector: Highlight potential conflicts

---

## Business Logic Examples

### Example 1: E-commerce Platform
```
Mode: FIRST_MATCH
Rules:
1. VIP Customer → Express warehouse
2. Bulk Order → Distribution center
3. Default → Nearest warehouse
```

### Example 2: Manufacturing
```
Mode: CHAIN
Rules:
1. Base Manufacturing → Standard workflow
2. Custom Product → Add quality check
3. International → Add export compliance
```

### Example 3: Multi-Channel Fulfillment
```
Mode: ALL_MATCH
Rules:
1. Amazon Orders → Amazon-specific settings
2. Fragile Items → Special packaging
3. Cold Chain → Temperature control
```

---

## Migration Path

For existing implementations using FIRST_MATCH:

1. **No Breaking Changes**: Default to FIRST_MATCH
2. **Opt-in**: Users can enable CHAIN or ALL_MATCH per rule
3. **Gradual Adoption**: Test with non-critical rules first
4. **Rollback**: Easy to revert to FIRST_MATCH if issues arise

---

## Related Documentation
- [PO Routing Complete Implementation](./PO_ROUTING_COMPLETE_IMPLEMENTATION.md)
- [Routing Rule Types](../lib/types/routing-rule.ts)
- [PO Routing Final Spec](./PO_ROUTING_FINAL_SPEC.md)
