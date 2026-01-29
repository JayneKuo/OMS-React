# 采购订单 (PO) 模块需求分析

## 1. 需求概览
采购订单模块管理从创建到完成的整个采购生命周期。支持多种采购类型（标准采购、工厂直发）、多币种、税费计算，并追踪发货和收货状态。通过收货操作与库存管理系统集成。

### 核心逻辑
- **采购类型**:
    - **标准采购 (Standard)**: 货物发往选定的仓库。
    - **工厂直发 (Factory Direct)**: 货物直接从工厂发货，可能途经成品仓 (Finished Goods Warehouse) 中转。
- **状态管理**: 同时追踪三个维度的状态:
    - **PO 状态 (Main Status)**: 整体生命周期 (新建 -> ... -> 已关闭)。
    - **物流状态 (Shipping Status)**: 物流运输进度 (未发货 -> ... -> 已到达)。
    - **收货状态 (Receiving Status)**: 仓库入库进度 (未收货 -> ... -> 已收货)。
- **操作逻辑**: 根据当前状态动态显示可用操作（例如，"发送"操作仅在 PO 状态为"新建"时可用）。

---

## 2. 状态与操作对照表

### 2.1 状态定义

| 状态分类 | 状态 Key | 显示名称 (CN) | 描述 |
| :--- | :--- | :--- | :--- |
| **PO 主状态** | `NEW` | 新建 | 刚创建，尚未执行 |
| | `PROCESSING` | 处理中 | 通用处理中状态，涵盖运输和收货过程 |
| | `IN_TRANSIT` | 运输中 | 货物运输中 |
| | `WAITING_FOR_RECEIVING` | 待收货 | 货物已到达，等待收货 |
| | `RECEIVING` | 收货中 | 正在进行收货作业 |
| | `PARTIAL_RECEIPT` | 部分收货 | 已完成部分收货 |
| | `COMPLETED` | 已完成 | 流程完成 |
| | `CLOSED` | 已关闭 | 全部收货并关闭 |
| | `CANCELLED` | 已取消 | 订单已取消，不再执行 |
| | `EXCEPTION` | 异常 | 需要人工处理的异常状态 |
| **物流状态** | `NOT_SHIPPED` | 未发货 | 尚未发货 |
| | `ASN_CREATED` | ASN已创建 | ASN 已创建，准备发货 |
| | `SHIPPED` | 已发货 | 供应商/仓库已发货 |
| | `IN_TRANSIT` | 运输中 | 承运商运输中 |
| | `ARRIVED` | 已到达 | 已到达目的仓库 |
| | `SHIPPING_EXCEPTION` | 运输异常 | 运输过程发生异常 (延误等) |
| **收货状态** | `NOT_RECEIVED` | 未收货 | 尚未收到货物 |
| | `PARTIAL_RECEIVED` | 部分收货 | 收到部分货物，未收全 |
| | `FULLY_RECEIVED` | 全部收货 | 全部收到 |
| | `RECEIVED` | 已收货 | 全部收到 (旧状态兼容) |
| | `OVER_RECEIVED` | 超量收货 | 实收数量超过订购数量 |

### 2.2 操作映射表

| 当前 PO 状态 | 可用操作 | 动作描述 | 条件 / 备注 |
| :--- | :--- | :--- | :--- |
| **NEW (新建)** | 发送 (Send) | 打开 `发送 PO` 弹窗 | |
| | 创建发货 (Create Shipment) | 跳转至发货创建页面 | |
| | 创建收货 (Create Receipt) | 打开 `收货` 弹窗 (本地仓) 或 跳转 (第三方仓) | "本地仓"：直接弹窗收货；"第三方仓"：跳转至入库请求页面。 |
| | 取消 (Cancel) | 取消 PO | |
| **PROCESSING (处理中)** | 查看 (View) | 跳转至 PO 详情页 | 始终可用 |
| *(IN_TRANSIT / WAITING_FOR_RECEIVING / RECEIVING / PARTIAL_RECEIPT)* | 发送 (Send) | 打开 `发送 PO` 弹窗 | **条件**: `sentToSupplier = false` (未发送邮件) |
| | 创建发货 (Create Shipment) | 跳转至发货创建页面 | **条件**: `shippedQty < totalOrderQty` (未全部发运) |
| | 标记到达 (Mark Arrived) | 更新物流状态为 `ARRIVED` | **条件**: `shippingStatus != ARRIVED` (物流未到达) |
| | 创建收货 (Create Receipt) | 打开 `收货` 弹窗 (本地仓) 或 跳转 (第三方仓) | **条件**: `receivedQty < totalOrderQty` (未全部收货) |
| **CLOSED (已关闭)** | 查看 (View) | 跳转至 PO 详情页 | |
| | 复制 (Copy) | 复制并创建新 PO | |
| **CANCELLED (已取消)** | 查看 (View) | 跳转至 PO 详情页 | |
| | 重新打开 (Reopen) | 重新激活 PO | |
| | 复制 (Copy) | 复制并创建新 PO | |
| **EXCEPTION (异常)** | 查看 (View) | 跳转至 PO 详情页 | |
| | 重新打开 (Reopen) | 重新激活 PO | |
| | 复制 (Copy) | 复制并创建新 PO | |
| | 查看原因 (View Reason) | 显示异常详细信息 | |

