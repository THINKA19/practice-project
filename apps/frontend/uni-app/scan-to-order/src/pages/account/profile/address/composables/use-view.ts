import type { Address } from '../models/types'
/**
 * 收货地址管理：列表（点选设为默认并返回）、新增/编辑/删除、多国电话与文字地址
 */
import { DELIVERY_COUNTRIES } from '../models/enums'
import { useI18n } from 'vue-i18n'
import { useAddressPage } from './use-page'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useAddressView() {
  const { t } = useI18n()
  const vm = useAddressPage()
  function addressRegion(item: Address) {
    const country = DELIVERY_COUNTRIES.find(country => country.code === item.countryCode)?.name || item.provinceStr
    const region = item.regionText || [item.cityStr, item.areaStr].filter(Boolean).join(' · ')
    return [country, region].filter(Boolean).join(' · ')
  }
  const { addressList, loaded, addressEdit, addressData, failed, loading, editingLoading, saving } = vm
  onLoad((query) => {
    vm.init(query as {
      id?: string
      select?: string
    })
  })
  onShow(() => {
    vm.refresh()
  })
  return { t, vm, addressRegion, addressList, loaded, addressEdit, addressData, failed, loading, editingLoading, saving }
}
