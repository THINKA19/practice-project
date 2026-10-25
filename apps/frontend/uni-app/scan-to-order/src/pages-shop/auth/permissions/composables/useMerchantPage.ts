/**
 * 【文件概述】商家页面访问：身份、门店授权、具体权限逐层校验；离开页面即撤销。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
import { readonly, ref } from 'vue'
import { onHide, onShow, onUnload } from '@dcloudio/uni-app'
import { AUTH_ROUTES, useSession } from '@/pages/auth/session'
import { MERCHANT_PAGE_PERMISSIONS } from '../models/permissions'
import { useMerchantShopStore } from '../store'

export function useMerchantPage() {
  const session = useSession()

  const store = useMerchantShopStore()

  const granted = ref(false)

  let epoch = 0

  const leave = () => {
    epoch++
    granted.value = false
  }

  onShow(async () => {
    const started = ++epoch

    granted.value = false

    session.updateNowTime()

    if (!session.hasLogin || session.identity !== 'shop') {
      uni.redirectTo({ url: AUTH_ROUTES.shop })

      return
    }
    await store.refresh()

    if (started !== epoch || !store.current)
      return

    const path = `/${(getCurrentPages().at(-1)?.route ?? '').replace(/^\//, '')}`

    const permission = MERCHANT_PAGE_PERMISSIONS[path]

    if (permission && !store.can(permission)) {
      uni.showToast({ title: '没有此功能权限', icon: 'none' })

      return
    }
    granted.value = true
  })

  onHide(leave)

  onUnload(leave)

  return { granted: readonly(granted) }
}
