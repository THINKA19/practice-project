/**
 * 首页（tab）：Banner、用户卡、配送方式入口、更多服务、分享
 */
import { onHide, onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHomePage } from './use-page'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useHomeView() {
  const { t } = useI18n()
  const vm = useHomePage()
  const { banners, hasLogin, nick, avatar, levelName } = vm
  const pageVisible = ref(false)

  onHide(() => {
    pageVisible.value = false
  })
  onLoad(() => {
    vm.init()
  })
  onShow(() => {
    pageVisible.value = true
    vm.refresh()
  })
  onShareAppMessage(() => vm.shareAppMessage())
  onShareTimeline(() => vm.shareTimeline())
  return { t, vm, banners, hasLogin, nick, avatar, levelName, pageVisible }
}
