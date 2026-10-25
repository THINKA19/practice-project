import { effectScope, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAssets } from '../composables/useAssets'
import { parseAssets } from '../models/assets'

const api = vi.hoisted(() => ({ available: true, summary: vi.fn() }))
vi.mock('../api/assets', () => ({ assetsApi: api }))
const sample = { couponCount: 3, balanceCents: 12850, points: 260, demo: true as const }
beforeEach(() => {
  api.available = true
  api.summary.mockReset()
})

it('校验数字，保留真实零值，拒绝缺失、负值和错误金额', () => {
  expect(parseAssets({ couponCount: 0, balanceCents: 0, points: 0, demo: true }).points).toBe(0)
  for (const value of [null, {}, { ...sample, points: -1 }, { ...sample, balanceCents: 1.5 }, { ...sample, couponCount: '3' }])
    expect(() => parseAssets(value)).toThrow()
})

it('请求合并、金额格式、失败重试与真实零值', async () => {
  api.summary.mockResolvedValueOnce(sample).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ ...sample, couponCount: 0, balanceCents: 0, points: 0 })
  const key = ref<string | null>('7:1')
  const scope = effectScope()
  const vm = scope.run(() => useAssets(key))!
  try {
    expect(vm.status.value).toBe('loading')
    await vm.refresh()
    expect(api.summary).toHaveBeenCalledTimes(1)
    expect(vm.balance.value).toBe('128.50')
    expect(vm.couponCount.value).toBe(3)
    await vm.refresh()
    expect(vm.status.value).toBe('error')
    expect(vm.balance.value).toBe('128.50')
    await vm.refresh()
    expect(vm.balance.value).toBe('0.00')
    expect(vm.score.value).toBe(0)
  }
  finally { scope.stop() }
})

it('账户变化与销毁后丢弃迟到响应', async () => {
  let resolveOld!: (value: typeof sample) => void
  let resolveNew!: (value: typeof sample) => void
  api.summary.mockImplementationOnce(() => new Promise((resolve) => {
    resolveOld = resolve
  }))
    .mockImplementationOnce(() => new Promise((resolve) => { resolveNew = resolve }))
  const key = ref<string | null>('7:1')
  const scope = effectScope()
  const vm = scope.run(() => useAssets(key))!
  const old = vm.refresh()
  key.value = '8:2'
  const next = vm.refresh()
  resolveOld(sample)
  await old
  expect(vm.couponCount.value).toBeNull()
  expect(vm.status.value).toBe('loading')
  key.value = null
  resolveNew(sample)
  await next
  expect(vm.balance.value).toBeNull()
  expect(vm.status.value).toBe('idle')
  scope.stop()
})

it('关闭开发接口时不发送请求', async () => {
  api.available = false
  const scope = effectScope()
  const vm = scope.run(() => useAssets(ref('7:1')))!
  await vm.refresh()
  expect(vm.status.value).toBe('unavailable')
  expect(api.summary).not.toHaveBeenCalled()
  scope.stop()
})
it('页面销毁后不提交迟到资产响应', async () => {
  let resolveRequest!: (value: typeof sample) => void
  api.summary.mockImplementationOnce(() => new Promise((resolve) => {
    resolveRequest = resolve
  }))
  const scope = effectScope()
  const vm = scope.run(() => useAssets(ref('7:1')))!
  const pending = vm.refresh()
  scope.stop()
  resolveRequest(sample)
  await pending
  expect(vm.balance.value).toBeNull()
  expect(vm.couponCount.value).toBeNull()
})
