# Implementation Plan: OMS 异常诊断 Agent

## Tasks

- [x] 1. 安装依赖 + 类型定义
  - [x] 1.1 安装 mysql2
  - [x] 1.2 创建 `lib/diagnosis/types.ts`
  - [x] 1.3 创建 `lib/diagnosis/index.ts`

- [x] 2. 实现 SymptomExtractor（Step 1）
  - [x] 2.1 实现实体提取（SKU、订单号、HTTP 状态码、仓库代码）
  - [x] 2.2 实现 domain_hint 推断（13 条关键词 → 域映射规则）
  - [x] 2.3 单元测试 ✅ 12 tests

- [x] 3. 实现 KnowledgeClient（Step 2）
  - [x] 3.1 封装 KnowledgeService 调用 + 三次重试策略

- [x] 4. 实现 DbEvidenceCollector（Step 3）
  - [x] 4.1 实现 MySQL 连接池
  - [x] 4.2 实现 Q1-Q4 查询 + 状态分支逻辑
  - [x] 4.3 实现 Q8 批量查询
  - [x] 4.4 超时处理

- [x] 5. 实现 ExploratoryReasoner（Step 3.5）
  - [x] 5.1 实现 6 条硬编码规则 fallback
  - [x] 5.2 单元测试 ✅ 6 tests

- [x] 6. 实现 RootCauseReasoner（Step 4）
  - [x] 6.1 实现场景 A/B/C/D 推理逻辑
  - [x] 6.2 实现置信度调整因子
  - [x] 6.3 实现动作优先级排序

- [x] 7. 实现 DiagnosisService（管线编排）
  - [x] 7.1 编排 Step 1-5 + reasoning_trace 记录
  - [x] 7.2 实现 handoff 判定
  - [x] 7.3 实现 severity 判定

- [x] 8. 实现 API Routes
  - [x] 8.1 POST /api/diagnosis/run
  - [x] 8.2 POST /api/diagnosis/batch
  - [x] 8.3 GET /api/diagnosis/results/[id]（原型阶段返回 501）
  - [x] 8.4 单例工厂 instance.ts

- [x] 9. Final checkpoint ✅ 18 tests pass, 0 TS diagnostics
