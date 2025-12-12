# 供应商报价管理国际化完成总结

## 完成的工作

### 1. 国际化配置文件更新 (`lib/i18n.ts`)

添加了供应商报价管理相关的翻译键：

#### 供应商报价对话框相关
- `supplierQuoteManagementTitle` - 供应商报价管理
- `addQuote` - 新增询价
- `directSelectSupplier` - 直接选择供应商（不询价）
- `selectSupplierPlaceholder` - 选择供应商
- `saveSelection` - 保存选择
- `leadTime` - 交期
- `moq` - 最小起订量
- `validUntil` - 有效期
- `quotedLabel` - 已报价
- `pendingQuoteLabel` - 待报价
- `days` - 天
- `noQuoteRecords` - 暂无询价记录，点击"新增询价"开始询价
- `pleaseSelectSupplierAndPrice` - 请填写供应商和报价

#### 报价文件管理相关
- `quoteFileManagement` - 供应商报价管理
- `quoteFiles` - 报价文件
- `quoteRequests` - 询价管理
- `dragFilesHere` - 拖拽文件到此处或点击上传
- `supportedFormats` - 支持 PDF, DOC, DOCX, XLS, XLSX 格式，最大 10MB
- `selectFiles` - 选择文件
- `fileName` - 文件名
- `fileSize` - 文件大小
- `uploadDate` - 上传时间
- `description` - 描述
- `noQuoteFiles` - 暂无报价文件，请上传供应商报价文件

#### 询价请求管理相关
- `quoteRequestManagement` - 询价请求管理
- `addQuoteRequest` - 新增询价
- `supplierNameLabel` - 供应商名称
- `enterSupplierNameLabel` - 输入供应商名称
- `dueDate` - 截止日期
- `quoteRequirementsNotes` - 询价要求和说明...
- `sendDate` - 发送日期
- `editLabel` - 编辑
- `noQuoteRequests` - 暂无询价请求，点击"新增询价"开始管理询价

#### 状态标签相关
- `pendingReview` - 待审核
- `approvedStatus` - 已批准
- `rejectedStatus` - 已拒绝
- `sentStatus` - 已发送
- `receivedStatus` - 已收到
- `overdueStatus` - 已逾期

### 2. 供应商报价对话框国际化 (`components/purchase/supplier-quote-dialog.tsx`)

替换了以下硬编码中文文本：

#### 对话框标题和基本信息
- 供应商报价管理 → `{t('supplierQuoteManagementTitle')}`
- 数量 → `{t('quantityField')}`

#### 询价表单
- 新增询价 → `{t('addQuote')}`
- 供应商 → `{t('supplierField')}`
- 选择供应商 → `{t('selectSupplierPlaceholder')}`
- 报价 → `{t('quotePrice')}`
- 输入报价 → `{t('enterQuotePrice')}`
- 报价有效期 → `{t('quoteValidUntil')}`
- 交期（天数） → `{t('leadTime')} ({t('days')})`
- 备注 → `{t('notesField')}`
- 输入备注信息 → `{t('enterNotes')}`

#### 询价记录列表
- 已报价 → `{t('quotedLabel')}`
- 待报价 → `{t('pendingQuoteLabel')}`
- 报价 → `{t('quoteLabel')}`
- 交期 → `{t('leadTime')}`
- 天 → `{t('days')}`
- 最小起订量 → `{t('moq')}`
- 有效期 → `{t('validUntil')}`
- 暂无询价记录，点击"新增询价"开始询价 → `{t('noQuoteRecords')}`

#### 供应商选择
- 直接选择供应商（不询价） → `{t('directSelectSupplier')}`
- 选择供应商 → `{t('selectSupplierPlaceholder')}`

#### 操作按钮
- 取消 → `{t('cancel')}`
- 保存选择 → `{t('saveSelection')}`

#### 错误提示
- 请填写供应商和报价 → `{t('pleaseSelectSupplierAndPrice')}`

### 3. 报价文件管理组件国际化 (`components/purchase/quote-file-manager.tsx`)

替换了以下硬编码中文文本：

