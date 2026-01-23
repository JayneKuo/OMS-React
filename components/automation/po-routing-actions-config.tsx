"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, X, Package, Settings, Info, Truck } from "lucide-react"
import type { RuleAction, WorkflowAction } from "@/lib/types/routing-rule"
import { cn } from "@/lib/utils"

interface PORoutingActionsConfigProps {
  actions: RuleAction[]
  onChange: (actions: RuleAction[]) => void
}

export function PORoutingActionsConfig({ actions, onChange }: PORoutingActionsConfigProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false)

  const addWorkflowAction = () => {
    const newAction: WorkflowAction = {
      type: "SET_WORKFLOW",
      workflow: "FACTORY_DIRECT",
      config: {
        enableFGStaging: true,
        generateFGReceipt: true,
        generateSaleOrder: true,
        waitForFGReceipt: false,
        autoCreateFinalReceipt: true
      }
    }
    onChange([...actions, newAction])
    setShowAddMenu(false)
  }

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index))
  }

  const updateAction = (index: number, updatedAction: RuleAction) => {
    const newActions = [...actions]
    newActions[index] = updatedAction
    onChange(newActions)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">设置动作</h3>
          <Badge variant="secondary">{actions.length}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={addWorkflowAction}>
          <Plus className="h-4 w-4 mr-2" />
          添加工作流动作
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
              点击"添加工作流动作"按钮开始配置
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, index) => (
            <ActionCard
              key={index}
              action={action}
              index={index}
              onUpdate={(updated) => updateAction(index, updated)}
              onRemove={() => removeAction(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}


// Action Card Component
interface ActionCardProps {
  action: RuleAction
  index: number
  onUpdate: (action: RuleAction) => void
  onRemove: () => void
}

function ActionCard({ action, index, onUpdate, onRemove }: ActionCardProps) {
  if (!action || action.type !== "SET_WORKFLOW") {
    return null
  }

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">设置工作流</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                动作 #{index + 1}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkflowActionConfig 
          action={action as WorkflowAction} 
          onUpdate={onUpdate} 
        />
      </CardContent>
    </Card>
  )
}

// Workflow Action Config
function WorkflowActionConfig({ action, onUpdate }: { action: WorkflowAction; onUpdate: (action: RuleAction) => void }) {
  const config = action.config || {}

  const updateConfig = (key: string, value: any) => {
    onUpdate({
      ...action,
      config: { ...config, [key]: value }
    })
  }

  const showFGOptions = config.enableFGStaging
  const canEnableWaitForFG = config.generateFGReceipt && config.generateSaleOrder
  const showWaitForFG = canEnableWaitForFG
  const showAutoCreateFinal = config.generateSaleOrder

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">工作流类型</Label>
        <Select
          value={action.workflow}
          onValueChange={(value: any) => onUpdate({ ...action, workflow: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FACTORY_DIRECT">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>工厂直发</span>
              </div>
            </SelectItem>
            <SelectItem value="STANDARD">标准流程</SelectItem>
            <SelectItem value="DROPSHIP">代发货</SelectItem>
            <SelectItem value="CROSS_DOCK">越库</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {action.workflow === "FACTORY_DIRECT" && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold">工厂直发配置</Label>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="space-y-0.5 flex-1">
                <Label className="text-sm font-medium">启用成品仓 (FG Staging)</Label>
                <p className="text-xs text-muted-foreground">
                  使用中间成品仓库进行暂存
                </p>
              </div>
              <Switch
                checked={config.enableFGStaging || false}
                onCheckedChange={(checked) => {
                  updateConfig('enableFGStaging', checked)
                  if (!checked) {
                    updateConfig('generateFGReceipt', false)
                    updateConfig('generateSaleOrder', false)
                    updateConfig('waitForFGReceipt', false)
                    updateConfig('autoCreateFinalReceipt', false)
                  }
                }}
              />
            </div>

            {showFGOptions && (
              <>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 ml-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm font-medium">生成成品入库 (FG Receipt)</Label>
                    <p className="text-xs text-muted-foreground">
                      创建成品仓入库单
                    </p>
                  </div>
                  <Switch
                    checked={config.generateFGReceipt || false}
                    onCheckedChange={(checked) => {
                      updateConfig('generateFGReceipt', checked)
                      if (!checked) {
                        updateConfig('waitForFGReceipt', false)
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 ml-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm font-medium">生成成品出库 (Sale Order)</Label>
                    <p className="text-xs text-muted-foreground">
                      创建成品仓出库单
                    </p>
                  </div>
                  <Switch
                    checked={config.generateSaleOrder || false}
                    onCheckedChange={(checked) => {
                      updateConfig('generateSaleOrder', checked)
                      if (!checked) {
                        updateConfig('waitForFGReceipt', false)
                        updateConfig('autoCreateFinalReceipt', false)
                      }
                    }}
                  />
                </div>

                {showWaitForFG && (
                  <div className={cn(
                    "flex items-center justify-between p-3 border rounded-lg ml-8",
                    !canEnableWaitForFG ? "opacity-50 bg-muted/20" : "bg-muted/30"
                  )}>
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium">等待成品入库完成</Label>
                      <p className="text-xs text-muted-foreground">
                        {!config.generateFGReceipt 
                          ? "需要先启用\"生成成品入库\"" 
                          : "出库前等待入库完成"}
                      </p>
                    </div>
                    <Switch
                      checked={config.waitForFGReceipt || false}
                      disabled={!canEnableWaitForFG}
                      onCheckedChange={(checked) => updateConfig('waitForFGReceipt', checked)}
                    />
                  </div>
                )}

                {showAutoCreateFinal && (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 ml-8">
                    <div className="space-y-0.5 flex-1">
                      <Label className="text-sm font-medium">基于DC回调创建最终入库</Label>
                      <p className="text-xs text-muted-foreground">
                        收到DC回调后自动创建最终入库单
                      </p>
                    </div>
                    <Switch
                      checked={config.autoCreateFinalReceipt || false}
                      onCheckedChange={(checked) => updateConfig('autoCreateFinalReceipt', checked)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
