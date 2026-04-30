"use client"

import * as React from "react"
import { initialMappings, mappingOptions } from "@/lib/automation/mapping/mock-data"
import { applyValidation, buildSummary } from "@/lib/automation/mapping/validation"
import type { ActiveFilter } from "@/components/data-table/filter-bar"
import type { ChannelSkuMapping, MappingChangeRecord, OmsProductMapping, OmsProductMappingDraft, WarehouseSkuMapping } from "@/lib/automation/mapping/types"
import type { AutoMatchSuggestion } from "@/lib/automation/mapping/auto-match"

function nowString() {
  return new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16)
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyChannelMapping(): ChannelSkuMapping {
  return {
    id: createId("channel"),
    channel: "",
    store: "",
    channelSkus: [],
    enabled: true,
  }
}

export function createEmptyWarehouseMapping(): WarehouseSkuMapping {
  return {
    id: createId("wh"),
    warehouse: "",
    warehouseSku: "",
    itemMasterId: "",
    itemCode: "",
    itemName: "",
    enabled: true,
  }
}

function emptyDraft(): OmsProductMappingDraft {
  return {
    omsProductId: "",
    omsProductCode: "",
    omsProductName: "",
    notes: "",
    channelMappings: [],
    warehouseMappings: [],
  }
}

function cloneDraft(mapping: OmsProductMapping): OmsProductMappingDraft {
  return {
    id: mapping.id,
    omsProductId: mapping.omsProductId,
    omsProductCode: mapping.omsProductCode,
    omsProductName: mapping.omsProductName,
    notes: mapping.notes,
    channelMappings: mapping.channelMappings.map((channelMapping) => ({
      ...channelMapping,
      channelSkus: [...channelMapping.channelSkus],
    })),
    warehouseMappings: mapping.warehouseMappings.map((wh) => ({ ...wh })),
  }
}

function buildChangeRecord(
  draft: OmsProductMappingDraft,
  existing: OmsProductMapping | undefined,
  operator: string
): MappingChangeRecord {
  const entries: MappingChangeRecord["entries"] = []

  if (!existing) {
    entries.push({ field: "mapping", action: "created", description: `Created mapping for ${draft.omsProductCode}` })
  } else {
    if (draft.omsProductCode !== existing.omsProductCode) {
      entries.push({ field: "product", action: "modified", description: `Changed product from ${existing.omsProductCode} to ${draft.omsProductCode}` })
    }
    if (draft.notes.trim() !== existing.notes.trim()) {
      entries.push({ field: "notes", action: "modified", description: "Updated notes" })
    }
    for (const nc of draft.channelMappings) {
      const ec = existing.channelMappings.find((c) => c.id === nc.id)
      if (!ec) {
        entries.push({ field: "channel", action: "added", description: `Added channel mapping: ${nc.channel} · ${nc.store}` })
      } else {
        if (ec.enabled !== nc.enabled) {
          entries.push({ field: "channel", action: nc.enabled ? "enabled" : "disabled", description: `${nc.enabled ? "Enabled" : "Disabled"} channel mapping: ${nc.channel} · ${nc.store}` })
        }
        const addedSkus = nc.channelSkus.filter((s) => !ec.channelSkus.includes(s))
        const removedSkus = ec.channelSkus.filter((s) => !nc.channelSkus.includes(s))
        if (addedSkus.length > 0 || removedSkus.length > 0) {
          entries.push({ field: "channel", action: "modified", description: `Updated SKUs for ${nc.channel} · ${nc.store}` })
        }
        if (ec.store !== nc.store) {
          entries.push({ field: "channel", action: "modified", description: `Changed store for ${nc.channel}: ${ec.store} → ${nc.store}` })
        }
      }
    }
    for (const ec of existing.channelMappings) {
      if (!draft.channelMappings.find((nc) => nc.id === ec.id)) {
        entries.push({ field: "channel", action: "removed", description: `Removed channel mapping: ${ec.channel} · ${ec.store}` })
      }
    }
    for (const nw of draft.warehouseMappings) {
      const ew = existing.warehouseMappings.find((w) => w.id === nw.id)
      if (!ew) {
        entries.push({ field: "warehouse", action: "added", description: `Added warehouse mapping: ${nw.warehouse} · ${nw.warehouseSku}` })
      } else {
        if (ew.enabled !== nw.enabled) {
          entries.push({ field: "warehouse", action: nw.enabled ? "enabled" : "disabled", description: `${nw.enabled ? "Enabled" : "Disabled"} warehouse mapping: ${nw.warehouse} · ${nw.warehouseSku}` })
        }
        if (ew.warehouseSku !== nw.warehouseSku || ew.warehouse !== nw.warehouse) {
          entries.push({ field: "warehouse", action: "modified", description: `Changed warehouse target: ${ew.warehouse} · ${ew.warehouseSku} → ${nw.warehouse} · ${nw.warehouseSku}` })
        }
      }
    }
    for (const ew of existing.warehouseMappings) {
      if (!draft.warehouseMappings.find((nw) => nw.id === ew.id)) {
        entries.push({ field: "warehouse", action: "removed", description: `Removed warehouse mapping: ${ew.warehouse} · ${ew.warehouseSku}` })
      }
    }
  }

  return {
    id: createId("chg"),
    timestamp: nowString(),
    operator,
    action: existing ? "updated" : "created",
    entries,
  }
}

