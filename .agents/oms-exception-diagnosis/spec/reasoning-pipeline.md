# 推理管线 (Reasoning Pipeline)

## 管线总览

```
输入信号
  │
  ▼
┌─────────────────────┐
│ Step 1: 症状提取     │  从原始输入中提取结构化症状
│ Symptom Extraction   │
└─────────┬───────────┘
          │ { order_no?, symptom_text, extracted_entities }
          ▼
┌─────────────────────┐
│ Step 2: 知识匹配     │  调用知识 Agent query_knowledge
│ Knowledge Matching   │
└─────────┬───────────┘
          │ { matched_atoms[], match_scores[] }
          ▼
┌─────────────────────┐
│ Step 3: 数据库取证   │  查询 OMS MySQL 获取订单上下文
│ DB Evidence          │
└─────────┬───────────┘
          │ { order_context }
          ▼
┌─────────────────────────────┐
│ Step 3.5: 探索性推理         │  ← 仅在知识匹配失败时激活
│ Exploratory Reasoning        │  利用 LLM + 领域模型自主推理
└─────────┬───────────────────┘
          │ { exploratory_hypotheses[] }
          ▼
┌─────────────────────┐
│ Step 4: 根因推理     │  综合知识 + 证据 + 探索性假设 → 根因判定
│ Root Cause Reasoning │
└─────────┬───────────┘
          │ { root_causes[], confidence }
          ▼
┌─────────────────────┐
│ Step 5: 结果组装     │  组装 DiagnosisResult
│ Result Assembly      │
└─────────────────────┘
          │
          ▼
    DiagnosisResult
```

---

## Step 1: 症状提取 (Symptom Extraction)

### 输入类型处理

| 输入类型 | 处理方式 |
|---------|---------|
| `order_no` 单独提供 | 查 `order_msg` 获取最新 remark → 作为 symptom_text |
| `error_message` 提供 | 直接作为 symptom_text |
| 自然语言描述 | NLP 提取关键词和实体 |
| 组合输入 | 合并所有信号，order_no 优先用于数据库查询 |

### 实体提取规则

从 symptom_text 中提取以下实体：

| 实体类型 | 识别模式 | 示例 |
|---------|---------|------|
| SKU | `/SKU\s*[\d\w-]+/i` 或 `/\b\d{5,10}\b/` | "SKU 1823810", "1823810" |
| 订单号 | `/SO\d{8}/` | "SO00522427" |
| HTTP 状态码 | `/HTTP\s*\d{3}/` 或 `/\b[45]\d{2}\b/` | "HTTP 401", "500" |
| 仓库代码 | `/accounting_code\s*=\s*\w+/` | "accounting_code = WH001" |
| 承运商 | 已知承运商名称列表匹配 | "UPS", "FedEx" |

### Domain Hint 推断

根据 symptom_text 关键词推断 domain_hint：

| 关键词模式 | 推断 Domain |
|-----------|------------|
| "SKU not found", "item master", "product not found" | `ORDER_WMS_SYNC` 或 `ORDER_CREATE` |
| "dispatch fail", "no matching warehouse", "routing" | `ORDER_DISPATCH` |
| "out of stock", "inventory" | `INVENTORY_ALLOCATION` |
| "tracking", "shipment", "label" | `ORDER_FULFILLMENT` 或 `SHIPMENT` |
| "webhook", "HTTP", "token", "401" | `CHANNEL_INTEGRATION` |
| "rate shopping", "carrier", "quote" | `RATE_SHOPPING` |
| "PO", "purchase order", "warehouse fail" | `ORDER_PO` |
| "delivery failed", "consignee" | `ORDER_DELIVERY` |
| "hold", "on hold" | `ORDER_HOLD` |

---

## Step 2: 知识匹配 (Knowledge Matching)

### 调用策略

```
1. 首次调用: query_knowledge(symptom_text, domain_hint, top_k=5)
2. 如果首次无结果且有 domain_hint:
   → 去掉 domain_hint 重试: query_knowledge(symptom_text, null, top_k=5)
3. 如果仍无结果:
   → 用提取的实体关键词重试: query_knowledge(entity_keywords, null, top_k=3)
4. 如果三次都无结果:
   → 标记 knowledge_match_failed = true，进入 Step 3
```

### 匹配结果处理

- 保留 match_score >= 0.3 的结果
- 按 match_score 降序排列
- 记录匹配的知识原子 ID 和 score，供 Step 4 使用

---

## Step 3: REST API 取证 (API Evidence Collection)

> **安全原则**: Agent 不直连数据库。所有取证通过 OMS REST API 完成，经过业务层权限校验。
> API 参考: [oms-api-reference.md](../../oms-exception-knowledge/references/oms-api-reference.md)

### 前置条件

