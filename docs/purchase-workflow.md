# 采购业务流程文档

本文档基于系统实际实现，详细描述了采购申请、采购订单、入库请求（Receipts）、已收货（History）四个核心模块的业务流程。

**模块名称更新：**
- **入库请求**：Receipts（原 Inbound Request）
- **已收货**：History（原 Received）
- **运单**：Shipments（原 Advance Ship Notice）

## 目录

1. [采购申请（PR）业务流程](#1-采购申请pr业务流程)
2. [采购订单（PO）业务流程](#2-采购订单po业务流程)
3. [入库请求（Receipts）业务流程](#3-入库请求receipts业务流程)
4. [已收货（History）业务流程](#4-已收货history业务流程)
5. [业务流程关联关系](#5-业务流程关联关系)
6. [特殊场景处理](#6-特殊场景处理)

---

## 1. 采购申请（PR）业务流程

### 1.1 状态定义

采购申请（Purchase Request）包含以下状态：

| 状态 | 英文标识 | 说明 |
|------|---------|------|
| 草稿 | DRAFT | 刚创建的采购申请，尚未提交 |
| 已提交 | SUBMITTED | 已提交但尚未进入审批流程 |
| 审批中 | APPROVING | 正在审批流程中 |
| 已批准 | APPROVED | 审批通过，可以生成采购订单 |
| 已拒绝 | REJECTED | 审批被拒绝 |
| 已取消 | CANCELLED | 申请被取消 |
| 异常 | EXCEPTION | 出现异常情况 |
| 部分PO | PARTIAL_PO | 部分需求已生成PO |
| 全部PO | FULL_PO | 全部需求已生成PO |
| 已关闭 | CLOSED | 采购申请已关闭 |

### 1.2 状态流转图

```
DRAFT
  ↓ [提交]
SUBMITTED
  ↓ [提交审批]
APPROVING
  ↓ [审批通过]      ↓ [审批拒绝]
APPROVED ──────────→ REJECTED
  ↓ [生成PO]
PARTIAL_PO / FULL_PO
  ↓ [完成]
CLOSED

[任意状态] → CANCELLED (取消)
[任意状态] → EXCEPTION (异常)
```

### 1.3 操作权限

#### DRAFT（草稿）
- ✅ 查看详情
- ✅ 编辑
- ✅ 删除
- ✅ 提交
- ✅ 取消

#### SUBMITTED（已提交）
- ✅ 查看详情
- ✅ 编辑
- ✅ 提交审批
- ✅ 取消

#### APPROVING（审批中）
- ✅ 查看详情
- ✅ 批准
- ✅ 拒绝
- ✅ 取消

#### APPROVED（已批准）
- ✅ 查看详情
- ✅ 生成PO
- ✅ 复制
- ✅ 取消（详情页）

#### REJECTED（已拒绝）
- ✅ 查看详情
- ✅ 编辑
- ✅ 复制

#### CANCELLED（已取消）
- ✅ 查看详情
- ✅ 复制

#### EXCEPTION（异常）
- ✅ 查看详情
- ✅ 修复（编辑）
- ✅ 取消

#### PARTIAL_PO（部分PO）
- ✅ 查看详情
- ✅ 继续生成PO
- ✅ 取消未关联项

#### FULL_PO（全部PO）
- ✅ 查看详情

#### CLOSED（已关闭）
- ✅ 查看详情

### 1.4 PR类型

- **常规采购**（Regular Purchase）
- **项目采购**（Project Purchase）
- **备货**（Stock Replenishment）
- **内部调拨**（Internal Transfer）

### 1.5 优先级

- **普通**（NORMAL）
- **紧急**（URGENT）
- **非常紧急**（VERY_URGENT）

### 1.6 PO生成情况

- **未生成**（NOT_GENERATED）
- **部分生成**（PARTIALLY_GENERATED）
- **全部生成**（FULLY_GENERATED）

---

## 2. 采购订单（PO）业务流程

### 2.1 状态系统

采购订单采用**三层状态系统**：

#### 2.1.1 主状态（PO Status）

| 状态 | 英文标识 | 说明 |
|------|---------|------|
| 新建 | NEW | 刚创建的PO，还没开始履约 |
| 运输中 | IN_TRANSIT | 货物运输中 |
| 待收货 | WAITING_FOR_RECEIVING | 货物已到达，等待收货（显示为"Pending Receipt"） |
| 收货中 | RECEIVING | 正在收货中（显示为"Receiving"） |
| 部分收货 | PARTIAL_RECEIPT | 部分收货完成 |
| 已关闭 | CLOSED | 全部收货完成，已关闭（原"已完成"） |
| 已取消 | CANCELLED | 被取消，不再履约 |
| 异常 | EXCEPTION | 需要人工处理的问题单（数量差异等） |

#### 2.1.2 运输状态（Shipping Status）

| 状态 | 英文标识 | 说明 |
|------|---------|------|
| 已发货 | SHIPPED | 已从供应商/仓库发出 |
| 运输中 | IN_TRANSIT | 承运商运输途中 |
| 已到达 | ARRIVED | 到仓/园区（Gate / Appointment / ET 到场） |
| 运输异常 | SHIPPING_EXCEPTION | 物流异常（延误、清关、丢件等） |

#### 2.1.3 收货状态（Receiving Status）

| 状态 | 英文标识 | 说明 |
|------|---------|------|
| 未收货 | NOT_RECEIVED | 还没收任何货 |
| 部分收货 | PARTIAL_RECEIVED | 有收货，但没收完 |
| 已收货 | RECEIVED | 收货全部完成 |

### 2.2 状态流转图

#### 主状态流转

```
NEW
  ↓ [发送给供应商/创建发货单]
IN_TRANSIT
  ↓ [标记送达]
WAITING_FOR_RECEIVING (显示为"Pending Receipt")
  ↓ [创建入库请求]
RECEIVING (显示为"Receiving")
  ↓ [部分收货完成]
PARTIAL_RECEIPT
  ↓ [继续收货]
RECEIVING
  ↓ [全部收货完成]
CLOSED (原"已完成")

[任意状态] → CANCELLED (取消)
[任意状态] → EXCEPTION (异常)
```

#### 运输状态流转

```
SHIPPED
  ↓ [运输中]
IN_TRANSIT
  ↓ [到达仓库]
ARRIVED

[任意状态] → SHIPPING_EXCEPTION (运输异常)
```

#### 收货状态流转

```
NOT_RECEIVED
  ↓ [开始收货]
PARTIAL_RECEIVED
  ↓ [完成收货]
RECEIVED
```

### 2.3 操作权限

#### NEW（新建）
- ✅ 发送给供应商
- ✅ 创建发货单
- ✅ 创建入库请求（根据仓库类型不同）
- ✅ 取消

#### IN_TRANSIT（运输中）
- ✅ 查看
- ✅ 创建发货单
- ✅ 标记送达（Mark Arrived）

#### WAITING_FOR_RECEIVING（待收货）
- ✅ 查看
- ✅ 创建发货单
- ✅ 创建入库请求

#### RECEIVING（收货中）
- ✅ 查看
- ✅ 创建发货单

#### PARTIAL_RECEIPT（部分收货）
- ✅ 查看
- ✅ 创建发货单
- ✅ 创建入库请求（继续收货）

#### CLOSED（已关闭）
- ✅ 查看
- ✅ 复制

#### CANCELLED（已取消）
- ✅ 查看
- ✅ 重新打开
- ✅ 复制

#### EXCEPTION（异常）
- ✅ 查看
- ✅ 重新打开
- ✅ 复制
- ✅ 查看原因

### 2.4 仓库类型区分

系统根据仓库类型提供不同的收货流程：

#### 本地仓库（Local Warehouse）
- 一步完成入库和收货
- 通过弹窗操作
- 填写收货数量、库位、批次号、序列号等信息
- 保存后自动完成入库和收货
- **只有本地仓库才显示"收货"操作**

#### 第三方仓库（Third Party Warehouse）
- 分步操作
- 先创建入库请求
- 再完成收货确认
- **不显示"收货"操作**（由第三方仓库系统处理）

---

## 3. 入库请求（Receipt）业务流程

### 3.1 状态定义

| 状态 | 英文标识 | 显示名称 | 说明 |
|------|---------|---------|------|
| 新建 | NEW | New | 刚创建的入库请求 |
| 待收货 | PENDING | Pending Receipt | 已推送到仓库，等待处理 |
| 收货中 | IN_RECEIVING | Receiving | 正在收货中 |
| 部分收货 | PARTIALLY_RECEIVED | Partially Received | 部分收货完成 |
| 已关闭 | CLOSED | Closed | 全部收货完成，已关闭（原"已完成"） |
| 异常 | EXCEPTION | Exception | 出现异常情况 |
| 已取消 | CANCELLED | Cancelled | 入库请求被取消 |

### 3.2 状态流转图

```
NEW
  ↓ [推送到仓库] (仅手动创建)
PENDING (显示为"Pending Receipt")
  ↓ [开始收货] (仅本地仓库)
IN_RECEIVING (显示为"Receiving")
  ↓ [部分收货完成]
PARTIALLY_RECEIVED
  ↓ [继续收货] (仅本地仓库)
IN_RECEIVING
  ↓ [全部收货完成]
CLOSED (原"已完成")

[任意状态] → EXCEPTION (异常)
[任意状态] → CANCELLED (取消)
```

### 3.3 入库请求类型

- **常规入库**（REGULAR）
- **转运**（TRANSLOAD）
- **终端用户退货**（RETURN_FROM_END_USER）
- **库存入库**（INVENTORY_RECEIPT）
- **客户调拨**（CUSTOMER_TRANSFER）

### 3.4 来源

- **手动创建**（MANUAL）：可以推送到仓库
- **EDI导入**（EDI）：不能推送到仓库
- **系统自动创建**（SYSTEM_AUTO）：不能推送到仓库

### 3.5 自动收货

- **是**（YES）：启用自动收货，需要填写库位
- **否**（NO）：手动收货

### 3.6 操作权限

**重要说明：**
- **收货操作**：只有本地仓库（LOCAL_WAREHOUSE）才显示"收货"操作
- **推送到仓库操作**：只有手动创建（source === "MANUAL"）的入库请求才显示"推送到仓库"操作

#### NEW（新建）
- ✅ 编辑
- ✅ 推送到仓库（Send to Warehouse，仅手动创建：source === "MANUAL"）
- ✅ 收货（Receiving，仅本地仓库：warehouseType === "LOCAL_WAREHOUSE"）
- ✅ 取消

#### PENDING（待收货）
- ✅ 收货（Receiving，仅本地仓库：warehouseType === "LOCAL_WAREHOUSE"）

#### IN_RECEIVING（收货中）
- ✅ 收货（Receiving，仅本地仓库：warehouseType === "LOCAL_WAREHOUSE"）

#### PARTIALLY_RECEIVED（部分收货）
- ✅ 收货（Receiving，继续收货，仅本地仓库：warehouseType === "LOCAL_WAREHOUSE"）

#### CLOSED（已关闭）
- ✅ 复制（列表页）
- ✅ 下载（详情页）

#### EXCEPTION（异常）
- ✅ 解决异常（列表页）

#### CANCELLED（已取消）
- ✅ 复制（列表页）

### 3.7 收货信息

入库请求包含以下收货信息：

- **收货数量**（Receiving Quantity）
- **库位**（Location）
- **批次号**（Batch No）
- **序列号**（Serial No）
- **托盘数量**（Pallet Count）
- **收货备注**（Notes）

---

## 4. 已收货（Receipt Confirm）业务流程

### 4.1 状态定义

| 状态 | 英文标识 | 说明 |
|------|---------|------|
| 已关闭 | CLOSED | 收货已完成，已关闭（原"已完成"） |
| 部分收货 | PARTIAL | 部分收货完成 |
| 异常 | EXCEPTION | 收货异常 |

### 4.2 收货类型

- **常规收货**（REGULAR_RECEIPT）
- **退货**（RETURN）
- **越库**（XDOCK）

### 4.3 业务流程

#### 4.3.1 本地仓库收货流程

**一步完成入库和收货**

1. 在PO列表中选择本地仓库的PO
2. 点击"创建入库请求"
3. 弹出本地仓库收货对话框
4. 填写收货信息：
   - 收货数量（必填）
   - 库位
   - 批次号
   - 序列号
   - 备注
5. 填写总备注
6. 点击"保存并完成"
7. 系统自动完成：
   - 创建入库请求
   - 完成收货确认
   - 更新PO状态
   - 更新库存

**特点：**
- 操作简单，一步完成
- 适合本地仓库快速收货场景
- 减少操作步骤，提高效率

#### 4.3.2 第三方仓库收货流程

**分步操作**

**第一步：创建入库请求**

1. 在PO列表中选择第三方仓库的PO
2. 点击"创建入库请求"
3. 跳转到入库请求创建页面
4. 填写入库请求信息：
   - 入库请求类型
   - 货主
   - 仓库
   - 关联单号（PO号）
   - 运输信息
   - 明细行（从PO自动填充）
5. 保存入库请求
6. 状态变为 NEW

**第二步：推送到仓库**

1. 在入库请求列表中选择入库请求
2. 点击"推送到仓库"
3. 状态变为 PENDING

**第三步：完成收货**

1. 在入库请求详情页点击"收货"
2. 填写收货信息：
   - 收货数量
   - 库位
   - 批次号
   - 序列号
   - 托盘数量
   - 备注
3. 点击"确认完成收货"
4. 系统更新：
   - 入库请求状态
   - 收货确认单
   - PO状态
   - 库存

**特点：**
- 分步操作，流程清晰
- 适合第三方仓库的复杂收货场景
- 可以多次收货，支持部分收货

### 4.4 收货确认单信息

收货确认单包含以下信息：

- **收货参考号**（Receipt Reference No）
- **仓库**（Facility）
- **PO单号**（PO No）
- **收货时间**（Received Time）
- **收货类型**（Receipt Type）
- **状态**（Status）
- **运输方式**（Shipping Method）
- **承运商**（Carrier）
- **追踪号**（Tracking Number）
- **集装箱号**（Container No）
- **封号**（Seal）
- **收货明细**（Items）

---

## 5. 业务流程关联关系

### 5.1 PR → PO

```
PR (APPROVED)
  ↓ [生成PO]
PO (NEW)
```

**说明：**
- 一个PR可以生成一个或多个PO
- 多个PR可以合并成一个PO
- PR状态会更新为 PARTIAL_PO 或 FULL_PO

### 5.2 PO → Receipt

```
PO (WAITING_FOR_RECEIVING)
  ↓ [创建入库请求]
Receipt (NEW)
  ↓ [推送到仓库] (仅手动创建)
Receipt (PENDING)
  ↓ [收货] (仅本地仓库)
Receipt (CLOSED)
  ↓ [更新PO状态]
PO (CLOSED)
```

**说明：**
- 一个PO可以创建多个入库请求（支持分批收货）
- 入库请求完成后，会更新PO的收货状态
- **推送到仓库**：只有手动创建的入库请求才显示此操作
- **收货操作**：只有本地仓库的入库请求才显示此操作

### 5.3 Receipt → Receipt Confirm

```
Receipt (IN_RECEIVING)
  ↓ [完成收货]
Receipt Confirm (CLOSED)
```

**说明：**
- 完成收货时自动创建收货确认单
- 收货确认单记录实际收货信息

### 5.4 本地仓库特殊流程

```
PO (WAITING_FOR_RECEIVING)
  ↓ [创建入库请求（弹窗）]
  ↓ [一步完成入库和收货]
Receipt Confirm (CLOSED)
  ↓ [更新PO状态]
PO (CLOSED)
```

**说明：**
- 本地仓库跳过入库请求的中间状态
- 直接完成入库和收货

---

## 6. 特殊场景处理

### 6.1 部分收货

**场景：** 供应商分批发货，需要多次收货

**处理方式：**
1. PO状态变为 PARTIAL_RECEIPT
2. 可以继续创建入库请求进行收货（仅本地仓库显示收货操作）
3. 直到全部收货完成，状态变为 CLOSED（原"已完成"）

### 6.2 异常处理

**场景：** 收货数量与预期不符、货物损坏等

**处理方式：**
1. 状态变为 EXCEPTION
2. 需要人工处理
3. 填写异常说明
4. 处理完成后更新状态

### 6.3 取消流程

**场景：** 需要取消PR、PO或入库请求

**处理方式：**
1. PR可以取消（CANCELLED）
2. PO可以取消（CANCELLED）
3. 入库请求可以取消（CANCELLED）
4. 取消后状态变为只读

### 6.4 标记送达

**场景：** 货物已到达仓库，但尚未开始收货

**处理方式：**
1. 在PO列表中选择"标记送达"
2. PO状态从 IN_TRANSIT 变为 WAITING_FOR_RECEIVING
3. 运输状态变为 ARRIVED
4. 可以开始创建入库请求

### 6.5 批量操作

**支持的操作：**
- 批量导出
- 批量生成PO（PR）
- 批量标记送达（PO）
- 批量取消

---

## 7. 数据字段说明

### 7.1 PR关键字段

- **PR编号**（prNo）：系统生成的唯一编号
- **业务单号**（businessNo）：关联业务单号
- **业务实体**（businessEntity）：公司/实体
- **部门**（department）：申请部门
- **申请人**（requester）：申请人姓名
- **申请人工号**（requesterNo）：工号
- **当前审批人**（currentApprover）：审批人
- **PR类型**（prType）：常规采购/项目采购/备货/内部调拨
- **优先级**（priority）：普通/紧急/非常紧急
- **PO生成情况**（poGenerated）：未生成/部分生成/全部生成
- **期望交货日期**（expectedDeliveryDate）：最早到货日期
- **目标仓库**（targetWarehouses）：目标仓库列表
- **SKU数量**（skuCount）：需求SKU数量
- **总需求数量**（totalQty）：总需求数量
- **预计总金额**（estimatedAmount）：预计金额
- **币种**（currency）：货币类型

### 7.2 PO关键字段

- **PO编号**（orderNo）：系统生成的唯一编号
- **原始PO号**（originalPoNo）：外部系统的PO号
- **关联PR号**（prNos）：关联的PR编号列表
- **参考号**（referenceNo）：参考编号
- **供应商名称**（supplierName）：供应商
- **供应商编号**（supplierNo）：供应商编号
- **目的地**（destination）：目的地
- **仓库名称**（warehouseName）：仓库
- **仓库ID**（warehouseId）：仓库ID（用于判断仓库类型）
- **主状态**（status）：PO主状态
- **运输状态**（shippingStatus）：运输状态
- **收货状态**（receivingStatus）：收货状态
- **来源**（dataSource）：手动/PR转换/API导入
- **总订购数量**（totalOrderQty）：总订购数量
- **已发货数量**（shippedQty）：已发货数量
- **已收货数量**（receivedQty）：已收货数量
- **总价格**（totalPrice）：总价格
- **ASN数量**（asnCount）：关联的ASN数量

### 7.3 Receipt关键字段

- **入库请求单号**（receiptNo）：系统生成的唯一编号（RCP No.）
- **收货单号**（actualReceiptNo）：实际收货后生成（RC No.）
- **入库单号**（inboundReceiptNo）：入库单号（RN No.）
- **单据类型**（receiptType）：常规/转运/退货/库存入库/客户调拨
- **来源**（source）：手动/EDI/系统自动
- **货主**（title）：货主名称
- **关联单号**（relatedNo）：关联单号
- **自动收货**（autoReceiving）：是/否
- **供应商**（supplier）：供应商名称
- **PO单号**（poNo）：关联的PO单号
- **发货单号**（shipmentNo）：发货单号
- **运输方式**（transportMode）：运输方式
- **承运商**（carrier）：承运商
- **追踪号**（trackingNumber）：追踪号
- **预约时间**（appointmentTime）：预约时间
- **进场时间**（inYardTime）：进场时间
- **仓库**（warehouse）：仓库名称
- **状态**（status）：入库请求状态
- **预期数量**（expectedQty）：预期收货数量
- **已收货数量**（receivedQty）：已收货数量

### 7.4 Receipt Confirm关键字段

- **收货确认单ID**（receiptId）：唯一标识
- **收货参考号**（receiptReferenceNo）：收货参考号
- **仓库ID**（facility）：仓库ID
- **客户**（customer）：客户名称
- **承运商名称**（carrierName）：承运商
- **承运商SCAC**（carrierScac）：SCAC代码
- **货主ID**（titleId）：货主ID
- **集装箱号**（containerNo）：集装箱号
- **PO单号**（poNo）：关联的PO单号
- **收货时间**（receivedTime）：收货时间戳
- **收货类型**（receiptType）：常规收货/退货/越库
- **状态**（status）：已关闭（CLOSED）/部分收货（PARTIAL）/异常（EXCEPTION）
- **运输方式**（shippingMethod）：运输方式
- **进场时间**（inYardTime）：进场时间
- **集装箱尺寸**（containerSize）：集装箱尺寸
- **收货任务ID**（receiveTaskId）：收货任务ID
- **进站封号**（inboundSeal）：进站封号
- **出站封号**（outboundSeal）：出站封号
- **封号不匹配标志**（sealMismatchFlag）：封号是否匹配

---

## 8. 业务流程总结

### 8.1 完整流程示例

**场景：从采购申请到完成收货**

1. **创建PR**
   - 用户创建采购申请（DRAFT）
   - 填写需求信息、商品明细

2. **提交审批**
   - 提交PR（SUBMITTED）
   - 提交审批（APPROVING）
   - 审批通过（APPROVED）

3. **生成PO**
   - 从PR生成PO（NEW）
   - PO关联PR编号

4. **发货**
   - 创建发货单
   - PO状态变为 IN_TRANSIT
   - 运输状态变为 SHIPPED → IN_TRANSIT

5. **到达仓库**
   - 标记送达（Mark Arrived）
   - PO状态变为 WAITING_FOR_RECEIVING
   - 运输状态变为 ARRIVED

6. **创建入库请求**
   - **本地仓库**：弹窗一步完成入库和收货
   - **第三方仓库**：创建入库请求（NEW）→ 推送到仓库（PENDING）

7. **完成收货**
   - **本地仓库**：在弹窗中填写收货信息，保存后自动完成（只有本地仓库显示收货操作）
   - **第三方仓库**：由第三方仓库系统处理，不显示收货操作
   - 创建收货确认单（CLOSED）

8. **更新状态**
   - PO状态变为 CLOSED（原"已完成"）
   - Receipt状态变为 CLOSED（原"已完成"）
   - 收货状态变为 RECEIVED
   - PR状态变为 FULL_PO → CLOSED

### 8.2 关键决策点

1. **仓库类型判断**
   - 根据 warehouseId 判断是本地仓库还是第三方仓库
   - 决定使用哪种收货流程

2. **状态更新时机**
   - 创建入库请求时更新PO状态
   - 完成收货时更新PO和Receipt状态
   - 自动计算部分收货/全部收货

3. **异常处理**
   - 收货数量差异
   - 货物损坏
   - 运输异常
   - 需要人工介入处理

---

## 9. 附录

### 9.1 状态枚举定义

详见 `lib/enums/po-status.ts`

### 9.2 相关页面

- PR列表：`app/purchase/pr/page.tsx`
- PR详情：`app/purchase/pr/[id]/page.tsx`
- PO列表：`app/purchase/po/page.tsx`
- PO详情：`app/purchase/po/[id]/page.tsx`
- 入库请求列表：`app/purchase/receipts/page.tsx`
- 入库请求创建：`app/purchase/receipts/create/page.tsx`
- 入库请求详情：`app/purchase/receipts/[id]/page.tsx`
- 已收货列表：`app/purchase/receipt-confirm/page.tsx`
- 本地仓库收货弹窗：`components/purchase/local-warehouse-receipt-dialog.tsx`

**重要更新说明：**
- 所有列表页面的状态列已调整为第二列
- 状态显示名称已更新（IN_RECEIVING → Receiving，WAITING_FOR_RECEIVING → Pending Receipt，COMPLETED → CLOSED）
- 操作权限已更新（收货操作仅本地仓库，推送到仓库仅手动创建）
- 列名规范已更新（RCP No., RN No., RC No.）
- 菜单名称已更新（Receipts, Shipments, History）

### 9.3 更新日志

- 2024-01-XX：初始版本，基于系统实现整理
- 2024-01-XX：更新状态名称（COMPLETED → CLOSED，IN_RECEIVING → Receiving，WAITING_FOR_RECEIVING → Pending Receipt）
- 2024-01-XX：更新操作权限说明（收货操作仅本地仓库，推送到仓库仅手动创建）
- 2024-01-XX：更新列名规范（RCP No., RN No., RC No.）
- 2024-01-XX：更新菜单名称（Receipts, Shipments, History）

---

**文档版本：** 1.0  
**最后更新：** 2024-01-XX  
**维护者：** OMS开发团队

