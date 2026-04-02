# 诊断结果 Schema (DiagnosisResult)

## TypeScript 定义

```typescript
interface DiagnosisResult {
  // === 元数据 ===
  diagnosis_id: string;              // 诊断唯一 ID，格式: "DIAG-{timestamp}-{random4}"
  diagnosed_at: string;              // ISO 8601 时间戳
  duration_ms: number;               // 诊断耗时（毫秒）

  // === 输入回显 ===
  input: DiagnosisInput;

  // === 订单上下文 ===
  order_context: OrderContext | null; // 如果无法查到订单则为 null

  // === 诊断结论 ===
  root_causes: RootCause[];          // 候选根因列表，按置信度降序，最多 3 个
  overall_confidence: number;        // 综合置信度 [0, 1]
  domain: string;                    // 判定的业务域编码（如 ORDER_WMS_SYNC）
  severity: 'critical' | 'high' | 'medium' | 'low';

  // === 建议动作 ===
  recommended_actions: RecommendedAction[];

  // === Handoff ===
  handoff_ready: boolean;            // 是否可以 handoff 给处理 Agent
  handoff_blocked_reason?: string;   // 如果不可 handoff，说明原因

  // === 探索性推理标记 ===
  is_exploratory: boolean;           // true = 知识库无匹配，由探索性推理生成
  exploratory_hypothesis?: ExploratoryHypothesis; // 探索性推理的假设详情

  // === 推理痕迹 ===
  reasoning_trace: ReasoningStep[];  // 推理过程记录，用于审计和学习
}


interface DiagnosisInput {
  order_no?: string;
  channel_sales_order_no?: string;
  symptom_text?: string;
  error_message?: string;
  requested_by: 'user' | 'system' | 'scheduler';
}

interface OrderContext {
  order_no: string;
  channel_sales_order_no: string | null;
  merchant_no: string;
  channel_name: string | null;
  status: number;                    // OrderStatusV2Enum
  status_label: string;              // 状态中文名
  order_type: number;
  create_time: string;
  accounting_code: string | null;    // 仓库 code

  // 拆单信息
  dispatches: DispatchInfo[];

  // 最近异常消息
  recent_messages: OrderMessage[];

  // 商品行
  items: OrderItemInfo[];
}

interface DispatchInfo {
  dispatch_no: string;
  status: number;
  accounting_code: string | null;
  warehouse_name: string | null;
  send_kafka: number;                // 0=未发送, 1=已发送
  shipment_no: string | null;        // 关联的履约单号
  shipment_status: number | null;
  tracking_number: string | null;
}

interface OrderMessage {
  remark: string;
  type: number;
  create_time: string;
}

interface OrderItemInfo {
  sku: string;
  qty: number;
  title: string | null;
  reference_no: string | null;
}
```

## 根因定义

```typescript
interface RootCause {
  cause_id: string;                  // 关联的知识原子 ID（如有匹配）
  cause_code: string;                // 根因编码，如 "ITEM_ID_NOT_MAPPED"
  cause_description: string;         // 中文描述
  confidence: number;                // 该根因的置信度 [0, 1]
  evidence: Evidence[];              // 支撑该根因的证据列表
  matched_knowledge_atom?: string;   // 匹配的知识原子 ID
  match_score?: number;              // 知识匹配分数
}

interface Evidence {
  source: 'knowledge_base' | 'database' | 'symptom_text' | 'exploratory_reasoning';
  description: string;               // 中文描述
  raw_data?: unknown;                // 原始数据（SQL 结果片段等）
}
```

## 建议动作定义

```typescript
interface RecommendedAction {
  action_code: string;               // 标准动作编码（见 action-codes.md）
  priority: number;                  // 执行优先级，1 = 最高
  description: string;               // 中文描述
  auto_executable: boolean;          // 是否可自动执行
  parameters?: Record<string, unknown>; // 动作参数（如 order_no, sku 等）
  estimated_success_rate?: number;   // 预估成功率 [0, 1]
}
```

## 推理痕迹定义

```typescript
interface ReasoningStep {
  step: number;                      // 步骤序号 1-5（含 3.5）
  name: string;                      // 步骤名称
  input_summary: string;             // 输入摘要
  output_summary: string;            // 输出摘要
  duration_ms: number;               // 该步骤耗时
  notes?: string;                    // 备注（如 "知识库无匹配，激活探索性推理"）
}
```

## 探索性假设定义

```typescript
interface ExploratoryHypothesis {
  // 推理依据
  reasoning_method: 'llm_chain_of_thought' | 'rule_based_fallback';
  reasoning_input: {
    symptom_text: string;
    order_context_summary: string;   // 数据库证据摘要
    domain_model_used: string[];     // 使用的领域模型知识（如 "OMS 订单状态机", "WMS 推单流程"）
  };

  // 假设内容（可直接转化为 KnowledgeAtom 的字段）
  proposed_domain: string;           // 推断的业务域
  proposed_symptom_signals: string[];// 提取的症状信号
  proposed_root_cause: string;       // 推断的根因描述
  proposed_actions: string[];        // 推断的建议动作编码

  // 元数据
  needs_verification: boolean;       // 是否需要修复验证（始终为 true）
  auto_create_knowledge: boolean;    // 修复成功后是否自动入库（默认 true）
}
```

---

## 置信度等级

| 范围 | 等级 | 含义 | Handoff 策略 |
|------|------|------|-------------|
| 0.8 - 1.0 | 高 | 根因明确，证据充分 | 自动 handoff 给处理 Agent |
| 0.5 - 0.79 | 中 | 根因可能，需要确认 | handoff 但标记需人工确认 |
| 0.3 - 0.49 | 低 | 根因不确定 | 不自动 handoff，请求更多信息 |
| 0 - 0.29 | 极低 | 无法判断 | 标记为 UNKNOWN，升级到人工 |

## 严重程度判定

| 条件 | 严重程度 |
|------|---------|
| 订单状态 = Exception (10) 且影响发货 | `critical` |
| 订单状态 = Exception (10) 但不影响发货 | `high` |
| 订单状态 = OnHold (8) 或 Allocated (1) 卡单 | `medium` |
| 通知失败、非核心流程异常 | `low` |

## Handoff 条件

DiagnosisResult 可以 handoff 给处理 Agent 当且仅当：
1. `overall_confidence >= 0.5`
2. `recommended_actions` 至少有一个 `auto_executable = true`
3. `order_context` 不为 null

否则 `handoff_ready = false`，并在 `handoff_blocked_reason` 中说明原因。
