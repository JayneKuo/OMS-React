# 需求文档：AI 助手面板

> 基于产品需求文档 #[[file:docs/prd-ai-assistant.md]]

## 简介

在 OMS React 前端的 MainLayout 中嵌入全局 AI 助手面板，位于主内容区右侧。面板参考 Shopify Sidekick 的交互模式，支持自然语言多轮对话、多对话管理、对话历史、主动洞察推送和结构化回复（文本 + 可点击导航链接）。当前阶段为 UI 框架 + 模拟回复，后续接入真实 AI API。

## 术语表

- **AI_Assistant_Panel**：AI 助手面板组件，嵌入 MainLayout 右侧
- **Conversation**：一次完整的对话会话，包含多条 Message
- **Message**：对话中的单条消息（用户消息或 AI 消息）
- **Pulse_Insight**：主动洞察卡片，系统分析数据后推送的建议（对应 PRD 场景 5）
- **Suggestion_Category**：快捷建议分类，按能力域分组的预设提问入口
- **Structured_Response**：结构化回复，AI 回复中包含可点击的导航链接
- **History_View**：对话历史视图
- **Welcome_View**：欢迎视图（无活跃对话时展示）

## 需求

### 需求 1：面板布局与展开/收起

**用户故事：** 作为运营人员，我希望在任意页面点击顶部导航栏的 AI 按钮后，页面右侧平滑展开 AI 助手面板，主内容区自动收窄，以便在不离开当前页面的情况下使用 AI 助手。（PRD 4.1, 4.2）

#### 验收标准

1. THE AI_Assistant_Panel SHALL 嵌入 MainLayout 组件中，位于 `<main>` 右侧，作为 flex 布局的子元素
2. WHEN 用户点击顶部导航栏的 Sparkles 图标按钮, THE AI_Assistant_Panel SHALL 从 0 宽度平滑过渡到 400px，动画 300ms ease-in-out
3. WHEN AI_Assistant_Panel 展开时, THE 主内容区 SHALL 自动收窄，不产生水平滚动条
4. WHEN 用户再次点击 AI 按钮或面板关闭按钮, THE AI_Assistant_Panel SHALL 平滑收起到 0 宽度
5. WHEN 用户按下 Escape 键, THE AI_Assistant_Panel SHALL 收起
6. THE AI_Assistant_Panel SHALL 在所有使用 MainLayout 的页面中可用，面板状态在页面切换时保持
7. THE AI 按钮 SHALL 在面板展开时显示激活状态（`bg-primary/10 text-primary`）

### 需求 2：欢迎视图与快捷建议

**用户故事：** 作为运营人员（尤其是新用户），我希望打开 AI 助手后看到引导页面和快捷操作入口，以便快速了解 AI 助手能做什么。（PRD 4.3, 场景 4）

#### 验收标准

1. WHEN AI_Assistant_Panel 展开且无活跃对话, THE Welcome_View SHALL 显示欢迎标题和简短描述
2. THE Welcome_View SHALL 按 6 个能力域分组展示 Suggestion_Category（PRD 第 5 节定义的 7 个域，合并订单与异常到导航域）
3. WHEN 用户点击任一快捷建议, THE AI_Assistant_Panel SHALL 自动创建新对话并发送对应的预设提问
4. THE Suggestion_Category SHALL 以 2 列网格布局展示，每项包含图标和标签

### 需求 3：主动洞察（Pulse）

**用户故事：** 作为运营人员，我希望 AI 助手能主动推送业务洞察，以便在我还没意识到问题时就能及时处理。（PRD 场景 5）

#### 验收标准

1. THE Welcome_View SHALL 在快捷建议上方展示 Pulse_Insight 卡片区域
2. EACH Pulse_Insight 卡片 SHALL 包含：语义色彩图标、标题、描述、可点击操作按钮
3. WHEN 用户点击操作按钮, THE AI_Assistant_Panel SHALL 创建新对话并发送对应查询
4. EACH Pulse_Insight 卡片 SHALL 提供关闭按钮（hover 显示），关闭后当前会话不再显示
5. THE Pulse_Insight SHALL 覆盖：异常率变化（橙色）、销售趋势（绿色）、库存预警（蓝色）

### 需求 4：对话交互

**用户故事：** 作为运营人员，我希望通过自然语言与 AI 助手对话，获得数据查询、操作指引、异常诊断等帮助。（PRD 4.4, 场景 1-6）

#### 验收标准

