import type { KnowledgeAtom, MatchResult } from './types'

/**
 * 语义匹配层 — 关键短语匹配 + TF-IDF + Jaccard + 同义词扩展
 */

// 同义词组：组内的词视为等价
const SYNONYM_GROUPS: string[][] = [
  ['wms', 'warehouse', 'item master', 'item_master', 'master data', '仓库', '仓储'],
  ['sku', 'product', 'item', 'goods', 'merchandise', '商品', '产品'],
  ['not found', 'not exist', 'missing', 'not available', 'does not exist', 'not in', '找不到', '不存在', '缺失', '缺少', '为空'],
  ['address', 'shipping address', 'ship to', 'consignee', 'shipping details', '地址', '收货地址', '收件地址', '更新地址', '地址信息', '地址缺失'],
  ['dispatch', 'routing', 'allocation', '分派', '分仓', '分配'],
  ['out of stock', 'insufficient inventory', 'inventory shortage', '库存不足', 'currently out of stock', '缺货'],
  ['token', 'authorization', 'auth', 'oauth', 'unauthorized', '401', '授权', '令牌'],
  ['failed', 'failure', 'error', 'exception', '失败', '异常', '错误', '报错'],
  ['retry', 'resend', 'resync', 'reopen', '重试', '重推', '重新'],
  ['label', 'tracking', 'shipment', 'carrier', '面单', '承运商', '物流'],
  ['webhook', 'callback', 'notification', '回调', '通知'],
  ['rejection', 'rejected', 'reject', 'refused', '拒绝'],
  ['sync', 'synchronize', 'push', 'send', '同步', '推送'],
  ['update', 'modify', 'change', 'fix', '更新', '修改', '修复', '修数据'],
  ['database', 'db', 'data fix', '数据库', '写库', '写数据'],
  ['create', 'add', 'new', '创建', '新建', '添加'],
]

// 构建同义词查找表
const synonymMap = new Map<string, Set<string>>()
for (const group of SYNONYM_GROUPS) {
  const groupSet = new Set(group)
  for (const word of group) {
    synonymMap.set(word.toLowerCase(), groupSet)
  }
}

// 关键短语（多词匹配，权重更高）
const KEY_PHRASES = [
  'not found', 'out of stock', 'address missing', 'shipping address',
  'item master', 'dispatch fail', 'wms reject', 'token expired',
  'add new product error', 'push to warehouse fail', 'delivery failed',
  'short ship', 'label generation', 'rate shopping', 'hold rule',
  'sku not found', 'product not found', 'inventory shortage',
  'address validation', 'routing rule', 'carrier rejection',
  // 中文关键短语
  '地址缺失', '地址缺少', '缺少地址', '更新地址', '地址信息',
  '商品不存在', '找不到', '库存不足', '分派失败', '同步失败',
  '授权过期', '授权失败', '发货失败', '物流异常',
  '写数据库', '更新数据库', '修数据', '手动修复',
]

export class SemanticMatcher {
  computeMatchScores(symptomText: string, atoms: KnowledgeAtom[]): MatchResult[] {
    if (!symptomText.trim() || atoms.length === 0) return []

    const queryLower = symptomText.toLowerCase()
    const queryTokens = this.tokenize(symptomText)
    if (queryTokens.length === 0) return []

    const results: MatchResult[] = []
    for (const atom of atoms) {
      const signalText = atom.symptom_signals.join(' ').toLowerCase()
      const signalTokens = this.tokenize(signalText)

      // 1. 关键短语匹配（权重 0.5）
      const phraseScore = this.phraseMatchScore(queryLower, atom.symptom_signals)

      // 2. 同义词增强的 Jaccard（权重 0.3）
      const jaccard = this.synonymEnhancedJaccard(queryTokens, signalTokens)

      // 3. TF-IDF 余弦相似度（权重 0.2）
      const idf = this.computeIDF([symptomText, signalText])
      const cosine = this.cosineSimilarity(
        this.computeTfIdfVector(symptomText, idf),
        this.computeTfIdfVector(signalText, idf)
      )

      const score = phraseScore * 0.5 + jaccard * 0.3 + cosine * 0.2
      if (score > 0.05) {
        results.push({ atom, score: Math.min(score, 1) })
      }
    }

    return results.sort((a, b) => b.score - a.score)
  }

  findSimilar(symptomSignals: string[], existingAtoms: KnowledgeAtom[], threshold: number): KnowledgeAtom | null {
    let bestMatch: KnowledgeAtom | null = null
    let bestScore = 0
    for (const atom of existingAtoms) {
      const similarity = this.computeSimilarity(symptomSignals, atom.symptom_signals)
      if (similarity > threshold && similarity > bestScore) {
        bestScore = similarity
        bestMatch = atom
      }
    }
    return bestMatch
  }

  computeSimilarity(signalsA: string[], signalsB: string[]): number {
    const textA = signalsA.join(' ')
    const textB = signalsB.join(' ')
    const tokensA = this.tokenize(textA)
    const tokensB = this.tokenize(textB)
    if (tokensA.length === 0 || tokensB.length === 0) return 0
    const phraseScore = this.phraseMatchScore(textA.toLowerCase(), signalsB)
    const jaccard = this.synonymEnhancedJaccard(tokensA, tokensB)
    return phraseScore * 0.5 + jaccard * 0.5
  }

