"use client"

import * as React from "react"
import { Language, translations, TranslationKey } from "@/lib/i18n"

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const I18nContext = React.createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>('zh')

  // 确保在客户端才访问localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        setLanguage(savedLanguage)
      }
    }
  }, [])

  // 保存语言设置到localStorage
  const handleSetLanguage = React.useCallback((lang: Language) => {
    console.log('Setting language to:', lang) // 调试日志
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }, [])

  const t = React.useCallback((key: TranslationKey): string => {
    const translation = translations[language]?.[key]
    if (!translation) {
      // 只在开发环境显示警告，生产环境不输出
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Translation missing for key: ${key} in language: ${language}`)
      }
      return key
    }
    return translation
  }, [language])

  const contextValue = React.useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t
  }), [language, handleSetLanguage, t])

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = React.useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}