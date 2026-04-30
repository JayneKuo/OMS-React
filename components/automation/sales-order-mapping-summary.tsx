import { AlertTriangle, Boxes, CircleDashed, Link2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import type { MappingSummary } from "@/lib/automation/mapping/types"

const items = [
  {
    key: "total",
    labelKey: "mappingSummaryTotal",
    descriptionKey: "mappingSummaryTotalDesc",
    icon: Boxes,
  },
  {
    key: "complete",
    labelKey: "mappingSummaryComplete",
    descriptionKey: "mappingSummaryCompleteDesc",
    icon: Link2,
  },
  {
    key: "partial",
    labelKey: "mappingSummaryPartial",
    descriptionKey: "mappingSummaryPartialDesc",
    icon: CircleDashed,
  },
  {
    key: "invalid",
    labelKey: "mappingSummaryInvalid",
    descriptionKey: "mappingSummaryInvalidDesc",
    icon: AlertTriangle,
  },
] as const

export function SalesOrderMappingSummary({ summary }: { summary: MappingSummary }) {
  const { t } = useI18n()

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        const value = summary[item.key]

        return (
          <Card key={item.key} className="border-border/60 shadow-sm">
            <CardContent className="flex items-start justify-between p-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t(item.labelKey as never)}</p>
                <p className="text-3xl font-semibold tracking-tight">{value}</p>
                <p className="text-xs leading-5 text-muted-foreground">{t(item.descriptionKey as never)}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
