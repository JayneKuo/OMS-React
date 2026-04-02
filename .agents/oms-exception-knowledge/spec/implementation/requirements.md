# 需求文档：OMS 异常知识结构化 Agent（记忆体）

## 简介

本系统是 OMS（订单管理系统）异常处理 Agent 集群的核心记忆体，负责异常知识的结构化存储、语义检索和一致性维护。记忆体作为纯粹的知识存储层，不执行诊断、修复、学习或分派操作，仅为集群中的诊断 Agent（只读）和学习 Agent（写入）提供标准化的知识访问接口。

每条异常知识以"知识原子（KnowledgeAtom）"为单位存储，包含业务域、症状信号、根因、建议动作、语义上下文和元数据等结构化字段。系统在原型阶段使用本地 JSON 文件存储，生产阶段迁移至 PostgreSQL + pgvector。

## 术语表

- **Knowledge_Store**：异常知识结构化存储系统，即本系统（记忆体）
- **KnowledgeAtom**：知识原子，异常知识的最小存储单元，包含 domain、symptom_signals、likely_root_causes、recommended_actions、context、confidence 等字段
- **Diagnosis_Agent**：诊断 Agent，通过只读接口查询知识原子以辅助异常诊断
- **Learning_Agent**：学习 Agent，通过写入接口向记忆体追加或更新知识原子
- **Domain_Code**：业务域编码，24 个标准域之一（如 ORDER_CREATE、ORDER_DISPATCH 等），定义于 references/business-domains.md
- **Action_Code**：标准动作编码，17 个建议动作之一（如 RETRY_WITH_BACKOFF、MAP_ITEM_ID 等），定义于 references/action-codes.md
- **Atom_ID**：知识原子唯一标识符，格式为 "KA-{domain}-{seq}"
- **Semantic_Similarity**：语义相似度，用于判断两条知识原子的症状信号是否描述同一异常模式，阈值 0.85
- **Seed_Knowledge**：种子知识，从 Neo4j 知识图谱、Java 代码库和业务文档中提取的初始异常模式
- **Confidence**：知识可信度，取值范围 0.0~1.0，反映该知识原子的可靠程度
- **Hit_Count**：命中计数，记录知识原子被查询匹配的累计次数
- **Atom_Source**：知识来源标记，包括 knowledge_graph、codebase、document、runtime_learning、manual 五种类型

## 需求

### 需求 1：知识原子 Schema 校验

**用户故事：** 作为学习 Agent，我希望写入的知识原子必须通过严格的 Schema 校验，以确保记忆体中的数据结构一致且可靠。

#### 验收标准

1. THE Knowledge_Store SHALL 拒绝不包含 domain 字段的 KnowledgeAtom 写入请求，并返回明确的校验错误信息
2. THE Knowledge_Store SHALL 拒绝不包含 symptom_signals 字段的 KnowledgeAtom 写入请求，并返回明确的校验错误信息
3. THE Knowledge_Store SHALL 拒绝 symptom_signals 为空数组的 KnowledgeAtom 写入请求
4. WHEN 写入的 KnowledgeAtom 包含 domain 字段时，THE Knowledge_Store SHALL 校验该 domain 值存在于 24 个标准 Domain_Code 中
5. WHEN 写入的 KnowledgeAtom 包含 recommended_actions 字段时，THE Knowledge_Store SHALL 校验每个动作编码存在于 17 个标准 Action_Code 中
6. WHEN 写入的 KnowledgeAtom 包含 confidence 字段时，THE Knowledge_Store SHALL 校验其值在 0.0 到 1.0 的闭区间内
7. WHEN 写入的 KnowledgeAtom 包含 likely_root_causes 字段时，THE Knowledge_Store SHALL 校验每个 RootCause 的 probability 值在 0.0 到 1.0 的闭区间内
8. THE Knowledge_Store SHALL 为每条新建的 KnowledgeAtom 自动生成符合 "KA-{domain}-{seq}" 格式的 Atom_ID
9. THE Knowledge_Store SHALL 为每条新建的 KnowledgeAtom 自动设置 version 为 1、hit_count 为 0、last_hit_at 为 null


### 需求 2：种子知识初始化

**用户故事：** 作为诊断 Agent，我希望记忆体在启动时已包含从知识图谱提取的种子知识，以便在系统上线初期即可提供异常诊断支持。

#### 验收标准

