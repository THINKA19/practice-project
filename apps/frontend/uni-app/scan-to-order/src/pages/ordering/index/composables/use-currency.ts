import { computed } from 'vue'
import { orderingCurrency } from '../domain/currency.rules'
import { currentLocale } from '@/locale'
import { useShopStore } from '../store'

/** 接口约定：越南/老挝金额以万计，泰国以铢计；仅追加单位，不换算数字。 */
export function useOrderingCurrency() {
  const shop = useShopStore()
  const country = computed(() => shop.current?.countryCode?.trim().toUpperCase())
  const display = computed(() => orderingCurrency(country.value, currentLocale.value))
  const currencySymbol = computed(() => display.value.symbol)
  const currencyUnit = computed(() => display.value.unit)
  const currencyName = computed(() => display.value.name)
  /** 用于确认提示和海报等纯文本场景，保留输入数字的精度。 */
  function formatPrice(amount: number | string | undefined | null) {
    return [currencySymbol.value, amount ?? '', currencyUnit.value, currencyName.value ? ' ' : '', currencyName.value].join('')
  }
  return { currencySymbol, currencyUnit, currencyName, formatPrice }
}
