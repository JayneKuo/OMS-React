 # OMS 业务表
                                                                                                                                                                                                                                                                                                                            
  ## 目录                                                                                                                                                                                                                                                                                                                   

  - [sales_order — 销售订单主表](#sales_order)
  - [sales_order_extension — 销售订单扩展](#sales_order_extension)
  - [sales_order_item — 销售订单商品行](#sales_order_item)
  - [order_dispatch — 订单拆单主表](#order_dispatch)
  - [order_dispatch_item — 订单拆单商品行](#order_dispatch_item)
  - [order_shipment — 履约单主表](#order_shipment)
  - [order_shipment_extension — 履约单扩展](#order_shipment_extension)
  - [order_shipment_item — 履约单商品行](#order_shipment_item)
  - [order_shipment_package — 履约包裹](#order_shipment_package)
  - [order_shipment_package_item — 履约包裹商品行](#order_shipment_package_item)
  - [order_shipment_pallet — 履约托盘](#order_shipment_pallet)
  - [order_shipment_pallet_item — 履约托盘商品行](#order_shipment_pallet_item)
  - [order_msg — 订单异常信息表](#order_msg)

  ---

  ## sales_order（销售订单主表）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键，自增 |
  | order_no | varchar(255) | 订单号 |
  | channel_sales_order_no | varchar(50) | 渠道订单号 |
  | automatic_shipping | tinyint | 是否自动发货 1是0非 |
  | merchant_no | varchar(50) | B端用户 customer code |
  | customer_code | varchar(50) | C端消费者 customer code |
  | channel_no | varchar(50) | 渠道ID，对应DI中channelNo |
  | channel_name | varchar(150) | 渠道名称 |
  | channel_code | varchar(128) | 渠道code |
  | data_channel | varchar(50) | 平台渠道枚举，如shopify |
  | status | int | OrderStatusV2Enum（见SKILL.md）|
  | order_time | datetime | 客户下单时间 |
  | purchase_order_no | varchar(256) | 采购单号 |
  | type | int | OrderTypeEnum: 1SalesOrder,2WorkOrder,3DeliveryOrder,4PurchaseOrder |
  | reference_no | varchar(50) | 上游订单号 |
  | ship_from_address_id | bigint | 发货地址ID |
  | ship_to_address_id | bigint | 收货地址ID |
  | bill_to_address_id | bigint | 账单地址ID |
  | total_amount | decimal(18,2) | 总金额 |
  | tax | decimal(18,2) | 税款 |
  | tax_rate | decimal(18,2) | 税率 |
  | sub_total_amount | decimal(18,2) | 小计 |
  | qty | int | 商品总数 |
  | discount | decimal(18,2) | 优惠 |
  | shipping_amount | decimal(18,2) | 运费 |
  | carrier_scac | varchar(50) | 承运商代码 |
  | carrier_name | varchar(100) | 承运商名称 |
  | delivery_service | varchar(100) | 运送服务 |
  | ship_method | varchar(50) | 运送服务类型 |
  | freight_term | varchar(50) | 运送方式 |
  | pay_account | varchar(100) | 付款账户 |
  | original_carrier | varchar(50) | 原始承运商 |
  | original_delivery_service | varchar(50) | 原始service |
  | original_ship_method | varchar(50) | 原始method |
  | original_freight_term | varchar(50) | 原始freight term |
  | remark | varchar(500) | 客户备注 |
  | request_ship_time | datetime | 最晚送达日期 |
  | request_pick_up_date | date | 最晚取货日期 |
  | request_pick_up_begin_time | datetime | 最早取货时间 |
  | request_pick_up_end_time | datetime | 最晚取货时间 |
  | load_date | datetime | 获取订单的时间 |
  | accounting_code | varchar(50) | 仓库code |
  | warehouse_channel_no | varchar(50) | 仓库渠道 |
  | ship_date | datetime | 发货日期 |
  | source | int | 来源 |
  | version | bigint | 版本号 |
  | shipping_label_channel | varchar(128) | 用于判断是否渠道打单 |
  | is_oms_calculated | tinyint | 是否为OMS自行计算 |

  ---

  ## sales_order_extension（销售订单扩展）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | order_no | varchar(255) | 订单号 |
  | merchant_no | varchar(50) | B端用户 customer code |
  | title_id | varchar(100) | 货主 |
  | title_name | varchar(200) | 货主名称 |
  | retailer | varchar(200) | 零售商 |
  | original_retailer | varchar(200) | 原始零售商 |
  | routed_date | datetime | 运输路由分配时间 |
  | ship_to_store_no | varchar(200) | 收货门店编号 |
  | ship_to_batch_code | varchar(200) | 发货批次编码 |
  | ship_to_home | tinyint | 送货上门 |
  | sold_to_address_id | bigint | 销售方地址ID |
  | store_address_id | bigint | 门店地址ID |
  | store_no | varchar(100) | 门店编号 |
  | bill_to_store_no | varchar(100) | 发票门店编号 |
  | bill_to_batch_code | varchar(200) | 发票批次编码 |
  | bill_to_home | tinyint | 发票送到门 |
  | signature_type | varchar(200) | 签名类型(ADULT/DIRECT/INDIRECT) |
  | total_cbft | decimal(18,2) | 总立方英尺 |
  | total_weight | decimal(10,0) | 总重量 |
  | label_note | text | 标签备注 |
  | shipping_instructions | text | 发货说明 |
  | delivery_instructions | text | 送货说明 |
  | customer_pallet_qty | int | 客人要求的托盘总数 |
  | pack_note | text | 打包备注 |
  | pick_note | text | 拣货备注 |
  | load_note | text | 装车备注 |
  | batch_no | varchar(200) | 批次号 |
  | bol_no | varchar(200) | 提货单 |
  | ship_not_before | datetime | 发货时间不得早于 |
  | ship_no_later | datetime | 发货时间不得晚于 |
  | mabd | datetime | 必须在日期前到达 |
  | bol_note | text | 提单指示 |
  | label_code | varchar(200) | 零售商纸箱UCC或托盘UCC标签 |
  | action_code | varchar(200) | 创建新订单还是取消订单 |
  | priority | varchar(200) | 优先级 |
  | supplier_id | varchar(100) | 供应商ID |
  | tms_id | varchar(200) | 运输管理系统编号 |
  | promo_code | varchar(200) | 折扣码 |
  | type_code | varchar(200) | 类型代码 |
  | dept_code | varchar(200) | 部门代码 |
  | gift_message | text | 礼物留言 |
  | retailer_authorization_number | varchar(200) | 零售商授权号码 |
  | inco_term | varchar(200) | 国际贸易术语(FOB/CIF/DAP) |
  | business_type | varchar(100) | 业务类型 |
  | connection_type | varchar(200) | 连接类型 |
  | is_International | tinyint | 是否国际 |
  | total_pallets | int | 总托盘数 |
  | order_carton_qty | int | 订单纸箱数量 |
  | data_channel_account | varchar(200) | 数据渠道账户 |
  | good_type | varchar(200) | 货物类型 |
  | is_rush | tinyint | 是否加急 |
  | appointment_time | datetime | 预约时间 |
  | canceled_date | datetime | 取消日期 |
  | schedule_date | datetime | 计划日期 |
  | require_print_packing_list | tinyint | 是否需要打印装箱单 |
  | contain_battery | tinyint | 是否含电池 |
  | customer_so_no | varchar(200) | 客户销售订单号 |
  | dynamic_fields | json | 动态字段 |
  | tag | varchar(128) | 标签 |
  | risk | json | 风险评估信息 |
  | compress_type | varchar(200) | 压缩类型(GZIP/BROTLI4J) |
  | sub_order_type | varchar(200) | 子订单类型 |
  | department | varchar(200) | 部门 |

  ---

  ## sales_order_item（销售订单商品行）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | order_no | varchar(55) | 订单号 |
  | reference_no | varchar(50) | 上游ID |
  | sku | varchar(50) | 商品SKU |
  | original_sku | varchar(50) | 原始SKU |
  | qty | int | 数量 |
  | uom | varchar(20) | 单位 |
  | original_uom | varchar(100) | 原始单位 |
  | title | varchar(200) | 商品名称 |
  | item_description | varchar(255) | 描述 |
  | length | double | 长度 |
  | width | double | 宽度 |
  | height | double | 高度 |
  | linear_uom | varchar(20) | 长宽高单位 |
  | weight | double | 重量 |
  | weight_uom | varchar(20) | 重量单位 |
  | serial_product | tinyint | 是否序列产品 |
  | lot_no | varchar(50) | 批次号 |
  | tax | decimal(18,2) | 税 |
  | tax_rate | decimal(18,2) | 税率 |
  | discount | decimal(18,2) | 优惠 |
  | total_amount | decimal(18,2) | 总价 |
  | shipping_amount | decimal(18,2) | 运费 |
  | unit_price | decimal(18,2) | 单价 |
  | unit_price_currency | varchar(200) | 单价货币 |
  | sn_list | varchar(2000) | 序列号列表 |
  | category | varchar(50) | 分类 |
  | stackable | bit | 是否可堆叠 |
  | fragile | bit | 易碎 |
  | remark | varchar(500) | 备注 |
  | picture_url | varchar(255) | 图片地址 |
  | buyer_item_id | varchar(100) | 买家商品ID |
  | package_configure | varchar(200) | 包装规格 |
  | return_label | varchar(200) | 退货标签 |
  | goods_type | varchar(200) | 品质类型 |
  | supplier_id | varchar(200) | 供应商 |
  | contain_battery | tinyint | 含电池 |
  | carrier_name | varchar(200) | 承运商名称 |
  | title_id | varchar(100) | 货主 |
  | title_name | varchar(200) | 货主名称 |
  | original_title_name | varchar(200) | 原始货主名称 |
  | pre_pack_qty | int | 包装数量 |
  | pre_pack_description | varchar(200) | 包装说明 |
  | pallet_weight | decimal(10,0) | 托盘重量 |
  | original_item_product_number | varchar(200) | 原始商品编号 |
  | upc_code | varchar(200) | UPC码 |
  | base_qty | int | 基础数量 |
  | reference_order_id | varchar(200) | 上游orderID |
  | dynamic_fields | json | 动态字段 |
  | qty2 | decimal(18,2) | 第二单位数量 |
  | uom2 | varchar(20) | 第二单位 |

  ---

  ## order_dispatch（订单拆单主表）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | dispatch_no | varchar(50) | 拆单业务编号 |
  | order_no | varchar(50) | 订单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | behind_order_no | varchar(50) | 下游订单编号 |
  | accounting_code | varchar(50) | 仓库code |
  | company_code | varchar(50) | 公司code |
  | warehouse_name | varchar(256) | 仓库名称 |
  | warehouse_type | varchar(255) | 仓库类型（成品仓/目标仓）|
  | warehouse_id | varchar(100) | 仓库ID |
  | warehouse_channel_no | varchar(255) | 仓库渠道编号 |
  | warehouse_channel_name | varchar(255) | 仓库渠道名称 |
  | warehouse_data_channel | varchar(255) | 仓库数据渠道 |
  | location_id | varchar(100) | 仓库位置ID |
  | order_type | int | 订单类型：1=SalesOrder, 2=DeliveryOrder |
  | send_type | int | 下发系统：1=UNIS, 2=ITEM, 3=FMS |
  | status | int | OrderStatusV2Enum（见SKILL.md）|
  | dispatch_type | int | 拆单类型 |
  | is_merge_primary | int | 是否为合并主单 |
  | merge_status | int | 合单状态：1=未合单, 2=已下发 |
  | merge_order_no | varchar(50) | 合并主单号 |
  | merge_dispatch_no | varchar(50) | 合并子单号 |
  | callback_time | datetime | 下游系统回调时间 |
  | carrier_s_c_a_c | varchar(50) | 承运商代码 |
  | carrier_name | varchar(100) | 承运商名称 |
  | delivery_service | varchar(100) | 运送服务 |
  | ship_method | varchar(50) | 运送服务类型 |
  | remark | varchar(500) | 备注 |
  | version | bigint | 版本号（乐观锁）|
  | warehouse_version | varchar(50) | 仓库版本号 |
  | send_kafka | int | 是否已发送kafka消息 |
  | dispatch_attach_data | text | 附加数据 |

  ---

  ## order_dispatch_item（订单拆单商品行）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | dispatch_no | varchar(20) | 拆单编号 |
  | order_no | varchar(20) | 订单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | warehouse_id | varchar(100) | 仓库ID |
  | sku | varchar(100) | 商品SKU |
  | qty | int | 商品数量 |
  | uom | varchar(100) | 单位 |
  | title | varchar(512) | 商品名称 |
  | serial_product | tinyint | 是否序列产品 |
  | lot_no | varchar(64) | 批次号 |
  | po_line_no | varchar(255) | PO行号 |
  | order_item_id | bigint | 关联 sales_order_item.id |

  ---

  ## order_shipment（履约单主表）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | shipment_no | varchar(50) | 履约单号 |
  | order_no | varchar(50) | 订单编号 |
  | dispatch_no | varchar(50) | 拆单编号 |
  | behind_order_no | varchar(50) | 下游运单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | reference_no | varchar(50) | 上游系统订单编号 |
  | channel_no | varchar(50) | 渠道编号 |
  | channel_name | varchar(50) | 渠道名称 |
  | channel_code | varchar(128) | 渠道code |
  | data_channel | varchar(50) | 三方平台名称 |
  | purchase_order_no | varchar(50) | 采购订单号 |
  | channel_sales_order_number | varchar(50) | 渠道sales order号 |
  | status | int | ShipmentStatusEnum（见SKILL.md）|
  | ship_method | varchar(50) | 运送方式 |
  | master_tracking_number | varchar(50) | 主运单号 |
  | tracking_numbers | varchar(1000) | 运单号集合 |
  | mabd | datetime | 最晚到达时间 |
  | bol_no | varchar(100) | 货物清单 |
  | master_bol_no | varchar(50) | 主提单号 |
  | load_no | varchar(100) | 装货单编号 |
  | pro_no | varchar(100) | 运输车编号 |
  | carrier_scac | varchar(50) | 承运商code |
  | carrier_name | varchar(100) | 承运商名称 |
  | delivery_service | varchar(100) | 运送服务 |
  | ship_from_address_id | bigint | 发货地址ID |
  | ship_to_address_id | bigint | 收货地址ID |
  | ship_date | datetime | 发货日期 |
  | accounting_code | varchar(100) | 发货仓库 |
  | warehouse_name | varchar(200) | 仓库名称 |
  | source | int | 来源 |
  | version | bigint | 版本号 |
  | batch_no | varchar(50) | 批次号 |
  | freight_term | varchar(50) | 预付款 |
  | total_carton_qty | int | 总箱数 |

  ---

  ## order_shipment_extension（履约单扩展）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | shipment_no | varchar(50) | 履约单号 |
  | order_no | varchar(200) | 订单号 |
  | dispatch_no | varchar(200) | 拆单号 |
  | freight_cost | varchar(100) | 运费 |
  | po_no | varchar(50) | 买家采购单号 |
  | transportation_type | varchar(50) | 运输类型 |
  | seals | varchar(50) | 封签 |
  | total_weight | decimal(10,0) | 发货总重量 |
  | total_shipped_qty | decimal(10,2) | 总发货数量 |
  | total_volume | decimal(20,2) | 总体积 |
  | customer_so_no | varchar(100) | 客人销售订单号 |
  | ordered_date | datetime | 下单日期 |
  | ship_to_store_no | varchar(100) | 收货门店编号 |
  | sold_to_address_id | bigint | 销售地址ID |
  | store_no | varchar(100) | 门店编号 |
  | store_address_id | bigint | 门店地址ID |
  | bill_to_address_id | bigint | 发票地址ID |
  | bill_to_store_no | varchar(100) | 发票门店编号 |
  | label_note | text | 标签备注 |
  | lading_qty | int | 提货数量 |
  | lading_uom | varchar(50) | 提货单位 |
  | ship_to_batch_code | varchar(100) | 发货批次编码 |
  | order_type | varchar(100) | 订单类型 |
  | sub_order_type | varchar(100) | 子订单类型 |
  | authorization_number | varchar(100) | 授权码（LTL运输用）|
  | title | varchar(200) | 货主 |
  | retailer | varchar(200) | 零售商 |
  | trailer_number | varchar(200) | 拖车编号 |
  | pallet_qty | int | 托盘总数 |
  | gate_check_in_time | datetime | 门岗签到时间 |
  | gate_check_out_time | datetime | 门岗签退时间 |
  | dock_check_in | datetime | 装卸点签到 |
  | dock_check_out | datetime | 装卸点签出 |
  | appointment_time | datetime | 预约时间 |
  | order_qty_in_load | int | 装载订单数量 |
  | wms_shipment_id | varchar(200) | WMS的shipmentId |
  | equipment_description_code | varchar(200) | 设备种类/规格代码 |
  | container_number | varchar(200) | 集装箱编号 |
  | container_type | varchar(128) | 集装箱类型 |
  | eta | datetime | 预计到达时间 |
  | etd | datetime | 预计出发时间 |
  | transport_terms | varchar(200) | 运输条款 |
  | transportation_method | varchar(128) | 运输方式 |
  | trade_mode | varchar(128) | 贸易模式 |
  | booking_no | varchar(128) | 预订编号 |
  | customs_information | json | 海关信息 |
  | packing_code | varchar(128) | 包装代码(PLT/CTN) |
  | attach_data | longtext | 动态字段 |

  ---

  ## order_shipment_item（履约单商品行）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | order_no | varchar(50) | 订单号 |
  | dispatch_no | varchar(50) | 拆单号 |
  | shipment_no | varchar(50) | 履约单号 |
  | master_tracking_number | varchar(255) | 主运单号 |
  | tracking_number | varchar(255) | 运单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | sku | varchar(100) | SKU |
  | name | varchar(500) | 商品名称 |
  | shipped_qty | int | 发货数量 |
  | order_qty | int | 订购数量 |
  | total_ordered_qty | int | 总订单数量 |
  | total_shipped_qty | int | 总发货数量 |
  | difference_qty | int | 数量差值 |
  | uom | varchar(24) | 单位 |
  | order_uom | varchar(50) | 订单商品单位 |
  | base_uom | varchar(100) | 基本计量单位 |
  | shipped_base_qty | int | 已发运基础数量 |
  | category | varchar(50) | 分类 |
  | sn | varchar(512) | 序列号 |
  | lot_no | varchar(64) | 批次号 |
  | length | double | 长度 |
  | width | double | 宽度 |
  | height | double | 高度 |
  | linear_uom | varchar(50) | 线性单位 |
  | weight | double | 重量 |
  | weight_uom | varchar(50) | 重量单位 |
  | weight_unit_code | varchar(50) | 重量单位标识 |
  | volume | varchar(100) | 体积 |
  | volume_uom | varchar(50) | 体积单位 |
  | declared_value | decimal(18,2) | 声明价值 |
  | price | decimal(18,2) | 价格 |
  | unit_price | decimal(10,0) | 单价 |
  | freight_class | tinyint | 预付款类型 |
  | stackable | tinyint | 是否可堆叠 |
  | fragile | tinyint | 易碎 |
  | supplier_id | varchar(100) | 供应商 |
  | buyer_item_id | varchar(200) | 买家商品ID |
  | title_id | varchar(200) | 货主 |
  | return_tracking_number | varchar(200) | 退货跟踪号 |
  | expiration_date | datetime | 有效期 |
  | manufacture_date | datetime | 生产日期 |
  | ean | varchar(100) | 欧洲商品编号 |
  | upc | varchar(128) | 通用产品码 |
  | hs_code | varchar(128) | 海关商品编码 |
  | digit_barcode | varchar(20) | 条形码 |
  | description | text | 描述 |
  | color | varchar(100) | 颜色 |
  | size | varchar(20) | 大小 |
  | pack | varchar(100) | 包装 |
  | goods_type | varchar(100) | 货物类型 |
  | pallet_ti_hi_qty | int | 托盘层数和堆叠数 |
  | qty2 | decimal(18,2) | 第二单位数量 |
  | uom2 | varchar(64) | 第二单位 |
  | attach_data | text | 动态字段 |

  ---

  ## order_shipment_package（履约包裹）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | package_no | varchar(50) | 包裹编号 |
  | order_no | varchar(50) | 订单号 |
  | dispatch_no | varchar(50) | 拆单号 |
  | shipment_no | varchar(50) | 履约单号 |
  | pallet_no | varchar(50) | 托盘号 |
  | merchant_no | varchar(50) | B端 customer code |
  | master_tracking_number | varchar(100) | 主运单号 |
  | tracking_number | varchar(100) | 运单号 |
  | ship_qty | int | 发货数量 |
  | qty | int | 数量 |
  | length | double | 长度 |
  | width | double | 宽度 |
  | height | double | 高度 |
  | linear_uom | varchar(50) | 线性单位 |
  | weight | double | 重量 |
  | weight_uom | varchar(50) | 重量单位 |
  | volume | varchar(50) | 体积 |
  | volume_uom | varchar(200) | 体积单位 |
  | stackable | bit | 是否可堆叠 |
  | sequence | int | 序号 |
  | label_buffer | text | 打印单base64 |
  | carrier_name | varchar(50) | 承运商名称 |
  | carton_no | varchar(200) | 箱号 |
  | sscc | varchar(100) | SSCC编码 |
  | sscc_type | varchar(100) | SSCC类型 |
  | pallet_id | varchar(200) | 托盘SSCC |
  | carton_lp | varchar(200) | 箱LP |
  | slp | varchar(200) | 发货许可证编号 |
  | from_lp | varchar(200) | 入库收货编号（先进先出）|
  | stack | int | 层 |
  | shipping_cost | decimal(10,0) | 运费 |
  | shipping_carrier_name | varchar(200) | 承运商名称 |
  | shipping_service_name | varchar(200) | 运输服务产品名称 |
  | supplier_no | varchar(128) | 供应商编号 |
  | remark | varchar(5000) | 备注 |

  ---

  ## order_shipment_package_item（履约包裹商品行）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | order_no | varchar(50) | 订单号 |
  | dispatch_no | varchar(50) | 拆单号 |
  | shipment_no | varchar(50) | 履约单号 |
  | pallet_no | varchar(50) | 托盘号 |
  | package_no | varchar(50) | 包裹号 |
  | master_tracking_number | varchar(255) | 主运单号 |
  | tracking_number | varchar(255) | 运单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | sku | varchar(100) | SKU |
  | name | varchar(500) | 商品名称 |
  | shipped_qty | int | 发货数量 |
  | order_qty | int | 订购数量 |
  | uom | varchar(24) | 单位 |
  | sn | varchar(512) | 序列号 |
  | lot_no | varchar(64) | 批次号 |
  | length | double | 长度 |
  | width | double | 宽度 |
  | height | double | 高度 |
  | linear_uom | varchar(50) | 线性单位 |
  | weight | double | 重量 |
  | weight_uom | varchar(50) | 重量单位 |
  | volume | varchar(100) | 体积 |
  | volume_uom | varchar(50) | 体积单位 |
  | declared_value | decimal(18,2) | 声明价值 |
  | price | decimal(18,2) | 价格 |
  | freight_class | tinyint | 预付款类型 |
  | stackable | tinyint | 是否可堆叠 |
  | fragile | tinyint | 易碎 |
  | total_ordered_qty | int | 总订单数量 |
  | total_shipped_qty | int | 总发货数量 |
  | difference_qty | int | 数量差值 |
  | supplier_id | varchar(100) | 供应商 |
  | buyer_item_id | varchar(200) | 买家商品ID |
  | unit_price | decimal(10,0) | 单价 |
  | order_uom | varchar(50) | 订单商品单位 |
  | title_id | varchar(200) | 货主 |
  | return_tracking_number | varchar(200) | 退货跟踪号 |
  | pallet_lpn | varchar(100) | 第三方托盘许可证号 |
  | expiration_date | datetime | 有效期 |
  | manufacture_date | datetime | 生产日期 |
  | weight_unit_code | varchar(50) | 重量单位标识 |
  | ean | varchar(100) | 欧洲商品编号 |
  | digit_barcode | varchar(20) | 条形码 |
  | description | text | 描述 |
  | color | varchar(100) | 颜色 |
  | size | varchar(20) | 大小 |
  | pack | varchar(100) | 包装 |
  | edi_defined_size | varchar(100) | EDI定义的尺寸 |
  | entered_uom | varchar(20) | 录入的计量单位 |
  | pallet_ti_hi_qty | int | 托盘层数和堆叠数 |
  | base_uom | varchar(100) | 基本计量单位 |
  | shipped_base_qty | int | 已发运基础数量 |
  | goods_type | varchar(100) | 货物类型 |
  | attach_data | longtext | 动态字段 |
  | shipped_qty2 | decimal(18,2) | 第二单位发货数量 |
  | uom2 | varchar(64) | 第二单位 |

  ---

  ## order_shipment_pallet（履约托盘）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | pallet_no | varchar(50) | 托盘编号 |
  | package_no | varchar(200) | 包裹号 |
  | order_no | varchar(50) | 订单号 |
  | dispatch_no | varchar(50) | 拆单号 |
  | shipment_no | varchar(50) | 履约单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | pallet_id | varchar(128) | 托盘唯一标识 |
  | sscc | varchar(200) | SSCC编码 |
  | pallet_type | varchar(200) | 托盘类型 |
  | pallet_lp | varchar(200) | 托盘LP |
  | stack | int | 托盘层数 |
  | carton_qty | int | 箱数 |
  | weight | decimal(10,2) | 托盘重量 |
  | weight_uom | varchar(200) | 重量单位 |
  | length | decimal(10,2) | 托盘长度 |
  | width | decimal(10,2) | 托盘宽度 |
  | height | decimal(10,2) | 托盘高度 |
  | linear_uom | varchar(200) | 长度单位 |
  | volume | decimal(10,0) | 体积 |
  | volume_uom | varchar(64) | 体积单位（默认cu in）|
  | remark | varchar(5000) | 备注 |

  ---

  ## order_shipment_pallet_item（履约托盘商品行）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | order_no | varchar(50) | 订单号 |
  | dispatch_no | varchar(50) | 拆单号 |
  | shipment_no | varchar(50) | 履约单号 |
  | pallet_no | varchar(50) | 托盘号 |
  | package_no | varchar(128) | 包裹号 |
  | master_tracking_number | varchar(255) | 主运单号 |
  | tracking_number | varchar(255) | 运单号 |
  | merchant_no | varchar(50) | B端 customer code |
  | sku | varchar(100) | SKU |
  | name | varchar(500) | 商品名称 |
  | shipped_qty | int | 发货数量 |
  | order_qty | int | 订购数量 |
  | uom | varchar(24) | 单位 |
  | sn | varchar(512) | 序列号 |
  | lot_no | varchar(64) | 批次号 |
  | length | double | 长度 |
  | width | double | 宽度 |
  | height | double | 高度 |
  | linear_uom | varchar(50) | 线性单位 |
  | weight | double | 重量 |
  | weight_uom | varchar(50) | 重量单位 |
  | volume | varchar(100) | 体积 |
  | volume_uom | varchar(50) | 体积单位 |
  | declared_value | decimal(18,2) | 声明价值 |
  | price | decimal(18,2) | 价格 |
  | freight_class | tinyint | 预付款类型 |
  | stackable | tinyint | 是否可堆叠 |
  | fragile | tinyint | 易碎 |
  | total_ordered_qty | int | 总订单数量 |
  | total_shipped_qty | int | 总发货数量 |
  | difference_qty | int | 数量差值 |
  | supplier_id | varchar(100) | 供应商 |
  | buyer_item_id | varchar(200) | 买家商品ID |
  | unit_price | decimal(10,0) | 单价 |
  | order_uom | varchar(50) | 订单商品单位 |
  | title_id | varchar(200) | 货主 |
  | return_tracking_number | varchar(200) | 退货跟踪号 |
  | expiration_date | datetime | 有效期 |
  | manufacture_date | datetime | 生产日期 |
  | goods_type | varchar(100) | 货物类型 |
  | attach_data | longtext | 动态字段 |
  | shipped_qty2 | decimal(18,2) | 第二单位发货数量 |
  | uom2 | varchar(64) | 第二单位 |
  ---

  ## order_msg（订单异常信息表）

  | 字段名 | 类型 | 说明 |
  |--------|------|------|
  | id | bigint | 主键 |
  | order_no | varchar(50) | 订单号（索引）|
  | merchant_no | varchar(50) | 商户号 |
  | type | tinyint | 消息类型 |
  | remark | text | 备注/异常信息 |
