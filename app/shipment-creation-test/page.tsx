"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { POStatus } from "@/lib/enums/po-status"
import { useI18n } from "@/components/i18n-provider"
import { useRouter } from "next/navigation"
import { Truck, Package, Eye, ExternalLink } from "lucide-react"

export default function ShipmentCreationTestPage() {
  const { t, language, setLanguage } = useI18n()
  const router = useRouter()

  // Mock PO data for testing
  const mockPOs = [
    {
      id: "1",
      orderNo: "PO202403150001",
      supplierName: "ABC Suppliers Inc.",
      status: POStatus.NEW,
      totalAmount: 12500.00,
      currency: "USD",
      itemCount: 2
    },
    {
      id: "2",
      orderNo: "PO202403150002",
      supplierName: "Global Trading Co.",
      status: POStatus.IN_TRANSIT,
      totalAmount: 35000.00,
      currency: "USD",
      itemCount: 5
    },
    {
      id: "3",
      orderNo: "PO202403150003",
      supplierName: "Tech Distributors Ltd.",
      status: POStatus.WAITING_FOR_RECEIVING,
      totalAmount: 28000.00,
      currency: "USD",
      itemCount: 3
    }
  ]

  const handleCreateShipment = (poId: string, orderNo: string) => {
    console.log(`Creating shipment for PO ${orderNo} (ID: ${poId})`)
    router.push(`/purchase/shipments/create?poId=${poId}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shipment Creation Test</h1>
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

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>1. 点击下方任意PO的&ldquo;创建发运单&rdquo;按钮</p>
            <p>2. 系统将跳转到发运单创建页面</p>
            <p>3. PO信息将自动填充到发运单表单中</p>
            <p>4. 验证供应商信息、仓库信息、商品行等是否正确填充</p>
          </div>
        </CardContent>
      </Card>

      {/* Mock PO List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPOs.map((po) => (
          <Card key={po.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">{po.orderNo}</span>
                <StatusBadge status={po.status} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">供应商:</span>
                  <span className="ml-2">{po.supplierName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">金额:</span>
                  <span className="ml-2">{po.currency} {po.totalAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">商品数:</span>
                  <span className="ml-2">{po.itemCount} 项</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => handleCreateShipment(po.id, po.orderNo)}
                  className="w-full"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {t('createShipment')}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/purchase/po/${po.id}`)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('view')} PO
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Direct Links */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Links for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">With PO Data (Auto-fill)</h4>
              <div className="space-y-2">
                {mockPOs.map((po) => (
                  <Button
                    key={po.id}
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/purchase/shipments/create?poId=${po.id}`)}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Shipment from {po.orderNo}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Without PO Data (Manual)</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/purchase/shipments/create')}
                className="w-full justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Shipment (Manual)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">✅ 已实现功能</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• PO列表页&ldquo;创建发运单&rdquo;按钮跳转到发运单创建页面</li>
                <li>• 通过URL参数传递PO ID (poId)</li>
                <li>• 自动填充供应商信息（名称、联系人、电话、邮箱、地址）</li>
                <li>• 自动填充仓库信息（名称、地址）</li>
                <li>• 自动加载PO商品行信息</li>
                <li>• 支持修改发运数量</li>
                <li>• 自动生成发运单号</li>
                <li>• 完整的表单验证和提交流程</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🔄 数据流转</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>1. PO列表页 → 点击&ldquo;创建发运单&rdquo;</div>
                <div>2. 跳转到 /purchase/shipments/create?poId=xxx</div>
                <div>3. 发运单页面读取poId参数</div>
                <div>4. 根据poId获取PO数据并自动填充表单</div>
                <div>5. 用户确认/修改信息后提交</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}