export function useMappingManagement() {
  const [mappings, setMappings] = React.useState<OmsProductMapping[]>(() => applyValidation(initialMappings))

  const summary = React.useMemo(() => buildSummary(mappings), [mappings])

  const saveMapping = React.useCallback((draft: OmsProductMappingDraft) => {
    setMappings((current) => {
      const existing = current.find((m) => m.id === draft.id)
      const changeRecord = buildChangeRecord(draft, existing, "Jayne")
      const nextMapping: OmsProductMapping = {
        id: draft.id ?? createId("oms-map"),
        omsProductId: draft.omsProductId || createId("OMS-PROD"),
        omsProductCode: draft.omsProductCode.trim(),
        omsProductName: draft.omsProductName.trim(),
        notes: draft.notes.trim(),
        channelMappings: draft.channelMappings.map((channelMapping) => ({
          ...channelMapping,
          id: channelMapping.id || createId("channel"),
          channel: channelMapping.channel.trim(),
          store: channelMapping.store.trim(),
          channelSkus: channelMapping.channelSkus.map((sku) => sku.trim()).filter(Boolean),
        })),
        warehouseMappings: draft.warehouseMappings.map((wh) => ({
          ...wh,
          id: wh.id || createId("wh"),
          warehouse: wh.warehouse.trim(),
          warehouseSku: wh.warehouseSku.trim(),
          itemMasterId: wh.itemMasterId.trim(),
          itemCode: wh.itemCode.trim(),
          itemName: wh.itemName.trim(),
        })),
        updatedAt: nowString(),
        updatedBy: "Jayne",
        status: "unmapped",
        issues: [],
        changeHistory: [...(existing?.changeHistory ?? []), changeRecord],
      }

      const updatedMappings = current.some((mapping) => mapping.id === nextMapping.id)
        ? current.map((mapping) => (mapping.id === nextMapping.id ? nextMapping : mapping))
        : [nextMapping, ...current]

      return applyValidation(updatedMappings)
    })
  }, [])

  const createMappingDraft = React.useCallback(() => emptyDraft(), [])

  const editMappingDraft = React.useCallback((mapping: OmsProductMapping) => cloneDraft(mapping), [])

  const importMappings = React.useCallback((drafts: OmsProductMappingDraft[]) => {
    setMappings((current) => {
      let next = [...current]
      for (const draft of drafts) {
        const existing = next.find((m) => m.omsProductCode === draft.omsProductCode)
        if (existing) {
          // merge into existing
          const merged: OmsProductMapping = {
            ...existing,
            channelMappings: [
              ...existing.channelMappings,
              ...draft.channelMappings.filter(
                (nc) => !existing.channelMappings.some((ec) => ec.channel === nc.channel && ec.store === nc.store)
              ),
            ],
            warehouseMappings: [
              ...existing.warehouseMappings,
              ...draft.warehouseMappings.filter(
                (nw) => !existing.warehouseMappings.some((ew) => ew.warehouse === nw.warehouse)
              ),
            ],
          }
          next = next.map((m) => (m.id === existing.id ? merged : m))
        } else {
          const changeRecord = buildChangeRecord(draft, undefined, "Jayne")
          next = [
            {
              id: createId("oms-map"),
              omsProductId: createId("OMS-PROD"),
              omsProductCode: draft.omsProductCode,
              omsProductName: draft.omsProductName,
              notes: draft.notes,
              channelMappings: draft.channelMappings.map((cm) => ({ ...cm, id: cm.id || createId("channel") })),
              warehouseMappings: draft.warehouseMappings.map((wh) => ({ ...wh, id: wh.id || createId("wh") })),
              updatedAt: nowString(),
              updatedBy: "Jayne",
              status: "unmapped",
              issues: [],
              changeHistory: [changeRecord],
            },
            ...next,
          ]
        }
      }
      return applyValidation(next)
    })
  }, [])

  const applyAutoMatch = React.useCallback((suggestions: AutoMatchSuggestion[]) => {
    setMappings((current) => {
      let next = [...current]
      for (const suggestion of suggestions) {
        const existing = next.find((m) => m.id === suggestion.mappingId)
        if (!existing) continue

        const addedTargets = suggestion.newWarehouseTargets
        const changeRecord: MappingChangeRecord = {
          id: createId("chg"),
          timestamp: nowString(),
          operator: "Auto Match",
          action: "updated",
          entries: addedTargets.map((t) => ({
            field: "warehouse",
            action: "added",
            description: `Auto-matched warehouse: ${t.warehouse} · ${t.warehouseSku}`,
          })),
        }

        const updated: OmsProductMapping = {
          ...existing,
          warehouseMappings: [
            ...existing.warehouseMappings,
            ...addedTargets.map((t) => ({
              id: createId("wh"),
              warehouse: t.warehouse,
              warehouseSku: t.warehouseSku,
              itemMasterId: t.itemMasterId,
              itemCode: t.itemCode,
              itemName: t.itemName,
              enabled: true,
            })),
          ],
          updatedAt: nowString(),
          updatedBy: "Auto Match",
          changeHistory: [...existing.changeHistory, changeRecord],
        }
        next = next.map((m) => (m.id === existing.id ? updated : m))
      }
      return applyValidation(next)
    })
  }, [])

  return {
    mappings,
    options: mappingOptions,
    summary,
    saveMapping,
    importMappings,
    createMappingDraft,
    editMappingDraft,
    applyAutoMatch,
  }
}

