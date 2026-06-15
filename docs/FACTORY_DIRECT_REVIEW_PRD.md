# 工厂直发评审需求文档

## 1. 背景

当前采购履约流程主要围绕常规采购入仓展开，系统中的 Target RN（目标仓 RN）用于承载最终收货需求。

但在实际业务中，存在一类典型场景：**工厂直发（Factory Direct）**。

在该场景下：

- 货物由供应商 / 工厂侧直接发往最终履约节点；
- 系统仍需保留目标侧收货需求，用于跟踪整单履约；
- 同时还需要补充 Vendor 侧的执行链路，用于描述工厂侧如何完成履约。

因此，本次需求需要在现有采购单详情与履约展示逻辑上，补充工厂直发场景下的单据链路、状态表达和异常处理能力。

---

## 2. 需求目标

本次需求的目标如下：

1. **支持工厂直发场景表达**  
   在采购单详情中清晰区分普通采购入仓与工厂直发。

2. **保留 Target RN 作为最终需求单据**  
   即使是工厂直发，Target RN 仍然存在，不被 Vendor RN 替代。

3. **补充 Vendor 侧执行链路**  
   支持展示 Vendor Order、Vendor RN、Outbound / SO 等执行单据。

4. **支持 Vendor RN 推送状态透明化**  
   让业务可以清楚看到当前是否已推送、是否推送失败、是否等待下游接收、是否已取消。

5. **支持 Vendor RN 取消后重建**  
   当 Vendor RN 在下游接收前被取消时，允许由对应 Vendor Order 重新创建新的 Vendor RN。

---

## 3. 适用范围

### 3.1 本次纳入范围

- 工厂直发场景下的采购单详情展示；
- Supply Allocation Order（SAO）详情中的 Vendor-side / Target-side 信息展示；
- Vendor RN 推送状态展示；
- Vendor RN 异常处理的操作表达（重推、取消、重建）；
- 工厂直发链路中的说明文案与状态标识。

### 3.2 本次不纳入范围

- 下游 WMS / Kafka 实际接口改造；
- 自动重试机制、补偿任务和告警系统；
- Vendor RN 重建后的库存、财务、对账影响；
- 下游已接收后的逆向冲销流程；
- 后端状态机与异步任务框架设计。

---

## 4. 关键业务对象定义

### 4.1 Factory Direct（工厂直发）

指货物不经过我方常规采购入仓路径，而是由供应商 / 工厂直接完成履约的一类采购模式。

### 4.2 Target RN（目标仓 RN）

- 表示最终的收货需求；
- 是工厂直发链路中的目标单据；
- **在工厂直发场景下必须保留**；
- 不因为 Vendor 侧执行单据存在而被替换。

### 4.3 Vendor Order

- 表示 Vendor 侧的执行订单；
- 用于承接工厂执行动作；
- 可作为创建 Vendor RN 的业务来源。

### 4.4 Vendor RN

- 表示 Vendor 侧接收 / 履约过程中的执行单据；
- 属于执行链路单据，不是最终需求单据；
- 可推送给下游系统执行后续处理；
- 在下游未接收前取消后，可重新创建新的 Vendor RN。

### 4.5 Outbound / SO

- 表示 Vendor RN 推进后的出库 / 发运执行单据；
- 属于 Vendor 侧执行链路的一部分；
- 与 Target RN 一起构成“需求 + 执行”的全链路视图。

---

## 5. 业务流程

### 5.1 流程总览

工厂直发场景下，系统内需要同时表达两条逻辑：

#### A. 需求链路
- Target RN 持续存在；
- 表示最终应被履约的收货需求。

#### B. 执行链路
- 供应链路由分配到 Vendor；
- 生成 Vendor Order；
- Vendor Order 创建 Vendor RN；
- Vendor RN 推送到下游系统；
- 下游完成接收 / 出库 / 履约处理。

### 5.2 典型流程

1. 创建采购单；
2. 系统识别当前路由为工厂直发；
3. 生成或保留 Target RN 作为最终需求；
4. 对供应进行 Vendor 分配；
5. 生成 Vendor Order；
6. 由 Vendor Order 创建 Vendor RN；
7. Vendor RN 推送到下游系统；
8. 下游处理成功后，继续生成或更新 Outbound / SO 等执行单据；
9. 如推送失败、下游拒收或人工取消，则根据状态决定重推或重建。

---

## 6. 核心业务规则

### 6.1 Target RN 必须保留

无论是否为工厂直发场景，Target RN 都表示最终收货需求，因此不能被 Vendor RN 替代。

**规则说明：**
- Vendor RN 是执行单据；
- Target RN 是需求单据；
- 页面展示必须让用户能明确区分两者角色。

### 6.2 Vendor RN 仅在下游未接收前允许取消后重建

当满足以下条件时：

