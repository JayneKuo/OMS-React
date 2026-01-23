"use client"

import {
    RoutingRule,
    RuleGroup,
    ConflictWarning,
    ConflictType,
    ConflictSeverity,
    ACTION_BEHAVIOR_MAP,
    ActionType,
    RoutingRuleCondition,
} from "@/lib/types/routing-rule"

/**
 * Rule Conflict Detector
 * 
 * Analyzes rules within groups to detect potential conflicts and issues:
 * - ACTION_CONFLICT: Same override action type in multiple rules that may match same order
 * - CONDITION_OVERLAP: Rules with overlapping conditions  
 * - DEAD_RULE: Rules that will never execute due to earlier rules
 * - MISSING_DEFAULT: No catch-all rule in FIRST_MATCH group
 */

let conflictIdCounter = 0

function generateConflictId(): string {
    return `conflict_${Date.now()}_${++conflictIdCounter}`
}

/**
 * Check if two conditions might match the same value
 */
function conditionsOverlap(
    cond1: RoutingRuleCondition,
    cond2: RoutingRuleCondition
): boolean {
    // Different fields can't overlap
    if (cond1.field !== cond2.field) return false

    // Same operator and value = definite overlap
    if (cond1.operator === cond2.operator) {
        if (JSON.stringify(cond1.value) === JSON.stringify(cond2.value)) {
            return true
        }
    }

    // Check for overlapping ranges
    if (cond1.operator === "equals" && cond2.operator === "in") {
        const inValues = cond2.value as string[] | number[]
        return inValues.includes(cond1.value as never)
    }

    if (cond1.operator === "in" && cond2.operator === "equals") {
        const inValues = cond1.value as string[] | number[]
        return inValues.includes(cond2.value as never)
    }

    // Numeric range overlaps
    if (cond1.operator === "greaterThan" && cond2.operator === "greaterThan") {
        return true // Both match large values
    }

    if (cond1.operator === "lessThan" && cond2.operator === "lessThan") {
        return true // Both match small values
    }

    // Contains/equals overlap
    if (cond1.operator === "contains" || cond2.operator === "contains") {
        // Contains can overlap with equals if the equals value contains the contains value
        return true // Conservative: assume overlap
    }

    // isEmpty/isNotEmpty checks
    if (cond1.operator === cond2.operator) {
        return true
    }

    return false
}

/**
 * Check if two rules might match the same order
 */
function rulesOverlap(rule1: RoutingRule, rule2: RoutingRule): boolean {
    // If either rule has no conditions, it matches everything
    if (rule1.conditions.length === 0 || rule2.conditions.length === 0) {
        return true
    }

    // For AND logic: all conditions must potentially overlap
    // For OR logic: any condition overlap is enough

    // Simplified check: look for any overlapping condition
    for (const cond1 of rule1.conditions) {
        for (const cond2 of rule2.conditions) {
            if (conditionsOverlap(cond1, cond2)) {
                return true
            }
        }
    }

    return false
}

/**
 * Check if rule1 is a superset of rule2 (rule2 would never match if rule1 is first)
 */
function ruleIsSubset(broader: RoutingRule, narrower: RoutingRule): boolean {
    // If broader has no conditions, it matches everything
    if (broader.conditions.length === 0) {
        return true
    }

    // If narrower has fewer conditions, it's potentially broader, not narrower
    if (narrower.conditions.length < broader.conditions.length) {
        return false
    }

    // Check if all conditions in broader exist (or are more specific) in narrower
    for (const broaderCond of broader.conditions) {
        let found = false
        for (const narrowerCond of narrower.conditions) {
            if (broaderCond.field === narrowerCond.field) {
                found = true
                break
            }
        }
        if (!found) {
            return false
        }
    }

    return true
}

/**
 * Get action types from a rule
 */
function getActionTypes(rule: RoutingRule): ActionType[] {
    return rule.actions.map(a => a.type)
}

/**
 * Detect all conflicts within a rule group
 */
