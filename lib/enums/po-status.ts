/**
 * Purchase Order Status Enums and Utilities
 * 采购订单状态枚举和工具函数
 */

// PO 状态枚举
export enum POStatus {
  NEW = 'NEW',
  IN_TRANSIT = 'IN_TRANSIT',
  WAITING_FOR_RECEIVING = 'WAITING_FOR_RECEIVING',
  RECEIVING = 'RECEIVING',
  PARTIAL_RECEIPT = 'PARTIAL_RECEIPT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXCEPTION = 'EXCEPTION'
}

// 运输状态枚举
export enum ShippingStatus {
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  ARRIVED = 'ARRIVED',
  SHIPPING_EXCEPTION = 'SHIPPING_EXCEPTION'
}

// 收货状态枚举
export enum ReceivingStatus {
  NOT_RECEIVED = 'NOT_RECEIVED',
  PARTIAL_RECEIVED = 'PARTIAL_RECEIVED',
  RECEIVED = 'RECEIVED'
}

// 状态样式配置
export interface StatusStyle {
  variant: 'default' | 'processing' | 'success' | 'warning' | 'error';
  color: string;
  description: string;
}

// PO状态样式映射
export const PO_STATUS_STYLES: Record<POStatus, StatusStyle> = {
  [POStatus.NEW]: {
    variant: 'default',
    color: 'gray',
    description: '刚创建，还没开始履约'
  },
  [POStatus.IN_TRANSIT]: {
    variant: 'processing',
    color: 'blue',
    description: '货物运输中'
  },
  [POStatus.WAITING_FOR_RECEIVING]: {
    variant: 'processing',
    color: 'indigo',
    description: '货物已到达，等待收货'
  },
  [POStatus.RECEIVING]: {
    variant: 'processing',
    color: 'purple',
    description: '正在收货中'
  },
  [POStatus.PARTIAL_RECEIPT]: {
    variant: 'warning',
    color: 'orange',
    description: '部分收货完成'
  },
  [POStatus.COMPLETED]: {
    variant: 'success',
    color: 'green',
    description: '全部收货完成'
  },
  [POStatus.CANCELLED]: {
    variant: 'default',
    color: 'gray-outline',
    description: '被取消，不再履约'
  },
  [POStatus.EXCEPTION]: {
    variant: 'error',
    color: 'red',
    description: '需要人工处理的问题单（数量差异等）'
  }
};

// 运输状态样式映射
export const SHIPPING_STATUS_STYLES: Record<ShippingStatus, StatusStyle> = {
  [ShippingStatus.SHIPPED]: {
    variant: 'processing',
    color: 'blue',
    description: '已从供应商/仓库发出'
  },
  [ShippingStatus.IN_TRANSIT]: {
    variant: 'processing',
    color: 'blue-loading',
    description: '承运商运输途中'
  },
  [ShippingStatus.ARRIVED]: {
    variant: 'success',
    color: 'green',
    description: '到仓/园区（Gate / Appointment / ET 到场）'
  },
  [ShippingStatus.SHIPPING_EXCEPTION]: {
    variant: 'error',
    color: 'red',
    description: '物流异常（延误、清关、丢件等）'
  }
};

// 收货状态样式映射
export const RECEIVING_STATUS_STYLES: Record<ReceivingStatus, StatusStyle> = {
  [ReceivingStatus.NOT_RECEIVED]: {
    variant: 'default',
    color: 'gray',
    description: '还没收任何货'
  },
  [ReceivingStatus.PARTIAL_RECEIVED]: {
    variant: 'warning',
    color: 'orange',
    description: '有收货，但没收完'
  },
  [ReceivingStatus.RECEIVED]: {
    variant: 'success',
    color: 'green',
    description: '收货全部完成'
  }
};

// 状态文案映射（中英文）
export const STATUS_LABELS = {
  // PO状态
  [POStatus.NEW]: {
    en: 'New',
    cn: '新建'
  },
  [POStatus.IN_TRANSIT]: {
    en: 'In Transit',
    cn: '运输中'
  },
  [POStatus.WAITING_FOR_RECEIVING]: {
    en: 'Waiting for Receiving',
    cn: '待收货'
  },
  [POStatus.RECEIVING]: {
    en: 'Receiving',
    cn: '收货中'
  },
  [POStatus.PARTIAL_RECEIPT]: {
    en: 'Partial Receipt',
    cn: '部分收货'
  },
  [POStatus.COMPLETED]: {
    en: 'Completed',
    cn: '已完成'
  },
  [POStatus.CANCELLED]: {
    en: 'Cancelled',
    cn: '已取消'
  },
  [POStatus.EXCEPTION]: {
    en: 'Exception',
    cn: '异常'
  },
  
  // 运输状态
  [ShippingStatus.SHIPPED]: {
    en: 'Shipped',
    cn: '已发货'
  },
  [ShippingStatus.IN_TRANSIT]: {
    en: 'In Transit',
    cn: '运输中'
  },
  [ShippingStatus.ARRIVED]: {
    en: 'Arrived',
    cn: '已到达'
  },
  [ShippingStatus.SHIPPING_EXCEPTION]: {
    en: 'Exception',
    cn: '运输异常'
  },
  
  // 收货状态
  [ReceivingStatus.NOT_RECEIVED]: {
    en: 'Not Received',
    cn: '未收货'
  },
  [ReceivingStatus.PARTIAL_RECEIVED]: {
    en: 'Partial Received',
    cn: '部分收货'
  },
  [ReceivingStatus.RECEIVED]: {
    en: 'Received',
    cn: '已收货'
  }
};

// 工具函数：获取状态样式
export function getStatusStyle(status: POStatus | ShippingStatus | ReceivingStatus): StatusStyle {
  if (Object.values(POStatus).includes(status as POStatus)) {
    return PO_STATUS_STYLES[status as POStatus];
  }
  if (Object.values(ShippingStatus).includes(status as ShippingStatus)) {
    return SHIPPING_STATUS_STYLES[status as ShippingStatus];
  }
  if (Object.values(ReceivingStatus).includes(status as ReceivingStatus)) {
    return RECEIVING_STATUS_STYLES[status as ReceivingStatus];
  }
  
  // 默认样式
  return {
    variant: 'default',
    color: 'gray',
    description: ''
  };
}

// 工具函数：获取状态文案
export function getStatusLabel(
  status: POStatus | ShippingStatus | ReceivingStatus, 
  language: 'en' | 'cn' = 'cn'
): string {
  const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS];
  return label ? label[language] : status;
}

// 工具函数：获取所有PO状态选项
export function getPOStatusOptions(language: 'en' | 'cn' = 'cn') {
  return Object.values(POStatus).map(status => ({
    value: status,
    label: getStatusLabel(status, language),
    style: getStatusStyle(status)
  }));
}

// 工具函数：获取所有运输状态选项
export function getShippingStatusOptions(language: 'en' | 'cn' = 'cn') {
  return Object.values(ShippingStatus).map(status => ({
    value: status,
    label: getStatusLabel(status, language),
    style: getStatusStyle(status)
  }));
}

// 工具函数：获取所有收货状态选项
export function getReceivingStatusOptions(language: 'en' | 'cn' = 'cn') {
  return Object.values(ReceivingStatus).map(status => ({
    value: status,
    label: getStatusLabel(status, language),
    style: getStatusStyle(status)
  }));
}