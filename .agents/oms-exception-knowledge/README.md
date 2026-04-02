# 知识结构化 Agent（记忆体）

OMS 异常处理 Agent 集群的核心记忆体。负责异常知识的结构化存储、语义检索和一致性维护。

## 定位

纯粹的知识存储层。不诊断、不修复、不学习、不分派。

## 消费者

- 诊断 Agent → 只读（query_knowledge, get_atom, list_by_domain）
- 学习 Agent → 写入（upsert_atom, deprecate_atom）

## 技术栈

- Next.js 14 API Routes（App Router）
- TypeScript strict mode
- 原型存储：本地 JSON 文件
- 生产存储：PostgreSQL + pgvector
- 语义匹配：TF-IDF + 关键词 Jaccard（原型）→ OpenAI Embeddings（生产）

## 目录结构

```
oms-exception-knowledge/
  README.md                              ← 你在看的这个
  SKILL.md                               ← Agent 行为规范（给 AI 看）
  spec/
    knowledge-atom-schema.md             ← 知识原子 Schema 定义
    api-interface.md                     ← API 接口规范（5 个标准接口）
    user-interaction.md                  ← 用户交互模式规范
    implementation/
      requirements.md                    ← 需求文档（10 个需求，48 条验收标准）
      design.md                          ← 技术设计文档
      tasks.md                           ← 实现任务计划
  references/
    business-domains.md                  ← 24 个标准业务域编码
    action-codes.md                      ← 17 个标准动作编码
    known-exceptions.md                  ← 11 个种子异常模式
  evals/
    evals.json                           ← 测试用例
  scripts/
    validate_knowledge_base.js           ← 知识库校验脚本
```

## 种子知识来源

| 来源 | 状态 | 覆盖 |
|------|------|------|
| Neo4j 知识图谱（176 nodes / 333 rels） | ✅ 已提取 | 11 个异常模式 |
| Java 后端代码库（linker-oms） | ⏳ 待提取 | try/catch、异常类、错误码 |
| OMS 业务文档（4 份） | ⏳ 待提取 | 常见问题、操作指南 |

## 当前进度

- [x] SKILL.md 行为规范
- [x] 种子知识提取（知识图谱）
- [x] 需求文档
- [x] 技术设计文档
- [x] 实现任务计划
- [ ] 代码实现
- [ ] 测试
