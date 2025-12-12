# OMS系统全面国际化实施计划

## 概述

本文档描述了OMS（订单管理系统）的全面国际化实施计划，包括所有模块的翻译支持、实施步骤和最佳实践。

## 当前状态

### 已完成的模块
- ✅ 采购管理 (Purchase Management)
  - PR (Purchase Request) 页面
  - PO (Purchase Order) 页面
  - 相关组件和对话框

### 待实施的模块
- 🔄 仪表板 (Dashboard)
- 🔄 订单管理 (Orders)
- 🔄 商品管理 (Product)
- 🔄 库存管理 (Inventory)
- 🔄 物流管理 (Logistics)
- 🔄 退货管理 (Returns)
- 🔄 客户管理 (Customer Management)
- 🔄 商户管理 (Merchant Management)
- 🔄 集成管理 (Integrations)
- 🔄 自动化 (Automation)
- 🔄 事件管理 (Events)
- 🔄 工作空间 (Workspace)
- 🔄 POM管理 (POM Management)

## 国际化架构

### 1. 翻译系统
- **文件位置**: `lib/i18n.ts`
- **支持语言**: 中文 (zh), 英文 (en)
- **扩展性**: 可轻松添加更多语言

### 2. Context Provider
- **文件位置**: `components/i18n-provider.tsx`
- **全局状态管理**: 通过React Context管理语言状态
- **持久化**: 自动保存到localStorage

### 3. Hook使用
```typescript
import { useI18n } from "@/components/i18n-provider"

function MyComponent() {
  const { t, language, setLanguage } = useI18n()
  
  return (
    <div>
      <h1>{t('dashboard')}</h1>
      <button onClick={() => setLanguage('en')}>
        English
      </button>
    </div>
  )
}
```

## 实施步骤

### 阶段1: 核心模块国际化 (优先级: 高)

#### 1.1 仪表板 (Dashboard)
**文件**: `app/dashboard/page.tsx`
**需要翻译的内容**:
- 页面标题和描述
- 统计卡片标题
- 图表标签
- 数据表格标题

**实施步骤**:
1. 导入useI18n Hook
2. 替换硬编码文本为t()函数调用
3. 更新统计数据显示
4. 测试语言切换功能

#### 1.2 订单管理 (Orders)
**文件**: `app/orders/page.tsx`
**需要翻译的内容**:
- 页面标题和描述
- 表格列标题
- 状态标签
- 操作按钮
- 筛选器选项

#### 1.3 商品管理 (Product)
**文件**: `app/product/page.tsx`
**需要翻译的内容**:
- 页面标题和描述
- 商品属性标签
- 分类和品牌
- 操作按钮

### 阶段2: 业务模块国际化 (优先级: 中)

#### 2.1 库存管理 (Inventory)
#### 2.2 物流管理 (Logistics)
#### 2.3 退货管理 (Returns)

### 阶段3: 管理模块国际化 (优先级: 中)

#### 3.1 客户管理 (Customer Management)
#### 3.2 商户管理 (Merchant Management)

### 阶段4: 系统模块国际化 (优先级: 低)

#### 4.1 集成管理 (Integrations)
#### 4.2 自动化 (Automation)
#### 4.3 事件管理 (Events)
#### 4.4 工作空间 (Workspace)
#### 4.5 POM管理 (POM Management)

## 组件国际化

### 1. 布局组件
- **MainLayout**: 侧边栏导航项
- **Header**: 用户菜单、搜索框占位符
- **Sidebar**: 导航标签

### 2. 数据表格组件
- **DataTable**: 分页控件、排序标签
- **FilterBar**: 筛选器标签、搜索占位符
- **AdvancedSearch**: 高级搜索字段标签

### 3. 表单组件
- **Dialog**: 对话框标题和按钮
- **Form**: 表单字段标签和验证消息
- **Select**: 下拉选项标签

## 最佳实践

### 1. 翻译键命名规范
```typescript
// 模块前缀 + 功能描述
dashboard.totalOrders
orders.orderStatus
product.productName

// 通用操作
actions.save
actions.cancel
actions.delete

// 状态标签
status.pending
status.completed
status.cancelled
```

### 2. 组件实施模式
```typescript
// 1. 导入Hook
import { useI18n } from "@/components/i18n-provider"

// 2. 在组件中使用
function MyComponent() {
  const { t } = useI18n()
  
  // 3. 替换硬编码文本
  return (
    <div>
      <h1>{t('pageTitle')}</h1>
      <Button>{t('actions.save')}</Button>
    </div>
  )
}
```

### 3. 条件渲染处理
```typescript
// 状态配置
const statusConfig = {
  pending: { 
    label: t('status.pending'), 
    color: 'yellow' 
  },
  completed: { 
    label: t('status.completed'), 
    color: 'green' 
  }
}
```

## 测试策略

### 1. 单元测试
- 测试翻译键是否存在
- 测试语言切换功能
- 测试默认语言加载

### 2. 集成测试
- 测试页面完整的语言切换
- 测试表单验证消息翻译
- 测试数据表格翻译

### 3. 用户测试
- 中英文界面对比测试
- 文本长度适配测试
- 用户体验测试

## 工具和辅助

### 1. 翻译检查工具
创建脚本检查缺失的翻译键：
```bash
npm run i18n:check
```

### 2. 翻译提取工具
自动提取代码中的翻译键：
```bash
npm run i18n:extract
```

### 3. 翻译验证工具
验证翻译文件的完整性：
```bash
npm run i18n:validate
```

## 实施时间表

### 第1周: 核心模块
- 仪表板国际化
- 订单管理国际化
- 商品管理国际化

### 第2周: 业务模块
- 库存管理国际化
- 物流管理国际化
- 退货管理国际化

### 第3周: 管理模块
- 客户管理国际化
- 商户管理国际化

### 第4周: 系统模块和优化
- 剩余模块国际化
- 性能优化
- 测试和修复

## 维护和扩展

### 1. 添加新语言
1. 在`Language`类型中添加新语言代码
2. 在`translations`对象中添加新语言翻译
3. 更新语言选择器组件
4. 测试新语言的显示效果

### 2. 添加新翻译键
1. 在中文翻译中添加新键
2. 在英文翻译中添加对应翻译
3. 更新`TranslationKey`类型
4. 在组件中使用新的翻译键

### 3. 翻译质量保证
- 定期审查翻译质量
- 收集用户反馈
- 持续改进翻译准确性
- 保持术语一致性

## 注意事项

### 1. 文本长度
- 英文通常比中文长20-30%
- 预留足够的UI空间
- 考虑响应式布局

### 2. 文化适配
- 日期格式本地化
- 数字格式本地化
- 货币显示本地化

### 3. 性能考虑
- 翻译文件按需加载
- 避免重复渲染
- 缓存翻译结果

## 结论

通过系统性的国际化实施，OMS系统将能够为全球用户提供本地化的用户体验。这个计划确保了翻译的一致性、可维护性和扩展性，为未来支持更多语言奠定了坚实的基础。