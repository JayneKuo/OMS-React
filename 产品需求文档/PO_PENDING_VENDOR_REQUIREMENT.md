# PO待分配Vendor需求文档

## 一、背景

在 Factory Direct（工厂直发）场景下，PO 创建后并不一定立即完成 Vendor 分配。

此时从业务上看，单据并不是异常，也不是配置错误，而是处于一个正常的中间阶段：**待分配 Vendor**。

当前页面在这个阶段存在两个问题：

1. 页面容易把该状态表达成异常或阻塞，导致用户误以为系统出错；
2. 页面没有清晰区分“单据类型”和“当前阶段”，容易让用户把技术原因当成业务状态理解；
3. `Supply Allocation Order` 页面在未分配时展示过重，和页面顶部的操作入口重复，增加理解成本。

因此需要对 Factory Direct PO 在“待分配 Vendor”阶段的整体产品表达进行统一，确保用户能够快速理解当前单据所处阶段、下一步要做什么，以及分配完成后结果会出现在哪里。

---

## 二、需求目标

本需求的目标是：

1. 将 Factory Direct PO 的“待分配 Vendor”阶段定义为**正常业务流程阶段**，而不是异常状态；
2. 在列表页和详情页中，统一区分：
   - **单据类型**：这是什么单
   - **当前阶段**：当前走到哪一步
3. 在详情页中提供唯一且明确的操作入口，让用户知道下一步就是执行 Vendor 分配；
4. 在 `Supply Allocation Order` 页面中，用轻量方式表达“当前尚无分配结果”，避免把未分配状态设计成异常页；
5. 让页面表达对业务用户更友好，不再直接展示技术原因类文案。

---

## 三、适用场景

本需求适用于以下场景：

- PO 类型为 **Factory Direct**；
- PO 已创建；
- 当前尚未完成 Vendor 分配；
- 后续需要由用户手动完成 Vendor 分配，并继续推进履约链路。

典型业务过程如下：

1. 创建 Factory Direct PO；
2. 系统生成或保留目标侧需求；
3. 当前尚未分配 Vendor；
4. 用户在详情页执行 Vendor 分配；
5. 分配完成后，系统在 `Supply Allocation Order` 中展示分配结果。

---

## 四、核心业务定义

### 1. 单据类型（Type）
用于表达这张 PO 属于哪种业务模式。

本需求涉及的类型包括：
- Standard Purchase（标准采购）
- Factory Direct（工厂直发）

### 2. 当前阶段（Stage）
用于表达 Factory Direct PO 当前走到哪一步。

本需求关注的阶段为：
- Pending Vendor（待分配 Vendor）
- Allocated（已分配）
- Released / 执行中（如后续已推进）

### 3. Pending Vendor
Pending Vendor 表示：

- 当前单据是 Factory Direct PO；
- 当前尚未完成 Vendor 分配；
- 用户下一步需要执行 Vendor 分配；
- 该状态属于正常业务流转中的待处理阶段，而不是异常。

---

## 五、核心规则

### 1. 类型与阶段必须分开表达
页面必须区分：

- **类型**：这是什么单（Factory Direct）
- **阶段**：现在到哪一步（Pending Vendor）

不能用技术原因替代阶段表达。

### 2. Pending Vendor 是正常流程，不是异常
当单据处于 Pending Vendor 阶段时：

- 页面不应使用异常语义；
- 页面不应让用户理解为“系统配置错误”；
- 页面应表达为“当前还未完成下一步业务动作”。

### 3. 页面不直接暴露技术原因
例如：
- Missing FG warehouse
- 缺少供应商仓库
- 缺少 Vendor 成品仓

这些可以作为内部判断信号，但不应作为用户主视图中的主要文案。

用户看到的统一表达应为：
- 类型：Factory Direct
- 阶段：Pending Vendor

### 4. Pending Vendor 阶段必须有明确下一步
当页面展示 Pending Vendor 时，用户必须能明确知道：

- 当前还没有完成 Vendor 分配；
- 下一步操作就是分配 Vendor；
- 分配完成后，结果会出现在 `Supply Allocation Order` 中。

---

## 六、页面说明（UI）

## 1. PO列表页

