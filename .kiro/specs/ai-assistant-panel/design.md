# 设计文档：AI 助手面板

> 基于 #[[file:docs/prd-ai-assistant.md]] 和 #[[file:.kiro/specs/ai-assistant-panel/requirements.md]]

## 概述

AI 助手面板嵌入 MainLayout 右侧，通过 React Context 管理全局状态（面板开关、对话列表、活跃对话），对话数据持久化到 localStorage。当前阶段使用关键词匹配的模拟回复，后续替换为真实 AI API。

## 文件结构

```
components/ai-assistant/
  ai-assistant-context.tsx    # Context Provider + 类型定义
  ai-assistant-panel.tsx      # 面板主组件（含子组件）

components/layout/
  main-layout.tsx             # 修改：嵌入面板容器
  header-simple.tsx           # 修改：新增 Sparkles 按钮

app/layout.tsx                # 修改：注入 Provider
```

## 组件架构

```
MainLayout
├── HeaderSimple（Sparkles 按钮 → toggle）
├── Sidebar
├── <main>（页面内容，flex-1）
└── 面板容器（w-0 ↔ w-[400px] 过渡）
    └── AiAssistantPanel（h-full flex-col）
        ├── [showHistory=true] → HistoryView
        │   ├── 头部（返回 + 标题 + 新建）
        │   ├── 搜索框
        │   └── 对话列表 / 空状态
        └── [showHistory=false] → ChatView
            ├── 头部（图标 + 标题 + 新建/历史/关闭）
            ├── ScrollArea
            │   ├── [无消息] Welcome_View
            │   │   ├── Pulse 洞察卡片
            │   │   └── 分类快捷建议
            │   └── [有消息] 消息列表
            │       ├── 用户气泡
            │       ├── AI 气泡（AiBubble，解析链接）
            │       └── 加载气泡
            └── 输入区（Textarea + Send）
```

## 核心接口

### AiAssistantContext

```tsx
// 类型
interface AiMessage { id, role, content, timestamp, isLoading? }
interface Conversation { id, title, messages, createdAt, updatedAt }

// Context
interface AiAssistantContextType {
  isOpen, open, close, toggle           // 面板开关
  conversations, activeConversationId   // 对话列表
  activeConversation                    // 当前对话（computed）
  createConversation(): string          // 返回新 ID
  selectConversation(id)
  deleteConversation(id)
  addMessage(msg)                       // 追加到活跃对话
  updateMessages(updater)               // 批量更新活跃对话消息
  showHistory, setShowHistory           // 历史视图开关
}
```

### AiBubble 渲染规则

AI 消息 content 中的 `[text](href)` 解析为导航链接卡片，其余为纯文本段落。

### 模拟回复引擎

按关键词正则匹配用户输入，返回 `AiResponseBlock[]`（text | link），序列化为 markdown 链接语法存储。

## 数据持久化

- 键名：`oms-ai-conversations`
- 格式：`Conversation[]` JSON
- 读取：页面加载时 hydrate，Date 字段从字符串重建
- 写入：conversations 变化时自动同步
- 异常：读取失败降级空数组，写入失败静默忽略

## 后续扩展

详见 PRD 3.2（P1）和 3.3（P2）。核心改动点：
- 替换 `getSimulatedResponse` → 调用后端 AI API
- Pulse 洞察接入真实数据 API
- 操作执行能力（AI 调用后端 API）
- 流式回复（SSE）
