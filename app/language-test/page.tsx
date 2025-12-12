"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"

export default function LanguageTestPage() {
  const { t, language, setLanguage } = useI18n()
  const [renderCount, setRenderCount] = React.useState(0)

  React.useEffect(() => {
    setRenderCount(prev => prev + 1)
  }, [language])

  const handleLanguageSwitch = (lang: 'zh' | 'en') => {
    console.log('Before switch - Current language:', language)
    console.log('Switching to:', lang)
    setLanguage(lang)
    console.log('After switch call - Current language:', language)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">语言切换测试</h1>
          <p className="text-muted-foreground">
            当前语言: {language} | 渲染次数: {renderCount}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本翻译测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('actions')}:</strong> Actions</div>
            <div><strong>{t('status')}:</strong> Status</div>
            <div><strong>{t('created')}:</strong> Created</div>
            <div><strong>{t('view')}:</strong> View</div>
            <div><strong>{t('edit')}:</strong> Edit</div>
            <div><strong>{t('delete')}:</strong> Delete</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PO翻译测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('purchaseOrder')}:</strong> Purchase Orders</div>
            <div><strong>{t('prNo')}:</strong> PO No.</div>
            <div><strong>{t('supplierField')}:</strong> Supplier Name</div>
            <div><strong>{t('targetWarehouse')}:</strong> Destination</div>
            <div><strong>{t('unitPrice')}:</strong> Total Price</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>状态翻译测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('DRAFT')}:</strong> Draft</div>
            <div><strong>{t('CONFIRMED')}:</strong> Confirmed</div>
            <div><strong>{t('SHIPPED')}:</strong> Shipped</div>
            <div><strong>{t('RECEIVED')}:</strong> Received</div>
            <div><strong>{t('CANCELLED')}:</strong> Cancelled</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>操作翻译测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('view')}:</strong> Track</div>
            <div><strong>{t('confirm')}:</strong> Receive</div>
            <div><strong>{t('export')}:</strong> Download</div>
            <div><strong>{t('refresh')}:</strong> Resume</div>
            <div><strong>{t('batchActions')}:</strong> Batch Actions</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>调试信息</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded">
            {JSON.stringify({
              currentLanguage: language,
              renderCount: renderCount,
              localStorage: typeof window !== 'undefined' ? localStorage.getItem('language') : 'N/A'
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}