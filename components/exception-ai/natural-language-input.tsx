"use client"

import { useState, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'

interface NaturalLanguageInputProps {
  onSubmit: (text: string) => void
  isLoading: boolean
  error: string | null
}

export function NaturalLanguageInput({ onSubmit, isLoading, error }: NaturalLanguageInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    onSubmit(trimmed)
  }, [text, isLoading, onSubmit])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  return (
    <div className="space-y-2" data-testid="natural-language-input">
      <Textarea
        placeholder="描述您遇到的问题，例如：帮我查 SO00522427 的异常、SKU 1823810 not found 怎么处理"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        disabled={isLoading}
        data-testid="symptom-textarea"
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          按 Ctrl+Enter 快捷提交
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !text.trim()}
          aria-label="提交诊断请求"
          data-testid="submit-symptom"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          提交
        </Button>
      </div>
      {error && (
        <p className="text-destructive text-sm" data-testid="input-error">
          {error}
        </p>
      )}
    </div>
  )
}
