import type { MerchantPageAccess } from '@/pages-shop/auth/permissions'
import type { DeliveryContact } from '../models'
import { computed, onScopeDispose, ref, watch } from 'vue'
import { t } from '@/locale'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { toast } from '@/utils/project/interaction'
import { deliveryApi } from '../api/delivery'

/** 在骑手管理页面获准访问后加载当前门店联系人，并管理号码访问与快捷复制反馈。 */
export function useMerchantDelivery(access: MerchantPageAccess) {
  const context = useMerchantShopStore()
  const contacts = ref<DeliveryContact[]>([])
  const loading = ref(false)
  const error = ref('')
  const failedAvatars = ref(new Set<string>())
  const copied = ref(false)
  let copyTimer: ReturnType<typeof setTimeout> | undefined
  let copyAttempt = 0
  let request = 0

  function clearCopyFeedback() {
    copyAttempt++
    clearTimeout(copyTimer)
    copied.value = false
  }
  function reset() {
    request++
    clearCopyFeedback()
    contacts.value = []
    failedAvatars.value.clear()
    loading.value = false
    error.value = ''
  }

  onScopeDispose(reset)
  watch(() => context.revision, reset, { flush: 'sync' })
  watch(access.granted, (granted) => {
    if (granted)
      void refresh()
    else
      reset()
  }, { flush: 'sync', immediate: true })

  async function refresh() {
    if (!access.granted.value)
      return

    reset()
    const started = request
    loading.value = true
    try {
      const captured = context.capture('delivery.read')
      const result = await deliveryApi.list(captured)
      if (started === request && context.matches(captured)) {
        contacts.value = (result.contacts ?? [])
          .filter(contact => contact.phone?.trim())
          .map(contact => ({ ...contact, phone: contact.phone.trim() }))
      }
    }
    catch (reason) {
      if (started === request)
        error.value = reason instanceof Error ? reason.message : '配送联系人加载失败'
    }
    finally {
      if (started === request)
        loading.value = false
    }
  }

  function contactPhone(id: string) {
    if (access.granted.value && context.can('delivery.read'))
      return contacts.value.find(entry => entry.id === id)?.phone
  }

  function copyPhone(id: string) {
    const phone = contactPhone(id)
    if (!phone)
      return
    clearCopyFeedback()
    const attempt = copyAttempt
    const fail = () => {
      if (attempt === copyAttempt)
        toast(t('rider.profile.copyFailed'))
    }
    try {
      uni.setClipboardData({
        data: phone,
        showToast: false,
        success: () => {
          if (attempt !== copyAttempt)
            return
          copied.value = true
          copyTimer = setTimeout(clearCopyFeedback, 1800)
        },
        fail,
      })
    }
    catch {
      fail()
    }
  }

  const cards = computed(() => contacts.value.map(contact => ({
    ...contact,
    avatarUrl: failedAvatars.value.has(contact.id) ? undefined : contact.avatarUrl?.trim(),
    initial: Array.from(contact.name.trim())[0] || '配',
  })))

  return {
    cards,
    loading,
    error,
    refresh,
    copied,
    contactPhone,
    contactRevision: computed(() => context.revision),
    copyPhone,
    hideAvatar: (id: string) => failedAvatars.value.add(id),
  }
}
