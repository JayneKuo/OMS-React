"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, XCircle, Trash2, Send, FileX } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface ActionConfig {
  title: string
  description: string
  icon: React.ReactNode
  confirmText: string
  cancelText: string
  variant: "default" | "destructive"
  requiresReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
}

const getActionConfigs = (t: any): Record<string, ActionConfig> => ({
  cancel: {
    title: t('confirmCancelPR'),
    description: t('cancelDescription'),
    icon: <XCircle className="h-5 w-5 text-orange-500" />,
    confirmText: t('confirmCancel'),
    cancelText: t('keep'),
    variant: "destructive",
  },
  delete: {
    title: t('confirmDelete'),
    description: t('deleteDescription'),
    icon: <Trash2 className="h-5 w-5 text-red-500" />,
    confirmText: t('confirmDeleteAction'),
    cancelText: t('keep'),
    variant: "destructive",
  },
  submit: {
    title: t('submitPR'),
    description: t('submitDescription'),
    icon: <Send className="h-5 w-5 text-blue-500" />,
    confirmText: t('confirmSubmit'),
    cancelText: t('cancel'),
    variant: "default",
  },
  approve: {
    title: t('confirmApprove'),
    description: t('approveDescription'),
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    confirmText: t('confirmApproveAction'),
    cancelText: t('cancel'),
    variant: "default",
  },
  reject: {
    title: t('confirmReject'),
    description: t('rejectDescription'),
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    confirmText: t('confirmRejectAction'),
    cancelText: t('cancel'),
    variant: "destructive",
    requiresReason: true,
    reasonLabel: t('rejectReason'),
    reasonPlaceholder: t('enterRejectReason'),
  },
  cancelUnlinkedPO: {
    title: t('cancelUnlinkedPOLines'),
    description: t('cancelUnlinkedDescription'),
    icon: <FileX className="h-5 w-5 text-orange-500" />,
    confirmText: t('confirmCancel'),
    cancelText: t('keep'),
    variant: "destructive",
  },
})

interface PRActionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: string
  prNo?: string
  onConfirm: (reason?: string) => void
}

export function PRActionConfirmDialog({
  open,
  onOpenChange,
  action,
  prNo,
  onConfirm,
}: PRActionConfirmDialogProps) {
  const { t } = useI18n()
  const [reason, setReason] = React.useState("")
  const actionConfigs = getActionConfigs(t)
  const config = actionConfigs[action]

  if (!config) {
    return null
  }

  const handleConfirm = () => {
    if (config.requiresReason && !reason.trim()) {
      return
    }
    onConfirm(config.requiresReason ? reason : undefined)
    setReason("")
    onOpenChange(false)
  }

  const handleCancel = () => {
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.description}
            {prNo && (
              <div className="mt-2 text-sm text-muted-foreground">
                {t('prNo')}: <span className="font-medium">{prNo}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {config.requiresReason && (
          <div className="space-y-2">
            <Label htmlFor="reason">{config.reasonLabel}</Label>
            <Textarea
              id="reason"
              placeholder={config.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={handleCancel}>
            {config.cancelText}
          </Button>
          <Button
            variant={config.variant}
            onClick={handleConfirm}
            disabled={config.requiresReason && !reason.trim()}
          >
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}