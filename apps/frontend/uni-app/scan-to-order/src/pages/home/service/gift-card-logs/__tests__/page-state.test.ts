/**
 * ============================================================================
 * 【文件概述】礼品卡logs流程回归；验证异步状态隔离、失败恢复和参数边界。
 * 【方法与导出清单】无生产导出；Vitest 用例使用公开页面控制器验证行为。
 * 【综合使用示例】
 * import { effectScope } from 'vue'
 * import { useCardLogsPage } from '../composables/use-page'
 * const scope = effectScope()
 * const page = scope.run(useCardLogsPage) // => 创建隔离的页面状态；外部接口由用例替身提供
 * scope.stop() // => 释放会话监听
 * ============================================================================
 */
import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCardLogsPage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const api = vi.hoisted(() => ({ my: vi.fn(), logs: vi.fn() }))
vi.mock('../../gift-card', () => ({ cardApi: api }))
vi.mock('../api/logs.api', () => ({ cardLogsApi: api }))

beforeEach(() => {
  seedSession()
  api.my.mockReset().mockResolvedValue([{ id: 7, amount: 50, type: 1 }])
  api.logs.mockReset().mockResolvedValue({ result: [], totalPage: 1 })
})

it('流水失败仍展示卡片资料，重试后恢复记录', async () => {
  const scope = effectScope()
  const vm = scope.run(useCardLogsPage)!
  try {
    api.logs.mockRejectedValueOnce(new Error('offline'))
    await vm.init({ cardId: '7' })
    expect(vm.card.value?.amount).toBe(50)
    expect(vm.failed.value).toBe(true)
    await vm.retry()
    expect(vm.failed.value).toBe(false)
    expect(vm.loaded.value).toBe(true)
  }
  finally { scope.stop() }
})

it('非本人卡片不加载流水，无效参数不请求', async () => {
  const scope = effectScope()
  const vm = scope.run(useCardLogsPage)!
  try {
    await vm.init({ cardId: '-1' })
    expect(api.my).not.toHaveBeenCalled()
    await vm.init({ cardId: '8' })
    expect(vm.failed.value).toBe(true)
    expect(api.logs).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})

it('分页失败重试同一页，刷新清除旧卡片和流水', async () => {
  const scope = effectScope()
  const vm = scope.run(useCardLogsPage)!
  try {
    api.logs.mockResolvedValueOnce({ result: [{ id: 1, amount: 10, dateAdd: '' }], totalPage: 2 })
    await vm.init({ cardId: '7' })
    api.logs.mockRejectedValueOnce(new Error('offline'))
    await vm.loadMore()
    expect(vm.list.value).toHaveLength(1)
    api.logs.mockResolvedValueOnce({ result: [{ id: 2, amount: 10, dateAdd: '' }], totalPage: 2 })
    await vm.retry()
    expect(api.logs).toHaveBeenLastCalledWith({ cardId: '7', page: 2, pageSize: 20 })
    expect(vm.list.value.map(row => row.id)).toEqual([1, 2])
    expect(vm.hasMore.value).toBe(false)
    api.my.mockResolvedValueOnce([])
    await vm.refresh()
    expect(vm.card.value).toBeUndefined()
    expect(vm.list.value).toEqual([])
  }
  finally { scope.stop() }
})

it('非法卡号清除旧资料并作废进行中的查询', async () => {
  const scope = effectScope()
  const vm = scope.run(useCardLogsPage)!
  try {
    await vm.init({ cardId: '7' })
    let finish!: (value: { id: number }[]) => void
    api.my.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const pending = vm.refresh()
    await vm.init({ cardId: 'invalid' })
    finish([{ id: 7 }])
    await pending
    expect(vm.invalidCard.value).toBe(true)
    expect(vm.card.value).toBeUndefined()
    expect(vm.list.value).toEqual([])
    expect(vm.loading.value).toBe(false)
    expect(api.logs).toHaveBeenCalledTimes(1)
  }
  finally { scope.stop() }
})
