/**
 * ============================================================================
 * 【文件概述】门店选择与上下文 / composables/use-phone-contact.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - useShopPhoneContact：本文件对外声明。
 * 【综合使用示例】
 * import { useShopPhoneContact } from '@/pages/ordering/index/composables/use-phone-contact'
 * // 通过该公开声明接入本文件能力，入参与副作用见方法注释。
 * ============================================================================
 */
/** 门店联系电话交互：小程序直接拨号，其他端展示号码与复制入口。 */
import { computed, getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import { alert, makePhoneCall } from '@/utils/project/interaction'

/**
 * 创建 use-phone-contact 对应的领域状态与交互能力。
 * @param getPhone {() => string | undefined} 读取当前门店电话号码的函数。
 * @returns 对象，包含 phone、visible、message、copying、successVisible、copyFallbackAvailable、open、close、dial、copy、showCopyFallback。
 * @example
 * import { useShopPhoneContact } from '@/pages/ordering/index/composables/use-phone-contact'
 * declare const getPhone: Parameters<typeof useShopPhoneContact>[0]
 * useShopPhoneContact(getPhone) // => 对象，包含 phone、visible、message、copying、successVisible、copyFallbackAvailable、open、close、dial、copy、showCopyFallback
 */
export function useShopPhoneContact(getPhone: () => string | undefined) {
  const phone = computed(() => getPhone()?.trim() || '')
  const visible = ref(false)
  const copyFallbackAvailable = ref(false)
  const message = ref('')
  const copying = ref(false)
  const successVisible = ref(false)
  let revision = 0
  let closeTimer: ReturnType<typeof setTimeout> | undefined
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined

  function close() {
    clearTimeout(closeTimer)
    clearTimeout(feedbackTimer)
    feedbackTimer = undefined
    closeTimer = undefined
    revision++
    visible.value = false
    message.value = ''
    copying.value = false
    successVisible.value = false
  }
  if (getCurrentScope())
    onScopeDispose(close)
  watch(phone, () => {
    close()
    copyFallbackAvailable.value = false
  }, { flush: 'sync' })

  // 小程序保留系统拨号，其他端统一使用号码复制面板。
  let presentContact = () => makePhoneCall(phone.value)
  // #ifndef MP
  presentContact = () => {
    visible.value = true
  }
  // #endif
  function open() {
    close()
    if (!phone.value) {
      void alert('门店暂未提供联系电话')
      return
    }
    presentContact()
  }

  function dial() {
    if (!phone.value)
      return
    const ticket = revision
    const fallback = () => {
      if (ticket !== revision)
        return
      visible.value = true
      message.value = '未能打开拨号应用，请复制号码后拨打。'
    }
    try {
      uni.makePhoneCall({
        phoneNumber: phone.value,
        fail: fallback,
      })
    }
    catch {
      fallback()
    }
  }

  function showCopyFallback() {
    visible.value = true
    copy()
  }

  function copy() {
    if (!phone.value || copying.value || closeTimer !== undefined)
      return
    const ticket = revision
    copying.value = true
    const startedAt = Date.now()
    message.value = ''
    const finish = (text: string) => {
      if (ticket !== revision)
        return
      copying.value = false
      message.value = text
    }
    try {
      uni.setClipboardData({
        data: phone.value,
        showToast: false,
        success: () => {
          if (ticket !== revision)
            return
          // 给快速完成的剪贴板操作留出可见的处理中状态。
          feedbackTimer = setTimeout(() => {
            feedbackTimer = undefined
            if (ticket !== revision)
              return
            visible.value = false
            // 等待弹窗退场后再展示独立提示，避免被遮罩覆盖。
            closeTimer = setTimeout(() => {
              if (ticket !== revision)
                return
              close()
              successVisible.value = true
              closeTimer = setTimeout(() => {
                successVisible.value = false
                closeTimer = undefined
              }, 1500)
            }, 300)
          }, Math.max(0, 300 - (Date.now() - startedAt)))
        },
        fail: () => finish('复制失败，请长按或用鼠标选中上方号码，手动复制。'),
      })
    }
    catch {
      finish('复制失败，请长按或用鼠标选中上方号码，手动复制。')
    }
  }

  return { phone, visible, message, copying, successVisible, copyFallbackAvailable, open, close, dial, copy, showCopyFallback }
}
