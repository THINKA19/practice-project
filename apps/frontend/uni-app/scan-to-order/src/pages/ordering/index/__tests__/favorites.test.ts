/** 收藏读写、故障恢复和换账号迟到响应回归。 */
import { beforeEach, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { useShopFavorites } from '../favorites'

const m = vi.hoisted(() => ({ state: { sessionRevision: 1, hasLogin: true, identity: 'customer' }, load: vi.fn(), save: vi.fn(), guard: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(m.state), requireIdentity: m.guard }))
vi.mock('../api/shop.api', () => ({ shopApi: { favorites: m.load, setFavorite: m.save } }))
beforeEach(() => {
  m.state.sessionRevision = 1
  m.state.hasLogin = true
  m.state.identity = 'customer'
  m.load.mockReset().mockResolvedValue([1])
  m.save.mockReset()
  m.guard.mockReturnValue(true)
})

it('读写成功后共享收藏，失败保留原状态，重复点击只提交一次', async () => {
  const store = useShopFavorites()
  await store.load()
  expect(store.ids).toEqual([1])
  let done!: (ids: number[]) => void
  m.save.mockReturnValueOnce(new Promise<number[]>((resolve) => {
    done = resolve
  }))
  const first = store.toggle(2)
  await Promise.resolve()
  await store.toggle(2)
  expect(m.save).toHaveBeenCalledTimes(1)
  done([1, 2])
  await first
  expect(store.ids).toEqual([1, 2])
  m.save.mockRejectedValueOnce(new Error('offline'))
  await store.toggle(1)
  expect(store.ids).toEqual([1, 2])
  expect(uni.showToast).toHaveBeenCalledWith(expect.objectContaining({ title: '收藏操作失败，请重试' }))
})

it('换账号立即清空，旧账号的读取和写入不能污染新账号', async () => {
  const store = useShopFavorites()
  await store.load()
  let done!: (ids: number[]) => void
  m.save.mockReturnValueOnce(new Promise<number[]>((resolve) => {
    done = resolve
  }))
  const pending = store.toggle(2)
  await Promise.resolve()
  reactive(m.state).sessionRevision++
  expect(store.ids).toEqual([])
  done([1, 2])
  await pending
  expect(store.ids).toEqual([])
  m.load.mockReturnValueOnce(new Promise<number[]>((resolve) => {
    done = resolve
  }))
  const loading = store.load()
  reactive(m.state).sessionRevision++
  done([99])
  await loading
  expect(store.ids).toEqual([])
})

it('未登录不读取私人数据、不提交收藏，坏数据可重试恢复', async () => {
  const store = useShopFavorites()
  reactive(m.state).hasLogin = false
  m.guard.mockReturnValue(false)
  await store.load()
  await store.toggle(1)
  expect(m.load).not.toHaveBeenCalled()
  expect(m.save).not.toHaveBeenCalled()
  reactive(m.state).hasLogin = true
  m.load.mockResolvedValueOnce(['bad'])
  await store.load()
  expect(store.error).toContain('重试')
  expect(store.ready).toBe(false)
  await store.load()
  expect(store.ids).toEqual([1])
})
