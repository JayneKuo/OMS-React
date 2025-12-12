// React import for useState
import * as React from 'react'

// 简单的国际化系统
export type Language = 'zh' | 'en'

// 完整的OMS系统翻译文本
export const translations = {
  zh: {
    // ==================== 通用 ====================
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
    search: '搜索',
    filter: '筛选',
    export: '导出',
    import: '导入',
    add: '添加',
    remove: '移除',
    close: '关闭',
    open: '打开',
    submit: '提交',
    reset: '重置',
    refresh: '刷新',
    loading: '加载中...',
    noData: '暂无数据',
    total: '总计',
    page: '页',
    of: '共',
    items: '项',
    
    // ==================== 导航和模块 ====================
    dashboard: '仪表板',
    orders: '订单管理',
    product: '商品管理',
    inventory: '库存管理',
    purchase: '采购管理',
    logistics: '物流管理',
    returns: '退货管理',
    customerManagement: '客户管理',
    merchantManagement: '商户管理',
    integrations: '集成管理',
    automation: '自动化',
    events: '事件管理',
    workspace: '工作空间',
    pom: 'POM管理',
    
    // 导航相关
    tenant: '租户',
    merchant: '商户',
    searchTenants: '搜索租户...',
    searchMerchants: '搜索商户...',
    noTenantsFound: '未找到租户',
    noMerchantsFound: '未找到商户',
    merchants: '商户',
    apply: '应用',
    language: '语言',
    timezone: '时区',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    system: '系统',
    logout: '退出登录',
    settings: '设置',
    
    // 采购子模块
    purchaseRequest: '采购申请',
    purchaseOrder: '采购订单',
    advanceShipNotice: '预发货通知',
    receipts: '收货',
    receiptConfirm: '收货确认',
    
    // ==================== PR相关 ====================
    prNo: 'PR编号',
    businessNo: '业务编号',
    department: '部门',
    requester: '申请人',
    requesterNo: '申请人工号',
    prType: 'PR类型',
    priority: '优先级',
    currency: '币种',
    budgetProject: '预算项目',
    notes: '备注',
    
    // PR列表页筛选和表头
    prStatus: 'PR状态',
    exceptionMark: '异常标记',
    poGenerationStatus: 'PO生成情况',
    businessEntity: '业务实体',
    targetWarehouses: '目标仓库',
    expectedDeliveryDate: '期望交货日期',
    skuCount: 'SKU数量',
    totalQty: '总数量',
    estimatedAmount: '预估金额',
    latestUpdateTime: '最新更新时间',
    currentApprover: '当前审批人',
    budgetProjectCostCenter: '预算项目/成本中心',
    relatedPOInfo: '关联PO信息',
    
    // PR详情页字段
    requestNumber: '请求编号',
    departmentBusinessUnit: '部门/事业部',
    requesterName: '申请人',
    prTypeField: 'PR类型',
    priorityField: '优先级',
    creationTimeLabel: '创建时间',
    expectedDeliveryTimeDetail: '预期到货时间',
    targetWarehouseDetail: '目标仓库',
    latestShipDateDetail: '最晚发货日期',
    multiWarehouse: '多仓库',
    
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
    
    // PR类型
    regularPurchase: '常规采购',
    stockReplenishment: '备货',
    projectPurchase: '项目采购',
    internalTransfer: '内部调拨',
    

    
    // PO生成状态
    notGeneratedPO: '未生成PO',
    partiallyGeneratedPO: '部分生成PO',
    fullyGeneratedPO: '已完全生成PO',
    

    
    // 按钮和操作
    saveDraft: '保存草稿',
    saveAndSubmit: '保存并提交',
    selectOrEnterSupplier: '选择或输入供应商',
    
    // 交付备注字段
    deliveryNotesField: '交付备注',
    
    // 详情页面标签
    productDetailsLabel: '商品明细',
    relatedPOInfoLabel: '关联PO信息',
    approvalProcessLabel: '审批流程',
    
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
    
    // 编辑页面
    editPurchaseRequest: '编辑采购申请',
    createPurchaseRequest: '新建采购申请',
    createNewPurchaseRequest: '创建新的采购申请单',
    systemGenerated: '系统自动生成',
    selectDepartment: '选择部门',
    enterRequesterName: '输入申请人姓名',
    selectPRType: '选择PR类型',
    notesField: '备注',
    purchaseBackgroundUsage: '说明采购背景、用途等',
    
    // 编辑页面标签
    targetWarehouseLabel: '目标仓库',
    selectTargetWarehouseLabel: '选择目标仓库',
    expectedDeliveryTimeLabel: '预期到货时间',
    latestShipDateLabel: '最晚发货日期',
    shippingContactPersonLabel: '收货联系人',
    contactPersonNamePlaceholder: '收货联系人姓名',
    shippingAddressLabel: '收货地址',
    deliveryNotesLabel: '交付备注',
    batchSettingsLabel: '批量设置',
    
    // 交付要求
    deliveryRequirements: '交付要求',
    targetWarehouse: '目标仓库',
    selectTargetWarehouse: '选择目标仓库',
    expectedDeliveryTime: '预期到货时间',
    latestShipDate: '最晚发货日期',
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
    
    // 产品选择弹窗
    selectProducts: '选择商品',
    searchProductsPlaceholder: '搜索商品名称、SKU、规格或品牌...',
    resetFilter: '重置',
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
    
    // ==================== 状态 ====================
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
    CONFIRMED: '已确认',
    SHIPPED: '已发货',
    RECEIVED: '已收货',
    ON_HOLD: '暂停',
    
    // 状态标签页用的小写版本
    draftStatus: '草稿',
    submittedStatus: '已提交',
    approvingStatus: '已提交',
    approvedStatus: '通过',
    rejectedStatus: '拒绝',
    cancelledStatus: '已取消',
    exceptionStatus: '异常',
    partialPOStatus: '部分PO',
    fullPOStatus: '已关闭',
    confirmedStatus: '已确认',
    shippedStatus: '已发货',
    receivedStatus: '已收货',
    onHoldStatus: '暂停',
    closedStatus: '已关闭',
    
    // 优先级
    LOW: '低',
    NORMAL: '普通',
    HIGH: '高',
    URGENT: '紧急',
    normal: '普通',
    urgent: '紧急',
    veryUrgent: '非常紧急',
    
    // 收货类型
    STANDARD: '标准',
    CROSS_DOCK: '直通',
    DROP_SHIP: '直发',
    RETURN_TO_VENDOR: '退回供应商',
    TRANSFER: '调拨',
    
    // ==================== 操作 ====================
    generatePO: '生成PO',
    continueGeneratePO: '继续生成PO',
    cancelUnlinkedItems: '取消',
    viewDetails: '查看详情',
    copy: '复制',
    submitForApproval: '提交审批',
    approve: '审批通过',
    reject: '拒绝',
    fix: '修复',
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
    quoteFilesTab: '报价文件',
    
    // ==================== 搜索和筛选 ====================
    searchPlaceholder: '搜索PR编号、业务单号、申请人、部门或备注...',
    searchPOPlaceholder: '搜索PO编号、原始PO编号、参考编号、供应商或目的地...',
    prNumber: 'PR编号',
    businessNumber: '业务单号',
    requesterNumber: '申请人工号',
    budgetProjectField: '预算项目',
    examplePRNumber: '例如：PR202401100001',
    exampleBusinessNumber: '例如：PROJ-2024-001',
    enterName: '输入姓名',
    exampleEmployeeNumber: '例如：EMP001',
    enterApproverName: '输入审批人姓名',
    exampleBudgetProject: '例如：Q1-Marketing',
    
    // ==================== 批量操作 ====================
    batchSubmit: '批量提交',
    batchDelete: '批量删除',
    batchGeneratePO: '批量生成PO',
    noAvailableActions: '此状态无可用操作',
    downloadTemplate: '下载模板',
    
    // 报价文件管理状态
    pendingReview: '待审核',
    sentStatus: '已发送',
    overdueStatus: '已逾期',
    
    // 询价管理
    quoteRequestManagement: '询价请求管理',
    addQuoteRequest: '新增询价',
    supplierNameLabel: '供应商名称',
    enterSupplierNameLabel: '输入供应商名称',
    dueDate: '截止日期',
    quoteRequirementsNotes: '询价要求和说明...',
    sendDate: '发送日期',
    editLabel: '编辑',
    noQuoteRequests: '暂无询价请求，点击"新增询价"开始管理询价',
    statusLabel2: '状态',
    actionsLabel2: '操作',
  },
  en: {
    // ==================== Common ====================
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
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    add: 'Add',
    remove: 'Remove',
    close: 'Close',
    open: 'Open',
    submit: 'Submit',
    reset: 'Reset',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No Data',
    total: 'Total',
    page: 'Page',
    of: 'of',
    items: 'items',
    
    // ==================== Navigation and Modules ====================
    dashboard: 'Dashboard',
    orders: 'Orders',
    product: 'Products',
    inventory: 'Inventory',
    purchase: 'Purchase',
    logistics: 'Logistics',
    returns: 'Returns',
    customerManagement: 'Customers',
    merchantManagement: 'Merchants',
    integrations: 'Integrations',
    automation: 'Automation',
    events: 'Events',
    workspace: 'Workspace',
    pom: 'POM',
    
    // Navigation related
    tenant: 'Tenant',
    merchant: 'Merchant',
    searchTenants: 'Search tenants...',
    searchMerchants: 'Search merchants...',
    noTenantsFound: 'No tenants found',
    noMerchantsFound: 'No merchants found',
    merchants: 'merchants',
    apply: 'Apply',
    language: 'Language',
    timezone: 'Timezone',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    logout: 'Logout',
    settings: 'Settings',
    
    // Purchase sub-modules
    purchaseRequest: 'Requisitions',
    purchaseOrder: 'Orders',
    advanceShipNotice: 'Shipments',
    receipts: 'Receiving',
    receiptConfirm: 'Confirmations',
    
    // ==================== PR Related ====================
    prNo: 'Request ID',
    businessNo: 'Business Ref',
    department: 'Department',
    requester: 'Requestor',
    requesterNo: 'Employee ID',
    prType: 'Request Type',
    priority: 'Priority',
    currency: 'Currency',
    budgetProject: 'Project Code',
    notes: 'Comments',
    
    // PR List Filters and Headers
    prStatus: 'Status',
    exceptionMark: 'Exception',
    poGenerationStatus: 'PO Status',
    businessEntity: 'Business Unit',
    targetWarehouses: 'Delivery Location',
    expectedDeliveryDate: 'Required Date',
    skuCount: 'Items',
    totalQty: 'Quantity',
    estimatedAmount: 'Budget',
    latestUpdateTime: 'Last Updated',
    currentApprover: 'Approver',
    budgetProjectCostCenter: 'Project/Cost Center',
    relatedPOInfo: 'PO Information',
    
    // PR Detail Page Fields
    requestNumber: 'Request ID',
    departmentBusinessUnit: 'Department/Business Unit',
    requesterName: 'Requestor',
    prTypeField: 'Request Type',
    priorityField: 'Priority',
    creationTimeLabel: 'Created',
    expectedDeliveryTimeDetail: 'Required Date',
    targetWarehouseDetail: 'Delivery Location',
    latestShipDateDetail: 'Latest Ship Date',
    multiWarehouse: 'Multiple Locations',
    
    // Exception Handling Page
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
    
    // Severity Levels
    LOW_SEVERITY: 'Low',
    MEDIUM_SEVERITY: 'Medium',
    HIGH_SEVERITY: 'High',
    CRITICAL_SEVERITY: 'Critical',
    
    // PR Types
    regularPurchase: 'Regular Purchase',
    stockReplenishment: 'Stock Replenishment',
    projectPurchase: 'Project Purchase',
    internalTransfer: 'Internal Transfer',
    

    
    // PO Generation Status
    notGeneratedPO: 'Not Generated PO',
    partiallyGeneratedPO: 'Partially Generated PO',
    fullyGeneratedPO: 'Fully Generated PO',
    

    
    // Table Related
    lineNumber: 'Line No.',
    
    // Buttons and Actions
    saveDraft: 'Save Draft',
    saveAndSubmit: 'Save and Submit',
    selectOrEnterSupplier: 'Select or enter supplier',
    
    // Delivery Notes Field
    deliveryNotesField: 'Delivery Notes',
    
    // Detail Page Labels
    productDetailsLabel: 'Product Details',
    relatedPOInfoLabel: 'Related PO Information',
    approvalProcessLabel: 'Approval Process',
    
    // Quote File Management
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
    
    // Edit Page
    editPurchaseRequest: 'Edit Purchase Request',
    createPurchaseRequest: 'Create Purchase Request',
    createNewPurchaseRequest: 'Create new purchase request',
    systemGenerated: 'System generated',
    selectDepartment: 'Select Department',
    enterRequesterName: 'Enter requester name',
    selectPRType: 'Select PR Type',
    notesField: 'Notes',
    purchaseBackgroundUsage: 'Describe purchase background, usage, etc.',
    
    // Edit Page Labels
    targetWarehouseLabel: 'Target Warehouse',
    selectTargetWarehouseLabel: 'Select Target Warehouse',
    expectedDeliveryTimeLabel: 'Expected Delivery Time',
    latestShipDateLabel: 'Latest Ship Date',
    shippingContactPersonLabel: 'Shipping Contact Person',
    contactPersonNamePlaceholder: 'Contact person name',
    shippingAddressLabel: 'Shipping Address',
    deliveryNotesLabel: 'Delivery Notes',
    batchSettingsLabel: 'Batch Settings',
    
    // Delivery Requirements
    deliveryRequirements: 'Delivery Requirements',
    targetWarehouse: 'Target Warehouse',
    selectTargetWarehouse: 'Select Target Warehouse',
    expectedDeliveryTime: 'Expected Delivery Time',
    latestShipDate: 'Latest Ship Date',
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
    
    // Product Details
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
    
    // Product Selection Dialog
    selectProducts: 'Select Products',
    searchProductsPlaceholder: 'Search product name, SKU, specifications or brand...',
    resetFilter: 'Reset',
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
    
    // Supplier Quote Dialog
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
    
    // SN/Lot Management Dialog
    snLotManagement: 'SN/Lot Management',
    serialNumberManagement: 'Serial Number Management',
    lotNumberManagement: 'Lot Number Management',
    specifySerialNumbers: 'Specify Serial Numbers',
    specifyLotNumbers: 'Specify Lot Numbers',
    enterSerialNumbers: 'Enter serial numbers (one per line)',
    enterLotNumbers: 'Enter lot numbers (one per line)',
    snLotNotes: 'SN/Lot Notes',
    enterNotes: 'Enter notes',
    
    // ==================== Status ====================
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
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    RECEIVED: 'Received',
    ON_HOLD: 'On Hold',
    
    // Status tabs lowercase versions
    draft: 'Draft',
    submitted: 'Submitted',
    approving: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    exception: 'Exception',
    partialPO: 'Partial PO',
    fullPO: 'Full PO',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    received: 'Received',
    onHold: 'On Hold',
    closed: 'Closed',
    
    // Priority
    LOW: 'Low',
    NORMAL: 'Normal',
    HIGH: 'High',
    URGENT: 'Urgent',
    normal: 'Normal',
    urgent: 'Urgent',
    veryUrgent: 'Very Urgent',
    
    // Status labels lowercase versions
    draftStatus: 'Draft',
    submittedStatus: 'Submitted',
    approvingStatus: 'Submitted',
    approvedStatus: 'Approved',
    rejectedStatus: 'Rejected',
    cancelledStatus: 'Cancelled',
    exceptionStatus: 'Exception',
    partialPOStatus: 'Partial PO',
    fullPOStatus: 'Full PO',
    confirmedStatus: 'Confirmed',
    shippedStatus: 'Shipped',
    receivedStatus: 'Received',
    onHoldStatus: 'On Hold',
    closedStatus: 'Closed',
    
    // Receipt Type
    STANDARD: 'Standard',
    CROSS_DOCK: 'Cross Dock',
    DROP_SHIP: 'Drop Ship',
    RETURN_TO_VENDOR: 'Return to Vendor',
    TRANSFER: 'Transfer',
    
    // ==================== Actions ====================
    generatePO: 'Generate PO',
    continueGeneratePO: 'Continue Generate PO',
    cancelUnlinkedItems: 'Cancel',
    viewDetails: 'View Details',
    copy: 'Copy',
    submitForApproval: 'Submit for Approval',
    approve: 'Approve',
    reject: 'Reject',
    fix: 'Fix',
    batchActions: 'Batch Actions',
    batchExport: 'Batch Export',
    clearSelection: 'Clear Selection',
    newPR: 'New Request',
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
    basicInfo: 'Request Details',
    commercialItems: 'Line Items',
    approvalHistory: 'Approval History',
    relatedPO: 'Purchase Orders',
    quoteFilesTab: 'Quotations',
    
    // ==================== Search and Filter ====================
    searchPlaceholder: 'Search by Request ID, Business Ref, Requestor, Department or Comments...',
    searchPOPlaceholder: 'Search by PO No., Original PO No., Reference No., Supplier, or Destination...',
    prNumber: 'Request ID',
    businessNumber: 'Business Reference',
    requesterNumber: 'Employee ID',
    budgetProjectField: 'Project Code',
    examplePRNumber: 'e.g.: REQ202401100001',
    exampleBusinessNumber: 'e.g.: BIZ-2024-001',
    enterName: 'Enter name',
    exampleEmployeeNumber: 'e.g.: EMP001',
    enterApproverName: 'Enter approver name',
    exampleBudgetProject: 'e.g.: Q1-MKT-001',
    
    // ==================== Batch Actions ====================
    batchSubmit: 'Batch Submit',
    batchDelete: 'Batch Delete',
    batchGeneratePO: 'Batch Generate PO',
    noAvailableActions: 'No available actions for this status',
    downloadTemplate: 'Download Template',
    
    // Quote File Management Status
    pendingReview: 'Pending Review',
    sentStatus: 'Sent',
    overdueStatus: 'Overdue',
    
    // Quote Request Management
    quoteRequestManagement: 'Quote Request Management',
    addQuoteRequest: 'Add Quote Request',
    supplierNameLabel: 'Supplier Name',
    enterSupplierNameLabel: 'Enter supplier name',
    dueDate: 'Due Date',
    quoteRequirementsNotes: 'Quote requirements and notes...',
    sendDate: 'Send Date',
    editLabel: 'Edit',
    noQuoteRequests: 'No quote requests, click "Add Quote Request" to start managing quotes',
    statusLabel2: 'Status',
    actionsLabel2: 'Actions',

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

// 国际化Hook - 优化性能
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
  
  // 使用 useMemo 缓存翻译函数，避免每次渲染都创建新函数
  const t = React.useMemo(() => {
    return (key: TranslationKey): string => {
      return translations[language][key] || key
    }
  }, [language])
  
  // 使用 useCallback 缓存语言切换函数
  const switchLanguage = React.useCallback((lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
    notifyLanguageChange(lang)
  }, [])
  
  return { t, language, switchLanguage }
}