import type { OmsProductMapping, WarehouseTargetOption } from "@/lib/automation/mapping/types"

export interface AutoMatchSuggestion {
  mappingId: string
  omsProductCode: string
  omsProductName: string
  /** Warehouse targets matched but not yet in this mapping */
  newWarehouseTargets: WarehouseTargetOption[]
}

function nameMatches(productName: string, itemName: string): boolean {
  const a = productName.toLowerCase()
  const b = itemName.toLowerCase()
  return b.includes(a) || a.includes(b)
}

export function buildAutoMatchSuggestions(
  mappings: OmsProductMapping[],
  warehouseTargets: WarehouseTargetOption[]
): AutoMatchSuggestion[] {
  const suggestions: AutoMatchSuggestion[] = []

  for (const mapping of mappings) {
    const existingWhSkus = new Set(mapping.warehouseMappings.map((wm) => wm.id))

    const matched = warehouseTargets.filter(
      (target) =>
        nameMatches(mapping.omsProductName, target.itemName) &&
        !existingWhSkus.has(target.id) &&
        !mapping.warehouseMappings.some(
          (wm) => wm.warehouse === target.warehouse && wm.warehouseSku === target.warehouseSku
        )
    )

    if (matched.length > 0) {
      suggestions.push({
        mappingId: mapping.id,
        omsProductCode: mapping.omsProductCode,
        omsProductName: mapping.omsProductName,
        newWarehouseTargets: matched,
      })
    }
  }

  return suggestions
}
