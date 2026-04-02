# 技术设计文档：OMS 异常诊断 Agent

## 架构

```
                    ┌──────────────────────────────┐
                    │  API Layer (Next.js Routes)   │
                    │  /api/diagnosis/*              │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │  DiagnosisService             │
                    │  (推理管线编排)                │
                    └──┬────┬────┬────┬────┬───────┘
                       │    │    │    │    │
              Step1    │    │    │    │    │  Step5
           ┌───────────▼┐ ┌▼────▼┐ ┌▼────▼──────┐
           │ Symptom    │ │Know- │ │ DB         │
           │ Extractor  │ │ledge │ │ Evidence   │
           │            │ │Client│ │ Collector  │
           └────────────┘ └──────┘ └────────────┘
                                   Step3    Step3.5
                               ┌────────────────┐
                               │ Exploratory    │
                               │ Reasoner       │
                               └────────────────┘
```

### 技术栈

- 运行时：Next.js 14 API Routes
- 语言：TypeScript strict mode
- 数据库：mysql2（promise API）
- 知识查询：调用已实现的 KnowledgeService
- 测试：Vitest

### 组件

#### 1. SymptomExtractor

```typescript
class SymptomExtractor {
  extract(input: DiagnosisInput): ExtractedSymptom
}

interface ExtractedSymptom {
  order_no: string | null
  symptom_text: string
  extracted_entities: Record<string, string[]>  // { sku: [], order_no: [], http_code: [] }
  domain_hint: string | null
}
```

#### 2. KnowledgeClient

封装对 KnowledgeService 的调用，实现三次重试策略。

```typescript
class KnowledgeClient {
  constructor(knowledgeService: KnowledgeService)
  async matchKnowledge(symptom: ExtractedSymptom): Promise<KnowledgeMatchResult>
}

interface KnowledgeMatchResult {
  matched: boolean
  atoms: KnowledgeAtom[]
  scores: number[]
  attempts: number  // 1-3
}
```

#### 3. DbEvidenceCollector

执行预定义 SQL 查询，收集订单上下文。

```typescript
class DbEvidenceCollector {
  constructor(connectionConfig: MysqlConfig)
  async collectEvidence(orderNo: string): Promise<OrderContext | null>
}
```

#### 4. ExploratoryReasoner

知识匹配失败时的推理引擎。原型阶段仅实现规则 fallback。

```typescript
class ExploratoryReasoner {
  reason(symptom: ExtractedSymptom, context: OrderContext | null): ExploratoryResult
}

interface ExploratoryResult {
  activated: boolean
  hypotheses: ExploratoryHypothesis[]
  reasoning_method: 'rule_based_fallback' | 'llm_chain_of_thought'
}
```

#### 5. RootCauseReasoner

综合知识匹配 + 数据库证据 + 探索性推理，输出根因。

```typescript
class RootCauseReasoner {
  reason(params: {
    knowledge: KnowledgeMatchResult
    evidence: OrderContext | null
    exploratory: ExploratoryResult | null
    symptom: ExtractedSymptom
  }): RootCauseResult
}
```

#### 6. DiagnosisService

编排整个推理管线。

```typescript
class DiagnosisService {
  constructor(
    symptomExtractor: SymptomExtractor,
    knowledgeClient: KnowledgeClient,
    dbCollector: DbEvidenceCollector,
    exploratoryReasoner: ExploratoryReasoner,
    rootCauseReasoner: RootCauseReasoner
  )
  async diagnose(input: DiagnosisInput): Promise<DiagnosisResult>
  async batchDiagnose(merchantNo: string): Promise<DiagnosisResult[]>
}
```

### 文件结构

```
lib/
  diagnosis/
    types.ts                    # DiagnosisResult, DiagnosisInput 等类型
    symptom-extractor.ts        # Step 1
    knowledge-client.ts         # Step 2
    db-evidence-collector.ts    # Step 3
    exploratory-reasoner.ts     # Step 3.5
    root-cause-reasoner.ts      # Step 4
    diagnosis-service.ts        # 管线编排
    instance.ts                 # 单例工厂
    index.ts                    # 模块入口

app/
  api/
    diagnosis/
      run/route.ts              # POST 单次诊断
      batch/route.ts            # POST 批量诊断
      results/[id]/route.ts     # GET 历史结果
```

### 数据库连接

使用 mysql2/promise，连接池配置：

```typescript
const pool = mysql.createPool({
  host: 'ec2-54-189-142-24.us-west-2.compute.amazonaws.com',
  port: 3306,
  user: 'linker',
  password: 'ExXNtyZuYv8ZGRJo',
  database: 'linker_oms_opc',
  connectionLimit: 5,
  connectTimeout: 5000,
  waitForConnections: true,
})
```
