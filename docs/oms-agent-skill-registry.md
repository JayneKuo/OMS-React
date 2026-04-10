# OMS Agent Skill Registry

本文档统一登记 OMS Agent 当前可用和规划中的 skills。Agent 在进行任务路由、能力选择和 workflow 编排时，应参考本文件中的能力定义。

### 关联文档

| 文档 | 关系 |
|------|------|
| [System Prompt](./oms-agent-system-prompt.md) | 定义 Agent 角色和能力域，引用本文件的 skill 列表 |
| [Output Policy](./oms-agent-output-policy.md) | 定义 skill 输出的展示格式和层级 |
| [Workflows](./oms-agent-workflows.md) | 定义多 skill 编排流程，引用本文件的 skill 依赖关系 |

---

## 能力总览

| # | Skill | 状态 | 类型 | 职责一句话 |
|---|-------|------|------|-----------|
| 1 | oms_query | ✅ 已上线 | 查询型 | OMS 全域查询，以订单为主入口联动查询所有核心对象 |
| 2 | cartonization | ✅ 已上线 | 工具型 | 根据商品属性和箱规计算装箱方案 |
| 3 | order_analysis | 🔲 规划中 | 分析型 | 订单异常根因分析和处理建议 |
| 4 | warehouse_allocation | 🔲 规划中 | 推荐型 | 根据库存、规则和仓能力推荐分仓方案 |
| 5 | shipping_rate | 🔲 规划中 | 计算型 | 根据包裹和路线计算运费 |
| 6 | eta | 🔲 规划中 | 计算型 | 根据路线和服务计算预计时效 |
| 7 | cost | 🔲 规划中 | 计算型 | 综合仓配、物流、包装成本计算 |

### Skill 依赖关系

```
oms_query ──────────────────────────────────────────────┐
  │                                                      │
  ├──→ order_analysis                                    │
  │                                                      │
  ├──→ warehouse_allocation ←── inventory_query*         │
  │         │                    warehouse_capability*    │
  │         │                                            │
  │         ├──→ cartonization ←── sku_master_data*      │
  │         │         │                                  │
  │         │         ├──→ shipping_rate                 │
  │         │         │         │                        │
  │         │         │         ├──→ eta                 │
  │         │         │         │                        │
  │         │         │         └──→ cost ←──────────────┘
  │         │         │               │
  │         │         └───────────────┘
  │         │
  └─────────┘

  * 标注为外部数据源，非独立 skill
```

执行顺序原则：从上到下、从左到右。上游 skill 的输出是下游 skill 的输入。

---

## Skill 1：oms_query（✅ 已上线）

### 定位

OMS 全域强查询。以订单为主入口，联动查询订单、商品、库存、仓库、分仓、规则、履约、发运、同步、日志、事件、集成中心配置等 OMS 核心对象。通过调用 OMS API 获取真实数据。

这是 Agent 最基础的 skill，几乎所有 workflow 都以它为起点。

### 触发条件

- 查询订单状态 / 详情 / 全景
- 查看 shipment / tracking / 发运进度
- 查看库存 / 仓库 / 分仓结果
- 查看规则命中 / Hold 原因 / 异常原因
- 查看集成中心连接器 / 渠道配置 / 认证状态
- 查看发运同步状态
- 批量订单统计

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| order_no | string | 至少提供一个标识 | 订单号，如 SO12345 |
| shipment_no | string | 至少提供一个标识 | 发运单号 |
| tracking_no | string | 至少提供一个标识 | 运单号 |
| event_id | string | 可选 | 事件 ID |
| sku | string | 可选 | SKU 编码 |
| connector_key | string | 可选 | 集成连接器标识 |
| query_intent | enum | 推荐 | 查询意图，帮助 skill 聚焦返回数据 |
| force_refresh | boolean | 可选 | 是否强制刷新缓存，默认 false |

#### query_intent 枚举值

