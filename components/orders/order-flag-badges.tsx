"use client"

import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/orders/types"

interface OrderFlagBadgesProps {
  order: Pick<Order, "isExpedited" | "isPaid" | "hasShipment" | "isDomestic" | "dropShipStatus">
}

export function OrderFlagBadges({ order }: OrderFlagBadgesProps) {
  const flags = []

  if (order.isExpedited) {
    flags.push(
      <Badge key="expedited" variant="outline" className="border-orange-300 text-orange-600 text-xs px-1.5 py-0">
        Expedited
      </Badge>
    )
  }

  if (order.isPaid) {
    flags.push(
      <Badge key="paid" variant="outline" className="border-emerald-300 text-emerald-600 text-xs px-1.5 py-0">
        Paid
      </Badge>
    )
  }

  if (order.hasShipment) {
    flags.push(
      <Badge key="shipped" variant="outline" className="border-blue-300 text-blue-600 text-xs px-1.5 py-0">
        Shipped
      </Badge>
    )
  }

  if (!order.isDomestic) {
    flags.push(
      <Badge key="intl" variant="outline" className="border-purple-300 text-purple-600 text-xs px-1.5 py-0">
        Intl
      </Badge>
    )
  }

  if (order.dropShipStatus !== "none") {
    const dsLabels: Record<string, string> = {
      pending: "DS Pending",
      sent: "DS Sent",
      confirmed: "DS Confirmed",
    }
    flags.push(
      <Badge key="dropship" variant="outline" className="border-cyan-300 text-cyan-600 text-xs px-1.5 py-0">
        {dsLabels[order.dropShipStatus]}
      </Badge>
    )
  }

  if (flags.length === 0) return null

  return <div className="flex flex-wrap gap-1">{flags}</div>
}
