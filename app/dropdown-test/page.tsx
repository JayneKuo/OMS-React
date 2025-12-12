"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { User, Globe, Check } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

export default function DropdownTestPage() {
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const { t, language, setLanguage } = useI18n()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">下拉菜单测试 / Dropdown Test</h1>
          <p className="text-muted-foreground mt-2">
            测试用户头像下拉菜单功能 / Test user avatar dropdown functionality
          </p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">简单下拉测试 / Simple Dropdown Test</h2>
          
          <div className="flex justify-end">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-9 w-9 ${userMenuOpen ? 'bg-accent' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('User menu button clicked, current state:', userMenuOpen)
                  setUserMenuOpen(!userMenuOpen)
                }}
              >
                <User className="h-4 w-4" />
              </Button>

              {/* 简化的用户菜单下拉 */}
              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Backdrop clicked, closing user menu')
                      setUserMenuOpen(false)
                    }}
                    style={{ zIndex: 40 }}
                  />
                  <div 
                    className="absolute right-0 top-full mt-2 w-64 rounded-lg border shadow-lg bg-white"
                    style={{ 
                      zIndex: 9999,
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      marginTop: '8px',
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">测试用户 / Test User</div>
                          <div className="text-xs text-gray-500">test@example.com</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button 
                        className="w-full flex items-center justify-between px-2 py-2 text-sm hover:bg-gray-100 rounded"
                        onClick={() => {
                          console.log('Language menu clicked')
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          <span>{t('language')}</span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">
                          {language === 'zh' ? '中文简体' : 'English'}
                        </span>
                      </button>

                      <div className="border-t my-2" />

                      <button 
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        onClick={() => {
                          console.log('Logout clicked')
                          setUserMenuOpen(false)
                        }}
                      >
                        <span>退出登录 / Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>当前状态 / Current State:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>用户菜单打开状态 / User menu open: {userMenuOpen ? '是 / Yes' : '否 / No'}</li>
              <li>当前语言 / Current language: {language === 'zh' ? '中文' : 'English'}</li>
            </ul>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>测试步骤 / Test Steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>点击右上角的用户头像按钮 / Click the user avatar button above</li>
              <li>查看下拉菜单是否出现 / Check if dropdown menu appears</li>
              <li>点击菜单外部区域关闭 / Click outside to close</li>
              <li>检查浏览器控制台的日志 / Check browser console for logs</li>
            </ol>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">语言切换测试 / Language Switch Test</h2>
          <div className="flex gap-4">
            <Button 
              variant={language === 'zh' ? 'default' : 'outline'}
              onClick={() => {
                console.log('Switching to Chinese')
                setLanguage('zh')
              }}
            >
              中文简体
            </Button>
            <Button 
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => {
                console.log('Switching to English')
                setLanguage('en')
              }}
            >
              English
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            当前语言 / Current Language: {language === 'zh' ? '中文简体' : 'English'}
          </p>
        </div>
      </div>
    </div>
  )
}