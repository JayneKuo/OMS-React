# 知识原子 Schema 定义（KnowledgeAtom）

知识原子是整个 Agent 集群的通用语言，每条异常知识以原子为最小存储单元。

## 完整 Schema

```typescript
interface KnowledgeAtom {
  // === 标识 ===
  atom_id: string;                    // 唯一 ID，格式: "KA-{domain}-{seq}"，如 "KA-ORDER_DISPATCH-001"
  version: number;                    // 从 1 开始，每次更新 +1
  created_at: string;                 // ISO 8601
  updated_at: string;                 // ISO 8601
  source: AtomSource;                 // 知识来源

  // === 核心三要素 ===
  domain: string;                     // 业务域编码，见 references/business-domains.md
  symptom_signals: string[];          // 症状信号（英文，OMS 专业术语）
  likely_root_causes: RootCause[];    // 可能的根因（支持多个，带置信度）
  recommended_actions: string[];      // 建议动作编码，见 references/action-codes.md

  // === 语义上下文 ===
  context: AtomContext;

  // === 元数据 ===
  confidence: number;                 // [0.0, 1.0]，知识可信度
  hit_count: number;                  // 被查询命中次数
  last_hit_at: string | null;        // 最近一次命中时间
  tags: string[];                     // 自由标签

  // === 废弃标记 ===
  deprecated: boolean;
  deprecated_at?: string;
  deprecated_reason?: string;
}
```

## 子类型定义

```typescript
interface RootCause {
  description: string;                // 根因描述（中文）
  description_en: string;             // 根因描述（英文，OMS 术语）
  probability: number;                // [0.0, 1.0]，该根因的可能性
}

interface AtomContext {
  related_modules: string[];          // 关联模块
  related_processes: string[];        // 关联业务流程
  related_rules: string[];            // 关联业务规则
  state_transitions: string[];        // 相关状态转换路径
  entry_conditions: string[];         // 进入此异常的条件
  recovery_paths: string[];           // 恢复路径
}

type AtomSource =
  | { type: "knowledge_graph"; node_ids: string[] }    // 从 Neo4j 图谱提取
  | { type: "codebase"; file_paths: string[] }         // 从代码库提取
  | { type: "document"; doc_name: string }             // 从业务文档提取
  | { type: "runtime_learning"; incident_id: string }  // 从运行时异常学习
  | { type: "manual"; author: string };                // 人工录入
```

## Atom_ID 生成规则

- 格式: `KA-{domain}-{seq}`
- domain: 标准 Domain_Code（如 ORDER_DISPATCH）
- seq: 三位数字序号，同域内递增（001, 002, ...）
- 示例: `KA-ORDER_DISPATCH-001`, `KA-ORDER_CREATE-003`

## 校验规则

| 字段 | 规则 |
|------|------|
| `domain` | 必填，必须在 24 个标准 Domain_Code 中 |
| `symptom_signals` | 必填，不能为空数组，使用英文 OMS 术语 |
| `recommended_actions` | 每个编码必须在 17 个标准 Action_Code 中 |
| `confidence` | [0.0, 1.0] 闭区间 |
| `likely_root_causes[].probability` | [0.0, 1.0] 闭区间 |
| `atom_id` | 全局唯一 |

## JSON 存储文件格式

```json
{
  "version": 1,
  "updated_at": "2025-01-15T10:00:00Z",
  "atoms": [ ... ],
  "metadata": {
    "total_count": 11,
    "domain_counts": {
      "ORDER_DISPATCH": 2,
      "ORDER_CREATE": 1
    }
  }
}
```

## 参考数据常量

```typescript
// 24 个标准业务域 → 详见 references/business-domains.md
const VALID_DOMAINS: string[] = [
  "ORDER_CREATE", "ORDER_DISPATCH", "ORDER_UPDATE", "ORDER_CANCEL",
  "ORDER_HOLD", "ORDER_WMS_SYNC", "ORDER_FULFILLMENT", "ORDER_DELIVERY",
  "ORDER_RETURN", "ORDER_EXCHANGE", "ORDER_MERGE", "ORDER_PO",
  "ORDER_WORK_ORDER", "SHIPMENT", "INVENTORY_SYNC", "INVENTORY_ALLOCATION",
  "ITEM_SYNC", "ITEM_PUBLISH", "CHANNEL_INTEGRATION", "NOTIFICATION",
  "RATE_SHOPPING", "CUSTOMS", "SYSTEM", "UNKNOWN"
];

// 17 个标准动作编码 → 详见 references/action-codes.md
const VALID_ACTION_CODES: string[] = [
  "RETRY_WITH_BACKOFF", "RETRY_IMMEDIATE", "MAP_ITEM_ID",
  "SYNC_ITEM_MASTER", "RESYNC_ORDER", "RESYNC_INVENTORY",
  "RECALCULATE_INVENTORY", "REFRESH_CHANNEL_TOKEN",
  "REPUBLISH_TO_CHANNEL", "NOTIFY_MERCHANT", "CANCEL_AND_RECREATE",
  "ESCALATE_TO_ENGINEERING", "ESCALATE_TO_OPS", "MANUAL_DATA_FIX",
  "CONTACT_CHANNEL_SUPPORT", "REVIEW_BUSINESS_RULE",
  "CHECK_THIRD_PARTY_STATUS"
];
```
