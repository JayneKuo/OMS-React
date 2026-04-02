# OMS 异常学习 Agent (oms-exception-learning)

## 概述

异常学习 Agent 是 OMS 异常处理集群的"进化引擎"。它从处理 Agent 的修复反馈和运行时事件中
提取新的异常模式，写入知识 Agent，让集群越用越聪明。

## 集群位置

```
                    ┌─────────────────────┐
                    │  知识结构化 Agent    │
                    │  (记忆体)            │
                    └──────┬──────────┬───┘
                      读取 │          │ 写入
                           ▼          ▲
                    ┌──────────┐  ┌──────────────┐
                    │ 诊断Agent │  │  学习 Agent   │ ← 你在这里
                    └─────┬────┘  └──────┬───────┘
                          │ handoff      ▲ feedback
                          ▼              │
                    ┌──────────────┐─────┘
                    │  处理 Agent   │
                    └──────────────┘
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 反馈消化 | 接收处理 Agent 的 RepairFeedback |
| 模式提取 | 从反馈中识别新的异常模式或修正已有模式 |
| 知识写入 | 调用知识 Agent 的 `upsert_atom` 写入新知识 |
| 知识废弃 | 对不再有效的知识调用 `deprecate_atom` |
| 置信度调整 | 根据修复成功率调整知识原子的 confidence |

## 不做什么

- 不做诊断推理（那是诊断 Agent 的事）
- 不执行修复动作（那是处理 Agent 的事）
- 不直接与终端用户交互
- 不读取数据库（通过反馈间接获取信息）

## 目录结构

```
oms-exception-learning/
  README.md                          ← 你在看的这个
  SKILL.md                           ← AI 行为规范
  spec/
    learning-event-schema.md         ← 学习事件 Schema
    knowledge-evolution-rules.md     ← 知识演化规则
  evals/
    evals.json                       ← 测试用例
```
