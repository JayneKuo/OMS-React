"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { SalesOrderMappingConflictBadge } from "@/components/automation/sales-order-mapping-conflict-badge"
import { useI18n } from "@/lib/i18n"
import type { OmsProductMapping } from "@/lib/automation/mapping/types"

interface SalesOrderMappingTableProps {
  mappings: OmsProductMapping[]
  selectedId?: string
  onSelect: (mapping: OmsProductMapping) => void
}

function ExpandedMappingDetail({ mapping }: { mapping: OmsProductMapping }) {
  const hasChannels = mapping.channelMappings.length > 0
  const hasWarehouses = mapping.warehouseMappings.length > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x bg-muted/20 border-t">
      {/* Channel Mappings */}
      <div className="px-6 py-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Channel Mappings</p>
        {!hasChannels ? (
          <p className="text-xs text-muted-foreground">—</p>
        ) : (
          <div className="space-y-3">
            {mapping.channelMappings.map((cm) => (
              <div key={cm.id} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">{cm.channel}</Badge>
                  <span className="text-xs text-muted-foreground">{cm.store}</span>
                  {!cm.enabled && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Disabled</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 pl-1">
                  {cm.channelSkus.length > 0
                    ? cm.channelSkus.map((sku) => (
                        <span key={sku} className="rounded bg-background border px-1.5 py-0.5 font-mono text-xs">
                          {sku}
                        </span>
                      ))
                    : <span className="text-xs text-muted-foreground italic">No SKUs</span>
                  }
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warehouse Mappings */}
      <div className="px-6 py-3 space-y-3 border-t md:border-t-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Warehouse Mappings</p>
        {!hasWarehouses ? (
          <p className="text-xs text-muted-foreground">—</p>
        ) : (
          <div className="space-y-3">
            {mapping.warehouseMappings.map((wm) => (
              <div key={wm.id} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-xs">{wm.warehouse}</Badge>
                  {!wm.enabled && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Disabled</Badge>
                  )}
                </div>
                <div className="pl-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="font-mono text-xs">{wm.warehouseSku || "—"}</span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="font-mono text-xs text-muted-foreground">{wm.itemCode || "—"}</span>
                  <span className="text-muted-foreground text-xs">·</span>
                  <span className="text-xs">{wm.itemName || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SalesOrderMappingTable({ mappings, selectedId, onSelect }: SalesOrderMappingTableProps) {
  const { t } = useI18n()
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  if (mappings.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-center">
          <p className="text-lg font-semibold">{t("mappingEmptyTitle" as never)}</p>
          <p className="max-w-md text-sm text-muted-foreground">{t("mappingEmptyDescription" as never)}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-8" />
            <TableHead className="min-w-[160px]">{t("mappingTableProduct" as never)}</TableHead>
            <TableHead className="min-w-[180px]">{t("mappingTableProductName" as never)}</TableHead>
            <TableHead className="w-[130px]">{t("mappingTableChannelCount" as never)}</TableHead>
            <TableHead className="w-[130px]">{t("mappingTableWarehouse" as never)}</TableHead>
            <TableHead className="w-[130px]">{t("mappingTableStatus" as never)}</TableHead>
            <TableHead className="min-w-[130px]">{t("mappingTableUpdated" as never)}</TableHead>
            <TableHead className="w-[80px] text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.map((mapping) => {
            const isExpanded = expandedId === mapping.id
            const isSelected = selectedId === mapping.id
            const channelCount = mapping.channelMappings.length
            const warehouseCount = mapping.warehouseMappings.length

            return (
              <React.Fragment key={mapping.id}>
                <TableRow
                  className={`cursor-pointer ${isSelected ? "bg-primary/5" : ""} ${isExpanded ? "border-b-0" : ""}`}
                  onClick={() => toggleExpand(mapping.id)}
                >
                  <TableCell className="w-8 pr-0">
                    {isExpanded
                      ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium">{mapping.omsProductCode}</p>
                      <p className="text-xs text-muted-foreground">{mapping.omsProductId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{mapping.omsProductName}</p>
                  </TableCell>
                  <TableCell>
                    {channelCount === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <span className="text-sm font-medium">
                        {channelCount} {channelCount === 1 ? "channel" : "channels"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {warehouseCount === 0 ? (
                      <span className="text-sm text-muted-foreground">—</span>
                    ) : (
                      <span className="text-sm font-medium">
                        {warehouseCount} {warehouseCount === 1 ? "warehouse" : "warehouses"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SalesOrderMappingConflictBadge state={mapping.status} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      <p>{mapping.updatedAt}</p>
                      <p>{mapping.updatedBy}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelect(mapping)
                        }}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        {t("edit")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow className={isSelected ? "bg-primary/5" : ""}>
                    <TableCell colSpan={8} className="p-0">
                      <ExpandedMappingDetail mapping={mapping} />
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
