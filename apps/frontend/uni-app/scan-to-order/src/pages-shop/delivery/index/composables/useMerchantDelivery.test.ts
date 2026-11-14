import type { MerchantDeliverySnapshot } from '../models'
import { expect, it, vi } from 'vitest'
import { effectScope, reactive, ref } from 'vue'
import { useMerchantDelivery } from './useMerchantDelivery'

const { useMerchantShopStore, list } = vi.hoisted(() => ({
  useMerchantShopStore: vi.fn(),
  list: vi.fn(),
}))

vi.mock('@/pages-shop/auth/permissions', () => ({ useMerchantShopStore }))
vi.mock('../api/delivery', () => ({ deliveryApi: { list } }))
vi.mock('@/locale', () => ({ t: (key: string) => key }))

it('loads only after page access and ignores a response received after leaving', async () => {
  const granted = ref(false)
  const scope = effectScope()
  useMerchantShopStore.mockReturnValue({ revision: 0, capture: vi.fn(), matches: () => true })
  const pending = Promise.resolve<MerchantDeliverySnapshot>({
    riders: [],
    tasks: [],
    contacts: [{ id: 'rider', name: '陈小林', phone: ' 123 ' }],
  })
  list.mockReturnValue(pending)

  try {
    const delivery = scope.run(() => useMerchantDelivery({ granted }))!
    await delivery.refresh()
    expect(list).not.toHaveBeenCalled()

    granted.value = true
    expect(list).toHaveBeenCalledTimes(1)
    granted.value = false
    await pending
    expect(delivery.cards.value).toEqual([])
    expect(delivery.loading.value).toBe(false)

    granted.value = true
    await pending
    expect(delivery.cards.value).toMatchObject([{ id: 'rider', phone: '123' }])
  }
  finally {
    scope.stop()
  }
})

it('invalidates the callable contact and changes its component key on store switch', async () => {
  const scope = effectScope()
  const context = reactive({ revision: 0, capture: vi.fn(), matches: () => true, can: () => true })
  useMerchantShopStore.mockReturnValue(context)
  list.mockReset()
  list.mockResolvedValue({ contacts: [{ id: 'rider', name: '陈小林', phone: '123' }] })

  try {
    const delivery = scope.run(() => useMerchantDelivery({ granted: ref(true) }))!
    await Promise.resolve()
    expect(delivery.contactPhone('rider')).toBe('123')
    expect(delivery.contactRevision.value).toBe(0)

    context.revision++
    expect(delivery.contactPhone('rider')).toBeUndefined()
    expect(delivery.contactRevision.value).toBe(1)
    list.mockResolvedValue({ contacts: [{ id: 'rider', name: '李小林', phone: '456' }] })
    await delivery.refresh()
    expect(delivery.contactPhone('rider')).toBe('456')
    expect(delivery.cards.value).toMatchObject([{ id: 'rider', phone: '456' }])
  }
  finally {
    scope.stop()
  }
})
