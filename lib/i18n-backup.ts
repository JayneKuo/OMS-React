// React import for useState
import * as React from 'react'

// 简单的国际化系统
export type Language = 'zh' | 'en'

// PR模块的翻译文本
export const translations = {
  zh: {
    // 通用
    actions: '操作',
    status: '状态',
    created: '创建时间',
    updated: '更新时间',
    view: '查看',
    edit: '编辑',
    delete: '删除',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    
    // PR相关
    prNo: 'PR编号',
    businessNo: '业务编号',
    businessEntity: '业务实体',
    department: '部门',
    requester: '申请人',
    requesterNo: '申请人工号',
    currentApprover: '当前审批人',
    prType: 'PR类型',
    priority: '优先级',
    expectedDeliveryDate: '期望交货日期',
    targetWarehouses: '目标仓库',
    skuCount: 'SKU数量',
    totalQty: '总数量',
    estimatedAmount: '预估金额',
    currency: '币种',
    budgetProject: '预算项目',
    notes: '备注',
    
    // 状态
    DRAFT: '草稿',
    SUBMITTED: '新建',
    APPROVING: '已提交',
    APPROVED: '已审批',
    REJECTED: '已拒绝',
    CANCELLED: '已取消',
    EXCEPTION: '异常',
    PARTIAL_PO: '部分PO',
    FULL_PO: '完整PO',
    CLOSED: '已关闭',
    
    // 优先级
    LOW: '低',
    NORMAL: '普通',
    HIGH: '高',
    URGENT: '紧急',
    
    // 操作
    generatePO: '生成PO',
    continueGeneratePO: '继续生成PO',
    cancelUnlinkedItems: '取消',
    viewDetails: '查看详情',
    copy: '复制',
    submit: '提交',
    submitForApproval: '提交审批',
    approve: '审批通过',
    reject: '拒绝',
    fix: '修复',
    export: '导出',
    batchActions: '批量操作',
    batchExport: '批量导出',
    clearSelection: '清除选择',
    newPR: '新建PR',
    createManually: '手动创建',
    importFromFile: '从文件导入',
    selectRowsToSeeActions: '选择行以查看可用操作',
    statusLabel: '状态',
    mixedStatus: '混合状态',
    types: '种',
    all: '全部',
    viewAll: '查看全部',
    batchApprove: '批量审批通过',
    batchReject: '批量拒绝',
    basicInfo: '基本信息',
    commercialItems: '商品行',
    approvalHistory: '审批历史',
    relatedPO: '关联PO',
    quoteFiles: '报价文件',
    
    // PO生成对话框
    poGenerationDialog: '生成采购订单 (PO)',
    selectItems: '选择商品行',
    supplierInfo: '供应商信息',
    shippingAddress: '发货地址',
    tradeTerms: '交易条款',
    buyerNotes: '买方备注',
    
    // 供应商信息
    supplierName: '供应商名称',
    supplierCode: '供应商代码',
    contact: '联系人',
    phone: '联系电话',
    email: '邮箱',
    
    // 地址信息
    country: '国家',
    state: '州/省',
    city: '城市',
    zipCode: '邮编',
    address1: '地址1',
    address2: '地址2',
    shippingContact: '收货联系人',
    
    // 交易条款
    paymentMethod: '付款方式',
    shippingMethod: '运输方式',
    tradeTermsField: '贸易条款',
    latestShipDate: '最晚发货日期',
    
    // 商品信息
    skuCode: 'SKU代码',
    skuName: 'SKU名称',
    productName: '产品名称',
    specifications: '规格',
    quantity: '数量',
    unit: '单位',
    unitPrice: '单价',
    supplier: '供应商',
    
    // 异常处理页面
    exceptionHandling: '异常处理',
    exceptionOverview: '异常概览',
    exceptionCount: '异常数量',
    firstOccurrence: '首次发生',
    lastAttempt: '最后尝试',
    attemptCount: '尝试次数',
    exceptionDetails: '异常详情',
    exceptionDescription: '异常描述',
    affectedLines: '影响行',
    suggestedAction: '建议操作',
    autoFix: '自动修复',
    editAndFix: '编辑并修复',
    retryProcessing: '重试处理',
    retrying: '重试中...',
    back: '返回',
    editPR: '编辑PR',
    
    // 严重程度
    LOW_SEVERITY: '低',
    MEDIUM_SEVERITY: '中',
    HIGH_SEVERITY: '高',
    CRITICAL_SEVERITY: '严重',
    
    // 编辑页面
    editPurchaseRequest: '编辑采购申请',
    createPurchaseRequest: '新建采购申请',
    createNewPurchaseRequest: '创建新的采购申请单',
    requestNumber: '请求编号',
    systemGenerated: '系统自动生成',
    departmentBusinessUnit: '部门/事业部',
    selectDepartment: '选择部门',
    requesterName: '申请人',
    enterRequesterName: '输入申请人姓名',
    prTypeField: 'PR类型',
    selectPRType: '选择PR类型',
    priorityField: '优先级',
    budgetProjectCostCenter: '预算项目/成本中心',
    notesField: '备注',
    purchaseBackgroundUsage: '说明采购背景、用途等',
    
    // 交付要求
    deliveryRequirements: '交付要求',
    targetWarehouse: '目标仓库',
    selectTargetWarehouse: '选择目标仓库',
    expectedDeliveryTime: '预期到货时间',
    shippingContactPerson: '收货联系人',
    contactPersonName: '收货联系人姓名',
    contactPhone: '联系电话',
    contactEmail: '联系邮箱',
    shippingAddressField: '收货地址',
    countryField: '国家',
    stateProvince: '州/省',
    selectState: '选择州',
    cityField: '城市',
    enterCityName: '输入城市名称',
    address1Field: '地址1',
    streetAddress: '街道地址',
    zipCodeField: '邮编',
    postalCode: '邮政编码',
    address2Optional: '地址2（可选）',
    apartmentFloorInfo: '公寓号、楼层等补充信息',
    deliveryNotes: '交付备注',
    specialDeliveryRequirements: '特殊交付要求、注意事项等',
    
    // 商品明细
    productDetails: '商品明细',
    batchSettings: '批量设置',
    addProduct: '添加商品',
    batchSetCurrency: '批量设置币种',
    selectCurrency: '选择币种',
    batchSetTaxRate: '批量设置税率(%)',
    batchSetSupplier: '批量设置供应商',
    enterSupplierName: '输入供应商名称',
    applyToAllProducts: '应用到所有商品',
    noProductDetails: '暂无商品明细，点击"添加商品"开始选择商品',
    lineNumber: '行号',
    productInfo: '商品信息',
    quantityField: '数量',
    unitField: '单位',
    currencyField: '币种',
    unitPriceField: '单价',
    taxRateField: '税率(%)',
    taxAmountField: '税额',
    taxInclusiveSubtotal: '含税小计',
    supplierField: '供应商',
    snManagement: 'SN管理',
    lotManagement: '批次管理',
    businessPurpose: '业务用途',
    notesFieldTable: '备注',
    actionsField: '操作',
    
    // SN/批次管理
    requiresSN: '需要SN',
    requiresLot: '需要批次',
    noSNRequired: '无需SN',
    noLotRequired: '无需批次',
    specifySerialNumbers: '指定SN (逗号分隔)',
    specifyLotNumbers: '指定批次 (逗号分隔)',
    alreadySet: '已设置',
    items: '个',
    advancedManagement: '高级管理',
    quoteManagement: '询价管理',
    quote: '报价',
    
    // 汇总
    summary: '汇总',
    products: '个商品',
    
    // 按钮和操作
    saveDraft: '保存草稿',
    saveAndSubmit: '保存并提交',
    selectOrEnterSupplier: '选择或输入供应商',
    
    // 确认对话框
    confirmCancelPR: '确认取消采购申请？',
    cancelDescription: '取消后无法提交审批或生成 PO',
    confirmCancel: '确认取消',
    keep: '保留',
    confirmDelete: '确认删除？',
    deleteDescription: '删除后无法恢复',
    confirmDeleteAction: '确认删除',
    submitPR: '提交采购申请？',
    submitDescription: '提交后进入审批流程，无法编辑',
    confirmSubmit: '确认提交',
    confirmApprove: '确认审核通过？',
    approveDescription: '通过后可生成 PO',
    confirmApproveAction: '确认通过',
    confirmReject: '确认拒绝？',
    rejectDescription: '拒绝后流程终止，需填写原因',
    confirmRejectAction: '确认拒绝',
    cancelUnlinkedPOLines: '取消未转 PO 的剩余行？',
    cancelUnlinkedDescription: '已转 PO 行不可取消，仅取消剩余行',
    rejectReason: '拒绝原因',
    enterRejectReason: '请填写拒绝原因...',
    
    // PR类型
    regularPurchase: '常规采购',
    stockReplenishment: '备货',
    projectPurchase: '项目采购',
    internalTransfer: '内部调拨',
    
    // 优先级类型
    normal: '普通',
    urgent: '紧急',
    veryUrgent: '非常紧急',
    
    // 列表页筛选和表头
    prStatus: 'PR状态',
    businessEntity: '业务实体',
    targetWarehouses: '目标仓库',
    expectedDeliveryDate: '预期到货时间',
    skuCount: '商品数量',
    totalQty: '总数量',
    estimatedAmount: '预计金额',
    created: '创建时间',
    exceptionMark: '异常标记',
    poGenerationStatus: 'PO生成情况',
    latestUpdateTime: '最新更新时间',
    businessNo: '业务单号',
    currentApprover: '当前审批人',
    budgetProjectCostCenter: '预算项目/成本中心',
    relatedPOInfo: '关联PO信息',
    actions: '操作',
    
    // 筛选选项
    draft: '草稿',
    submitted: '新建',
    approving: '已提交',
    approved: '通过',
    rejected: '拒绝',
    cancelled: '取消',
    exception: '异常',
    partialPO: '部分PO',
    fullPO: '已关闭',
    closed: '已关闭',
    
    // PO生成状态
    notGeneratedPO: '未生成PO',
    partiallyGeneratedPO: '部分生成PO',
    fullyGeneratedPO: '已完全生成PO',
    
    // 搜索和筛选
    searchPlaceholder: '搜索PR编号、业务单号、申请人、部门或备注...',
    prNumber: 'PR编号',
    businessNumber: '业务单号',
    requesterNumber: '申请人工号',
    budgetProject: '预算项目',
    examplePRNumber: '例如：PR202401100001',
    exampleBusinessNumber: '例如：PROJ-2024-001',
    enterName: '输入姓名',
    exampleEmployeeNumber: '例如：EMP001',
    enterApproverName: '输入审批人姓名',
    exampleBudgetProject: '例如：Q1-Marketing',
    
    // 批量操作
    batchSubmit: '批量提交',
    batchCancel: '批量取消',
    batchGeneratePO: '批量生成PO',
    noAvailableActions: '此状态无可用操作',
    downloadTemplate: '下载模板',
    
    // 状态标签页
    multiWarehouse: '多仓',
    confirmed: '已确认',
    pending: '待确认',
    unknown: '未知',
    
    // 表格相关
    lineNo: '第{0}行',
    
    // 新增页面字段
    selectState: '选择州',
    cityName: '城市',
    enterCityName: '输入城市名称',
    address1: '地址1',
    streetAddress: '街道地址',
    zipCode: '邮编',
    postalCode: '邮政编码',
    address2Optional: '地址2（可选）',
    apartmentFloorInfo: '公寓号、楼层等补充信息',
    deliveryNotesField: '交付备注',
    specialDeliveryRequirements: '特殊交付要求、注意事项等',
    
    // 编辑页面缺失的字段
    targetWarehouseLabel: '目标仓库',
    selectTargetWarehouseLabel: '选择目标仓库',
    expectedDeliveryTimeLabel: '预期到货时间',
    latestShipDateLabel: '最晚发货日期',
    shippingContactPersonLabel: '收货联系人',
    contactPersonNamePlaceholder: '收货联系人姓名',
    shippingAddressLabel: '收货地址',
    deliveryNotesLabel: '交付备注',
    batchSettingsLabel: '批量设置',
    batchSetCurrencyLabel2: '批量设置币种',
    batchSetTaxRateLabel2: '批量设置税率(%)',
    batchSetSupplierLabel2: '批量设置供应商',
    applyToAllProductsLabel: '应用到所有商品',
    quoteManagementLabel: '询价管理',
    advancedManagementLabel: '高级管理',
    
    // 详情页面缺失的字段
    targetWarehouseDetail: '目标仓库',
    expectedDeliveryTimeDetail: '预期到货时间',
    latestShipDateDetail: '最晚发货日期',
    shippingContactPersonDetail: '收货联系人',
    shippingAddressDetail: '收货地址',
    productDetailsLabel: '商品明细',
    relatedPOInfoLabel: '关联PO信息',
    approvalProcessLabel: '审批流程',
    
    // 地址相关
    countryLabel: '国家',
    stateProvinceLabel: '州/省',
    cityLabel: '城市',
    detailedAddressLabel: '详细地址',
    zipCodeLabel: '邮编',
    
    // 其他标签
    contactPhoneLabel: '联系电话',
    contactEmailLabel: '联系邮箱',
    receivingContactPersonLabel: '收货负责人',
    
    // PO相关
    creationTimeLabel: '创建时间',
    supplierLabel: '供应商',
    statusLabel2: '状态',
    poAmountLabel: 'PO金额',
    productQuantityLabel: '商品数量',
    expectedDeliveryTimeLabel2: '预期交付时间',
    actionsLabel2: '操作',
    viewLabel: '查看',
    downloadLabel: '下载',
    
    // 状态相关
    confirmedLabel: '已确认',
    pendingLabel: '待确认',
    shippedLabel: '已发货',
    deliveredLabel: '已交付',
    unknownLabel: '未知',
    
    // 汇总相关
    relatedPOCountLabel: '关联PO数量',
    convertedToPOProductsLabel: '已转PO商品数',
    totalPOAmountLabel: 'PO总金额',
    
    // 审批流程相关
    approvedLabel: '已批准',
    rejectedLabel: '已拒绝',
    pendingApprovalLabel: '待审批',
    
    // 供应商报价管理相关
    supplierQuoteManagementTitle: '供应商报价管理',
    addQuote: '新增询价',
    directSelectSupplier: '直接选择供应商（不询价）',
    selectSupplierPlaceholder: '选择供应商',
    saveSelection: '保存选择',
    leadTime: '交期',
    moq: '最小起订量',
    validUntil: '有效期',
    quotedLabel: '已报价',
    pendingQuoteLabel: '待报价',
    days: '天',
    noQuoteRecords: '暂无询价记录，点击"新增询价"开始询价',
    pleaseSelectSupplierAndPrice: '请填写供应商和报价',
    
    // 报价文件管理相关
    quoteFileManagement: '供应商报价管理',
    quoteFiles: '报价文件',
    quoteRequests: '询价管理',
    dragFilesHere: '拖拽文件到此处或点击上传',
    supportedFormats: '支持 PDF, DOC, DOCX, XLS, XLSX 格式，最大 10MB',
    selectFiles: '选择文件',
    fileName: '文件名',
    fileSize: '文件大小',
    uploadDate: '上传时间',
    description: '描述',
    noQuoteFiles: '暂无报价文件，请上传供应商报价文件',
    
    // 询价请求管理
    quoteRequestManagement: '询价请求管理',
    addQuoteRequest: '新增询价',
    supplierNameLabel: '供应商名称',
    enterSupplierNameLabel: '输入供应商名称',
    dueDate: '截止日期',
    quoteRequirementsNotes: '询价要求和说明...',
    sendDate: '发送日期',
    editLabel: '编辑',
    noQuoteRequests: '暂无询价请求，点击"新增询价"开始管理询价',
    
    // 状态标签
    pendingReview: '待审核',
    approvedStatus: '已批准',
    rejectedStatus: '已拒绝',
    sentStatus: '已发送',
    receivedStatus: '已收到',
    overdueStatus: '已逾期',
    
    // 批量设置
    batchSetCurrencyLabel: '批量设置币种',
    selectCurrencyPlaceholder: '选择币种',
    batchSetTaxRateLabel: '批量设置税率(%)',
    taxRateExample: '例如: 13',
    batchSetSupplierLabel: '批量设置供应商',
    enterSupplierNamePlaceholder: '输入供应商名称',
    applyToAllProductsButton: '应用到所有商品',
    
    // SN/批次管理标签
    requiresSNLabel: '需要SN',
    requiresLotLabel: '需要批次',
    noSNRequiredLabel: '无需SN',
    noLotRequiredLabel: '无需批次',
    specifySNPlaceholder: '指定SN (逗号分隔)',
    specifyLotPlaceholder: '指定批次 (逗号分隔)',
    alreadySetLabel: '已设置',
    itemsCount: '个',
    advancedManagementButton: '高级管理',
    quoteManagementButton: '询价管理',
    quoteLabel: '报价',
    
    // 商品表格占位符
    businessPurposePlaceholder: '业务用途',
    notesPlaceholder: '备注',
    selectOrEnterSupplierPlaceholder: '选择或输入供应商',
    
    // 产品选择弹窗
    selectProducts: '选择商品',
    searchProductsPlaceholder: '搜索商品名称、SKU、规格或品牌...',
    reset: '重置',
    totalProducts: '共 {0} 个商品，已选择 {1} 个',
    selectAll: '全选',
    deselectAll: '取消全选',
    select: '选择',
    productName: '商品名称',
    specifications: '规格',
    brand: '品牌',
    category: '分类',
    unitPrice: '单价',
    costPrice: '成本价',
    stockStatus: '库存状态',
    traceabilityManagement: '追溯管理',
    inStock: '有库存',
    outOfStock: '缺货',
    addSelectedProducts: '添加选中商品 ({0})',
    
    // 供应商报价弹窗
    supplierQuoteManagement: '供应商报价管理',
    supplierQuote: '供应商报价',
    currentSupplier: '当前供应商',
    quotePrice: '报价',
    quoteValidUntil: '报价有效期',
    attachQuoteFile: '附加报价文件',
    selectSupplier: '选择供应商',
    enterQuotePrice: '输入报价',
    selectValidDate: '选择有效期',
    uploadQuoteFile: '上传报价文件',
    
    // SN/批次管理弹窗
    snLotManagement: 'SN/批次管理',
    serialNumberManagement: '序列号管理',
    lotNumberManagement: '批次号管理',
    specifySerialNumbers: '指定序列号',
    specifyLotNumbers: '指定批次号',
    enterSerialNumbers: '输入序列号（每行一个）',
    enterLotNumbers: '输入批次号（每行一个）',
    snLotNotes: 'SN/批次备注',
    enterNotes: '输入备注信息',
    
    // PO相关翻译
    purchaseOrders: '采购订单',
    managePurchaseOrders: '管理和跟踪供应商采购订单',
    poNo: 'PO编号',
    originalPoNo: '原始PO编号',
    prNos: 'PR编号',
    referenceNo: '参考编号',
    supplierName: '供应商名称',
    destination: '目的地',
    receiptType: '收货类型',
    exceptions: '异常',
    totalPrice: '总价',
    shippingCarrier: '承运商',
    expectedShipDate: '预计发货日期',
    expectedArrivalDate: '预计到货日期',
    actualArrivalDate: '实际到货日期',
    toCity: '目标城市',
    toState: '目标州/省',
    toCountry: '目标国家',
    shippingService: '运输服务',
    shippingNotes: '运输备注',
    purchaseOrderDate: '采购订单日期',
    warehouseName: '仓库名称',
    itemCount: '商品数量',
    
    // PO状态
    CONFIRMED: '已确认',
    SHIPPED: '已发货',
    RECEIVED: '已收货',
    ON_HOLD: '暂停',
    
    // 收货类型
    STANDARD: '标准',
    CROSS_DOCK: '直通',
    DROP_SHIP: '直发',
    RETURN_TO_VENDOR: '退回供应商',
    TRANSFER: '调拨',
    
    // PO操作
    track: '跟踪',
    receive: '收货',
    download: '下载',
    resume: '恢复',
    batchSubmitPO: '批量提交',
    batchConfirm: '批量确认',
    batchCancel: '批量取消',
    batchTrack: '批量跟踪',
    batchResume: '批量恢复',
    batchUpdate: '批量更新',
    newPO: '新建PO',
    createManuallyPO: '手动创建',
    importFromFilePO: '从文件导入',
    downloadTemplatePO: '下载模板',
    
    // PO搜索和筛选
    searchPOPlaceholder: '搜索PO编号、原始PO编号、参考编号、供应商或目的地...',
    
    // PO状态标签页
    draft: '草稿',
    submitted: '已提交',
    confirmed: '已确认',
    shipped: '已发货',
    received: '已收货',
    onHold: '暂停',
    cancelled: '已取消',
  },
  en: {
    // 通用
    actions: 'Actions',
    status: 'Status',
    created: 'Created',
    updated: 'Updated',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    
    // PR相关
    prNo: 'PR No.',
    businessNo: 'Business No.',
    businessEntity: 'Business Entity',
    department: 'Department',
    requester: 'Requester',
    requesterNo: 'Requester No.',
    currentApprover: 'Current Approver',
    prType: 'PR Type',
    priority: 'Priority',
    expectedDeliveryDate: 'Expected Delivery Date',
    targetWarehouses: 'Target Warehouses',
    skuCount: 'SKU Count',
    totalQty: 'Total Qty',
    estimatedAmount: 'Estimated Amount',
    currency: 'Currency',
    budgetProject: 'Budget Project',
    notes: 'Notes',
    
    // 状态
    DRAFT: 'Draft',
    SUBMITTED: 'New',
    APPROVING: 'Submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    EXCEPTION: 'Exception',
    PARTIAL_PO: 'Partial PO',
    FULL_PO: 'Full PO',
    CLOSED: 'Closed',
    
    // 优先级
    LOW: 'Low',
    NORMAL: 'Normal',
    HIGH: 'High',
    URGENT: 'Urgent',
    
    // 操作
    generatePO: 'Generate PO',
    continueGeneratePO: 'Continue Generate PO',
    cancelUnlinkedItems: 'Cancel',
    viewDetails: 'View Details',
    copy: 'Copy',
    submit: 'Submit',
    submitForApproval: 'Submit for Approval',
    approve: 'Approve',
    reject: 'Reject',
    fix: 'Fix',
    export: 'Export',
    batchActions: 'Batch Actions',
    batchExport: 'Batch Export',
    clearSelection: 'Clear Selection',
    newPR: 'New PR',
    createManually: 'Create Manually',
    importFromFile: 'Import from File',
    selectRowsToSeeActions: 'Select rows to see available actions',
    statusLabel: 'Status',
    mixedStatus: 'Mixed Status',
    types: 'types',
    all: 'All',
    viewAll: 'View All',
    batchApprove: 'Batch Approve',
    batchReject: 'Batch Reject',
    basicInfo: 'Basic Information',
    commercialItems: 'Commercial Items',
    approvalHistory: 'Approval History',
    relatedPO: 'Related PO',
    quoteFiles: 'Quote Files',
    
    // PO生成对话框
    poGenerationDialog: 'Generate Purchase Order (PO)',
    selectItems: 'Select Items',
    supplierInfo: 'Supplier Information',
    shippingAddress: 'Shipping Address',
    tradeTerms: 'Trade Terms',
    buyerNotes: 'Buyer Notes',
    
    // 供应商信息
    supplierName: 'Supplier Name',
    supplierCode: 'Supplier Code',
    contact: 'Contact',
    phone: 'Phone',
    email: 'Email',
    
    // 地址信息
    country: 'Country',
    state: 'State/Province',
    city: 'City',
    zipCode: 'Zip Code',
    address1: 'Address 1',
    address2: 'Address 2',
    shippingContact: 'Shipping Contact',
    
    // 交易条款
    paymentMethod: 'Payment Method',
    shippingMethod: 'Shipping Method',
    tradeTermsField: 'Trade Terms',
    latestShipDate: 'Latest Ship Date',
    
    // 商品信息
    skuCode: 'SKU Code',
    skuName: 'SKU Name',
    productName: 'Product Name',
    specifications: 'Specifications',
    quantity: 'Quantity',
    unit: 'Unit',
    unitPrice: 'Unit Price',
    supplier: 'Supplier',
    
    // 异常处理页面
    exceptionHandling: 'Exception Handling',
    exceptionOverview: 'Exception Overview',
    exceptionCount: 'Exception Count',
    firstOccurrence: 'First Occurrence',
    lastAttempt: 'Last Attempt',
    attemptCount: 'Attempt Count',
    exceptionDetails: 'Exception Details',
    exceptionDescription: 'Exception Description',
    affectedLines: 'Affected Lines',
    suggestedAction: 'Suggested Action',
    autoFix: 'Auto Fix',
    editAndFix: 'Edit and Fix',
    retryProcessing: 'Retry Processing',
    retrying: 'Retrying...',
    back: 'Back',
    editPR: 'Edit PR',
    
    // 严重程度
    LOW_SEVERITY: 'Low',
    MEDIUM_SEVERITY: 'Medium',
    HIGH_SEVERITY: 'High',
    CRITICAL_SEVERITY: 'Critical',
    
    // 编辑页面
    editPurchaseRequest: 'Edit Purchase Request',
    createPurchaseRequest: 'Create Purchase Request',
    createNewPurchaseRequest: 'Create new purchase request',
    requestNumber: 'Request Number',
    systemGenerated: 'System generated',
    departmentBusinessUnit: 'Department/Business Unit',
    selectDepartment: 'Select Department',
    requesterName: 'Requester',
    enterRequesterName: 'Enter requester name',
    prTypeField: 'PR Type',
    selectPRType: 'Select PR Type',
    priorityField: 'Priority',
    budgetProjectCostCenter: 'Budget Project/Cost Center',
    notesField: 'Notes',
    purchaseBackgroundUsage: 'Describe purchase background, usage, etc.',
    
    // 交付要求
    deliveryRequirements: 'Delivery Requirements',
    targetWarehouse: 'Target Warehouse',
    selectTargetWarehouse: 'Select Target Warehouse',
    expectedDeliveryTime: 'Expected Delivery Time',
    shippingContactPerson: 'Shipping Contact Person',
    contactPersonName: 'Contact person name',
    contactPhone: 'Contact Phone',
    contactEmail: 'Contact Email',
    shippingAddressField: 'Shipping Address',
    countryField: 'Country',
    stateProvince: 'State/Province',
    selectState: 'Select State',
    cityField: 'City',
    enterCityName: 'Enter city name',
    address1Field: 'Address 1',
    streetAddress: 'Street address',
    zipCodeField: 'Zip Code',
    postalCode: 'Postal code',
    address2Optional: 'Address 2 (Optional)',
    apartmentFloorInfo: 'Apartment, floor, etc.',
    deliveryNotes: 'Delivery Notes',
    specialDeliveryRequirements: 'Special delivery requirements, notes, etc.',
    
    // 商品明细
    productDetails: 'Product Details',
    batchSettings: 'Batch Settings',
    addProduct: 'Add Product',
    batchSetCurrency: 'Batch Set Currency',
    selectCurrency: 'Select Currency',
    batchSetTaxRate: 'Batch Set Tax Rate (%)',
    batchSetSupplier: 'Batch Set Supplier',
    enterSupplierName: 'Enter supplier name',
    applyToAllProducts: 'Apply to All Products',
    noProductDetails: 'No product details, click "Add Product" to start selecting products',
    lineNumber: 'Line No.',
    productInfo: 'Product Info',
    quantityField: 'Quantity',
    unitField: 'Unit',
    currencyField: 'Currency',
    unitPriceField: 'Unit Price',
    taxRateField: 'Tax Rate (%)',
    taxAmountField: 'Tax Amount',
    taxInclusiveSubtotal: 'Tax Inclusive Subtotal',
    supplierField: 'Supplier',
    snManagement: 'SN Management',
    lotManagement: 'Lot Management',
    businessPurpose: 'Business Purpose',
    notesFieldTable: 'Notes',
    actionsField: 'Actions',
    
    // SN/批次管理
    requiresSN: 'Requires SN',
    requiresLot: 'Requires Lot',
    noSNRequired: 'No SN Required',
    noLotRequired: 'No Lot Required',
    specifySerialNumbers: 'Specify SN (comma separated)',
    specifyLotNumbers: 'Specify Lot (comma separated)',
    alreadySet: 'Set',
    items: 'items',
    advancedManagement: 'Advanced Management',
    quoteManagement: 'Quote Management',
    quote: 'Quote',
    
    // 汇总
    summary: 'Summary',
    products: 'products',
    
    // 按钮和操作
    saveDraft: 'Save Draft',
    saveAndSubmit: 'Save and Submit',
    selectOrEnterSupplier: 'Select or enter supplier',
    
    // 确认对话框
    confirmCancelPR: 'Confirm cancel purchase request?',
    cancelDescription: 'Cannot submit for approval or generate PO after cancellation',
    confirmCancel: 'Confirm Cancel',
    keep: 'Keep',
    confirmDelete: 'Confirm delete?',
    deleteDescription: 'Cannot recover after deletion',
    confirmDeleteAction: 'Confirm Delete',
    submitPR: 'Submit purchase request?',
    submitDescription: 'Cannot edit after submission to approval process',
    confirmSubmit: 'Confirm Submit',
    confirmApprove: 'Confirm approval?',
    approveDescription: 'Can generate PO after approval',
    confirmApproveAction: 'Confirm Approve',
    confirmReject: 'Confirm reject?',
    rejectDescription: 'Process terminates after rejection, reason required',
    confirmRejectAction: 'Confirm Reject',
    cancelUnlinkedPOLines: 'Cancel remaining lines not converted to PO?',
    cancelUnlinkedDescription: 'Lines already converted to PO cannot be cancelled, only remaining lines',
    rejectReason: 'Reject Reason',
    enterRejectReason: 'Please enter reject reason...',
    
    // PR类型
    regularPurchase: 'Regular Purchase',
    stockReplenishment: 'Stock Replenishment',
    projectPurchase: 'Project Purchase',
    internalTransfer: 'Internal Transfer',
    
    // 优先级类型
    normal: 'Normal',
    urgent: 'Urgent',
    veryUrgent: 'Very Urgent',
    
    // 列表页筛选和表头
    prStatus: 'PR Status',
    businessEntity: 'Business Entity',
    targetWarehouses: 'Target Warehouses',
    expectedDeliveryDate: 'Expected Delivery Date',
    skuCount: 'SKU Count',
    totalQty: 'Total Qty',
    estimatedAmount: 'Estimated Amount',
    created: 'Created',
    exceptionMark: 'Exception Mark',
    poGenerationStatus: 'PO Generation Status',
    latestUpdateTime: 'Latest Update Time',
    businessNo: 'Business No.',
    currentApprover: 'Current Approver',
    budgetProjectCostCenter: 'Budget Project/Cost Center',
    relatedPOInfo: 'Related PO Info',
    actions: 'Actions',
    
    // 筛选选项
    draft: 'Draft',
    submitted: 'New',
    approving: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    exception: 'Exception',
    partialPO: 'Partial PO',
    fullPO: 'Full PO',
    closed: 'Closed',
    
    // PO生成状态
    notGeneratedPO: 'Not Generated PO',
    partiallyGeneratedPO: 'Partially Generated PO',
    fullyGeneratedPO: 'Fully Generated PO',
    
    // 搜索和筛选
    searchPlaceholder: 'Search PR No., Business No., Requester, Department or Notes...',
    prNumber: 'PR Number',
    businessNumber: 'Business Number',
    requesterNumber: 'Requester No.',
    budgetProject: 'Budget Project',
    examplePRNumber: 'e.g.: PR202401100001',
    exampleBusinessNumber: 'e.g.: PROJ-2024-001',
    enterName: 'Enter name',
    exampleEmployeeNumber: 'e.g.: EMP001',
    enterApproverName: 'Enter approver name',
    exampleBudgetProject: 'e.g.: Q1-Marketing',
    
    // 批量操作
    batchSubmit: 'Batch Submit',
    batchCancel: 'Batch Cancel',
    batchGeneratePO: 'Batch Generate PO',
    noAvailableActions: 'No available actions for this status',
    downloadTemplate: 'Download Template',
    
    // 状态标签页
    multiWarehouse: 'Multi-Warehouse',
    confirmed: 'Confirmed',
    pending: 'Pending',
    unknown: 'Unknown',
    
    // 表格相关
    lineNo: 'Line {0}',
    
    // 新增页面字段
    selectState: 'Select State',
    cityName: 'City',
    enterCityName: 'Enter city name',
    address1: 'Address 1',
    streetAddress: 'Street address',
    zipCode: 'Zip Code',
    postalCode: 'Postal code',
    address2Optional: 'Address 2 (Optional)',
    apartmentFloorInfo: 'Apartment, floor, etc.',
    deliveryNotesField: 'Delivery Notes',
    specialDeliveryRequirements: 'Special delivery requirements, notes, etc.',
    
    // 编辑页面缺失的字段
    targetWarehouseLabel: 'Target Warehouse',
    selectTargetWarehouseLabel: 'Select Target Warehouse',
    expectedDeliveryTimeLabel: 'Expected Delivery Time',
    latestShipDateLabel: 'Latest Ship Date',
    shippingContactPersonLabel: 'Shipping Contact Person',
    contactPersonNamePlaceholder: 'Contact person name',
    shippingAddressLabel: 'Shipping Address',
    deliveryNotesLabel: 'Delivery Notes',
    batchSettingsLabel: 'Batch Settings',
    batchSetCurrencyLabel2: 'Batch Set Currency',
    batchSetTaxRateLabel2: 'Batch Set Tax Rate (%)',
    batchSetSupplierLabel2: 'Batch Set Supplier',
    applyToAllProductsLabel: 'Apply to All Products',
    quoteManagementLabel: 'Quote Management',
    advancedManagementLabel: 'Advanced Management',
    
    // 详情页面缺失的字段
    targetWarehouseDetail: 'Target Warehouse',
    expectedDeliveryTimeDetail: 'Expected Delivery Time',
    latestShipDateDetail: 'Latest Ship Date',
    shippingContactPersonDetail: 'Shipping Contact Person',
    shippingAddressDetail: 'Shipping Address',
    productDetailsLabel: 'Product Details',
    relatedPOInfoLabel: 'Related PO Information',
    approvalProcessLabel: 'Approval Process',
    
    // 地址相关
    countryLabel: 'Country',
    stateProvinceLabel: 'State/Province',
    cityLabel: 'City',
    detailedAddressLabel: 'Detailed Address',
    zipCodeLabel: 'Zip Code',
    
    // 其他标签
    contactPhoneLabel: 'Contact Phone',
    contactEmailLabel: 'Contact Email',
    receivingContactPersonLabel: 'Receiving Contact Person',
    
    // PO相关
    creationTimeLabel: 'Creation Time',
    supplierLabel: 'Supplier',
    statusLabel2: 'Status',
    poAmountLabel: 'PO Amount',
    productQuantityLabel: 'Product Quantity',
    expectedDeliveryTimeLabel2: 'Expected Delivery Time',
    actionsLabel2: 'Actions',
    viewLabel: 'View',
    downloadLabel: 'Download',
    
    // 状态相关
    confirmedLabel: 'Confirmed',
    pendingLabel: 'Pending',
    shippedLabel: 'Shipped',
    deliveredLabel: 'Delivered',
    unknownLabel: 'Unknown',
    
    // 汇总相关
    relatedPOCountLabel: 'Related PO Count',
    convertedToPOProductsLabel: 'Converted to PO Products',
    totalPOAmountLabel: 'Total PO Amount',
    
    // 审批流程相关
    approvedLabel: 'Approved',
    rejectedLabel: 'Rejected',
    pendingApprovalLabel: 'Pending Approval',
    
    // 供应商报价管理相关
    supplierQuoteManagementTitle: 'Supplier Quote Management',
    addQuote: 'Add Quote',
    directSelectSupplier: 'Direct Select Supplier (No Quote)',
    selectSupplierPlaceholder: 'Select Supplier',
    saveSelection: 'Save Selection',
    leadTime: 'Lead Time',
    moq: 'MOQ',
    validUntil: 'Valid Until',
    quotedLabel: 'Quoted',
    pendingQuoteLabel: 'Pending Quote',
    days: 'days',
    noQuoteRecords: 'No quote records, click "Add Quote" to start quoting',
    pleaseSelectSupplierAndPrice: 'Please fill in supplier and quote price',
    
    // 报价文件管理相关
    quoteFileManagement: 'Supplier Quote Management',
    quoteFiles: 'Quote Files',
    quoteRequests: 'Quote Requests',
    dragFilesHere: 'Drag files here or click to upload',
    supportedFormats: 'Supports PDF, DOC, DOCX, XLS, XLSX formats, max 10MB',
    selectFiles: 'Select Files',
    fileName: 'File Name',
    fileSize: 'File Size',
    uploadDate: 'Upload Date',
    description: 'Description',
    noQuoteFiles: 'No quote files, please upload supplier quote files',
    
    // 询价请求管理
    quoteRequestManagement: 'Quote Request Management',
    addQuoteRequest: 'Add Quote Request',
    supplierNameLabel: 'Supplier Name',
    enterSupplierNameLabel: 'Enter supplier name',
    dueDate: 'Due Date',
    quoteRequirementsNotes: 'Quote requirements and notes...',
    sendDate: 'Send Date',
    editLabel: 'Edit',
    noQuoteRequests: 'No quote requests, click "Add Quote Request" to start managing quotes',
    
    // 状态标签
    pendingReview: 'Pending Review',
    approvedStatus: 'Approved',
    rejectedStatus: 'Rejected',
    sentStatus: 'Sent',
    receivedStatus: 'Received',
    overdueStatus: 'Overdue',
    
    // 批量设置
    batchSetCurrencyLabel: 'Batch Set Currency',
    selectCurrencyPlaceholder: 'Select Currency',
    batchSetTaxRateLabel: 'Batch Set Tax Rate (%)',
    taxRateExample: 'e.g.: 13',
    batchSetSupplierLabel: 'Batch Set Supplier',
    enterSupplierNamePlaceholder: 'Enter supplier name',
    applyToAllProductsButton: 'Apply to All Products',
    
    // SN/批次管理标签
    requiresSNLabel: 'Requires SN',
    requiresLotLabel: 'Requires Lot',
    noSNRequiredLabel: 'No SN Required',
    noLotRequiredLabel: 'No Lot Required',
    specifySNPlaceholder: 'Specify SN (comma separated)',
    specifyLotPlaceholder: 'Specify Lot (comma separated)',
    alreadySetLabel: 'Set',
    itemsCount: 'items',
    advancedManagementButton: 'Advanced Management',
    quoteManagementButton: 'Quote Management',
    quoteLabel: 'Quote',
    
    // 商品表格占位符
    businessPurposePlaceholder: 'Business Purpose',
    notesPlaceholder: 'Notes',
    selectOrEnterSupplierPlaceholder: 'Select or enter supplier',
    
    // 产品选择弹窗
    selectProducts: 'Select Products',
    searchProductsPlaceholder: 'Search product name, SKU, specifications or brand...',
    reset: 'Reset',
    totalProducts: 'Total {0} products, {1} selected',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    select: 'Select',
    productName: 'Product Name',
    specifications: 'Specifications',
    brand: 'Brand',
    category: 'Category',
    unitPrice: 'Unit Price',
    costPrice: 'Cost Price',
    stockStatus: 'Stock Status',
    traceabilityManagement: 'Traceability Management',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    addSelectedProducts: 'Add Selected Products ({0})',
    
    // 供应商报价弹窗
    supplierQuoteManagement: 'Supplier Quote Management',
    supplierQuote: 'Supplier Quote',
    currentSupplier: 'Current Supplier',
    quotePrice: 'Quote Price',
    quoteValidUntil: 'Quote Valid Until',
    attachQuoteFile: 'Attach Quote File',
    selectSupplier: 'Select Supplier',
    enterQuotePrice: 'Enter quote price',
    selectValidDate: 'Select valid date',
    uploadQuoteFile: 'Upload quote file',
    
    // SN/批次管理弹窗
    snLotManagement: 'SN/Lot Management',
    serialNumberManagement: 'Serial Number Management',
    lotNumberManagement: 'Lot Number Management',
    specifySerialNumbers: 'Specify Serial Numbers',
    specifyLotNumbers: 'Specify Lot Numbers',
    enterSerialNumbers: 'Enter serial numbers (one per line)',
    enterLotNumbers: 'Enter lot numbers (one per line)',
    snLotNotes: 'SN/Lot Notes',
    enterNotes: 'Enter notes',
    
    // PO相关翻译
    purchaseOrders: 'Purchase Orders',
    managePurchaseOrders: 'Manage and track purchase orders from suppliers',
    poNo: 'PO No.',
    originalPoNo: 'Original PO No.',
    prNos: 'PR No.',
    referenceNo: 'Reference No.',
    supplierName: 'Supplier Name',
    destination: 'Destination',
    receiptType: 'Receipt Type',
    exceptions: 'Exceptions',
    totalPrice: 'Total Price',
    shippingCarrier: 'Shipping Carrier',
    expectedShipDate: 'Expected Ship Date',
    expectedArrivalDate: 'Expected Arrival Date',
    actualArrivalDate: 'Actual Arrival Date',
    toCity: 'To City',
    toState: 'To State',
    toCountry: 'To Country',
    shippingService: 'Shipping Service',
    shippingNotes: 'Shipping Notes',
    purchaseOrderDate: 'Purchase Order Date',
    warehouseName: 'Warehouse Name',
    itemCount: 'Item Count',
    
    // PO状态
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    RECEIVED: 'Received',
    ON_HOLD: 'On Hold',
    
    // 收货类型
    STANDARD: 'Standard',
    CROSS_DOCK: 'Cross Dock',
    DROP_SHIP: 'Drop Ship',
    RETURN_TO_VENDOR: 'Return to Vendor',
    TRANSFER: 'Transfer',
    
    // PO操作
    track: 'Track',
    receive: 'Receive',
    download: 'Download',
    resume: 'Resume',
    batchSubmitPO: 'Batch Submit',
    batchConfirm: 'Batch Confirm',
    batchCancel: 'Batch Cancel',
    batchTrack: 'Batch Track',
    batchResume: 'Batch Resume',
    batchUpdate: 'Batch Update',
    newPO: 'New PO',
    createManuallyPO: 'Create Manually',
    importFromFilePO: 'Import from File',
    downloadTemplatePO: 'Download Template',
    
    // PO搜索和筛选
    searchPOPlaceholder: 'Search by PO No., Original PO No., Reference No., Supplier, or Destination...',
    
    // PO状态标签页
    draft: 'Draft',
    submitted: 'Submitted',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    received: 'Received',
    onHold: 'On Hold',
    cancelled: 'Cancelled',
  }
}

export type TranslationKey = keyof typeof translations.zh

// 获取初始语言设置
const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'zh' || saved === 'en')) {
      return saved
    }
  }
  return 'zh' // 默认中文
}

// 全局语言状态
let globalLanguage: Language = getInitialLanguage()
const languageListeners: Set<(lang: Language) => void> = new Set()

// 通知所有监听器语言变化
const notifyLanguageChange = (lang: Language) => {
  globalLanguage = lang
  languageListeners.forEach(listener => listener(lang))
}

// 国际化Hook
export function useI18n() {
  const [language, setLanguage] = React.useState<Language>(globalLanguage)
  
  React.useEffect(() => {
    // 添加监听器
    const listener = (lang: Language) => {
      setLanguage(lang)
    }
    languageListeners.add(listener)
    
    // 清理函数
    return () => {
      languageListeners.delete(listener)
    }
  }, [])
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key
  }
  
  const switchLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
    notifyLanguageChange(lang)
  }
  
  return { t, language, switchLanguage }
}