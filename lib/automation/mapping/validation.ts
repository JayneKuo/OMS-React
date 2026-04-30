import type {
  ChannelSkuMapping,
  MappingSummary,
  MappingValidationIssue,
  MappingStatus,
  OmsProductMapping,
  OmsProductMappingDraft,
  WarehouseSkuMapping,
} from "@/lib/automation/mapping/types"

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function hasValue(value: string) {
  return normalize(value).length > 0
}

function buildChannelKey(mapping: Pick<ChannelSkuMapping, "channel" | "store">, sku: string) {
  return [mapping.channel, mapping.store, sku].map(normalize).join("::")
}

function isChannelMappingEmpty(mapping: ChannelSkuMapping) {
  return !hasValue(mapping.channel) && !hasValue(mapping.store) && mapping.channelSkus.length === 0
}

export function isChannelMappingComplete(mapping: ChannelSkuMapping) {
  return hasValue(mapping.channel) && hasValue(mapping.store) && mapping.channelSkus.length > 0
}

export function isWarehouseMappingComplete(mapping: WarehouseSkuMapping) {
  return (
    hasValue(mapping.warehouse) &&
    hasValue(mapping.warehouseSku) &&
    hasValue(mapping.itemMasterId) &&
    hasValue(mapping.itemCode) &&
    hasValue(mapping.itemName)
  )
}

export function validateOmsProductMapping(
  draft: OmsProductMappingDraft,
  mappings: OmsProductMapping[]
): MappingValidationIssue[] {
  const issues: MappingValidationIssue[] = []

  if (!hasValue(draft.omsProductCode)) {
    issues.push({ code: "PRODUCT_CODE_REQUIRED", severity: "error" })
  }

  if (!hasValue(draft.omsProductName)) {
    issues.push({ code: "PRODUCT_NAME_REQUIRED", severity: "error" })
  }

  const comparableMappings = mappings.filter((mapping) => mapping.id !== draft.id)

  if (hasValue(draft.omsProductId) && comparableMappings.some((mapping) => mapping.omsProductId === draft.omsProductId)) {
    issues.push({ code: "OMS_PRODUCT_ASSIGNED", severity: "error" })
  }

  const localKeys = new Set<string>()

  for (const mapping of draft.channelMappings) {
    if (isChannelMappingEmpty(mapping)) {
      issues.push({ code: "CHANNEL_ROW_REQUIRED", severity: "error" })
      continue
    }

    if (!isChannelMappingComplete(mapping)) {
      issues.push({ code: "CHANNEL_ROW_REQUIRED", severity: "error" })
      continue
    }

    for (const sku of mapping.channelSkus) {
      const key = buildChannelKey(mapping, sku)
      if (localKeys.has(key)) {
        issues.push({ code: "DUPLICATE_CHANNEL_IN_PRODUCT", severity: "error" })
      } else {
        localKeys.add(key)
      }
    }
  }

  for (const mapping of draft.channelMappings) {
    if (!mapping.enabled || !isChannelMappingComplete(mapping)) {
      continue
    }

    for (const sku of mapping.channelSkus) {
      const key = buildChannelKey(mapping, sku)
      const assignedElsewhere = comparableMappings.some((productMapping) =>
        productMapping.channelMappings.some(
          (channelMapping) =>
            channelMapping.enabled &&
            isChannelMappingComplete(channelMapping) &&
            channelMapping.channelSkus.some((s) => buildChannelKey(channelMapping, s) === key)
        )
      )

      if (assignedElsewhere) {
        issues.push({ code: "CHANNEL_ASSIGNED_ELSEWHERE", severity: "error" })
        break
      }
    }
  }

  const warehouseKeys = new Set<string>()
  for (const wh of draft.warehouseMappings) {
    if (!isWarehouseMappingComplete(wh)) {
      issues.push({ code: "WAREHOUSE_REQUIRED", severity: "error" })
      continue
    }
    const key = normalize(wh.warehouse)
    if (warehouseKeys.has(key)) {
      issues.push({ code: "DUPLICATE_WAREHOUSE_IN_PRODUCT", severity: "error" })
    } else {
      warehouseKeys.add(key)
    }
  }

  return issues
}

export function deriveMappingStatus(
  draft: Pick<OmsProductMappingDraft, "channelMappings" | "warehouseMappings">,
  issues: MappingValidationIssue[]
): MappingStatus {
  if (issues.some((issue) => issue.severity === "error")) {
    return "invalid"
  }

  const activeChannelCount = draft.channelMappings.filter(
    (mapping) => mapping.enabled && isChannelMappingComplete(mapping)
  ).length
  const hasWarehouse = draft.warehouseMappings.some(
    (wh) => wh.enabled && isWarehouseMappingComplete(wh)
  )

  if (activeChannelCount === 0 && !hasWarehouse) {
    return "unmapped"
  }

  if (activeChannelCount > 0 && hasWarehouse) {
    return "complete"
  }

  return "partial"
}

export function applyValidation(mappings: OmsProductMapping[]): OmsProductMapping[] {
  return mappings.map((mapping) => {
    const issues = validateOmsProductMapping(mapping, mappings)

    return {
      ...mapping,
      issues,
      status: deriveMappingStatus(mapping, issues),
    }
  })
}

export function buildSummary(mappings: OmsProductMapping[]): MappingSummary {
  return {
    total: mappings.length,
    complete: mappings.filter((mapping) => mapping.status === "complete").length,
    partial: mappings.filter((mapping) => mapping.status === "partial").length,
    unmapped: mappings.filter((mapping) => mapping.status === "unmapped").length,
    invalid: mappings.filter((mapping) => mapping.status === "invalid").length,
  }
}
