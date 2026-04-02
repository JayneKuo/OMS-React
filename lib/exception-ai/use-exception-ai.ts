"use client"

import { useState, useCallback } from 'react'
import type { OrchestratorInput, OrchestratorResult, PipelineResult } from '@/lib/orchestrator/types'
import type { PanelStatus, HistoryRecord } from './types'
import { ApiError, } from './types'
import { runExceptionPipeline } from './api'

export interface UseExceptionAIReturn {
  status: PanelStatus
  result: OrchestratorResult | null
  error: string | null
  diagnosisOnly: boolean
  isDialogOpen: boolean
  confirmationTarget: PipelineResult | null

  submitSymptom: (text: string) => Promise<void>
  submitOrderQuery: (orderNo: string) => Promise<void>
  submitMerchantBatch: (merchantNo: string) => Promise<void>
  setDiagnosisOnly: (value: boolean) => void
  triggerRepair: (orderNo: string) => Promise<void>
  confirmRepair: () => Promise<void>
  rejectRepair: () => void
  selectHistoryRecord: (record: HistoryRecord) => void
}

export function useExceptionAI(
  onSuccess?: (result: OrchestratorResult, inputSummary: string) => void
): UseExceptionAIReturn {
  const [status, setStatus] = useState<PanelStatus>('idle')
  const [result, setResult] = useState<OrchestratorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [diagnosisOnly, setDiagnosisOnly] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [confirmationTarget, setConfirmationTarget] = useState<PipelineResult | null>(null)

  const executeRequest = useCallback(async (input: OrchestratorInput, inputSummary: string) => {
    setStatus('loading')
    setError(null)

    try {
      const res = await runExceptionPipeline(input)
      setResult(res)
      setStatus('success')

      // 检查是否有需要确认的修复
      const needsConfirm = res.results.find(r => r.repair?.needs_confirmation)
      if (needsConfirm) {
        setConfirmationTarget(needsConfirm)
        setIsDialogOpen(true)
      }

      onSuccess?.(res, inputSummary)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : '未知错误'
      setError(message)
      setStatus('error')
    }
  }, [isDialogOpen, onSuccess])

  const submitSymptom = useCallback(async (text: string) => {
    await executeRequest(
      { symptom_text: text, auto_repair: !diagnosisOnly, requested_by: 'user' },
      text
    )
  }, [executeRequest, diagnosisOnly])

  const submitOrderQuery = useCallback(async (orderNo: string) => {
    await executeRequest(
      { order_no: orderNo, auto_repair: !diagnosisOnly, requested_by: 'user' },
      orderNo
    )
  }, [executeRequest, diagnosisOnly])

  const submitMerchantBatch = useCallback(async (merchantNo: string) => {
    await executeRequest(
      { merchant_no: merchantNo, auto_repair: !diagnosisOnly, requested_by: 'user' },
      merchantNo
    )
  }, [executeRequest, diagnosisOnly])

  const triggerRepair = useCallback(async (orderNo: string) => {
    await executeRequest(
      { order_no: orderNo, auto_repair: true, requested_by: 'user' },
      orderNo
    )
  }, [executeRequest])

  const confirmRepair = useCallback(async () => {
    if (!confirmationTarget?.order_no) return
    setIsDialogOpen(false)
    setConfirmationTarget(null)
    await executeRequest(
      { order_no: confirmationTarget.order_no, auto_repair: true, requested_by: 'user' },
      confirmationTarget.order_no
    )
  }, [confirmationTarget, executeRequest])

  const rejectRepair = useCallback(() => {
    setIsDialogOpen(false)
    setConfirmationTarget(null)
  }, [])

  const selectHistoryRecord = useCallback((record: HistoryRecord) => {
    setResult(record.result)
    setStatus('success')
    setError(null)
  }, [])

  return {
    status,
    result,
    error,
    diagnosisOnly,
    isDialogOpen,
    confirmationTarget,
    submitSymptom,
    submitOrderQuery,
    submitMerchantBatch,
    setDiagnosisOnly,
    triggerRepair,
    confirmRepair,
    rejectRepair,
    selectHistoryRecord,
  }
}
