# Implementation Plan: OMS 异常知识结构化 Agent（记忆体）

## Overview

基于三层架构（API → Service → Repository）实现知识存储系统。按自底向上顺序构建：先定义类型和常量，再实现存储层、校验层、语义匹配层、业务逻辑层，最后接入 API 路由。每层实现后通过属性测试验证正确性。

实现语言：TypeScript（strict mode）
测试框架：Vitest + fast-check
运行时：Next.js 14 API Routes（App Router）

## Tasks

- [x] 1. 项目基础设施搭建
  - [x] 1.1 安装测试依赖
    - 安装 `vitest` 和 `fast-check` 为 devDependencies
    - 创建 `vitest.config.ts` 配置文件，设置 path alias `@/*` 与 tsconfig 一致
    - _Requirements: 设计文档测试策略_

  - [x] 1.2 创建类型定义和常量
    - 创建 `lib/knowledge-store/types.ts`：定义 `KnowledgeAtom`、`RootCause`、`AtomContext`、`AtomSource`、`ValidationResult`、`ValidationError`、`MatchResult`、`QueryResult`、`UpsertResult`、`ErrorResponse` 接口
    - 创建 `lib/knowledge-store/constants.ts`：定义 `VALID_DOMAINS`（24 个标准域）和 `VALID_ACTION_CODES`（17 个标准动作编码）
    - 创建 `lib/knowledge-store/index.ts`：模块入口，导出所有公共接口
    - _Requirements: 1.4, 1.5, 9.1, 9.2_

- [x] 2. 实现 SchemaValidator（校验层）
  - [x] 2.1 实现 SchemaValidator 类
    - 创建 `lib/knowledge-store/schema-validator.ts`
    - 实现 `validate(atom: Partial<KnowledgeAtom>): ValidationResult`：校验必填字段（domain、symptom_signals）、domain 合法性、action_code 合法性、confidence 范围、probability 范围
    - 实现 `validateDomain(domain: string): boolean`
    - 实现 `validateActionCodes(actions: string[]): ValidationResult`
    - 实现 `validateConfidence(value: number): boolean`
    - 实现 `validateProbability(value: number): boolean`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x]* 2.2 属性测试：必填字段校验拒绝无效输入
    - **Property 1: 必填字段校验拒绝无效输入**
    - 生成随机的 Partial<KnowledgeAtom>，缺少 domain 或 symptom_signals 或 symptom_signals 为空数组时，validate() 应返回 valid: false
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [x]* 2.3 属性测试：Domain 编码校验
    - **Property 2: Domain 编码校验**
    - 对任意字符串 d，validateDomain(d) 返回 true 当且仅当 d 在 VALID_DOMAINS 中
    - **Validates: Requirements 1.4, 9.1**

  - [x]* 2.4 属性测试：Action Code 编码校验
    - **Property 3: Action Code 编码校验**
    - 对任意字符串数组 actions，validateActionCodes(actions) 全部有效当且仅当每个元素在 VALID_ACTION_CODES 中
    - **Validates: Requirements 1.5, 9.2**

  - [x]* 2.5 属性测试：数值范围校验
    - **Property 4: 数值范围校验**
    - 对任意数值 n，validateConfidence(n) 和 validateProbability(n) 返回 true 当且仅当 0.0 <= n <= 1.0
    - **Validates: Requirements 1.6, 1.7**

- [x] 3. 实现 KnowledgeRepository 和 JsonFileRepository（存储层）
  - [x] 3.1 定义 KnowledgeRepository 接口并实现 JsonFileRepository
    - 创建 `lib/knowledge-store/repository/interface.ts`：定义 `KnowledgeRepository` 接口（getAtomById、getAtomsByDomain、getAllAtoms、createAtom、updateAtom、flush）
    - 创建 `lib/knowledge-store/repository/json-file-repository.ts`：实现内存 Map + JSON 文件持久化，启动时从文件加载，写操作后立即 flush
    - 创建 `lib/knowledge-store/repository/index.ts`：导出接口和工厂函数
    - 处理文件不存在（创建空文件）、文件损坏（尝试 .backup 恢复）等错误场景
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x]* 3.2 属性测试：持久化往返
    - **Property 20: 持久化往返**
    - 通过 createAtom/updateAtom 写入后，重新从 JSON 文件加载，所有原子数据应与写入前内存中的数据一致
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 4. Checkpoint - 确保基础层测试通过 ✅ 14/14 tests passed

