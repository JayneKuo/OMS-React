"use client"

import * as React from "react"
import { CheckCircle2, Clock, GitCommit, Plus, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { SalesOrderMappingConflictBadge } from "@/components/automation/sales-order-mapping-conflict-badge"
import { createEmptyChannelMapping, createEmptyWarehouseMapping } from "@/lib/automation/mapping/use-mapping-management"
import { validateOmsProductMapping } from "@/lib/automation/mapping/validation"
import { useI18n } from "@/lib/i18n"
import type { MappingChangeRecord, MappingOptions, OmsProductMapping, OmsProductMappingDraft, WarehouseSkuMapping } from "@/lib/automation/mapping/types"

interface SalesOrderMappingDialogProps {
  open: boolean
  draft: OmsProductMappingDraft | null
  options: MappingOptions
  mappings: OmsProductMapping[]
  onOpenChange: (open: boolean) => void
  onSave: (draft: OmsProductMappingDraft) => void
}

// Tag input: comma or Enter to add, Backspace to remove last
function SkuTagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const trimmed = raw.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput("")
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleBlur = () => {
    if (input.trim()) {
      addTag(input)
    }
  }

  return (
    <div
      className="flex min-h-9 w-full flex-wrap gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            className="ml-0.5 rounded hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  )
}