export function detectGroupConflicts(
    group: RuleGroup,
    rules: RoutingRule[]
): ConflictWarning[] {
    const warnings: ConflictWarning[] = []
    const groupRules = rules.filter(r => r.groupId === group.id && r.enabled)

    if (groupRules.length < 2) {
        // Check for missing default in FIRST_MATCH groups
        if (group.executionMode === "FIRST_MATCH" && groupRules.length > 0) {
            const hasDefault = groupRules.some(r => r.conditions.length === 0)
            if (!hasDefault) {
                warnings.push({
                    id: generateConflictId(),
                    type: "MISSING_DEFAULT",
                    severity: "INFO",
                    ruleIds: groupRules.map(r => r.id),
                    ruleNames: groupRules.map(r => r.name),
                    groupId: group.id,
                    groupName: group.name,
                    message: `No default rule in group "${group.name}". Orders not matching any rule will not be processed.`,
                    messageZh: `规则组"${group.name}"中没有默认规则。不匹配任何规则的订单将不会被处理。`,
                    suggestion: "Consider adding a catch-all rule with no conditions as a fallback.",
                    suggestionZh: "建议添加一个没有条件的兜底规则作为默认处理。"
                })
            }
        }
        return warnings
    }

    // Sort by priority for analysis
    const sortedRules = [...groupRules].sort((a, b) => a.priority - b.priority)

    // Check for overlapping rules with conflicting actions
    for (let i = 0; i < sortedRules.length; i++) {
        for (let j = i + 1; j < sortedRules.length; j++) {
            const rule1 = sortedRules[i]
            const rule2 = sortedRules[j]

            if (rulesOverlap(rule1, rule2)) {
                // Check for action conflicts (same override action type)
                const types1 = getActionTypes(rule1)
                const types2 = getActionTypes(rule2)

                const conflictingTypes = types1.filter(t =>
                    types2.includes(t) && ACTION_BEHAVIOR_MAP[t] === "OVERRIDE"
                )

                if (conflictingTypes.length > 0 && group.executionMode !== "FIRST_MATCH") {
                    warnings.push({
                        id: generateConflictId(),
                        type: "ACTION_CONFLICT",
                        severity: "WARNING",
                        ruleIds: [rule1.id, rule2.id],
                        ruleNames: [rule1.name, rule2.name],
                        groupId: group.id,
                        groupName: group.name,
                        message: `Rules "${rule1.name}" and "${rule2.name}" may both match the same order and have conflicting ${conflictingTypes.join(", ")} actions. In ALL_MATCH mode, only one will take effect.`,
                        messageZh: `规则"${rule1.name}"和"${rule2.name}"可能匹配同一订单，且有冲突的 ${conflictingTypes.join(", ")} 动作。在 ALL_MATCH 模式下，只有一个会生效。`,
                        suggestion: `Consider moving one rule to a separate group or changing to FIRST_MATCH mode.`,
                        suggestionZh: `建议将其中一个规则移到单独的组，或改用 FIRST_MATCH 模式。`
                    })
                }

                // In FIRST_MATCH mode, check for dead rules
                if (group.executionMode === "FIRST_MATCH" && ruleIsSubset(rule1, rule2)) {
                    warnings.push({
                        id: generateConflictId(),
                        type: "DEAD_RULE",
                        severity: "WARNING",
                        ruleIds: [rule2.id],
                        ruleNames: [rule2.name],
                        groupId: group.id,
                        groupName: group.name,
                        message: `Rule "${rule2.name}" may never execute because "${rule1.name}" has higher priority and matches a superset of conditions.`,
                        messageZh: `规则"${rule2.name}"可能永远不会执行，因为"${rule1.name}"优先级更高且条件范围更广。`,
                        suggestion: `Consider reordering rules or adjusting conditions.`,
                        suggestionZh: `建议重新排序规则或调整条件。`
                    })
                }
            }
        }
    }

    return warnings
}

/**
 * Detect conflicts across all groups
 */
export function detectAllConflicts(
    groups: RuleGroup[],
    rules: RoutingRule[]
): ConflictWarning[] {
    const allWarnings: ConflictWarning[] = []

    for (const group of groups) {
        if (group.enabled) {
            const groupWarnings = detectGroupConflicts(group, rules)
            allWarnings.push(...groupWarnings)
        }
    }

    return allWarnings
}

/**
 * Get conflict summary for display
 */
export function getConflictSummary(warnings: ConflictWarning[]): {
    errors: number
    warnings: number
    info: number
    total: number
} {
    return {
        errors: warnings.filter(w => w.severity === "ERROR").length,
        warnings: warnings.filter(w => w.severity === "WARNING").length,
        info: warnings.filter(w => w.severity === "INFO").length,
        total: warnings.length
    }
}

/**
 * Check if save should be blocked (has errors)
 */
export function shouldBlockSave(warnings: ConflictWarning[]): boolean {
    return warnings.some(w => w.severity === "ERROR")
}

/**
 * Group warnings by type for organized display
 */
export function groupWarningsByType(
    warnings: ConflictWarning[]
): Record<ConflictType, ConflictWarning[]> {
    const grouped: Record<ConflictType, ConflictWarning[]> = {
        ACTION_CONFLICT: [],
        CONDITION_OVERLAP: [],
        DEAD_RULE: [],
        CIRCULAR_DEPENDENCY: [],
        MISSING_DEFAULT: []
    }

    for (const warning of warnings) {
        grouped[warning.type].push(warning)
    }

    return grouped
}
