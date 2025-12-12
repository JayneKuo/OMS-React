"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { I18nProvider, useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

function TestContent() {
  const { t, language, setLanguage } = useI18n()

  // 模拟PR数据
  const mockPR = {
    prNo: "PR202401100001",
    status: "PARTIAL_PO" as const,
    requester: "张三",
    department: "ECOM Dept",
    estimatedAmount: 12500.00,
    priority: "NORMAL" as const,
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">PR模块国际化测试</h1>
        <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PR信息示例 - 当前语言: {language === 'zh' ? '中文' : 'English'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t('prNo')}</label>
              <div className="text-sm">{mockPR.prNo}</div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('status')}</label>
              <div>
                <Badge variant="secondary">{t(mockPR.status)}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('requester')}</label>
              <div className="text-sm">{mockPR.requester}</div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('department')}</label>
              <div className="text-sm">{mockPR.department}</div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('estimatedAmount')}</label>
              <div className="text-sm">${mockPR.estimatedAmount.toLocaleString()}</div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('priority')}</label>
              <div>
                <Badge variant="outline">{t(mockPR.priority)}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">{t('actions')}</h3>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:underline text-sm">
                {t('viewDetails')}
              </button>
              <button className="text-blue-600 hover:underline text-sm">
                {t('generatePO')}
              </button>
              <button className="text-blue-600 hover:underline text-sm">
                {t('edit')}
              </button>
              <button className="text-blue-600 hover:underline text-sm">
                {t('copy')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>所有状态翻译测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['DRAFT', 'SUBMITTED', 'APPROVING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXCEPTION', 'PARTIAL_PO', 'FULL_PO', 'CLOSED'].map(status => (
              <Badge key={status} variant="outline">
                {status}: {t(status as any)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>操作翻译测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['viewDetails', 'edit', 'submit', 'copy', 'generatePO', 'approve', 'reject', 'fix', 'cancel', 'export', 'batchActions', 'newPR', 'all'].map(action => (
              <Badge key={action} variant="secondary">
                {action}: {t(action as any)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PRI18nTestPage() {
  return (
    <I18nProvider>
      <TestContent />
    </I18nProvider>
  )
}