| 值 | 说明 | 返回重点 |
|----|------|----------|
| `panorama` | 全景查询（默认） | 返回所有可用信息 |
| `status` | 状态查询 | 订单状态、异常、Hold |
| `shipment` | 发运查询 | 发运信息、承运商、运单号、追踪 |
| `warehouse` | 仓库查询 | 分仓结果、仓内状态、仓内单号 |
| `rule` | 规则查询 | 规则命中记录、分仓规则、Hold 规则 |
| `inventory` | 库存查询 | SKU 库存、各仓可用量 |
| `hold` | Hold 查询 | Hold 原因、Hold 时间、解除条件 |
| `timeline` | 时间线查询 | 订单龄、各环节时长、事件日志 |
| `integration` | 集成查询 | 连接器状态、同步记录、认证状态 |
| `sync` | 同步查询 | 三方同步状态、回传结果 |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| order_identity | object | 订单号、渠道、店铺、平台单号 |
| order_status | object | 订单状态、异常标记、Hold 标记 |
| order_lines | array | 商品行（SKU、品名、数量、价格） |
| address | object | 收货地址 |
| inventory_snapshot | object | 相关 SKU 各仓库存 |
| warehouse_info | object | 分仓结果、仓内状态、仓内单号 |
| allocation_rule | object | 命中的分仓规则 |
| fulfillment | object | 履约状态、履约单号 |
| shipment | object | 发运信息、承运商、服务、运单号 |
| tracking | object | 物流追踪、当前进度、ETA |
| sync_status | object | 三方同步状态、回传结果 |
| events | array | 最近事件日志（按时间倒序） |
| integration | object | 连接器状态、认证状态、健康信息 |
| data_completeness | object | 各字段的数据完整度标记 |
| query_explanation | string | 查询级解释（如为什么某些字段为空） |

### 职责边界

| 负责 | 不负责 |
|------|--------|
| 查询和返回 OMS 系统中的真实数据 | 解释复杂异常根因（→ order_analysis） |
| 联动查询关联对象 | 推荐决策（→ warehouse_allocation 等） |
| 标注数据完整度 | 计算运费/时效/成本（→ shipping_rate/eta/cost） |
| 提供查询级解释 | 装箱计算（→ cartonization） |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| NOT_FOUND | 订单/对象不存在 | 告知用户未找到，建议检查编号 |
| PARTIAL_DATA | 部分数据获取失败 | 返回已有数据，标注缺失部分 |
| TIMEOUT | 查询超时 | 建议用户稍后重试 |
| AUTH_ERROR | 认证失败 | 告知用户系统连接异常，建议联系管理员 |

### 可执行脚本

`scripts/query_oms.py`

---

## Skill 2：cartonization（✅ 已上线）

### 定位

根据订单商品、SKU 物理属性、箱规、承运商限制和包装规则，输出装箱建议或装箱计算结果。

### 触发条件

- 这票货怎么装箱
- 应该用什么箱型
- 会拆成几个包裹
- 装箱后计费重是多少
- 为什么这样装箱
- 装箱是否违反规则

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| order_items | array | 必须 | 订单商品列表（SKU、数量） |
| sku_dimensions | object | 必须 | SKU 尺寸（长宽高） |
| sku_weights | object | 必须 | SKU 重量 |
| item_attributes | object | 可选 | 商品特殊属性（易碎、液体、危险品等） |
| carton_rules | object | 可选 | 装箱规则（混装限制、最大重量等） |
| box_catalog | array | 推荐 | 可用箱型目录 |
| carrier_constraints | object | 可选 | 承运商限制（最大尺寸、最大重量） |
| packaging_preferences | object | 可选 | 包装偏好（环保、品牌包装等） |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| package_count | number | 包裹数量 |
| package_list | array | 每个包裹的详情（商品、箱型、重量、尺寸） |
| selected_box | object | 每个包裹选用的箱型 |
| actual_weight | number | 实际重量 |
| volumetric_weight | number | 体积重 |
| billable_weight | number | 计费重（取实际重和体积重的较大值） |
| fill_rate | number | 箱体填充率（%） |
| special_flags | array | 特殊标记（超大件、危险品等） |
| selection_reason | string | 箱型选择原因 |
| rule_validation | object | 规则校验结果（通过/违反及原因） |
| physical_validation | object | 物理校验结果（重量/尺寸是否超限） |

### 职责边界

| 负责 | 不负责 |
|------|--------|
| 计算装箱方案和计费重 | 订单查询（→ oms_query） |
| 校验装箱规则和物理约束 | 承运商最终推荐（→ shipping_rate + workflow） |
| 输出箱型选择原因 | 跨仓分仓决策（→ warehouse_allocation） |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| MISSING_DIMENSIONS | 缺少 SKU 尺寸数据 | 标记为估算，使用默认尺寸 |
| MISSING_WEIGHTS | 缺少 SKU 重量数据 | 标记为估算，使用默认重量 |
| NO_SUITABLE_BOX | 没有合适的箱型 | 告知用户，建议检查箱型目录或商品属性 |
| RULE_VIOLATION | 装箱违反规则 | 输出违反的规则和原因，给出替代方案 |
| OVERSIZE | 商品超出所有箱型 | 标记为超大件，建议人工处理 |

### 可执行脚本

`scripts/cartonize.py`、`scripts/validate_result.py`

---

> 以下 skills 为规划中，尚未实现。Agent 在遇到相关请求时，应明确告知用户该能力暂未上线，并说明当前可提供的替代建议。

---

## Skill 3：order_analysis（🔲 规划中）

