/**
 * ============================================================================
 * 门店订单详情编排
 * ============================================================================
 *
 * 【文件概述】
 * 校验详情归属，映射门店本地时间并组装本领域履约动作。
 *
 * 【方法与导出清单】
 * - useOrderDetail()：返回详情数据、展示标识和操作。
 *
 * 【综合使用示例】
 * ```typescript
 * import { useOrderDetail } from './composables/useOrderDetail'
 * const { detail, reference } = useOrderDetail()
 * ```
 * ============================================================================
 */
import { shopText as st } from '@/locale/shop-text'
import type { ShopOrderDetail } from '../models'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
import type { ShopOrder } from '../../list'
import { formatOrderTime, orderReference, orderStatusLabel, withoutOrderAmounts } from '../../list'
import { useOrderActions } from './useOrderActions'
import { merchantClock, useMerchantShopStore } from '@/pages-shop/auth/permissions'
// eslint-disable-next-line project-mock/boundaries -- 仅判断开发环境，业务 Mock 数据由接口适配接缝加载。
import { USE_MOCK } from '@/mock/config'
import { fetchShopOrder, printShopOrder } from '../api/orders'
import { showError, toast } from '@/utils/project/interaction'
import { ShopRoutes } from '@/pages-shop/routes'

const redirect = (url: string) => uni.redirectTo({ url })

/**
 * 加载当前门店的订单详情并提供经权限校验的操作。
 * @param 无参数。
 * @returns 详情状态、对单标识和页面操作。
 * @example useOrderDetail().loaded.value // => 订单请求成功前为 false
 */
export function useOrderDetail() {
  const id = ref('')
  const shopId = ref('')
  const context = useMerchantShopStore()
  const order = ref<ShopOrder>()
  const loading = ref(true)
  const error = ref('')
  let request = 0
  watch(() => context.revision, () => {
    request++
    order.value = undefined
    loading.value = false
    error.value = ''
  }, { flush: 'sync' })

  async function refreshDetail() {
    const started = ++request
    loading.value = true
    error.value = ''
    try {
      const captured = context.capture('order.read')
      const result = await fetchShopOrder(captured, id.value)
      if (started === request && context.matches(captured))
        order.value = context.can('order.amount.read') ? result : withoutOrderAmounts(result)
    }
    catch (reason) {
      if (started === request) {
        order.value = undefined
        error.value = reason instanceof Error ? reason.message : st('订单刷新失败')
      }
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }

  const actions = useOrderActions(value => order.value?.id === value ? order.value : undefined, refreshDetail)
  const reference = computed(() => order.value ? orderReference(order.value) : { label: '', value: '' })
  const displayTime = (value: string) => {
    const date = new Date(value)
    return Number.isFinite(date.getTime()) ? formatOrderTime(value, merchantClock(context.current)(date)) : ''
  }
  const detail = computed<ShopOrderDetail>(() => {
    const value = order.value
    return { orderNo: value?.id || '', status: value?.status || 1, statusText: value ? orderStatusLabel(value) : '订单未加载', createTime: displayTime(value?.createdAt || ''), payTime: '', payMethod: '', type: value?.type || '', tableNo: value?.tableNo || '', people: 0, customer: { name: value?.customer || '', phone: value?.phone || '' }, goods: (value?.goods || []).map(g => ({ ...g, attr: '', ...(g.price === undefined ? {} : { total: g.price * g.qty }) })), remark: value?.remark || '', ...(value?.amount === undefined ? {} : { total: value.amount }), address: value?.address || '', timeline: value?.timeline.map(entry => ({ ...entry, t: displayTime(entry.t) || (entry.done ? '' : '—') })) || [] }
  })
  onLoad((options: { id?: string, shopId?: string }) => {
    id.value = options.id || ''
    shopId.value = options.shopId || ''
  })
  onShow(async () => {
    await context.refresh()
    if (shopId.value && shopId.value !== context.current?.id) {
      redirect(ShopRoutes.Operations.orders)
      return
    }
    if (id.value)
      await refreshDetail()
    else
      loading.value = false
  })
  function resolveCustomerPhone() {
    if (import.meta.env.DEV && USE_MOCK)
      return toast(st('演示环境不拨打真实客户电话'))
    return order.value?.phone
  }
  /**
   * 提交当前详情单的打印任务。
   * @param 无参数。
   * @returns 任务提交结束后的 Promise。
   * @example await printTicket() // => 已受理时显示提示
   */
  async function printTicket() {
    const revision = context.revision
    try {
      const captured = context.capture('order.amount.read')
      await printShopOrder(captured, id.value)
      if (context.matches(captured))
        toast(import.meta.env.DEV && USE_MOCK ? st('打印任务已提交；开发环境仅模拟任务') : st('打印任务已提交'))
    }
    catch (error) {
      if (context.revision === revision)
        showError(error)
    }
  }

  return { detail, reference, context, pickupVerificationRequired: computed(() => order.value?.pickupVerificationRequired), loading: computed(() => context.loading || loading.value), loaded: computed(() => !!order.value), error, accept: () => actions.acceptOrder(id.value), finish: () => actions.finishOrder(id.value), deliver: () => actions.deliverOrder(id.value), resolveCustomerPhone, printTicket }
}
