import { effectScope, nextTick, reactive, ref } from 'vue'
import { beforeEach, expect, it, vi } from 'vitest'
import type { CartItem } from '@/pages/ordering/menu-cart'
import { useOrderingCartBar } from '../composables/use-cart-bar'

const mocks = vi.hoisted(() => ({ ensureAvailable: vi.fn(), changeNumber: vi.fn(), clear: vi.fn(), confirm: vi.fn(), showError: vi.fn(), showLoading: vi.fn(), navigate: vi.fn() }))
const item = { key: 'one', number: 1 } as CartItem
const state = reactive({ info: { items: [item] }, items: [item], totalNumber: 1 })
vi.mock('@/pages/ordering/menu-cart', () => ({
  quickAddNumber: () => 1,
  useCartStore: () => ({
    get info() { return state.info },
    get items() { return state.items },
    get totalNumber() { return state.totalNumber },
    changeNumber: mocks.changeNumber,
    clear: mocks.clear,
  }),
}))
vi.mock('../composables/use-locale', () => ({ useOrderingLocale: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ confirm: mocks.confirm, showError: mocks.showError, showLoading: mocks.showLoading }))
vi.mock('@/utils/project/navigation', () => ({ navigate: mocks.navigate }))
vi.mock('@/pages/routes', () => ({ ClientRoutes: { Ordering: { pay: '/pay' } } }))
vi.mock('@/pages/ordering/index', () => ({ useShopCheckoutAvailability: () => ({ reason: ref(''), ensureAvailable: mocks.ensureAvailable }) }))

beforeEach(() => {
  vi.resetAllMocks()
  state.items = [item]
  state.info = { items: [item] }
  state.totalNumber = 1
})

function setup() {
  const scope = effectScope()
  const cart = scope.run(() => useOrderingCartBar({ isScanMode: () => false, onNeedLogin: vi.fn() }))!
  return { scope, cart }
}

it('门店停止营业只拦去结算，购物车数量仍可修改且不清空', async () => {
  mocks.ensureAvailable.mockRejectedValue(new Error('休息中，暂不可结算'))
  const { scope, cart } = setup()
  try {
    await cart.changeNumber(item, 2)
    expect(mocks.changeNumber).toHaveBeenCalled()
    await cart.goPay()
    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(mocks.clear).not.toHaveBeenCalled()
    expect(mocks.showError).toHaveBeenCalledWith(expect.objectContaining({ message: '休息中，暂不可结算' }))
    expect(cart.checkingOut.value).toBe(false)
  }
  finally { scope.stop() }
})

