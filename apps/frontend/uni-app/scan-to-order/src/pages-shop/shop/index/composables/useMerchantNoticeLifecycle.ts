import type { MerchantPageAccess } from '@/pages-shop/auth/permissions'
import { computed, watch } from 'vue'
import { useMerchantShopStore } from '@/pages-shop/auth/permissions'
import { useMerchantNoticeStore } from '../notice'

/** 页面通过访问校验且有订单查看权限时才在前台播报；离开页面即暂停。 */
export function useMerchantNoticeLifecycle(access: MerchantPageAccess) {
  const store = useMerchantShopStore()
  const notices = useMerchantNoticeStore()
  const active = computed(() => access.granted.value && store.can('order.read'))
  watch(active, (ok) => {
    if (ok)
      notices.resume()
    else
      notices.pause()
  }, { flush: 'sync' })
}
