"use client"

import * as React from "react"
import { Clock, Tag, User, Server, AlertCircle, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EventStatusBadge } from "./event-status-badge"
import { JsonViewer } from "./json-viewer"
import { formatTimestamp, formatDuration, getCategoryIcon } from "@/lib/events/event-utils"
import type { SystemEvent } from "@/lib/events/types"

interface EventDetailDrawerProps {
  event: SystemEvent | null
  open: boolean
  onClose: () => void
  hasPrev?: boolean
  hasNext?: boolean
  onPrev?: () => void
  onNext?: () => void
  currentIndex?: number
  totalCount?: number
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      title="Copy"
    >
      {copied
        ? <Check className="h-3 w-3 text-green-500" />
        : <Copy className="h-3 w-3" />}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-xs flex-1 break-all">{value}</span>
    </div>
  )
}

export function EventDetailDrawer({
  event,
  open,
  onClose,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}: EventDetailDrawerProps) {
  if (!event) return null

  const CategoryIcon = getCategoryIcon(event.category)

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-[580px] sm:w-[640px] sm:max-w-[640px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <CategoryIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <SheetTitle className="text-sm font-mono font-semibold truncate">
                {event.eventType}
              </SheetTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <EventStatusBadge status={event.status} />
              <div className="flex items-center gap-0.5 border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-r-none"
                  onClick={onPrev}
                  disabled={!hasPrev}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {currentIndex !== undefined && totalCount !== undefined && (
                  <span className="text-xs text-muted-foreground tabular-nums px-1.5 border-x">
                    {currentIndex + 1}/{totalCount}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-l-none"
                  onClick={onNext}
                  disabled={!hasNext}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(event.timestamp)}
            </span>
            <span className="flex items-center gap-1">
              <Server className="h-3 w-3" />
              {formatDuration(event.durationMs)}
            </span>
          </div>
        </SheetHeader>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Overview */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Overview</h3>
            <div className="rounded-md border divide-y">
              <div className="px-3">
                <InfoRow label="Event ID" value={
                  <span className="flex items-center">
                    <span className="font-mono">{event.id}</span>
                    <CopyButton text={event.id} />
                  </span>
                } />
              </div>
              <div className="px-3">
                <InfoRow label="Entity" value={
                  <span className="flex items-center flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{event.entityType}</Badge>
                    <span className="font-mono">{event.entityId}</span>
                    <CopyButton text={event.entityId} />
                  </span>
                } />
              </div>
              <div className="px-3">
                <InfoRow label="Source" value={event.source} />
              </div>
              <div className="px-3">
                <InfoRow label="Triggered By" value={
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {event.triggeredBy}
                  </span>
                } />
              </div>
              {event.tags.length > 0 && (
                <div className="px-3">
                  <InfoRow label="Tags" value={
                    <span className="flex flex-wrap gap-1">
                      {event.tags.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          <Tag className="h-2.5 w-2.5 mr-1" />{t}
                        </Badge>
                      ))}
                    </span>
                  } />
                </div>
              )}
            </div>
          </section>

          {/* Error Details */}
          {(event.errorMessage || event.errorCode) && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Error Details</h3>
              <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3 space-y-1">
                {event.errorCode && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                      {event.errorCode}
                    </span>
                  </div>
                )}
                {event.errorMessage && (
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed ml-5">
                    {event.errorMessage}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Request Payload */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Request Payload
            </h3>
            <JsonViewer data={event.requestPayload} maxHeight="280px" />
          </section>

          {/* Response Payload */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Response Payload
            </h3>
            <JsonViewer data={event.responsePayload} maxHeight="280px" />
          </section>

        </div>
      </SheetContent>
    </Sheet>
  )
}
