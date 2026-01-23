"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PORoutingActionsConfig } from "@/components/automation/po-routing-actions-config"
import type { RuleAction } from "@/lib/types/routing-rule"

export default function TestActionsConfigPage() {
  const [actions, setActions] = React.useState<RuleAction[]>([])

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">测试动作配置</h1>
          <p className="text-sm text-muted-foreground mt-2">
            测试新的动态动作配置组件
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>动作配置</CardTitle>
          </CardHeader>
          <CardContent>
            <PORoutingActionsConfig
              actions={actions}
              onChange={setActions}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>当前配置 (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
              {JSON.stringify(actions, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
