/**
 * ============================================================================
 * 【文件概述】首页外观层，整合轮播、用户、交互和分享，保留现有模块结构。
 * 【方法与导出清单】usePage：提供首页状态与事件。
 * 【综合使用示例】
 * import { usePage } from '@/pages/home/index/composables/usePage'
 * const home = usePage()
 * home.init() // 加载首页轮播
 * ============================================================================
 */
import { useBanners } from './useBanners'
import { useUser } from './useUser'
import { useNavigation } from './useNavigation'
import { useShare } from './useShare'

/**
 * 聚合首页能力。无参数。
 * @returns 首页展示状态、初始化与交互方法。
 * @example const home = usePage() // home.openCoupons() 打开优惠券测试页
 */
export function usePage() {
  // 轮播图模块：数据源、拉取方法与点击处理
  const { banners, loadBanners, tapBanner } = useBanners()

  // 用户模块：个人信息、昵称、头像、会员等级及数据刷新
  const { user, nick, avatar, levelName, refresh } = useUser()

  // 动作与路由交互：功能入口跳转（会员/优惠券/配送方式/关于等）
  const {
    openMemberCenter,
    openCoupons,
    openShopSelection,
    openAbout,
    openFavorites,
    openGroupBuying,
    openWelfare,
    openMemberCard,
  } = useNavigation()

  // 分享模块：微信小程序/生态转发好友与朋友圈事件处理
  const { shareAppMessage, shareTimeline } = useShare()

  /**
   * 页面挂载初始化入口
   * 触发基础数据拉取（如首页 Banner）
   * 无参数。
   * @returns {void} 异步加载由轮播模块处理。
   * @example init() // 开始加载首页轮播
   */
  function init() {
    loadBanners()
  }

  return {
    // 基础与展示状态
    banners,
    user,
    nick,
    avatar,
    levelName,

    // 生命周期与数据调度
    init,
    refresh,

    // 交互行为与导航
    tapBanner,
    openMemberCenter,
    openCoupons,
    openShopSelection,
    openAbout,
    openFavorites,
    openGroupBuying,
    openWelfare,
    openMemberCard,

    // 社交传播
    shareAppMessage,
    shareTimeline,
  }
}
