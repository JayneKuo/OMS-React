# 知识演化规则 (Knowledge Evolution Rules)

## 置信度调整规则

### 正向反馈（诊断正确 + 修复成功）

```
atom.confidence = min(atom.confidence + 0.05, 0.99)
atom.hit_count += 1
atom.last_hit_at = now()
```

### 负向反馈（诊断错误）

```
atom.confidence = max(atom.confidence - 0.10, 0.10)

如果连续 5 次负向反馈:
  → deprecate_atom(atom_id, "连续 5 次诊断错误，知识可能已过时")
```

### 修复失败但诊断正确

```
// 不调整 confidence（诊断对了，只是修复手段不对）
// 但调整动作权重
for each action where was_effective = false:
  action.failure_count += 1
  如果 action.failure_count >= 3:
    → 从知识原子的 recommended_actions 中移除该动作
    → 记录 LearningEvent(type: 'action_weight_adjusted')
```

### 置信度衰减

长期未命中的知识原子自然衰减：

```
如果 last_hit_at 距今 > 90 天:
  atom.confidence = max(atom.confidence - 0.02, 0.10)
  // 每月衰减一次，最低不低于 0.10

如果 last_hit_at 距今 > 365 天 且 confidence < 0.3:
  → deprecate_atom(atom_id, "超过 365 天未命中且置信度低于 0.3")
```

---

## 新知识创建规则

### 触发条件

新知识原子在以下情况下创建：

1. **探索性推理验证成功（快速通道）**: `is_exploratory = true` 且修复成功 → 直接入库
2. **模式累积达标**: PatternBuffer.occurrence_count >= 3
3. **人工报告**: source_type = 'manual_report'（运营人员手动提交新模式）
4. **诊断失败分析**: 连续 3 次相似症状但知识库无匹配

### 快速通道：探索性推理 → 验证成功 → 直接入库

当 RepairFeedback 满足以下条件时，跳过累积缓冲区，直接创建知识原子：

```
条件:
  is_exploratory = true
  AND exploratory_hypothesis.auto_create_knowledge = true
  AND actions_effective 中至少 1 个 was_effective = true
  AND order_status_after != order_status_before（状态确实改善了）

创建参数:
  domain: exploratory_hypothesis.proposed_domain
  symptom_signals: exploratory_hypothesis.proposed_symptom_signals
  root_causes: [{
    cause: exploratory_hypothesis.proposed_root_cause,
    probability: 0.6            // 比普通累积创建的 0.5 稍高（已经过修复验证）
  }]
  actions: exploratory_hypothesis.proposed_actions（仅保留 was_effective=true 的）
  confidence: 0.6               // 经过一次验证，比初始 0.5 高
  source: {
    type: 'exploratory_verified',
    diagnosis_id: feedback.diagnosis_id,
    repair_id: feedback.repair_id
  }
```

如果探索性推理修复失败（`was_effective = false`）：
→ 不直接入库，放入 PatternBuffer 正常累积
→ threshold 降为 2（已经有一次失败的尝试作为数据点）

### 创建参数

```typescript
new_atom = {
  domain: 从症状信号推断,
  symptom_signals: 从累积缓冲区合并,
  root_causes: [{
    cause: 从反馈中提取,
    probability: 0.5           // 初始概率保守
  }],
  actions: 从成功的修复动作中提取,
  confidence: 0.5,             // 初始置信度保守
  source: {
    type: 'learning_agent',
    feedback_ids: 关联的反馈 ID 列表
  },
  version: 1,
  hit_count: 0
}
```

### 合并规则

如果新模式与已有知识原子相似度 >= 0.5：

```
合并策略:
  symptom_signals: 追加去重
  root_causes: 追加去重，新根因 probability = 0.3
  actions: 追加去重
  confidence: max(existing, 0.5)
  version: existing.version + 1
```

---

## 动作权重调整

### 有效动作强化

```
如果 action.was_effective = true:
  action.success_count += 1
  如果 success_count >= 5 且在知识原子中排序靠后:
    → 提升该动作的 priority（向前移动）
```

### 无效动作弱化

