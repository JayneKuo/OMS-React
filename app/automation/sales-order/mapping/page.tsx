"use client"

import * as React from "react"
import {
  ArrowLeftRight,
  Box,
  Filter,
  Mail,
  Network,
  Package,
  PauseCircle,
  Plus,
  Route,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Upload,
  Warehouse,
  Webhook,
} from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FilterBar, type ActiveFilter, type FilterConfig } from "@/components/data-table/filter-bar"
import { SalesOrderMappingAutoMatchDialog } from "@/components/automation/sales-order-mapping-auto-match-dialog"
import { SalesOrderMappingDialog } from "@/components/automation/sales-order-mapping-dialog"
import { SalesOrderMappingImportDialog } from "@/components/automation/sales-order-mapping-import-dialog"
import { SalesOrderMappingSummary } from "@/components/automation/sales-order-mapping-summary"
import { SalesOrderMappingTable } from "@/components/automation/sales-order-mapping-table"
import { buildAutoMatchSuggestions } from "@/lib/automation/mapping/auto-match"
import { filterMappings, useMappingManagement } from "@/lib/automation/mapping/use-mapping-management"
import { useI18n } from "@/lib/i18n"
import type { OmsProductMapping, OmsProductMappingDraft } from "@/lib/automation/mapping/types"
import type { AutoMatchSuggestion } from "@/lib/automation/mapping/auto-match"

const sidebarItems = [
  {
    title: "Sales Order",
    href: "/automation/sales-order",
    icon: <Network className="h-4 w-4" />,
    children: [
      { title: "Sales Order Routing", href: "/automation/sales-order/routing", icon: <Network className="h-4 w-4" /> },
      { title: "Fulfillment Mode", href: "/automation/sales-order/fulfillment-mode", icon: <Package className="h-4 w-4" /> },
      { title: "SKU Designated Warehouse", href: "/automation/sales-order/designated-warehouse", icon: <Warehouse className="h-4 w-4" /> },
      { title: "Hold Order Rules", href: "/automation/sales-order/hold-rules", icon: <PauseCircle className="h-4 w-4" /> },
      { title: "Filter Orders by SKU", href: "/automation/sales-order/filter-by-sku", icon: <Filter className="h-4 w-4" /> },
      { title: "Order Update Settings", href: "/automation/sales-order/update-settings", icon: <Settings className="h-4 w-4" /> },
      { title: "Mapping", href: "/automation/sales-order/mapping", icon: <ArrowLeftRight className="h-4 w-4" /> },
    ],
  },
  {
    title: "Purchase Order",
    href: "/automation/purchase-order",
    icon: <ShoppingCart className="h-4 w-4" />,
    children: [{ title: "PO Order Routing", href: "/automation/purchase-order/routing", icon: <Route className="h-4 w-4" /> }],
  },
  {
    title: "Inventory",
    href: "/automation/inventory",
    icon: <Box className="h-4 w-4" />,
    children: [{ title: "Inventory Sync Rules", href: "/automation/inventory/sync-rules", icon: <Box className="h-4 w-4" /> }],
  },
  {
    title: "Logistics",
    href: "/automation/logistics",
    icon: <Truck className="h-4 w-4" />,
    children: [
      { title: "Carrier Account", href: "/automation/logistics/carrier-account", icon: <Store className="h-4 w-4" /> },
      { title: "Carrier & Delivery Service", href: "/automation/logistics/carrier-delivery-service", icon: <Truck className="h-4 w-4" /> },
      { title: "Delivery Order Routing", href: "/automation/logistics/delivery-order-routing", icon: <Route className="h-4 w-4" /> },
    ],
  },
  { title: "Email Notification", href: "/automation/email-notification", icon: <Mail className="h-4 w-4" /> },
  { title: "Webhook", href: "/automation/webhook", icon: <Webhook className="h-4 w-4" /> },
]

