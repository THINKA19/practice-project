import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useShopSelectView() {
  const { t } = useI18n()
  const deliveryType = ref<'zq' | 'kd' | null>(null)
  onLoad((options) => {
    const value = options?.peisongType
    deliveryType.value = value === 'zq' || value === 'kd' ? value : null
  })
  return { t, deliveryType }
}
