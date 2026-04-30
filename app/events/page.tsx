"use client"

import * as React from "react"
import { RefreshCw, Search, X } from "lucide-react"
import { MainLayout } from "@/components/layout/main-layout"
import { DataTable, type Column } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventStatusBadge } from "@/components/events/event-status-badge"
import { EventDetailDrawer } from "@/components/events/event-detail-drawer"
import { mockEvents } from "@/lib/events/mock-data"
import { formatTimestamp, formatDuration, getCategoryIcon } from "@/lib/events/event-utils"
import type { SystemEvent, EventCategory, EventStatus } from "@/lib/events/types"

const sidebarItems = [
  { title: "All Events", href: "/events" },
  { title: "Order Events", href: "/events?category=order" },
  { title: "API Logs", href: "/events?category=api" },
  { title: "Automation", href: "/events?category=automation" },
  { title: "System", href: "/events?category=system" },
]

const TIME_RANGES = [
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "All time", value: "all" },
]

const STATUS_OPTIONS: { label: string; value: EventStatus | 'all' }[] = [
  { label: "All Status", value: "all" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
  { label: "Warning", value: "warning" },
  { label: "Pending", value: "pending" },
]

const CATEGORY_OPTIONS: { label: string; value: EventCategory | 'all' }[] = [
  { label: "All Categories", value: "all" },
  { label: "Order", value: "order" },
  { label: "Purchase", value: "purchase" },
  { label: "Inventory", value: "inventory" },
  { label: "API", value: "api" },
  { label: "Automation", value: "automation" },
  { label: "System", value: "system" },
]

const DEFAULT_TIME_RANGE = '24h'

function EventTypeCell({ event }: { event: SystemEvent }) {
  const Icon = getCategoryIcon(event.category)
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="font-mono text-xs">{event.eventType}</span>
    </div>
  )
}

function EntityCell({ event }: { event: SystemEvent }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{event.entityType}</span>
      <span className="font-mono text-xs">{event.entityId}</span>
    </div>
  )
}

const columns: Column<SystemEvent>[] = [
  {
    id: 'id',
    header: 'Log ID',
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
    ),
    width: '100px',
  },
  {
    id: 'timestamp',
    header: 'Time',
    cell: (row) => (
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {formatTimestamp(row.timestamp)}
      </span>
    ),
    sortable: true,
    width: '160px',
  },
  {
    id: 'eventType',
    header: 'Event Type',
    cell: (row) => <EventTypeCell event={row} />,
    width: '220px',
  },
  {
    id: 'entity',
    header: 'Entity / Order No.',
    cell: (row) => <EntityCell event={row} />,
    width: '160px',
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <EventStatusBadge status={row.status} />,
    width: '100px',
  },
  {
    id: 'source',
    header: 'Source',
    cell: (row) => <span className="text-xs">{row.source}</span>,
    width: '160px',
  },
  {
    id: 'durationMs',
    header: 'Duration',
    cell: (row) => (
      <span className="text-xs font-mono tabular-nums">
        {formatDuration(row.durationMs)}
      </span>
    ),
    width: '80px',
  },
]

function getRowClassName(row: SystemEvent): string {
  if (row.status === 'failed') return 'bg-red-50/60 dark:bg-red-950/10'
  if (row.status === 'warning') return 'bg-amber-50/60 dark:bg-amber-950/10'
  return ''
}