  // ─── 关键短语匹配 ───

  private phraseMatchScore(queryLower: string, signals: string[]): number {
    let matched = 0
    let total = 0

    for (const signal of signals) {
      const signalLower = signal.toLowerCase()
      total++

      // 直接子串匹配
      if (queryLower.includes(signalLower)) {
        matched++
        continue
      }

      // 信号中的关键词是否都出现在 query 中
      const signalWords = signalLower.split(/\s+/).filter(w => w.length > 2)
      const matchedWords = signalWords.filter(w => queryLower.includes(w))
      if (signalWords.length > 0 && matchedWords.length / signalWords.length >= 0.6) {
        matched += matchedWords.length / signalWords.length
        continue
      }

      // 同义词匹配
      const synonyms = this.getSynonyms(signalLower)
      if (synonyms.some(syn => queryLower.includes(syn))) {
        matched += 0.8
        continue
      }

      // 单词级同义词
      for (const word of signalWords) {
        const wordSyns = this.getSynonyms(word)
        if (wordSyns.some(syn => queryLower.includes(syn))) {
          matched += 0.5
          break
        }
      }
    }

    return total === 0 ? 0 : matched / total
  }

  private extractPhrases(text: string): string[] {
    const phrases: string[] = []
    // 先检查已知的关键短语
    for (const phrase of KEY_PHRASES) {
      if (text.includes(phrase)) {
        phrases.push(phrase)
      }
    }
    // 如果没匹配到关键短语，用单词
    if (phrases.length === 0) {
      const words = text.split(/\s+/).filter(w => w.length > 2)
      phrases.push(...words)
    }
    return phrases
  }

  private getSynonyms(phrase: string): string[] {
    const result: string[] = []
    const group = synonymMap.get(phrase)
    if (group) {
      result.push(...group)
    }
    // 也检查短语中的单词
    for (const word of phrase.split(/\s+/)) {
      const wordGroup = synonymMap.get(word)
      if (wordGroup) {
        result.push(...wordGroup)
      }
    }
    return result
  }

  // ─── 同义词增强 Jaccard ───

  private synonymEnhancedJaccard(tokensA: string[], tokensB: string[]): number {
    const setA = new Set(tokensA)
    const setB = new Set(tokensB)
    let intersection = 0

    for (const t of setA) {
      if (setB.has(t)) {
        intersection++
      } else {
        // 检查同义词
        const group = synonymMap.get(t)
        if (group) {
          for (const syn of group) {
            const synTokens = syn.split(/\s+/)
            if (synTokens.some(st => setB.has(st))) {
              intersection += 0.7
              break
            }
          }
        }
      }
    }

    const union = setA.size + setB.size - intersection
    return union === 0 ? 0 : intersection / union
  }

  // ─── TF-IDF ───

  private tokenize(text: string): string[] {
    const lower = text.toLowerCase()
    // 英文 token
    const englishTokens = lower
      .replace(/[\u4e00-\u9fff]/g, ' ')
      .replace(/[^a-z0-9\s]+/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1)

    // 中文 token：提取连续中文字符串，保留 2 字及以上的词
    const chineseMatches = lower.match(/[\u4e00-\u9fff]{2,}/g) || []

    // 中文 bigram：对长词额外生成 bigram 以提高匹配率
    const chineseBigrams: string[] = []
    for (const word of chineseMatches) {
      if (word.length > 2) {
        for (let i = 0; i < word.length - 1; i++) {
          chineseBigrams.push(word.slice(i, i + 2))
        }
      }
    }

    return [...englishTokens, ...chineseMatches, ...chineseBigrams]
  }

  private computeIDF(documents: string[]): Map<string, number> {
    const df = new Map<string, number>()
    const n = documents.length
    for (const doc of documents) {
      const tokens = new Set(this.tokenize(doc))
      for (const t of tokens) {
        df.set(t, (df.get(t) || 0) + 1)
      }
    }
    const idf = new Map<string, number>()
    for (const [term, count] of df) {
      idf.set(term, Math.log((n + 1) / (count + 1)) + 1)
    }
    return idf
  }

  private computeTfIdfVector(text: string, idf: Map<string, number>): Map<string, number> {
    const tokens = this.tokenize(text)
    const tf = new Map<string, number>()
    for (const t of tokens) {
      tf.set(t, (tf.get(t) || 0) + 1)
    }
    const vec = new Map<string, number>()
    for (const [term, count] of tf) {
      vec.set(term, (count / tokens.length) * (idf.get(term) || 1))
    }
    return vec
  }

  private cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dot = 0, normA = 0, normB = 0
    for (const [term, valA] of vecA) {
      normA += valA * valA
      dot += valA * (vecB.get(term) || 0)
    }
    for (const [, valB] of vecB) {
      normB += valB * valB
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB)
    return denom === 0 ? 0 : dot / denom
  }
}
