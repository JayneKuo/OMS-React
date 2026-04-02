"use client"

import { useRef, useEffect, useState, useCallback } from 'react'
import { useExceptionAI } from '@/lib/exception-ai/use-exception-ai'
import { useHistory } from '@/lib/exception-ai/use-history'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ChatResultBubbles } from './chat-result-bubbles'
import { HistoryPanel } from './history-panel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, Loader2, ShieldCheck, X, Sparkles } from 'lucide-react'
import type { OrchestratorResult } from '@/lib/orchestrator/types'
import { classifyIntent } from '@/lib/ai/intent-client'
import type { IntentContext } from '@/lib/ai/types'

interface ChatEntry {
  id: string
  role: 'ai' | 'user'
  content?: string
  result?: OrchestratorResult
  isLoading?: boolean
  isError?: boolean
  timestamp: string
}

/**
 * Parse address from user's free-text input.
 * Supports:
 *   - Key-value lines: "收件人: John Doe\n地址: 123 Main St\n..."
 *   - Comma-separated: "John Doe, 123 Main St, City, CA, US, 90210"
 */
function parseAddress(text: string): { name: string; address1: string; city: string; state: string; country: string; zipCode: string; phone?: string } | null {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean)

  // Try key-value format
  if (lines.some(l => l.includes(':'))) {
    const map: Record<string, string> = {}
    for (const line of lines) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim().toLowerCase()
      const val = line.slice(idx + 1).trim()
      if (key.includes('收件') || key.includes('name')) map.name = val
      else if (key.includes('地址') || key.includes('address')) map.address1 = val
      else if (key.includes('城市') || key.includes('city')) map.city = val
      else if (key.includes('州') || key.includes('省') || key.includes('state')) map.state = val
      else if (key.includes('国') || key.includes('country')) map.country = val
      else if (key.includes('邮编') || key.includes('zip')) map.zipCode = val
      else if (key.includes('电话') || key.includes('phone') || key.includes('tel')) map.phone = val
    }
    if (map.name && map.address1 && map.city && map.state && map.country && map.zipCode) {
      return map as { name: string; address1: string; city: string; state: string; country: string; zipCode: string; phone?: string }
    }
  }

  // Try comma-separated: name, address, city, state, country, zip[, phone]
  const parts = text.split(/[,，]/).map(p => p.trim()).filter(Boolean)
  if (parts.length >= 6) {
    return {
      name: parts[0],
      address1: parts[1],
      city: parts[2],
      state: parts[3],
      country: parts[4],
      zipCode: parts[5],
      ...(parts[6] ? { phone: parts[6] } : {}),
    }
  }

  return null
}