it('慢请求只锁定同条目，清空按钮保持可用，其他条目可修改', async () => {
  let finish!: () => void
  mocks.changeNumber.mockImplementation(() => new Promise<void>((resolve) => {
    finish = resolve
  }))
  const { scope, cart } = setup()
  try {
    const pending = cart.changeNumber(item, 2)
    await cart.changeNumber(item, 2)
    expect(cart.clearBlocked.value).toBe(false)
    expect(cart.clearing.value).toBe(false)
    expect(mocks.changeNumber).toHaveBeenCalledTimes(1)
    expect(mocks.confirm).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(cart.changingItems.value.one).toBe(true)
    finish()
    await pending
    mocks.changeNumber.mockResolvedValue(undefined)
    await cart.changeNumber({ ...item, key: 'two' }, 2)
    expect(mocks.changeNumber).toHaveBeenLastCalledWith('two', 2)
    expect(cart.changingItems.value).toEqual({})
    expect(mocks.showLoading).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})

it('取消清空不发请求；确认期间防重复', async () => {
  let answer!: (accepted: boolean) => void
  mocks.confirm.mockReturnValue(new Promise<boolean>((resolve) => {
    answer = resolve
  }))
  const { scope, cart } = setup()
  try {
    const pending = cart.clear()
    await cart.clear()
    await cart.changeNumber(item, 2)
    expect(mocks.confirm).toHaveBeenCalledTimes(1)
    expect(mocks.changeNumber).not.toHaveBeenCalled()
    answer(false)
    await pending
    expect(mocks.clear).not.toHaveBeenCalled()
    expect(cart.clearBlocked.value).toBe(false)
  }
  finally { scope.stop() }
})

it('清空期间锁定修改和结算，失败保留数据并恢复操作', async () => {
  let reject!: (reason: Error) => void
  mocks.confirm.mockResolvedValue(true)
  mocks.clear.mockReturnValue(new Promise<void>((_, fail) => {
    reject = fail
  }))
  const { scope, cart } = setup()
  try {
    const pending = cart.clear()
    await nextTick()
    expect(cart.clearing.value).toBe(true)
    await cart.changeNumber(item, 0)
    await cart.clear()
    cart.goPay()
    expect(mocks.changeNumber).not.toHaveBeenCalled()
    expect(mocks.clear).toHaveBeenCalledTimes(1)
    expect(mocks.navigate).not.toHaveBeenCalled()
    reject(new Error('network'))
    await pending
    expect(cart.items.value).toEqual([item])
    expect(cart.clearBlocked.value).toBe(false)
    expect(mocks.showError).toHaveBeenCalledTimes(1)
  }
  finally { scope.stop() }
})

it('减到零成功后收起弹层，空车禁止结算；修改失败解除行内加载', async () => {
  const { scope, cart } = setup()
  try {
    mocks.changeNumber.mockRejectedValueOnce(new Error('network'))
    await cart.changeNumber(item, 0)
    expect(cart.items.value).toEqual([item])
    expect(cart.changingItems.value).toEqual({})
    mocks.changeNumber.mockImplementation(async () => {
      state.items = []
      state.info = { items: [] }
      state.totalNumber = 0
    })
    cart.showPopup.value = true
    await cart.changeNumber(item, 0)
    await nextTick()
    expect(cart.showPopup.value).toBe(false)
    cart.goPay()
    expect(mocks.navigate).not.toHaveBeenCalled()
  }
  finally { scope.stop() }
})

it.each([true, false])('点击结算等待更新完成，失败不跳转：%s', async (success) => {
  let finish!: () => void
  mocks.changeNumber.mockReturnValue(new Promise<void>((resolve, reject) => {
    finish = () => success ? resolve() : reject(new Error('network'))
  }))
  const { scope, cart } = setup()
  try {
    const updating = cart.changeNumber(item, 2)
    expect(cart.checkingOut.value).toBe(false)
    const paying = cart.goPay()
    expect(cart.checkingOut.value).toBe(true)
    await cart.goPay()
    expect(mocks.navigate).not.toHaveBeenCalled()
    finish()
    await updating
    await paying
    expect(mocks.navigate).toHaveBeenCalledTimes(success ? 1 : 0)
    expect(cart.checkingOut.value).toBe(false)
  }
  finally {
    scope.stop()
  }
})

it.each([true, false])('数量更新期间可确认清空，等待请求结束再清空：%s', async (success) => {
  let finish!: () => void
  mocks.changeNumber.mockReturnValue(new Promise<void>((resolve, reject) => {
    finish = () => success ? resolve() : reject(new Error('network'))
  }))
  mocks.confirm.mockResolvedValue(true)
  mocks.clear.mockResolvedValue(undefined)
  const { scope, cart } = setup()
  try {
    const updating = cart.changeNumber(item, 2)
    expect(cart.clearBlocked.value).toBe(false)
    const clearing = cart.clear()
    await nextTick()
    expect(mocks.confirm).toHaveBeenCalledTimes(1)
    expect(cart.clearing.value).toBe(true)
    expect(mocks.clear).not.toHaveBeenCalled()
    await cart.clear()
    await cart.changeNumber(item, 3)
    await cart.goPay()
    expect(mocks.changeNumber).toHaveBeenCalledTimes(1)
    expect(mocks.navigate).not.toHaveBeenCalled()
    finish()
    await updating
    await clearing
    expect(mocks.clear).toHaveBeenCalledTimes(1)
    expect(cart.clearing.value).toBe(false)
    expect(cart.clearBlocked.value).toBe(false)
  }
  finally {
    scope.stop()
  }
})

it('等待数量更新时取消清空不影响正在进行的修改', async () => {
  let finish!: () => void
  mocks.changeNumber.mockReturnValue(new Promise<void>((resolve) => {
    finish = resolve
  }))
  mocks.confirm.mockResolvedValue(false)
  const { scope, cart } = setup()
  try {
    const updating = cart.changeNumber(item, 2)
    await cart.clear()
    expect(mocks.clear).not.toHaveBeenCalled()
    expect(cart.clearBlocked.value).toBe(false)
    expect(cart.changingItems.value.one).toBe(true)
    finish()
    await updating
  }
  finally {
    scope.stop()
  }
})
