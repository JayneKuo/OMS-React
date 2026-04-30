"use client"

import * as React from "react"
import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import type { OmsProductMappingDraft } from "@/lib/automation/mapping/types"

// CSV columns: omsProductCode, channel, store, channelSku, warehouse, warehouseSku
// Multiple rows with the same omsProductCode are merged into one draft

interface CsvRow {
  omsProductCode: string
  channel: string
  store: string
  channelSku: string
  warehouse: string
  warehouseSku: string
}

interface ParseResult {
  rows: CsvRow[]
  error: string | null
}

const CSV_TEMPLATE_HEADERS = "omsProductCode,channel,store,channelSku,warehouse,warehouseSku"
const CSV_TEMPLATE_EXAMPLE = [
  "BAG-CLASSIC-001,Amazon US,US Flagship,AMZ-BLK-001,US-West,UNIS-BAG-BLK-001",
  "BAG-CLASSIC-001,Shopify,DTC Store,SHOP-BLK-001,,",
  "DRESS-FLORAL-002,Shein,Marketplace Store,SHEIN-DRESS-S,EU-Central,UNIS-DRESS-WHT-S",
].join("\n")

function parseCsv(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) {
    return { rows: [], error: "CSV must have a header row and at least one data row." }
  }

  const [headerLine, ...dataLines] = lines
  const headers = headerLine.split(",").map((h) => h.trim().toLowerCase())
  const required = ["omsproductcode", "channel", "store", "channelsku"]
  const missing = required.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return { rows: [], error: `Missing columns: ${missing.join(", ")}` }
  }

  const idx = (name: string) => headers.indexOf(name)

  const rows: CsvRow[] = dataLines.map((line) => {
    const cols = line.split(",").map((c) => c.trim())
    return {
      omsProductCode: cols[idx("omsproductcode")] ?? "",
      channel: cols[idx("channel")] ?? "",
      store: cols[idx("store")] ?? "",
      channelSku: cols[idx("channelsku")] ?? "",
      warehouse: cols[idx("warehouse")] ?? "",
      warehouseSku: cols[idx("warehousesku")] ?? "",
    }
  })

  return { rows, error: null }
}

function buildDraftsFromRows(rows: CsvRow[]): OmsProductMappingDraft[] {
  const byCode = new Map<string, OmsProductMappingDraft>()

  for (const row of rows) {
    if (!row.omsProductCode) continue

    if (!byCode.has(row.omsProductCode)) {
      byCode.set(row.omsProductCode, {
        omsProductId: "",
        omsProductCode: row.omsProductCode,
        omsProductName: row.omsProductCode,
        notes: "",
        channelMappings: [],
        warehouseMappings: [],
      })
    }

    const draft = byCode.get(row.omsProductCode)!

    if (row.channel && row.store) {
      const existing = draft.channelMappings.find(
        (cm) => cm.channel === row.channel && cm.store === row.store
      )
      if (existing) {
        if (row.channelSku && !existing.channelSkus.includes(row.channelSku)) {
          existing.channelSkus.push(row.channelSku)
        }
      } else {
        draft.channelMappings.push({
          id: `import-ch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          channel: row.channel,
          store: row.store,
          channelSkus: row.channelSku ? [row.channelSku] : [],
          enabled: true,
        })
      }
    }

    if (row.warehouse && row.warehouseSku) {
      const alreadyAdded = draft.warehouseMappings.some((wh) => wh.warehouse === row.warehouse)
      if (!alreadyAdded) {
        draft.warehouseMappings.push({
          id: `import-wh-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          warehouse: row.warehouse,
          warehouseSku: row.warehouseSku,
          itemMasterId: "",
          itemCode: "",
          itemName: "",
          enabled: true,
        })
      }
    }
  }

  return Array.from(byCode.values())
}

function downloadTemplate() {
  const content = `${CSV_TEMPLATE_HEADERS}\n${CSV_TEMPLATE_EXAMPLE}`
  const blob = new Blob([content], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "mapping-import-template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

interface SalesOrderMappingImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (drafts: OmsProductMappingDraft[]) => void
}

export function SalesOrderMappingImportDialog({
  open,
  onOpenChange,
  onImport,
}: SalesOrderMappingImportDialogProps) {
  const { t } = useI18n()
  const [parseResult, setParseResult] = React.useState<ParseResult | null>(null)
  const [drafts, setDrafts] = React.useState<OmsProductMappingDraft[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) {
      setParseResult(null)
      setDrafts([])
    }
  }, [open])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const result = parseCsv(text)
      setParseResult(result)
      if (!result.error) {
        setDrafts(buildDraftsFromRows(result.rows))
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleConfirm = () => {
    onImport(drafts)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[760px] flex-col gap-0 p-0">
        <DialogHeader className="space-y-2 border-b px-6 py-5 text-left">
          <DialogTitle>{t("mappingImportTitle" as never)}</DialogTitle>
          <DialogDescription>{t("mappingImportDescription" as never)}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="space-y-5 px-6 py-5">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                {t("mappingImportDownloadTemplate" as never)}
              </Button>
              <span className="text-xs text-muted-foreground">
                Columns: omsProductCode, channel, store, channelSku, warehouse, warehouseSku
              </span>
            </div>

            <div
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("mappingImportUpload" as never)}</p>
                <p className="text-xs text-muted-foreground mt-1">Click or drag &amp; drop a .csv file</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {parseResult?.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {t("mappingImportErrorParse" as never)}: {parseResult.error}
              </div>
            )}

            {drafts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{t("mappingImportPreviewTitle" as never)}</h3>
                  <Badge variant="secondary">
                    {drafts.length} {t("mappingImportPreviewRows" as never)}
                  </Badge>
                </div>
                <div className="overflow-hidden rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>{t("mappingImportColProduct" as never)}</TableHead>
                        <TableHead>{t("mappingImportColChannel" as never)}</TableHead>
                        <TableHead>{t("mappingImportColWarehouse" as never)}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drafts.map((draft, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{draft.omsProductCode}</TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {draft.channelMappings.map((cm, j) => (
                                <p key={j} className="text-xs text-muted-foreground">
                                  {cm.channel} / {cm.store} — {cm.channelSkus.join(", ")}
                                </p>
                              ))}
                              {draft.channelMappings.length === 0 && (
                                <p className="text-xs text-muted-foreground">—</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              {draft.warehouseMappings.map((wh, j) => (
                                <p key={j} className="text-xs text-muted-foreground">
                                  {wh.warehouse} — {wh.warehouseSku}
                                </p>
                              ))}
                              {draft.warehouseMappings.length === 0 && (
                                <p className="text-xs text-muted-foreground">—</p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={drafts.length === 0}>
            <Upload className="mr-2 h-4 w-4" />
            {t("mappingImportConfirm" as never)} ({drafts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
