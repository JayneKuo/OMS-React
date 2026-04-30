"use client"

import * as React from "react"
import { CheckCircle2, Info, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n"
import type { AutoMatchSuggestion } from "@/lib/automation/mapping/auto-match"

interface SalesOrderMappingAutoMatchDialogProps {
  open: boolean
  suggestions: AutoMatchSuggestion[]
  onOpenChange: (open: boolean) => void
  onApply: (selected: AutoMatchSuggestion[]) => void
}

export function SalesOrderMappingAutoMatchDialog({
  open,
  suggestions,
  onOpenChange,
  onApply,
}: SalesOrderMappingAutoMatchDialogProps) {
  const { t } = useI18n()
  const [checkedIds, setCheckedIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (open) {
      setCheckedIds(new Set(suggestions.map((s) => s.mappingId)))
    }
  }, [open, suggestions])

  const allChecked = suggestions.length > 0 && checkedIds.size === suggestions.length
  const toggleAll = () =>
    setCheckedIds(allChecked ? new Set() : new Set(suggestions.map((s) => s.mappingId)))

  const toggle = (id: string) =>
    setCheckedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const selectedSuggestions = suggestions.filter((s) => checkedIds.has(s.mappingId))

  const handleApply = () => {
    onApply(selectedSuggestions)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-full max-w-[600px] flex-col gap-0 p-0">
        <DialogHeader className="space-y-2 border-b px-6 py-5 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <DialogTitle>{t("mappingAutoMatchTitle" as never)}</DialogTitle>
          </div>
          <DialogDescription>{t("mappingAutoMatchDescription" as never)}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-6 py-5 space-y-4">
            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Info className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("mappingAutoMatchNoResult" as never)}</p>
              </div>
            ) : (
              <>
                {/* Select all row */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={allChecked}
                    onCheckedChange={toggleAll}
                  />
                  <label htmlFor="select-all" className="text-sm cursor-pointer select-none text-muted-foreground">
                    {t("mappingAutoMatchSelectAll" as never)} ({suggestions.length})
                  </label>
                </div>

                <Separator />

                <div className="space-y-4">
                  {suggestions.map((suggestion) => {
                    const checked = checkedIds.has(suggestion.mappingId)
                    return (
                      <div
                        key={suggestion.mappingId}
                        className={`rounded-xl border p-4 space-y-3 transition-colors cursor-pointer ${
                          checked ? "border-primary/30 bg-primary/5" : "bg-muted/20"
                        }`}
                        onClick={() => toggle(suggestion.mappingId)}
                      >
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggle(suggestion.mappingId)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{suggestion.omsProductCode}</span>
                              <span className="text-xs text-muted-foreground truncate">{suggestion.omsProductName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Matched warehouse targets */}
                        <div className="ml-7 space-y-1.5">
                          <p className="text-xs font-medium text-muted-foreground">
                            {t("mappingAutoMatchNewWarehouse" as never)}
                          </p>
                          {suggestion.newWarehouseTargets.map((target) => (
                            <div
                              key={target.id}
                              className="flex items-center gap-2 rounded-lg bg-background border px-3 py-2"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <Badge variant="secondary" className="text-xs shrink-0">{target.warehouse}</Badge>
                              <span className="font-mono text-xs shrink-0">{target.warehouseSku}</span>
                              <span className="text-muted-foreground text-xs shrink-0">·</span>
                              <span className="font-mono text-xs text-muted-foreground shrink-0">{target.itemCode}</span>
                              <span className="text-muted-foreground text-xs shrink-0">·</span>
                              <span className="text-xs truncate">{target.itemName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {checkedIds.size} / {suggestions.length} selected
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleApply}
              disabled={checkedIds.size === 0}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {(t("mappingAutoMatchApply" as never) as string).replace("{count}", String(checkedIds.size))}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
