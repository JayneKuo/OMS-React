import fs from 'fs/promises'
import path from 'path'
import type { KnowledgeAtom, KnowledgeStoreFile } from '../types'
import type { KnowledgeRepository } from './interface'

export class JsonFileRepository implements KnowledgeRepository {
  private atoms: Map<string, KnowledgeAtom> = new Map()
  private filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
  }

  async initialize(): Promise<void> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8')
      const data: KnowledgeStoreFile = JSON.parse(content)
      if (data.atoms && Array.isArray(data.atoms)) {
        for (const atom of data.atoms) {
          this.atoms.set(atom.atom_id, atom)
        }
      }
    } catch (err: unknown) {
      const error = err as NodeJS.ErrnoException
      if (error.code === 'ENOENT') {
        // 文件不存在，以空知识库启动
        await this.ensureDir()
        await this.flush()
        return
      }
      // JSON 解析失败，尝试从 .backup 恢复
      const backupPath = this.filePath + '.backup'
      try {
        const backupContent = await fs.readFile(backupPath, 'utf-8')
        const data: KnowledgeStoreFile = JSON.parse(backupContent)
        if (data.atoms && Array.isArray(data.atoms)) {
          for (const atom of data.atoms) {
            this.atoms.set(atom.atom_id, atom)
          }
        }
        console.warn(`[KnowledgeStore] 主文件损坏，已从备份恢复 ${this.atoms.size} 条知识原子`)
      } catch {
        // 备份也不可用，以空知识库启动
        console.error(`[KnowledgeStore] 主文件和备份均不可用，以空知识库启动`)
      }
    }
  }

  async getAtomById(atomId: string): Promise<KnowledgeAtom | null> {
    return this.atoms.get(atomId) ?? null
  }

  async getAtomsByDomain(domain: string, includeDeprecated = false): Promise<KnowledgeAtom[]> {
    const result: KnowledgeAtom[] = []
    for (const atom of this.atoms.values()) {
      if (atom.domain === domain && (includeDeprecated || !atom.deprecated)) {
        result.push(atom)
      }
    }
    return result
  }

  async getAllAtoms(includeDeprecated = false): Promise<KnowledgeAtom[]> {
    const result: KnowledgeAtom[] = []
    for (const atom of this.atoms.values()) {
      if (includeDeprecated || !atom.deprecated) {
        result.push(atom)
      }
    }
    return result
  }

  async createAtom(atom: KnowledgeAtom): Promise<void> {
    this.atoms.set(atom.atom_id, atom)
    await this.flush()
  }

  async updateAtom(atom: KnowledgeAtom): Promise<void> {
    this.atoms.set(atom.atom_id, atom)
    await this.flush()
  }

  async flush(): Promise<void> {
    await this.ensureDir()

    const allAtoms = Array.from(this.atoms.values())
    const domainCounts: Record<string, number> = {}
    for (const atom of allAtoms) {
      domainCounts[atom.domain] = (domainCounts[atom.domain] || 0) + 1
    }

    const data: KnowledgeStoreFile = {
      version: 1,
      updated_at: new Date().toISOString(),
      atoms: allAtoms,
      metadata: {
        total_count: allAtoms.length,
        domain_counts: domainCounts,
      },
    }

    // 先写备份，再写主文件
    const tempPath = this.filePath + '.tmp'
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8')

    // 如果主文件存在，先备份
    try {
      await fs.access(this.filePath)
      await fs.copyFile(this.filePath, this.filePath + '.backup')
    } catch {
      // 主文件不存在，无需备份
    }

    await fs.rename(tempPath, this.filePath)
  }

  private async ensureDir(): Promise<void> {
    const dir = path.dirname(this.filePath)
    await fs.mkdir(dir, { recursive: true })
  }
}
