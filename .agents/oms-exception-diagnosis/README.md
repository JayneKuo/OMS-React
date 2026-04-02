# OMS 异常诊断 Agent (oms-exception-diagnosis)

## 概述

异常诊断 Agent 是 OMS 异常处理集群的"大脑"。它接收症状信号（订单号、错误信息、用户描述），
通过查询知识 Agent 和 OMS 数据库，推理出异常的根因，并输出结构化的诊断结果。

## 集群位置

```
                    ┌─────────────────────┐
                    │  知识结构化 Agent    │
                    │  (记忆体)            │
                    └──────┬──────────────┘
                      读取 │
                           ▼
                    ┌──────────────┐
                    │  诊断 Agent   │ ← 你在这里
                    └──────┬───────┘
                           │ handoff
                           ▼
                    ┌──────────────┐
                    │  处理 Agent   │
                    └──────────────┘
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 症状采集 | 从 order_no、remark、用户描述中提取症状信号 |
| 知识匹配 | 调用知识 Agent 的 `query_knowledge` 匹配已知异常模式 |
| 数据库取证 | 查询 OMS MySQL 获取订单上下文（状态链路、拆单、履约、消息） |
| 根因推理 | 综合知识匹配 + 数据库证据，推理最可能的根因 |
| 结果输出 | 输出结构化 `DiagnosisResult`，包含根因、置信度、建议动作 |
| Handoff | 将诊断结果传递给处理 Agent 执行修复 |

## 不做什么

- 不执行任何修复动作（那是处理 Agent 的事）
- 不写入知识库（那是学习 Agent 的事）
- 不直接与终端用户交互（通过调度层转发）

## 目录结构

```
oms-exception-diagnosis/
  README.md                          ← 你在看的这个
  SKILL.md                           ← AI 行为规范
  spec/
    diagnosis-result-schema.md       ← 诊断结果 Schema
    reasoning-pipeline.md            ← 推理管线定义
    database-queries.md              ← SQL 查询模式库
  references/
    order-troubleshooting.md         ← OMS 排查手册
    tables-order.md                  ← OMS 业务表结构
  evals/
    evals.json                       ← 测试用例
```

## 输入 / 输出

**输入**（任选一种或组合）：
- `order_no` — OMS 订单号
- `channel_sales_order_no` — 渠道订单号
- `symptom_text` — 自然语言症状描述
- `error_message` — 系统错误信息

**输出**：
- `DiagnosisResult` — 结构化诊断结果（详见 spec/diagnosis-result-schema.md）
