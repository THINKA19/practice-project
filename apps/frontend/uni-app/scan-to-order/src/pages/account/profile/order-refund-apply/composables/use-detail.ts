import { ref } from 'vue'
/**
 * 售后详情弹窗（原 refundDetail / popClose / previewImageimageList / refundApplyCancel /
 * showLogisticsDialog / closeLogisticsDialog / submitLogistics / customerService）
 */
import type { RefundApplyRecord } from '@/pages/account/profile/order'
import type { RefundLogisticsContent } from '../models/types'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'

import { navigate } from '@/utils/project/navigation'
import { ClientRoutes } from '@/pages/routes'
import { orderApi } from '@/pages/account/profile/order'
import { parseRefundLogisticsContent } from '../models/mappers'
import { refundImageList } from '../domain/refund-apply.rules'
import { hideLoading, previewImage, showError, showLoading, toast } from '@/utils/project/interaction'

/**
 * 维护售后详情和寄回物流草稿；账号变化时清理私有资料，操作结果由服务端确认。
 * @param reload 撤回或保存物流成功后，刷新所属订单的动作。
 */
export function useOrderRefundApplyDetail(reload: () => void) {
  const { t } = useI18n()

  const popShow = ref(false)

  const curRefund = ref<RefundApplyRecord | null>(null)

  const imageList = ref<string[]>([])

  const logisticsContent = ref<RefundLogisticsContent | null>(null)

  const logisticsDialogShow = ref(false)

  const shipperName = ref('')

  const trackingNumber = ref('')
  const busy = ref(false)
  const scope = useSessionAccountScope(() => {
    hideLoading()
    curRefund.value = null
    imageList.value = []
    logisticsContent.value = null
    shipperName.value = ''
    trackingNumber.value = ''
    popShow.value = false
    logisticsDialogShow.value = false
    busy.value = false
  })

  /** QW：企业微信客服；其他走小程序 open-type="contact" */

  const customerServiceType = 'QW'

  function open(rec: RefundApplyRecord) {
    curRefund.value = rec

    imageList.value = refundImageList(rec)

    logisticsContent.value = parseRefundLogisticsContent(rec.baseInfo.logisticsContent)

    popShow.value = true
  }

  function close() {
    popShow.value = false
  }

  function preview(current: string) {
    previewImage(imageList.value, current)
  }

  /** 撤回申请 */

  async function cancelApply() {
    if (busy.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    const info = curRefund.value?.baseInfo

    if (!info) {
      return
    }

    busy.value = true
    showLoading()

    try {
      await orderApi.refundApplyCancel(info.orderId ?? '', info.orderGoodsId ?? '')

      if (!scope.current(ticket))
        return
      hideLoading()

      toast(t('refund.cancelSuccess'), 'success')

      close()

      reload()
    }
    catch (e) {
      if (!scope.current(ticket))
        return
      hideLoading()

      showError(e)
    }
    finally {
      if (scope.current(ticket)) {
        busy.value = false
        hideLoading()
      }
    }
  }

  function showLogisticsDialog() {
    shipperName.value = ''

    trackingNumber.value = ''

    logisticsDialogShow.value = true
  }

  function closeLogisticsDialog() {
    logisticsDialogShow.value = false
  }

  /** 提交寄回快递信息 */

  async function submitLogistics() {
    if (busy.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    const info = curRefund.value?.baseInfo

    const name = shipperName.value.trim()

    const no = trackingNumber.value.trim()

    if (!name) {
      toast(t('refund.logisticsCompanyPlaceholder'))

      return
    }

    if (!no) {
      toast(t('refund.logisticsNumberPlaceholder'))

      return
    }

    if (!info) {
      return
    }

    busy.value = true
    showLoading()

    try {
      await orderApi.refundApplySetBackLogistics({
        orderId: info.orderId,
        applyId: info.id,
        shipperName: name,
        trackingNumber: no,
      })

      if (!scope.current(ticket))
        return
      hideLoading()

      toast(t('refund.submitSuccess'), 'success')

      closeLogisticsDialog()

      reload()

      close()
    }
    catch (e) {
      if (!scope.current(ticket))
        return
      hideLoading()

      toast((e as Error)?.message || t('refund.submitFail'))
    }
    finally {
      if (scope.current(ticket)) {
        busy.value = false
        hideLoading()
      }
    }
  }

  /** 联系客服（企业微信客服） */

  function customerService() {
    if (customerServiceType !== 'QW') {
      return
    }

    void navigate(ClientRoutes.Account.contact)
  }

  return {
    popShow,
    curRefund,
    imageList,
    logisticsContent,
    logisticsDialogShow,
    shipperName,
    trackingNumber,
    customerServiceType,
    open,
    close,
    preview,
    cancelApply,
    showLogisticsDialog,
    closeLogisticsDialog,
    submitLogistics,
    customerService,
  }
}