- [x] 5. 实现 SemanticMatcher（语义匹配层）
  - [x] 5.1 实现 SemanticMatcher 类
    - 创建 `lib/knowledge-store/semantic-matcher.ts`
    - 实现分词函数（英文按空格/标点分词，支持 OMS 术语）
    - 实现 Jaccard 相似度计算（关键词匹配，权重 0.6）
    - 实现 TF-IDF 向量化 + 余弦相似度计算（权重 0.4）
    - 实现 `computeMatchScores(symptomText, atoms): MatchResult[]`
    - 实现 `findSimilar(symptomSignals, existingAtoms, threshold): KnowledgeAtom | null`
    - 实现 `computeSimilarity(signalsA, signalsB): number`
    - _Requirements: 3.1, 3.5, 6.1, 6.2_

  - [x]* 5.2 单元测试：SemanticMatcher 语义匹配
    - 测试已知 OMS 异常术语的匹配准确性（如 "Dispatch failure" 应匹配 ORDER_DISPATCH 域的原子）
    - 测试相似度阈值 0.85 的判定边界
    - 测试空输入、单词输入等边界情况
    - _Requirements: 3.1, 6.1, 6.2_

- [x] 6. 实现 SeedLoader（种子知识加载器）
  - [x] 6.1 实现 SeedLoader 类
    - 创建 `lib/knowledge-store/seed-loader.ts`
    - 实现 `parseKnownExceptions(markdownContent: string): KnowledgeAtom[]`：解析 known-exceptions.md 的 Markdown 结构，提取 11 个异常模式
    - 实现 `loadSeeds(repository, seedFilePath): Promise<{ loaded: number; errors: string[] }>`
    - 每条种子知识的 source.type 设为 "knowledge_graph"，confidence 设为 0.8
    - 自动生成 Atom_ID（格式 "KA-{domain}-{seq}"）
    - 处理文件不存在和解析失败的错误场景
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x]* 6.2 属性测试：种子知识不变量
    - **Property 6: 种子知识不变量**
    - 通过 initializeSeedKnowledge() 加载的每条 KnowledgeAtom，source.type 应为 "knowledge_graph"，confidence 应为 0.8
    - **Validates: Requirements 2.2, 2.3**

  - [x]* 6.3 单元测试：种子知识解析
    - 验证 11 个已知异常模式全部正确解析
    - 验证覆盖 11 个 Domain_Code
    - 测试种子文件不存在时的降级行为
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 7. 实现 KnowledgeService（业务逻辑层）
  - [x] 7.1 实现 KnowledgeService 核心逻辑
    - 创建 `lib/knowledge-store/knowledge-service.ts`
    - 实现构造函数：注入 repository、validator、matcher
    - 实现 `queryKnowledge(symptomText, domainHint?, topK?)`：域过滤 → 语义匹配 → confidence × matchScore 排序 → top_k 截断 → 更新 hit_count/last_hit_at → 排除 deprecated
    - 实现 `getAtom(atomId)`：精确获取，不更新统计
    - 实现 `listByDomain(domain, includeLowConfidence?)`：域过滤 + confidence >= 0.3 过滤（默认）+ deprecated 过滤
    - 实现 `upsertAtom(atom, source)`：Schema 校验 → 语义去重（阈值 0.85）→ 合并或新建 → 生成 Atom_ID → 持久化
    - 实现 `deprecateAtom(atomId, reason)`：标记 deprecated + 记录原因 + 持久化
    - 实现 `initializeSeedKnowledge()`：调用 SeedLoader 加载种子知识
    - _Requirements: 1.8, 1.9, 3.1-3.6, 4.1-4.3, 5.1-5.5, 6.1-6.8, 7.1-7.4, 10.1-10.5_

  - [x]* 7.2 属性测试：新建原子初始化不变量
    - **Property 5: 新建原子初始化不变量**
    - 通过 upsertAtom 新建的 KnowledgeAtom，atom_id 匹配 `^KA-{domain}-\d{3,}$`，version 为 1，hit_count 为 0，last_hit_at 为 null
    - **Validates: Requirements 1.8, 1.9**

  - [x]* 7.3 属性测试：查询结果排序和 top_k
    - **Property 7: 查询结果按综合分数降序排列**
    - queryKnowledge 返回的结果列表中，相邻结果满足 confidence × matchScore 降序
    - **Validates: Requirements 3.1, 3.5**
    - **Property 9: top_k 限制**
    - queryKnowledge 返回结果数量 <= topK（默认 5）
    - **Validates: Requirements 3.3**

  - [x]* 7.4 属性测试：domain_hint 过滤
    - **Property 8: domain_hint 过滤**
    - 带 domainHint 的 queryKnowledge 调用，返回结果中所有原子的 domain 等于 domainHint
    - **Validates: Requirements 3.2**

  - [x]* 7.5 属性测试：查询命中更新统计 & get_atom 不更新统计
    - **Property 10: 查询命中更新统计**
    - queryKnowledge 返回的非空结果中，每个被命中原子的 hit_count 比调用前增加 1
    - **Validates: Requirements 3.4**
    - **Property 12: get_atom 不更新统计**
    - getAtom 调用后，被获取原子的 hit_count 和 last_hit_at 保持不变
    - **Validates: Requirements 4.3**

  - [x]* 7.6 属性测试：list_by_domain 过滤行为
    - **Property 13: list_by_domain 默认过滤**
    - 默认调用不包含 confidence < 0.3 和 deprecated 的原子
    - **Validates: Requirements 5.2, 5.5**
    - **Property 14: list_by_domain 域过滤**
    - 返回结果中所有原子的 domain 等于传入参数
    - **Validates: Requirements 5.1**
    - **Property 15: include_low_confidence 包含低置信度原子**
    - includeLowConfidence=true 时返回该域下所有非 deprecated 原子
    - **Validates: Requirements 5.3**

  - [x]* 7.7 属性测试：新建 vs 合并判定 & 合并行为
    - **Property 16: 新建 vs 合并判定**
    - 语义相似度 > 0.85 时 is_new 为 false，<= 0.85 时 is_new 为 true
    - **Validates: Requirements 6.1, 6.2**
    - **Property 17: 合并保留并组合数据**
    - 合并后原子包含新旧双方的 root_causes 和 actions（去重），confidence 取较高值，version +1
    - **Validates: Requirements 6.3, 6.4, 6.5, 6.6, 6.7**

  - [x]* 7.8 属性测试：废弃行为
    - **Property 18: 废弃标记保留数据**
    - deprecateAtom 后 deprecated 为 true，deprecated_reason 正确，getAtom 仍可获取
    - **Validates: Requirements 7.1, 7.3**
    - **Property 19: 废弃原子从默认查询中排除**
    - deprecated 原子不出现在 queryKnowledge 和 listByDomain 默认结果中
    - **Validates: Requirements 7.4**

  - [x]* 7.9 属性测试：get_atom 读写往返 & Atom_ID 唯一性
    - **Property 11: get_atom 读写往返**
    - 已存储的 KnowledgeAtom 通过 getAtom 获取的结果与存储数据完全一致
    - **Validates: Requirements 4.1**
    - **Property 21: Atom_ID 全局唯一**
    - 所有存储的 KnowledgeAtom 的 atom_id 两两不同
    - **Validates: Requirements 9.3**

