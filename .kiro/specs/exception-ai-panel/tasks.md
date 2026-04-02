# 实施计划：AI 异常处理面板

## 概述

基于需求文档和设计文档，将 AI 异常处理面板拆解为渐进式编码任务。每个任务在前一个任务基础上构建，最终将所有组件集成到 `/orders/exception-ai` 页面中。技术栈：Next.js 14 App Router + React 18 + TypeScript + shadcn/ui + Tailwind CSS。

## 任务

- [x] 1. 项目基础设施搭建
  - [x] 1.1 安装 Playwright 和 fast-check 依赖
    - 运行 `npm install -D @playwright/test fast-check` 安装 E2E 测试和属性测试依赖
    - 创建 `playwright.config.ts` 基础配置文件（baseURL 指向 localhost:3000）
    - _需求：测试策略_

  - [x] 1.2 创建前端专用类型定义 `lib/exception-ai/types.ts`
    - 定义 `HistoryRecord` 接口（id, timestamp, inputSummary, mode, overallStatus, result）
    - 定义 `ApiError` 类（status, message）
    - 定义 `PanelStatus` 类型别名（'idle' | 'loading' | 'success' | 'error'）
    - 复用 `lib/orchestrator/types.ts`、`lib/diagnosis/types.ts`、`lib/repair/types.ts`、`lib/learning/types.ts` 中的已有类型
    - _需求：设计文档数据模型_

  - [x] 1.3 创建 API 调用封装 `lib/exception-ai/api.ts`
    - 实现 `runExceptionPipeline(input: OrchestratorInput): Promise<OrchestratorResult>` 函数
    - 使用 `fetch` 调用 `POST /api/exception/run`，配置 30s 超时
    - 处理 HTTP 400（抛出 ApiError 携带后端 message）、HTTP 500（抛出固定提示）、网络错误
    - _需求：2.2, 2.4, 2.5, 3.3, 3.4_

- [x] 2. 核心 Hooks 实现
  - [x] 2.1 实现历史记录 Hook `lib/exception-ai/use-history.ts`
    - 实现 `useHistory` Hook，返回 `records`、`addRecord`、`selectedId`、`selectRecord`
    - 从 `localStorage` 键 `exception-ai-history` 读取/写入数据
    - 实现 FIFO 策略：最多保留 50 条记录，超出时删除最早记录
    - 处理 `localStorage` 读取失败（JSON.parse 异常）时降级为空数组
    - _需求：9.1, 9.2, 9.4, 9.5_

  - [ ]* 2.2 属性测试：历史记录 localStorage 持久化与上限
    - **属性 12：历史记录 localStorage 持久化与上限**
    - 使用 fast-check 生成随机 HistoryRecord 序列，验证 localStorage 读写一致性和 50 条上限
    - **验证需求：9.4, 9.5**

  - [x] 2.3 实现核心状态管理 Hook `lib/exception-ai/use-exception-ai.ts`
    - 实现 `useExceptionAI` Hook，管理面板全局状态
    - 状态字段：`status`、`result`、`error`、`diagnosisOnly`、`isDialogOpen`、`confirmationTarget`
    - 操作方法：`submitSymptom`、`submitOrderQuery`、`submitMerchantBatch`、`setDiagnosisOnly`、`triggerRepair`、`confirmRepair`、`rejectRepair`、`selectHistoryRecord`
    - 当 `diagnosisOnly` 为 true 时，API 请求中 `auto_repair` 设为 false
    - 当 `isDialogOpen` 为 true 时，阻止所有提交操作
    - 当 `repair.needs_confirmation` 为 true 时，设置 `confirmationTarget` 并打开对话框
    - _需求：2.2, 2.3, 7.1, 7.3, 7.4, 7.5, 8.1, 8.2, 8.4_

  - [ ]* 2.4 属性测试：仅诊断模式设置 auto_repair=false
    - **属性 9：仅诊断模式设置 auto_repair=false**
    - 使用 fast-check 生成随机布尔值控制开关状态，验证 API 请求中的 auto_repair 字段
    - **验证需求：8.2**

- [x] 3. 检查点 - 确保核心层测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 4. UI 组件实现（输入区域）
  - [x] 4.1 实现自然语言输入组件 `components/exception-ai/natural-language-input.tsx`
    - 使用 shadcn/ui `Textarea` 组件，placeholder 为需求中定义的文本
    - 提交按钮在 `isLoading` 时禁用并显示 Spinner
    - 支持 Ctrl+Enter / Cmd+Enter 快捷键提交
    - 错误信息显示在输入框下方，使用 `text-destructive` 样式
    - 为所有交互元素提供 `focus-visible:ring-2` 焦点状态和 `aria-label`
    - _需求：2.1, 2.3, 2.4, 2.5, 2.6, 11.2, 11.3, 11.5_

  - [x] 4.2 实现快捷操作栏组件 `components/exception-ai/quick-action-bar.tsx`
    - 两个并排的快捷入口卡片：按订单号查询、按商户批量诊断
    - 每个入口包含 `Input` + `Button`
    - 空值提交时显示校验提示（`text-destructive text-xs`）
    - _需求：3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.3 属性测试：输入到 API 参数的正确映射 & 空输入校验
    - **属性 1：输入到 API 参数的正确映射**
    - 使用 fast-check 生成随机非空字符串，验证 API 调用参数映射（symptom_text / order_no / merchant_no）
    - **验证需求：2.2, 3.3, 3.4**
    - **属性 2：空输入校验阻止 API 调用**
    - 使用 fast-check 生成随机空白字符串，验证校验拦截
    - **验证需求：3.5**

