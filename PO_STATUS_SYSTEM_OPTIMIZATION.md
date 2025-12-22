# PO状态系统优化总结

## 概述
优化了采购订单(PO)的状态管理系统，包括PO状态、运输状态和收货状态的完整分类和样式规范。

## 新增文件

### 1. 状态枚举定义 (`lib/enums/po-status.ts`)
- **PO状态**: NEW, IN_PROGRESS, COMPLETE, CANCELLED, EXCEPTION
- **运输状态**: SHIPPED, IN_TRANSIT, ARRIVED, SHIPPING_EXCEPTION  
- **收货状态**: NOT_RECEIVED, PARTIAL_RECEIVED, RECEIVED
- 包含完整的样式配置和中英文文案映射
- 提供工具函数用于获取状态样式和文案

### 2. 状态徽章组件 (`components/ui/status-badge.tsx`)
- 统一的状态显示组件
- 支持不同状态类型的样式变体
- 支持图标显示和多语言
- 包含悬停提示显示状态描述

### 3. 状态选择器组件 (`components/purchase/status-selector.tsx`)
- 下拉选择器支持所有状态类型
- 搜索功能和状态描述显示
- 分别提供PO、运输、收货状态的专用选择器
- 完整的多语言支持

### 4. Command组件 (`components/ui/command.tsx`)
- 为状态选择器提供搜索和选择功能
- 基于cmdk库的命令面板组件

### 5. 测试页面 (`app/status-test/page.tsx`)
- 完整的状态系统演示
- 状态徽章展示和交互测试
- 状态组合示例

## 状态规范

### PO状态
| 状态 | 英文 | 中文 | 样式 | 说明 |
|------|------|------|------|------|
| NEW | New | 新建 | default/灰色 | 刚创建，还没开始履约/收货 |
| IN_PROGRESS | In Progress | 进行中 | processing/蓝色 | 有发货/运输/到达/部分收货，尚未完成 |
| COMPLETE | Complete | 已完成 | success/绿色 | 全部收货完成 |
| CANCELLED | Cancelled | 已取消 | default/灰色描边 | 被取消，不再履约 |
| EXCEPTION | Exception | 异常 | error/红色 | 需要人工处理的问题单 |

### 运输状态
| 状态 | 英文 | 中文 | 样式 | 说明 |
|------|------|------|------|------|
| SHIPPED | Shipped | 已发货 | processing/蓝色 | 已从供应商/仓库发出 |
| IN_TRANSIT | In Transit | 运输中 | processing/蓝色+loading | 承运商运输途中 |
| ARRIVED | Arrived | 已到达 | success/绿色 | 到仓/园区 |
| SHIPPING_EXCEPTION | Exception | 运输异常 | error/红色 | 物流异常 |

### 收货状态
| 状态 | 英文 | 中文 | 样式 | 说明 |
|------|------|------|------|------|
| NOT_RECEIVED | Not Received | 未收货 | default/灰色 | 还没收任何货 |
| PARTIAL_RECEIVED | Partial Received | 部分收货 | warning/橙色 | 有收货，但没收完 |
| RECEIVED | Received | 已收货 | success/绿色 | 收货全部完成 |

## 使用方法

### 1. 状态徽章
```tsx
import { StatusBadge } from '@/components/ui/status-badge'
import { POStatus } from '@/lib/enums/po-status'

<StatusBadge 
  status={POStatus.IN_PROGRESS} 
  language="cn"
  showIcon={true}
/>
```

### 2. 状态选择器
```tsx
import { POStatusSelector } from '@/components/purchase/status-selector'

<POStatusSelector
  value={selectedStatus}
  onValueChange={setSelectedStatus}
  language="cn"
/>
```

### 3. 获取状态信息
```tsx
import { getStatusLabel, getStatusStyle } from '@/lib/enums/po-status'

const label = getStatusLabel(POStatus.NEW, 'cn') // "新建"
const style = getStatusStyle(POStatus.NEW) // { variant: 'default', color: 'gray', ... }
```

## 更新内容

### i18n文件更新
- 添加了新的状态文案映射
- 保留了旧状态以确保向后兼容
- 支持中英文切换

### 依赖添加
- 安装了`cmdk`包用于命令面板功能
- 创建了`lib/utils.ts`工具函数

## 测试
访问 `/status-test` 页面可以查看完整的状态系统演示，包括：
- 所有状态的徽章展示
- 状态选择器交互测试
- 状态组合示例
- 中英文切换功能

## 技术特点
1. **类型安全**: 使用TypeScript枚举确保状态值的类型安全
2. **样式统一**: 统一的样式变体和颜色规范
3. **多语言**: 完整的中英文支持
4. **可扩展**: 易于添加新的状态类型和样式
5. **组件化**: 可复用的状态显示和选择组件