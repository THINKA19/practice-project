import { PageState } from '@/components/page-state'
/**
 * 取餐（tab 页，View：只做装配与渲染）
 * 来源：bee-master/pages/order-details/doing
 */
import { toLoginPage } from '@/utils/toLoginPage'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { usePickupPage } from './use-page'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function usePickupView() {
  const { t } = useI18n()
  const vm = usePickupPage()
  const { apiOk, orderList, items, loading, failed, needsLogin } = vm
  const fulfillment = ref<'pickup' | 'delivery'>('pickup')
  const visibleItems = computed(() => items.value.filter(item => !!item.order.isNeedLogistics === (fulfillment.value === 'delivery')))
  onShow(() => {
    uni.setNavigationBarTitle({ title: t('tabbar.pickup') })
    vm.refresh()
  })
  return { PageState, toLoginPage, t, vm, apiOk, orderList, items, loading, failed, needsLogin, fulfillment, visibleItems }
}
