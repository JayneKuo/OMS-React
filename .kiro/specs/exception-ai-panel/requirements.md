# 需求文档：AI 异常处理面板

## 简介

在 OMS React 前端的 `/orders` 模块下新增 "AI 异常处理" 页面（路由 `/orders/exception-ai`）。该页面是一个交互式面板，允许运营人员通过自然语言或快捷操作触发后端异常诊断→修复→学习全链路处理，并以结构化方式展示诊断结果、修复结果和学习反馈。用户可以确认或拒绝修复建议，查看历史记录，从而高效处理订单异常。

## 术语表

- **Exception_AI_Panel**：AI 异常处理面板页面组件，路由为 `/orders/exception-ai`
- **Natural_Language_Input**：自然语言输入区域，用户在此输入自由文本描述问题
- **Quick_Action_Bar**：快捷操作栏，提供按订单号查询、按商户批量诊断等预设入口
- **Result_Display**：结果展示区域，展示诊断结果、修复结果和学习反馈
- **Diagnosis_Card**：诊断结果卡片，展示域、根因、置信度、建议动作等信息
- **Repair_Card**：修复结果卡片，展示执行状态、动作结果、升级信息
- **Learning_Card**：学习反馈卡片，展示知识库更新事件
- **History_Panel**：历史记录面板，展示最近的诊断和修复记录
- **Orchestrator_API**：后端统一入口 `POST /api/exception/run`，接受 order_no / error_message / symptom_text / merchant_no 参数
- **Pipeline_Result**：单条管线处理结果，包含 diagnosis、repair、learning 三个阶段的输出
- **Confirmation_Dialog**：确认对话框，用于用户确认或拒绝破坏性修复动作

## 需求

### 需求 1：页面路由与布局

**用户故事：** 作为运营人员，我希望在订单模块侧边栏中点击 "AI 异常处理" 菜单项后进入一个专属页面，以便集中处理订单异常。

#### 验收标准

1. WHEN 用户点击侧边栏中的 "AI 异常处理" 菜单项, THE Exception_AI_Panel SHALL 在 `/orders/exception-ai` 路由下渲染页面
2. THE Exception_AI_Panel SHALL 复用 MainLayout 组件，保持与订单模块其他页面一致的侧边栏和顶部导航
3. THE Exception_AI_Panel SHALL 包含页面标题 "AI 异常处理"、Natural_Language_Input 区域、Quick_Action_Bar、Result_Display 区域和 History_Panel
4. THE Exception_AI_Panel SHALL 遵循设计系统中定义的间距规范（space-y-6 页面级间距、gap-6 卡片间距）
5. THE Exception_AI_Panel SHALL 支持暗色模式，所有颜色使用 CSS 变量而非硬编码色值

### 需求 2：自然语言输入

**用户故事：** 作为运营人员，我希望用自然语言描述问题（如"帮我查 batest0001 的异常订单"），系统自动调用后端进行全链路处理，以便快速定位和解决异常。

#### 验收标准

1. THE Natural_Language_Input SHALL 提供一个多行文本输入框，placeholder 文本为 "描述您遇到的问题，例如：帮我查 SO00522427 的异常、SKU 1823810 not found 怎么处理"
2. WHEN 用户在 Natural_Language_Input 中输入文本并提交, THE Exception_AI_Panel SHALL 将输入文本作为 `symptom_text` 参数调用 Orchestrator_API
3. WHILE Orchestrator_API 请求正在处理中, THE Exception_AI_Panel SHALL 显示加载状态指示器，并禁用提交按钮防止重复提交
4. IF Orchestrator_API 返回 HTTP 400 错误, THEN THE Exception_AI_Panel SHALL 在输入区域下方显示后端返回的错误消息
5. IF Orchestrator_API 返回 HTTP 500 错误, THEN THE Exception_AI_Panel SHALL 显示 "异常处理管线执行失败，请稍后重试" 的错误提示
6. WHEN 用户按下 Ctrl+Enter 或 Cmd+Enter 快捷键, THE Natural_Language_Input SHALL 触发提交操作


### 需求 3：快捷操作

**用户故事：** 作为运营人员，我希望通过预设的快捷入口按订单号查询或按商户批量诊断，以便在已知具体信息时快速发起处理。

#### 验收标准

