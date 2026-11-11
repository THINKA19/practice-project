/**
 * ============================================================================
 * 首页入口操作
 * 【文件概述】首页本地交互，使用项目公共导航和反馈，不依赖参考代码。
 * 【方法与导出清单】useHomeNavigation：正式业务入口、保留测试入口及原有外部入口。
 * 【综合使用示例】
 * import { useHomeNavigation } from '@/pages/home/index/composables/use-navigation'
 * const actions = useHomeNavigation()
 * actions.openCoupons() // 打开优惠券测试页
 * ============================================================================
 */
import { t } from '@/locale'
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { ClientRoutes } from '@/pages/routes'
import { openShopList } from '@/pages/ordering/index'

/**
 * 创建首页交互方法。无参数。
 * @returns 各入口操作。
 * @example
 * const actions = useHomeNavigation()
 * actions.openMemberCenter() // 打开会员中心测试页
 */
export function useHomeNavigation() {
  /**
   * 打开首页普通子页面，失败时提示。
   * @param url 内部页面路径。
   * @param deliveryType 可选配送方式，沿用 peisongType 查询协议。
   * @returns 导航结果 Promise；失败提示由首页负责。
   * @example openPage(ClientRoutes.Home.coupons) // 打开优惠券页
   */
  async function openPage(url: string, deliveryType?: 'zq' | 'kd') {
    const result = await navigate(url, deliveryType ? { peisongType: deliveryType } : undefined)
    if (!result.ok)
      toast(t('common.navigationFailed'))
    return result
  }

  /**
   * 打开会员中心。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openMemberCenter() // 会员中心测试页
   */
  function openMemberCenter() {
    return openPage(ClientRoutes.Home.memberCenter)
  }
  /** 打开现有客户登录页，不在首页另建微信认证流程。 */
  function login() {
    return openPage(ClientRoutes.Auth.login)
  }
  /**
   * 打开优惠券。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openCoupons() // 优惠券测试页
   */
  function openCoupons() {
    return openPage(ClientRoutes.Home.coupons)
  }
  /**
   * 打开收藏。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openFavorites() // 收藏测试页
   */
  function openFavorites() {
    return openPage(ClientRoutes.Home.favorites)
  }
  /**
   * 从首页打开正式礼品卡卡包。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openMemberCard() // 礼品卡目录，可切换到我的卡包
   */
  function openMemberCard() {
    return openPage(ClientRoutes.Home.card)
  }
  /**
   * 打开团购。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openGroupBuying() // 团购测试页
   */
  function openGroupBuying() {
    return openPage(ClientRoutes.Home.groupBuying)
  }
  /**
   * 打开福利。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openWelfare() // 福利测试页
   */
  function openWelfare() {
    return openPage(ClientRoutes.Home.welfare)
  }

  /**
   * 设置配送方式并打开底部点餐商家列表。
   * @param deliveryType zq 为自取，kd 为配送。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openShopSelection('zq') // 设置自取并进入商家列表
   */
  function openShopSelection(deliveryType: 'zq' | 'kd') {
    return openShopList({ deliveryType }).then((result) => {
      if (!result.ok)
        toast(t('common.navigationFailed'))
      return result
    })
  }

  /**
   * 打开原关于目标。无参数。
   * @returns 导航结果 Promise，失败时显示本地化提示。
   * @example openAbout() // 尝试进入关于页
   */
  function openAbout() {
    return openPage(ClientRoutes.Home.about)
  }

  return { login, openMemberCenter, openCoupons, openFavorites, openMemberCard, openGroupBuying, openWelfare, openShopSelection, openAbout }
}
