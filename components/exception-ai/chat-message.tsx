"use client"

import type { ReactNode } from 'react'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'ai' | 'user'
  children: ReactNode
  timestamp?: string
}

export function ChatMessage({ role, children, timestamp }: ChatMessageProps) {
  const isAi = role === 'ai'

  return (
    <div
      className={`flex gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
      data-testid={`chat-msg-${role}`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isAi ? 'bg-primary/10' : 'bg-muted'
        }`}
      >
        {isAi ? (
          <Bot className="h-4 w-4 text-primary" />
        ) : (
          <User className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          isAi
            ? 'rounded-tl-sm bg-muted/60'
            : 'rounded-tr-sm bg-primary text-primary-foreground'
        }`}
      >
        {children}
        {timestamp && (
          <p className={`text-xs mt-1.5 ${isAi ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}
