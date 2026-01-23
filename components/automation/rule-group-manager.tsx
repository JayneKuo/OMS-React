"use client"

import * as React from "react"
import {
    RuleGroup,
    RoutingRule,
    DEFAULT_RULE_GROUPS,
    ConflictWarning,
    ActionBehavior,
    ExecutionMode,
} from "@/lib/types/routing-rule"
import { detectGroupConflicts, getConflictSummary } from "@/lib/utils/rule-conflict-detector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    AlertTriangle,
    ChevronDown,
    ChevronRight,
    Edit2,
    GripVertical,
    Layers,
    Plus,
    Settings,
    Trash2,
    Workflow,
    Warehouse,
    Bell,
    CheckCircle,
    Tag,
    AlertCircle,
    Info,
} from "lucide-react"

interface RuleGroupManagerProps {
    groups: RuleGroup[]
    rules: RoutingRule[]
    onGroupsChange: (groups: RuleGroup[]) => void
    onAddRule: (groupId: string) => void
    onEditRule: (rule: RoutingRule) => void
    onDeleteRule: (ruleId: string) => void
    onToggleRule: (ruleId: string, enabled: boolean) => void
}

// Icon mapping for groups
const GROUP_ICONS: Record<string, React.ReactNode> = {
    workflow: <Workflow className="h-4 w-4" />,
    warehouse: <Warehouse className="h-4 w-4" />,
    bell: <Bell className="h-4 w-4" />,
    check: <CheckCircle className="h-4 w-4" />,
    tag: <Tag className="h-4 w-4" />,
    default: <Layers className="h-4 w-4" />,
}

// Execution mode labels
const EXECUTION_MODE_LABELS: Record<ExecutionMode, { en: string; zh: string; description: string }> = {
    FIRST_MATCH: {
        en: "First Match",
        zh: "首个匹配",
        description: "只执行第一个匹配的规则"
    },
    ALL_MATCH: {
        en: "All Match",
        zh: "全部匹配",
        description: "执行所有匹配的规则"
    },
    CHAIN: {
        en: "Chain",
        zh: "链式执行",
        description: "按顺序执行，后者可覆盖前者"
    }
}

// Severity icons
const SEVERITY_ICONS: Record<string, React.ReactNode> = {
    ERROR: <AlertCircle className="h-4 w-4 text-red-500" />,
    WARNING: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    INFO: <Info className="h-4 w-4 text-blue-500" />,
}

