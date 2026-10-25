/**
 * ============================================================================
 * 【文件概述】本文件负责 api/foo-alova/mock/data.ts 的局部职责；只在明确调用点接入。
 * 【方法与导出清单】createFoo。
 * 【综合使用示例】
 * import { createFoo } from './data'
 * ============================================================================
 */
import type { IFoo } from '../../foo-alova'

/**
 * 创建独立示例 DTO。
 * @param overrides 样本字段覆盖。
 * @returns 结果类型由签名及现有接口契约确定，不产生真实后端操作。
 * @example createFoo({ id: 2 }).id // 2
 */
export function createFoo(overrides: Partial<IFoo> = {}): IFoo {
  return { id: 1, name: 'Mock 示例', ...overrides }
}
