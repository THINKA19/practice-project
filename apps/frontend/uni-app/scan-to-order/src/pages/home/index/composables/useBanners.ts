/**
 * ============================================================================
 * 首页轮播展示
 * 【文件概述】加载首页轮播；链接只支持应用内页面，外链待明确业务需求后接入。
 * 【方法与导出清单】useBanners：轮播数据、加载与点击操作。
 * 【综合使用示例】
 * import { useBanners } from '@/pages/home/index/composables/useBanners'
 * const banner = useBanners()
 * await banner.loadBanners() // 更新轮播列表
 * ============================================================================
 */
import type { Banner } from '../models/banner'
import { ref } from 'vue'
import { t } from '@/locale'
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { bannerApi } from '../api/banner'

/**
 * 创建首页轮播状态。无参数。
 * @returns 列表、加载方法及应用内链接跳转方法。
 * @example const banner = useBanners() // banner.banners 初始为空
 */
export function useBanners() {
  const banners = ref<Banner[]>([])

  /**
   * 加载首页轮播。无参数。
   * @returns Promise<void>，失败降级为空列表。
   * @example await loadBanners() // 更新 banners
   */
  async function loadBanners() {
    banners.value = await bannerApi.banners('shouye').catch(() => [])
  }

  /**
   * 打开轮播应用内目标，按现有 tabbar 配置选择导航 API。
   * @param url 可选链接；空链接不操作，外链提示暂不支持。
   * @returns Promise<void>，完成导航或本地化提示。
   * @example tapBanner('/pages/home/user/coupons/index') // 打开优惠券测试页
   */
  async function tapBanner(url?: string) {
    if (!url)
      return
    if (!url.startsWith('/pages/') && !url.startsWith('/pages-demo/')) {
      toast(t('home.banner.unsupportedLink'))
      return
    }
    const result = await navigate(url)
    if (!result.ok)
      toast(t('common.navigationFailed'))
  }

  return { banners, loadBanners, tapBanner }
}