```
如果 action.was_effective = false:
  action.failure_count += 1
  如果 failure_count >= 3:
    → 从知识原子的 recommended_actions 中移除
    → 记录 LearningEvent
  如果 failure_count >= 2 且 success_count = 0:
    → 降低 priority（向后移动）
```

---

## 人工干预观察 → 知识创建规则

### 入库策略矩阵

| 追溯结果 | trace_confidence | 入库方式 | 初始 confidence |
|---------|-----------------|---------|----------------|
| 可追溯到具体操作 + 可映射 action_code | >= 0.6 | 直接入库 | 0.5 |
| 可追溯到具体操作 + 无法映射 action_code | >= 0.4 | 直接入库，action = MANUAL_DATA_FIX | 0.45 |
| 仅状态变化，无法追溯操作 | < 0.4 | PatternBuffer (threshold=2) | — |
| hotfix / 代码修复 | 任意 | 直接入库，标记需工程评估 | 0.4 |
| 第三方系统自行恢复 | 任意 | PatternBuffer (threshold=3) | — |

### 创建参数（人工干预来源）

```typescript
new_atom = {
  domain: 从 original_error 和状态变化推断,
  symptom_signals: [original_error, ...从 order_msg 追溯到的关键信息],
  root_causes: [{
    cause: 从 traced_actions 推断,
    probability: trace_confidence * 0.8   // 打折，因为是间接推断
  }],
  actions: mapped_action_codes,
  confidence: 见上表,
  source: {
    type: 'human_intervention_observed',
    order_no: event.order_no,
    intervention_type: event.intervention_type,
    recovery_time: event.recovery_time
  },
  version: 1,
  hit_count: 0,
  metadata: {
    learned_from_human: true,            // 标记来源是人工操作
    original_intervention: event         // 保留完整的追溯记录
  }
}
```

### 去重规则

```
扫描到的订单需要排除:
  1. 已有 repair_id 关联（处理 Agent 已处理，走通道 A）
  2. 已在 processed_interventions 集合中（避免重复学习）
  3. order_no 在最近 24 小时内已被通道 C 处理过

每次处理后将 order_no 加入 processed_interventions（TTL 7 天）
```

### hotfix / 代码修复的特殊处理

```
如果 intervention_type = 'hotfix_deployment':
  1. 入库 confidence = 0.4（代码修复可能是一次性的）
  2. actions = ['ESCALATE_TO_ENGINEERING']（标记需要工程评估）
  3. 附加 notes: 
     "此异常通过代码修复 ({git_commit.hash}) 解决。
      修复人: {git_commit.author}
      修复描述: {git_commit.message}
      建议工程团队评估是否需要系统级修复或是否会复发。"
  4. 如果同一个 commit 修复了多个异常订单:
     → 合并为一个知识原子，confidence += 0.05 per additional order
```

---

## 知识废弃规则

| 条件 | 动作 |
|------|------|
| 连续 5 次诊断错误 | 立即废弃 |
| 365 天未命中 + confidence < 0.3 | 自动废弃 |
| 人工标记 | 立即废弃 |
| 被新知识完全覆盖（相似度 > 0.95） | 废弃旧的，保留新的 |

废弃时必须记录原因，废弃后的知识原子仍保留在存储中（软删除），
可通过 `include_deprecated=true` 查询。

---

## 节流和安全

### 写入节流

```
同一个 atom_id:
  - 1 小时内最多更新 5 次
  - 超过限制 → 缓冲，下一个小时窗口批量更新

新知识创建:
  - 1 小时内最多创建 3 个新原子
  - 超过限制 → 排队等待
```

### 防抖动

```
如果同一个 atom 在 1 小时内:
  - 先收到正向反馈 (+0.05)
  - 又收到负向反馈 (-0.10)
  → 合并为净变化 (-0.05)，只执行一次更新
```

### 回滚能力

每次知识变更都记录 LearningEvent，包含 old_value 和 new_value。
如果发现批量错误更新，可以通过 LearningEvent 回滚：

```
回滚流程:
  1. 查询指定时间范围内的 LearningEvent
  2. 按时间倒序逐个回滚 changes
  3. 调用 upsert_atom 恢复 old_value
```
