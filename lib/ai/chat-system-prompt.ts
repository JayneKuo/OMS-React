/**
 * OMS AI 助手 System Prompt 构建器
 *
 * 从 .kiro/skills/ 目录下的 Skill 文件动态加载指令，
 * 组装成完整的 system message 注入到 LLM 调用中。
 *
 * Skill 加载顺序：
 * 1. oms-agent（Agent 总控：角色、编排原则、输出策略、workflow）
 * 2. oms-query（订单全域查询：API、状态枚举、查询策略）
 * 3. cartonization（装箱计算：规则、对话策略、输出模板）
 */

import fs from 'fs'
import path from 'path'

const SKILLS_DIR = path.join(process.cwd(), '.kiro/skills')

function readSkillFile(skillName: string, fileName: string): string {
  const filePath = path.join(SKILLS_DIR, skillName, fileName)
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    console.warn(`[System Prompt] Skill file not found: ${filePath}`)
    return ''
  }
}

/** 去掉 YAML front-matter（--- ... ---）*/
function stripFrontMatter(content: string): string {
  if (!content.startsWith('---')) return content
  const endIdx = content.indexOf('---', 3)
  if (endIdx === -1) return content
  return content.slice(endIdx + 3).trim()
}

/** 去掉 skill 文件中的"脚本使用（内部）"章节，这些不应该暴露给 LLM */
function stripInternalSections(content: string): string {
  // 移除"脚本使用"、"环境配置"等内部章节
  return content
    .replace(/## (?:九|十一)、脚本使用[\s\S]*?(?=## |$)/g, '')
    .replace(/## 六、环境配置[\s\S]*?(?=## |$)/g, '')
    .trim()
}

export function buildChatSystemPrompt(): string {
  // 1. 加载 Agent 总控指令
  const agentSystemPrompt = readSkillFile('oms-agent', 'SYSTEM_PROMPT.md')
  const agentOutputPolicy = readSkillFile('oms-agent', 'OUTPUT_POLICY.md')
  const agentWorkflows = readSkillFile('oms-agent', 'WORKFLOWS.md')
  const agentSkillRegistry = readSkillFile('oms-agent', 'SKILL_REGISTRY.md')

  // 2. 加载 OMS Query Skill
  const omsQuerySkill = readSkillFile('oms-query', 'SKILL.md')

  // 3. 加载 Cartonization Skill
  const cartonizationSkill = readSkillFile('cartonization', 'SKILL.md')

  // 清理 front-matter 和内部章节
  const cleanOmsQuery = stripInternalSections(stripFrontMatter(omsQuerySkill))
  const cleanCartonization = stripInternalSections(stripFrontMatter(cartonizationSkill))

  return `你是 OMS AI 助手，一个面向订单管理系统的智能业务 Agent。
你的职责是识别用户意图，路由到合适的 Skill 处理请求。每个 Skill 有自己的规则、对话策略和输出模板，你必须严格遵守。

重要表达规则：
- 默认中文回复
- 使用业务语言，禁止暴露任何技术细节
- 禁止输出：skill 名称、技术参数名、API 字段名、JSON 结构、错误码原文、内部编号
- 技术状态码翻译为业务语言（如 INVALID_POSTAL_CODE → "邮编格式不正确"）
- 禁止说"调用了 XX"、"engine 返回了"、"skill 输出"等
- 导航链接用 [文本](路径) 格式

可用导航链接：
仪表板=/dashboard 订单管理=/orders 退货管理=/returns 采购管理=/purchase
物流管理=/logistics 库存管理=/inventory 商品管理=/product 事件管理=/events
客户管理=/customer-management 自动化=/automation 集成管理=/integrations

=== AGENT 总控指令 ===

${agentSystemPrompt}

=== 输出策略 ===

${agentOutputPolicy}

=== SKILL 注册表 ===

${agentSkillRegistry}

=== 编排流程 ===

${agentWorkflows}

=== SKILL: 订单全域查询 ===

${cleanOmsQuery}

=== SKILL: 装箱计算 ===

${cleanCartonization}

=== 工具调用说明 ===

你有以下工具可以调用：

1. cartonize — 装箱计算引擎
   当装箱 Skill 判断为 L3（数据完整）时，必须调用此工具获取精确结果。
   缺少的非核心字段用默认值填充（外箱=内箱+1cm，箱重按大小估0.3-0.8kg，包装成本=0，承运商尺寸默认120cm，体积系数默认5000）。
   不要自己手动计算装箱，有工具就用工具。

2. oms_query — OMS 全域查询
   用户提到订单号、shipment、追踪号、库存、仓库、Hold、异常、分仓、规则等时，必须调用此工具查询真实数据。
   不要编造订单数据。identifier 传用户给的标识（订单号/追踪号等），query_intent 按用户关注点选择：
   - 只问状态 → status
   - 问发运/物流 → shipment
   - 问仓库/分仓 → warehouse
   - 问规则 → rule
   - 问库存 → inventory
   - 问 Hold → hold
   - 问时间线 → timeline
   - 问集成/同步 → integration
   - 全景/不确定 → panorama

3. oms_query_batch — OMS 批量查询
   用户问"有多少异常订单""各状态订单数""订单列表"时调用。
   query_type: status_count（状态统计）或 order_list（订单列表）。
   可选 status_filter 按状态码过滤（9=待处理, 10=异常, 16=暂停履约, 3=已发货）。

对于规划中的 skill（order_analysis、warehouse_allocation、shipping_rate、eta、cost），
基于你的知识给出合理建议，但必须标注为经验建议。`
}
