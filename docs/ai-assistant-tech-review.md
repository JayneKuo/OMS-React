# AI 助手面板 — 技术评审清单

> 评审对象：PRD `docs/prd-ai-assistant.md` · 需求 `.kiro/specs/ai-assistant-panel/requirements.md` · 设计 `.kiro/specs/ai-assistant-panel/design.md`
> 评审范围：第一期 MVP（UI 框架 + 模拟回复）

---

## 一、需求与 PRD 对齐度

| # | 检查项 | 状态 | 备注 |
|---|--------|------|------|
| 1.1 | PRD 6 个核心场景（A-F）是否都有对应需求覆盖 | ✅ | 场景 A-F 分别映射到需求 9（能力域）、需求 5（结构化回复）、需求 2（快捷建议）、需求 3（Pulse）、需求 4（对话交互） |
| 1.2 | PRD "不做什么" 是否在需求中有明确边界 | ✅ | 需求文档限定为模拟回复，不涉及写操作 |
| 1.3 | 能力域数量一致性 | ⚠️ | 需求 2 说"合并为 6 个"，需求 9 说"7 个能力域"，代码 `SUGGESTION_CATEGORIES` 实际有 7 个分类。需确认最终口径 |
| 1.4 | 对话上限是否产品确认 | ⚠️ | 代码硬编码 `MAX_CONVERSATIONS = 50`，需求文档未提及。PRD 开放问题中标注"待定" |
| 1.5 | PRD 衡量指标是否有埋点方案 | ❌ | PRD 定义了 4 个衡量指标（任务效率、采纳率、对话深度、新人上手），但需求和设计文档均未涉及埋点。建议第一期至少预留面板打开/消息发送的事件上报接口 |

---

## 二、技术设计

### 2.1 状态管理

| # | 检查项 | 风险 | 建议 |
|---|--------|------|------|
| 2.1.1 | `addMessage` 时序问题 | 🔴 高 | `ensureConversation()` 调用 `createConversation()` 通过 `setState` 设置 `activeConversationId`，但 `addMessage` 在同一个事件循环中读取 `activeConversationId`，此时 state 可能尚未更新。需验证是否存在首条消息丢失的 bug |
| 2.1.2 | 每次消息变更触发全量 localStorage 写入 | 🟡 中 | 对话多时序列化开销大。建议加 debounce（如 500ms）或仅序列化变更的对话 |
| 2.1.3 | `useMemo(() => <AiAssistantPanel />, [])` | 🟡 中 | React 不保证 useMemo 缓存稳定性。建议改用 `React.memo` 包裹组件 |
| 2.1.4 | Pulse 关闭状态未持久化 | 🟡 中 | 需求 3.4 要求"关闭后当前会话不再显示"，但 `dismissedPulse` 用 `useState` 存储，刷新即丢失。需确认是否需要持久化到 localStorage |

### 2.2 布局与响应式

| # | 检查项 | 风险 | 建议 |
|---|--------|------|------|
| 2.2.1 | 面板宽度固定 400px | 🟡 中 | 屏幕宽度 < 1200px 时主内容区会被严重压缩。PRD 说不做移动端，但需明确最小支持的桌面分辨率 |
| 2.2.2 | 面板展开时无 breakpoint 保护 | 🟡 中 | 建议在 `main` 区域设置 `min-width` 或在窄屏时自动收起面板 |

### 2.3 扩展性预留

| # | 检查项 | 状态 | 建议 |
|---|--------|------|------|
| 2.3.1 | 模拟回复替换为真实 AI 的接口契约 | ❌ | `getSimulatedResponse` 是同步函数返回 `AiResponseBlock[]`，第二期需改为异步 + 流式。建议现在就定义 `AiService` 接口，模拟回复作为其中一个实现 |
| 2.3.2 | 数据模型是否预留服务端字段 | ❌ | `Conversation` 和 `AiMessage` 缺少 `userId`、`sessionId`、`serverMessageId` 等字段。如果第二期要上报服务端，建议现在预留 |
| 2.3.3 | Pulse 数据源抽象 | ❌ | 当前 Pulse 是硬编码常量。建议抽为 `PulseProvider` 接口，方便第二期接入真实数据 API |

---

## 三、用户体验

| # | 检查项 | 风险 | 建议 |
|---|--------|------|------|
| 3.1 | 模拟回复匹配率 | 🟡 中 | 纯正则关键词匹配，用户换个说法就 fallback。建议在通用回复中明确引导用户使用快捷建议 |
| 3.2 | "回到首页"创建空对话 | 🟡 中 | 每次点 Home 按钮都会 `createConversation()`，产生空对话记录污染历史列表。建议改为"取消选中当前对话"而非新建 |
| 3.3 | 反馈按钮（👍👎）无数据收集 | ⚠️ | 当前仅 UI 状态，刷新即丢失。如果不打算收集数据，是否需要在 MVP 中展示？可能给用户造成"反馈没用"的印象 |
| 3.4 | Escape 关闭面板可能与其他弹窗冲突 | 🟡 低 | 如果面板内有 Dialog/Popover 打开，Escape 会同时关闭面板。建议检查 `e.target` 或使用事件冒泡控制 |

---

## 四、代码质量

| # | 检查项 | 建议 |
|---|--------|------|
| 4.1 | 面板组件 536 行 | 建议拆分：`AiBubble`、`CopyButton`、`FeedbackButtons`、`HistoryView` 各自独立文件 |
| 4.2 | 模拟数据与组件耦合 | `SUGGESTION_CATEGORIES`、`PULSE_INSIGHTS`、`getSimulatedResponse` 建议抽到 `lib/ai-assistant/mock-data.ts`，方便第二期替换 |
| 4.3 | 工具函数位置 | `relativeTime`、`stripLinks` 是通用函数，建议移到 `lib/utils.ts` |
| 4.4 | 类型导出 | `AiResponseBlock`、`SuggestionCategory`、`PulseInsight` 等类型未导出，后续复用不便 |

---

## 五、评审讨论问题

以下问题建议在评审会上讨论并记录结论：

1. **localStorage 策略**：50 条对话上限是否足够？是否需要按时间自动清理（如 30 天前的对话）？
2. **第二期接口契约**：AI 回复的接口格式是否需要现在就定义？是 REST 还是 SSE/WebSocket？
3. **数据上报**：对话数据后续是否需要上报服务端？如果是，`Conversation` 结构需要预留哪些字段？
4. **Pulse 数据源**：第二期洞察数据从哪来？前端轮询还是服务端推送？刷新频率？
5. **最小屏幕宽度**：面板 400px + 侧边栏 ~240px，主内容区最少需要多宽？
6. **埋点方案**：PRD 的 4 个衡量指标，第一期需要埋哪些点？

---

## 六、总结

MVP 范围清晰，PRD 到需求的映射基本完整，"不做什么"边界明确。主要风险集中在：

- `addMessage` 的状态时序问题（可能导致首条消息丢失）— 需要验证
- 扩展性预留不足（接口抽象、数据模型字段）— 影响第二期开发效率
- 部分 UI 状态（Pulse 关闭、反馈）未持久化 — 与需求描述不完全一致

建议评审后优先修复 2.1.1 的时序问题，其余项可作为 follow-up 跟踪。