### 定位

针对订单异常、失败、卡单、规则命中等场景，分析根因并给出处理建议。

### 触发条件

- 这个订单为什么失败
- 为什么没有分仓 / 发货 / 生成标签 / 算出运费 / 推送成功
- 这个异常怎么处理

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| order_no | string | 必须 | 订单号 |
| order_context | object | 必须 | 来自 oms_query 的订单上下文 |
| status_history | array | 推荐 | 状态变更历史 |
| error_logs | array | 推荐 | 错误日志 |
| rule_hit_logs | array | 可选 | 规则命中日志 |
| dependency_status | object | 可选 | 依赖环节状态（库存、仓库、承运商等） |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| issue_type | string | 问题类型（地址异常/库存不足/规则拦截/接口失败/超时等） |
| root_cause | string | 根因描述（确定时） |
| possible_causes | array | 可能原因列表（不确定时） |
| confidence | enum | 结论置信度：`confirmed` / `likely` / `uncertain` |
| impacted_step | string | 影响的业务环节 |
| recommendation | array | 修复建议（按优先级排序） |
| retryable_flag | boolean | 是否可自动重试 |
| manual_action_needed | boolean | 是否需要人工处理 |

### 职责边界

| 负责 | 不负责 |
|------|--------|
| 基于日志和规则分析根因 | 查询订单数据（→ oms_query） |
| 给出修复建议和操作步骤 | 执行修复操作（第三期） |
| 标注结论置信度 | 编造失败原因 |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| INSUFFICIENT_LOGS | 日志不足以判断根因 | 输出可能原因范围，标注 `uncertain` |
| MULTIPLE_CAUSES | 存在多个可能根因 | 列出所有可能原因，按可能性排序 |
| UNKNOWN_ERROR | 未知错误类型 | 建议用户联系技术支持 |

---

## Skill 4：warehouse_allocation（🔲 规划中）

### 定位

根据订单目的地、库存、仓库能力、业务规则等因素，输出仓库分配建议。

### 触发条件

- 这单该分哪个仓 / 推荐发货仓
- 为什么分到这个仓 / 哪个仓最优

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| destination | object | 必须 | 收货地址（省市区/邮编/国家） |
| sku_list | array | 必须 | SKU 列表 |
| qty_list | array | 必须 | 对应数量 |
| inventory_snapshot | object | 必须 | 各仓库存快照 |
| warehouse_capability | object | 推荐 | 仓库能力（处理能力、截单时间、支持服务等） |
| allocation_rules | object | 推荐 | 分仓规则配置 |
| constraints | object | 可选 | 用户指定的约束（排除某仓、指定某仓等） |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| recommended_warehouse | object | 推荐仓库（ID、名称、位置） |
| candidate_warehouses | array | 候选仓库列表（按评分排序） |
| allocation_reason | object | 推荐理由（库存、距离、成本、规则等维度评分） |
| rejected_warehouses | array | 被排除的仓库及排除原因 |
| inventory_check | object | 各候选仓的库存满足情况 |

### 职责边界

| 负责 | 不负责 |
|------|--------|
| 根据多维度评估推荐仓库 | 计算完整发货成本（→ cost） |
| 输出候选仓和排除原因 | 最终物流推荐（→ workflow 编排） |
| 校验库存满足情况 | 装箱计算（→ cartonization） |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| NO_INVENTORY | 所有仓库均无库存 | 告知用户，建议检查库存或等待补货 |
| NO_CAPABLE_WAREHOUSE | 无仓库满足能力要求 | 列出最接近的候选仓和差距 |
| RULE_CONFLICT | 规则冲突 | 说明冲突的规则，建议人工决策 |

---

## Skill 5：shipping_rate（🔲 规划中）

### 定位

根据发货地、收货地、包裹信息、承运商和服务，计算运费结果。

### 触发条件

- 运费是多少 / 不同承运商哪个更便宜
- 装箱后怎么计算运费 / 哪个服务价格更优

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| origin | object | 必须 | 发货地（仓库地址） |
| destination | object | 必须 | 收货地 |
| package_list | array | 必须 | 包裹列表（来自 cartonization 输出） |
| carrier | string | 可选 | 指定承运商（不指定则查询所有可用） |
| service | string | 可选 | 指定服务（不指定则查询所有可用） |
| billing_context | object | 可选 | 计费上下文（账号、折扣等） |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| rates | array | 各承运商/服务的报价列表 |
| rate_amount | number | 运费金额（每个方案） |
| surcharge_breakdown | array | 附加费明细（燃油费、偏远地区费等） |
| billable_weight | number | 计费重 |
| pricing_notes | string | 定价说明 |

### 职责边界

