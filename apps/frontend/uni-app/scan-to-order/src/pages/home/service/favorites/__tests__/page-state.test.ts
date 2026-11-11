import { effectScope } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { useFavoritesPage } from '../composables/use-page'

const api = vi.hoisted(() => ({ list: vi.fn(), remove: vi.fn() }))
vi.mock('../api/favorites.api', () => ({ favoritesApi: api }))
beforeEach(() => {
  seedSession()
  api.remove.mockReset().mockResolvedValue(null)
  api.list.mockReset().mockResolvedValue({ list: [], total: 0 })
})
it('回调式确认框取消不会写入，确认后立即移除，刷新失败也不恢复已删除项目', async () => {
  const scope = effectScope()
  const vm = scope.run(useFavoritesPage)!
  const row = { id: 1, goodsId: 1, goodsName: '茶', price: 12, picUrl: '', collectTime: '' }
  try {
    vm.items.value = [row]
    vm.total.value = 1
    uni.showModal = vi.fn((options) => {
      options!.success!({ confirm: false, cancel: true, errMsg: '' })
    }) as typeof uni.showModal
    await vm.remove(row)
    expect(api.remove).not.toHaveBeenCalled()
    expect(vm.removing.value).toBeNull()
    uni.showModal = vi.fn((options) => {
      options!.success!({ confirm: true, cancel: false, errMsg: '' })
    }) as typeof uni.showModal
    api.list.mockRejectedValueOnce(new Error('offline'))
    await vm.remove(row)
    expect(api.remove).toHaveBeenCalledWith(1)
    expect(vm.items.value).toEqual([])
    expect(vm.total.value).toBe(0)
    expect(vm.failed.value).toBe(true)
  }
  finally { scope.stop() }
})