1. THE AI_Assistant_Panel SHALL 在底部提供自动伸缩的 Textarea 和发送按钮
2. WHEN 用户按 Enter（非 Shift+Enter）, THE AI_Assistant_Panel SHALL 发送消息
3. WHEN 用户按 Shift+Enter, THE Textarea SHALL 换行
4. WHILE AI 正在回复, THE AI_Assistant_Panel SHALL 显示加载状态（Bot 头像 + "思考中..." + 旋转动画）
5. THE 对话区域 SHALL 在新消息到达时自动滚动到底部
6. THE Textarea SHALL 在面板展开时自动获取焦点
7. THE 发送按钮 SHALL 在输入为空或 AI 正在回复时禁用

### 需求 5：结构化回复

**用户故事：** 作为运营人员，我希望 AI 的回复包含可点击的导航链接，以便直接跳转到相关页面。（PRD 4.4）

#### 验收标准

1. THE AI 消息 SHALL 支持渲染纯文本段落和可点击导航链接
2. THE 导航链接 SHALL 以卡片样式展示（紫色边框 + 图标 + 箭头），点击跳转到 OMS 页面
3. THE AI 消息 SHALL 使用 `[文本](路径)` 语法存储，渲染时解析为链接
4. THE 导航链接 SHALL 使用 Next.js Link 组件实现客户端路由

### 需求 6：多对话管理

**用户故事：** 作为运营人员，我希望能创建多个独立对话并切换，以便按主题组织不同的问题。

#### 验收标准

1. THE 面板头部 SHALL 提供 "新建对话" 按钮，点击创建空白对话
2. WHEN 用户在无活跃对话时发送消息, THE AI_Assistant_Panel SHALL 自动创建新对话
3. EACH Conversation SHALL 拥有独立的消息列表
4. THE Conversation 标题 SHALL 从首条用户消息提取（前 30 字符）
5. WHEN 有活跃对话时, THE 面板头部 SHALL 显示对话标题和消息数量

### 需求 7：对话历史

**用户故事：** 作为运营人员，我希望查看和管理所有历史对话，以便回顾之前的问题和回答。

#### 验收标准

1. THE 面板头部 SHALL 提供 "对话历史" 按钮，点击切换到 History_View
2. THE History_View SHALL 按最后更新时间倒序展示对话列表
3. EACH 列表项 SHALL 展示：标题、最后消息预览、相对时间、消息数
4. THE History_View SHALL 提供搜索框，支持按标题和消息内容模糊搜索
5. WHEN 用户点击历史对话, THE AI_Assistant_Panel SHALL 切换到该对话
6. EACH 列表项 SHALL 在 hover 时显示删除按钮
7. WHEN 历史为空, THE History_View SHALL 显示空状态和新建对话按钮
8. WHEN 存在历史对话, THE 历史按钮 SHALL 显示小圆点指示器

### 需求 8：数据持久化

**用户故事：** 作为运营人员，我希望关闭浏览器后对话记录仍然保留。

#### 验收标准

1. THE AI_Assistant_Panel SHALL 将对话数据持久化到 localStorage，键名 `oms-ai-conversations`
2. WHEN 页面加载, THE AI_Assistant_Panel SHALL 从 localStorage 恢复历史对话
3. WHEN 对话数据变化, THE AI_Assistant_Panel SHALL 自动同步到 localStorage
4. IF localStorage 读取失败, THE AI_Assistant_Panel SHALL 降级为空对话列表
5. IF localStorage 写入失败, THE AI_Assistant_Panel SHALL 静默忽略

### 需求 9：能力域覆盖

**用户故事：** 作为运营人员，我希望 AI 助手能覆盖日常运营的主要场景。（PRD 第 5 节）

#### 验收标准

1. THE AI_Assistant_Panel SHALL 识别并回复 PRD 定义的 7 个能力域的问题（当前为模拟回复）
2. WHEN 回复涉及特定 OMS 页面, THE 回复 SHALL 包含可点击导航链接
3. WHEN 输入无法匹配任何能力域, THE AI_Assistant_Panel SHALL 返回通用引导回复

### 需求 10：视觉设计与无障碍

**用户故事：** 作为运营人员，我希望 AI 助手的视觉风格与 OMS 系统一致。

#### 验收标准

1. THE AI_Assistant_Panel SHALL 遵循 Item Design System 的色彩规范，使用 CSS 变量
2. THE AI_Assistant_Panel SHALL 支持暗色模式
3. THE AI_Assistant_Panel SHALL 为所有图标按钮提供 `aria-label`
4. THE 用户消息 SHALL 使用 `bg-primary text-primary-foreground`
5. THE AI 消息 SHALL 使用 `bg-muted/60`
6. THE 关闭按钮 SHALL 使用 `PanelRightClose` 图标