1. THE Quick_Action_Bar SHALL 提供 "按订单号查询" 快捷入口，包含一个订单号输入框和提交按钮
2. THE Quick_Action_Bar SHALL 提供 "按商户批量诊断" 快捷入口，包含一个商户号输入框和提交按钮
3. WHEN 用户在 "按订单号查询" 中输入订单号并提交, THE Exception_AI_Panel SHALL 将输入值作为 `order_no` 参数调用 Orchestrator_API
4. WHEN 用户在 "按商户批量诊断" 中输入商户号并提交, THE Exception_AI_Panel SHALL 将输入值作为 `merchant_no` 参数调用 Orchestrator_API
5. IF 用户提交快捷操作时输入框为空, THEN THE Quick_Action_Bar SHALL 显示 "请输入订单号" 或 "请输入商户号" 的校验提示，且不发起 API 请求

### 需求 4：诊断结果展示

**用户故事：** 作为运营人员，我希望看到结构化的诊断结果（域、根因、置信度、建议动作），以便理解异常的原因和推荐的处理方式。

#### 验收标准

1. WHEN Orchestrator_API 返回成功响应, THE Result_Display SHALL 为每条 Pipeline_Result 渲染一个 Diagnosis_Card
2. THE Diagnosis_Card SHALL 展示以下诊断信息：异常域（domain）、整体置信度（overall_confidence，以百分比形式）、严重程度（severity，使用语义色彩标签：critical 红色、high 橙色、medium 黄色、low 灰色）
3. THE Diagnosis_Card SHALL 展示根因列表，每个根因包含：原因描述（cause_description）、置信度（confidence，以百分比形式）、证据来源摘要（evidence 列表）
4. THE Diagnosis_Card SHALL 展示建议动作列表，每个动作包含：动作描述（description）、优先级（priority）、是否可自动执行（auto_executable，使用标签区分）
5. WHEN Pipeline_Result 的 stage_reached 为 "error", THE Diagnosis_Card SHALL 显示错误状态并展示 error 字段中的错误信息
6. WHEN 诊断结果标记为探索性（is_exploratory 为 true）, THE Diagnosis_Card SHALL 显示 "探索性诊断" 标签，提示用户该结果基于推理而非已有知识

### 需求 5：修复结果展示

**用户故事：** 作为运营人员，我希望看到修复执行的详细结果，以便确认异常是否已被成功修复。

#### 验收标准

1. WHEN Pipeline_Result 包含 repair 结果, THE Result_Display SHALL 渲染一个 Repair_Card
2. THE Repair_Card SHALL 展示修复整体状态（overall_status），使用语义色彩：success 绿色、partial 黄色、failed 红色、skipped 灰色
3. THE Repair_Card SHALL 展示动作结果列表，每个动作包含：动作代码（action_code）、执行状态（status，使用语义色彩标签）、执行耗时（duration_ms）、重试次数（retry_count / max_retries）
4. WHEN 动作结果状态为 "failed", THE Repair_Card SHALL 展示该动作的 error 字段内容
5. WHEN 修复结果包含升级信息（escalations 非空）, THE Repair_Card SHALL 展示升级列表，每条包含：动作代码、原因、严重程度、分配对象（assigned_to）

### 需求 6：学习反馈展示

**用户故事：** 作为运营人员，我希望看到系统从本次处理中学到了什么，以便了解知识库的演进情况。

#### 验收标准

1. WHEN Pipeline_Result 包含 learning 结果, THE Result_Display SHALL 渲染一个 Learning_Card
2. THE Learning_Card SHALL 展示学习摘要：更新的知识原子数（atoms_updated）、新建的知识原子数（atoms_created）、废弃的知识原子数（atoms_deprecated）、缓冲的模式数（patterns_buffered）
3. WHEN learning 结果中的 events 列表非空, THE Learning_Card SHALL 展示事件列表，每个事件包含：事件类型（event_type）、原因（reason）、变更摘要（changes 列表）


### 需求 7：交互式修复确认

**用户故事：** 作为运营人员，我希望在系统执行破坏性修复动作前进行确认，以便避免误操作造成数据损失。

#### 验收标准

1. WHEN 修复结果中存在 needs_confirmation 为 true 的记录, THE Exception_AI_Panel SHALL 显示 Confirmation_Dialog，列出待确认的动作
2. THE Confirmation_Dialog SHALL 展示待确认动作的描述、风险等级，并提供 "确认执行" 和 "拒绝" 两个按钮
3. WHEN 用户点击 "确认执行", THE Exception_AI_Panel SHALL 调用 Orchestrator_API 重新执行修复流程（auto_repair 设为 true）
4. WHEN 用户点击 "拒绝", THE Exception_AI_Panel SHALL 关闭 Confirmation_Dialog 并将该修复记录标记为 "已拒绝" 状态
5. WHILE Confirmation_Dialog 处于打开状态, THE Exception_AI_Panel SHALL 阻止用户发起新的诊断请求

