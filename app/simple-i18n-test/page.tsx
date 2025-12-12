"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { I18nProvider, useI18n } from "@/components/i18n-provider"

function SimpleTestContent() {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">简单国际化测试</h1>
      
      <div className="space-y-2">
        <div>当前语言: {language}</div>
        <div>PR编号: {t('prNo')}</div>
        <div>状态: {t('status')}</div>
        <div>草稿: {t('DRAFT')}</div>
        <div>已审批: {t('APPROVED')}</div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => setLanguage('zh')}
          variant={language === 'zh' ? 'default' : 'outline'}
        >
          中文
        </Button>
        <Button 
          onClick={() => setLanguage('en')}
          variant={language === 'en' ? 'default' : 'outline'}
        >
          English
        </Button>
      </div>
    </div>
  )
}

export default function SimpleI18nTestPage() {
  return (
    <I18nProvider>
      <SimpleTestContent />
    </I18nProvider>
  )
}