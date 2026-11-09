import { onScopeDispose, ref, watch } from 'vue'
import { addressApi } from '@/pages/account/profile/address'
import { getSessionRevision, useSessionAccountScope } from '@/pages/auth/session'
import { internationalPhone, PHONE_COUNTRIES, phoneCountryOf } from '@/utils/project/phone'

/** 自取电话使用默认地址联系人；保留本次编辑，换账号或离页忽略迟到响应。 */
export function usePayPickupContact() {
  const mobile = ref('')
  const phoneCountry = ref('VN')
  const contactSource = ref('')
  const contactLoading = ref(false)
  const contactError = ref(false)
  let edited = false
  let filling = false
  let disposed = false
  let sequence = 0
  watch([mobile, phoneCountry], () => {
    if (!filling) {
      edited = true
      contactSource.value = ''
    }
  }, { flush: 'sync' })
  useSessionAccountScope(() => {
    sequence++
    filling = true
    mobile.value = ''
    phoneCountry.value = 'VN'
    filling = false
    edited = false
    contactSource.value = ''
    contactLoading.value = false
    contactError.value = false
  })
  onScopeDispose(() => {
    disposed = true
    sequence++
  })
  async function loadContact() {
    if (edited || disposed)
      return
    const seq = ++sequence
    const revision = getSessionRevision()
    const current = () => !disposed && seq === sequence && revision === getSessionRevision()
    contactLoading.value = true
    contactError.value = false
    try {
      const rows = await addressApi.list({ pageSize: 100 })
      if (!current() || edited)
        return
      const address = rows.find(item => item.isDefault) || (rows.length === 1 ? rows[0] : undefined)
      const country = address?.phoneCountry || phoneCountryOf(address?.mobile || '')
      const phone = address?.mobile && internationalPhone(address.mobile, country)
      filling = true
      const dial = PHONE_COUNTRIES.find(item => item.code === country)?.dial
      mobile.value = phone && dial ? phone.slice(dial.length + 1) : ''
      phoneCountry.value = phone ? country : 'VN'
      filling = false
      contactSource.value = phone ? (address?.isDefault ? '来自默认地址' : '来自已保存地址') : ''
    }
    catch {
      if (current())
        contactError.value = true
    }
    finally {
      if (current())
        contactLoading.value = false
    }
  }
  return { mobile, phoneCountry, contactSource, contactLoading, contactError, loadContact }
}
