"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, ShoppingCart, Truck, Package, CheckCircle, ArrowLeft, RefreshCw, AlertTriangle, Edit } from "lucide-react"
import { useI18n } from "@/components/i18n-provider"

const sidebarItems = [
  { title: "PR (Purchase Request)", href: "/purchase/pr", icon: <FileText className="h-4 w-4" /> },
  { title: "PO (Purchase Order)", href: "/purchase/po", icon: <ShoppingCart className="h-4 w-4" /> },
  { title: "ASN (Advance Ship Notice)", href: "/purchase/asn", icon: <Truck className="h-4 w-4" /> },
  { title: "Receipts", href: "/purchase/receipts", icon: <Package className="h-4 w-4" /> },
  { title: "Receipt Confirm", href: "/purchase/receipt-confirm", icon: <CheckCircle className="h-4 w-4" /> },
]

// Mock exception data
const mockException = {
  prNo: "PR202401120001",
  status: "EXCEPTION",
  exceptions: [
    {
      id: "1",
      type: "DATA_MISSING",
      title: "缺少目标仓库配置",
      description: "明细行中的目标仓库 'WH999' 在系统中不存在或已被禁用",
      severity: "HIGH" as const,
      affectedLines: [1, 3],
      suggestedAction: "请选择有效的目标仓库",
      canAutoFix: false,
    },
    {
      id: "2",
      type: "APPROVAL_CONFIG_ERROR",
      title: "审批流配置错误",
      description: "当前部门 'Logistics' 的审批流程配置不完整，缺少必要的审批节点",
      severity: "CRITICAL" as const,
      affectedLines: [],
      suggestedAction: "请联系系统管理员配置审批流程",
      canAutoFix: false,
    },
    {
      id: "3",
      type: "BUDGET_VALIDATION",
      title: "预算验证失败",
      description: "预算项目 'Logistics-Optimization' 当前可用额度不足",
      severity: "MEDIUM" as const,
      affectedLines: [],
      suggestedAction: "请调整预算项目或减少采购金额",
      canAutoFix: false,
    },
  ],
  created: "2024-01-12T08:00:00Z",
  lastAttempt: "2024-01-12T16:30:00Z",
  attemptCount: 3,
}

const getSeverityConfig = (t: any) => ({
  LOW: { label: t('LOW_SEVERITY'), color: "bg-blue-100 text-blue-800" },
  MEDIUM: { label: t('MEDIUM_SEVERITY'), color: "bg-yellow-100 text-yellow-800" },
  HIGH: { label: t('HIGH_SEVERITY'), color: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: t('CRITICAL_SEVERITY'), color: "bg-red-100 text-red-800" },
})

export default function PRExceptionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t } = useI18n()
  const [isRetrying, setIsRetrying] = React.useState(false)
  const severityConfig = getSeverityConfig(t)

  const handleRetry = async () => {
    setIsRetrying(true)
    // Simulate retry process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRetrying(false)
    // In real app, would redirect to PR detail or show success message
  }

  const handleEdit = () => {
    router.push(`/purchase/pr/${params.id}/edit`)
  }

  const handleBack = () => {
    router.push(`/purchase/pr/${params.id}`)
  }

  return (
    <MainLayout sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('exceptionHandling')}</h1>
              <p className="text-muted-foreground">{t('prNo')}: {mockException.prNo}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {t('editPR')}
            </Button>
            <Button onClick={handleRetry} disabled={isRetrying}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? t('retrying') : t('retryProcessing')}
            </Button>
          </div>
        </div>

        {/* Exception Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              {t('exceptionOverview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('exceptionCount')}</p>
                <p className="text-2xl font-bold text-red-600">{mockException.exceptions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('firstOccurrence')}</p>
                <p className="text-sm">{new Date(mockException.created).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('lastAttempt')}</p>
                <p className="text-sm">{new Date(mockException.lastAttempt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('attemptCount')}</p>
                <p className="text-2xl font-bold">{mockException.attemptCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exception Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('exceptionDetails')}</h2>
          {mockException.exceptions.map((exception, index) => (
            <Card key={exception.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-red-500" />
                    <div>
                      <CardTitle className="text-base">{exception.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('prType')}: {exception.type}
                      </p>
                    </div>
                  </div>
                  <Badge className={severityConfig[exception.severity].color}>
                    {severityConfig[exception.severity].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('exceptionDescription')}</h4>
                    <p className="text-sm text-muted-foreground">{exception.description}</p>
                  </div>

                  {exception.affectedLines.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">{t('affectedLines')}</h4>
                      <div className="flex flex-wrap gap-1">
                        {exception.affectedLines.map((line) => (
                          <Badge key={line} variant="outline">
                            {t('lineNumber')} {line}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">{t('suggestedAction')}</h4>
                    <p className="text-sm">{exception.suggestedAction}</p>
                  </div>

                  {exception.canAutoFix && (
                    <div className="pt-2">
                      <Button size="sm" variant="outline">
                        {t('autoFix')}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleBack}>
            {t('cancel')}
          </Button>
          <Button onClick={handleEdit}>
            {t('editAndFix')}
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}