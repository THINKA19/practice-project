/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / composables/use-view.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useShopView：本文件对外声明。
 * 【综合使用示例】
 * import { useShopView } from '@/pages/ordering/index/composables/use-view'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
import { ref } from 'vue'
import { useOrderingLocale as useI18n } from '@/pages/ordering/menu'

/**
 * 页面状态与交互编排；每次调用拥有独立的页面实例。
 * @returns 对象，包含 t、deliveryType。
 * @example
 * import { useShopView } from '@/pages/ordering/index/composables/use-view'
 * useShopView() // => 对象，包含 t、deliveryType
 */
export function useShopView() {
  const { t } = useI18n()

  const deliveryType = ref<'zq' | 'kd' | null>(null)

  onLoad((options) => {
    const value = options?.peisongType

    deliveryType.value = value === 'zq' || value === 'kd' ? value : null
  })

  return { t, deliveryType }
}