- [x] 5. UI 组件实现（结果卡片）
  - [x] 5.1 实现诊断结果卡片 `components/exception-ai/diagnosis-card.tsx`
    - 头部：域（domain）标签 + 置信度百分比 + 严重程度语义色彩标签（critical 红 / high 橙 / medium 黄 / low 灰）
    - 根因列表：每个根因的描述、置信度、证据来源
    - 建议动作列表：描述、优先级、是否可自动执行标签
    - 错误状态：`stage_reached === 'error'` 时显示错误信息
    - 探索性标签：`is_exploratory === true` 时显示 "探索性诊断" Badge
    - 仅诊断模式：显示 "手动触发修复" 按钮
    - 支持暗色模式（使用 dark: 前缀变体）
    - _需求：4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.3_

  - [ ]* 5.2 属性测试：DiagnosisCard 渲染所有必要字段
    - **属性 5：DiagnosisCard 渲染所有必要字段**
    - 使用 fast-check 生成随机 DiagnosisResult，验证所有字段在 DOM 中存在
    - **验证需求：4.2, 4.3, 4.4, 4.6**

  - [ ]* 5.3 属性测试：仅诊断模式显示手动修复按钮
    - **属性 10：仅诊断模式显示手动修复按钮**
    - 使用 fast-check 生成随机 DiagnosisResult，验证仅诊断模式下按钮的显示/隐藏
    - **验证需求：8.3**

  - [x] 5.4 实现修复结果卡片 `components/exception-ai/repair-card.tsx`
    - 头部：整体状态语义色彩标签（success 绿 / partial 黄 / failed 红 / skipped 灰）
    - 动作结果列表：action_code、状态标签、duration_ms、retry_count/max_retries
    - 失败动作展示 error 字段
    - 升级列表（escalations 非空时）：动作代码、原因、严重程度、分配对象
    - _需求：5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.5 属性测试：RepairCard 渲染所有必要字段
    - **属性 6：RepairCard 渲染所有必要字段**
    - 使用 fast-check 生成随机 RepairResult，验证所有字段在 DOM 中存在
    - **验证需求：5.2, 5.3, 5.5**

  - [x] 5.6 实现学习反馈卡片 `components/exception-ai/learning-card.tsx`
    - 汇总统计：atoms_updated / atoms_created / atoms_deprecated / patterns_buffered
    - 事件列表（events 非空时）：event_type、reason、changes 列表
    - _需求：6.1, 6.2, 6.3_

  - [ ]* 5.7 属性测试：LearningCard 渲染所有必要字段
    - **属性 7：LearningCard 渲染所有必要字段**
    - 使用 fast-check 生成随机 LearningResult，验证所有字段在 DOM 中存在
    - **验证需求：6.2, 6.3**

