import { getCurrentScope, onScopeDispose, ref, watch } from 'vue'
import { alert, isCancelled, makePhoneCall, showError } from '@/utils/project/interaction'

/** 管理单个电话入口的拨号、复制反馈和生命周期。 */
export function usePhoneContact(getPhone: () => string | undefined, getUnavailableMessage: () => string, copyOnDialFailure = () => false) {
  const phone = ref(getPhone()?.trim() || '')
  let disposed = false
  const visible = ref(false)
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
  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true
      close()
    })
  }
  watch(getPhone, (next) => {
    close()
    phone.value = next?.trim() || ''
  }, { flush: 'sync' })

  // 小程序保留系统拨号，其他端统一使用号码复制面板。
  let presentContact = () => {
    if (!copyOnDialFailure()) {
      makePhoneCall(phone.value)
      return
    }
    const ticket = revision
    const fallback = () => {
      if (ticket === revision)
        visible.value = true
    }
    try {
      uni.makePhoneCall({
        phoneNumber: phone.value,
        fail: (error) => {
          if (!isCancelled(error))
            fallback()
        },
      })
    }
    catch {
      fallback()
    }
  }
  // #ifndef MP
  presentContact = () => {
    visible.value = true
  }
  // #endif
  function open(resolvePhone?: () => string | undefined | void | Promise<string | undefined | void>) {
    if (disposed)
      return
    close()
    const ticket = revision
    function present(value: string | undefined | void) {
      if (ticket !== revision)
        return
      phone.value = value?.trim() || ''
      if (phone.value)
        presentContact()
      else if (!resolvePhone)
        void alert(getUnavailableMessage())
    }

    if (!resolvePhone)
      return present(getPhone())
    async function resolve(getNumber: NonNullable<typeof resolvePhone>) {
      try {
        present(await getNumber())
      }
      catch (error) {
        if (ticket === revision)
          showError(error)
      }
    }
    return resolve(resolvePhone)
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

  return { phone, visible, message, copying, successVisible, open, close, copy }
}
