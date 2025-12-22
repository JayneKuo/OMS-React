"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { POStatus } from "@/lib/enums/po-status"
import { useI18n } from "@/components/i18n-provider"
import { Send, Truck, Package, X, Eye, Copy, RotateCcw, MapPin, FileCheck, AlertCircle } from "lucide-react"

export default function POAllStatusActionsTestPage() {
  const { t, language, setLanguage } = useI18n()

  // Mock PO data for different statuses
  const mockPOs = [
    { id: "1", orderNo: "PO001", status: POStatus.NEW, supplierName: "Supplier A" },
    { id: "2", orderNo: "PO002", status: POStatus.IN_TRANSIT, supplierName: "Supplier B" },
    { id: "3", orderNo: "PO003", status: POStatus.WAITING_FOR_RECEIVING, supplierName: "Supplier C" },
    { id: "4", orderNo: "PO004", status: POStatus.RECEIVING, supplierName: "Supplier D" },
    { id: "5", orderNo: "PO005", status: POStatus.PARTIAL_RECEIPT, supplierName: "Supplier E" },
    { id: "6", orderNo: "PO006", status: POStatus.COMPLETED, supplierName: "Supplier F" },
    { id: "7", orderNo: "PO007", status: POStatus.CANCELLED, supplierName: "Supplier G" },
    { id: "8", orderNo: "PO008", status: POStatus.EXCEPTION, supplierName: "Supplier H" },
  ]

  // Define actions for each status
  const getActionsForStatus = (status: POStatus) => {
    switch (status) {
      case POStatus.NEW:
        return [
          { label: t('send'), icon: <Send className="h-4 w-4" />, description: "发送给供应商确认" },
          { label: t('createShipment'), icon: <Truck className="h-4 w-4" />, description: "创建发运单，开始物流流程" },
          { label: t('createReceipt'), icon: <Package className="h-4 w-4" />, description: "创建收货单，直接入库" },
          { label: t('cancel'), icon: <X className="h-4 w-4" />, description: "取消采购订单", variant: "destructive" as const },
        ]
      case POStatus.IN_TRANSIT:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('createShipment'), icon: <Truck className="h-4 w-4" />, description: "创建发运单" },
          { label: t('markArrived'), icon: <MapPin className="h-4 w-4" />, description: "标记货物已送达" },
        ]
      case POStatus.WAITING_FOR_RECEIVING:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('createShipment'), icon: <Truck className="h-4 w-4" />, description: "创建发运单" },
          { label: t('createReceipt'), icon: <Package className="h-4 w-4" />, description: "创建收货单" },
        ]
      case POStatus.RECEIVING:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('createShipment'), icon: <Truck className="h-4 w-4" />, description: "创建发运单" },
          { label: t('completeReceipt'), icon: <FileCheck className="h-4 w-4" />, description: "完成收货流程" },
        ]
      case POStatus.PARTIAL_RECEIPT:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('createShipment'), icon: <Truck className="h-4 w-4" />, description: "创建发运单" },
          { label: t('createReceipt'), icon: <Package className="h-4 w-4" />, description: "创建收货单" },
        ]
      case POStatus.COMPLETED:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('copy'), icon: <Copy className="h-4 w-4" />, description: "复制为新订单" },
        ]
      case POStatus.CANCELLED:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('reopen'), icon: <RotateCcw className="h-4 w-4" />, description: "重新开启订单" },
          { label: t('copy'), icon: <Copy className="h-4 w-4" />, description: "复制为新订单" },
        ]
      case POStatus.EXCEPTION:
        return [
          { label: t('view'), icon: <Eye className="h-4 w-4" />, description: "查看详情" },
          { label: t('reopen'), icon: <RotateCcw className="h-4 w-4" />, description: "重新开启订单" },
          { label: t('copy'), icon: <Copy className="h-4 w-4" />, description: "复制为新订单" },
          { label: t('viewReason'), icon: <AlertCircle className="h-4 w-4" />, description: "查看异常原因" },
        ]
      default:
        return []
    }
  }

  // Batch actions for each status
  const getBatchActionsForStatus = (status: POStatus) => {
    switch (status) {
      case POStatus.NEW:
        return [
          { label: t('batchSend'), description: "批量发送给供应商" },
          { label: t('batchCreateShipment'), description: "批量创建发运单" },
          { label: t('batchCreateReceipt'), description: "批量创建收货单" },
          { label: t('batchCancel'), description: "批量取消订单", variant: "destructive" as const },
        ]
      case POStatus.IN_TRANSIT:
        return [
          { label: t('batchCreateShipment'), description: "批量创建发运单" },
          { label: t('batchMarkArrived'), description: "批量标记送达" },
        ]
      case POStatus.WAITING_FOR_RECEIVING:
        return [
          { label: t('batchCreateShipment'), description: "批量创建发运单" },
          { label: t('batchCreateReceipt'), description: "批量创建收货单" },
        ]
      case POStatus.RECEIVING:
        return [
          { label: t('batchCreateShipment'), description: "批量创建发运单" },
          { label: t('batchCompleteReceipt'), description: "批量完成收货" },
        ]
      case POStatus.PARTIAL_RECEIPT:
        return [
          { label: t('batchCreateShipment'), description: "批量创建发运单" },
          { label: t('batchCreateReceipt'), description: "批量创建收货单" },
        ]
      case POStatus.CANCELLED:
        return [
          { label: t('batchReopen'), description: "批量重开订单" },
        ]
      case POStatus.EXCEPTION:
        return [
          { label: t('batchReopen'), description: "批量重开订单" },
        ]
      default:
        return []
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">PO All Status Actions Test</h1>
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

      {/* Individual Actions for Each Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockPOs.map((po) => {
          const actions = getActionsForStatus(po.status)
          const batchActions = getBatchActionsForStatus(po.status)
          
          return (
            <Card key={po.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{po.orderNo} - {po.supplierName}</span>
                  <StatusBadge status={po.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Individual Actions */}
                <div>
                  <h4 className="font-medium mb-2">Individual Actions</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {actions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {action.icon}
                          <span className="text-sm">{action.label}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant={action.variant || "outline"}
                          onClick={() => console.log(`${action.label} for ${po.orderNo}`)}
                        >
                          {action.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Batch Actions */}
                {batchActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Batch Actions</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {batchActions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{action.label}</span>
                          <Button 
                            size="sm" 
                            variant={action.variant || "outline"}
                            onClick={() => console.log(`${action.label} for status ${po.status}`)}
                          >
                            {action.label}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status Flow Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status Action Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><strong>NEW (新建):</strong> 发送、创建发运单、创建收货单、取消</div>
                <div><strong>IN_TRANSIT (运输中):</strong> 发运、标记送达</div>
                <div><strong>WAITING_FOR_RECEIVING (待收货):</strong> 发运、创建收货单</div>
                <div><strong>RECEIVING (收货中):</strong> 发运、完成收货</div>
              </div>
              <div className="space-y-2">
                <div><strong>PARTIAL_RECEIPT (部分收货):</strong> 发运、创建收货单</div>
                <div><strong>COMPLETED (已完成):</strong> 查看、复制</div>
                <div><strong>CANCELLED (已取消):</strong> 重开、复制</div>
                <div><strong>EXCEPTION (异常):</strong> 重开、复制、查看原因</div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Basic Actions</h4>
              <div className="space-y-1">
                <div>send: {t('send')}</div>
                <div>view: {t('view')}</div>
                <div>copy: {t('copy')}</div>
                <div>cancel: {t('cancel')}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Shipment Actions</h4>
              <div className="space-y-1">
                <div>createShipment: {t('createShipment')}</div>
                <div>markArrived: {t('markArrived')}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Receipt Actions</h4>
              <div className="space-y-1">
                <div>createReceipt: {t('createReceipt')}</div>
                <div>completeReceipt: {t('completeReceipt')}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Recovery Actions</h4>
              <div className="space-y-1">
                <div>reopen: {t('reopen')}</div>
                <div>viewReason: {t('viewReason')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}