export function RuleGroupManager({
    groups,
    rules,
    onGroupsChange,
    onAddRule,
    onEditRule,
    onDeleteRule,
    onToggleRule,
}: RuleGroupManagerProps) {
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
        new Set(groups.map(g => g.id))
    )
    const [editingGroup, setEditingGroup] = React.useState<RuleGroup | null>(null)
    const [showAddGroup, setShowAddGroup] = React.useState(false)
    const [newGroupName, setNewGroupName] = React.useState("")
    const [newGroupDescription, setNewGroupDescription] = React.useState("")
    const [newGroupMode, setNewGroupMode] = React.useState<ExecutionMode>("FIRST_MATCH")
    const [newGroupBehavior, setNewGroupBehavior] = React.useState<ActionBehavior>("OVERRIDE")

    // Calculate conflicts for each group
    const groupConflicts = React.useMemo(() => {
        const conflicts: Record<string, ConflictWarning[]> = {}
        for (const group of groups) {
            conflicts[group.id] = detectGroupConflicts(group, rules)
        }
        return conflicts
    }, [groups, rules])

    const toggleGroup = (groupId: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId)
        } else {
            newExpanded.add(groupId)
        }
        setExpandedGroups(newExpanded)
    }

    const handleToggleGroupEnabled = (groupId: string, enabled: boolean) => {
        const updatedGroups = groups.map(g =>
            g.id === groupId ? { ...g, enabled } : g
        )
        onGroupsChange(updatedGroups)
    }

    const handleUpdateGroup = (group: RuleGroup) => {
        const updatedGroups = groups.map(g =>
            g.id === group.id ? group : g
        )
        onGroupsChange(updatedGroups)
        setEditingGroup(null)
    }

    const handleDeleteGroup = (groupId: string) => {
        // Check if group has rules
        const groupRules = rules.filter(r => r.groupId === groupId)
        if (groupRules.length > 0) {
            alert(`无法删除规则组：组内还有 ${groupRules.length} 条规则。请先删除或移动这些规则。`)
            return
        }
        const updatedGroups = groups.filter(g => g.id !== groupId)
        onGroupsChange(updatedGroups)
    }

    const handleAddGroup = () => {
        if (!newGroupName.trim()) return

        const newGroup: RuleGroup = {
            id: `group_${Date.now()}`,
            name: newGroupName.trim(),
            description: newGroupDescription.trim(),
            executionMode: newGroupMode,
            primaryActionBehavior: newGroupBehavior,
            enabled: true,
            priority: groups.length + 1,
            ruleIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            color: newGroupBehavior === "OVERRIDE" ? "#3B82F6" : "#10B981",
        }

        onGroupsChange([...groups, newGroup])
        setShowAddGroup(false)
        setNewGroupName("")
        setNewGroupDescription("")
        setNewGroupMode("FIRST_MATCH")
        setNewGroupBehavior("OVERRIDE")
    }

    const getGroupRules = (groupId: string) => {
        return rules
            .filter(r => r.groupId === groupId)
            .sort((a, b) => a.priority - b.priority)
    }

    const getGroupIcon = (group: RuleGroup) => {
        return GROUP_ICONS[group.icon || "default"] || GROUP_ICONS.default
    }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">规则组 Rule Groups</h3>
                        <p className="text-sm text-muted-foreground">
                            按业务类型组织规则，每组有独立的执行模式
                        </p>
                    </div>
                    <Button onClick={() => setShowAddGroup(true)} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        添加规则组
                    </Button>
                </div>

                {/* Group List */}
                <div className="space-y-3">
                    {groups
                        .sort((a, b) => a.priority - b.priority)
                        .map((group) => {
                            const groupRules = getGroupRules(group.id)
                            const conflicts = groupConflicts[group.id] || []
                            const conflictSummary = getConflictSummary(conflicts)
                            const isExpanded = expandedGroups.has(group.id)

                            return (
                                <Card
                                    key={group.id}
                                    className={`transition-all ${!group.enabled ? "opacity-60" : ""}`}
                                    style={{ borderLeftColor: group.color, borderLeftWidth: "4px" }}
                                >
                                    <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
                                        <CardHeader className="py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>

                                                    <div
                                                        className="p-1.5 rounded-md"
                                                        style={{ backgroundColor: `${group.color}20` }}
                                                    >
                                                        {getGroupIcon(group)}
                                                    </div>

                                                    <div>
                                                        <CardTitle className="text-base flex items-center gap-2">
                                                            {group.name}
                                                            <Badge variant="outline" className="text-xs">
                                                                {EXECUTION_MODE_LABELS[group.executionMode].zh}
                                                            </Badge>
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {groupRules.length} 规则
                                                            </Badge>
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            {group.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Conflict warnings */}
                                                    {conflictSummary.total > 0 && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-yellow-50 text-yellow-700">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    {conflictSummary.total}
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="left" className="max-w-xs">
                                                                <div className="text-xs">
                                                                    {conflictSummary.errors > 0 && (
                                                                        <div className="text-red-500">{conflictSummary.errors} 错误</div>
                                                                    )}
                                                                    {conflictSummary.warnings > 0 && (
                                                                        <div className="text-yellow-500">{conflictSummary.warnings} 警告</div>
                                                                    )}
                                                                    {conflictSummary.info > 0 && (
                                                                        <div className="text-blue-500">{conflictSummary.info} 提示</div>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    <Switch
                                                        checked={group.enabled}
                                                        onCheckedChange={(checked) =>
                                                            handleToggleGroupEnabled(group.id, checked)
                                                        }
                                                    />

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditingGroup(group)}
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CollapsibleContent>
                                            <CardContent className="pt-0">
                                                {/* Conflict warnings display */}
                                                {conflicts.length > 0 && (
                                                    <div className="mb-3 space-y-1">
                                                        {conflicts.map((warning) => (
                                                            <div
                                                                key={warning.id}
                                                                className={`text-xs p-2 rounded flex items-start gap-2 ${warning.severity === "ERROR"
                                                                        ? "bg-red-50 text-red-700"
                                                                        : warning.severity === "WARNING"
                                                                            ? "bg-yellow-50 text-yellow-700"
                                                                            : "bg-blue-50 text-blue-700"
                                                                    }`}
                                                            >
                                                                {SEVERITY_ICONS[warning.severity]}
                                                                <div>
                                                                    <div>{warning.messageZh}</div>
                                                                    {warning.suggestionZh && (
                                                                        <div className="text-xs opacity-70 mt-0.5">
                                                                            💡 {warning.suggestionZh}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Rules list */}
                                                {groupRules.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {groupRules.map((rule, index) => (
                                                            <div
                                                                key={rule.id}
                                                                className={`flex items-center justify-between p-2 rounded-md border bg-background hover:bg-muted/50 transition-colors ${!rule.enabled ? "opacity-50" : ""
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                                    <Badge variant="outline" className="text-xs w-6 justify-center">
                                                                        {index + 1}
                                                                    </Badge>
                                                                    <div>
                                                                        <div className="text-sm font-medium">{rule.name}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {rule.conditions.length} 条件 → {rule.actions.length} 动作
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Switch
                                                                        checked={rule.enabled}
                                                                        onCheckedChange={(checked) => onToggleRule(rule.id, checked)}
                                                                    />
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => onEditRule(rule)}
                                                                    >
                                                                        <Edit2 className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-destructive"
                                                                        onClick={() => onDeleteRule(rule.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                                        此组暂无规则
                                                    </div>
                                                )}

                                                {/* Add rule button */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full mt-3"
                                                    onClick={() => onAddRule(group.id)}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    添加规则到此组
                                                </Button>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </Card>
                            )
                        })}
                </div>

                {/* Add Group Dialog */}
                <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>添加规则组</DialogTitle>
                            <DialogDescription>
                                创建一个新的规则组来组织相关的路由规则
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>组名称 *</Label>
                                <Input
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="例如：仓库分配规则"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>描述</Label>
                                <Input
                                    value={newGroupDescription}
                                    onChange={(e) => setNewGroupDescription(e.target.value)}
                                    placeholder="描述这个规则组的用途"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>执行模式</Label>
                                <Select value={newGroupMode} onValueChange={(v) => setNewGroupMode(v as ExecutionMode)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(EXECUTION_MODE_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                <div>
                                                    <div>{label.zh}</div>
                                                    <div className="text-xs text-muted-foreground">{label.description}</div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>动作类型</Label>
                                <Select value={newGroupBehavior} onValueChange={(v) => setNewGroupBehavior(v as ActionBehavior)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OVERRIDE">
                                            <div>
                                                <div>覆盖型 Override</div>
                                                <div className="text-xs text-muted-foreground">
                                                    如：设置仓库、设置工作流（只有一个生效）
                                                </div>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="ADDITIVE">
                                            <div>
                                                <div>累积型 Additive</div>
                                                <div className="text-xs text-muted-foreground">
                                                    如：添加标签、发送通知（可以叠加）
                                                </div>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddGroup(false)}>
                                取消
                            </Button>
                            <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>
                                创建
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Group Dialog */}
                {editingGroup && (
                    <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>编辑规则组</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>组名称 *</Label>
                                    <Input
                                        value={editingGroup.name}
                                        onChange={(e) =>
                                            setEditingGroup({ ...editingGroup, name: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>描述</Label>
                                    <Input
                                        value={editingGroup.description}
                                        onChange={(e) =>
                                            setEditingGroup({ ...editingGroup, description: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>执行模式</Label>
                                    <Select
                                        value={editingGroup.executionMode}
                                        onValueChange={(v) =>
                                            setEditingGroup({ ...editingGroup, executionMode: v as ExecutionMode })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(EXECUTION_MODE_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label.zh} - {label.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>优先级（数字越小越先执行）</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={editingGroup.priority}
                                        onChange={(e) =>
                                            setEditingGroup({
                                                ...editingGroup,
                                                priority: parseInt(e.target.value) || 1,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        handleDeleteGroup(editingGroup.id)
                                        setEditingGroup(null)
                                    }}
                                >
                                    删除规则组
                                </Button>
                                <div className="flex-1" />
                                <Button variant="outline" onClick={() => setEditingGroup(null)}>
                                    取消
                                </Button>
                                <Button onClick={() => handleUpdateGroup(editingGroup)}>
                                    保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </TooltipProvider>
    )
}
