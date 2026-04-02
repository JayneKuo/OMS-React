# OMS 异常处理 Agent (oms-exception-repair)

## 概述

异常处理 Agent 是 OMS 异常处理集群的"双手"。它接收诊断 Agent 的 DiagnosisResult，
按照建议动作编码执行修复操作，并记录执行结果。

## 集群位置

```
                    ┌─────────────────────┐
                    │  知识结构化 Agent    │
                    │  (记忆体)            │
                    └──────┬──────────┬───┘
                      读取 │          │ 写入
                           ▼          ▲
                    ┌──────────┐  ┌──────────┐
                    │ 诊断Agent │  │ 学习Agent │
                    └─────┬────┘  └──────────┘
                          │ handoff
                          ▼
                    ┌──────────────┐
                    │  处理 Agent   │ ← 你在这里
                    └──────────────┘
```

## 核心能力

| 能力 | 说明 |
|------|------|
| 接收 Handoff | 从诊断 Agent 接收 DiagnosisResult |
| 动作编排 | 按优先级排序并编排 auto_executable 动作 |
| 动作执行 | 调用下游系统 API 执行修复（重试、同步、映射等） |
| 结果记录 | 记录每个动作的执行结果（成功/失败/跳过） |
| 人工升级 | 对需人工介入的动作生成工单或通知 |
| 反馈闭环 | 将执行结果反馈给学习 Agent |

## 不做什么

- 不做诊断推理（那是诊断 Agent 的事）
- 不写入知识库（那是学习 Agent 的事）
- 不修改诊断结论（只执行建议动作）

## 目录结构

```
oms-exception-repair/
  README.md                          ← 你在看的这个
  SKILL.md                           ← AI 行为规范
  spec/
    repair-result-schema.md          ← 修复结果 Schema
    action-executors.md              ← 动作执行器定义
    execution-pipeline.md            ← 执行管线
  evals/
    evals.json                       ← 测试用例
```