#### 组件标题和标签页
- 供应商报价管理 → `{t('quoteFileManagement')}`
- 报价文件 → `{t('quoteFiles')}`
- 询价管理 → `{t('quoteRequests')}`

#### 文件上传区域
- 拖拽文件到此处或点击上传 → `{t('dragFilesHere')}`
- 支持 PDF, DOC, DOCX, XLS, XLSX 格式，最大 10MB → `{t('supportedFormats')}`
- 选择文件 → `{t('selectFiles')}`

#### 文件列表表头
- 文件名 → `{t('fileName')}`
- 供应商 → `{t('supplierField')}`
- 文件大小 → `{t('fileSize')}`
- 上传时间 → `{t('uploadDate')}`
- 状态 → `{t('statusLabel2')}`
- 描述 → `{t('description')}`
- 操作 → `{t('actionsLabel2')}`

#### 状态标签
- 待审核 → `{t('pendingReview')}`
- 已批准 → `{t('approvedStatus')}`
- 已拒绝 → `{t('rejectedStatus')}`
- 已发送 → `{t('sentStatus')}`
- 已收到 → `{t('receivedStatus')}`
- 已逾期 → `{t('overdueStatus')}`

#### 空状态提示
- 暂无报价文件，请上传供应商报价文件 → `{t('noQuoteFiles')}`

#### 询价请求管理
- 询价请求管理 → `{t('quoteRequestManagement')}`
- 新增询价 → `{t('addQuoteRequest')}`
- 供应商名称 → `{t('supplierNameLabel')}`
- 输入供应商名称 → `{t('enterSupplierNameLabel')}`
- 截止日期 → `{t('dueDate')}`
- 备注 → `{t('notesField')}`
- 询价要求和说明... → `{t('quoteRequirementsNotes')}`
- 保存 → `{t('save')}`
- 取消 → `{t('cancel')}`

#### 询价请求列表表头
- 供应商 → `{t('supplierField')}`
- 发送日期 → `{t('sendDate')}`
- 截止日期 → `{t('dueDate')}`
- 状态 → `{t('statusLabel2')}`
- 备注 → `{t('notesField')}`
- 操作 → `{t('actionsLabel2')}`
- 编辑 → `{t('editLabel')}`

#### 空状态提示
- 暂无询价请求，点击"新增询价"开始管理询价 → `{t('noQuoteRequests')}`

## 国际化覆盖情况

### ✅ 已完成国际化的组件
1. **供应商报价对话框** (`supplier-quote-dialog.tsx`)
   - 对话框标题和基本信息展示
   - 询价表单（供应商选择、报价输入、交期设置等）
   - 询价记录列表展示
   - 供应商直接选择功能
   - 操作按钮和错误提示

2. **报价文件管理组件** (`quote-file-manager.tsx`)
   - 组件标题和标签页切换
   - 文件上传区域
   - 文件列表表格
   - 询价请求管理
   - 状态标签和空状态提示

### 📝 技术实现
1. 所有新增的翻译键都同时提供了中文和英文版本
2. 保持了原有的UI布局和样式
3. 所有修改都通过了TypeScript语法检查
4. 翻译键命名遵循了现有的命名规范
5. 状态标签使用动态翻译，支持多语言切换

### 🔄 功能特点
1. **完整的供应商报价流程支持**
   - 询价记录管理
   - 供应商选择和比较
   - 报价文件上传和管理
   - 询价请求跟踪

2. **用户友好的界面**
   - 清晰的状态标识
   - 直观的操作流程
   - 完善的空状态提示

3. **多语言支持**
   - 中英文完整翻译
   - 动态语言切换
   - 一致的用户体验

## 总结

通过这次国际化工作，供应商报价管理相关的所有组件都已经完全支持多语言。用户现在可以在中文和英文之间自由切换，所有的界面文本、提示信息、状态标签都会相应地更新，提供了一致且专业的多语言用户体验。

这些组件涵盖了完整的供应商报价管理流程，从询价请求的创建、报价文件的管理，到供应商的选择和比较，都提供了完善的国际化支持。