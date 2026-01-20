"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { POStatusSelector, ShippingStatusSelector, ReceivingStatusSelector } from '@/components/purchase/status-selector'
import { 
  POStatus, 
  ShippingStatus, 
  ReceivingStatus,
  getPOStatusOptions,
  getShippingStatusOptions,
  getReceivingStatusOptions
} from '@/lib/enums/po-status'

export default function StatusTestPage() {
  const [selectedPOStatus, setSelectedPOStatus] = useState<POStatus>(POStatus.NEW)
  const [selectedShippingStatus, setSelectedShippingStatus] = useState<ShippingStatus>(ShippingStatus.SHIPPED)
  const [selectedReceivingStatus, setSelectedReceivingStatus] = useState<ReceivingStatus>(ReceivingStatus.NOT_RECEIVED)
  const [language, setLanguage] = useState<'en' | 'cn'>('cn')

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PO状态系统测试</h1>
          <p className="text-muted-foreground mt-2">
            测试采购订单状态、运输状态和收货状态的显示和交互
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={language === 'cn' ? 'default' : 'outline'}
            onClick={() => setLanguage('cn')}
          >
            中文
          </Button>
          <Button 
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
          >
            English
          </Button>
        </div>
      </div>

      {/* 状态徽章展示 */}
      <Card>
        <CardHeader>
          <CardTitle>状态徽章展示</CardTitle>
          <CardDescription>
            展示所有状态的徽章样式和颜色
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PO状态 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">PO状态</h3>
            <div className="flex flex-wrap gap-3">
              {getPOStatusOptions(language).map((option) => (
                <div key={option.value} className="flex flex-col items-center gap-2">
                  <StatusBadge 
                    status={option.value} 
                    language={language}
                    showIcon
                  />
                  <div className="text-xs text-muted-foreground text-center max-w-24">
                    {option.style.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 运输状态 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">运输状态</h3>
            <div className="flex flex-wrap gap-3">
              {getShippingStatusOptions(language).map((option) => (
                <div key={option.value} className="flex flex-col items-center gap-2">
                  <StatusBadge 
                    status={option.value} 
                    language={language}
                    showIcon
                  />
                  <div className="text-xs text-muted-foreground text-center max-w-24">
                    {option.style.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 收货状态 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">收货状态</h3>
            <div className="flex flex-wrap gap-3">
              {getReceivingStatusOptions(language).map((option) => (
                <div key={option.value} className="flex flex-col items-center gap-2">
                  <StatusBadge 
                    status={option.value} 
                    language={language}
                    showIcon
                  />
                  <div className="text-xs text-muted-foreground text-center max-w-24">
                    {option.style.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态选择器测试 */}
      <Card>
        <CardHeader>
          <CardTitle>状态选择器测试</CardTitle>
          <CardDescription>
            测试状态选择器的交互功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PO状态选择器 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">PO状态</label>
              <POStatusSelector
                value={selectedPOStatus}
                onValueChange={(value) => setSelectedPOStatus(value as POStatus)}
                language={language}
              />
              <div className="text-sm text-muted-foreground">
                当前选择: <StatusBadge status={selectedPOStatus} language={language} />
              </div>
            </div>

            {/* 运输状态选择器 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">运输状态</label>
              <ShippingStatusSelector
                value={selectedShippingStatus}
                onValueChange={(value) => setSelectedShippingStatus(value as ShippingStatus)}
                language={language}
              />
              <div className="text-sm text-muted-foreground">
                当前选择: <StatusBadge status={selectedShippingStatus} language={language} />
              </div>
            </div>

            {/* 收货状态选择器 */}
            <div className="space-y-3">
              <label className="text-sm font-medium">收货状态</label>
              <ReceivingStatusSelector
                value={selectedReceivingStatus}
                onValueChange={(value) => setSelectedReceivingStatus(value as ReceivingStatus)}
                language={language}
              />
              <div className="text-sm text-muted-foreground">
                当前选择: <StatusBadge status={selectedReceivingStatus} language={language} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 状态组合示例 */}
      <Card>
        <CardHeader>
          <CardTitle>状态组合示例</CardTitle>
          <CardDescription>
            模拟真实PO的状态组合显示
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 示例PO 1 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">PO-2024-001</h4>
                <StatusBadge status={POStatus.IN_TRANSIT} language={language} showIcon />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">运输状态: </span>
                  <StatusBadge status={ShippingStatus.IN_TRANSIT} language={language} />
                </div>
                <div>
                  <span className="text-muted-foreground">收货状态: </span>
                  <StatusBadge status={ReceivingStatus.NOT_RECEIVED} language={language} />
                </div>
              </div>
            </div>

            {/* 示例PO 2 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">PO-2024-002</h4>
                <StatusBadge status={POStatus.EXCEPTION} language={language} showIcon />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">运输状态: </span>
                  <StatusBadge status={ShippingStatus.SHIPPING_EXCEPTION} language={language} />
                </div>
                <div>
                  <span className="text-muted-foreground">收货状态: </span>
                  <StatusBadge status={ReceivingStatus.PARTIAL_RECEIVED} language={language} />
                </div>
              </div>
            </div>

            {/* 示例PO 3 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">PO-2024-003</h4>
                <StatusBadge status={POStatus.COMPLETED} language={language} showIcon />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">运输状态: </span>
                  <StatusBadge status={ShippingStatus.ARRIVED} language={language} />
                </div>
                <div>
                  <span className="text-muted-foreground">收货状态: </span>
                  <StatusBadge status={ReceivingStatus.RECEIVED} language={language} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}