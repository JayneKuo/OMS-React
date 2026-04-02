"use client"

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Users } from 'lucide-react'

interface QuickActionBarProps {
  onOrderQuery: (orderNo: string) => void
  onMerchantBatch: (merchantNo: string) => void
  isLoading: boolean
}

export function QuickActionBar({ onOrderQuery, onMerchantBatch, isLoading }: QuickActionBarProps) {
  const [orderNo, setOrderNo] = useState('')
  const [merchantNo, setMerchantNo] = useState('')
  const [orderError, setOrderError] = useState('')
  const [merchantError, setMerchantError] = useState('')

  const handleOrderSubmit = useCallback(() => {
    if (!orderNo.trim()) {
      setOrderError('请输入订单号')
      return
    }
    setOrderError('')
    onOrderQuery(orderNo.trim())
  }, [orderNo, onOrderQuery])

  const handleMerchantSubmit = useCallback(() => {
    if (!merchantNo.trim()) {
      setMerchantError('请输入商户号')
      return
    }
    setMerchantError('')
    onMerchantBatch(merchantNo.trim())
  }, [merchantNo, onMerchantBatch])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-testid="quick-action-bar">
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Search className="h-4 w-4 text-primary" />
            按订单号查询
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="输入订单号"
              value={orderNo}
              onChange={e => { setOrderNo(e.target.value); setOrderError('') }}
              disabled={isLoading}
              data-testid="order-no-input"
            />
            <Button
              size="sm"
              onClick={handleOrderSubmit}
              disabled={isLoading}
              aria-label="按订单号查询"
              data-testid="order-query-btn"
            >
              查询
            </Button>
          </div>
          {orderError && (
            <p className="text-destructive text-xs" data-testid="order-error">{orderError}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-primary" />
            按商户批量诊断
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="输入商户号"
              value={merchantNo}
              onChange={e => { setMerchantNo(e.target.value); setMerchantError('') }}
              disabled={isLoading}
              data-testid="merchant-no-input"
            />
            <Button
              size="sm"
              onClick={handleMerchantSubmit}
              disabled={isLoading}
              aria-label="按商户批量诊断"
              data-testid="merchant-batch-btn"
            >
              诊断
            </Button>
          </div>
          {merchantError && (
            <p className="text-destructive text-xs" data-testid="merchant-error">{merchantError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
