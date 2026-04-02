# 学习事件 Schema (LearningEvent)

## TypeScript 定义

```typescript
interface LearningEvent {
  // === 元数据 ===
  event_id: string;                  // 格式: "LEARN-{timestamp}-{random4}"
  created_at: string;                // ISO 8601
  
  // === 来源 ===
  source_type: 'repair_feedback' | 'manual_report' | 'pattern_accumulation' | 'exploratory_verified' | 'human_intervention_observed';
  repair_id?: string;                // 关联的修复 ID
  diagnosis_id?: string;             // 关联的诊断 ID

  // === 学习内容 ===
  event_type: LearningEventType;
  target_atom_id?: string;           // 被影响的知识原子 ID
  
  // === 变更详情 ===
  changes: KnowledgeChange[];
  
  // === 审计 ===
  reason: string;                    // 变更原因（中文）
  evidence_summary: string;          // 证据摘要
}

type LearningEventType = 
  | 'confidence_increase'            // 置信度提升
  | 'confidence_decrease'            // 置信度降低
  | 'new_atom_created'               // 新知识原子创建
  | 'atom_merged'                    // 知识合并
  | 'atom_deprecated'                // 知识废弃
  | 'action_weight_adjusted'         // 动作权重调整
  | 'symptom_signal_added';          // 新增症状信号

interface KnowledgeChange {
  field: string;                     // 变更的字段路径
  old_value: unknown;
  new_value: unknown;
}
```

---

## 反馈输入 Schema

学习 Agent 接收的 RepairFeedback（由处理 Agent 生成）：

```typescript
interface RepairFeedback {
  diagnosis_id: string;
  repair_id: string;
  diagnosis_was_correct: boolean | null;
  actions_effective: ActionEffectiveness[];
  new_pattern_detected: boolean;
  notes?: string;

  // === 探索性推理传递 ===
  is_exploratory: boolean;           // 透传自 DiagnosisResult
  exploratory_hypothesis?: {         // 透传自 DiagnosisResult
    proposed_domain: string;
    proposed_symptom_signals: string[];
    proposed_root_cause: string;
    proposed_actions: string[];
    auto_create_knowledge: boolean;
  };
}

interface ActionEffectiveness {
  action_code: string;
  was_effective: boolean;
  order_status_before: number;
  order_status_after: number | null;
}
```

---

## 模式累积缓冲区

对于潜在的新模式，使用累积缓冲区避免噪声：

```typescript
interface PatternBuffer {
  buffer_id: string;
  symptom_signals: string[];         // 累积的症状信号
  occurrence_count: number;          // 出现次数
  first_seen: string;                // 首次出现时间
  last_seen: string;                 // 最近出现时间
  related_feedback_ids: string[];    // 关联的反馈 ID
  threshold: number;                 // 创建知识原子的阈值（默认 3）
  status: 'accumulating' | 'ready' | 'created' | 'discarded';
}
```

缓冲区规则：
- 相似症状（Jaccard > 0.6）归入同一缓冲区
- `occurrence_count >= threshold` 时 status 变为 `ready`，触发知识创建
- 30 天无新增 → status 变为 `discarded`
- 创建知识原子后 status 变为 `created`

---

## 人工干预观察事件

通道 C 扫描到的人工干预修复，结构化为以下格式：

```typescript
interface HumanInterventionEvent {
  // === 订单信息 ===
  order_no: string;
  merchant_no: string;
  
  // === 异常快照 ===
  original_error: string;            // order_msg.remark（原始异常信息）
  exception_time: string;            // 进入异常状态的时间
  recovery_time: string;             // 恢复正常的时间
  status_before: number;             // 异常时的状态 (通常为 10)
  status_after: number;              // 恢复后的状态
  
  // === 追溯结果 ===
  intervention_type: InterventionType;
  traced_actions: string[];          // 追溯到的操作描述
  mapped_action_codes: string[];     // 映射到的标准 action_code
  trace_confidence: number;          // 追溯的置信度 [0, 1]
  
  // === 外部来源（可选）===
  git_commit?: {                     // 关联的 Git commit
    hash: string;
    message: string;
    author: string;
    timestamp: string;
  };
  deployment?: {                     // 关联的部署记录
    deploy_id: string;
    environment: string;
    timestamp: string;
  };
}

type InterventionType =
  | 'manual_data_fix'                // 手动修改数据（OMS 后台操作）
  | 'manual_reprocess'               // 手动触发重新处理（重推、重分派）
  | 'hotfix_deployment'              // 代码 hotfix 部署
  | 'config_change'                  // 配置变更（规则、映射等）
  | 'third_party_resolved'           // 第三方系统恢复（WMS、渠道等）
  | 'unknown'                        // 无法追溯具体操作
```

### 追溯 SQL 模式

```sql
-- Q10: 查找被人工修复的异常订单（每 15 分钟执行）
SELECT
  so.order_no, so.status AS current_status,
  so.merchant_no, so.channel_name,
  om.remark AS original_error,
  om.create_time AS exception_time,
  so.update_time AS recovery_time
FROM sales_order so
JOIN order_msg om ON so.order_no = om.order_no AND om.deleted = 0
WHERE so.status NOT IN (10, 5)
  AND om.type = 1
  AND om.create_time > DATE_SUB(NOW(), INTERVAL 24 HOUR)
  AND so.update_time > om.create_time
  AND so.deleted = 0
ORDER BY so.update_time DESC
LIMIT 50;

-- Q11: 追溯订单在异常期间的消息变化
SELECT remark, type, create_time
FROM order_msg
WHERE order_no = :order_no
  AND create_time > :exception_time
  AND deleted = 0
ORDER BY create_time ASC;

-- Q12: 追溯 dispatch 在异常期间的变化
SELECT dispatch_no, status, send_kafka, update_time
FROM order_dispatch
WHERE order_no = :order_no
  AND update_time > :exception_time
  AND deleted = 0;
```
