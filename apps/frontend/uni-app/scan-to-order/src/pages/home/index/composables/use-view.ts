/**
 * 首页（tab）：Banner、用户卡、配送方式入口、更多服务、分享
 */
import { useI18n } from 'vue-i18n'
import { useHomePage } from '../composables/use-page'

/** 页面状态与交互编排；每次调用拥有独立的页面实例。 */
export function useHomeView() {
  const { t } = useI18n()
  const vm = useHomePage()
  const { banners, hasLogin, nick, avatar, levelName } = vm
  /** wd-swiper 数据（value 为图片地址） */
  const swiperList = computed(() => banners.value.map(b => ({ value: b.picUrl, linkUrl: b.linkUrl })))
  onLoad(() => {
    vm.init()
  })
  onShow(() => {
    vm.refresh()
  })
  onShareAppMessage(() => vm.shareAppMessage())
  onShareTimeline(() => vm.shareTimeline())
  return { t, vm, banners, hasLogin, nick, avatar, levelName, swiperList }
}