### 页面目标
让用户在列表页快速识别：
- 这张单是不是 Factory Direct
- 当前是否还处于待分配 Vendor 阶段

### 页面表现
对于 Factory Direct 且尚未完成分配的单据：
- 类型 badge：`Factory Direct`
- 阶段 badge：`Pending Vendor`

对于 Standard Purchase：
- 仅显示类型：`Standard Purchase`

### 页面说明
列表页只负责表达：
- 单据类型
- 当前阶段

列表页不负责解释技术原因，因此不应显示诸如：
- Missing FG warehouse
- 缺少供应商仓库
- 缺少 Vendor 成品仓

---

## 2. PO详情页 Header

### 页面目标
让用户进入详情页后第一眼就知道：
- 当前单据是什么类型
- 当前走到哪一步
- 下一步要做什么

### 页面表现
当单据处于 Pending Vendor 阶段时：
- Header 显示：`待分配 Vendor`
- 阶段使用中性流程语义
- 右上角显示唯一主按钮：`分配 Vendor`

### 页面说明
Header 是当前单据的主决策区。

用户进入详情页后，应首先看到：
- 类型：Factory Direct
- 阶段：Pending Vendor
- 当前主动作：分配 Vendor

页面不应要求用户先进入 tab 才能理解下一步操作。

---

## 3. Supply Allocation Order 页面

### 页面目标
明确告诉用户：
- 当前还没有分配结果
- 分配完成后结果会显示在这里

### 未分配状态页面表现
当当前单据尚未完成 Vendor 分配时：

#### 左侧列表区
显示：
- `暂无分配单`

#### 右侧详情区
显示轻量说明：
- `当前尚未分配 Vendor，完成分配后会在这里生成 Supply Allocation Order。`

### 已分配状态页面表现
当 Vendor 分配完成后：
- 左侧展示 Supply Allocation Order 列表
- 右侧展示当前分配单详情

### 页面说明
`Supply Allocation Order` 页面在未分配状态下的职责是：
- 表达当前暂无分配结果
- 告诉用户分配完成后结果会显示在这里

它不应在未分配状态下承担第二套主流程入口。

因此在该状态下不再展示：
- 大面积异常提示卡
- 多张辅助说明卡片
- tab 内重复主按钮

---

## 4. 顶部摘要区

### 页面目标
帮助用户在不切换页面、不进入具体 tab 的情况下，快速建立对当前单据的整体认知。

### 页面表现
摘要区应至少支持看到：
- 基础摘要
- 收货摘要
- 条款与履约摘要
- Vendor Fulfillment Summary

### Vendor Fulfillment Summary 要求
该区域不再使用单供应商卡片模型，而采用聚合视角：
- Vendor Count
- Current Stage
- Allocation Status
- Vendor Preview

### 页面说明
在 Factory Direct 场景下，Vendor 可能为多个，因此顶部摘要不能绑定到单个供应商对象，而应表达 Vendor 履约整体状态。

---

## 七、页面显示逻辑（取值逻辑）

## 1. 类型取值逻辑
### 字段来源
- `purchaseType`

### 页面映射规则
- `STANDARD` → `Standard Purchase`
- `FACTORY_DIRECT` → `Factory Direct`

### 说明
类型用于表达业务模式，不受当前是否完成 Vendor 分配影响。

---

## 2. 阶段取值逻辑
### 阶段来源
Pending Vendor 不是一个直接等于单字段的技术状态，而是一个页面层业务映射结果。

### Pending Vendor 判定条件
当满足以下条件时，页面展示阶段为：`Pending Vendor`

#### 基本条件
- `purchaseType = FACTORY_DIRECT`
- 尚未完成 Vendor 分配
- 尚未生成有效的 Supply Allocation Order 结果

#### 可参考的内部判断信号
页面内部可参考以下信号进行判断：
- `supplyAllocationOrders.length === 0`
- `supplyAllocationStatus === "PENDING_ALLOCATION"`
- `missingFgWarehouse === true`
- `vendorFgWarehouseName` 缺失

### 页面统一展示规则
即使内部判断依据是：
- 缺少 Vendor FG 仓
- 缺少供应商仓库
- 尚未指定 Vendor

