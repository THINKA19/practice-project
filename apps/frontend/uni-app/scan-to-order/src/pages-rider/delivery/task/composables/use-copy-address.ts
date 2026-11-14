import { onHide } from '@dcloudio/uni-app'
import { useToast } from '@wot-ui/ui/components/wd-toast'
import { onScopeDispose } from 'vue'
import { t } from '@/locale'

/** Copies the active stop address and shows page-local feedback. */
export function useRiderCopyAddress(selector: string) {
  const toast = useToast(selector)
  let request = 0

  function clear() {
    request++
    toast.close()
  }

  onHide(clear)
  onScopeDispose(clear)

  return function copyAddress(address: string) {
    const data = address.trim()
    if (!data)
      return

    const current = ++request
    uni.setClipboardData({
      data,
      showToast: false,
      success: () => {
        if (current !== request)
          return
        // #ifdef MP
        uni.hideToast()
        // #endif
        toast.show({ msg: t('rider.task.copyAddressSuccess'), position: 'bottom', duration: 2000 })
      },
      fail: () => {
        if (current === request)
          toast.show({ msg: t('rider.task.copyAddressFailed'), position: 'bottom', duration: 2000 })
      },
    })
  }
}