### 2.3 PROCESSING 状态操作条件详解

PROCESSING 状态下的操作是动态的，根据以下条件判断：

| 操作 | 判断条件 | 说明 |
| :--- | :--- | :--- |
| **发送 (Send)** | `sentToSupplier === false` | 只有未发送过邮件的 PO 才显示发送按钮 |
| **创建发货 (Create Shipment)** | `shippedQty < totalOrderQty` | 已发运数量小于订单总数量时可创建发运 |
| **标记到达 (Mark Arrived)** | `shippingStatus !== 'ARRIVED'` | 物流状态不是"已到达"时可标记 |
| **创建收货 (Create Receipt)** | `receivedQty < totalOrderQty` | 已收货数量小于订单总数量时可创建入库单 |

---

## 3. 列表字段 (数据表格)

| 字段 ID | 表头名称 | 默认可见 | 备注 |
| :--- | :--- | :--- | :--- |
| `orderNo` | PO 单号 |可见 | 可点击，跳转至详情页。 |
| `status` | 状态 | 可见 | Badge 徽标组件。 |
| `originalPoNo` | 原始 PO 单号 | 可见 | |
| `referenceNo` | 参考单号 | 可见 | |
| `shippingStatus` | 物流状态 | 可见 | Badge 徽标组件。 |
| `receivingStatus` | 收货状态 | 可见 | Badge 徽标组件。 |
| `supplierName` | 供应商 | 可见 | |
| `warehouseName` | 仓库 | 可见 | 如果类型为 LOCAL，显示 "本地仓库"。 |
| `totalOrderQty` | 订单总数 | 可见 | |
| `shippedQty` | 已发数量 | 隐藏 | 显示数量及百分比。 |
| `receivedQty` | 已收数量 | 隐藏 | 显示数量及百分比。 |
| `asnCount` | ASN 数量 | 隐藏 | |
| `dataSource` | 来源 | 可见 | 手工 (Manual), 请购单转换 (PR Conversion), API 导入。 |
| `sentToSupplier` |发送供应商 | 可见 | 显示 "Sent" 徽标 + 发送日期。 |
| `totalPrice` | 总金额 | 可见 | 带币种格式化。 |
| `created` | 创建时间 | 可见 | |
| `expectedArrivalDate`| 预计到达 | 可见 | |
| `prNos` | PR 单号 | 隐藏 | 关联的采购申请单号。 |
| `exceptions` | 异常信息 | 隐藏 | 如有异常显示警告图标。 |
| `shippingCarrier` | 承运商 | 隐藏 | |
| `toCity` | 城市 | 隐藏 | 目的城市。 |
| `toState` | 省/州 | 隐藏 | 目的省/州。 |
| `toCountry` | 国家 | 隐藏 | 目的国家。 |
| `updated` | 更新时间 | 隐藏 | |
| `shippingService` | 运输服务 | 隐藏 | 等级 (Standard, Express 等)。 |
| `shippingNotes` | 物流备注 | 隐藏 | |
| `purchaseOrderDate` | 采购日期 | 隐藏 | |

---

## 4. PO 创建字段

### 4.1 基础信息 (Basic Information)
- **PO 单号**: 自动生成 (创建时只读)。
- **供应商**: 下拉选择 (必填)。
- **采购类型**: 下拉选择 (标准采购 / 工厂直发)。
- **参考单号**: 文本输入。
- **币种**: 下拉选择。
- **汇率**: 数值。
- **标签**: 多选。
- **备注**: 文本区域。

### 4.2 物流条款 (Logistics Terms)
- **交货日期**: 日期时间 (必填)。
- **最晚发运时间**: 日期时间 (必填)。
- **运输方式**: 下拉选择 (空运 Air, 海运 Ocean, 陆运 Truck, 快递 Express)。
- **运费条款**: 下拉选择 (到付 Collect, 预付 Prepaid)。
- **贸易条款**: 下拉选择 (FOB, CIF, EXW, DDP)。

