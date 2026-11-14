import { computed } from 'vue'
import { formatOrderingPrice } from '@/utils/project/price'
import { currentLocale } from '@/locale'
import { useShopStore } from '../store'

/** 当前点餐门店的计价国家，并提供确认提示和海报使用的金额文本。 */
export function useOrderingCurrency() {
  const shop = useShopStore()
  const countryCode = computed(() => shop.current?.countryCode)

  function formatPrice(amount: number | string | undefined | null) {
    return formatOrderingPrice(countryCode.value, amount, currentLocale.value)
  }

  return { countryCode, formatPrice }
}
