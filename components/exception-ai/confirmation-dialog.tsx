"use client"

import type { ActionResult } from '@/lib/repair/types'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

interface ConfirmationDialogProps {
  open: boolean
  onConfirm: () => void
  onReject: () => void
  actions: ActionResult[]
}

export function ConfirmationDialog({ open, onConfirm, onReject, actions }: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onReject() }}>
      <AlertDialogContent data-testid="confirmation-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>确认修复操作</AlertDialogTitle>
          <AlertDialogDescription>
            以下修复动作需要您的确认才能执行，请仔细审查后决定。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 my-4" data-testid="confirmation-actions">
          {actions.map((action) => (
            <div key={action.action_code} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium" data-testid="confirm-action-code">{action.action_code}</span>
              <Badge variant="destructive" className="text-xs" data-testid="confirm-action-risk">
                需确认
              </Badge>
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onReject} data-testid="reject-btn">
            拒绝
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-testid="confirm-btn"
          >
            确认执行
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