### 4.3 地址信息 (Address Information)
**收货地址 (Receiving Address)**:
- **仓库**: 下拉选择 (必填)。
- **联系人**, **部门**, **电话**, **邮箱**。
- **位置详情**: 国家 (必填), 省/州 (必填), 城市 (必填), 邮编, 地址行1 (必填), 地址行2。

**发货地址 (Shipping Address)** (根据采购类型自动填充或修改):
- **工厂直发配置** (仅当采购类型 = 工厂直发时显示):
    - **物流路径**: 经成品库 (Via Finished Goods Warehouse) / 直发 (Direct)。
    - **工厂**: 下拉选择。
    - **成品库**: 下拉选择 (如果路径为"经成品库")。
- **联系信息**: 联系人, 部门, 电话, 邮箱。
- **位置详情**: 国家, 省/州, 城市, 邮编, 地址行1, 地址行2。

### 4.4 产品明细 (Product Lines)
- **产品**: 下拉选择 (SKU/名称)。
- **尺寸**: 长, 宽, 高, 体积 (自动计算/可覆盖)。
- **数量**: 数值 (必填)。
- **单位 (UOM)**: 下拉选择 (PCS, SET, BOX, PACK)。
- **单价**: 数值。
- **税率**: % (0-100)。
- **金额**: 税额 (自动), 行金额 (自动)。
- **管理属性**:
    - **SN 管理**: 开关 (是否需要序列号)。
    - **批次管理**: 开关 (是否需要批次号)。
    - **SN/批次列表**: 通过弹窗管理。
- **供应商备注**: 文本。

---

## 5. 操作弹窗字段

### 5.1 发送 PO 弹窗 (`POSendDialog`)
- **发件人 (From)**: 邮箱 (必填, 默认为用户/公司邮箱)。
- **收件人 (To)**: 邮箱 (必填, 默认为供应商邮箱)。支持多个标签。
- **抄送 (CC)**: 邮箱。
- **主题 (Subject)**: 文本 (必填)。
- **邮件正文 (Message)**: 文本区域。
- **PDF 模板**: 下拉选择 (标准, 详细等)。
- **公司信息**: 可折叠区域，用于覆盖 PDF 中的公司地址/电话信息。

### 5.2 本地仓收货弹窗 (`LocalWarehouseReceiptDialog`)
**头部信息**: PO 单号, 供应商, 仓库名称。
**明细表格列**:
- **产品信息**: SKU, 名称, 规格。
- **订购数量**: 只读。
- **已收数量**: 之前已收的数量。
- **本次收货 (Receiving Qty)** (输入框): 本次实收数量。校验：不能超过 (订购 - 已收)。
- **单位**: 只读。
- **库位 (Location)** (输入框): 仓库库位代码。
- **批次号 (Batch No)** (输入框): 如开启批次管理则填写。
- **序列号 (Serial No)** (输入框): 如开启 SN 管理则填写。
- **备注 (Notes)** (输入框): 行备注。

**底部**:
- **备注 (Remark)**: 整单收货备注。

### 5.3 校验与提示
- **数量检查**: "收货数量不能超过剩余数量"。
- **必填检查**: "请输入收货数量"。
- **邮箱校验**: "Invalid email address" (无效的邮箱地址)。
- **成功提示**: "收货确认单创建成功，入库和收货已完成", "Email sent successfully"。

---

## 6. PO 详情页

