"use client"

import type { RepairResult } from '@/lib/repair/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wrench, AlertTriangle } from 'lucide-react'

interface RepairCardProps {
  repair: RepairResult
}

const statusStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

const actionStatusStyles: Record<string, string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  timeout: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  pending_confirmation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
}

export function RepairCard({ repair }: RepairCardProps) {
  return (
    <Card data-testid="repair-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-primary" />
            修复结果
          </CardTitle>
          <Badge className={statusStyles[repair.overall_status] || statusStyles.skipped} data-testid="repair-status">
            {repair.overall_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 动作结果列表 */}
        {repair.action_results.length > 0 && (
          <div className="space-y-2" data-testid="action-results">
            <h4 className="text-sm font-medium">动作执行详情</h4>
            {repair.action_results.map((ar) => (
              <div key={ar.action_code} className="rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium" data-testid="action-code">{ar.action_code}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={actionStatusStyles[ar.status] || actionStatusStyles.skipped} data-testid="action-status">
                      {ar.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground" data-testid="action-duration">
                      {ar.duration_ms}ms
                    </span>
                    <span className="text-xs text-muted-foreground" data-testid="action-retries">
                      {ar.retry_count}/{ar.max_retries}
                    </span>
                  </div>
                </div>
                {ar.status === 'failed' && ar.error && (
                  <p className="text-xs text-destructive" data-testid="action-error">{ar.error}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 升级列表 */}
        {repair.escalations.length > 0 && (
          <div className="space-y-2" data-testid="escalations">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              升级信息
            </h4>
            {repair.escalations.map((esc, i) => (
              <div key={i} className="rounded-md border border-yellow-200 dark:border-yellow-800 p-3 space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-medium" data-testid="escalation-action">{esc.action_code}</span>
                  <Badge className={statusStyles[esc.severity] === undefined ? 'bg-gray-100 text-gray-800' : ''} data-testid="escalation-severity">
                    {esc.severity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground" data-testid="escalation-reason">{esc.reason}</p>
                <p className="text-xs" data-testid="escalation-assigned">
                  分配给：<span className="font-medium">{esc.assigned_to}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
