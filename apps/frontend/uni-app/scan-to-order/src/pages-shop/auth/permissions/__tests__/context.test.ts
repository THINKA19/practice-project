import { describe, expect, it, vi } from 'vitest'
import { useMerchantShopStore } from '../composables/use-shop-store'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { fetchMerchantGrant, fetchMerchantShops } from '../composables/use-grants'
import type { MerchantShop } from '../models/types'
import { formatSettlementPrice } from '@/utils/project/price'
import { merchantCurrency } from '../models/market'

vi.mock('../composables/use-grants', () => ({ fetchMerchantShops: vi.fn(), fetchMerchantGrant: vi.fn() }))

function shop(id: string): MerchantShop {
  return { id, merchantId: 'M1', name: id, roleTemplate: 'employee', soundNotify: true, permissions: ['order.read'], grantVersion: 1 }
}

it('按门店结算币种展示越南盾符号，保留其他币种和缺失金额的展示', () => {
  const vietnam: MerchantShop = { ...shop('A'), countryCode: 'VN' }
  expect(formatSettlementPrice(120000, merchantCurrency(vietnam))).toBe('120000\u00A0₫')
  expect(formatSettlementPrice('84.00', merchantCurrency({ ...vietnam, currencyCode: 'THB' }))).toBe('฿84.00')
  expect(formatSettlementPrice(20, merchantCurrency({ ...vietnam, currencyCode: 'CNY' }))).toBe('¥20')
  expect(formatSettlementPrice(20, merchantCurrency({ ...vietnam, currencyCode: 'LAK' }))).toBe('₭20')
  expect(formatSettlementPrice(20, merchantCurrency({ ...vietnam, currencyCode: 'IDR' }))).toBe('Rp20')
  expect(formatSettlementPrice(20, merchantCurrency({ ...vietnam, currencyCode: 'XYZ' }))).toBe('XYZ 20')
  expect(formatSettlementPrice('24,000', 'VND')).toBe('24,000\u00A0₫')
  expect(formatSettlementPrice(undefined, merchantCurrency(vietnam))).toBe('—')
})
function deferred<T>() {
  let resolve!: (value: T) => void

  const promise = new Promise<T>((done) => {
    resolve = done
  })

  return { promise, resolve }
}
function session(token = 'one') {
  const state = seedSession({}, 'shop')

  state.snapshot!.tokenInfo = { token, expiresIn: 3600 }
}
describe('当前门店上下文', () => {
  it('首次载入多家授权门店时默认进入第一家并显示工作台功能', async () => {
    session()
    const store = useMerchantShopStore()
    vi.mocked(fetchMerchantShops).mockResolvedValueOnce([shop('A'), shop('B')])

    expect(await store.refresh()).toBe(true)
    expect(store.current?.id).toBe('A')
    expect(store.can('order.read')).toBe(true)
  })

  it('切店请求乱序时只保留最后选择，失败不替换有效门店', async () => {
    session()

    const store = useMerchantShopStore()

    store.shops = [shop('A'), shop('B'), shop('C')]

    const a = deferred<MerchantShop>()

    const b = deferred<MerchantShop>()

    vi.mocked(fetchMerchantGrant).mockReturnValueOnce(a.promise).mockReturnValueOnce(b.promise)

    const first = store.switchShop('A')

    const second = store.switchShop('B')

    b.resolve(shop('B'))

    expect(await second).toBe(true)

    a.resolve(shop('A'))

    expect(await first).toBe(false)

    expect(store.current?.id).toBe('B')

    vi.mocked(fetchMerchantGrant).mockRejectedValueOnce(new Error('授权失败'))

    expect(await store.switchShop('C')).toBe(false)

    expect(store.current?.id).toBe('B')
  })

  it('换账号后废弃旧响应和旧请求上下文', async () => {
    session()

    const store = useMerchantShopStore()

    store.shops = [shop('A'), shop('B'), shop('C')]

    vi.mocked(fetchMerchantGrant).mockResolvedValueOnce(shop('A'))

    await store.switchShop('A')

    const context = store.capture('order.read')

    const pending = deferred<MerchantShop>()

    vi.mocked(fetchMerchantGrant).mockReturnValueOnce(pending.promise)

    const switching = store.switchShop('B')

    session('two')

    pending.resolve(shop('B'))

    expect(await switching).toBe(false)

    expect(store.current).toBeNull()

    expect(store.matches(context)).toBe(false)

    expect(() => store.capture('order.read')).toThrow()
  })

  it('并发权限刷新合并，服务端撤权立即废弃数据上下文', async () => {
    session()

    const store = useMerchantShopStore()

    store.shops = [shop('A'), shop('B'), shop('C')]

    vi.mocked(fetchMerchantShops).mockResolvedValueOnce([shop('A')])

    await Promise.all([store.refresh(), store.refresh()])

    expect(fetchMerchantShops).toHaveBeenCalledTimes(1)

    const context = store.capture('order.read')

    vi.mocked(fetchMerchantShops).mockResolvedValueOnce([{ ...shop('A'), permissions: [], grantVersion: 2 }])

    await store.refresh()

    expect(store.can('order.read')).toBe(false)

    expect(store.matches(context)).toBe(false)

    vi.mocked(fetchMerchantShops).mockResolvedValueOnce([])

    await store.refresh()

    expect(store.current).toBeNull()

    expect(store.error).toContain('尚未分配')
  })
})
