import type { KnowledgeAtom } from '../types'

export interface KnowledgeRepository {
  // 读操作
  getAtomById(atomId: string): Promise<KnowledgeAtom | null>
  getAtomsByDomain(domain: string, includeDeprecated?: boolean): Promise<KnowledgeAtom[]>
  getAllAtoms(includeDeprecated?: boolean): Promise<KnowledgeAtom[]>

  // 写操作
  createAtom(atom: KnowledgeAtom): Promise<void>
  updateAtom(atom: KnowledgeAtom): Promise<void>

  // 持久化
  flush(): Promise<void>
}
