"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { POStatus } from "@/lib/enums/po-status"
import { useI18n } from "@/components/i18n-provider"
import { Edit, Send, Truck, Package, X, Eye, CheckCircle } from "lucide-react"

export default function PONewStatusActionsTestPage() {
  const { t, language, setLanguage } = useI18n()

  // Mock PO data with NEW status
  const mockNewPO = {
    id: "1",
    orderNo: "PO202403150001",
    status: POStatus.NEW,
    supplierName: "ABC Suppliers Inc.",
    totalAmount: 12500.00,
    currency: "USD",
  }

  // Define actions for NEW status
  const newStatusActions = [
    { 
      label: t('send'), 
      icon: <Send className="h-4 w-4" />, 
      action: () => console.log("Send to supplier", mockNewPO.orderNo),
      description: "发送给供应商确认"
    },
    { 
      label: t('createShipment'), 
      icon: <Truck className="h-4 w-4" />, 
      action: () => console.log("Create shipment", mockNewPO.orderNo),
      description: "创建发运单，开始物流流程"
    },
    { 
      label: t('createReceipt'), 
      icon: <Package className="h-4 w-4" />, 
      action: () => console.log("Create receipt", mockNewPO.orderNo),
      description: "创建收货单，直接入库"
    },
    { 
      label: t('cancel'), 
      icon: <X className="h-4 w-4" />, 
      action: () => console.log("Cancel PO", mockNewPO.orderNo),
      description: "取消采购订单",
      variant: "destructive" as const
    },
  ]

  // Batch actions for NEW status
  const batchActions = [
    { 
      label: t('batchSend'), 
      action: () => console.log("Batch send"),
      description: "批量发送给供应商"
    },
    { 
      label: t('batchCreateShipment'), 
      action: () => console.log("Batch create shipment"),
      description: "批量创建发运单"
    },
    { 
      label: t('batchCreateReceipt'), 
      action: () => console.log("Batch create receipt"),
      description: "批量创建收货单"
    },
    { 
      label: t('batchCancel'), 
      action: () => console.log("Batch cancel"),
      description: "批量取消订单",
      variant: "destructive" as const
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">PO NEW Status Actions Test</h1>
        <div className="flex gap-2">
          <Button 
            variant={language === 'zh' ? 'default' : 'outline'}
            onClick={() => setLanguage('zh')}
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

      {/* Mock PO Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mock PO - {mockNewPO.orderNo}</span>
            <StatusBadge status={mockNewPO.status} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">供应商:</span>
              <span className="ml-2">{mockNewPO.supplierName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">金额:</span>
              <span className="ml-2">{mockNewPO.currency} {mockNewPO.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Actions for NEW Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newStatusActions.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span className="font-medium">{action.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                <Button 
                  size="sm" 
                  onClick={action.action}
                  variant={action.variant || "outline"}
                  className="w-full"
                >
                  {action.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Actions for NEW Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchActions.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="font-medium">{action.label}</div>
                <p className="text-sm text-muted-foreground">{action.description}</p>
                <Button 
                  size="sm" 
                  onClick={action.action}
                  variant={action.variant || "outline"}
                  className="w-full"
                >
                  {action.label}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Flow Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>NEW Status Action Flow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">操作流程说明 (Action Flow)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-green-600" />
                <span><strong>发送 (Send):</strong> 发送给供应商确认，状态可能变为待确认</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <span><strong>创建发运单 (Create Shipment):</strong> 开始物流流程，状态变为运输中</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span><strong>创建收货单 (Create Receipt):</strong> 直接入库，状态变为收货中</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <span><strong>取消 (Cancel):</strong> 取消订单，状态变为已取消</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Test */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Individual Actions</h4>
              <div className="space-y-1 text-sm">
                <div>send: {t('send')}</div>
                <div>createShipment: {t('createShipment')}</div>
                <div>createReceipt: {t('createReceipt')}</div>
                <div>cancel: {t('cancel')}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Batch Actions</h4>
              <div className="space-y-1 text-sm">
                <div>batchSend: {t('batchSend')}</div>
                <div>batchCreateShipment: {t('batchCreateShipment')}</div>
                <div>batchCreateReceipt: {t('batchCreateReceipt')}</div>
                <div>batchCancel: {t('batchCancel')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}