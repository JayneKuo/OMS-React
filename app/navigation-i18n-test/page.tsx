"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"

export default function NavigationI18nTestPage() {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">导航国际化测试</h1>
          <p className="text-muted-foreground">
            测试主导航菜单和侧边栏的国际化效果 - 当前语言: {language}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={language === 'zh' ? 'default' : 'outline'}
            onClick={() => setLanguage('zh')}
          >
            中文 {language === 'zh' && '✓'}
          </Button>
          <Button 
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
          >
            English {language === 'en' && '✓'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 主导航菜单 */}
        <Card>
          <CardHeader>
            <CardTitle>主导航菜单</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{t('dashboard')}</Badge>
              <Badge variant="outline">{t('orders')}</Badge>
              <Badge variant="outline">{t('returns')}</Badge>
              <Badge variant="outline">{t('purchase')}</Badge>
              <Badge variant="outline">{t('logistics')}</Badge>
              <Badge variant="outline">{t('inventory')}</Badge>
              <Badge variant="outline">{t('product')}</Badge>
              <Badge variant="outline">{t('events')}</Badge>
              <Badge variant="outline">{t('integrations')}</Badge>
              <Badge variant="outline">{t('pom')}</Badge>
              <Badge variant="outline">{t('automation')}</Badge>
              <Badge variant="outline">{t('customerManagement')}</Badge>
              <Badge variant="outline">{t('merchantManagement')}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 采购子模块 */}
        <Card>
          <CardHeader>
            <CardTitle>采购子模块</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>PR:</strong> {t('purchaseRequest')}</div>
            <div><strong>PO:</strong> {t('purchaseOrder')}</div>
            <div><strong>ASN:</strong> {t('advanceShipNotice')}</div>
            <div><strong>Receipts:</strong> {t('receipts')}</div>
            <div><strong>Receipt Confirm:</strong> {t('receiptConfirm')}</div>
          </CardContent>
        </Card>

        {/* 用户界面元素 */}
        <Card>
          <CardHeader>
            <CardTitle>用户界面元素</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('tenant')}:</strong> Tenant</div>
            <div><strong>{t('merchant')}:</strong> Merchant</div>
            <div><strong>{t('search')}:</strong> Search</div>
            <div><strong>{t('language')}:</strong> Language</div>
            <div><strong>{t('timezone')}:</strong> Timezone</div>
            <div><strong>{t('theme')}:</strong> Theme</div>
            <div><strong>{t('logout')}:</strong> Logout</div>
          </CardContent>
        </Card>

        {/* 主题选项 */}
        <Card>
          <CardHeader>
            <CardTitle>主题选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><strong>{t('light')}:</strong> Light Theme</div>
            <div><strong>{t('dark')}:</strong> Dark Theme</div>
            <div><strong>{t('system')}:</strong> System Theme</div>
          </CardContent>
        </Card>

        {/* 搜索占位符 */}
        <Card>
          <CardHeader>
            <CardTitle>搜索占位符</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <input 
              type="text" 
              placeholder={t('searchTenants')}
              className="w-full p-2 border rounded text-sm"
              readOnly
            />
            <input 
              type="text" 
              placeholder={t('searchMerchants')}
              className="w-full p-2 border rounded text-sm"
              readOnly
            />
            <input 
              type="text" 
              placeholder={t('search')}
              className="w-full p-2 border rounded text-sm"
              readOnly
            />
          </CardContent>
        </Card>

        {/* 状态消息 */}
        <Card>
          <CardHeader>
            <CardTitle>状态消息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">{t('noTenantsFound')}</div>
            <div className="text-sm text-muted-foreground">{t('noMerchantsFound')}</div>
            <div className="text-sm">5 {t('merchants')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">已完成的国际化内容：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>主导航菜单（顶部横向导航）</li>
                <li>采购模块侧边栏导航</li>
                <li>租户和商户切换器</li>
                <li>用户菜单（语言、时区、主题设置）</li>
                <li>搜索框占位符文本</li>
                <li>各种状态消息和提示文本</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">测试方法：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>点击上方的语言切换按钮</li>
                <li>观察页面中所有文本的变化</li>
                <li>访问不同的页面查看导航菜单的翻译效果</li>
                <li>测试头部的租户/商户切换器</li>
                <li>测试用户菜单中的各项设置</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}