"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { I18nProvider, useI18n } from "@/components/i18n-provider"
import { LanguageSwitcher } from "@/components/ui/language-switcher"

function FinalTestContent() {
  const { t, language, setLanguage } = useI18n()
  const [testCount, setTestCount] = React.useState(0)

  React.useEffect(() => {
    console.log('Language changed to:', language)
  }, [language])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">最终国际化测试</h1>
        <div className="flex items-center gap-4">
          <LanguageSwitcher language={language} onLanguageChange={setLanguage} />
          <Button onClick={() => setTestCount(prev => prev + 1)}>
            测试重渲染 ({testCount})
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本翻译测试 - 语言: {language}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>{t('prNo')}:</strong> PR202401100001
            </div>
            <div>
              <strong>{t('status')}:</strong> <Badge>{t('APPROVED')}</Badge>
            </div>
            <div>
              <strong>{t('department')}:</strong> ECOM Dept
            </div>
            <div>
              <strong>{t('requester')}:</strong> 张三
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>状态翻译测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['DRAFT', 'SUBMITTED', 'APPROVING', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXCEPTION', 'PARTIAL_PO', 'FULL_PO', 'CLOSED'].map(status => (
              <Badge key={status} variant="outline">
                {t(status as any)}
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
            {['viewDetails', 'edit', 'submit', 'copy', 'generatePO', 'approve', 'reject', 'fix', 'cancel', 'export', 'batchActions', 'newPR'].map(action => (
              <button
                key={action}
                className="text-blue-600 hover:underline text-sm px-2 py-1 border rounded"
              >
                {t(action as any)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>调试信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>当前语言: {language}</div>
            <div>localStorage语言: {typeof window !== 'undefined' ? localStorage.getItem('language') : 'N/A'}</div>
            <div>重渲染次数: {testCount}</div>
            <div>翻译函数类型: {typeof t}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FinalI18nTestPage() {
  return (
    <I18nProvider>
      <FinalTestContent />
    </I18nProvider>
  )
}