export default function EventsPage() {
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<EventStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = React.useState<EventCategory | 'all'>('all')
  const [timeRange, setTimeRange] = React.useState(DEFAULT_TIME_RANGE)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [refreshKey, setRefreshKey] = React.useState(0)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('category') as EventCategory | null
      if (cat) setCategoryFilter(cat)
    }
  }, [])

  const cutoffTime = React.useMemo(() => {
    if (timeRange === 'all') return null
    const now = new Date()
    if (timeRange === '1h') return new Date(now.getTime() - 1 * 60 * 60 * 1000)
    if (timeRange === '24h') return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    if (timeRange === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return null
  }, [timeRange])

  const filtered = React.useMemo(() => {
    let data = mockEvents

    if (cutoffTime) {
      data = data.filter(e => new Date(e.timestamp) >= cutoffTime)
    }
    if (categoryFilter !== 'all') {
      data = data.filter(e => e.category === categoryFilter)
    }
    if (statusFilter !== 'all') {
      data = data.filter(e => e.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(e =>
        e.id.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        e.entityType.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    return data
  }, [categoryFilter, statusFilter, search, cutoffTime, refreshKey])

  const pageSize = 10
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const selectedEventIndex = selectedEventId !== null
    ? filtered.findIndex(e => e.id === selectedEventId)
    : -1
  const selectedEvent = selectedEventIndex >= 0 ? filtered[selectedEventIndex] : null

  const handleRowClick = (event: SystemEvent) => {
    setSelectedEventId(event.id)
    setDrawerOpen(true)
  }

  const handlePrev = () => {
    if (selectedEventIndex <= 0) return
    const newIdx = selectedEventIndex - 1
    setSelectedEventId(filtered[newIdx].id)
    const newPage = Math.floor(newIdx / pageSize) + 1
    if (newPage !== currentPage) setCurrentPage(newPage)
  }

  const handleNext = () => {
    if (selectedEventIndex >= filtered.length - 1) return
    const newIdx = selectedEventIndex + 1
    setSelectedEventId(filtered[newIdx].id)
    const newPage = Math.floor(newIdx / pageSize) + 1
    if (newPage !== currentPage) setCurrentPage(newPage)
  }

  const handleRefresh = () => {
    setRefreshKey(k => k + 1)
    setCurrentPage(1)
  }

  const hasActiveFilters = !!search.trim() || statusFilter !== 'all' || categoryFilter !== 'all' || timeRange !== DEFAULT_TIME_RANGE

  const handleClearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setTimeRange(DEFAULT_TIME_RANGE)
    setCurrentPage(1)
  }

  const failedCount = filtered.filter(e => e.status === 'failed').length
  const warningCount = filtered.filter(e => e.status === 'warning').length

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Events">
      <div className="space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Log</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Troubleshoot issues — inspect request/response payloads for any event
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        {(failedCount > 0 || warningCount > 0) && (
          <div className="flex gap-3">
            {failedCount > 0 && (
              <button
                onClick={() => { setStatusFilter('failed'); setCurrentPage(1) }}
                className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 px-3 py-2 cursor-pointer hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-medium text-red-700 dark:text-red-400">
                  {failedCount} failed event{failedCount > 1 ? 's' : ''}
                </span>
              </button>
            )}
            {warningCount > 0 && (
              <button
                onClick={() => { setStatusFilter('warning'); setCurrentPage(1) }}
                className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-3 py-2 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-950/30 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  {warningCount} warning{warningCount > 1 ? 's' : ''}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search log ID, order/PO no., event type, source..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as EventStatus | 'all'); setCurrentPage(1) }}>
            <SelectTrigger className="h-8 w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as EventCategory | 'all'); setCurrentPage(1) }}>
            <SelectTrigger className="h-8 w-[160px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v) => { setTimeRange(v); setCurrentPage(1) }}>
            <SelectTrigger className="h-8 w-[140px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground" onClick={handleClearFilters}>
              <X className="h-3.5 w-3.5 mr-1" />
              Clear filters
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-1">
            {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <DataTable<SystemEvent>
          data={paged}
          columns={columns}
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onRowClick={handleRowClick}
          rowClassName={getRowClassName}
          emptyMessage="No events found. Try adjusting your filters."
        />
      </div>

      <EventDetailDrawer
        event={selectedEvent}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        hasPrev={selectedEventIndex > 0}
        hasNext={selectedEventIndex < filtered.length - 1}
        onPrev={handlePrev}
        onNext={handleNext}
        currentIndex={selectedEventIndex >= 0 ? selectedEventIndex : undefined}
        totalCount={filtered.length}
      />
    </MainLayout>
  )
}
