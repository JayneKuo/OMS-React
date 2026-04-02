"use client"

import { useState, useCallback, useEffect } from 'react'
import type { OrchestratorResult } from '@/lib/orchestrator/types'
import type { HistoryRecord } from './types'

const STORAGE_KEY = 'exception-ai-history'
const MAX_RECORDS = 50

interface StorageData {
  records: HistoryRecord[]
}

function readFromStorage(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data: StorageData = JSON.parse(raw)
    return Array.isArray(data.records) ? data.records : []
  } catch {
    return []
  }
}

function writeToStorage(records: HistoryRecord[]): void {
  try {
    const data: StorageData = { records }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage 写入失败时静默降级
  }
}

export interface UseHistoryReturn {
  records: HistoryRecord[]
  addRecord: (result: OrchestratorResult, inputSummary: string) => void
  selectedId: string | null
  selectRecord: (id: string) => void
}

export function useHistory(): UseHistoryReturn {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // 初始化时从 localStorage 读取
  useEffect(() => {
    setRecords(readFromStorage())
  }, [])

  const addRecord = useCallback((result: OrchestratorResult, inputSummary: string) => {
    const overallStatus = result.summary.failed > 0
      ? 'failed'
      : result.summary.repaired > 0
        ? 'success'
        : result.summary.diagnosed > 0
          ? 'partial'
          : 'error'

    const newRecord: HistoryRecord = {
      id: result.run_id,
      timestamp: result.completed_at || new Date().toISOString(),
      inputSummary: inputSummary.slice(0, 50),
      mode: result.mode,
      overallStatus,
      result,
    }

    setRecords(prev => {
      const updated = [newRecord, ...prev].slice(0, MAX_RECORDS)
      writeToStorage(updated)
      return updated
    })
  }, [])

  const selectRecord = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  return { records, addRecord, selectedId, selectRecord }
}
