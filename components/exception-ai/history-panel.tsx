"use client"

import type { HistoryRecord } from '@/lib/exception-ai/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History } from 'lucide-react'

interface HistoryPanelProps {
  records: HistoryRecord[]
  onSelectAction: (record: HistoryRecord) => void
  selectedId: string | null
}

const statusStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  error: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

export function HistoryPanel({ records, onSelectAction, selectedId }: HistoryPanelProps) {
  return (
    <Card data-testid="history-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          历史记录
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-4" data-testid="history-empty">
            暂无历史记录
          </p>
        ) : (
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-1 p-4 pt-0">
              {records.map((record) => (
                <button
                  key={record.id}
                  onClick={() => onSelectAction(record)}
                  className={`w-full text-left rounded-md p-3 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    selectedId === record.id ? 'bg-muted' : ''
                  }`}
                  data-testid={`history-item-${record.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground" data-testid="history-timestamp">
                      {new Date(record.timestamp).toLocaleString('zh-CN')}
                    </span>
                    <Badge className={`text-xs ${statusStyles[record.overallStatus] || ''}`} data-testid="history-status">
                      {record.overallStatus}
                    </Badge>
                  </div>
                  <p className="text-sm truncate" data-testid="history-summary">{record.inputSummary}</p>
                  <Badge variant="outline" className="text-xs mt-1" data-testid="history-mode">
                    {record.mode === 'batch' ? '批量' : '单条'}
                  </Badge>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
