# 修复结果 Schema (RepairResult)

## TypeScript 定义

```typescript
interface RepairResult {
  // === 元数据 ===
  repair_id: string;                 // 修复唯一 ID，格式: "REPAIR-{timestamp}-{random4}"
  diagnosis_id: string;              // 关联的诊断 ID
  repaired_at: string;               // ISO 8601 时间戳
  duration_ms: number;               // 总执行耗时（毫秒）

  // === 订单信息 ===
  order_no: string;
  merchant_no: string;

  // === 执行结果 ===
  overall_status: 'success' | 'partial' | 'failed' | 'skipped';
  action_results: ActionResult[];

  // === 人工升级 ===
  escalations: Escalation[];

  // === 确认状态 ===
  needs_confirmation: boolean;       // 中置信度诊断需要人工确认
  confirmed_by?: string;             // 确认人
  confirmed_at?: string;             // 确认时间

  // === 反馈给学习 Agent ===
  feedback: RepairFeedback;
}
```

## 动作执行结果

```typescript
interface ActionResult {
  action_code: string;               // 执行的动作编码
  priority: number;                  // 执行优先级
  status: 'success' | 'failed' | 'timeout' | 'skipped' | 'pending_confirmation';
  started_at: string;                // 开始执行时间
  completed_at: string;              // 完成时间
  duration_ms: number;               // 执行耗时
  
  // 执行详情
  executor: string;                  // 执行器名称
  request?: unknown;                 // 发送的请求（脱敏）
  response?: unknown;                // 收到的响应（脱敏）
  error?: string;                    // 错误信息（如果失败）
  
  // 重试信息
  retry_count: number;               // 重试次数
  max_retries: number;               // 最大重试次数

  // 跳过原因
  skip_reason?: string;              // 如果 status=skipped，说明原因
}
```

## 人工升级

```typescript
interface Escalation {
  action_code: string;               // 需要人工处理的动作编码
  reason: string;                    // 升级原因（中文）
  severity: 'critical' | 'high' | 'medium' | 'low';
  assigned_to: 'engineering' | 'ops' | 'merchant' | 'channel_support';
  context: Record<string, unknown>;  // 上下文信息（订单号、SKU 等）
  created_at: string;
}
```

## 学习反馈

```typescript
interface RepairFeedback {
  diagnosis_id: string;
  repair_id: string;
  diagnosis_was_correct: boolean | null;  // null = 尚未确认
  actions_effective: ActionEffectiveness[];
  new_pattern_detected: boolean;     // 是否发现新的异常模式
  notes?: string;                    // 备注

  // === 探索性推理传递 ===
  is_exploratory: boolean;           // 透传自 DiagnosisResult.is_exploratory
  exploratory_hypothesis?: {         // 透传自 DiagnosisResult.exploratory_hypothesis
    proposed_domain: string;
    proposed_symptom_signals: string[];
    proposed_root_cause: string;
    proposed_actions: string[];
    auto_create_knowledge: boolean;
  };
}

interface ActionEffectiveness {
  action_code: string;
  was_effective: boolean;            // 该动作是否有效解决了问题
  order_status_before: number;       // 执行前订单状态
  order_status_after: number | null; // 执行后订单状态（null=未检查）
}
```

---

## overall_status 判定规则

| 条件 | overall_status |
|------|---------------|
| 所有 auto_executable 动作都 success | `success` |
| 部分 success，部分 failed/timeout | `partial` |
| 所有 auto_executable 动作都 failed/timeout | `failed` |
| 没有可执行的动作（全部需人工） | `skipped` |

## 破坏性动作保护

以下动作即使 confidence >= 0.8 也需要额外确认：

| 动作编码 | 原因 | 确认方式 |
|---------|------|---------|
| `CANCEL_AND_RECREATE` | 会取消原订单 | 必须人工确认 |
| `MANUAL_DATA_FIX` | 直接修改数据 | 必须人工确认 |

这些动作的 ActionResult.status 初始为 `pending_confirmation`。
