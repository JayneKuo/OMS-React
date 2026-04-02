# OMS 异常处理 Agent 集群

## 集群架构

```
                    ┌─────────────────────┐
                    │  知识结构化 Agent    │  ← oms-exception-knowledge
                    │  (记忆体)            │
                    └──────┬──────────┬───┘
              query_ │          │ upsert_atom /
             knowledge│          │ deprecate_atom
                      ▼          ▲
                    ┌──────────┐  ┌──────────┐
                    │ 诊断Agent │  │ 学习Agent │  ← oms-exception-learning
                    └─────┬────┘  └─────▲────┘
                          │ DiagnosisResult  │ RepairFeedback
                          │ (handoff)   │
                          ▼             │
                    ┌──────────────┐────┘
                    │  处理 Agent   │  ← oms-exception-repair
                    └──────────────┘
```

## Agent 列表

| Agent | 目录 | 状态 | 职责 |
|-------|------|------|------|
| 知识结构化 Agent（记忆体） | `oms-exception-knowledge/` | ✅ 已实现 | 异常知识的存储、结构化、检索 |
| 异常诊断 Agent | `oms-exception-diagnosis/` | ✅ 已实现 | 根据症状匹配知识，推理根因 |
| 异常处理 Agent | `oms-exception-repair/` | ✅ 已实现 | 执行修复动作（重试、同步等） |
| 异常学习 Agent | `oms-exception-learning/` | ✅ 已实现 | 从运行时事件中提取新知识 |

## 数据流

1. 用户/系统提交症状信号（order_no / error_message / 自然语言描述）
2. 诊断 Agent 通过 `query_knowledge` 只读查询记忆体，匹配已知异常模式
3. 诊断 Agent 查询 OMS 数据库获取订单上下文证据
4. 如果知识匹配失败，诊断 Agent 激活探索性推理（LLM + 领域模型）
5. 诊断 Agent 输出 `DiagnosisResult`，handoff 给处理 Agent
6. 处理 Agent 按优先级执行 auto_executable 动作，对人工动作生成升级通知
7. 处理 Agent 将 `RepairFeedback` 反馈给学习 Agent
8. 学习 Agent 分析反馈，通过 `upsert_atom` / `deprecate_atom` 更新记忆体
9. 学习 Agent 定时扫描 OMS 数据库，观察人工干预（hotfix、手动修数据等）修复的异常订单，自动提取新知识入库

### 接口契约

| 从 → 到 | 数据结构 | 说明 |
|---------|---------|------|
| 诊断 → 知识 | `query_knowledge` / `get_atom` / `list_by_domain` | 只读查询 |
| 诊断 → 处理 | `DiagnosisResult` | handoff，需满足 3 个条件 |
| 处理 → 学习 | `RepairFeedback` | 异步反馈（含探索性推理标记） |
| 学习 → 知识 | `upsert_atom` / `deprecate_atom` | 写入/废弃 |
| 学习 → OMS DB | Q10/Q11/Q12 查询 | 只读，人工干预观察 |

## Agent 目录结构约定

每个 Agent 遵循统一的目录结构：

```
oms-exception-{name}/
  README.md                    ← 给人看的简介
  SKILL.md                     ← 给 AI 看的行为规范
  spec/
    {domain-spec}.md           ← 领域规范文档
    implementation/            ← 实现规范（requirements/design/tasks）
  references/                  ← 参考数据
  evals/                       ← 测试用例和评估
  scripts/                     ← 校验和工具脚本
```
