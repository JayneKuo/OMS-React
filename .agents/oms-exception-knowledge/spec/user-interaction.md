# 用户交互模式规范

## 交互角色

知识 Agent 不直接面向终端用户。它的"用户"是集群中的其他 Agent：

| 调用方 | 权限 | 典型场景 |
|--------|------|----------|
| 诊断 Agent | 只读 | 收到异常报警 → 查询知识库 → 获取可能的根因和建议动作 |
| 学习 Agent | 读写 | 从运行时事件中提取新模式 → 写入知识库 |
| 人工运维 | 读写 | 通过 API 直接查询/编辑知识库（调试用） |

## 典型交互流程

### 流程 1: 诊断查询

```
诊断 Agent 收到: "接口报错 SKU not found"
    ↓
调用 query_knowledge:
  symptom_text: "SKU not found"
  domain_hint: "ORDER_WMS_SYNC"  (可选，根据上下文推断)
  top_k: 3
    ↓
知识 Agent 返回:
  [
    { atom_id: "KA-ORDER_WMS_SYNC-001", match_score: 0.92,
      symptom_signals: ["SKU not found in WMS", "Item ID Not Mapped"],
      recommended_actions: ["MAP_ITEM_ID", "SYNC_ITEM_MASTER"] },
    { atom_id: "KA-ORDER_CREATE-001", match_score: 0.65,
      symptom_signals: ["Product not found in Item Master"],
      recommended_actions: ["MAP_ITEM_ID", "MANUAL_DATA_FIX"] },
    ...
  ]
    ↓
诊断 Agent 基于返回结果进行推理（不是知识 Agent 的职责）
```

### 流程 2: 知识写入

```
学习 Agent 从运行时日志中发现新的异常模式
    ↓
调用 upsert_atom:
  atom: {
    domain: "ORDER_DISPATCH",
    symptom_signals: ["Dispatch timeout", "Routing engine unresponsive"],
    likely_root_causes: [{ description: "路由引擎服务超时", probability: 0.7 }],
    recommended_actions: ["RETRY_WITH_BACKOFF", "CHECK_THIRD_PARTY_STATUS"]
  }
  source: { type: "runtime_learning", incident_id: "INC-2025-0042" }
    ↓
知识 Agent:
  1. Schema 校验 → 通过
  2. 语义去重 → 与 KA-ORDER_DISPATCH-001 相似度 0.72 < 0.85 → 新建
  3. 返回: { atom_id: "KA-ORDER_DISPATCH-003", is_new: true, version: 1 }
```

### 流程 3: 知识合并

```
学习 Agent 发现与已有知识相似的新信息
    ↓
调用 upsert_atom:
  atom: {
    domain: "ORDER_DISPATCH",
    symptom_signals: ["Dispatch failure", "Warehouse not found"],
    likely_root_causes: [{ description: "仓库编码变更未同步", probability: 0.6 }],
    recommended_actions: ["MANUAL_DATA_FIX"]
  }
    ↓
知识 Agent:
  1. 语义去重 → 与 KA-ORDER_DISPATCH-001 相似度 0.91 > 0.85 → 合并
  2. 合并 root_causes（追加去重）
  3. 合并 actions（追加去重）
  4. confidence = max(旧, 新)
  5. version +1
  6. 返回: { atom_id: "KA-ORDER_DISPATCH-001", is_new: false, version: 2 }
```

## 语言规范

| 场景 | 语言 | 示例 |
|------|------|------|
| symptom_signals | 英文 OMS 术语 | "Item ID Not Mapped"（非 "找不到商品"） |
| root_cause.description | 中文 | "渠道推送的订单数据缺少必填字段" |
| root_cause.description_en | 英文 OMS 术语 | "Required fields missing in channel order data" |
| domain | 英文编码 | "ORDER_DISPATCH" |
| recommended_actions | 英文编码 | "RETRY_WITH_BACKOFF" |
| API 错误 message | 中文 | "domain 字段不能为空" |

## 种子知识初始化

系统首次启动时自动从 `references/known-exceptions.md` 加载 11 个种子异常模式：
- source.type = "knowledge_graph"
- confidence = 0.8
- 覆盖 11 个 Domain_Code

如果种子文件不存在或格式错误，以空知识库启动（不阻塞）。