- [x] 6. 检查点 - 确保结果卡片组件测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 7. UI 组件实现（容器与辅助组件）
  - [x] 7.1 实现批量模式汇总卡片 `components/exception-ai/batch-summary-card.tsx`
    - 统计数字网格：total / diagnosed（蓝色）/ repaired（绿色）/ learned / failed（红色）
    - 使用语义色彩区分各状态计数
    - _需求：10.1, 10.3_

  - [ ]* 7.2 属性测试：批量模式渲染汇总卡片和可折叠列表
    - **属性 13：批量模式渲染汇总卡片和可折叠列表**
    - 使用 fast-check 生成随机批量结果，验证汇总数字一致性
    - **验证需求：10.1, 10.2**

  - [x] 7.3 实现空状态组件 `components/exception-ai/empty-state.tsx`
    - 显示空状态插图和提示文本 "输入问题描述或使用快捷操作开始诊断"
    - _需求：12.1_

  - [x] 7.4 实现骨架屏加载组件 `components/exception-ai/loading-skeleton.tsx`
    - 模拟诊断卡片布局的骨架屏占位符
    - _需求：12.2_

  - [x] 7.5 实现结果展示容器 `components/exception-ai/result-display.tsx`
    - 根据面板状态渲染：空状态（idle 且无结果）、骨架屏（loading）、结果卡片（success）、错误提示（error）
    - 批量模式（mode === 'batch'）时渲染 BatchSummaryCard + 可折叠列表
    - 单条模式时直接渲染 DiagnosisCard + RepairCard + LearningCard
    - _需求：4.1, 5.1, 6.1, 10.1, 10.2, 12.1, 12.2_

  - [ ]* 7.6 属性测试：PipelineResult 渲染正确的阶段卡片
    - **属性 4：PipelineResult 渲染正确的阶段卡片**
    - 使用 fast-check 生成随机 PipelineResult（各阶段随机为 null 或有值），验证卡片渲染
    - **验证需求：4.1, 5.1, 6.1**

  - [x] 7.7 实现历史记录面板 `components/exception-ai/history-panel.tsx`
    - 按时间倒序展示历史记录
    - 每条记录显示：时间戳、输入摘要（前50字符）、模式、状态
    - 点击记录触发 `onSelect` 回调
    - 空历史记录时显示 "暂无历史记录"
    - _需求：9.1, 9.2, 9.3, 12.3_

  - [ ]* 7.8 属性测试：历史记录按时间倒序排列并展示所有必要字段
    - **属性 11：历史记录按时间倒序排列并展示所有必要字段**
    - 使用 fast-check 生成随机历史记录数组，验证排序和字段展示
    - **验证需求：9.1, 9.2**

  - [x] 7.9 实现修复确认对话框 `components/exception-ai/confirmation-dialog.tsx`
    - 基于 shadcn/ui `AlertDialog` 组件
    - 展示待确认动作的描述和风险等级
    - "确认执行" 按钮（destructive 样式）和 "拒绝" 按钮
    - _需求：7.1, 7.2, 7.3, 7.4_

  - [ ]* 7.10 属性测试：确认对话框阻止新请求
    - **属性 8：确认对话框阻止新请求**
    - 验证当 ConfirmationDialog 打开时，所有提交操作被阻止
    - **验证需求：7.5**

- [x] 8. 页面组装与集成
  - [x] 8.1 实现面板主组件 `components/exception-ai/exception-ai-panel.tsx`
    - 组合所有子组件：NaturalLanguageInput、QuickActionBar、DiagnosisOnlyToggle、ResultDisplay、HistoryPanel、ConfirmationDialog
    - 使用 `useExceptionAI` 和 `useHistory` Hook 管理状态
    - ≥1024px 双栏布局（左侧 flex-1 输入+结果，右侧 w-80 历史记录），<1024px 单栏堆叠
    - 页面级间距 space-y-6，卡片间距 gap-6
    - 支持暗色模式，所有颜色使用 CSS 变量
    - _需求：1.3, 1.4, 1.5, 11.1_

  - [x] 8.2 创建页面入口 `app/orders/exception-ai/page.tsx`
    - Server Component 壳，复用 `MainLayout` 和 orders 模块的 `sidebarItems`
    - 渲染 `ExceptionAIPanel` 客户端组件
    - 页面标题 "AI 异常处理"
    - _需求：1.1, 1.2, 1.3_

  - [ ]* 8.3 属性测试：加载状态禁用提交 & 无障碍访问
    - **属性 3：加载状态禁用提交**
    - 验证 loading 状态下所有提交按钮禁用，结果区域显示骨架屏
    - **验证需求：2.3, 12.2**
    - **属性 14：无障碍访问——aria-label 和焦点状态**
    - 验证所有图标按钮具有非空 aria-label，所有交互元素具有 focus-visible 焦点状态
    - **验证需求：11.2, 11.3**

- [x] 9. 检查点 - 确保所有组件集成测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [ ] 10. E2E 测试（Playwright）
  - [ ]* 10.1 编写页面导航和基础渲染 E2E 测试
    - 测试文件：`e2e/exception-ai.spec.ts`
    - 验证点击侧边栏 "AI 异常处理" 菜单项后路由到 `/orders/exception-ai`
    - 验证页面标题、输入区域、快捷操作栏、结果区域、历史面板均已渲染
    - 验证首次加载时显示空状态提示文本
    - _需求：1.1, 1.2, 1.3, 12.1_

  - [ ]* 10.2 编写自然语言输入和快捷操作 E2E 测试
    - 验证自然语言输入提交 → 加载状态 → 结果展示完整流程
    - 验证 Ctrl+Enter 快捷键提交
    - 验证订单号查询和商户批量诊断的完整流程
    - 验证空输入校验提示显示
    - _需求：2.1, 2.2, 2.3, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 10.3 编写仅诊断模式和确认对话框 E2E 测试
    - 验证开启仅诊断开关 → 提交 → 无修复卡片 → 显示手动修复按钮
    - 验证触发需确认的修复 → 对话框显示 → 确认/拒绝操作
    - _需求：7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 10.4 编写历史记录和响应式布局 E2E 测试
    - 验证多次操作后历史面板内容和点击回显
    - 验证调整视口宽度时双栏/单栏切换
    - 验证 Tab 键焦点切换
    - _需求：9.1, 9.2, 9.3, 11.1, 11.5_

- [ ] 11. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的子任务为可选任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务确保渐进式验证
- 属性测试验证设计文档中定义的 14 个正确性属性
- 单元测试和属性测试使用 Vitest + fast-check，E2E 测试使用 Playwright
