"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { I18nProvider, useI18n } from "@/components/i18n-provider"

function DebugContent() {
  const { t, language, setLanguage } = useI18n()
  const [renderCount, setRenderCount] = React.useState(0)

  React.useEffect(() => {
    setRenderCount(prev => prev + 1)
  })

  console.log('DebugContent render:', { language, renderCount })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>国际化调试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>当前语言:</strong> {language}
          </div>
          <div>
            <strong>渲染次数:</strong> {renderCount}
          </div>
          <div>
            <strong>localStorage中的语言:</strong> {typeof window !== 'undefined' ? localStorage.getItem('language') : 'N/A'}
          </div>
          
          <div className="space-y-2">
            <div>测试翻译:</div>
            <div>prNo: {t('prNo')}</div>
            <div>status: {t('status')}</div>
            <div>DRAFT: {t('DRAFT')}</div>
            <div>APPROVED: {t('APPROVED')}</div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('Switching to zh')
                setLanguage('zh')
              }}
              variant={language === 'zh' ? 'default' : 'outline'}
            >
              中文
            </Button>
            <Button 
              onClick={() => {
                console.log('Switching to en')
                setLanguage('en')
              }}
              variant={language === 'en' ? 'default' : 'outline'}
            >
              English
            </Button>
          </div>

          <div>
            <Button onClick={() => {
              console.log('Current translations:', {
                prNo_zh: t('prNo'),
                language: language
              })
            }}>
              Log Current State
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DebugI18nPage() {
  return (
    <I18nProvider>
      <DebugContent />
    </I18nProvider>
  )
}