"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/components/i18n-provider"
import { SNLotManagementDialog } from "@/components/purchase/sn-lot-management-dialog"
import { FileText, ShoppingCart, Truck, Package, CheckCircle } from "lucide-react"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

interface TestLineItem {
  id: string
  productName: string
  skuCode: string
  quantity: number
  requiresSerialNumber: boolean
  requiresLotNumber: boolean
  specifiedSerialNumbers: string[]
  specifiedLotNumbers: string[]
  notes: string
}

export default function POSNLotTestPage() {
  const { t } = useI18n()
  
  const [showSNLotDialog, setShowSNLotDialog] = React.useState(false)
  const [selectedLineItem, setSelectedLineItem] = React.useState<TestLineItem | null>(null)
  
  const [testItems, setTestItems] = React.useState<TestLineItem[]>([
    {
      id: "1",
      productName: "iPhone 15 Pro Max",
      skuCode: "IPH15PM-256-BLU",
      quantity: 5,
      requiresSerialNumber: true,
      requiresLotNumber: false,
      specifiedSerialNumbers: [],
      specifiedLotNumbers: [],
      notes: ""
    },
    {
      id: "2", 
      productName: "MacBook Pro 16\"",
      skuCode: "MBP16-M3-1TB",
      quantity: 3,
      requiresSerialNumber: true,
      requiresLotNumber: true,
      specifiedSerialNumbers: ["SN001", "SN002"],
      specifiedLotNumbers: ["LOT2024001"],
      notes: "测试备注"
    }
  ])

  const openSNLotDialog = (item: TestLineItem) => {
    setSelectedLineItem(item)
    setShowSNLotDialog(true)
  }

  const handleSNLotSave = (data: {
    specifiedSerialNumbers: string[]
    specifiedLotNumbers: string[]
    snLotNotes: string
  }) => {
    if (selectedLineItem) {
      setTestItems(items => items.map(item => {
        if (item.id === selectedLineItem.id) {
          return {
            ...item,
            specifiedSerialNumbers: data.specifiedSerialNumbers,
            specifiedLotNumbers: data.specifiedLotNumbers,
            notes: data.snLotNotes
          }
        }
        return item
      }))
    }
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PO SN/LOT 测试页面</h1>
          <p className="text-muted-foreground">测试SN List和LOT List功能</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>商品列表 - SN/LOT 管理测试</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品信息</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>{t('snManagement')}</TableHead>
                  <TableHead>{t('lotManagement')}</TableHead>
                  <TableHead>{t('snList')}</TableHead>
                  <TableHead>{t('lotList')}</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.productName}</div>
                        <div className="text-sm text-muted-foreground">SKU: {item.skuCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.requiresSerialNumber ? (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          {t('requiresSN')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {t('noSNRequired')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.requiresLotNumber ? (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          {t('requiresLot')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {t('noLotRequired')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.specifiedSerialNumbers && item.specifiedSerialNumbers.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {item.specifiedSerialNumbers.length} SN(s)
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => openSNLotDialog(item)}
                          >
                            {t('view')}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground"
                          onClick={() => openSNLotDialog(item)}
                        >
                          {t('add')}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.specifiedLotNumbers && item.specifiedLotNumbers.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {item.specifiedLotNumbers.length} LOT(s)
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => openSNLotDialog(item)}
                          >
                            {t('view')}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground"
                          onClick={() => openSNLotDialog(item)}
                        >
                          {t('add')}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSNLotDialog(item)}
                      >
                        管理SN/LOT
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>翻译测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">含税按钮翻译</h4>
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <label className="text-sm">{t('isShippingTaxable')}</label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">SN/LOT相关翻译</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>SN列表: {t('snList')}</div>
                  <div>LOT列表: {t('lotList')}</div>
                  <div>管理要求: {t('managementRequirements')}</div>
                  <div>已指定: {t('specified')}</div>
                  <div>序列号: {t('serialNumbers')}</div>
                  <div>批次号: {t('lotNumbers')}</div>
                  <div>采购数量: {t('purchaseQuantity')}</div>
                  <div>保存设置: {t('saveSettings')}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">提示信息</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>{t('snHint')}</div>
                  <div>{t('lotHint')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SN/LOT Management Dialog */}
        {selectedLineItem && (
          <SNLotManagementDialog
            open={showSNLotDialog}
            onOpenChange={setShowSNLotDialog}
            productName={selectedLineItem.productName}
            skuCode={selectedLineItem.skuCode}
            quantity={selectedLineItem.quantity}
            requiresSerialNumber={selectedLineItem.requiresSerialNumber}
            requiresLotNumber={selectedLineItem.requiresLotNumber}
            specifiedSerialNumbers={selectedLineItem.specifiedSerialNumbers}
            specifiedLotNumbers={selectedLineItem.specifiedLotNumbers}
            snLotNotes={selectedLineItem.notes}
            onSave={handleSNLotSave}
          />
        )}
      </div>
    </MainLayout>
  )
}