### 6.1 整体布局结构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          页面头部 (Header)                           │
│  [返回] PO单号 + 状态Badge    [编辑] [发送] [下载] [更多操作]          │
├─────────────────────────────────────────────────────────────────────┤
│                      PO 状态进度条 (Progress Steps)                  │
│         ●──────────●──────────●──────────○                          │
│        新建      处理中      已关闭    (或 已取消/异常)               │
├───────────────────────────────────────────┬─────────────────────────┤
│              左侧主内容区 (2/3)            │    右侧信息区 (1/3)      │
│  ┌─────────────────────────────────────┐  │  ┌───────────────────┐  │
│  │ [Items] [Receipts] [Shipments] ...  │  │  │ 路由历史 (Timeline)│  │
│  ├─────────────────────────────────────┤  │  ├───────────────────┤  │
│  │                                     │  │  │ 事件历史 (Timeline)│  │
│  │           Tab 内容区域               │  │  ├───────────────────┤  │
│  │                                     │  │  │ 信息 Tabs         │  │
│  │                                     │  │  │ [订单][供应商]    │  │
│  │                                     │  │  │ [地址][物流]      │  │
│  └─────────────────────────────────────┘  │  └───────────────────┘  │
└───────────────────────────────────────────┴─────────────────────────┘
```

---

### 6.2 页面头部 (Header)

| 元素 | 说明 |
| :--- | :--- |
| 返回按钮 | 返回 PO 列表页 |
| PO 单号 | 显示 PO 单号，支持复制 |
| 状态 Badge | 显示当前 PO 主状态 |
| 编辑按钮 | 跳转编辑页面 (仅 NEW 状态可用) |
| 发送按钮 | 打开发送邮件弹窗 |
| 下载按钮 | 下载 PO PDF |
| 更多操作 | 下拉菜单：取消、复制等 |

---

### 6.3 PO 状态进度条 (Progress Steps)

**位置**: 页面头部下方，横向展示

**进度节点**:
| 步骤 | 名称 | 状态 Key | 触发条件 |
| :--- | :--- | :--- | :--- |
| 1 | 新建 (New) | `NEW` | PO 创建成功 |
| 2 | 处理中 (Processing) | `PROCESSING` | 创建任一发货单或收货单 |
| 3 | 已关闭 (Closed) | `CLOSED` | 全部收货完成 或 手动关单 |

**特殊状态节点** (替代正常流程):
| 状态 | 名称 | 显示方式 |
| :--- | :--- | :--- |
| `CANCELLED` | 已取消 | 红色节点，替代后续步骤 |
| `EXCEPTION` | 异常 | 红色节点，替代后续步骤 |

**节点样式**:
- ✓ 绿色实心圆 = 已完成
- ● 蓝色脉冲圆 = 当前步骤
- ○ 灰色空心圆 = 待处理
- ✕ 红色圆 = 已取消/异常

**状态回退规则**:
| 场景 | 状态变化 | 说明 |
| :--- | :--- | :--- |
| 取消发货单/收货单后，PO 下仍有有效单据 | 保持 `PROCESSING` | 进度条保持在"处理中"节点 |
| 取消发货单/收货单后，PO 下无有效单据 | 回退到 `NEW` | 进度条回退到"新建"节点 |

---

### 6.4 左侧主内容区 (2/3 宽度)

包含 5 个 Tab 页签：

#### 6.4.1 Items Tab (产品明细)

**功能**: 显示 PO 行项目列表

**表格字段**:
| 字段 | 说明 |
| :--- | :--- |
| Line No | 行号 |
| SKU | 产品编码 |
| Product Name | 产品名称 |
| Specifications | 规格 |
| Quantity | 订购数量 |
| UOM | 单位 |
| Unit Price | 单价 |
| Line Amount | 行金额 |
| Shipped Qty | 已发数量 |
| Received Qty | 已收数量 |
| Returned Qty | 已退数量 |

**底部汇总**: 显示总数量、总金额

---

#### 6.4.2 Warehouse Receipts Tab (仓库收货)

**功能**: 管理收货记录，支持推送到仓库

**布局**: 左右分栏 (1/4 列表 + 3/4 详情)

**左侧 - 收货列表**:
- 搜索框：按单号、仓库、人员搜索
- 列表项显示：
  - 收货单号 (字体加粗)
  - 收货状态 Badge
  - 推送状态 Badge (未推送显示橙色 "Not Pushed")
  - 仓库名称
  - 库位

**右侧 - 收货详情** (选中某条记录后显示):

**(1) 头部信息**:
- 收货单号 + 状态 Badge
- 收货时间

**(2) 收货进度条**:
| 步骤 | 名称 | 对应状态 |
| :--- | :--- | :--- |
| 1 | New | `NEW` |
| 2 | Pending Receipt | `PENDING_RECEIPT` |
| 3 | Receiving | `RECEIVING` |
| 4 | Closed | `CLOSED` |

**(3) 基本信息卡片**:
| 字段 | 说明 |
| :--- | :--- |
| 收货人 | 操作人员姓名 |
| 收货时间 | 收货操作时间 |
| 关联发货单 | 对应的发货单号 |
| 仓库库位 | 入库库位代码 |

**(4) 质检信息卡片**:
| 字段 | 说明 |
| :--- | :--- |
| 质检状态 | PASSED/PARTIAL_DAMAGE/FAILED/PENDING |
| 损坏数量 | 损坏货物数量 |
| 拒收数量 | 拒收货物数量 |

**(5) 推送信息卡片**:
| 字段 | 说明 |
| :--- | :--- |
| 推送状态 | 是否已推送到 WMS |
| 推送时间 | 推送到仓库的时间 |
| WMS 单号 | 仓库系统返回的单号 |

**(6) 操作按钮**:
| 按钮 | 显示条件 | 功能 |
| :--- | :--- | :--- |
| Push to Warehouse | `pushedToWarehouse === false` | 推送到仓库系统 |
| Download | `pushedToWarehouse === true` | 下载收货单据 |

---

#### 6.4.3 Receipt Confirmation Tab (收货确认)

**功能**: 显示收货确认详情

**内容**:
- 确认单号
- 确认时间
- 确认人
- 确认明细列表

---

#### 6.4.4 Shipment Tracking Tab (发货追踪)

**功能**: 显示发货记录列表和物流追踪

**布局**: 左右分栏 (列表 + 详情)

**发货记录字段**:
| 字段 | 说明 |
| :--- | :--- |
| 发货单号 | 唯一标识 |
| 发货数量 | 本次发货数量 |
| 承运商 | 物流公司 |
| 运单号 | 物流追踪号 |
| 发货状态 | SHIPPED/IN_TRANSIT/DELIVERED |
| 发货日期 | 发货时间 |
| 预计到达 | 预计到达时间 |

**运输方式特有字段**:
| 运输方式 | 特有字段 |
| :--- | :--- |
| 空运 (Air) | 航班号、航空公司、起飞/到达机场 |
| 海运 (Sea) | 船名、航次、集装箱号、装卸港 |
| 陆运 (Ground) | 车牌号、司机姓名、司机电话 |

---

#### 6.4.5 Email History Tab (邮件历史)

**功能**: 显示 PO 相关的邮件发送记录

**列表字段**:
| 字段 | 说明 |
| :--- | :--- |
| 发送时间 | 邮件发送时间 |
| 发件人 | 发送邮箱 |
| 收件人 | 接收邮箱列表 |
| 抄送 | CC 邮箱列表 |
| 主题 | 邮件主题 |
| 状态 | SENT/FAILED/PENDING |
| PDF 模板 | 使用的 PDF 模板 |
| 发送人 | 操作人员 |

**操作**: 点击可展开查看邮件正文

---

### 6.5 右侧信息区 (1/3 宽度)

包含 3 个卡片区域，垂直堆叠：

#### 6.5.1 Order Routing History (路由历史)

**功能**: 时间线显示 PO 路由变更记录

**时间线项目**:
| 字段 | 说明 |
| :--- | :--- |
| 时间戳 | 操作时间 |
| 操作类型 | Initial Routing / Route Modified / Route Confirmed / Carrier Assigned |
| 详细说明 | 路由变更描述 |
| 操作人 | 执行人员或系统 |

**样式**: 绿色圆点 + 垂直连接线

---

#### 6.5.2 Order Event History (事件历史)

**功能**: 时间线显示 PO 事件记录

**时间线项目**:
| 字段 | 说明 |
| :--- | :--- |
| 时间戳 | 事件时间 |
| 事件类型 | PO Created / Approved / Sent to Supplier / Shipment Created / Receipt Created 等 |
| 事件描述 | 事件详细说明 |
| 操作人 | 执行人员或系统 |

**样式**: 根据事件类型显示不同颜色

---

#### 6.5.3 Info Tabs (信息标签页)

**功能**: 4 个子 Tab 显示 PO 相关信息

**(1) Order Info Tab (订单信息)**:
| 字段 | 说明 |
| :--- | :--- |
| PO 单号 | 订单编号 |
| 原始 PO 单号 | 外部系统单号 |
| 参考单号 | 参考编号 |
| 创建时间 | 订单创建时间 |
| 更新时间 | 最后更新时间 |
| 预计到达 | 预计到达日期 |
| 付款条款 | NET 30 等 |
| 交货条款 | FOB 等 |
| 关联 PR | 关联的采购申请单号列表 |

**(2) Supplier Info Tab (供应商信息)**:
| 字段 | 说明 |
| :--- | :--- |
| 供应商名称 | 供应商公司名 |
| 供应商编码 | 供应商代码 |
| 联系人 | 联系人姓名 |
| 电话 | 联系电话 (可点击拨打) |
| 邮箱 | 联系邮箱 (可点击发送) |
| 地址 | 供应商地址 |

**(3) Address Info Tab (地址信息)**:
| 区域 | 字段 |
| :--- | :--- |
| 发货地址 | 联系人、电话、完整地址 |
| 收货地址 | 仓库名称、联系人、电话、完整地址 |

**(4) Logistics Tab (物流信息)**:
| 字段 | 说明 |
| :--- | :--- |
| 发货汇总 | 已发数量 / 总数量 |
| 收货汇总 | 已收数量 / 总数量 |
| 最新发货 | 最近一条发货记录摘要 |
| 最新收货 | 最近一条收货记录摘要 |

---

## 7. 收货记录 (Receipt) 功能

### 7.1 收货记录字段

| 字段 ID | 表头名称 | 说明 |
| :--- | :--- | :--- |
| `receiptNo` | 收货单号 | 唯一标识 |
| `wmsReceiptNo` | WMS收货单号 | 仓库系统单号，推送后生成 |
| `receivedQty` | 收货数量 | 本次收货数量 |
| `receivedBy` | 收货人 | 操作人员 |
| `receiptDate` | 收货时间 | 收货操作时间 |
| `relatedShipment` | 关联发货单 | 对应的发货单号 |
| `receiptStatus` | 收货状态 | NEW/IN_PROGRESS/CLOSED/PARTIAL_DAMAGE/REJECTED |
| `qualityStatus` | 质检状态 | PASSED/PARTIAL_DAMAGE/FAILED/PENDING |
| `warehouseLocation` | 仓库位置 | 入库库位 |
| `damageQty` | 损坏数量 | 损坏货物数量 |
| `rejectedQty` | 拒收数量 | 拒收货物数量 |
| `pushedToWarehouse` | 推送状态 | 是否已推送到仓库系统 |
| `pushedDate` | 推送时间 | 推送到仓库的时间 |
| `notes` | 备注 | 收货备注 |

### 7.2 收货单状态定义

| 状态 Key | 显示名称 (CN) | 显示名称 (EN) | 说明 |
| :--- | :--- | :--- | :--- |
| `NEW` | 新建 | New | 收货单已创建，待推送到 WMS |
| `PENDING_RECEIPT` | 待收货 | Pending Receipt | WMS 接收创建成功，等待仓库收货 |
| `RECEIVING` | 收货中 | Receiving | 仓库正在进行收货作业 |
| `PARTIAL_RECEIVED` | 部分收货 | Partial Received | 已收到部分货物 |
| `CLOSED` | 已关闭 | Closed | 收货完成并关闭 |
| `CANCELLED` | 已取消 | Cancelled | 收货单已取消 |
| `PARTIAL_DAMAGE` | 部分损坏 | Partial Damage | 部分货物损坏 |
| `REJECTED` | 已拒收 | Rejected | 货物被拒收 |

### 7.3 收货单状态流转

```
NEW (创建) 
  ↓ [推送到WMS成功]
