import { ClientRoutes } from '@/pages/routes'
import { computed, ref } from 'vue'
/**
 * 售后申请表单（原 refund-apply/index.js：goodsClick / numberChange / type / logisticsStatus / reason / 图片 / bindSave）
 */
import type { Ref } from 'vue'
import type { RefundableGoods } from '@/pages/account/profile/order'
import { useI18n } from 'vue-i18n'
import { requireIdentity, useSessionAccountScope } from '@/pages/auth/session'

import { orderApi, uploadOrderFile } from '@/pages/account/profile/order'
import { afterSaleTypes, clampRefundNumber, computeRefundAmount, supportsAfterSale } from '../domain/refund-apply.rules'
import { REFUND_APPLYING_CODE } from '../models/enums'
import { alert, back, chooseImage, hideLoading, previewImage, showLoading, toast } from '@/utils/project/interaction'

import type { RadioOption } from '../components/OptionRadioList/types'

/** 最多上传 9 张凭证 */
export const MAX_PROOF_PICS = 9

/**
 * 维护商品、数量、原因与凭证草稿；一次提交使用固定快照，上传失败保留表单。
 * @param orderId 所属订单编号。
 * @param goods 当前订单中可选择的商品列表。
 */
export function useOrderRefundApplyForm(orderId: Ref<string>, goods: Ref<RefundableGoods[]>) {
  const { t, tm, rt } = useI18n()

  const goodsIndex = ref<number | null>(null)

  const curGoods = ref<RefundableGoods | null>(null)

  const number = ref(1)
  /** 售后类型 0/1/2 */

  const type = ref('0')
  /** 货物状态 0 未收到 1 已收到 */

  const logisticsStatus = ref('0')

  const reason = ref('')

  const remark = ref('')
  /** 本地临时图片路径 */

  const picsList = ref<string[]>([])
  const submitting = ref(false)
  const scope = useSessionAccountScope(() => {
    hideLoading()
    curGoods.value = null
    goodsIndex.value = null
    picsList.value = []
    remark.value = ''
    submitting.value = false
  })

  const reasons = computed<string[]>(() => {
    const raw = tm('refund.reasons') as unknown

    if (!Array.isArray(raw)) {
      return []
    }

    return raw.map(r => (typeof r === 'string' ? r : rt(r as Parameters<typeof rt>[0])))
  })

  const reasonOptions = computed<RadioOption[]>(() => reasons.value.map(r => ({ label: r, value: r })))

  /** 当前商品支持的售后类型（原 wxml：curGoods['afterSale' + index]） */

  const typeOptions = computed<RadioOption[]>(() => {
    const supported = afterSaleTypes(curGoods.value)

    return [
      { label: t('refund.type0'), value: '0' },
      { label: t('refund.type1'), value: '1' },
      { label: t('refund.type2'), value: '2' },
    ].filter(o => supported.includes(o.value))
  })

  const logisticsStatusOptions = computed<RadioOption[]>(() => [
    { label: t('refund.logisticsStatus0'), value: '0' },
    { label: t('refund.logisticsStatus1'), value: '1' },
  ])

  /** onLoad：默认原因为第一项 */

  function initDefaults() {
    reason.value = reasons.value[0] || ''
  }

  function selectGoods(index: number) {
    const g = goods.value[index]

    if (submitting.value || !g || !supportsAfterSale(g)) {
      return
    }

    goodsIndex.value = index

    curGoods.value = g

    number.value = g.number
    type.value = afterSaleTypes(g)[0] || '0'
  }

  function setNumber(v: number | string) {
    number.value = clampRefundNumber(v, curGoods.value?.number || 1)
  }

  async function choosePics() {
    if (submitting.value)
      return
    const ticket = scope.ticket()
    const remain = MAX_PROOF_PICS - picsList.value.length

    if (remain <= 0) {
      return
    }

    try {
      const paths = await chooseImage(remain)

      if (!scope.current(ticket))
        return
      picsList.value = picsList.value.concat(paths).slice(0, MAX_PROOF_PICS)
    }
    catch {
      // 用户取消选择
    }
  }

  function removePic(index: number) {
    const next = picsList.value.slice()

    next.splice(index, 1)

    picsList.value = next
  }

  function previewPic(index: number) {
    previewImage(picsList.value, picsList.value[index])
  }

  /** 全部附件上传成功后才提交；失败保留表单供重试。 */

  async function uploadPics(ticket: number, paths: readonly string[]): Promise<string[]> {
    const urls: string[] = []

    for (const path of paths) {
      if (!scope.current(ticket))
        throw new Error('账户已切换')
      urls.push(await uploadOrderFile(path))
    }

    return urls
  }

  async function submit() {
    if (submitting.value || !requireIdentity('customer'))
      return
    const ticket = scope.ticket()
    const g = curGoods.value

    if (!g) {
      toast(t('refund.selectGoods'))

      return
    }

    if (!afterSaleTypes(g).includes(type.value))
      return toast('请选择商品支持的售后类型')
    if (!orderId.value || !reason.value.trim() || !Number.isInteger(number.value) || number.value < 1 || number.value > g.number)
      return toast(t('refund.selectGoods'))
    const amount = computeRefundAmount(g.amountSingle ?? g.amount / g.number, number.value, type.value)
    // 图片上传期间表单仍可能变化；金额、数量、类型和凭证必须来自同一次确认。
    const draft = {
      orderId: orderId.value,
      orderGoodsId: g.id,
      type: type.value,
      logisticsStatus: logisticsStatus.value,
      reason: reason.value,
      number: number.value,
      amount,
      remark: remark.value || '',
    }
    const paths = [...picsList.value]

    submitting.value = true
    showLoading()

    try {
      const pics = await uploadPics(ticket, paths)
      if (!scope.current(ticket))
        return

      await orderApi.refundApply({
        ...draft,
        pic: pics.join(),
      })
    }
    catch (e) {
      if (!scope.current(ticket))
        return
      hideLoading()

      if (e instanceof Error && e.message.includes(`[${REFUND_APPLYING_CODE}]`)) {
        await alert(t('refund.applyingTip'))

        return
      }

      await alert((e as Error)?.message || t('refund.submitFail'))

      return
    }

    finally {
      if (scope.current(ticket)) {
        submitting.value = false
        hideLoading()
      }
    }
    if (!scope.current(ticket))
      return
    await alert(t('refund.submitSuccess'))
    if (scope.current(ticket))
      back(ClientRoutes.Account.my)
  }

  return {
    submitting,
    goodsIndex,
    curGoods,
    number,
    type,
    logisticsStatus,
    reason,
    remark,
    picsList,
    reasonOptions,
    typeOptions,
    logisticsStatusOptions,
    initDefaults,
    selectGoods,
    setNumber,
    choosePics,
    removePic,
    previewPic,
    submit,
  }
}