export default function SalesOrderMappingPage() {
  const { t } = useI18n()
  const { mappings, options, summary, saveMapping, importMappings, createMappingDraft, editMappingDraft, applyAutoMatch } = useMappingManagement()
  const [searchValue, setSearchValue] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<ActiveFilter[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [importDialogOpen, setImportDialogOpen] = React.useState(false)
  const [autoMatchOpen, setAutoMatchOpen] = React.useState(false)
  const [autoMatchSuggestions, setAutoMatchSuggestions] = React.useState<AutoMatchSuggestion[]>([])
  const [draft, setDraft] = React.useState<OmsProductMappingDraft | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | undefined>(mappings[0]?.id)

  const openAutoMatch = () => {
    const suggestions = buildAutoMatchSuggestions(mappings, options.warehouseTargets)
    setAutoMatchSuggestions(suggestions)
    setAutoMatchOpen(true)
  }

  React.useEffect(() => {
    if (!selectedId && mappings[0]?.id) {
      setSelectedId(mappings[0].id)
    }
  }, [mappings, selectedId])

  const filterConfigs: FilterConfig[] = [
    {
      id: "status",
      label: t("status"),
      type: "single",
      options: [
        { id: "complete", label: t("mappingStatusComplete" as never), value: "complete" },
        { id: "partial", label: t("mappingStatusPartial" as never), value: "partial" },
        { id: "unmapped", label: t("mappingStatusUnmapped" as never), value: "unmapped" },
        { id: "invalid", label: t("mappingStatusInvalid" as never), value: "invalid" },
      ],
    },
    {
      id: "channel",
      label: t("mappingFilterChannel" as never),
      type: "multiple",
      options: options.channels.map((channel) => ({ id: channel, label: channel, value: channel })),
    },
    {
      id: "warehouse",
      label: t("mappingFilterWarehouse" as never),
      type: "multiple",
      options: options.warehouses.map((warehouse) => ({ id: warehouse, label: warehouse, value: warehouse })),
    },
  ]

  const filteredMappings = React.useMemo(() => filterMappings(mappings, searchValue, activeFilters), [mappings, searchValue, activeFilters])

  const openCreateDialog = () => {
    setDraft(createMappingDraft())
    setDialogOpen(true)
  }

  const openEditDialog = (mapping: OmsProductMapping) => {
    setSelectedId(mapping.id)
    setDraft(editMappingDraft(mapping))
    setDialogOpen(true)
  }

  const handleSave = (nextDraft: OmsProductMappingDraft) => {
    saveMapping(nextDraft)
    setDialogOpen(false)
    setDraft(null)
    if (nextDraft.id) {
      setSelectedId(nextDraft.id)
    }
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Automation">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{t("mappingPageTitle" as never)}</h1>
              <Badge variant="outline">Prototype</Badge>
            </div>
            <p className="max-w-3xl text-sm text-muted-foreground">{t("mappingPageDescription" as never)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="h-9 px-3 text-sm">
              {summary.total} {t("mappingHeaderCount" as never)}
            </Badge>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t("mappingImport" as never)}
            </Button>
            <Button variant="outline" onClick={openAutoMatch}>
              <Sparkles className="mr-2 h-4 w-4" />
              {t("mappingAutoMatchRun" as never)}
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t("mappingCreate" as never)}
            </Button>
          </div>
        </div>

        <SalesOrderMappingSummary summary={summary} />

        <Card className="shadow-sm">
          <CardHeader className="gap-2 pb-4">
            <CardTitle className="text-xl">{t("mappingCenterTitle" as never)}</CardTitle>
            <CardDescription>{t("mappingCenterDescription" as never)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FilterBar
              searchValue={searchValue}
              searchPlaceholder={t("mappingSearchPlaceholder" as never)}
              onSearchChange={setSearchValue}
              filters={filterConfigs}
              onFiltersChange={setActiveFilters}
            />

            <SalesOrderMappingTable mappings={filteredMappings} selectedId={selectedId} onSelect={openEditDialog} />
          </CardContent>
        </Card>

        <SalesOrderMappingDialog
          open={dialogOpen}
          draft={draft}
          options={options}
          mappings={mappings}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) {
              setDraft(null)
            }
          }}
          onSave={handleSave}
        />

        <SalesOrderMappingImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onImport={importMappings}
        />

        <SalesOrderMappingAutoMatchDialog
          open={autoMatchOpen}
          suggestions={autoMatchSuggestions}
          onOpenChange={setAutoMatchOpen}
          onApply={applyAutoMatch}
        />
      </div>
    </MainLayout>
  )
}
