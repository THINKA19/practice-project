import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useGroupBuyingDetailPage } from '../composables/use-page'

const api = vi.hoisted(() => ({ detail: vi.fn(), join: vi.fn() }))
vi.mock('../../group-buying', () => ({ groupBuyingApi: api }))
it('刷新进度时禁止参团，服务端确认后才更新人数，重复点击只写入一次', async () => {
  seedSession()
  const row = { id: 1, endsAt: Date.now() + 60000, people: 3, joined: 1, participating: false }
  api.detail.mockResolvedValue(row)
  const scope = effectScope()
  const vm = scope.run(useGroupBuyingDetailPage)!
  try {
    await vm.init('1')
    let resolve!: (data: typeof row) => void
    api.detail.mockReturnValue(new Promise((r) => {
      resolve = r
    }))
    const refresh = vm.refresh()
    expect(vm.canJoin.value).toBe(false)
    await vm.join()
    expect(api.join).not.toHaveBeenCalled()
    resolve(row)
    await refresh
    api.join.mockReturnValue(new Promise((r) => {
      resolve = r
    }))
    const join = vm.join()
    await vm.join()
    expect(api.join).toHaveBeenCalledOnce()
    expect(vm.item.value?.joined).toBe(1)
    resolve({ ...row, joined: 2, participating: true })
    await join
    expect(vm.item.value?.joined).toBe(2)
    expect(vm.canJoin.value).toBe(false)
  }
  finally { scope.stop() }
})