- Vendor RN 已创建；
- Vendor RN 尚未被下游正式接收 / 消费；
- 当前 Vendor RN 被人工取消；

则：

- 原 Vendor RN 状态变为已取消；
- 原 Vendor RN 不再继续使用；
- 对应 Vendor Order 可以重新创建一个新的 Vendor RN；
- 新 Vendor RN 继续承接后续执行链路。

### 6.3 下游已接收后不允许直接重建

如果 Vendor RN 已被下游接收，则不能简单执行“取消后重建”。

**处理原则：**
- 前端应阻止直接重建；
- 需要进入异常人工处理流程；
- 本期先进行规则说明与状态拦截，不扩展后续冲销方案。

### 6.4 推送失败必须可见且可判断

Vendor RN 推送失败时，页面必须向业务明确展示：

- 当前推送状态；
- 最近一次推送时间；
- 已重试次数；
- message id；
- 错误原因。

其目的不是单纯显示“失败”，而是帮助业务判断：

- 是否应该直接重推；
- 是否应该取消当前 RN；
- 是否应该重新创建新的 RN。

---

## 7. Vendor RN 生命周期设计

### 7.1 状态定义

建议统一以下状态：

| 状态 | 中文 | 含义 |
|---|---|---|
| `NO_RN` | 未创建 RN | 当前 Vendor Order 尚未生成 Vendor RN |
| `RN_CREATED` | RN 已创建 | Vendor RN 已生成，但尚未完成有效推送 |
| `PUSH_FAILED` | Kafka 推送失败 | 系统向下游推送失败 |
| `WAITING_ACCEPT` | 等待下游接收 | 推送已发出，但下游尚未确认接收 |
| `REJECTED` | 下游拒收 | 下游已消费，但拒绝接收当前 Vendor RN |
| `ACCEPTED` | 已接收 | 下游已成功接收当前 Vendor RN |
| `RN_CANCELLED` | RN 已取消 | 当前 Vendor RN 已取消，可视规则支持重建 |

### 7.2 状态流转建议

```text
NO_RN
  -> RN_CREATED
  -> PUSH_FAILED
  -> WAITING_ACCEPT
  -> ACCEPTED

RN_CREATED / PUSH_FAILED / WAITING_ACCEPT / REJECTED
  -> RN_CANCELLED
  -> Create New RN -> RN_CREATED
```

说明：
- `ACCEPTED` 后不允许直接取消并重建；
- `WAITING_ACCEPT` 是否可重建，建议先通过“取消 RN”动作将旧 RN 失效，再创建新 RN，避免下游晚到消费造成重复。

---

## 8. 页面展示需求

## 8.1 采购单详情页（PO Detail）

在工厂直发场景下，采购单详情页需要清晰表达：

1. **需求链路**：Target RN 作为最终收货需求；
2. **执行链路**：Vendor 分配、Vendor RN、Outbound / SO 等执行过程；
3. **异常链路**：Vendor RN 推送失败、等待接收、取消、重建等状态。

### 8.1.1 SAO 列表展示要求

每个 SAO 卡片除原有分配状态外，还需展示 Vendor RN 状态标识，例如：

- Kafka Failed
- Waiting Accept
- Accepted
- RN Cancelled

用户应在不进入详情的情况下，快速识别哪个 SAO 存在 Vendor RN 异常。

### 8.1.2 SAO 详情展示要求

建议保留以下区域：

#### Header 区
展示：
- SAO 编号；
- 分配状态；
- Vendor RN 状态；
- Source / Destination / Route / Outbound。

#### 动态链路区
展示以下节点：
- Target RN Created；
- Vendor Assigned；
- Vendor RN / FG Receipt；
- Outbound / SO；
- Target Fulfillment。

其中 Vendor RN 节点必须根据状态变化呈现不同视觉：
- 成功：绿色；
- 等待：黄色 / 橙色；
- 失败：红色；
- 取消：灰色。

#### Vendor-side 卡片
展示：
- Vendor；
- Source Warehouse；
- Vendor FG Warehouse；
- Vendor RN；
- Push Status；
- Last Push；
- Retry Count；
- Message ID；
- Push Exception；
- Outbound / SO。

#### Target-side 卡片
展示：
- Target RN；
- Target Warehouse；
- Demand Qty；
- Allocated Qty；
- Remaining Qty。

#### 说明区
需要明确说明：

> Vendor 侧单据用于执行履约方案；如果 Vendor RN 在下游接收前被取消，Vendor Order 可以重新创建 RN。Target RN 仍然作为最终收货需求保留。

---

## 9. 页面操作需求

### 9.1 Create Vendor RN

**触发条件：**
- 当前状态为 `NO_RN`；或
- 当前状态为 `RN_CANCELLED`。

**作用：**
- 为当前 Vendor Order 创建新的 Vendor RN；
- 新 RN 创建后，状态进入 `RN_CREATED`。

### 9.2 Retry Push

