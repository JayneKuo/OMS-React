"use client"

import type { OrchestratorResult } from '@/lib/orchestrator/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface BatchSummaryCardProps {
  summary: OrchestratorResult['summary']
}

export function BatchSummaryCard({ summary }: BatchSummaryCardProps) {
  return (
    <Card data-testid="batch-summary-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          批量处理汇总
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3" data-testid="batch-stats">
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold" data-testid="stat-total">{summary.total}</p>
            <p className="text-xs text-muted-foreground">总数</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="stat-diagnosed">{summary.diagnosed}</p>
            <p className="text-xs text-muted-foreground">已诊断</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="stat-repaired">{summary.repaired}</p>
            <p className="text-xs text-muted-foreground">已修复</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold" data-testid="stat-learned">{summary.learned}</p>
            <p className="text-xs text-muted-foreground">已学习</p>
          </div>
          <div className="rounded-md border p-3 text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="stat-failed">{summary.failed}</p>
            <p className="text-xs text-muted-foreground">失败</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
