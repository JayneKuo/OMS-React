# 需求文档：OMS 异常诊断 Agent

## 简介

异常诊断 Agent 是 OMS 异常处理集群的"大脑"。接收症状信号（order_no / error_message / 自然语言），通过知识匹配 + 数据库取证 + 探索性推理，输出结构化 DiagnosisResult，handoff 给修复 Agent。

## 术语表

- **DiagnosisResult**: 诊断结果，包含根因、置信度、建议动作、handoff 状态
- **Knowledge_Agent**: 知识结构化 Agent，提供 query_knowledge / get_atom / list_by_domain 只读接口
- **Reasoning_Pipeline**: 5 步推理管线（症状提取 → 知识匹配 → 数据库取证 → 探索性推理 → 结果组装）
- **Exploratory_Reasoning**: 探索性推理，知识匹配失败时激活的 LLM/规则推理
- **Handoff**: 诊断结果移交给修复 Agent 的条件判定

## 需求

### 需求 1：症状提取

**用户故事：** 作为调度层，我希望诊断 Agent 能从多种输入格式中提取结构化症状信号。

#### 验收标准

1. WHEN 输入仅包含 order_no 时，THE Diagnosis_Agent SHALL 查询 order_msg 获取最新 remark 作为 symptom_text
2. WHEN 输入包含 error_message 时，THE Diagnosis_Agent SHALL 直接使用其作为 symptom_text
3. THE Diagnosis_Agent SHALL 从 symptom_text 中提取实体（SKU、订单号、HTTP 状态码、仓库代码）
4. THE Diagnosis_Agent SHALL 根据关键词推断 domain_hint（如 "SKU not found" → ORDER_WMS_SYNC）
5. WHEN 输入为空或无法解析时，THE Diagnosis_Agent SHALL 返回 domain=UNKNOWN, confidence=0

### 需求 2：知识匹配

**用户故事：** 作为诊断引擎，我希望通过知识 Agent 匹配已知异常模式，快速定位根因。

#### 验收标准

1. THE Diagnosis_Agent SHALL 调用 Knowledge_Agent.queryKnowledge(symptom_text, domain_hint, top_k=5)
2. WHEN 首次查询无结果且有 domain_hint 时，THE Diagnosis_Agent SHALL 去掉 domain_hint 重试
3. WHEN 两次查询均无结果时，THE Diagnosis_Agent SHALL 用提取的实体关键词做第三次查询
4. WHEN 三次查询均无结果时，THE Diagnosis_Agent SHALL 标记 knowledge_match_failed=true
5. THE Diagnosis_Agent SHALL 保留 match_score >= 0.3 的结果

### 需求 3：数据库取证

**用户故事：** 作为诊断引擎，我希望查询 OMS 数据库获取订单上下文证据。

#### 验收标准

1. THE Diagnosis_Agent SHALL 使用预定义的 SQL 查询模式（Q1-Q9）查询数据库
2. THE Diagnosis_Agent SHALL 根据订单状态决定查询分支（Exception→Q2+Q3+Q4, Allocated→Q2+Q5, Shipped→Q2+Q6+Q7）
3. WHEN order_no 不存在时，THE Diagnosis_Agent SHALL 设置 order_context=null 并继续推理
4. THE Diagnosis_Agent SHALL 对单个查询设置 5 秒超时，总查询 10 秒超时
5. THE Diagnosis_Agent SHALL 禁止执行预定义模式之外的 SQL
6. THE Diagnosis_Agent SHALL 所有查询包含 deleted=0 过滤

### 需求 4：根因推理

**用户故事：** 作为诊断引擎，我希望综合知识匹配和数据库证据推理出根因。

#### 验收标准

1. WHEN 知识匹配成功且数据库证据充分时（场景A），THE Diagnosis_Agent SHALL 基于 match_score 加调整因子计算 confidence
2. WHEN 知识匹配成功但无数据库证据时（场景B），THE Diagnosis_Agent SHALL 将 confidence 打折为 match_score × 0.7
3. WHEN 知识匹配失败且有数据库证据时（场景C），THE Diagnosis_Agent SHALL 激活探索性推理
4. WHEN 知识匹配失败且无数据库证据时（场景D），THE Diagnosis_Agent SHALL 设置 confidence 上限为 0.3
5. THE Diagnosis_Agent SHALL 最多保留 3 个候选根因，按 confidence 降序排列
6. THE Diagnosis_Agent SHALL 设置 overall_confidence = max(root_causes[].confidence)

### 需求 5：探索性推理

**用户故事：** 作为诊断引擎，我希望在知识匹配失败时能自主推理，而非直接返回 UNKNOWN。

#### 验收标准

1. THE Diagnosis_Agent SHALL 仅在 knowledge_match_failed=true 时激活探索性推理
2. THE Diagnosis_Agent SHALL 优先使用 LLM Chain-of-Thought 推理，不可用时回退到规则
3. THE Diagnosis_Agent SHALL 对探索性推理结果设置置信度硬上限（LLM+证据=0.55, LLM+不完整=0.40, 规则+证据=0.60, 仅症状=0.30）
4. THE Diagnosis_Agent SHALL 在 DiagnosisResult 中标记 is_exploratory=true 并携带 ExploratoryHypothesis
5. THE Diagnosis_Agent SHALL 在规则 fallback 中实现至少 5 条硬编码规则

### 需求 6：结果组装与 Handoff

**用户故事：** 作为修复 Agent，我希望收到结构化的 DiagnosisResult，包含足够信息执行修复。

#### 验收标准

1. THE Diagnosis_Agent SHALL 生成唯一的 diagnosis_id（格式 DIAG-{timestamp}-{random4}）
2. THE Diagnosis_Agent SHALL 记录完整的 reasoning_trace（每步输入输出摘要和耗时）
3. THE Diagnosis_Agent SHALL 按优先级排序 recommended_actions（auto_executable 优先）
4. WHEN confidence >= 0.5 且有自动可执行动作且 order_context 非空时，THE Diagnosis_Agent SHALL 设置 handoff_ready=true
5. WHEN handoff_ready=false 时，THE Diagnosis_Agent SHALL 在 handoff_blocked_reason 中说明原因
6. THE Diagnosis_Agent SHALL 判定 severity（critical/high/medium/low）

### 需求 7：API 接口

**用户故事：** 作为调度层，我希望通过 HTTP API 调用诊断 Agent。

#### 验收标准

1. THE Diagnosis_Agent SHALL 暴露 POST /api/diagnosis/run 接口，接受 DiagnosisInput
2. THE Diagnosis_Agent SHALL 暴露 POST /api/diagnosis/batch 接口，按 merchant_no 批量诊断异常订单
3. THE Diagnosis_Agent SHALL 暴露 GET /api/diagnosis/results/[id] 接口，获取历史诊断结果
4. THE Diagnosis_Agent SHALL 对无效输入返回 400 错误
5. THE Diagnosis_Agent SHALL 总耗时不超过 30 秒
