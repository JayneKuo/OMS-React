"use client"

import * as React from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { I18nProvider, useI18n } from "@/components/i18n-provider"
import { FileText, ShoppingCart, Truck, Package, CheckCircle } from "lucide-react"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

function POI18nTestContent() {
  const { t, language, setLanguage } = useI18n()

  const handleLanguageSwitch = (lang: 'zh' | 'en') => {
    console.log('Switching language to:', lang)
    setLanguage(lang)
    console.log('Language after switch:', language)
  }

  return (
    <MainLayout sidebarItems={sidebarItems} moduleName="Purchase">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PO国际化测试页面</h1>
            <p className="text-muted-foreground">
              测试PO相关的国际化翻译 - 当前语言: {language}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={language === 'zh' ? 'default' : 'outline'}
              onClick={() => handleLanguageSwitch('zh')}
            >
              中文 {language === 'zh' && '✓'}
            </Button>
            <Button 
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => handleLanguageSwitch('en')}
            >
              English {language === 'en' && '✓'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息 / Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>{t('prNo')}:</strong> PO202403150001</div>
              <div><strong>{t('businessNo')}:</strong> EXT-PO-2024-001</div>
              <div><strong>{t('prNo')}:</strong> PR202401100001</div>
              <div><strong>{t('businessNo')}:</strong> REF202403150001</div>
              <div><strong>{t('supplierField')}:</strong> ABC Suppliers Inc.</div>
              <div><strong>{t('targetWarehouse')}:</strong> Main Warehouse</div>
            </CardContent>
          </Card>

          {/* 状态信息 */}
          <Card>
            <CardHeader>
              <CardTitle>状态信息 / Status Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>{t('status')}:</strong> {t('CONFIRMED')}</div>
              <div><strong>{t('prType')}:</strong> {t('STANDARD')}</div>
              <div><strong>{t('exceptionMark')}:</strong> 0</div>
              <div><strong>{t('unitPrice')}:</strong> USD 12,500.00</div>
              <div><strong>{t('supplierField')}:</strong> FedEx</div>
            </CardContent>
          </Card>

          {/* 日期信息 */}
          <Card>
            <CardHeader>
              <CardTitle>日期信息 / Date Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div><strong>{t('created')}:</strong> 2024-01-15</div>
              <div><strong>{t('updated')}:</strong> 2024-01-16</div>
              <div><strong>{t('latestShipDate')}:</strong> 2024-01-20</div>
              <div><strong>{t('expectedDeliveryDate')}:</strong> 2024-01-25</div>
              <div><strong>{t('created')}:</strong> 2024-01-15</div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <Card>
            <CardHeader>
              <CardTitle>操作按钮 / Action Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">{t('view')}</Button>
                <Button size="sm" variant="outline">{t('edit')}</Button>
                <Button size="sm" variant="outline">{t('view')}</Button>
                <Button size="sm" variant="outline">{t('confirm')}</Button>
                <Button size="sm" variant="outline">{t('export')}</Button>
                <Button size="sm" variant="destructive">{t('cancel')}</Button>
              </div>
            </CardContent>
          </Card>

          {/* 批量操作 */}
          <Card>
            <CardHeader>
              <CardTitle>批量操作 / Batch Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">{t('batchSubmit')}</Button>
                <Button size="sm" variant="outline">{t('confirm')}</Button>
                <Button size="sm" variant="outline">{t('view')}</Button>
                <Button size="sm" variant="outline">{t('refresh')}</Button>
                <Button size="sm" variant="destructive">{t('cancel')}</Button>
              </div>
            </CardContent>
          </Card>

          {/* 状态标签 */}
          <Card>
            <CardHeader>
              <CardTitle>状态标签 / Status Labels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{t('DRAFT')}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{t('SUBMITTED')}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{t('CONFIRMED')}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">{t('SHIPPED')}</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-sm">{t('RECEIVED')}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{t('ON_HOLD')}</span>
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">{t('CANCELLED')}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>搜索占位符测试 / Search Placeholder Test</CardTitle>
          </CardHeader>
          <CardContent>
            <input 
              type="text" 
              placeholder={t('searchPOPlaceholder')}
              className="w-full p-2 border rounded"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

export default function POI18nTestPage() {
  return (
    <I18nProvider>
      <POI18nTestContent />
    </I18nProvider>
  )
}