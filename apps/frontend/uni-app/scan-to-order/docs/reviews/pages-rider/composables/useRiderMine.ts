import type { RiderSettingItem } from '../type'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { RIDER_MAX_CONCURRENT } from '@/constants/rider'
import { useRiderOrderPoolStore } from '@/store/riderOrderPool'
import { useRiderSessionStore } from '@/store/riderSession'
import { RIDER_ORDER_LIST_URL, RIDER_WORKBENCH_URL } from '../routes'
import { useRiderAuth } from './useRiderAuth'

/**
 * 骑手「我的」：资料 / 产出统计 / 设置项 / 退出登录
 */
export function useRiderMine() {
  // 经 storeToRefs 解构，保持与页面之间的响应式链路
  const { profile } = storeToRefs(useRiderSessionStore())
  const { stats, level, online } = storeToRefs(useRiderOrderPoolStore())
  const { restoreProfile, ensureLogin, logout } = useRiderAuth()

  const go = (url: string) => uni.navigateTo({ url })

  const settingMenus: RiderSettingItem[] = [
    { name: '我的配送订单', icon: 'i-carbon-document', color: '#2196F3', action: () => go(RIDER_ORDER_LIST_URL) },
    { name: '接单上限设置', icon: 'i-carbon-settings-adjust', color: '#FF9800', action: () => uni.showToast({ title: `同时最多配送 ${RIDER_MAX_CONCURRENT} 单`, icon: 'none' }) },
    { name: '新单语音提醒', icon: 'i-carbon-notification', color: '#9C27B0', action: () => uni.showToast({ title: '已开启新单语音提醒（mock）', icon: 'none' }) },
    { name: '联系站长', icon: 'i-carbon-headset', color: '#009688', action: () => uni.showToast({ title: '站长电话：13800000000', icon: 'none' }) },
  ]

  function goWorkbench() {
    go(RIDER_WORKBENCH_URL)
  }

  onLoad(() => {
    restoreProfile()
    ensureLogin()
  })

  return {
    profile,
    stats,
    level,
    online,
    settingMenus,
    goWorkbench,
    logout,
  }
}