export function ExceptionAIPanel() {
  const history = useHistory()
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: '你好，我是 AI 异常处理助手。你可以输入订单号、商户号或描述遇到的问题，我来帮你诊断和修复。',
      timestamp: new Date().toISOString(),
    },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  const ai = useExceptionAI((result, inputSummary) => {
    history.addRecord(result, inputSummary)
    setMessages(prev => {
      const updated = prev.filter(m => !m.isLoading)
      return [
        ...updated,
        { id: result.run_id, role: 'ai' as const, result, timestamp: result.completed_at },
      ]
    })
    scrollToBottom()
  })

  // Handle loading state
  useEffect(() => {
    if (ai.status === 'loading') {
      setMessages(prev => {
        if (prev.some(m => m.isLoading)) return prev
        return [
          ...prev,
          { id: 'loading', role: 'ai', isLoading: true, timestamp: new Date().toISOString() },
        ]
      })
      scrollToBottom()
    }
  }, [ai.status, scrollToBottom])

  // Handle error state
  useEffect(() => {
    if (ai.status === 'error' && ai.error) {
      setMessages(prev => {
        const updated = prev.filter(m => !m.isLoading)
        return [
          ...updated,
          { id: `error-${Date.now()}`, role: 'ai', content: ai.error!, isError: true, timestamp: new Date().toISOString() },
        ]
      })
      scrollToBottom()
    }
  }, [ai.status, ai.error, scrollToBottom])

  // Track if we're waiting for user to provide address
  const pendingAddressPipeline = ai.result?.results.find(
    r => r.needs_user_input && r.user_input_type === 'address'
  )
  const pendingAddressOrder = pendingAddressPipeline?.order_no
  const pendingChannelOrderNo = pendingAddressPipeline?.diagnosis?.order_context?.channel_sales_order_no

  const addAiMessage = useCallback((content: string) => {
    setMessages(prev => [
      ...prev,
      { id: `ai-${Date.now()}`, role: 'ai', content, timestamp: new Date().toISOString() },
    ])
    scrollToBottom()
  }, [scrollToBottom])

  /** 构建 LLM 意图识别所需的上下文 */
  const buildIntentContext = useCallback((text: string): IntentContext => {
    const lastDiag = ai.result?.results?.[0]?.diagnosis
    let lastDiagSummary: string | undefined
    if (lastDiag) {
      const cause = lastDiag.root_causes[0]?.cause_description || '未知'
      lastDiagSummary = `订单 ${ai.result?.results?.[0]?.order_no || '未知'}, 根因: ${cause}, 置信度: ${Math.round(lastDiag.overall_confidence * 100)}%`
    }

    const recentMsgs = messages
      .filter(m => m.content && !m.isLoading && !m.isError)
      .slice(-6)
      .map(m => ({ role: m.role === 'user' ? 'user' as const : 'ai' as const, content: m.content! }))

    return {
      user_input: text,
      last_diagnosis_summary: lastDiagSummary,
      pending_address_order: pendingAddressOrder || undefined,
      recent_messages: recentMsgs,
    }
  }, [ai.result, messages, pendingAddressOrder])

  const handleSend = useCallback(async (text: string) => {
    const now = new Date().toISOString()
    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: now },
    ])
    scrollToBottom()

    const trimmed = text.trim()

    // 使用 LLM 进行意图识别
    const intentCtx = buildIntentContext(trimmed)
    const intent = await classifyIntent(intentCtx)

    switch (intent.intent) {
      case 'address_input': {
        // 地址输入处理
        if (!pendingAddressOrder) {
          addAiMessage('当前没有等待地址输入的订单。请先输入订单号进行诊断。')
          return
        }
        const parsed = parseAddress(trimmed)
        if (!parsed) {
          addAiMessage('无法解析地址，请按格式输入：收件人, 地址, 城市, 州/省, 国家, 邮编')
          return
        }
        setMessages(prev => [
          ...prev,
          { id: 'addr-loading', role: 'ai', isLoading: true, timestamp: new Date().toISOString() },
        ])
        scrollToBottom()
        try {
          const res = await fetch('/api/exception/update-address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNo: pendingAddressOrder, shipToAddress: parsed, channelSalesOrderNo: pendingChannelOrderNo }),
          })
          const body = await res.json()
          setMessages(prev => {
            const updated = prev.filter(m => !m.isLoading)
            if (!res.ok || body.error) {
              return [...updated, { id: `addr-err-${Date.now()}`, role: 'ai' as const, content: `地址提交失败: ${body.error || '未知错误'}`, isError: true, timestamp: new Date().toISOString() }]
            }
            return [...updated, { id: `addr-ok-${Date.now()}`, role: 'ai' as const, content: `地址已补充，订单 ${pendingAddressOrder} 已重新分派。`, timestamp: new Date().toISOString() }]
          })
        } catch {
          setMessages(prev => {
            const updated = prev.filter(m => !m.isLoading)
            return [...updated, { id: `addr-err-${Date.now()}`, role: 'ai' as const, content: '网络错误，请重试', isError: true, timestamp: new Date().toISOString() }]
          })
        }
        scrollToBottom()
        return
      }

      case 'order_query': {
        const orderNo = intent.entities.order_no || trimmed.match(/SO\d+/i)?.[0] || trimmed
        ai.submitOrderQuery(orderNo.toUpperCase())
        return
      }

      case 'merchant_batch': {
        const merchantNo = intent.entities.merchant_no || trimmed
        ai.submitMerchantBatch(merchantNo)
        return
      }

      case 'repair_command': {
        const orderNo = intent.entities.order_no || ai.result?.results?.[0]?.order_no
        if (orderNo) {
          ai.triggerRepair(orderNo)
        } else {
          addAiMessage('没有找到可修复的订单，请先输入订单号进行诊断。')
        }
        return
      }

      case 'explain':
      case 'conversation':
      case 'knowledge_query': {
        const reply = intent.reply || '我是异常处理助手，请输入订单号或描述异常问题，我来帮你诊断。'
        addAiMessage(reply)
        return
      }

      case 'teach_knowledge': {
        // 用户想教系统学习新知识
        let knowledge = intent.knowledge

        // 如果 LLM 意图识别没有提取出完整的知识结构，用专门的知识提取 API 再试一次
        if (!knowledge?.domain || !knowledge?.symptom_signals?.length || !knowledge?.root_cause) {
          try {
            const extractRes = await fetch('/api/ai/extract-knowledge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: trimmed }),
            })
            if (extractRes.ok) {
              knowledge = await extractRes.json()
            }
          } catch { /* fallback below */ }
        }

        if (!knowledge?.domain || !knowledge?.symptom_signals?.length || !knowledge?.root_cause) {
          addAiMessage('我理解你想教我学习新知识，但我没能从你的描述中提取出完整的知识结构。请尝试更具体地描述，包含：\n\n1. 什么症状/错误（如"SKU not found"、"地址缺失"）\n2. 根因或处理方法\n\n例如："记住，遇到 SKU not found 错误时，根因是商品未在 Item Master 创建，应该先创建商品再 reopen 订单"')
          return
        }

        setMessages(prev => [
          ...prev,
          { id: `learn-loading-${Date.now()}`, role: 'ai', isLoading: true, timestamp: new Date().toISOString() },
        ])
        scrollToBottom()

        try {
          const res = await fetch('/api/learning/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain: knowledge.domain,
              symptom_signals: knowledge.symptom_signals,
              root_cause: knowledge.root_cause,
              actions: knowledge.recommended_actions || [],
              author: 'chat_user',
            }),
          })
          const body = await res.json()

          setMessages(prev => {
            const updated = prev.filter(m => !m.isLoading)
            if (!res.ok || body.error) {
              return [...updated, {
                id: `learn-err-${Date.now()}`,
                role: 'ai' as const,
                content: `知识学习失败: ${body.message || body.error || '未知错误'}`,
                isError: true,
                timestamp: new Date().toISOString(),
              }]
            }
            const eventCount = body.events?.length || 0
            const atomsCreated = body.atoms_created || 0
            return [...updated, {
              id: `learn-ok-${Date.now()}`,
              role: 'ai' as const,
              content: `已学习新知识 ✅\n\n` +
                `📂 业务域: ${knowledge.domain}\n` +
                `🔍 症状信号: ${(knowledge.symptom_signals || []).join(', ')}\n` +
                `🎯 根因: ${knowledge.root_cause}\n` +
                (knowledge.recommended_actions?.length ? `🔧 建议动作: ${knowledge.recommended_actions.join(', ')}\n` : '') +
                `\n${atomsCreated > 0 ? '新建了知识原子' : '已合并到已有知识'}，共产生 ${eventCount} 条学习事件。下次遇到类似问题我会自动匹配这条知识。`,
              timestamp: new Date().toISOString(),
            }]
          })
        } catch {
          setMessages(prev => {
            const updated = prev.filter(m => !m.isLoading)
            return [...updated, {
              id: `learn-err-${Date.now()}`,
              role: 'ai' as const,
              content: '网络错误，知识学习失败，请重试',
              isError: true,
              timestamp: new Date().toISOString(),
            }]
          })
        }
        scrollToBottom()
        return
      }

      case 'symptom':
      default: {
        // 症状描述或无法识别 → 走诊断管线
        const symptomText = intent.entities.error_message || trimmed
        ai.submitSymptom(symptomText)
        return
      }
    }
  }, [ai, scrollToBottom, pendingAddressOrder, pendingChannelOrderNo, buildIntentContext, addAiMessage])

  const handleSelectHistory = useCallback((record: import('@/lib/exception-ai/types').HistoryRecord) => {
    history.selectRecord(record.id)
    ai.selectHistoryRecord(record)
    setMessages(prev => [
      ...prev,
      { id: `hist-user-${record.id}`, role: 'user', content: record.inputSummary, timestamp: record.timestamp },
      { id: `hist-${record.id}`, role: 'ai', result: record.result, timestamp: record.timestamp },
    ])
    scrollToBottom()
  }, [history, ai, scrollToBottom])

  // Pending confirmation actions
  const pendingActions = ai.confirmationTarget?.repair?.action_results.filter(a => a.status === 'pending_confirmation') || []
  const hasConfirmation = ai.isDialogOpen && pendingActions.length > 0

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6" data-testid="exception-ai-panel">
      {/* Chat area */}
      <div className="flex flex-1 flex-col rounded-lg border bg-background">
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold">AI 异常处理</h1>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                LLM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">智能意图识别 · 诊断 · 修复 · 学习</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map(msg => {
              if (msg.isLoading) {
                return (
                  <ChatMessage key={msg.id} role="ai">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-muted-foreground">正在分析中...</span>
                    </div>
                  </ChatMessage>
                )
              }
              if (msg.result) {
                return (
                  <div key={msg.id} className="space-y-3">
                    <ChatResultBubbles
                      result={msg.result}
                      diagnosisOnly={ai.diagnosisOnly}
                      onTriggerRepair={ai.triggerRepair}
                    />
                  </div>
                )
              }
              return (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  timestamp={new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                >
                  <p className={msg.isError ? 'text-destructive' : ''}>{msg.content}</p>
                </ChatMessage>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Inline confirmation bar — above input, not a dialog */}
        {hasConfirmation && (
          <div className="border-t bg-muted/30 px-4 py-3" data-testid="inline-confirmation">
            <div className="flex items-start gap-3 max-w-3xl mx-auto">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium">以下操作需要你的确认：</p>
                <div className="flex flex-wrap gap-2">
                  {pendingActions.map(a => (
                    <Badge key={a.action_code} variant="outline" className="text-xs">
                      {a.action_code}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={ai.confirmRepair} data-testid="inline-confirm-btn">
                    确认执行
                  </Button>
                  <Button size="sm" variant="ghost" onClick={ai.rejectRepair} data-testid="inline-reject-btn">
                    <X className="mr-1 h-3.5 w-3.5" />
                    拒绝
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={ai.status === 'loading'}
          diagnosisOnly={ai.diagnosisOnly}
          onDiagnosisOnlyChange={ai.setDiagnosisOnly}
          placeholder={pendingAddressOrder
            ? '请输入地址，如: John Doe, 123 Main St, City, CA, US, 90210'
            : undefined
          }
        />
      </div>

      {/* History sidebar */}
      <div className="hidden lg:block w-80 shrink-0">
        <HistoryPanel
          records={history.records}
          onSelectAction={handleSelectHistory}
          selectedId={history.selectedId}
        />
      </div>
    </div>
  )
}
