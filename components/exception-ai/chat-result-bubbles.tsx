"use client"

import type { PipelineResult } from '@/lib/orchestrator/types'
import type { OrchestratorResult } from '@/lib/orchestrator/types'
import type { DiagnosisResult } from '@/lib/diagnosis/types'
import type { RepairResult } from '@/lib/repair/types'
import type { LearningResult } from '@/lib/learning/types'
import { ChatMessage } from './chat-message'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, CheckCircle2, XCircle, AlertTriangle, BookOpen } from 'lucide-react'

// ─── Severity styles ───
const severityStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
}

const repairStatusIcon: Record<string, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />,
  partial: <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />,
  failed: <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />,
  skipped: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
}

// ─── Diagnosis bubble content ───
function DiagnosisBubble({ diagnosis, needsUserInput }: { diagnosis: DiagnosisResult; needsUserInput?: boolean }) {
  const orderNo = diagnosis.order_context?.order_no
  const topCause = diagnosis.root_causes[0]

  return (
    <div className="space-y-3" data-testid="chat-diagnosis">
      {/* Conversational summary */}
      <p>
        {orderNo ? (
          <>我已经分析了订单 <span className="font-medium text-foreground">{orderNo}</span>，</>
        ) : (
          <>分析完成，</>
        )}
        {topCause ? (
          <>发现问题：<span className="font-medium">{topCause.cause_description}</span></>
        ) : (
          <>未发现明确根因</>
        )}
        {diagnosis.root_causes.length > 1 && (
          <span className="text-muted-foreground">（共 {diagnosis.root_causes.length} 个可能原因）</span>
        )}
      </p>

      {/* Severity + confidence inline */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <Badge className={severityStyles[diagnosis.severity] || severityStyles.low}>
          {diagnosis.severity}
        </Badge>
        <span className="text-muted-foreground">
          {diagnosis.domain} · 置信度 {Math.round(diagnosis.overall_confidence * 100)}%
        </span>
        {diagnosis.is_exploratory && (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            探索性
          </Badge>
        )}
      </div>

      {/* Evidence details */}
      {diagnosis.root_causes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">证据：</p>
          {diagnosis.root_causes.map(rc => (
            <div key={rc.cause_id} className="rounded-md border bg-background/50 p-2 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-sm">{rc.cause_description}</span>
                <span className="text-xs text-muted-foreground">{Math.round(rc.confidence * 100)}%</span>
              </div>
              {rc.evidence.map((ev, i) => (
                <p key={i} className="text-xs text-muted-foreground">[{ev.source}] {ev.description}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* What AI plans to do next — only show when NOT waiting for user input */}
      {diagnosis.recommended_actions.length > 0 && !needsUserInput && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {diagnosis.recommended_actions.some(a => a.auto_executable)
              ? '我将执行以下修复动作：'
              : '建议的处理方式：'}
          </p>
          {diagnosis.recommended_actions.map(action => (
            <div key={action.action_code} className="flex items-center justify-between text-xs rounded border bg-background/50 px-2 py-1.5">
              <span>{action.description}</span>
              <Badge variant={action.auto_executable ? 'default' : 'secondary'} className="text-xs">
                {action.auto_executable ? '自动' : '手动'}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* If waiting for user input, tell user */}
      {needsUserInput && (
        <p className="text-muted-foreground">
          请在下方提供所需信息，我才能继续修复。
        </p>
      )}
    </div>
  )
}

// ─── Repair bubble content ───
function RepairBubble({ repair }: { repair: RepairResult }) {
  const statusText = repair.overall_status === 'success'
    ? '所有修复动作已成功执行'
    : repair.overall_status === 'partial'
    ? '部分修复动作已完成，但有些需要关注'
    : '修复执行失败，可能需要人工介入'

  return (
    <div className="space-y-2" data-testid="chat-repair">
      <div className="flex items-center gap-2">
        {repairStatusIcon[repair.overall_status]}
        <span className="font-medium">{statusText}</span>
      </div>

      {repair.action_results.length > 0 && (
        <div className="space-y-1">
          {repair.action_results.map(ar => (
            <div key={ar.action_code} className="flex items-center justify-between text-xs rounded border bg-background/50 px-2 py-1.5">
              <span>{ar.action_code}</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    ar.status === 'success' ? 'text-green-700 border-green-300' :
                    ar.status === 'failed' ? 'text-red-700 border-red-300' :
                    'text-muted-foreground'
                  }`}
                >
                  {ar.status}
                </Badge>
                <span className="text-muted-foreground">{ar.duration_ms}ms</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {repair.escalations.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p>以下问题需要人工处理：</p>
          {repair.escalations.map((esc, i) => (
            <p key={i}>• {esc.action_code}: {esc.reason} → {esc.assigned_to}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Learning bubble content ───
function LearningBubble({ learning }: { learning: LearningResult }) {
  const hasActivity = learning.atoms_updated + learning.atoms_created + learning.atoms_deprecated + learning.patterns_buffered > 0

  return (
    <div className="space-y-1" data-testid="chat-learning">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="font-medium">学习反馈</span>
      </div>
      {hasActivity ? (
        <div className="flex gap-3 text-xs">
          {learning.atoms_updated > 0 && <span>更新知识: {learning.atoms_updated}</span>}
          {learning.atoms_created > 0 && <span className="text-green-600">新增: {learning.atoms_created}</span>}
          {learning.atoms_deprecated > 0 && <span className="text-red-600">废弃: {learning.atoms_deprecated}</span>}
          {learning.patterns_buffered > 0 && <span className="text-primary">新模式: {learning.patterns_buffered}</span>}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">本次无知识库变更</p>
      )}
    </div>
  )
}

// ─── Main export: render a full pipeline result as chat bubbles ───
interface ChatResultBubblesProps {
  result: OrchestratorResult
  diagnosisOnly: boolean
  onTriggerRepair?: (orderNo: string) => void
}

export function ChatResultBubbles({ result, diagnosisOnly, onTriggerRepair }: ChatResultBubblesProps) {
  if (result.mode === 'batch') {
    return <BatchChatBubbles result={result} diagnosisOnly={diagnosisOnly} onTriggerRepair={onTriggerRepair} />
  }

  const pipeline = result.results[0]
  if (!pipeline) return null

  return <PipelineBubbles pipeline={pipeline} diagnosisOnly={diagnosisOnly} onTriggerRepair={onTriggerRepair} />
}

function PipelineBubbles({
  pipeline,
  diagnosisOnly,
  onTriggerRepair,
}: {
  pipeline: PipelineResult
  diagnosisOnly: boolean
  onTriggerRepair?: (orderNo: string) => void
}) {
  const { diagnosis, repair, learning, stage_reached, error } = pipeline

  return (
    <>
      {/* Error */}
      {stage_reached === 'error' && (
        <ChatMessage role="ai">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="h-4 w-4" />
            <span>处理出错: {error || '未知错误'}</span>
          </div>
        </ChatMessage>
      )}

      {/* Diagnosis */}
      {diagnosis && stage_reached !== 'error' && (
        <ChatMessage role="ai">
          <DiagnosisBubble diagnosis={diagnosis} needsUserInput={pipeline.needs_user_input} />
          {/* Manual repair trigger — only when no user input needed */}
          {diagnosisOnly && !pipeline.needs_user_input && pipeline.order_no && onTriggerRepair && (
            <Button
              onClick={() => onTriggerRepair(pipeline.order_no!)}
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              data-testid="chat-trigger-repair-btn"
            >
              <Play className="mr-2 h-3.5 w-3.5" />
              手动触发修复
            </Button>
          )}
        </ChatMessage>
      )}

      {/* Address needed — prompt user to type it in chat */}
      {pipeline.needs_user_input && pipeline.user_input_type === 'address' && (
        <ChatMessage role="ai">
          <div className="space-y-2" data-testid="address-prompt">
            <p>请在下方输入框中提供收货地址，格式如下：</p>
            <div className="rounded-md border bg-background/50 p-2 text-xs text-muted-foreground font-mono whitespace-pre-line">
{`收件人: John Doe
地址: 12345 Neverland Lane
城市: Beverly Hills
州/省: CA
国家: US
邮编: 90210
电话: +1 555-0100`}
            </div>
            <p className="text-muted-foreground">你也可以直接用一行写，比如：<span className="text-foreground">John Doe, 12345 Neverland Lane, Beverly Hills, CA, US, 90210</span></p>
          </div>
        </ChatMessage>
      )}

      {/* Repair — only when NOT waiting for user input */}
      {repair && !pipeline.needs_user_input && (
        <ChatMessage role="ai">
          <RepairBubble repair={repair} />
        </ChatMessage>
      )}

      {/* Learning — only when NOT waiting for user input */}
      {learning && !pipeline.needs_user_input && (
        <ChatMessage role="ai">
          <LearningBubble learning={learning} />
        </ChatMessage>
      )}
    </>
  )
}

function BatchChatBubbles({
  result,
  diagnosisOnly,
  onTriggerRepair,
}: {
  result: OrchestratorResult
  diagnosisOnly: boolean
  onTriggerRepair?: (orderNo: string) => void
}) {
  const { summary } = result

  return (
    <>
      {/* Summary bubble */}
      <ChatMessage role="ai">
        <div className="space-y-1" data-testid="chat-batch-summary">
          <p className="font-medium">批量诊断完成，共 {summary.total} 条订单</p>
          <div className="flex gap-3 text-xs flex-wrap">
            <span>已诊断: {summary.diagnosed}</span>
            <span className="text-green-600">已修复: {summary.repaired}</span>
            <span className="text-primary">已学习: {summary.learned}</span>
            {summary.failed > 0 && <span className="text-red-600">失败: {summary.failed}</span>}
          </div>
        </div>
      </ChatMessage>

      {/* Per-order bubbles */}
      {result.results.map((pipeline, i) => (
        <div key={i} className="space-y-3">
          <ChatMessage role="ai">
            <p className="text-xs text-muted-foreground mb-1">订单 {pipeline.order_no || `#${i + 1}`}</p>
          </ChatMessage>
          <PipelineBubbles pipeline={pipeline} diagnosisOnly={diagnosisOnly} onTriggerRepair={onTriggerRepair} />
        </div>
      ))}
    </>
  )
}
