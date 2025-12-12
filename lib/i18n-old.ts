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
    
    // 搜索和筛选
    searchPlaceholder: '搜索PR编号、业务单号、申请人、部门或备注...',
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
    
    // 批量操作
    batchSubmit: '批量提交',
    batchDelete: '批量删除',
    batchGeneratePO: '批量生成PO',
    noAvailableActions: '此状态无可用操作',
    downloadTemplate: '下载模板',
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
    
    // 搜索和筛选
    searchPlaceholder: 'Search PR No., Business No., Requester, Department or Notes...',
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
    
    // 批量操作
    batchSubmit: 'Batch Submit',
    batchDelete: 'Batch Delete',
    batchGeneratePO: 'Batch Generate PO',
    noAvailableActions: 'No available actions for this status',
    downloadTemplate: 'Download Template',
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