"use client"

import type { DiagnosisResult } from '@/lib/diagnosis/types'
import type { PipelineResult } from '@/lib/orchestrator/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Brain, Play } from 'lucide-react'

/** 地址缺失相关的根因 cause_code 或关键词 */
const ADDRESS_MISSING_PATTERNS = [
  'ADDRESS_MISSING', 'MISSING_ADDRESS', 'INVALID_ADDRESS',
  'SHIP_TO_ADDRESS', 'NO_ADDRESS', 'ADDRESS_INCOMPLETE',
]

export function isAddressMissing(diagnosis: DiagnosisResult): boolean {
  return diagnosis.root_causes.some(rc => {
    const code = rc.cause_code.toUpperCase()
    const desc = rc.cause_description.toLowerCase()
    return ADDRESS_MISSING_PATTERNS.some(p => code.includes(p)) ||
      desc.includes('地址') || desc.includes('address') ||
      desc.includes('缺少收货') || desc.includes('missing address') ||
      desc.includes('ship to')
  })
}

interface DiagnosisCardProps {
  diagnosis: DiagnosisResult
  stageReached: PipelineResult['stage_reached']
  error?: string
  diagnosisOnly: boolean
  onTriggerRepair?: () => void
}

const severityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

export function DiagnosisCard({ diagnosis, stageReached, error, diagnosisOnly, onTriggerRepair }: DiagnosisCardProps) {
  if (stageReached === 'error') {
    return (
      <Card className="border-destructive" data-testid="diagnosis-card-error">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-4 w-4 text-destructive" />
            诊断失败
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error || '未知错误'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="diagnosis-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            诊断结果
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {diagnosis.is_exploratory && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" data-testid="exploratory-badge">
                探索性诊断
              </Badge>
            )}
            <Badge className={severityStyles[diagnosis.severity] || severityStyles.low} data-testid="severity-badge">
              {diagnosis.severity}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 域和置信度 */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">异常域：</span>
          <Badge variant="secondary" data-testid="domain-badge">{diagnosis.domain}</Badge>
          <span className="text-muted-foreground">置信度：</span>
          <span className="font-medium" data-testid="confidence-value">
            {Math.round(diagnosis.overall_confidence * 100)}%
          </span>
        </div>

        {/* 根因列表 */}
        {diagnosis.root_causes.length > 0 && (
          <div className="space-y-2" data-testid="root-causes">
            <h4 className="text-sm font-medium">根因分析</h4>
            {diagnosis.root_causes.map((rc) => (
              <div key={rc.cause_id} className="rounded-md border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" data-testid="root-cause-desc">{rc.cause_description}</span>
                  <span className="text-xs text-muted-foreground" data-testid="root-cause-confidence">
                    {Math.round(rc.confidence * 100)}%
                  </span>
                </div>
                {rc.evidence.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {rc.evidence.map((ev, i) => (
                      <p key={i} data-testid="evidence-item">[{ev.source}] {ev.description}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 建议动作 */}
        {diagnosis.recommended_actions.length > 0 && (
          <div className="space-y-2" data-testid="recommended-actions">
            <h4 className="text-sm font-medium">建议动作</h4>
            {diagnosis.recommended_actions.map((action) => (
              <div key={action.action_code} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div className="flex items-center gap-2">
                  <span data-testid="action-desc">{action.description}</span>
                  <Badge variant="outline" className="text-xs" data-testid="action-priority">
                    P{action.priority}
                  </Badge>
                </div>
                <Badge
                  variant={action.auto_executable ? 'default' : 'secondary'}
                  className="text-xs"
                  data-testid="action-auto"
                >
                  {action.auto_executable ? '自动' : '手动'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* 仅诊断模式下的手动修复按钮 */}
        {diagnosisOnly && onTriggerRepair && (
          <Button
            onClick={onTriggerRepair}
            variant="outline"
            className="w-full"
            data-testid="trigger-repair-btn"
          >
            <Play className="mr-2 h-4 w-4" />
            手动触发修复
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