**触发条件：**
- 当前状态为 `RN_CREATED`、`PUSH_FAILED`、`WAITING_ACCEPT` 或 `REJECTED`。

**作用：**
- 对当前 Vendor RN 再次发起推送；
- 更新最后推送时间、重试次数、message id；
- 页面状态进入 `WAITING_ACCEPT` 或后续成功 / 失败状态。

### 9.3 Cancel RN

**触发条件：**
- 当前状态为 `RN_CREATED`、`PUSH_FAILED`、`WAITING_ACCEPT` 或 `REJECTED`；
- 下游尚未确认接收。

**作用：**
- 将当前 Vendor RN 标记为取消；
- 原 Vendor RN 保留在历史链路中，但不再继续使用；
- 对应 Vendor Order 恢复到可重建 RN 的状态。

### 9.4 View Error

当存在异常时，页面应可直接查看：
- 错误原因；
- 最近推送时间；
- 重试次数；
- message id。

本期不要求单独弹窗，允许直接在 Vendor-side 区域内展示。

---

## 10. 典型异常场景

### 10.1 Kafka 推送失败

**场景：**
- Vendor RN 已创建；
- OMS 向 Kafka 推送失败。

**页面要求：**
- 显示 `PUSH_FAILED`；
- 显示错误原因；
- 支持 Retry Push；
- 支持 Cancel RN。

### 10.2 下游未接收 / 未确认

**场景：**
- Kafka 已发送；
- 下游长时间未接收。

**页面要求：**
- 显示 `WAITING_ACCEPT`；
- 可支持 Retry Push；
- 可支持 Cancel RN。

### 10.3 下游拒收

**场景：**
- 下游已消费；
- 但拒绝接收当前 Vendor RN。

**页面要求：**
- 显示 `REJECTED`；
- 显示拒收原因；
- 支持 Retry Push 或 Cancel RN。

### 10.4 Vendor RN 已取消

**场景：**
- 当前 Vendor RN 不再使用；
- Vendor Order 需要重新发起 Vendor RN。

**页面要求：**
- 显示 `RN_CANCELLED`；
- 原 Vendor RN 仍保留展示；
- 出现 `Create Vendor RN` 操作入口。

### 10.5 下游已接收

**场景：**
- 当前 Vendor RN 已被下游确认接收。

**页面要求：**
- 显示 `ACCEPTED`；
- 不允许执行 Cancel RN；
- 不允许直接 Create New RN；
- 如存在后续异常，走线下或后续异常流程。

---

## 11. 数据字段建议

为支持页面表达，Vendor RN 维度建议至少具备以下字段：

| 字段 | 说明 |
|---|---|
| `vendorReceiptNo` | Vendor RN 单号 |
| `vendorRnStatus` | Vendor RN 生命周期状态 |
| `vendorRnError` | 错误信息 / 拒收原因 |
| `vendorRnMessageId` | 消息 ID |
| `vendorRnLastPushedAt` | 最后推送时间 |
| `vendorRnRetryCount` | 重试次数 |
| `outboundOrderNo` | 下游出库单 / SO |

---

## 12. 验收标准

满足以下条件即可视为需求通过：

### 12.1 业务表达正确
- 工厂直发场景下，Target RN 仍保留；
- Vendor RN 被识别为执行单据，而非最终需求单据。

### 12.2 页面展示完整
PO 详情页可以清楚看到：
- Vendor RN；
- Push Status；
- Last Push；
- Retry Count；
- Message ID；
- Push Exception；
- Outbound / SO；
- Target RN。

### 12.3 状态与操作匹配
- 不同 Vendor RN 状态有清晰标识；
- 失败 / 等待 / 取消状态具备正确操作入口；
- 已接收状态下不能直接取消或重建。

### 12.4 业务规则可解释
- 用户能从页面理解 Vendor RN 与 Target RN 的分工；
- 用户能理解“取消后可重建”的适用前提仅为下游未接收前。

---

## 13. 评审重点问题

建议在评审会上重点确认以下问题：

1. **Target RN 与 Vendor RN 的职责边界是否已统一认知？**
2. **“下游已接收”的判定口径是什么？**
3. **Vendor RN 取消后是否必须保留完整历史链路？**
4. **Retry Push 是纯前端动作，还是需要联动后端幂等策略？**
5. **一个 Vendor Order 是否允许多次生成不同 Vendor RN？**
6. **如果存在旧 RN 与新 RN，页面默认应突出展示哪一个？**
7. **下游 Outbound / SO 与哪个 RN 建立最终主关联？**

---

## 14. 一句话总结

本次工厂直发需求的核心，不是用 Vendor RN 替代 Target RN，而是在**保留 Target RN 作为最终收货需求**的前提下，补充 **Vendor 侧执行链路**，并将 **Vendor RN 的推送、失败、取消与重建过程透明化**，让业务可以看懂、判断并处理异常。
