"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (text: string) => void
  isLoading: boolean
  diagnosisOnly: boolean
  onDiagnosisOnlyChange: (v: boolean) => void
  placeholder?: string
}

export function ChatInput({ onSend, isLoading, diagnosisOnly, onDiagnosisOnlyChange, placeholder }: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setText('')
  }, [text, isLoading, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [text])

  return (
    <div className="border-t bg-background p-4" data-testid="chat-input">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder || "描述问题、输入订单号或商户号..."}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none flex-1"
          data-testid="chat-textarea"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !text.trim()}
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="发送"
          data-testid="chat-send-btn"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <Switch
          id="chat-diagnosis-only"
          checked={diagnosisOnly}
          onCheckedChange={onDiagnosisOnlyChange}
          data-testid="diagnosis-only-toggle"
        />
        <Label htmlFor="chat-diagnosis-only" className="text-xs text-muted-foreground cursor-pointer">
          仅诊断
        </Label>
        <span className="text-xs text-muted-foreground ml-auto">Enter 发送 · Shift+Enter 换行</span>
      </div>
    </div>
  )
}
