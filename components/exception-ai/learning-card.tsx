"use client"

import type { LearningResult } from '@/lib/learning/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'

interface LearningCardProps {
  learning: LearningResult
}

export function LearningCard({ learning }: LearningCardProps) {
  return (
    <Card data-testid="learning-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-4 w-4 text-primary" />
          学习反馈
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 汇总统计 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="learning-summary">
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold" data-testid="atoms-updated">{learning.atoms_updated}</p>
            <p className="text-xs text-muted-foreground">更新知识</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="atoms-created">{learning.atoms_created}</p>
            <p className="text-xs text-muted-foreground">新建知识</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="atoms-deprecated">{learning.atoms_deprecated}</p>
            <p className="text-xs text-muted-foreground">废弃知识</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="patterns-buffered">{learning.patterns_buffered}</p>
            <p className="text-xs text-muted-foreground">缓冲模式</p>
          </div>
        </div>

        {/* 事件列表 */}
        {learning.events.length > 0 && (
          <div className="space-y-2" data-testid="learning-events">
            <h4 className="text-sm font-medium">学习事件</h4>
            {learning.events.map((event) => (
              <div key={event.event_id} className="rounded-md border p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs" data-testid="event-type">{event.event_type}</Badge>
                  <span className="text-sm" data-testid="event-reason">{event.reason}</span>
                </div>
                {event.changes.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-0.5" data-testid="event-changes">
                    {event.changes.map((change, i) => (
                      <p key={i}>{change.field}: {String(change.old_value)} → {String(change.new_value)}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
