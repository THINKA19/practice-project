import { ref } from 'vue'
/**
 * 售后申请 ViewModel（装配：订单商品与售后记录 + 申请表单 + 售后详情）
 * 来源：bee-master/pages/refund-apply/index.js
 */
import type { RefundableGoods, RefundApplyRecord } from '@/pages/account/profile/order'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'

import { attachRefundGoods, orderApi } from '@/pages/account/profile/order'
import { alert, hideLoading, setTitle, showLoading } from '@/utils/project/interaction'

import { useOrderRefundApplyDetail } from './use-detail'
import { useOrderRefundApplyForm } from './use-form'

/** 组装售后表单和详情；订单及历史记录一并读取成功才更新界面，旧请求和旧提示不能导航新会话。 */
export function useOrderRefundApplyPage() {
  const { t } = useI18n()

  const orderId = ref('')

  const goods = ref<RefundableGoods[]>([])

  const refundApplyList = ref<RefundApplyRecord[]>([])
  const loading = ref(false)
  const failed = ref(false)
  let generation = 0
  const scope = useSessionAccountScope(() => {
    generation++
    hideLoading()
    goods.value = []
    refundApplyList.value = []
    loading.value = false
  })

  const form = useOrderRefundApplyForm(orderId, goods)

  const detail = useOrderRefundApplyDetail(() => loadOrder())

  function init(query: { id?: string } = {}) {
    generation++
    orderId.value = query.id || ''
    goods.value = []
    refundApplyList.value = []
    failed.value = false

    form.initDefaults()

    setTitle(t('refund.title'))
  }

  /** 读取订单商品与已申请的售后记录 */

  async function loadOrder() {
    if (!requireIdentity('customer') || !orderId.value)
      return
    const ticket = scope.ticket()
    const request = ++generation
    const id = orderId.value
    const current = () => scope.current(ticket) && request === generation
    loading.value = true
    failed.value = false
    showLoading()

    try {
      const res = await orderApi.detail(id)
      if (!current())
        return
      const list = (res.goods || []) as RefundableGoods[]
      // 记录读取失败不能按“没有售后记录”渲染，否则会错误开放重复申请。
      const records = await orderApi.refundApplyDetail(id)
      if (!current())
        return
      goods.value = list
      refundApplyList.value = attachRefundGoods(records, list)
    }
    catch (e) {
      if (!current())
        return
      failed.value = true
      goods.value = []
      refundApplyList.value = []
      hideLoading()
      await alert(e instanceof Error ? e.message : '售后资料加载失败')
    }
    finally {
      if (current()) {
        loading.value = false
        hideLoading()
      }
    }
  }

  function openRefund(index: number) {
    const rec = refundApplyList.value[index]

    if (rec) {
      detail.open(rec)
    }
  }

  return { orderId, goods, refundApplyList, form, detail, loading, failed, init, loadOrder, openRefund }
}
