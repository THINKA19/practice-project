/**
 * ============================================================================
 * 首页分享
 * 【文件概述】当前项目未接入旧配置中心，使用首页品牌文案和现有用户 ID。
 * 【方法与导出清单】useHomeShare：好友及朋友圈分享参数。
 * 【综合使用示例】
 * import { useHomeShare } from '@/pages/home/index/composables/use-share'
 * const share = useHomeShare()
 * share.shareAppMessage() // 返回首页分享参数
 * ============================================================================
 */
import { ClientRoutes } from '@/pages/routes'
import { useSessionState } from '@/pages/auth/session'

/**
 * 创建首页分享方法。无参数。
 * @returns 好友分享与朋友圈分享参数生成方法。
 * @example useHomeShare().shareTimeline() // 返回标题及可选邀请参数
 */
export function useHomeShare() {
  const session = useSessionState()

  /**
   * 获取有效登录用户邀请参数。无参数。
   * @returns string，游客为空。
   * @example invitation() // 游客返回 ''
   */
  function invitation() {
    const { hasLogin } = session.updateNowTime()
    const id = session.userInfo.userId
    return hasLogin && session.identity === 'customer' && id > 0 ? `inviter_id=${encodeURIComponent(id)}` : ''
  }

  /**
   * 生成好友分享参数。无参数。
   * @returns 首页标题和路径。
   * @example shareAppMessage() // 游客路径不带邀请参数
   */
  function shareAppMessage() {
    const query = invitation()
    return { title: 'TEA WORK', path: ClientRoutes.Home.home + (query ? `?${query}` : '') }
  }

  /**
   * 生成朋友圈分享参数。无参数。
   * @returns 标题及邀请查询串。
   * @example shareTimeline() // 游客 query 为 ''
   */
  function shareTimeline() {
    return { title: 'TEA WORK', query: invitation() }
  }

  return { shareAppMessage, shareTimeline }
}
