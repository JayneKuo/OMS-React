"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Plus, Info } from "lucide-react"
import type { RuleAction } from "@/lib/types/routing-rule"

interface PORoutingActionsConfigProps {
  actions: RuleAction[]
  onChange: (actions: RuleAction[]) => void
}

export function PORoutingActionsConfigSimple({ actions, onChange }: PORoutingActionsConfigProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">设置动作</h3>
          <Badge variant="secondary">{actions.length}</Badge>
        </div>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          添加动作
        </Button>
      </div>

      {actions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 text-center p-8 border-2 border-dashed rounded-lg bg-card/50">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">未配置任何动作</p>
            <p className="text-xs text-muted-foreground mt-1">
              点击"添加动作"按钮开始配置
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            已配置 {actions.length} 个动作
          </p>
        </div>
      )}
    </div>
  )
}
