"use client"

import { useState } from 'react'
import type { OrchestratorResult } from '@/lib/orchestrator/types'
import type { PanelStatus } from '@/lib/exception-ai/types'
import { EmptyState } from './empty-state'
import { LoadingSkeleton } from './loading-skeleton'
import { BatchSummaryCard } from './batch-summary-card'
import { DiagnosisCard, isAddressMissing } from './diagnosis-card'
import { RepairCard } from './repair-card'
import { LearningCard } from './learning-card'
import { AddressForm } from './address-form'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'

interface ResultDisplayProps {
  status: PanelStatus
  result: OrchestratorResult | null
  error: string | null
  diagnosisOnly: boolean
  onTriggerRepair?: (orderNo: string) => void
}

export function ResultDisplay({ status, result, error, diagnosisOnly, onTriggerRepair }: ResultDisplayProps) {
  if (status === 'loading') {
    return <LoadingSkeleton />
  }

  if (status === 'error' && error) {
    return (
      <div className="rounded-md border border-destructive p-4" data-testid="result-error">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!result || result.results.length === 0) {
    return <EmptyState />
  }

  // 批量模式
  if (result.mode === 'batch') {
    return <BatchResultDisplay result={result} diagnosisOnly={diagnosisOnly} onTriggerRepair={onTriggerRepair} />
  }

  // 单条模式
  const pipeline = result.results[0]
  const showAddressForm = pipeline.diagnosis &&
    isAddressMissing(pipeline.diagnosis) &&
    pipeline.diagnosis.order_context?.order_no

  return (
    <div className="space-y-4" data-testid="result-display">
      {pipeline.diagnosis && (
        <DiagnosisCard
          diagnosis={pipeline.diagnosis}
          stageReached={pipeline.stage_reached}
          error={pipeline.error}
          diagnosisOnly={diagnosisOnly}
          onTriggerRepair={pipeline.order_no ? () => onTriggerRepair?.(pipeline.order_no!) : undefined}
        />
      )}
      {showAddressForm && (
        <AddressForm
          orderNo={pipeline.diagnosis!.order_context!.order_no}
          onSubmitSuccess={pipeline.order_no ? () => onTriggerRepair?.(pipeline.order_no!) : undefined}
        />
      )}
      {pipeline.repair && <RepairCard repair={pipeline.repair} />}
      {pipeline.learning && <LearningCard learning={pipeline.learning} />}
    </div>
  )
}

function BatchResultDisplay({
  result,
  diagnosisOnly,
  onTriggerRepair,
}: {
  result: OrchestratorResult
  diagnosisOnly: boolean
  onTriggerRepair?: (orderNo: string) => void
}) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-4" data-testid="batch-result-display">
      <BatchSummaryCard summary={result.summary} />
      <div className="space-y-2">
        {result.results.map((pipeline, index) => (
          <Collapsible
            key={index}
            open={openItems.has(index)}
            onOpenChange={() => toggleItem(index)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border p-3 hover:bg-muted/50 text-sm" data-testid={`batch-item-trigger-${index}`}>
              <span className="font-medium">{pipeline.order_no || `结果 ${index + 1}`}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{pipeline.stage_reached}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${openItems.has(index) ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-2 pl-2">
              {pipeline.diagnosis && (
                <DiagnosisCard
                  diagnosis={pipeline.diagnosis}
                  stageReached={pipeline.stage_reached}
                  error={pipeline.error}
                  diagnosisOnly={diagnosisOnly}
                  onTriggerRepair={pipeline.order_no ? () => onTriggerRepair?.(pipeline.order_no!) : undefined}
                />
              )}
              {pipeline.diagnosis && isAddressMissing(pipeline.diagnosis) && pipeline.diagnosis.order_context?.order_no && (
                <AddressForm
                  orderNo={pipeline.diagnosis.order_context.order_no}
                  onSubmitSuccess={pipeline.order_no ? () => onTriggerRepair?.(pipeline.order_no!) : undefined}
                />
              )}
              {pipeline.repair && <RepairCard repair={pipeline.repair} />}
              {pipeline.learning && <LearningCard learning={pipeline.learning} />}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
