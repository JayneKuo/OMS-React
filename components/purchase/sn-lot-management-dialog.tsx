"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Package, Hash } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

interface SNLotManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  skuCode: string
  quantity: number
  requiresSerialNumber: boolean
  requiresLotNumber: boolean
  specifiedSerialNumbers: string[]
  specifiedLotNumbers: string[]
  snLotNotes: string
  onSave: (data: {
    specifiedSerialNumbers: string[]
    specifiedLotNumbers: string[]
    snLotNotes: string
  }) => void
}

export function SNLotManagementDialog({
  open,
  onOpenChange,
  productName,
  skuCode,
  quantity,
  requiresSerialNumber,
  requiresLotNumber,
  specifiedSerialNumbers,
  specifiedLotNumbers,
  snLotNotes,
  onSave
}: SNLotManagementDialogProps) {
  const { t } = useI18n()
  const [serialNumbers, setSerialNumbers] = React.useState<string[]>(specifiedSerialNumbers)
  const [lotNumbers, setLotNumbers] = React.useState<string[]>(specifiedLotNumbers)
  const [notes, setNotes] = React.useState(snLotNotes)

  // 重置状态当对话框打开时
  React.useEffect(() => {
    if (open) {
      setSerialNumbers(specifiedSerialNumbers)
      setLotNumbers(specifiedLotNumbers)
      setNotes(snLotNotes)
    }
  }, [open, specifiedSerialNumbers, specifiedLotNumbers, snLotNotes])

  // 添加序列号
  const addSerialNumber = () => {
    setSerialNumbers([...serialNumbers, ''])
  }

  // 更新序列号
  const updateSerialNumber = (index: number, value: string) => {
    const updated = [...serialNumbers]
    updated[index] = value
    setSerialNumbers(updated)
  }

  // 删除序列号
  const removeSerialNumber = (index: number) => {
    setSerialNumbers(serialNumbers.filter((_, i) => i !== index))
  }

  // 添加批次号
  const addLotNumber = () => {
    setLotNumbers([...lotNumbers, ''])
  }

  // 更新批次号
  const updateLotNumber = (index: number, value: string) => {
    const updated = [...lotNumbers]
    updated[index] = value
    setLotNumbers(updated)
  }

  // 删除批次号
  const removeLotNumber = (index: number) => {
    setLotNumbers(lotNumbers.filter((_, i) => i !== index))
  }

  // 保存并关闭
  const handleSave = () => {
    onSave({
      specifiedSerialNumbers: serialNumbers.filter(sn => sn.trim() !== ''),
      specifiedLotNumbers: lotNumbers.filter(lot => lot.trim() !== ''),
      snLotNotes: notes
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('snLotManagement')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-auto">
          {/* 商品信息 */}
          <div className="p-3 bg-muted rounded-md">
            <div className="font-medium">{productName}</div>
            <div className="text-sm text-muted-foreground">SKU: {skuCode}</div>
            <div className="text-sm text-muted-foreground">{t('quantity' as any)}: {quantity}</div>
          </div>

          {/* 序列号管理 */}
          {requiresSerialNumber && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {t('serialNumberManagement')}
                </Label>
                <Button size="sm" onClick={addSerialNumber}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('specifySerialNumbers')}
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-auto">
                {serialNumbers.map((sn, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={sn}
                      onChange={(e) => updateSerialNumber(index, e.target.value)}
                      placeholder={`${t('serialNumberManagement')} ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSerialNumber(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {serialNumbers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t('enterSerialNumbers')}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                提示: 如果不指定具体序列号，将在收货时记录实际收到的序列号
              </div>
            </div>
          )}

          {/* 分隔线 */}
          {requiresSerialNumber && requiresLotNumber && <Separator />}

          {/* 批次号管理 */}
          {requiresLotNumber && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('lotNumberManagement')}
                </Label>
                <Button size="sm" onClick={addLotNumber}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('specifyLotNumbers')}
                </Button>
              </div>

              <div className="space-y-2 max-h-40 overflow-auto">
                {lotNumbers.map((lot, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={lot}
                      onChange={(e) => updateLotNumber(index, e.target.value)}
                      placeholder={`${t('lotNumberManagement')} ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLotNumber(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {lotNumbers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t('enterLotNumbers')}
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                提示: 如果不指定具体批次号，将在收货时记录实际收到的批次号
              </div>
            </div>
          )}

          {/* 备注说明 */}
          <div className="space-y-2">
            <Label>{t('snLotNotes')}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('enterNotes')}
              rows={3}
            />
          </div>

          {/* 统计信息 */}
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">管理要求:</div>
              <div className="space-y-1 text-xs">
                {requiresSerialNumber && (
                  <div>• 序列号管理: 已指定 {serialNumbers.filter(sn => sn.trim()).length} 个序列号</div>
                )}
                {requiresLotNumber && (
                  <div>• 批次号管理: 已指定 {lotNumbers.filter(lot => lot.trim()).length} 个批次号</div>
                )}
                <div>• 采购数量: {quantity} 件</div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('save')}设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}