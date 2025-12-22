"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { POStatus, ShippingStatus, ReceivingStatus } from '@/lib/enums/po-status'

export default function StatusBadgeTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">状态徽章测试</h1>
        <p className="text-muted-foreground mt-2">
          测试StatusBadge组件是否正确显示中文
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PO状态测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={POStatus.NEW} language="cn" />
              <span className="text-xs text-muted-foreground">NEW</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={POStatus.IN_PROGRESS} language="cn" />
              <span className="text-xs text-muted-foreground">IN_PROGRESS</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={POStatus.COMPLETE} language="cn" />
              <span className="text-xs text-muted-foreground">COMPLETE</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={POStatus.CANCELLED} language="cn" />
              <span className="text-xs text-muted-foreground">CANCELLED</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={POStatus.EXCEPTION} language="cn" />
              <span className="text-xs text-muted-foreground">EXCEPTION</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>运输状态测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ShippingStatus.SHIPPED} language="cn" />
              <span className="text-xs text-muted-foreground">SHIPPED</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ShippingStatus.IN_TRANSIT} language="cn" />
              <span className="text-xs text-muted-foreground">IN_TRANSIT</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ShippingStatus.ARRIVED} language="cn" />
              <span className="text-xs text-muted-foreground">ARRIVED</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ShippingStatus.SHIPPING_EXCEPTION} language="cn" />
              <span className="text-xs text-muted-foreground">SHIPPING_EXCEPTION</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>收货状态测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ReceivingStatus.NOT_RECEIVED} language="cn" />
              <span className="text-xs text-muted-foreground">NOT_RECEIVED</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ReceivingStatus.PARTIAL_RECEIVED} language="cn" />
              <span className="text-xs text-muted-foreground">PARTIAL_RECEIVED</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <StatusBadge status={ReceivingStatus.RECEIVED} language="cn" />
              <span className="text-xs text-muted-foreground">RECEIVED</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}