1. WHEN Knowledge_Store 首次初始化时，THE Knowledge_Store SHALL 从 known-exceptions.md 中加载全部 11 个已知异常模式并转换为 KnowledgeAtom 格式
2. THE Knowledge_Store SHALL 为每条种子知识的 Atom_Source 标记为 knowledge_graph 类型
3. THE Knowledge_Store SHALL 为种子知识设置初始 Confidence 值为 0.8
4. WHEN 种子知识加载完成后，THE Knowledge_Store SHALL 覆盖以下 Domain_Code 的知识原子：ORDER_CREATE、ORDER_DISPATCH、ORDER_WMS_SYNC、ORDER_FULFILLMENT、ORDER_PO、ORDER_WORK_ORDER、ORDER_DELIVERY、CHANNEL_INTEGRATION、NOTIFICATION、RATE_SHOPPING、ORDER_HOLD
5. IF 种子知识文件不存在或格式错误，THEN THE Knowledge_Store SHALL 记录错误日志并以空知识库状态启动

### 需求 3：知识查询接口（query_knowledge）

**用户故事：** 作为诊断 Agent，我希望通过症状描述语义匹配知识原子，以便快速定位可能的异常根因和建议动作。

#### 验收标准

1. WHEN Diagnosis_Agent 提供 symptom_text 调用 query_knowledge 时，THE Knowledge_Store SHALL 返回按相关度排序的 KnowledgeAtom 列表及对应的匹配分数
2. WHEN Diagnosis_Agent 同时提供 domain_hint 参数时，THE Knowledge_Store SHALL 优先在该 Domain_Code 范围内搜索匹配结果
3. THE Knowledge_Store SHALL 支持 top_k 参数控制返回结果数量，默认值为 5
4. WHEN 查询成功命中知识原子时，THE Knowledge_Store SHALL 自动将被命中原子的 Hit_Count 加 1 并更新 last_hit_at 为当前时间
5. THE Knowledge_Store SHALL 按 Confidence 与匹配分数的乘积进行综合排序
6. WHEN 查询未匹配到任何知识原子时，THE Knowledge_Store SHALL 返回空列表而非错误

### 需求 4：精确获取接口（get_atom）

**用户故事：** 作为诊断 Agent，我希望通过 Atom_ID 精确获取单条知识原子的完整信息。

#### 验收标准

1. WHEN Diagnosis_Agent 提供有效的 Atom_ID 调用 get_atom 时，THE Knowledge_Store SHALL 返回该 KnowledgeAtom 的完整数据
2. WHEN 提供的 Atom_ID 不存在时，THE Knowledge_Store SHALL 返回 null
3. THE Knowledge_Store SHALL 在 get_atom 调用时不更新 Hit_Count 和 last_hit_at（仅 query_knowledge 触发统计更新）

### 需求 5：按域列举接口（list_by_domain）

**用户故事：** 作为诊断 Agent，我希望列出某个业务域下的所有知识原子，以便全面了解该域的异常模式。

#### 验收标准

1. WHEN Diagnosis_Agent 提供有效的 Domain_Code 调用 list_by_domain 时，THE Knowledge_Store SHALL 返回该域下所有 KnowledgeAtom
2. THE Knowledge_Store SHALL 默认过滤 Confidence 低于 0.3 的知识原子
3. WHEN include_low_confidence 参数为 true 时，THE Knowledge_Store SHALL 返回该域下所有知识原子（包括 Confidence 低于 0.3 的）
4. WHEN 提供的 Domain_Code 不存在于标准域列表中时，THE Knowledge_Store SHALL 返回空列表
5. THE Knowledge_Store SHALL 默认过滤已标记为 deprecated 的知识原子

### 需求 6：知识写入与合并接口（upsert_atom）

**用户故事：** 作为学习 Agent，我希望写入新的异常知识或更新已有知识，并在语义相似时自动合并，以避免知识重复。

#### 验收标准

