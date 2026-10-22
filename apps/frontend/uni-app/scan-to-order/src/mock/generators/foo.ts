import type { IFoo } from '@/api/foo-alova'

/** 每次创建新对象，调用方修改数据不会污染下一次响应。 */
export function createFoo(overrides: Partial<IFoo> = {}): IFoo {
  return { id: 1, name: 'Mock 示例', ...overrides }
}