- 必须有 `order_no` 或 `channel_sales_order_no`
- 如果都没有，跳过此步骤，仅依赖知识匹配
- 必须持有有效的 Bearer Token（通过 `POST /api/linker-oms/opc/iam/token` 获取）

### API 调用序列

```
A1: 订单详情 GET /sale-order/{orderNo}
  │  → 获取 status, merchantNo, channelName, accountingCode
  │
  ├─ status = EXCEPTION → A2 + A3
  ├─ status = ALLOCATED → A2 (检查分派状态)
  └─ 其他状态 → A2
  │
A2: 分派检查 GET /dispatch/hand/check/{orderNo}
  │  → 判断是否可手动分派
  │
A3: 商品验证 GET /item/product?sku={sku}
  │  → 逐个检查订单中的 SKU 是否存在于 Item Master
```

### 与原 SQL 查询的对应关系

| 原 SQL 查询 | 替代 API | 说明 |
|-------------|---------|------|
| Q1: sales_order | `GET /sale-order/{orderNo}` | 订单基本信息 |
| Q2: order_dispatch | `GET /dispatch/hand/check/{orderNo}` | 分派状态 |
| Q4: sales_order_item | `GET /dispatch/hand/item/{orderNo}` | 可分派商品列表 |
| Q3: order_msg | 暂无对应 API，从订单详情的 remark 字段获取 | 异常消息 |
| Q8: 批量异常订单 | 暂无批量查询 API，逐单调用 A1 | 批量模式 |

### 超时处理

- 单个 API 调用超时 10 秒
- 总取证超时 20 秒
- 超时的调用标记为 `evidence_incomplete = true`

### Token 管理

- Token 有效期 86400 秒（24 小时）
- 在内存中缓存 Token，过期前 5 分钟自动刷新
- Token 获取失败时，跳过 API 取证，仅依赖知识匹配（降级为场景 B/D）

---

## Step 3.5: 探索性推理 (Exploratory Reasoning)

> 仅在 `knowledge_match_failed = true`（Step 2 三次查询均无结果）时激活。
> 如果 Step 2 有匹配结果，跳过此步骤。

### 激活条件

```
knowledge_match_failed = true
AND (order_context != null OR symptom_text 长度 > 20 字符)
```

### 推理方法

#### 方法 A: LLM Chain-of-Thought（首选）

利用 LLM 的推理能力，结合 OMS 领域模型知识进行推理：

```
Prompt 结构:
  你是 OMS 异常诊断专家。以下是一个未知异常的信息：

  【症状】{symptom_text}
  【订单状态】{order_context.status} ({status_label})
  【异常消息】{recent_messages[0].remark}
  【拆单状态】{dispatches 摘要}
  【商品信息】{items 摘要}

  OMS 领域知识：
  - 订单状态机: New(0) → Pending(9) → Allocated(1) → Processing(2) → Shipped(3) → Delivered(7)
  - 异常状态: Exception(10), OnHold(8), Cancelled(5)
  - 推单流程: Allocated → send_kafka → WMS 接收 → Processing
  - 发货流程: WMS 拣货 → 打包 → 生成面单 → 发货回调 → Shipped

  请分析：
  1. 订单当前卡在哪个环节？
  2. 正常流程下一步应该是什么？
  3. 最可能的根因是什么？
  4. 建议的修复动作是什么？

  输出格式: { domain, root_cause, symptom_signals, recommended_actions }
```

#### 方法 B: 规则 Fallback（LLM 不可用时）

使用 Step 4 场景 C 中的硬编码规则。

### 输出

```typescript
output = {
  exploratory_hypotheses: ExploratoryHypothesis[],  // 最多 2 个假设
  reasoning_method: 'llm_chain_of_thought' | 'rule_based_fallback',
  activated: true
}
```

### 置信度限制

探索性推理的结果置信度有硬上限：

| 条件 | 置信度上限 |
|------|-----------|
| LLM 推理 + 数据库证据充分 | 0.55 |
| LLM 推理 + 数据库证据不完整 | 0.40 |
| 规则 Fallback + 数据库证据充分 | 0.60（规则是确定性的，可以稍高） |
| 仅症状文本，无数据库证据 | 0.30 |

### 与学习 Agent 的闭环

探索性推理的结果会在 DiagnosisResult 中标记 `is_exploratory = true`，
并携带完整的 `ExploratoryHypothesis`。

当处理 Agent 执行修复后：
- 修复成功 → 学习 Agent 直接将假设转化为新知识原子入库（快速通道）
- 修复失败 → 学习 Agent 将假设放入 PatternBuffer 累积观察

这样，每一次成功的探索性诊断都会让知识库变得更完善，
下次遇到相同异常时就能走 Step 2 的知识匹配路径，不再需要探索性推理。

---

## Step 4: 根因推理 (Root Cause Reasoning)

### 推理矩阵

综合知识匹配和数据库证据，按以下规则推理：

#### 场景 A: 知识匹配成功 + 数据库证据充分