1. WHEN Learning_Agent 调用 upsert_atom 写入新知识时，THE Knowledge_Store SHALL 返回新生成的 Atom_ID、is_new 为 true 以及 version 为 1
2. WHEN 写入的 symptom_signals 与已有 KnowledgeAtom 的 Semantic_Similarity 超过 0.85 时，THE Knowledge_Store SHALL 将新知识合并到已有原子中而非创建新原子
3. WHEN 执行合并操作时，THE Knowledge_Store SHALL 将新的 likely_root_causes 追加到已有原子的根因列表中（去重）
4. WHEN 执行合并操作时，THE Knowledge_Store SHALL 将新的 recommended_actions 追加到已有原子的动作列表中（去重）
5. WHEN 执行合并操作时，THE Knowledge_Store SHALL 取新旧两条知识的 Confidence 较高值作为合并后的 Confidence
6. WHEN 执行合并操作时，THE Knowledge_Store SHALL 将 version 自动加 1 并更新 updated_at 时间戳
7. WHEN 执行合并操作时，THE Knowledge_Store SHALL 返回已有原子的 Atom_ID、is_new 为 false 以及更新后的 version
8. THE Knowledge_Store SHALL 在写入前执行需求 1 中定义的全部 Schema 校验规则

### 需求 7：知识废弃接口（deprecate_atom）

**用户故事：** 作为学习 Agent，我希望将过时的知识原子标记为废弃而非物理删除，以保留历史记录。

#### 验收标准

1. WHEN Learning_Agent 提供有效的 Atom_ID 和 reason 调用 deprecate_atom 时，THE Knowledge_Store SHALL 将该 KnowledgeAtom 标记为 deprecated 状态并记录废弃原因
2. WHEN 提供的 Atom_ID 不存在时，THE Knowledge_Store SHALL 返回 success 为 false
3. THE Knowledge_Store SHALL 保留已废弃的 KnowledgeAtom 的全部历史数据，不执行物理删除
4. WHEN KnowledgeAtom 被标记为 deprecated 后，THE Knowledge_Store SHALL 在 query_knowledge 和 list_by_domain 的默认查询结果中排除该原子

### 需求 8：知识存储持久化

**用户故事：** 作为系统运维人员，我希望知识原子在原型阶段以本地 JSON 文件持久化存储，以便快速验证和调试。

#### 验收标准

1. THE Knowledge_Store SHALL 将所有 KnowledgeAtom 持久化存储为本地 JSON 文件
2. WHEN 任何写入操作（upsert_atom 或 deprecate_atom）完成后，THE Knowledge_Store SHALL 立即将变更同步到 JSON 文件
3. WHEN Knowledge_Store 启动时，THE Knowledge_Store SHALL 从 JSON 文件加载已有的知识原子到内存
4. THE Knowledge_Store SHALL 确保 JSON 文件格式可被人类直接阅读和编辑
5. IF JSON 文件损坏或解析失败，THEN THE Knowledge_Store SHALL 记录错误日志并尝试从备份恢复，若无备份则以空知识库状态启动

### 需求 9：知识结构一致性维护

**用户故事：** 作为诊断 Agent，我希望记忆体中的知识始终保持结构一致，以确保查询结果的可靠性。

#### 验收标准

1. THE Knowledge_Store SHALL 确保所有存储的 KnowledgeAtom 的 domain 字段值存在于当前标准 Domain_Code 列表中
2. THE Knowledge_Store SHALL 确保所有存储的 KnowledgeAtom 的 recommended_actions 字段值存在于当前标准 Action_Code 列表中
3. THE Knowledge_Store SHALL 确保每个 Atom_ID 在整个知识库中唯一
4. THE Knowledge_Store SHALL 确保 symptom_signals 中的术语使用英文 OMS 专业术语（如 "Item ID Not Mapped" 而非 "Can't find product"）
5. WHEN KnowledgeAtom 的 context 字段中包含 related_modules 时，THE Knowledge_Store SHALL 校验模块名称的格式一致性

### 需求 10：职责边界约束

**用户故事：** 作为 Agent 集群架构师，我希望记忆体严格遵守职责边界，仅执行存储和检索操作，不越界执行诊断、修复、学习或分派。

#### 验收标准

1. THE Knowledge_Store SHALL 仅暴露 query_knowledge、get_atom、list_by_domain、upsert_atom 和 deprecate_atom 五个接口
2. THE Knowledge_Store SHALL 在 query_knowledge 返回结果时仅提供匹配的知识原子数据，不附加任何诊断推理或建议
3. THE Knowledge_Store SHALL 不主动调用 Diagnosis_Agent、Learning_Agent 或任何其他外部 Agent
4. THE Knowledge_Store SHALL 不主动从运行时事件中提取或生成新的知识原子
5. THE Knowledge_Store SHALL 对所有面向人类的描述字段使用中文输出，对面向机器的字段使用英文 OMS 专业术语