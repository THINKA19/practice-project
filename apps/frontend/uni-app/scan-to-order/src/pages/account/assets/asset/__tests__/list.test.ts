import { effectScope, reactive } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAssetList } from '../../asset/composables/use-list'
import { parseAssetPage } from '../../asset/models/mappers'
import { parseRechargeAmount, rechargeBonus } from '../../asset/domain/asset.rules'

const auth = vi.hoisted(() => ({ sessionRevision: 0, identity: null as string | null, updateNowTime: vi.fn() }))
vi.mock('@/pages/auth/session', () => ({ useSessionState: () => reactive(auth), requireIdentity: () => true }))
vi.mock('../../asset/composables/use-context', () => ({ isAssetDemo: () => true }))
beforeEach(() => {
  auth.sessionRevision = 0
})

it('金额精度、零值、赠送档位和无效响应校验', () => {
  for (const value of ['0', '-1', 'NaN', 'Infinity', '1.001', '1e2', '']) expect(parseRechargeAmount(value)).toBeNull()
  expect(parseRechargeAmount('12.50')).toBe(12.5)
  expect(parseAssetPage(null, 'amount').list).toEqual([])
  expect(() => parseAssetPage({}, 'amount')).toThrow()
  expect(rechargeBonus([{ id: 1, confine: 0, send: 1 }], 100)).toBe(0)
  expect(rechargeBonus([{ id: 1, confine: 50, send: 5, loop: true }], 110)).toBe(10)
})

it('分页防重复，下一页失败保留列表并允许重试', async () => {
  const fetch = vi.fn().mockResolvedValueOnce({ list: [{ id: 1 }], totalPage: 2 }).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ list: [{ id: 2 }], totalPage: 2 })
  const scope = effectScope()
  const vm = scope.run(() => useAssetList(fetch))!
  try {
    const first = vm.refresh()
    await vm.loadMore()
    await first
    expect(fetch).toHaveBeenCalledTimes(1)
    await vm.loadMore()
    expect(vm.failed.value).toBe(true)
    expect(vm.list.value).toEqual([{ id: 1 }])
    await vm.loadMore()
    expect(fetch).toHaveBeenLastCalledWith(2, 15)
    expect(vm.list.value).toEqual([{ id: 1 }, { id: 2 }])
    expect(vm.finished.value).toBe(true)
  }
  finally { scope.stop() }
})

it('换账户清空，丢弃旧响应，销毁后不写入', async () => {
  let resolve!: (data: { list: { id: number }[] }) => void
  const fetch = vi.fn().mockImplementation(() => new Promise((done) => {
    resolve = done
  }))
  const scope = effectScope()
  const vm = scope.run(() => useAssetList(fetch))!
  const old = vm.refresh()
  reactive(auth).sessionRevision++
  resolve({ list: [{ id: 1 }] })
  await old
  expect(vm.list.value).toEqual([])
  const current = vm.refresh()
  scope.stop()
  resolve({ list: [{ id: 2 }] })
  await current
  expect(vm.list.value).toEqual([])
})