页面统一展示为：
- 类型：`Factory Direct`
- 阶段：`Pending Vendor`

不直接展示技术原因。

---

## 3. Header 主按钮显示逻辑
### 当阶段为 Pending Vendor
显示：
- `分配 Vendor`

### 当阶段不是 Pending Vendor
不再显示该主按钮，按后续业务阶段显示对应操作。

### 说明
在 Pending Vendor 阶段，`分配 Vendor` 是当前页面唯一主操作。

---

## 4. Supply Allocation Order 页面显示逻辑
### 未分配时
满足条件：
- `purchaseType = FACTORY_DIRECT`
- 阶段 = `Pending Vendor`
- `supplyAllocationOrders.length === 0`

页面展示：
- 左侧：空列表（暂无分配单）
- 右侧：轻量说明文案

### 已分配时
满足条件：
- `supplyAllocationOrders.length > 0`

页面展示：
- 左侧：分配单列表
- 右侧：分配单详情

---

## 5. Vendor Fulfillment Summary 取值逻辑
### 未分配时
- Vendor Count: `0`
- Current Stage: `Pending Vendor`
- Allocation Status: `Pending`
- Vendor Preview: `当前还没有分配 Vendor`

### 单 Vendor 时
- Vendor Count: `1`
- Vendor Preview: 当前唯一 Vendor 名称

### 多 Vendor 时
- Vendor Count: 分配结果中的 Vendor 数量
- Vendor Preview: 前 2 个 Vendor 名称 + `+N`

### 说明
顶部摘要区表达的是整体履约视角，不是单个 Vendor 详情。

---

## 八、用户体验原则

### 1. 先表达业务，再表达实现细节
页面首先应告诉用户：
- 这是一张 Factory Direct 单
- 当前待分配 Vendor
- 下一步要做分配

而不是先告诉用户某个中间配置缺失。

### 2. 一个页面只有一个当前主动作
在 Pending Vendor 阶段，主动作就是：
- 分配 Vendor

同一页面内不应重复出现多个同等级入口。

### 3. 空状态优于“伪异常状态”
对于“当前没有数据，但属于正常阶段”的情况：
- 使用空状态
- 使用轻量说明
- 不使用告警式表达

### 4. 顶部摘要表达整体，tab 表达结果与过程
- 顶部摘要区：表达当前单据整体状态
- SAO 页签：表达分配结果
- Header：表达下一步要做什么

---

## 九、验收标准

### 列表页
- [ ] Factory Direct 单据显示类型：`Factory Direct`
- [ ] 未分配阶段显示：`Pending Vendor`
- [ ] 不再显示 `Missing FG warehouse / 缺少供应商仓库` 作为用户主视图文案

### 详情页 Header
- [ ] Pending Vendor 阶段显示：`待分配 Vendor`
- [ ] 状态使用中性流程语义，而不是异常语义
- [ ] 右上角提供唯一主操作：`分配 Vendor`

### Supply Allocation Order 页面
- [ ] 未分配时左侧显示 `暂无分配单`
- [ ] 未分配时右侧显示轻量说明文案
- [ ] 不再展示大块异常提示或复杂说明卡片
- [ ] 不再展示 tab 内重复主操作按钮

### 顶部摘要区
- [ ] 摘要区支持展示 Vendor 履约聚合信息
- [ ] 不再使用单供应商模型表达 Factory Direct 多 Vendor 场景
- [ ] 多 Vendor 场景下页面仍能快速识别整体阶段与分配状态

### 业务理解
- [ ] 用户能理解当前是正常业务阶段，而不是异常
- [ ] 用户能快速知道下一步操作是分配 Vendor
- [ ] 用户能理解分配完成后结果会在 `Supply Allocation Order` 中展示

---

## 十、总结

本需求的核心，不是新增一个按钮，而是统一 Factory Direct PO 在“待分配 Vendor”阶段的产品表达。

通过区分“单据类型”和“当前阶段”，并明确页面的 UI 表现、取值逻辑和交互入口，页面可以更准确地反映真实业务流程，帮助用户快速理解当前单据是什么、走到哪一步、下一步该做什么，以及分配完成后的结果会在哪里出现。