```
base_confidence = knowledge_match_score

调整因子:
  + 0.10  订单状态与知识原子 entry_conditions 一致
  + 0.15  remark 关键词与 symptom_signals 精确匹配
  + 0.05  domain 与 domain_hint 一致
  - 0.20  数据库证据与知识原子矛盾
  - 0.10  订单状态与预期不符

final_confidence = clamp(base_confidence + 调整因子之和, 0, 1)
```

#### 场景 B: 知识匹配成功 + 无数据库证据

```
final_confidence = knowledge_match_score * 0.7
// 缺少数据库佐证，置信度打折
```

#### 场景 C: 知识匹配失败 + 数据库证据充分 → 激活探索性推理

```
// Step 3.5 探索性推理被激活
// 诊断 Agent 利用 LLM + OMS 领域模型，基于数据库证据自主推理

推理输入:
  - symptom_text（Step 1 提取的症状）
  - order_context（Step 3 的数据库证据）
  - OMS 领域模型知识（订单状态机、推单流程、WMS 交互协议等）

推理过程 (Chain-of-Thought):
  1. 分析订单当前状态在状态机中的位置
  2. 推断"正常流程下一步应该是什么"
  3. 对比"实际发生了什么"（从 remark / 状态 / 时间线推断）
  4. 形成假设：哪个环节出了问题、为什么
  5. 基于假设推断可能的修复动作

输出: ExploratoryHypothesis
  is_exploratory = true
  confidence = 0.35 ~ 0.55（探索性推理的置信度上限为 0.55）

同时保留硬编码规则作为 fallback:
  规则 1: status=10 且 remark 包含 "not found" → ORDER_WMS_SYNC, confidence=0.6
  规则 2: status=10 且 remark 包含 "out of stock" → INVENTORY_ALLOCATION, confidence=0.6
  规则 3: status=1 且 send_kafka=0 → ORDER_DISPATCH (推单未发送), confidence=0.7
  规则 4: status=1 且 send_kafka=1 且无 shipment → ORDER_WMS_SYNC (WMS 未响应), confidence=0.5
  规则 5: status=3 且无 tracking_number → ORDER_FULFILLMENT (WMS 未回传), confidence=0.5

最终取 max(探索性推理 confidence, 规则 confidence)
如果探索性推理和规则结论一致 → confidence += 0.1（互相佐证）
```

#### 场景 D: 知识匹配失败 + 无数据库证据 → 有限探索性推理

```
// 仅依赖症状文本做探索性推理，没有数据库证据佐证
推理输入: symptom_text only
confidence 上限 = 0.3（无证据佐证，极度保守）
is_exploratory = true

如果连 symptom_text 都很模糊:
  domain = UNKNOWN
  confidence = 0.15
  is_exploratory = false（没有足够信息做探索性推理）
```

### 多根因排序

当多个候选根因存在时：
1. 按 confidence 降序排列
2. 如果 top 2 的 confidence 差距 < 0.15，都保留
3. 最多保留 3 个候选根因
4. overall_confidence = max(root_causes[].confidence)

---

## Step 5: 结果组装 (Result Assembly)

### 组装规则

1. 生成 `diagnosis_id`: `DIAG-{yyyyMMddHHmmss}-{random4}`
2. 计算 `duration_ms`: 从 Step 1 开始到 Step 5 结束的总耗时
3. 填充 `order_context`: 从 Step 3 的数据库查询结果组装
4. 填充 `root_causes`: 从 Step 4 的推理结果
5. 填充 `recommended_actions`: 从匹配的知识原子的 actions 字段提取，按优先级排序
6. 判定 `severity`: 根据订单状态和影响范围
7. 判定 `handoff_ready`: 检查三个条件（confidence >= 0.5, 有自动可执行动作, order_context 非空）
8. 记录 `reasoning_trace`: 每个 Step 的输入输出摘要和耗时

### 动作优先级排序

```
优先级规则:
1. auto_executable = true 的动作优先
2. 同为自动动作时，按知识原子中的顺序
3. 同为人工动作时，ESCALATE_TO_OPS > MANUAL_DATA_FIX > REVIEW_BUSINESS_RULE
4. 去重：相同 action_code 只保留一个
```

---

## 异常处理

| 异常场景 | 处理方式 |
|---------|---------|
| 知识 Agent 不可用 | 跳过 Step 2，仅依赖 API 取证（场景 C/D） |
| OMS API 不可用 | 跳过 Step 3，仅依赖知识匹配（场景 B/D） |
| API Token 获取失败 | 跳过 Step 3，降级为场景 B/D |
| 订单号不存在 | API 返回空，order_context = null，仅依赖知识匹配 |
| 所有步骤都失败 | 返回 UNKNOWN，confidence = 0，handoff_ready = false |
| 超时 (>30s) | 返回已完成步骤的部分结果，标记 `partial = true` |
