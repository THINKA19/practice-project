import { effectScope, ref } from 'vue'
import { expect, it, vi } from 'vitest'
import { useOrderRefundApplyForm } from '../composables/use-form'
import { seedSession } from '@/pages/auth/session/__tests__/fixtures'

const api = vi.hoisted(() => ({ upload: vi.fn(), submit: vi.fn().mockResolvedValue(null) }))
vi.mock('@/pages/account/profile/order', () => ({ orderApi: { refundApply: api.submit }, uploadOrderFile: api.upload }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key, tm: () => ['原原因'], rt: String }) }))
vi.mock('@/utils/project/interaction', () => ({ alert: vi.fn().mockResolvedValue(undefined), back: vi.fn(), chooseImage: vi.fn(), hideLoading: vi.fn(), previewImage: vi.fn(), showLoading: vi.fn(), toast: vi.fn() }))

it('退款数量、金额、原因和附件保持同一次提交的快照', async () => {
  seedSession()
  const scope = effectScope()
  const vm = scope.run(() => useOrderRefundApplyForm(ref('order-1'), ref([{ id: 1, goodsId: 10, goodsName: '商品', pic: '', number: 2, amount: 20, amountSingle: 10, afterSale: '0,1' }])))!
  try {
    vm.initDefaults()
    vm.selectGoods(0)
    vm.picsList.value = ['/first.jpg']
    let finish!: (value: string) => void
    api.upload.mockReturnValueOnce(new Promise((resolve) => {
      finish = resolve
    }))
    const pending = vm.submit()
    vm.setNumber(1)
    vm.type.value = '1'
    vm.reason.value = '新原因'
    vm.remark.value = '新留言'
    vm.picsList.value.push('/second.jpg')
    finish('https://files.test/first.jpg')
    await pending
    expect(api.upload).toHaveBeenCalledTimes(1)
    expect(api.submit).toHaveBeenCalledWith(expect.objectContaining({ orderId: 'order-1', orderGoodsId: 1, type: '0', number: 2, amount: 20, reason: '原原因', remark: '', pic: 'https://files.test/first.jpg' }))
  }
  finally { scope.stop() }
})
