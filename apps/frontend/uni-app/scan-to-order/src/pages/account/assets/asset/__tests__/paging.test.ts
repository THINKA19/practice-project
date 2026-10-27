import { effectScope, nextTick, reactive, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAssetList } from '../../asset/composables/use-list'
import { usePagingView } from '@/hooks/project/usePagingView'

const auth = vi.hoisted(() => ({ sessionRevision: 0, identity: null, updateNowTime: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(auth), requireIdentity: () => true }))
vi.mock('../../asset/composables/use-context', () => ({ isAssetDemo: () => true }))
beforeEach(() => {
  auth.sessionRevision = 0
})

it('同一轮连续重载仅执行最后一次，避免快速切换标签重复请求', async () => {
  const scope = effectScope()
  const source = { scopeKey: () => reactive(auth).sessionRevision, refresh: vi.fn(), loadMore: vi.fn(), finished: ref(false), failed: ref(false) }
  const bridge = scope.run(() => usePagingView(source, () => []))!
  const reload = vi.fn()
  bridge.paging.value = { reload, completeByNoMore: vi.fn().mockResolvedValue(null) }
  try {
    await Promise.all([bridge.reload(), bridge.reload(), bridge.reload()])
    expect(reload).toHaveBeenCalledOnce()
  }
  finally { scope.stop() }
})

it('连续加载每页十五条，失败重试原页，最后不足十五条正确结束', async () => {
  const fetch = vi.fn().mockImplementation(async (page: number, pageSize: number) => ({
    list: Array.from({ length: page === 3 ? 2 : pageSize }, (_, i) => ({ id: (page - 1) * pageSize + i })),
    totalRow: 32,
  }))
  const scope = effectScope()
  const vm = scope.run(() => useAssetList(fetch))!
  const bridge = scope.run(() => usePagingView(vm, () => vm.list.value))!
  const complete = vi.fn().mockResolvedValue(null)
  bridge.paging.value = { reload: vi.fn(), completeByNoMore: complete }
  try {
    await bridge.query(1)
    expect(complete.mock.calls[0][0]).toHaveLength(15)
    fetch.mockRejectedValueOnce(new Error('offline'))
    await bridge.query(2)
    expect(complete).toHaveBeenLastCalledWith([], false, false)
    expect(vm.list.value).toHaveLength(15)
    await bridge.query(2)
    expect(complete.mock.calls[2][0]).toHaveLength(15)
    await bridge.query(3)
    expect(vm.list.value).toHaveLength(32)
    expect(complete.mock.calls[3][0]).toHaveLength(2)
    expect(complete.mock.calls[3][1]).toBe(true)
    expect(fetch.mock.calls.map(args => args.slice(0, 2))).toEqual([[1, 15], [2, 15], [2, 15], [3, 15]])
  }
  finally { scope.stop() }
})

it('重置和账号切换后旧查询不能完成新列表的加载状态', async () => {
  const scope = effectScope()
  const rows = ref<unknown[]>([])
  let resolve!: () => void
  const source = { scopeKey: () => reactive(auth).sessionRevision, refresh: () => new Promise<void>((done) => {
    resolve = done
  }), loadMore: vi.fn(), finished: ref(false), failed: ref(false) }
  const bridge = scope.run(() => usePagingView(source, () => rows.value))!
  const reload = vi.fn()
  const complete = vi.fn().mockResolvedValue(null)
  bridge.paging.value = { reload, completeByNoMore: complete }
  try {
    const old = bridge.query(1)
    reactive(auth).sessionRevision++
    await nextTick()
    await nextTick()
    expect(reload).toHaveBeenCalledOnce()
    resolve()
    await old
    expect(complete).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})
