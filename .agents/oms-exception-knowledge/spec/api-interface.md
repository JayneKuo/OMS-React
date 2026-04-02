# API 接口规范

知识 Agent 对外暴露 5 个标准接口，严格遵守职责边界。

## 读接口（供诊断 Agent 调用）

### `query_knowledge` — 语义查询

根据症状信号查询匹配的知识原子。支持语义匹配，不要求精确命中。

```
路由: POST /api/knowledge/query

入参:
  symptom_text: string          // 症状描述（自然语言或系统错误信息）
  domain_hint?: string          // 可选的域提示，缩小搜索范围
  top_k?: number                // 返回前 K 条，默认 5

出参:
  atoms: KnowledgeAtom[]        // 按相关度排序的知识原子
  match_scores: number[]        // 每条的匹配分数
```

查询逻辑：
1. 如果提供了 `domain_hint`，优先在该域内搜索
2. 对 `symptom_text` 做语义匹配（关键词 Jaccard × 0.6 + TF-IDF 余弦 × 0.4）
3. 按 `confidence × match_score` 综合排序
4. 命中后自动更新 `hit_count` 和 `last_hit_at`
5. 排除 deprecated 原子
6. 未匹配到任何原子时返回空列表（非错误）

### `get_atom` — 精确获取

按 ID 精确获取单条知识原子。不更新 hit_count。

```
路由: GET /api/knowledge/atoms/:id

入参:
  atom_id: string               // URL 路径参数

出参:
  atom: KnowledgeAtom | null    // 不存在返回 404
```

### `list_by_domain` — 按域列举

列出某个域下的所有知识原子。

```
路由: GET /api/knowledge/domains/:domain

入参:
  domain: string                // URL 路径参数
  include_low_confidence?: boolean  // 查询参数，默认 false

出参:
  atoms: KnowledgeAtom[]
```

过滤规则：
- 默认过滤 `confidence < 0.3` 的原子
- 默认过滤 `deprecated === true` 的原子
- `include_low_confidence=true` 时包含低置信度原子（仍排除 deprecated）
- 无效 Domain_Code 返回空列表

---

## 写接口（供学习 Agent 调用）

### `upsert_atom` — 写入/合并

写入新的知识原子或合并到已有原子。

```
路由: POST /api/knowledge/upsert

入参:
  atom: Partial<KnowledgeAtom>  // 必须包含 domain + symptom_signals
  source: AtomSource            // 知识来源

出参:
  atom_id: string
  is_new: boolean               // true = 新建, false = 合并
  version: number
```

写入规则：
1. 写入前执行全部 Schema 校验（见 knowledge-atom-schema.md）
2. 如果 `symptom_signals` 与已有原子的语义相似度 > 0.85，视为合并
3. 合并时：root_causes 和 actions 追加去重，confidence 取较高值，version +1
4. 新建时：自动生成 Atom_ID，version=1，hit_count=0，last_hit_at=null
5. 校验失败返回 400

### `deprecate_atom` — 废弃标记

标记一条知识原子为过时（软删除，保留历史）。

```
路由: POST /api/knowledge/atoms/:id/deprecate

入参:
  atom_id: string               // URL 路径参数
  reason: string                // 请求体

出参:
  success: boolean              // atom_id 不存在时返回 false
```

---

## 错误响应格式

```typescript
interface ErrorResponse {
  error: string;        // 错误码
  message: string;      // 人类可读的中文描述
  details?: unknown;    // 可选的详细信息
}
```

| 场景 | HTTP 状态码 | error 码 |
|------|------------|----------|
| 缺少必填字段 | 400 | `VALIDATION_ERROR` |
| domain 不在标准列表 | 400 | `INVALID_DOMAIN` |
| action_code 不在标准列表 | 400 | `INVALID_ACTION_CODE` |
| confidence/probability 超出范围 | 400 | `OUT_OF_RANGE` |
| atom_id 不存在 | 404 | `NOT_FOUND` |
| 服务器内部错误 | 500 | `INTERNAL_ERROR` |

---

## 职责边界

- 仅暴露以上 5 个接口，不提供其他操作
- query_knowledge 只返回匹配数据，不附加诊断推理
- 不主动调用其他 Agent
- 不主动从运行时事件中提取新知识
- 面向人类的描述字段使用中文，面向机器的字段使用英文 OMS 术语