PENDING_RECEIPT (待收货)
  ↓ [仓库开始收货]
RECEIVING (收货中)
  ↓ [收货完成]
  ├─→ CLOSED (全部收货)
  ├─→ PARTIAL_RECEIVED (部分收货)
  ├─→ PARTIAL_DAMAGE (部分损坏)
  └─→ REJECTED (拒收)

任意状态 → CANCELLED (取消)
```

**状态流转触发条件**：
| 当前状态 | 目标状态 | 触发条件 |
| :--- | :--- | :--- |
| `NEW` | `PENDING_RECEIPT` | 推送到 WMS 成功 |
| `PENDING_RECEIPT` | `RECEIVING` | 仓库开始收货作业 |
| `RECEIVING` | `CLOSED` | 全部货物收货完成 |
| `RECEIVING` | `PARTIAL_RECEIVED` | 部分货物收货完成 |
| `RECEIVING` | `PARTIAL_DAMAGE` | 发现部分货物损坏 |
| `RECEIVING` | `REJECTED` | 货物被拒收 |
| 任意状态 | `CANCELLED` | 用户取消收货单 |

### 7.4 收货单取消对 PO 状态的影响

当收货单被取消时，需要重新评估 PO 的状态：

**判断逻辑**：
| 场景 | PO 状态变化 | 说明 |
| :--- | :--- | :--- |
| PO 下还有其他有效的发货单或收货单 | 保持 `PROCESSING` | 只要存在任一有效单据，PO 继续处理中 |
| PO 下所有发货单和收货单都被取消 | 回退到 `NEW` | 无有效单据时，PO 回到初始状态 |

**有效单据定义**：
- 发货单状态不为 `CANCELLED` 的记录
- 收货单状态不为 `CANCELLED` 的记录

**状态回退流程图**：
```
收货单取消
    ↓
