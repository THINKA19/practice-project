import { effectScope } from 'vue'
import { expect, it, vi } from 'vitest'
import { useOrderRefundApplyDetail } from '../composables/use-detail'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'
import { clearSession } from '@/pages/auth/session'

vi.mock('@/pages/account/profile/order', () => ({ orderApi: {} }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/utils/project/interaction', () => ({ hideLoading: vi.fn(), previewImage: vi.fn(), showError: vi.fn(), showLoading: vi.fn(), toast: vi.fn() }))

it('换号后清理售后图片和寄回物流草稿', () => {
  seedSession()
  const scope = effectScope()
  const vm = scope.run(() => useOrderRefundApplyDetail(() => {}))!
  try {
    vm.imageList.value = ['https://files.test/private.jpg']
    vm.logisticsContent.value = { trackingNumber: 'old-tracking' }
    vm.shipperName.value = 'old-shipper'
    vm.trackingNumber.value = 'old-tracking'
    clearSession()
    expect(vm.imageList.value).toEqual([])
    expect(vm.logisticsContent.value).toBeNull()
    expect(vm.shipperName.value).toBe('')
    expect(vm.trackingNumber.value).toBe('')
  }
  finally { scope.stop() }
})
