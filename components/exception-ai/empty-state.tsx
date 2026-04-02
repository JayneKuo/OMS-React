"use client"

import { Inbox } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
      <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground text-sm">
        输入问题描述或使用快捷操作开始诊断
      </p>
    </div>
  )
}
