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
    search: '搜索',
    language: '语言',
    timezone: '时区',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    system: '系统',
    logout: '退出登录',
    
    // 采购子模块
    purchaseRequest: '采购申请',
    purchaseOrder: '采购订单',
    advanceShipNotice: '预发货通知',
    receipts: '收货',
    receiptConfirm: '收货确认',
    
    // ==================== 仪表板 ====================
    totalOrders: '总订单数',
    activeProducts: '活跃商品',
    totalCustomers: '总客户数',
    pendingOrders: '待处理订单',
    completedOrders: '已完成订单',
    revenue: '营收',
    recentOrders: '最近订单',
    orderTrends: '订单趋势',
    topProducts: '热销商品',
    lowStockAlerts: '库存预警',
    welcomeMessage: '欢迎使用您的订单管理系统',
    newOrdersToday: '今天有 {0} 个新订单',
    fromLastMonth: '较上月',
    quickActions: '快捷操作',
    commonTasks: '常用任务和快捷方式',
    createNewOrder: '创建新订单',
    addProduct: '添加商品',
    processReturns: '处理退货',
    viewReports: '查看报告',
    overview: '概览',
    analytics: '分析',
    reports: '报告',
    
    // ==================== 订单管理 ====================
    orderNo: '订单编号',
    customer: '客户',
    orderDate: '订单日期',
    amount: '金额',
    orderStatus: '订单状态',
    paymentStatus: '支付状态',
    shippingStatus: '配送状态',
    orderDetails: '订单详情',
    orderItems: '订单商品',
    shippingAddress: '配送地址',
    billingAddress: '账单地址',
    
    // 订单状态
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
    refunded: '已退款',
    
    // ==================== 商品管理 ====================
    productName: '商品名称',
    productCode: '商品编码',
    sku: 'SKU',
    category: '分类',
    brand: '品牌',
    price: '价格',
    costPrice: '成本价',
    stockQuantity: '库存数量',
    description: '描述',
    specifications: '规格',
    images: '图片',
    attributes: '属性',
    variants: '变体',
    
    // ==================== 库存管理 ====================
    warehouse: '仓库',
    location: '库位',
    availableStock: '可用库存',
    reservedStock: '预留库存',
    inTransitStock: '在途库存',
    stockMovement: '库存变动',
    stockAdjustment: '库存调整',
    stockTransfer: '库存调拨',
    stockAlert: '库存预警',
    reorderPoint: '补货点',
    maxStock: '最大库存',
    minStock: '最小库存',
    
    // ==================== 采购管理 ====================
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
    
    // PO相关
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
    
    // 供应商管理
    supplier: '供应商',
    supplierCode: '供应商代码',
    supplierType: '供应商类型',
    contactPerson: '联系人',
    phone: '电话',
    email: '邮箱',
    address: '地址',
    paymentTerms: '付款条件',
    deliveryTerms: '交货条件',
    
    // ==================== 物流管理 ====================
    shipment: '货运',
    tracking: '跟踪',
    carrier: '承运商',
    trackingNumber: '跟踪号',
    shipmentDate: '发货日期',
    estimatedDelivery: '预计送达',
    actualDelivery: '实际送达',
    shipmentStatus: '货运状态',
    
    // ==================== 退货管理 ====================
    returnNo: '退货编号',
    returnReason: '退货原因',
    returnDate: '退货日期',
    returnStatus: '退货状态',
    refundAmount: '退款金额',
    returnItems: '退货商品',
    
    // ==================== 客户管理 ====================
    customerName: '客户姓名',
    customerCode: '客户编码',
    customerType: '客户类型',
    registrationDate: '注册日期',
    lastOrderDate: '最后订单日期',
    totalOrders: '总订单数',
    totalSpent: '总消费',
    customerLevel: '客户等级',
    
    // ==================== 商户管理 ====================
    merchantName: '商户名称',
    merchantCode: '商户编码',
    merchantType: '商户类型',
    businessLicense: '营业执照',
    taxNumber: '税号',
    bankAccount: '银行账户',
    settlementCycle: '结算周期',
    commissionRate: '佣金比例',
    
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
    
    // 优先级
    LOW: '低',
    NORMAL: '普通',
    HIGH: '高',
    URGENT: '紧急',
    
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
    quoteFiles: '报价文件',
    
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
    
    // ==================== 状态标签页 ====================
    draft: '草稿',
    submitted: '已提交',
    confirmed: '已确认',
    shipped: '已发货',
    received: '已收货',
    onHold: '暂停',
    cancelled: '已取消',
    
    // ==================== 批量操作 ====================
    batchSubmit: '批量提交',
    batchDelete: '批量删除',
    batchGeneratePO: '批量生成PO',
    noAvailableActions: '此状态无可用操作',
    downloadTemplate: '下载模板',
    
    // ==================== 表单和对话框 ====================
    required: '必填',
    optional: '可选',
    pleaseSelect: '请选择',
    pleaseEnter: '请输入',
    invalidFormat: '格式不正确',
    fieldRequired: '此字段为必填项',
    
    // ==================== 日期和时间 ====================
    today: '今天',
    yesterday: '昨天',
    thisWeek: '本周',
    thisMonth: '本月',
    lastMonth: '上月',
    thisYear: '今年',
    
    // ==================== 文件操作 ====================
    upload: '上传',
    uploadFile: '上传文件',
    downloadFile: '下载文件',
    fileSize: '文件大小',
    fileName: '文件名',
    fileType: '文件类型',
    
    // ==================== 权限和用户 ====================
    user: '用户',
    role: '角色',
    permission: '权限',
    login: '登录',
    logout: '退出',
    profile: '个人资料',
    settings: '设置',
    
    // ==================== 系统消息 ====================
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    saveSuccess: '保存成功',
    deleteSuccess: '删除成功',
    operationSuccess: '操作成功',
    operationFailed: '操作失败',
    networkError: '网络错误',
    serverError: '服务器错误',
    
    // ==================== 分页 ====================
    previousPage: '上一页',
    nextPage: '下一页',
    firstPage: '首页',
    lastPage: '末页',
    pageSize: '每页显示',
    totalRecords: '总记录数',
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
    orders: 'Order Management',
    product: 'Product Management',
    inventory: 'Inventory Management',
    purchase: 'Purchase Management',
    logistics: 'Logistics Management',
    returns: 'Returns Management',
    customerManagement: 'Customer Management',
    merchantManagement: 'Merchant Management',
    integrations: 'Integrations',
    automation: 'Automation',
    events: 'Event Management',
    workspace: 'Workspace',
    pom: 'POM Management',
    
    // Navigation related
    tenant: 'Tenant',
    merchant: 'Merchant',
    searchTenants: 'Search tenants...',
    searchMerchants: 'Search merchants...',
    noTenantsFound: 'No tenants found',
    noMerchantsFound: 'No merchants found',
    merchants: 'merchants',
    apply: 'Apply',
    search: 'Search',
    language: 'Language',
    timezone: 'Timezone',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    logout: 'Logout',
    
    // Purchase sub-modules
    purchaseRequest: 'Purchase Request',
    purchaseOrder: 'Purchase Order',
    advanceShipNotice: 'Advance Ship Notice',
    receipts: 'Receipts',
    receiptConfirm: 'Receipt Confirm',
    
    // ==================== Dashboard ====================
    totalOrders: 'Total Orders',
    activeProducts: 'Active Products',
    totalCustomers: 'Total Customers',
    pendingOrders: 'Pending Orders',
    completedOrders: 'Completed Orders',
    revenue: 'Revenue',
    recentOrders: 'Recent Orders',
    orderTrends: 'Order Trends',
    topProducts: 'Top Products',
    lowStockAlerts: 'Low Stock Alerts',
    welcomeMessage: 'Welcome to your order management system',
    newOrdersToday: 'You have {0} new orders today',
    fromLastMonth: 'from last month',
    quickActions: 'Quick Actions',
    commonTasks: 'Common tasks and shortcuts',
    createNewOrder: 'Create New Order',
    addProduct: 'Add Product',
    processReturns: 'Process Returns',
    viewReports: 'View Reports',
    overview: 'Overview',
    analytics: 'Analytics',
    reports: 'Reports',
    
    // ==================== Order Management ====================
    orderNo: 'Order No.',
    customer: 'Customer',
    orderDate: 'Order Date',
    amount: 'Amount',
    orderStatus: 'Order Status',
    paymentStatus: 'Payment Status',
    shippingStatus: 'Shipping Status',
    orderDetails: 'Order Details',
    orderItems: 'Order Items',
    shippingAddress: 'Shipping Address',
    billingAddress: 'Billing Address',
    
    // Order Status
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    
    // ==================== Product Management ====================
    productName: 'Product Name',
    productCode: 'Product Code',
    sku: 'SKU',
    category: 'Category',
    brand: 'Brand',
    price: 'Price',
    costPrice: 'Cost Price',
    stockQuantity: 'Stock Quantity',
    description: 'Description',
    specifications: 'Specifications',
    images: 'Images',
    attributes: 'Attributes',
    variants: 'Variants',
    
    // ==================== Inventory Management ====================
    warehouse: 'Warehouse',
    location: 'Location',
    availableStock: 'Available Stock',
    reservedStock: 'Reserved Stock',
    inTransitStock: 'In Transit Stock',
    stockMovement: 'Stock Movement',
    stockAdjustment: 'Stock Adjustment',
    stockTransfer: 'Stock Transfer',
    stockAlert: 'Stock Alert',
    reorderPoint: 'Reorder Point',
    maxStock: 'Max Stock',
    minStock: 'Min Stock',
    
    // ==================== Purchase Management ====================
    // PR Related
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
    
    // PO Related
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
    
    // Supplier Management
    supplier: 'Supplier',
    supplierCode: 'Supplier Code',
    supplierType: 'Supplier Type',
    contactPerson: 'Contact Person',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    paymentTerms: 'Payment Terms',
    deliveryTerms: 'Delivery Terms',
    
    // ==================== Logistics Management ====================
    shipment: 'Shipment',
    tracking: 'Tracking',
    carrier: 'Carrier',
    trackingNumber: 'Tracking Number',
    shipmentDate: 'Shipment Date',
    estimatedDelivery: 'Estimated Delivery',
    actualDelivery: 'Actual Delivery',
    shipmentStatus: 'Shipment Status',
    
    // ==================== Returns Management ====================
    returnNo: 'Return No.',
    returnReason: 'Return Reason',
    returnDate: 'Return Date',
    returnStatus: 'Return Status',
    refundAmount: 'Refund Amount',
    returnItems: 'Return Items',
    
    // ==================== Customer Management ====================
    customerName: 'Customer Name',
    customerCode: 'Customer Code',
    customerType: 'Customer Type',
    registrationDate: 'Registration Date',
    lastOrderDate: 'Last Order Date',
    totalOrders: 'Total Orders',
    totalSpent: 'Total Spent',
    customerLevel: 'Customer Level',
    
    // ==================== Merchant Management ====================
    merchantName: 'Merchant Name',
    merchantCode: 'Merchant Code',
    merchantType: 'Merchant Type',
    businessLicense: 'Business License',
    taxNumber: 'Tax Number',
    bankAccount: 'Bank Account',
    settlementCycle: 'Settlement Cycle',
    commissionRate: 'Commission Rate',
    
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
    
    // Priority
    LOW: 'Low',
    NORMAL: 'Normal',
    HIGH: 'High',
    URGENT: 'Urgent',
    
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
    
    // PO Actions
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
    
    // ==================== Search and Filter ====================
    searchPlaceholder: 'Search PR No., Business No., Requester, Department or Notes...',
    searchPOPlaceholder: 'Search by PO No., Original PO No., Reference No., Supplier, or Destination...',
    prNumber: 'PR Number',
    businessNumber: 'Business Number',
    requesterNumber: 'Requester No.',
    budgetProjectField: 'Budget Project',
    examplePRNumber: 'e.g.: PR202401100001',
    exampleBusinessNumber: 'e.g.: PROJ-2024-001',
    enterName: 'Enter name',
    exampleEmployeeNumber: 'e.g.: EMP001',
    enterApproverName: 'Enter approver name',
    exampleBudgetProject: 'e.g.: Q1-Marketing',
    
    // ==================== Status Tabs ====================
    draft: 'Draft',
    submitted: 'Submitted',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    received: 'Received',
    onHold: 'On Hold',
    cancelled: 'Cancelled',
    
    // ==================== Batch Actions ====================
    batchSubmit: 'Batch Submit',
    batchDelete: 'Batch Delete',
    batchGeneratePO: 'Batch Generate PO',
    noAvailableActions: 'No available actions for this status',
    downloadTemplate: 'Download Template',
    
    // ==================== Forms and Dialogs ====================
    required: 'Required',
    optional: 'Optional',
    pleaseSelect: 'Please select',
    pleaseEnter: 'Please enter',
    invalidFormat: 'Invalid format',
    fieldRequired: 'This field is required',
    
    // ==================== Date and Time ====================
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    
    // ==================== File Operations ====================
    upload: 'Upload',
    uploadFile: 'Upload File',
    downloadFile: 'Download File',
    fileSize: 'File Size',
    fileName: 'File Name',
    fileType: 'File Type',
    
    // ==================== Permissions and Users ====================
    user: 'User',
    role: 'Role',
    permission: 'Permission',
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    settings: 'Settings',
    
    // ==================== System Messages ====================
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    saveSuccess: 'Save successful',
    deleteSuccess: 'Delete successful',
    operationSuccess: 'Operation successful',
    operationFailed: 'Operation failed',
    networkError: 'Network error',
    serverError: 'Server error',
    
    // ==================== Pagination ====================
    previousPage: 'Previous',
    nextPage: 'Next',
    firstPage: 'First',
    lastPage: 'Last',
    pageSize: 'Page Size',
    totalRecords: 'Total Records',
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