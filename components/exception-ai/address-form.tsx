"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './chat-message'
import { MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export interface ShipToAddress {
  name: string
  address1: string
  city: string
  state: string
  country: string
  zipCode: string
  phone: string
}

interface AddressFormProps {
  orderNo: string
  onSubmitSuccess?: () => void
}

type FormStatus = 'pending' | 'submitting' | 'success' | 'error'

const EMPTY: ShipToAddress = { name: '', address1: '', city: '', state: '', country: '', zipCode: '', phone: '' }

const FIELDS: { key: keyof ShipToAddress; label: string; placeholder: string; required: boolean }[] = [
  { key: 'name', label: '收件人', placeholder: 'John Doe', required: true },
  { key: 'address1', label: '地址', placeholder: '12345 Neverland Lane', required: true },
  { key: 'city', label: '城市', placeholder: 'Beverly Hills', required: true },
  { key: 'state', label: '州/省', placeholder: 'CA', required: true },
  { key: 'country', label: '国家', placeholder: 'US', required: true },
  { key: 'zipCode', label: '邮编', placeholder: '90210', required: true },
  { key: 'phone', label: '电话', placeholder: '+1 555-0100', required: false },
]

export function AddressForm({ orderNo, onSubmitSuccess }: AddressFormProps) {
  const [address, setAddress] = useState<ShipToAddress>(EMPTY)
  const [status, setStatus] = useState<FormStatus>('pending')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isValid = FIELDS.filter(f => f.required).every(f => address[f.key].trim() !== '')

  const handleChange = (key: keyof ShipToAddress, value: string) => {
    setAddress(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    if (!isValid) return
    setStatus('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/exception/update-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNo, shipToAddress: address }),
      })
      const body = await res.json()
      if (!res.ok || body.error) throw new Error(body.error || '提交失败')
      setStatus('success')
      onSubmitSuccess?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '未知错误')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-3" data-testid="address-chat-flow">
      {/* AI 请求：像 Kiro 授权卡片一样，一次性告知需要什么 */}
      <ChatMessage role="ai">
        <div className="space-y-3">
          {/* 标题行 */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium">需要你提供收货地址</span>
          </div>

          {/* 说明 */}
          <p className="text-muted-foreground">
            订单 <span className="font-medium text-foreground">{orderNo}</span> 缺少收货地址，
            我需要以下信息来补充地址并重新分派订单：
          </p>

          {/* 所需字段清单 + 输入 — 一次性展示 */}
          <div className="rounded-lg border bg-background p-3 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FIELDS.map(({ key, label, placeholder, required }) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`addr-${key}`} className="text-xs text-muted-foreground">
                    {label}{required && <span className="text-destructive ml-0.5">*</span>}
                  </Label>
                  <Input
                    id={`addr-${key}`}
                    data-testid={`address-${key}`}
                    placeholder={placeholder}
                    value={address[key]}
                    onChange={e => handleChange(key, e.target.value)}
                    disabled={status === 'submitting' || status === 'success'}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* 错误提示 */}
            {status === 'error' && errorMsg && (
              <div className="flex items-center gap-2 text-sm text-destructive" data-testid="address-form-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 操作按钮 — 类似 Kiro 的 "允许 / 拒绝" */}
            {status !== 'success' && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={handleSubmit}
                  disabled={!isValid || status === 'submitting'}
                  size="sm"
                  className="flex-1"
                  data-testid="address-submit-btn"
                >
                  {status === 'submitting' ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-3.5 w-3.5" />
                  )}
                  {status === 'submitting' ? '提交中...' : '确认提交'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </ChatMessage>

      {/* 提交成功后 AI 确认 */}
      {status === 'success' && (
        <ChatMessage role="ai">
          <div className="flex items-start gap-2" data-testid="address-form-success">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-400">
                地址已补充，订单已重新分派
              </p>
              <p className="text-muted-foreground mt-0.5">
                {orderNo} 已从异常恢复并触发自动分派，稍后可在订单列表查看状态。
              </p>
            </div>
          </div>
        </ChatMessage>
      )}
    </div>
  )
}
