# 实施计划：AI 助手面板

> 基于 #[[file:.kiro/specs/ai-assistant-panel/requirements.md]] 和 #[[file:.kiro/specs/ai-assistant-panel/design.md]]

## 任务

- [x] 1. Context 与 Provider
  - [x] 1.1 创建 `ai-assistant-context.tsx`：类型定义、Provider、localStorage 持久化
    - _需求：6, 8_

- [x] 2. 布局集成
  - [x] 2.1 `app/layout.tsx`：注入 AiAssistantProvider
  - [x] 2.2 `main-layout.tsx`：右侧面板容器（宽度过渡）
  - [x] 2.3 `header-simple.tsx`：Sparkles 按钮 + 激活态
    - _需求：1_

- [x] 3. 面板主组件
  - [x] 3.1 面板骨架：Header + ScrollArea + InputArea — _需求：1, 4_
  - [x] 3.2 Welcome_View：Pulse 洞察 + 分类快捷建议 — _需求：2, 3_
  - [x] 3.3 对话交互：发送/接收/加载/滚动/聚焦 — _需求：4_
  - [x] 3.4 AiBubble：解析 markdown 链接为导航卡片 — _需求：5_
  - [x] 3.5 模拟回复引擎：7 个能力域关键词匹配 — _需求：9_

- [x] 4. 对话历史
  - [x] 4.1 HistoryView：搜索 + 列表 + 空状态 — _需求：7_
  - [x] 4.2 历史按钮指示器 — _需求：7.8_

- [x] 5. 视觉与无障碍
  - [x] 5.1 暗色模式、CSS 变量、aria-label — _需求：10_

- [ ] 6. 后续迭代（P1/P2，见 PRD）
  - [ ] 6.1 接入真实 AI API
  - [ ] 6.2 异常诊断集成
  - [ ] 6.3 Pulse 真实数据
  - [ ] 6.4 操作执行能力
  - [ ] 6.5 流式回复
  - [ ] 6.6 上下文感知
