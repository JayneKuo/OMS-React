# AI 聊天助手 - 移植参考包

本文件夹包含从 OMS React 项目中提取的 AI 聊天助手完整代码，供在其他 Next.js 项目中复用。

## 快速开始

在 VS Code 中对 Claude 说：
> 参考 ai-chat-reference/ 下的代码，帮我在这个项目里实现一个 AI 聊天助手面板。

## 架构概览

```
前端组件 (React)
├── AiAssistantProvider   — Context，管理多轮对话、localStorage 持久化
├── AiAssistantPanel      — 聊天面板 UI（欢迎页、建议卡片、消息列表、输入框）
└── ChatChart             — AI 回复中的图表渲染（bar/line/pie/metric/table）

后端 API (Next.js API Route)
└── POST /api/ai/chat     — 代理到 AgentForce 平台，支持多轮 session
```

## 技术栈依赖

| 依赖 | 用途 |
|------|------|
| react-markdown | AI 回复 Markdown 渲染 |
| remark-gfm | GFM 表格/任务列表支持 |
| recharts | 图表渲染 |
| shadcn/ui | UI 组件（Button, ScrollArea, Textarea, Badge, Input, Separator） |
| lucide-react | 图标 |
| next-themes | 暗色模式（可选） |

## 环境变量

```env
# AgentForce AI 平台（或替换为你自己的 LLM 后端）
AGENTFORCE_AGENT_ID=你的agent_id
AGENTFORCE_API_KEY=你的api_key
```

## 集成步骤

1. 安装依赖：`npm install react-markdown remark-gfm recharts`
2. 确保项目已有 shadcn/ui 组件（Button, ScrollArea, Textarea, Badge, Input, Separator）
3. 复制 `components/` 和 `api-route/` 到你的项目对应目录
4. 在 layout.tsx 中包裹 `<AiAssistantProvider>`
5. 在需要的地方渲染 `<AiAssistantPanel />`
6. 配置环境变量
7. 根据你的 AI 后端修改 `api-route/chat-route.ts` 中的请求逻辑

## 文件清单

```
ai-chat-reference/
├── README.md                          ← 本文件
├── components/
│   ├── ai-assistant-context.tsx       ← Context Provider（对话状态管理）
│   ├── ai-assistant-panel.tsx         ← 聊天面板主组件
│   └── chat-chart.tsx                 ← 图表解析与渲染
├── api-route/
│   └── chat-route.ts                  ← Next.js API Route（代理到 AI 后端）
└── utils/
    └── utils.ts                       ← cn() 工具函数
```

## 自定义要点

- **建议卡片**：修改 `SUGGESTION_CATEGORIES` 数组适配你的业务
- **洞察卡片**：修改 `PULSE_INSIGHTS` 数组或删除
- **模拟回复**：`getSimulatedResponse()` 是 API 不可用时的降级方案，可按需修改
- **AI 后端**：替换 `chat-route.ts` 中的 AgentForce 调用为你自己的 LLM API
- **存储 key**：修改 `STORAGE_KEY` 避免与其他项目冲突
