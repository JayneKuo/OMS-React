"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Globe } from "lucide-react"
import { Language } from "@/lib/i18n"

interface LanguageSwitcherProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

export function LanguageSwitcher({ language, onLanguageChange }: LanguageSwitcherProps) {
  const handleChange = (value: Language) => {
    console.log('LanguageSwitcher: changing language from', language, 'to', value)
    onLanguageChange(value)
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Select value={language} onValueChange={handleChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="zh">中文</SelectItem>
          <SelectItem value="en">EN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}