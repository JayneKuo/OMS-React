"use client"

import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/events/event-utils"
import type { EventStatus } from "@/lib/events/types"
import { cn } from "@/lib/utils"

interface EventStatusBadgeProps {
  status: EventStatus
  className?: string
}

const statusLabel: Record<EventStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  warning: 'Warning',
  pending: 'Pending',
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        getStatusColor(status),
        className
      )}
    >
      {statusLabel[status]}
    </span>
  )
}
