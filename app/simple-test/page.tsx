"use client"

import * as React from "react"
import { useI18n } from "@/components/i18n-provider"

export default function SimpleTestPage() {
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="p-6">
      <h1>Simple I18n Test</h1>
      <p>Current language: {language}</p>
      <p>Dashboard translation: {t('dashboard')}</p>
      <button 
        onClick={() => setLanguage('en')}
        className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        English
      </button>
      <button 
        onClick={() => setLanguage('zh')}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        中文
      </button>
    </div>
  )
}