function WarehouseRow({
  wh,
  index,
  options,
  onChange,
  onRemove,
  t,
}: {
  wh: WarehouseSkuMapping
  index: number
  options: MappingOptions
  onChange: (next: WarehouseSkuMapping) => void
  onRemove: () => void
  t: (key: never) => string
}) {
  const applyTarget = (targetId: string) => {
    const target = options.warehouseTargets.find((item) => item.id === targetId)
    if (!target) return
    onChange({
      ...wh,
      warehouse: target.warehouse,
      warehouseSku: target.warehouseSku,
      itemMasterId: target.itemMasterId,
      itemCode: target.itemCode,
      itemName: target.itemName,
    })
  }

  const selectedTargetId =
    options.warehouseTargets.find(
      (t) => t.warehouse === wh.warehouse && t.warehouseSku === wh.warehouseSku && t.itemCode === wh.itemCode
    )?.id ?? ""

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{t("mappingWarehouseRow" as never)} {index + 1}</Badge>
        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Select value={selectedTargetId} onValueChange={applyTarget}>
        <SelectTrigger>
          <SelectValue placeholder={t("mappingSelectWarehouseTarget" as never)} />
        </SelectTrigger>
        <SelectContent>
          {options.warehouseTargets.map((target) => (
            <SelectItem key={target.id} value={target.id}>
              {target.warehouse} · {target.warehouseSku} · {target.itemCode}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="grid gap-3 md:grid-cols-2">
        <Input value={wh.warehouse} readOnly placeholder={t("mappingWarehouse" as never)} />
        <Input value={wh.warehouseSku} readOnly placeholder={t("mappingWarehouseSku" as never)} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input value={wh.itemCode} readOnly placeholder={t("mappingItemCode" as never)} />
        <Input value={wh.itemMasterId} readOnly placeholder={t("mappingItemMasterId" as never)} />
      </div>
      <Input value={wh.itemName} readOnly placeholder={t("mappingItemName" as never)} />
      <div className="flex items-center justify-between rounded-lg border px-3 py-3">
        <div>
          <p className="text-sm font-medium">{t("mappingWarehouseEnabled" as never)}</p>
          <p className="text-xs text-muted-foreground">{t("mappingWarehouseEnabledDesc" as never)}</p>
        </div>
        <Switch
          checked={wh.enabled}
          onCheckedChange={(checked) => onChange({ ...wh, enabled: checked })}
        />
      </div>
    </div>
  )
}

function actionIcon(action: MappingChangeRecord["entries"][0]["action"]) {
  if (action === "created" || action === "added") return <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
  if (action === "removed") return <Trash2 className="h-3 w-3 text-red-400 shrink-0 mt-0.5" />
  return <GitCommit className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
}

function ChangeHistorySection({ history, t }: { history: MappingChangeRecord[]; t: (key: never) => string }) {
  const sorted = [...history].reverse()

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold">{t("mappingHistoryTitle" as never)}</h3>
      </div>
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
          {t("mappingHistoryEmpty" as never)}
        </div>
      ) : (
        <ol className="relative border-l border-border ml-2 space-y-4">
          {sorted.map((record) => (
            <li key={record.id} className="ml-4">
              <span className="absolute -left-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full border border-border bg-background">
                <Clock className="h-2 w-2 text-muted-foreground" />
              </span>
              <div className="rounded-lg border bg-muted/30 px-3 py-2.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {record.action === "created"
                      ? t("mappingHistoryActionCreated" as never)
                      : t("mappingHistoryActionUpdated" as never)}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{record.operator}</span>
                    <span>·</span>
                    <span>{record.timestamp}</span>
                  </div>
                </div>
                <ul className="space-y-1">
                  {record.entries.map((entry, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      {actionIcon(entry.action)}
                      <span>{entry.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

export function SalesOrderMappingDialog({
  open,
  draft,
  options,
  mappings,
  onOpenChange,
  onSave,
}: SalesOrderMappingDialogProps) {
  const { t } = useI18n()
  const [localDraft, setLocalDraft] = React.useState<OmsProductMappingDraft | null>(draft)
  const [saveIssues, setSaveIssues] = React.useState<ReturnType<typeof validateOmsProductMapping>>([])

  React.useEffect(() => {
    setLocalDraft(draft)
    setSaveIssues([])
  }, [draft])

  const availableOmsProducts = React.useMemo(
    () =>
      options.omsProducts.filter(
        (product) =>
          product.id === localDraft?.omsProductId ||
          !mappings.some((mapping) => mapping.id !== localDraft?.id && mapping.omsProductId === product.id)
      ),
    [localDraft?.id, localDraft?.omsProductId, mappings, options.omsProducts]
  )

  const applyOmsProduct = (productId: string) => {
    const product = options.omsProducts.find((item) => item.id === productId)
    if (!product || !localDraft) return
    setLocalDraft({
      ...localDraft,
      omsProductId: product.id,
      omsProductCode: product.code,
      omsProductName: product.name,
    })
  }

  const updateChannelMapping = (id: string, patch: Partial<OmsProductMappingDraft["channelMappings"][number]>) => {
    if (!localDraft) return
    setLocalDraft({
      ...localDraft,
      channelMappings: localDraft.channelMappings.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    })
  }

  const removeChannelMapping = (id: string) => {
    if (!localDraft) return
    setLocalDraft({
      ...localDraft,
      channelMappings: localDraft.channelMappings.filter((item) => item.id !== id),
    })
  }

  const updateWarehouseMapping = (id: string, next: WarehouseSkuMapping) => {
    if (!localDraft) return
    setLocalDraft({
      ...localDraft,
      warehouseMappings: localDraft.warehouseMappings.map((item) => (item.id === id ? next : item)),
    })
  }

  const removeWarehouseMapping = (id: string) => {
    if (!localDraft) return
    setLocalDraft({
      ...localDraft,
      warehouseMappings: localDraft.warehouseMappings.filter((item) => item.id !== id),
    })
  }

  const getIssueLabel = (code: string) => {
    switch (code) {
      case "PRODUCT_CODE_REQUIRED":
        return t("mappingIssueProductCodeRequired" as never)
      case "PRODUCT_NAME_REQUIRED":
        return t("mappingIssueProductNameRequired" as never)
      case "OMS_PRODUCT_ASSIGNED":
        return t("mappingIssueOmsProductAssigned" as never)
      case "CHANNEL_ROW_REQUIRED":
        return t("mappingIssueChannelRequired" as never)
      case "DUPLICATE_CHANNEL_IN_PRODUCT":
        return t("mappingIssueDuplicateChannelInProduct" as never)
      case "CHANNEL_ASSIGNED_ELSEWHERE":
        return t("mappingIssueChannelAssignedElsewhere" as never)
      case "WAREHOUSE_REQUIRED":
        return t("mappingIssueWarehouseRequired" as never)
      case "DUPLICATE_WAREHOUSE_IN_PRODUCT":
        return t("mappingIssueDuplicateWarehouseInProduct" as never)
      default:
        return code
    }
  }

  const validationState = React.useMemo(() => {
    if (!localDraft) return "unmapped"
    if (saveIssues.length > 0) return "invalid"
    const hasChannel = localDraft.channelMappings.length > 0
    const hasWarehouse = localDraft.warehouseMappings.length > 0
    if (hasChannel && hasWarehouse) return "complete"
    if (hasChannel || hasWarehouse) return "partial"
    return "unmapped"
  }, [saveIssues, localDraft])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[800px] flex-col gap-0 p-0">
        <DialogHeader className="space-y-2 border-b px-6 py-5 text-left">
          <DialogTitle>{t("mappingDrawerTitle" as never)}</DialogTitle>
          <DialogDescription>{t("mappingDrawerDescription" as never)}</DialogDescription>
        </DialogHeader>

        {!localDraft ? null : (
          <>
            <ScrollArea className="flex-1 overflow-auto">
              <div className="space-y-6 px-6 py-5">
                {/* Product */}
                <section className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">{t("mappingSectionProduct" as never)}</h3>
                    <p className="text-xs text-muted-foreground">{t("mappingSectionProductDesc" as never)}</p>
                  </div>
                  <Select value={localDraft.omsProductId || ""} onValueChange={applyOmsProduct}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("mappingSelectOmsProduct" as never)} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOmsProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.code} · {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={localDraft.omsProductCode} readOnly placeholder={t("mappingOmsProductCode" as never)} />
                    <Input value={localDraft.omsProductName} readOnly placeholder={t("mappingOmsProductName" as never)} />
                  </div>
                </section>

                <Separator />

                {/* Channel Mappings */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{t("mappingSectionChannels" as never)}</h3>
                      <p className="text-xs text-muted-foreground">{t("mappingSectionChannelsDesc" as never)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLocalDraft({
                          ...localDraft,
                          channelMappings: [...localDraft.channelMappings, createEmptyChannelMapping()],
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("mappingAddChannel" as never)}
                    </Button>
                  </div>

                  {localDraft.channelMappings.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                      {t("mappingChannelsEmpty" as never)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localDraft.channelMappings.map((channelMapping, index) => {
                        const authorizedStores = options.authorizedStores[channelMapping.channel] ?? []
                        const storeOptions = authorizedStores.map((s) => ({ value: s, label: s }))
                        const isAuthorized = authorizedStores.length > 0

                        return (
                          <div key={channelMapping.id} className="rounded-xl border p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <Badge variant="secondary">
                                {t("mappingChannelRow" as never)} {index + 1}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeChannelMapping(channelMapping.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              <Select
                                value={channelMapping.channel || ""}
                                onValueChange={(value) =>
                                  updateChannelMapping(channelMapping.id, { channel: value, store: "" })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={t("mappingChannel" as never)} />
                                </SelectTrigger>
                                <SelectContent>
                                  {options.channels.map((channel) => (
                                    <SelectItem key={channel} value={channel}>
                                      {channel}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {isAuthorized ? (
                                <Combobox
                                  options={storeOptions}
                                  value={channelMapping.store}
                                  onValueChange={(value) => updateChannelMapping(channelMapping.id, { store: value })}
                                  placeholder={t("mappingStore" as never)}
                                  searchPlaceholder={t("mappingStoreSearch" as never)}
                                  emptyText={t("mappingStoreEmpty" as never)}
                                  allowCustom={false}
                                />
                              ) : (
                                <Input
                                  value={channelMapping.store}
                                  onChange={(e) => updateChannelMapping(channelMapping.id, { store: e.target.value })}
                                  placeholder={t("mappingStore" as never)}
                                />
                              )}
                            </div>
                            <div className="mt-3">
                              <SkuTagInput
                                value={channelMapping.channelSkus}
                                onChange={(skus) => updateChannelMapping(channelMapping.id, { channelSkus: skus })}
                                placeholder={t("mappingChannelSkuHint" as never)}
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between rounded-lg border px-3 py-3">
                              <div>
                                <p className="text-sm font-medium">{t("mappingChannelEnabled" as never)}</p>
                                <p className="text-xs text-muted-foreground">{t("mappingChannelEnabledDesc" as never)}</p>
                              </div>
                              <Switch
                                checked={channelMapping.enabled}
                                onCheckedChange={(checked) => updateChannelMapping(channelMapping.id, { enabled: checked })}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>

                <Separator />

                {/* Warehouse Mappings */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{t("mappingSectionWarehouse" as never)}</h3>
                      <p className="text-xs text-muted-foreground">{t("mappingSectionWarehouseDesc" as never)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLocalDraft({
                          ...localDraft,
                          warehouseMappings: [...localDraft.warehouseMappings, createEmptyWarehouseMapping()],
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t("mappingAddWarehouse" as never)}
                    </Button>
                  </div>

                  {localDraft.warehouseMappings.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                      {t("mappingWarehouseEmpty" as never)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {localDraft.warehouseMappings.map((wh, index) => (
                        <WarehouseRow
                          key={wh.id}
                          wh={wh}
                          index={index}
                          options={options}
                          onChange={(next) => updateWarehouseMapping(wh.id, next)}
                          onRemove={() => removeWarehouseMapping(wh.id)}
                          t={t}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <Separator />

                {/* Notes */}
                <section className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold">{t("notes")}</h3>
                    <p className="text-xs text-muted-foreground">{t("mappingNotesDesc" as never)}</p>
                  </div>
                  <Textarea
                    value={localDraft.notes}
                    onChange={(event) => setLocalDraft({ ...localDraft, notes: event.target.value })}
                    placeholder={t("notes")}
                  />
                </section>

                {saveIssues.length > 0 && (
                  <>
                    <Separator />
                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{t("mappingValidationTitle" as never)}</h3>
                        <SalesOrderMappingConflictBadge state={validationState as never} />
                      </div>
                      {saveIssues.map((issue, index) => (
                        <div key={`${issue.code}-${index}`} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {getIssueLabel(issue.code)}
                        </div>
                      ))}
                    </section>
                  </>
                )}

                <Separator />

                {/* Change History */}
                <ChangeHistorySection
                  history={mappings.find((m) => m.id === localDraft.id)?.changeHistory ?? []}
                  t={t}
                />
              </div>
            </ScrollArea>

            <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t("cancel")}
              </Button>
              <Button
                onClick={() => {
                  if (!localDraft) return
                  const errors = validateOmsProductMapping(localDraft, mappings)
                  setSaveIssues(errors)
                  if (errors.length === 0) onSave(localDraft)
                }}
                disabled={!localDraft}
              >
                <Save className="mr-2 h-4 w-4" />
                {t("mappingSave" as never)}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
