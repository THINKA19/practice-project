import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useCardPage } from '../composables/use-page'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const api = vi.hoisted(() => ({ list: vi.fn(), my: vi.fn() }))
vi.mock('../composables/use-requests', () => ({ cardApi: api }))
vi.mock('@/utils/project/interaction', () => ({ alert: vi.fn(), showError: vi.fn() }))
beforeEach(() => {
  seedSession()
  Object.assign(uni, { setNavigationBarTitle: vi.fn() })
  api.list.mockReset().mockResolvedValue([])
  api.my.mockReset().mockResolvedValue([])
})

it('直接进入我的只请求个人卡包，首次显示不重复请求', async () => {
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    const first = vm.init({ tab: 'my' })
    await vm.refresh()
    await first
    expect(api.list).not.toHaveBeenCalled()
    expect(api.my).toHaveBeenCalledOnce()
    expect(vm.active.value).toBe(1)
  }
  finally { scope.stop() }
})

it('切到我的后，迟到的目录响应不能覆盖我的错误状态', async () => {
  let finish!: (rows: unknown[]) => void
  api.list.mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  api.my.mockRejectedValueOnce(new Error('offline'))
  const scope = effectScope()
  const vm = scope.run(useCardPage)!
  try {
    const catalog = vm.init()
    await vm.tabChange(1)
    expect(vm.failed.value).toBe(true)
    finish([])
    await catalog
    expect(vm.failed.value).toBe(true)
    expect(vm.loading.value).toBe(false)
    await vm.tabChange(0)
    expect(vm.failed.value).toBe(false)
  }
  finally { scope.stop() }
})