- [x] 8. Checkpoint - 确保核心业务逻辑测试通过 ✅ 50/50 tests passed

- [x] 9. 实现 API Routes（接入层）
  - [x] 9.1 创建 API 路由和服务实例工厂
    - 创建 `lib/knowledge-store/instance.ts`：单例工厂，初始化 JsonFileRepository → SchemaValidator → SemanticMatcher → KnowledgeService，首次调用时加载种子知识
    - _Requirements: 2.1, 10.1_

  - [x] 9.2 实现查询 API 路由
    - 创建 `app/api/knowledge/query/route.ts`：POST 处理，解析 symptomText/domainHint/topK，调用 KnowledgeService.queryKnowledge，返回 JSON
    - 创建 `app/api/knowledge/atoms/[id]/route.ts`：GET 处理，调用 KnowledgeService.getAtom，不存在返回 404
    - 创建 `app/api/knowledge/domains/[domain]/route.ts`：GET 处理，解析 include_low_confidence 查询参数，调用 KnowledgeService.listByDomain
    - _Requirements: 3.1-3.6, 4.1-4.2, 5.1-5.5, 10.1, 10.2_

  - [x] 9.3 实现写入 API 路由
    - 创建 `app/api/knowledge/upsert/route.ts`：POST 处理，解析 atom + source，调用 KnowledgeService.upsertAtom，校验失败返回 400
    - 创建 `app/api/knowledge/atoms/[id]/deprecate/route.ts`：POST 处理，解析 reason，调用 KnowledgeService.deprecateAtom
    - 统一错误响应格式：`{ error: string, message: string, details?: unknown }`
    - _Requirements: 6.1-6.8, 7.1-7.4, 10.1_

  - [ ]* 9.4 API 路由集成测试
    - 测试完整的 upsert → query → get 流程
    - 测试种子加载 → 查询验证流程
    - 测试校验失败返回 400 的场景
    - 测试不存在的 Atom_ID 返回 404
    - _Requirements: 3.6, 4.2, 5.4, 7.2, 10.1_

- [x] 10. 创建种子知识数据文件
  - 创建 `data/knowledge-store.json` 的初始空结构：`{ "version": 1, "updated_at": "", "atoms": [], "metadata": { "total_count": 0, "domain_counts": {} } }`
  - 确保 `data/` 目录在 `.gitignore` 中排除运行时生成的数据（或保留初始空文件）
  - _Requirements: 8.1, 8.4_

- [x] 11. Final checkpoint - 全部测试通过 ✅ 50/50 tests passed

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (21 properties from design document)
- Unit tests validate specific examples and edge cases
- ~~vitest 和 fast-check 需要先安装（项目当前未包含这些依赖）~~ ✅ 已安装
- 所有代码使用 `@/*` 路径别名，与 tsconfig.json 一致