export function filterMappings(mappings: OmsProductMapping[], searchValue: string, activeFilters: ActiveFilter[]) {
  const keyword = searchValue.trim().toLowerCase()

  const filtersById = activeFilters.reduce<Record<string, ActiveFilter[]>>((groups, filter) => {
    groups[filter.filterId] = [...(groups[filter.filterId] ?? []), filter]
    return groups
  }, {})

  return mappings.filter((mapping) => {
    const matchesKeyword =
      keyword.length === 0 ||
      [
        mapping.omsProductId,
        mapping.omsProductCode,
        mapping.omsProductName,
        mapping.notes,
        ...mapping.channelMappings.flatMap((channelMapping) => [
          channelMapping.channel,
          channelMapping.store,
          ...channelMapping.channelSkus,
        ]),
        ...mapping.warehouseMappings.flatMap((wh) => [wh.warehouse, wh.warehouseSku, wh.itemCode, wh.itemName]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)

    const matchesFilters = Object.entries(filtersById).every(([filterId, filters]) => {
      switch (filterId) {
        case "status":
          return filters.some((filter) => mapping.status === filter.optionValue)
        case "channel":
          return filters.some((filter) => mapping.channelMappings.some((channelMapping) => channelMapping.channel === filter.optionValue))
        case "warehouse":
          return filters.some((filter) => mapping.warehouseMappings.some((wh) => wh.warehouse === filter.optionValue))
        default:
          return true
      }
    })

    return matchesKeyword && matchesFilters
  })
}
