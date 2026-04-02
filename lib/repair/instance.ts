import { RepairService } from './repair-service'
import { ActionExecutor } from './action-executor'

let instance: RepairService | null = null

export function getRepairService(): RepairService {
  if (instance) return instance
  instance = new RepairService(new ActionExecutor())
  return instance
}
