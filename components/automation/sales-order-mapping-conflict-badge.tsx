import { AlertCircle, CheckCircle2, CircleDashed, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import type { MappingStatus } from "@/lib/automation/mapping/types"

const config: Record<MappingStatus, { labelKey: string; icon: typeof CheckCircle2; className: string }> = {
  complete: {
    labelKey: "mappingStatusComplete",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  partial: {
    labelKey: "mappingStatusPartial",
    icon: AlertCircle,
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  unmapped: {
    labelKey: "mappingStatusUnmapped",
    icon: CircleDashed,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
  invalid: {
    labelKey: "mappingStatusInvalid",
    icon: ShieldAlert,
    className: "border-red-200 bg-red-50 text-red-700",
  },
}

export function SalesOrderMappingConflictBadge({ state }: { state: MappingStatus }) {
  const { t } = useI18n()
  const item = config[state]
  const Icon = item.icon

  return (
    <Badge variant="outline" className={cn("gap-1.5", item.className)}>
      <Icon className="h-3.5 w-3.5" />
      {t(item.labelKey as never)}
    </Badge>
  )
}
