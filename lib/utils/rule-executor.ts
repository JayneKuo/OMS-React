"use client"

import {
    RoutingRule,
    RuleGroup,
    TestOrder,
    RuleMatchResult,
    ActionExecutionResult,
    ExecutionSimulationResult,
    ConflictWarning,
    ACTION_BEHAVIOR_MAP,
    RoutingRuleCondition,
    ConditionOperator,
    RuleAction,
} from "@/lib/types/routing-rule"

/**
 * Rule Executor - Simulates rule execution for preview
 * 
 * Features:
 * - Evaluates conditions against test order
 * - Respects group execution modes (FIRST_MATCH, ALL_MATCH, CHAIN)
 * - Tracks which rules matched and why
 * - Resolves action conflicts based on priority
 */

/**
 * Evaluate a single condition against an order
 */
function evaluateCondition(
    condition: RoutingRuleCondition,
    order: TestOrder
): boolean {
    const fieldValue = order[condition.field]
    const conditionValue = condition.value

    // Handle missing/undefined field values
    if (fieldValue === undefined || fieldValue === null) {
        if (condition.operator === "isEmpty") return true
        if (condition.operator === "isNotEmpty") return false
        return false // Can't evaluate other operators without a value
    }

    switch (condition.operator) {
        case "equals":
            return fieldValue === conditionValue

        case "notEquals":
            return fieldValue !== conditionValue

        case "contains":
            if (typeof fieldValue === "string") {
                return fieldValue.toLowerCase().includes(String(conditionValue).toLowerCase())
            }
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(conditionValue)
            }
            return false

        case "notContains":
            if (typeof fieldValue === "string") {
                return !fieldValue.toLowerCase().includes(String(conditionValue).toLowerCase())
            }
            if (Array.isArray(fieldValue)) {
                return !fieldValue.includes(conditionValue)
            }
            return true

        case "startsWith":
            return typeof fieldValue === "string" &&
                fieldValue.toLowerCase().startsWith(String(conditionValue).toLowerCase())

        case "endsWith":
            return typeof fieldValue === "string" &&
                fieldValue.toLowerCase().endsWith(String(conditionValue).toLowerCase())

        case "matches":
            try {
                const regex = new RegExp(String(conditionValue))
                return regex.test(String(fieldValue))
            } catch {
                return false
            }

        case "greaterThan":
            return Number(fieldValue) > Number(conditionValue)

        case "lessThan":
            return Number(fieldValue) < Number(conditionValue)

        case "greaterThanOrEqual":
            return Number(fieldValue) >= Number(conditionValue)

        case "lessThanOrEqual":
            return Number(fieldValue) <= Number(conditionValue)

        case "between":
            if (Array.isArray(conditionValue) && conditionValue.length === 2) {
                const numValue = Number(fieldValue)
                return numValue >= conditionValue[0] && numValue <= conditionValue[1]
            }
            return false

        case "in":
            if (Array.isArray(conditionValue)) {
                return conditionValue.includes(fieldValue)
            }
            return false

        case "notIn":
            if (Array.isArray(conditionValue)) {
                return !conditionValue.includes(fieldValue)
            }
            return true

        case "isEmpty":
            if (Array.isArray(fieldValue)) return fieldValue.length === 0
            if (typeof fieldValue === "string") return fieldValue.trim() === ""
            return false

        case "isNotEmpty":
            if (Array.isArray(fieldValue)) return fieldValue.length > 0
            if (typeof fieldValue === "string") return fieldValue.trim() !== ""
            return true

        case "before":
            try {
                return new Date(fieldValue) < new Date(String(conditionValue))
            } catch {
                return false
            }

        case "after":
            try {
                return new Date(fieldValue) > new Date(String(conditionValue))
            } catch {
                return false
            }

        case "withinDays":
            try {
                const orderDate = new Date(fieldValue)
                const now = new Date()
                const diffDays = Math.abs((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
                return diffDays <= Number(conditionValue)
            } catch {
                return false
            }

        default:
            return false
    }
}

/**
 * Evaluate all conditions for a rule
 */
function evaluateRule(
    rule: RoutingRule,
    order: TestOrder
): { matched: boolean; matchedConditions: string[] } {
    if (rule.conditions.length === 0) {
        // No conditions = matches everything
        return { matched: true, matchedConditions: ["(no conditions - default match)"] }
    }

    const results: { condition: RoutingRuleCondition; matched: boolean }[] =
        rule.conditions.map(cond => ({
            condition: cond,
            matched: evaluateCondition(cond, order)
        }))

    const matchedConditions = results
        .filter(r => r.matched)
        .map(r => `${r.condition.field} ${r.condition.operator} ${JSON.stringify(r.condition.value)}`)

    if (rule.conditionLogic === "OR") {
        // OR: at least one must match
        const matched = results.some(r => r.matched)
        return { matched, matchedConditions }
    } else {
        // AND: all must match
        const matched = results.every(r => r.matched)
        return { matched, matchedConditions: matched ? matchedConditions : [] }
    }
}

/**
 * Execute rules within a single group
 */
function executeGroup(
    group: RuleGroup,
    rules: RoutingRule[],
    order: TestOrder
): {
    ruleResults: RuleMatchResult[]
    actions: ActionExecutionResult[]
} {
    const groupRules = rules
        .filter(r => r.groupId === group.id && r.enabled)
        .sort((a, b) => a.priority - b.priority)

    const ruleResults: RuleMatchResult[] = []
    const actions: ActionExecutionResult[] = []
    let firstMatchFound = false

    for (const rule of groupRules) {
        const { matched, matchedConditions } = evaluateRule(rule, order)

        const result: RuleMatchResult = {
            ruleId: rule.id,
            ruleName: rule.name,
            groupId: group.id,
            groupName: group.name,
            matched: false,
            matchedConditions: []
        }

        if (matched) {
            if (group.executionMode === "FIRST_MATCH" && firstMatchFound) {
                // Skip - earlier rule already matched
                result.matched = false
                result.skippedReason = "Earlier rule already matched"
            } else {
                result.matched = true
                result.matchedConditions = matchedConditions
                firstMatchFound = true

                // Add actions from this rule
                for (const action of rule.actions) {
                    actions.push({
                        actionType: action.type,
                        behavior: ACTION_BEHAVIOR_MAP[action.type],
                        sourceRuleId: rule.id,
                        sourceRuleName: rule.name,
                        sourceGroupName: group.name,
                        action
                    })
                }
            }
        }

        ruleResults.push(result)
    }

    return { ruleResults, actions }
}

/**
 * Resolve action conflicts - for override actions, keep only highest priority
 */
function resolveActionConflicts(
    actions: ActionExecutionResult[]
): ActionExecutionResult[] {
    const finalActions: ActionExecutionResult[] = []
    const seenOverrideTypes = new Map<string, ActionExecutionResult>()

    for (const action of actions) {
        if (action.behavior === "OVERRIDE") {
            const existing = seenOverrideTypes.get(action.actionType)
            if (existing) {
                // Mark the earlier one as overridden
                existing.overriddenBy = action.sourceRuleName
            }
            seenOverrideTypes.set(action.actionType, action)
        }
        finalActions.push(action)
    }

    return finalActions
}

/**
 * Main simulation function - execute all groups against a test order
 */
export function simulateRuleExecution(
    order: TestOrder,
    groups: RuleGroup[],
    rules: RoutingRule[]
): ExecutionSimulationResult {
    const enabledGroups = groups
        .filter(g => g.enabled)
        .sort((a, b) => a.priority - b.priority)

    const groupResults: ExecutionSimulationResult["groupResults"] = []
    let allActions: ActionExecutionResult[] = []
    let totalRulesEvaluated = 0
    let totalRulesMatched = 0

    for (const group of enabledGroups) {
        const { ruleResults, actions } = executeGroup(group, rules, order)

        groupResults.push({
            groupId: group.id,
            groupName: group.name,
            executionMode: group.executionMode,
            ruleResults
        })

        allActions = [...allActions, ...actions]
        totalRulesEvaluated += ruleResults.length
        totalRulesMatched += ruleResults.filter(r => r.matched).length
    }

    // Resolve conflicts between override actions
    const finalActions = resolveActionConflicts(allActions)

    return {
        testOrder: order,
        groupResults,
        finalActions,
        warnings: [], // Conflicts detected separately
        totalRulesEvaluated,
        totalRulesMatched,
        totalActionsExecuted: finalActions.filter(a => !a.overriddenBy).length
    }
}

/**
 * Get action summary for display
 */
export function getActionSummary(actions: ActionExecutionResult[]): string[] {
    const summary: string[] = []

    for (const action of actions) {
        if (action.overriddenBy) continue // Skip overridden actions

        let description = ""
        switch (action.actionType) {
            case "SET_WORKFLOW":
                description = `设置工作流: ${(action.action as any).workflow || "N/A"}`
                break
            case "ASSIGN_WAREHOUSE":
                description = `分配仓库: ${(action.action as any).warehouseName || "N/A"}`
                break
            case "SET_PRIORITY":
                description = `设置优先级: ${(action.action as any).priority || "N/A"}`
                break
            case "SEND_NOTIFICATION":
                description = `发送通知: ${(action.action as any).channel || "N/A"}`
                break
            case "ADD_TAG":
                description = `添加标签: ${((action.action as any).tags || []).join(", ")}`
                break
            case "HOLD_ORDER":
                description = `暂停订单: ${(action.action as any).reason || "N/A"}`
                break
            case "AUTO_APPROVE":
                description = `自动审批: Level ${(action.action as any).approvalLevel || 1}`
                break
            case "TRIGGER_WEBHOOK":
                description = `触发Webhook: ${(action.action as any).webhookUrl || "N/A"}`
                break
            default:
                description = `执行: ${action.actionType}`
        }

        summary.push(`${description} (来自: ${action.sourceRuleName})`)
    }

    return summary
}

/**
 * Format test order for display
 */
export function formatTestOrder(order: TestOrder): string {
    const parts: string[] = []

    if (order.poNumber) parts.push(`PO#: ${order.poNumber}`)
    if (order.supplier) parts.push(`供应商: ${order.supplier}`)
    if (order.totalAmount) parts.push(`金额: $${order.totalAmount}`)
    if (order.category) parts.push(`类别: ${order.category}`)
    if (order.isUrgent) parts.push(`急单: 是`)
    if (order.country) parts.push(`国家: ${order.country}`)

    return parts.join(" | ") || "空订单"
}
