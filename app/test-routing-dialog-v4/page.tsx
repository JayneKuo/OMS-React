V4
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                rule={editingRule}
                onSave={handleSaveRule}
                locale="zh"
            />
        </div>
    )
}
onMode}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">优先级：</span>
                                    <span className="font-medium ml-2">{rule.priority}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog */}
            <PORoutingRuleDialog>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">动作数量：</span>
                                    <span className="font-medium ml-2">{rule.actions.length}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">执行模式：</span>
                                    <span className="font-medium ml-2">{rule.executiext-destructive" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">条件数量：</span>
                                    <span className="font-medium ml-2">{rule.conditions.length}</span=> handleEditRule(rule)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteRule(rule.id)}
                                    >
                                        <Trash2 className="h-4 w-4 t                                <Power className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <PowerOff className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={()             <CardDescription>{rule.description}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleToggleRule(rule.id)}
                                    >
                                        {rule.enabled ? (
                                       {rule.enabled ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                启用
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">禁用</Badge>
                                        )}
                                    </div>
                        v className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-base">{rule.name}</CardTitle>
                                        <Badge className={getRuleTypeBadgeColor(rule.type)}>
                                            {getRuleTypeLabel(rule.type)}
                                        </Badge>
             600 dark:text-blue-400">•</span>
                            <span><strong>灵活配置：</strong>自定义类型可以使用所有动作，无限制</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Rules List */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold">现有规则</h2>
                {rules.map(rule => (
                    <Card key={rule.id}>
                        <CardHeader className="pb-3">
                            <di</span>
                            <span><strong>动作优先排序：</strong>推荐的动作在选择列表中优先显示，并带有⭐标记</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><strong>类型说明提示：</strong>选择规则类型后显示该类型的说明和推荐动作列表</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-rong>规则类型选择：</strong>在基本信息中增加规则类型字段（工厂直发、基于SKU、基于供应商、基于仓库、自定义）</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><strong>智能推荐动作：</strong>根据选择的规则类型，自动推荐相关的动作类型</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•         </div>

            {/* Features */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="text-base">✨ 新功能特性</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400">•</span>
                            <span><str */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">路由规则测试 V4</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        测试带规则类型的新增规则弹窗，不同类型显示不同推荐动作
                    </p>
                </div>
                <Button onClick={handleCreateRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    新增规则
                </Button>
   D: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
            SUPPLIER_BASED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
            WAREHOUSE_BASED: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
            CUSTOM: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
        }
        return colors[type] || colors.CUSTOM
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Headee: string) => {
        const labels: Record<string, string> = {
            FACTORY_DIRECT: "工厂直发",
            SKU_BASED: "基于SKU",
            SUPPLIER_BASED: "基于供应商",
            WAREHOUSE_BASED: "基于仓库",
            CUSTOM: "自定义"
        }
        return labels[type] || type
    }

    const getRuleTypeBadgeColor = (type: string) => {
        const colors: Record<string, string> = {
            FACTORY_DIRECT: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
            SKU_BASEe)
    }

    const handleSaveRule = (rule: RoutingRule) => {
        if (editingRule) {
            setRules(rules.map(r => r.id === rule.id ? rule : r))
        } else {
            setRules([...rules, rule])
        }
    }

    const handleDeleteRule = (ruleId: string) => {
        setRules(rules.filter(r => r.id !== ruleId))
    }

    const handleToggleRule = (ruleId: string) => {
        setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    }

    const getRuleTypeLabel = (typ         warehouseName: "US East Coast"
                },
                {
                    type: "ADD_TAG",
                    tags: ["electronics", "fragile"]
                }
            ],
            createdAt: "2025-01-02T00:00:00Z",
            updatedAt: "2025-01-02T00:00:00Z"
        }
    ])

    const handleCreateRule = () => {
        setEditingRule(null)
        setDialogOpen(true)
    }

    const handleEditRule = (rule: RoutingRule) => {
        setEditingRule(rule)
        setDialogOpen(truU_BASED",
            enabled: true,
            priority: 2,
            executionMode: "FIRST_MATCH",
            conditions: [
                {
                    id: "cond-2",
                    field: "category",
                    operator: "equals",
                    value: "Electronics"
                }
            ],
            conditionLogic: "AND",
            actions: [
                {
                    type: "ASSIGN_WAREHOUSE",
                    warehouseId: "US-EAST",
            true,
                        generateSaleOrder: true
                    }
                },
                {
                    type: "ASSIGN_WAREHOUSE",
                    warehouseId: "BR-SP",
                    warehouseName: "Brazil Warehouse"
                }
            ],
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z"
        },
        {
            id: "rule-2",
            name: "电子产品SKU路由",
            description: "电子产品分配到专用仓库",
            type: "SK"BR"
                }
            ],
            conditionLogic: "AND",
            actions: [
                {
                    type: "SET_WORKFLOW",
                    workflow: "FACTORY_DIRECT",
                    config: {
                        enableFGStaging: true,
                        generateFGReceipt:State<RoutingRule | null>(null)
    const [rules, setRules] = React.useState<RoutingRule[]>([
        {
            id: "rule-1",
            name: "巴西仓库工厂直发",
            description: "巴西订单通过成品仓路由",
            type: "FACTORY_DIRECT",
            enabled: true,
            priority: 1,
            executionMode: "FIRST_MATCH",
            conditions: [
                {
                    id: "cond-1",
                    field: "country",
                    operator: "equals",
                    value: Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PORoutingRuleDialogV4 } from "@/components/automation/po-routing-rule-dialog-v4"
import type { RoutingRule } from "@/lib/types/routing-rule"
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react"

export default function TestRoutingDialogV4Page() {
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [editingRule, setEditingRule] = React.use"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 