"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { POStatus, ShippingStatus, ReceivingStatus } from "@/lib/enums/po-status"
import { useI18n } from "@/components/i18n-provider"

export default function POStatusTranslationTestPage() {
  const { t, language, setLanguage } = useI18n()

  const allPOStatuses = Object.values(POStatus)
  const allShippingStatuses = Object.values(ShippingStatus)
  const allReceivingStatuses = Object.values(ReceivingStatus)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">PO Status Translation Test</h1>
        <div className="flex gap-2">
          <Button 
            variant={language === 'zh' ? 'default' : 'outline'}
            onClick={() => setLanguage('zh')}
          >
            中文
          </Button>
          <Button 
            variant={language === 'en' ? 'default' : 'outline'}
            onClick={() => setLanguage('en')}
          >
            English
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PO Status */}
        <Card>
          <CardHeader>
            <CardTitle>PO Status ({t('status')})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allPOStatuses.map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">{status}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shipping Status */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Status ({t('shippingStatus')})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allShippingStatuses.map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">{status}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Receiving Status */}
        <Card>
          <CardHeader>
            <CardTitle>Receiving Status ({t('receivingStatus')})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allReceivingStatuses.map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">{status}</span>
                <StatusBadge status={status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tab Labels Test */}
      <Card>
        <CardHeader>
          <CardTitle>Tab Labels Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allPOStatuses.map((status) => (
              <div key={status} className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{status}</div>
                <div className="font-medium">{t(status)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Options Test */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Options Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">PO Status Filter Options</h4>
              <div className="flex flex-wrap gap-2">
                {allPOStatuses.map((status) => (
                  <div key={status} className="px-3 py-1 bg-muted rounded-md text-sm">
                    {t(status)}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Shipping Status Filter Options</h4>
              <div className="flex flex-wrap gap-2">
                {allShippingStatuses.map((status) => (
                  <div key={status} className="px-3 py-1 bg-muted rounded-md text-sm">
                    {t(status)}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Receiving Status Filter Options</h4>
              <div className="flex flex-wrap gap-2">
                {allReceivingStatuses.map((status) => (
                  <div key={status} className="px-3 py-1 bg-muted rounded-md text-sm">
                    {t(status)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}