| 负责 | 不负责 |
|------|--------|
| 计算各方案运费 | 最终推荐结论（→ workflow 综合判断） |
| 输出附加费明细 | 时效计算（→ eta） |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| CARRIER_UNAVAILABLE | 承运商不可用 | 跳过该承运商，基于其他承运商结果继续 |
| INVALID_ADDRESS | 地址无效 | 告知用户，建议检查地址 |
| RATE_EXPIRED | 报价已过期 | 标注报价时间，建议确认最新价格 |

---

## Skill 6：eta（🔲 规划中）

### 定位

根据发货地、收货地、承运商、服务和业务规则，计算预计时效。

### 触发条件

- 大概几天能到 / 哪个服务更快
- 这个方案时效如何 / 哪个仓发货更快

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| origin | object | 必须 | 发货地 |
| destination | object | 必须 | 收货地 |
| carrier | string | 必须 | 承运商 |
| service | string | 必须 | 服务 |
| shipping_calendar | object | 可选 | 物流日历（节假日、不可发运日） |
| warehouse_cutoff_time | string | 可选 | 仓库截单时间 |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| estimated_delivery_days | number | 预计送达天数 |
| estimated_delivery_date | date | 预计送达日期 |
| cutoff_impact | string | 截单时间影响说明（如"今天已过截单时间，顺延 1 天"） |
| eta_notes | string | 时效说明（如"不含周末和节假日"） |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| NO_ROUTE | 无可用路线 | 告知用户该路线不支持 |
| MISSING_CALENDAR | 缺少物流日历 | 输出工作日时效，标注"不含节假日调整" |

---

## Skill 7：cost（🔲 规划中）

### 定位

根据仓配成本、物流成本、包装成本等，输出综合成本结果。

### 触发条件

- 这单成本是多少 / 哪个方案成本更低
- 比较不同仓库或承运商的总成本

### Inputs

| 参数 | 类型 | 必要性 | 说明 |
|------|------|--------|------|
| warehouse_cost | object | 推荐 | 仓储和操作成本 |
| packaging_cost | object | 推荐 | 包装材料成本（来自 cartonization） |
| shipping_cost | object | 必须 | 物流成本（来自 shipping_rate） |
| operational_cost | object | 可选 | 其他运营成本 |
| scenario_options | array | 可选 | 多方案对比时的方案列表 |

### Outputs

| 字段 | 类型 | 说明 |
|------|------|------|
| total_cost | number | 综合成本 |
| cost_breakdown | object | 成本明细（仓储/包装/物流/运营） |
| scenario_comparison | array | 多方案成本对比表 |
| cost_notes | string | 成本说明 |

### 错误码

| 错误码 | 含义 | Agent 处理方式 |
|--------|------|---------------|
| MISSING_COMPONENT | 缺少某项成本数据 | 输出已有成本，标注缺失项为估算 |
| STALE_DATA | 成本数据过期 | 标注数据时间，建议确认最新成本 |

---

## 通用规范

### Skill 调用规范

每个 skill 调用必须包含：

```json
{
  "skill_name": "oms_query",
  "parameters": {
    "order_no": "SO12345",
    "query_intent": "panorama"
  },
  "purpose": "获取订单全景数据，作为异常分析的基础"
}
```

### 技能使用总原则

1. 查询型问题优先调用查询型 skill
2. 分析型问题优先调用查询 + 分析 skill
3. 推荐型问题优先调用多个计算/分析 skill 后再汇总
4. 编排型问题必须按 [Workflows](./oms-agent-workflows.md) 执行
5. 缺少关键输入时，不得伪造精确结果

### 规划中 Skill 的处理规则

当 Agent 遇到需要调用规划中 skill 的请求时，必须：

1. 明确告知用户该能力暂未上线
2. 说明当前可提供的替代建议（如基于 oms_query 数据的经验建议）
3. 不得伪装成已有该能力
4. 如果用户的问题可以通过已上线 skill 部分回答，先给出可回答的部分

示例回复：
```
目前"智能分仓推荐"能力还在开发中，暂时无法自动计算最优仓库。

不过我可以帮你查询各仓库的库存情况和订单目的地，你可以据此判断：

📋 订单 SO12345 商品库存分布：
- 华东仓：SKU-001 可用 30 件 ✅
- 华南仓：SKU-001 可用 15 件 ✅
- 华北仓：SKU-001 可用 0 件 ❌

收货地址：上海浦东

从距离和库存来看，华东仓可能是较优选择，但建议结合仓库处理能力和运费综合判断。

[前往订单详情](/orders/SO12345) [前往库存管理](/inventory)
```

---

## 变更记录

| 日期 | 变更内容 |
|------|----------|
| 2026-04 | 初始版本：oms_query + cartonization 已上线，其余 5 个 skill 规划中 |
