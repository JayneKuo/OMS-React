# PO列表页面翻译修复总结

## 问题描述
用户反馈PO列表页面的翻译有问题，需要从备份中恢复完整的PO相关翻译。

## 修复内容

### 1. 恢复PO相关翻译
从 `lib/i18n-backup.ts` 备份文件中恢复了完整的PO相关翻译，包括：

**中文翻译：**
- PO基本字段：`purchaseOrders`, `poNo`, `originalPoNo`, `prNos`, `referenceNo`, `supplierName`, `destination` 等
- PO状态：`CONFIRMED`, `SHIPPED`, `RECEIVED`, `ON_HOLD` 等
- 收货类型：`STANDARD`, `CROSS_DOCK`, `DROP_SHIP`, `RETURN_TO_VENDOR`, `TRANSFER`
- PO操作：`track`, `receive`, `download`, `resume` 等
- 批量操作：`batchSubmitPO`, `batchConfirm`, `batchCancel`, `batchTrack` 等
- 搜索占位符：`searchPOPlaceholder`

**英文翻译：**
- 对应的英文翻译版本

### 2. 清理重复键值
修复过程中发现并清理了多个重复的键值定义：
- 删除了重复的状态定义（`draft`, `submitted`, `confirmed` 等）
- 删除了重复的收货类型定义
- 删除了重复的搜索和筛选相关翻译
- 删除了重复的批量操作翻译

### 3. 添加缺失的翻译键值
为PO页面添加了缺失的翻译键值：
- `download`: '下载' / 'Download'
- `batchApprove`: '批量审批通过' / 'Batch Approve'
- `batchReject`: '批量拒绝' / 'Batch Reject'
- `basicInfo`: '基本信息' / 'Request Details'
- `commercialItems`: '商品行' / 'Line Items'
- `approvalHistory`: '审批历史' / 'Approval History'
- `relatedPO`: '关联PO' / 'Purchase Orders'
- `quoteFilesTab`: '报价文件' / 'Quotations'

## 修复结果

### 文件变更
1. **lib/i18n.ts** - 恢复完整的PO翻译，清理重复键值
2. **app/purchase/po/page.tsx** - 无需修改，翻译功能正常

### 验证结果
- ✅ i18n文件语法检查通过
- ✅ PO页面TypeScript检查通过
- ✅ 所有PO相关翻译键值完整
- ✅ 中英文翻译对应正确

## 翻译功能
PO列表页面现在支持完整的国际化功能：
- 页面标题和描述
- 表格列标题
- 状态标签和筛选
- 操作按钮
- 搜索占位符
- 批量操作菜单
- 状态标签页

## 使用方法
用户可以通过页面右上角的语言切换器在中英文之间切换，所有PO相关的文本都会正确显示对应语言的翻译。

## 备注
本次修复基于 `lib/i18n-backup.ts` 备份文件，确保了翻译的完整性和准确性。同时清理了重复的键值定义，提高了代码质量。