检查 PO 下是否存在有效单据
    ├─→ 存在有效发货单 → PO 保持 PROCESSING
    ├─→ 存在有效收货单 → PO 保持 PROCESSING
    └─→ 无任何有效单据 → PO 回退到 NEW
```

### 7.5 收货记录操作

| 操作 | 显示条件 | 说明 |
| :--- | :--- | :--- |
| **推送到仓库 (Push to Warehouse)** | `pushedToWarehouse === false` | 将收货记录推送到仓库系统，完成入库 |
| **下载 (Download)** | `pushedToWarehouse === true` | 下载收货单据 |

### 7.6 收货进度条

收货记录详情中显示收货进度，基于收货单状态动态展示：

| 步骤 | 名称 | 对应状态 | 说明 |
| :--- | :--- | :--- | :--- |
| 1 | New | `NEW` | 收货单已创建 |
| 2 | Pending Receipt | `PENDING_RECEIPT` | WMS 接收成功，等待收货 |
| 3 | Receiving | `RECEIVING` | 仓库收货中 |
| 4 | Closed | `CLOSED` / `PARTIAL_RECEIVED` | 收货完成 |

**特殊状态显示**：
- `CANCELLED`: 显示红色"已取消"节点
- `PARTIAL_DAMAGE`: 显示橙色"部分损坏"节点
- `REJECTED`: 显示红色"已拒收"节点

### 7.7 推送到仓库功能

**业务逻辑**:
- 收货记录创建后，默认 `pushedToWarehouse = false`
- 用户点击 "Push to Warehouse" 按钮后，系统调用仓库 API 推送数据
- 推送成功后，更新 `pushedToWarehouse = true`，记录 `pushedDate`
- 仓库系统返回 `wmsReceiptNo` (WMS收货单号)

**UI 显示**:
- 未推送时：收货列表项显示 "Not Pushed" 橙色标签
- 未推送时：详情区域显示 "Push to Warehouse" 主按钮
- 已推送时：详情区域显示 "Download" 按钮
- 已推送时：显示推送时间和 WMS 单号

---

## 8. PO 编辑操作逻辑场景

### 8.1 场景分类概览

PO 详情页的编辑操作需要根据订单执行状态（发货/收货实绩）动态控制，确保数据一致性和库存 (ATP) 准确性。

**核心概念**：
- **已执行实绩 (Executed Qty)**: 已发货或已入库的数量，不可逆
- **底线 (Floor)**: 修改数量时的最小允许值 = max(已发数量, 已收数量)
- **ATP (Available to Promise)**: 可承诺库存，需要与 PO 修改同步更新

### 8.2 数量修改场景

#### 场景 1: 加数量 (Increase Quantity)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 修改数量: 100 → 120 |
| **关联单据现状** | 50 入库 / 50 未动 |
| **前端交互** | ✅ 允许 (Enable) - 无视旧单据状态 |
| **界面反馈** | Loading → 成功提示 |
| **后台 ATP 动作** | 后置增加 (Post-Update) - 调通接口后再加 ATP |

#### 场景 2: 减数量 - 安全区 (Decrease - Safe Zone)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 修改数量: 100 → 80 |
| **关联单据现状** | 50 入库 / 50 未动 |
| **前端交互** | ✅ 允许 (Enable) - 目标值(80) > 底线(50) |
| **界面反馈** | Loading → 成功提示 |
| **后台 ATP 动作** | 抢跑扣减 (Pre-Deduct) - 先扣 ATP，失败再回滚 |

#### 场景 3: 减数量 - 穿底 (Decrease - Below Floor)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 修改数量: 100 → 40 |
| **关联单据现状** | 50 入库 / 50 未动 |
| **前端交互** | 🛑 阻断 (Block) - 触发 Input 校验 |
| **界面反馈** | 🔴 错误提示: "数量不能少于已执行实绩(50)。" |
| **后台 ATP 动作** | 无动作 (请求不发往后台) |

### 8.3 品类删除场景

#### 场景 4: 删除 SKU 行 - 无实绩 (Delete Line - No Execution)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 删除 SKU 行 |
| **关联单据现状** | 100 正在作业 (In-Progress) |
| **前端交互** | ✅ 允许 (Enable) - 后台尝试拦截 |
| **界面反馈** | Loading → "正在尝试拦截..." |
| **后台 ATP 动作** | 抢跑扣减 (先扣 ATP) |

#### 场景 5: 删除 SKU 行 - 有实绩 (Delete Line - Has Execution)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 删除 SKU 行 |
| **关联单据现状** | 20 已发 / 80 未动 |
| **前端交互** | ⚠️ 变性 (Transform) - 删除按钮变更为"结案" |
| **界面反馈** | 🟡 确认弹窗: "该行已有实绩，无法删除。是否关闭剩余 80 个？" |
| **后台 ATP 动作** | 抢跑扣减 (剩余量) - 只扣掉没发的 80 个 |

### 8.4 整单取消场景

#### 场景 6: 整单取消 - 完美 (Cancel Order - Clean)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 点击 [取消订单] |
| **关联单据现状** | 全单未动 (Tier 3) |
| **前端交互** | ✅ 允许 (Enable) |
| **界面反馈** | Loading → "订单已取消。" |
| **后台 ATP 动作** | 抢跑扣减 (全量) - ATP 全部释放 |

#### 场景 7: 整单取消 - 混合 (Cancel Order - Mixed)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 点击 [取消订单] |
| **关联单据现状** | 部分已发 / 部分未动 |
| **前端交互** | ⚠️ 降级 (Degrade) - 引导转为 [部分结案] |
| **界面反馈** | 🟡 引导弹窗: "订单包含已发运明细，无法整单作废。建议执行'结案'操作。" |
| **后台 ATP 动作** | 抢跑扣减 (剩余量) - 只扣掉没发的 ATP |

### 8.5 地址修改场景

#### 场景 8: 改地址 - 物流锁定 (Address Change - Shipping Locked)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 修改收货信息 |
| **关联单据现状** | 存在 已发运 (Shipped) |
| **前端交互** | 🚫 禁用 (Disable) - 输入框置灰 |
| **界面反馈** | 悬停提示 (Tooltip): "包裹已交给承运商，禁止修改。" |
| **后台 ATP 动作** | 无动作 |

#### 场景 9: 改地址 - 仓库作业 (Address Change - Warehouse Processing)

| 项目 | 说明 |
| :--- | :--- |
| **用户操作** | 修改收货信息 |
| **关联单据现状** | 存在 作业中 (In-Progress) |
| **前端交互** | ⚠️ 警示提交 (Confirm) - 允许改，但弹窗警告 |
| **界面反馈** | 🟡 风险弹窗: "包裹已打包/贴单，修改将导致仓库重新作业，是否继续？" |
| **后台 ATP 动作** | 状态锁定 (防止并发发货) |

### 8.6 前端交互类型汇总

| 交互类型 | 图标 | 说明 | 适用场景 |
| :--- | :--- | :--- | :--- |
| **允许 (Enable)** | ✅ | 正常操作，无阻断 | 场景 1, 2, 4, 6 |
| **阻断 (Block)** | 🛑 | 前端校验失败，不发请求 | 场景 3 |
| **变性 (Transform)** | ⚠️ | 操作按钮变更为其他操作 | 场景 5 |
| **降级 (Degrade)** | ⚠️ | 引导用户执行替代操作 | 场景 7 |
| **禁用 (Disable)** | 🚫 | 输入框/按钮置灰不可用 | 场景 8 |
| **警示提交 (Confirm)** | ⚠️ | 允许操作但需二次确认 | 场景 9 |

### 8.7 ATP 操作策略

| 策略 | 说明 | 适用场景 |
| :--- | :--- | :--- |
| **后置增加 (Post-Update)** | 接口成功后再增加 ATP | 加数量 |
| **抢跑扣减 (Pre-Deduct)** | 先扣 ATP，失败再回滚 | 减数量、删除、取消 |
| **状态锁定** | 锁定状态防止并发 | 地址修改时 |

### 8.8 UI 组件实现要点

**数量输入框校验**:
```typescript
// 校验逻辑
const validateQuantity = (newQty: number, executedQty: number) => {
  if (newQty < executedQty) {
    return {
      valid: false,
      message: `数量不能少于已执行实绩(${executedQty})。`
    }
  }
  return { valid: true }
}
```

**删除按钮动态变更**:
```typescript
// 根据实绩判断按钮类型
const getDeleteButtonConfig = (shippedQty: number, receivedQty: number) => {
  const hasExecution = shippedQty > 0 || receivedQty > 0
  return hasExecution 
    ? { label: "结案", variant: "warning", action: "close" }
    : { label: "删除", variant: "destructive", action: "delete" }
}
```

**地址输入框状态**:
```typescript
// 根据发货状态判断是否禁用
const getAddressFieldState = (shippingStatus: string) => {
  if (shippingStatus === 'SHIPPED' || shippingStatus === 'DELIVERED') {
    return { disabled: true, tooltip: "包裹已交给承运商，禁止修改。" }
  }
  if (shippingStatus === 'IN_PROGRESS') {
    return { disabled: false, requireConfirm: true }
  }
  return { disabled: false }
}
```

---

## 9. 实现文件参考

| 功能 | 文件路径 |
| :--- | :--- |
| PO 列表页 | `app/purchase/po/page.tsx` |
| PO 详情页 (v2) | `app/po-detail-v2/page.tsx` |
| PO 状态枚举 | `lib/enums/po-status.ts` |
| 发送 PO 弹窗 | `components/purchase/po-send-dialog.tsx` |
| PO 编辑弹窗 | `components/purchase/po-edit-dialog.tsx` |
| PO 取消弹窗 | `components/purchase/po-cancel-dialog.tsx` |
| 本地仓收货弹窗 | `components/purchase/local-warehouse-receipt-dialog.tsx` |
| 状态徽标组件 | `components/ui/status-badge.tsx` |
| Alert Dialog 组件 | `components/ui/alert-dialog.tsx` |