### 需求 8：仅诊断模式

**用户故事：** 作为运营人员，我希望可以选择只进行诊断而不自动修复，以便在不确定时先了解问题再决定是否修复。

#### 验收标准

1. THE Exception_AI_Panel SHALL 提供一个 "仅诊断" 开关（toggle），默认为关闭状态（即默认执行完整的诊断+修复+学习流程）
2. WHEN "仅诊断" 开关处于开启状态且用户提交请求, THE Exception_AI_Panel SHALL 在调用 Orchestrator_API 时将 `auto_repair` 参数设为 false
3. WHEN "仅诊断" 模式下收到诊断结果, THE Exception_AI_Panel SHALL 在 Diagnosis_Card 中显示 "手动触发修复" 按钮
4. WHEN 用户点击 "手动触发修复" 按钮, THE Exception_AI_Panel SHALL 调用 Orchestrator_API，传入相同的 order_no 并将 `auto_repair` 设为 true

### 需求 9：历史记录

**用户故事：** 作为运营人员，我希望查看最近的诊断和修复记录，以便回顾之前的处理结果和追踪问题。

#### 验收标准

1. THE History_Panel SHALL 展示当前会话中所有已完成的诊断和修复记录，按时间倒序排列
2. THE History_Panel SHALL 为每条记录展示：时间戳、输入摘要（订单号或症状文本前 50 个字符）、处理模式（single/batch）、整体状态
3. WHEN 用户点击某条历史记录, THE History_Panel SHALL 在 Result_Display 区域重新展示该记录的完整诊断、修复和学习结果
4. THE History_Panel SHALL 将记录持久化到浏览器 localStorage 中，键名为 `exception-ai-history`
5. THE History_Panel SHALL 最多保留 50 条历史记录，超出时自动删除最早的记录

### 需求 10：批量模式结果展示

**用户故事：** 作为运营人员，我希望在按商户批量诊断时能清晰看到每个订单的处理结果和汇总统计，以便高效处理批量异常。

#### 验收标准

1. WHEN Orchestrator_API 返回的 mode 为 "batch", THE Result_Display SHALL 在顶部展示汇总统计卡片，包含：总数（total）、已诊断（diagnosed）、已修复（repaired）、已学习（learned）、失败（failed）
2. WHEN 批量结果包含多条 Pipeline_Result, THE Result_Display SHALL 以可折叠列表形式展示每条结果，默认折叠，点击展开查看详情
3. THE Result_Display SHALL 在汇总统计卡片中使用语义色彩区分各状态计数：已修复使用绿色、失败使用红色、已诊断使用蓝色

### 需求 11：响应式布局与无障碍访问

**用户故事：** 作为运营人员，我希望在不同屏幕尺寸下都能正常使用 AI 异常处理面板，并且面板符合无障碍访问标准。

#### 验收标准

1. THE Exception_AI_Panel SHALL 在 1024px 及以上宽度下采用双栏布局（左侧输入+结果，右侧历史记录），在 1024px 以下采用单栏堆叠布局
2. THE Exception_AI_Panel SHALL 为所有交互元素提供可见的焦点状态（focus-visible:ring-2）
3. THE Exception_AI_Panel SHALL 为所有图标按钮提供 aria-label 属性
4. THE Exception_AI_Panel SHALL 确保所有文本与背景的颜色对比度达到 4.5:1 以上
5. THE Natural_Language_Input SHALL 支持键盘导航，Tab 键可在输入框、提交按钮和快捷操作之间切换

### 需求 12：加载与空状态

**用户故事：** 作为运营人员，我希望在页面初始状态和加载过程中看到清晰的提示，以便了解当前系统状态。

#### 验收标准

1. WHEN 页面首次加载且无任何诊断结果, THE Result_Display SHALL 显示空状态插图和提示文本 "输入问题描述或使用快捷操作开始诊断"
2. WHILE 等待 Orchestrator_API 响应, THE Result_Display SHALL 显示骨架屏（skeleton）加载占位符，模拟诊断卡片的布局
3. WHEN 历史记录为空, THE History_Panel SHALL 显示 "暂无历史记录" 的提示文本
