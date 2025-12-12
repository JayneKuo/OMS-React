"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/components/i18n-provider"

export default function GlobalI18nTestPage() {
  const { t, language } = useI18n()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">全局国际化测试</h1>
        <div className="text-sm text-muted-foreground">
          当前语言: {language} (通过右上角用户菜单切换)
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PR模块翻译测试</CardTitle>
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
            <div>
              <strong>{t('priority')}:</strong> <Badge variant="outline">{t('NORMAL')}</Badge>
            </div>
            <div>
              <strong>{t('estimatedAmount')}:</strong> $12,500
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">{t('actions')}</h3>
            <div className="flex flex-wrap gap-2">
              <button className="text-blue-600 hover:underline text-sm px-2 py-1 border rounded">
                {t('viewDetails')}
              </button>
              <button className="text-blue-600 hover:underline text-sm px-2 py-1 border rounded">
                {t('edit')}
              </button>
              <button className="text-blue-600 hover:underline text-sm px-2 py-1 border rounded">
                {t('generatePO')}
              </button>
              <button className="text-blue-600 hover:underline text-sm px-2 py-1 border rounded">
                {t('export')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>页面信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div><strong>基本信息:</strong> {t('basicInfo')}</div>
            <div><strong>商品行:</strong> {t('commercialItems')}</div>
            <div><strong>审批历史:</strong> {t('approvalHistory')}</div>
            <div><strong>关联PO:</strong> {t('relatedPO')}</div>
            <div><strong>报价文件:</strong> {t('quoteFiles')}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <p>1. 点击右上角用户头像</p>
            <p>2. 在下拉菜单中找到&quot;Language&quot;选项</p>
            <p>3. 选择&quot;中文简体&quot;或&quot;English&quot;</p>
            <p>4. 观察页面文本是否立即切换</p>
            <p>5. 访问 /purchase/pr 查看PR列表页面的国际化效果</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}