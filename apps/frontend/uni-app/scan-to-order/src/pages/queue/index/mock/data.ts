/**
 * ============================================================================
 * 【文件概述】本文件负责 pages/queue/index/mock/data.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】createQueueTypes。
 * 【综合使用示例】
 * import { createQueueTypes } from '@/pages/queue/index/mock/data'
 * ============================================================================
 */
import type { QueueUpType } from '../models/queue'
/**
 * 创建独立的桌型初始样本。
 * 无参数。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createQueueTypes() // 返回独立桌型数组
 */
export function createQueueTypes(): QueueUpType[] {
  return [
    { id: 1, name: '1–2人桌', minPeople: 1, maxPeople: 2, curNumber: 8, numberGet: 10, numberWait: 2, minitus: 5, status: 0 },
    { id: 2, name: '3–4人桌', minPeople: 3, maxPeople: 4, curNumber: 3, numberGet: 4, numberWait: 1, minitus: 8, status: 0 },
    { id: 3, name: '5–6人桌', minPeople: 5, maxPeople: 6, curNumber: 0, numberGet: 0, numberWait: 0, minitus: 10, status: 0 },
    { id: 4, name: '7–10人桌', minPeople: 7, maxPeople: 10, curNumber: 0, numberGet: 0, numberWait: 0, minitus: 15, status: 1 },
  ]
}
