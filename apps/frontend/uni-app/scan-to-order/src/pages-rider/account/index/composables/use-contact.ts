/**
 * ============================================================================
 * 【文件概述】个人中心的页面编排与领域状态层。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderAccountContact：读取资料模块的站长联系方式；演示仅复制，真实站点确认后返回当前号码。
 * 【综合使用示例】
 * import { useRiderAccountContact } from '@/pages-rider/account/index/composables/use-contact'
 * const contact = useRiderAccountContact(); await contact.resolveStationPhone() // 展示当前站点联系方式
 * ============================================================================
 */
import { t } from '@/locale'
import { useSessionAccountScope } from '@/pages/auth/session'
import { useRiderProfileStore } from '@/pages-rider/account/profile'
import { confirm, toast } from '@/utils/project/interaction'

/**
 * 读取资料模块的站长联系方式；演示仅复制，旧确认不拨号。
 * 无参数。
 * @returns 页面绑定或领域状态对象，按所属生命周期使用。
 * @example const contact = useRiderAccountContact(); await contact.resolveStationPhone() // 展示当前站点联系方式
 */
export function useRiderAccountContact() {
  const account = useRiderProfileStore()
  const scope = useSessionAccountScope(() => {})
  async function resolveStationPhone() {
    const station = account.profile?.station
    if (!station?.phone) {
      toast(account.error || t('rider.task.noContact'))
      void account.refresh()
      return
    }
    const ticket = scope.ticket()
    const confirmed = await confirm({ title: station.name, content: `${station.contactName}：${station.phone}`, cancelText: t('common.cancel'), confirmText: station.isDemo ? t('rider.profile.copyPhone') : t('rider.profile.callPhone') })
    if (!confirmed || !scope.current(ticket) || account.profile?.station !== station)
      return
    if (station.isDemo) {
      uni.setClipboardData({ data: station.phone, fail: () => {
        if (scope.current(ticket))
          toast(t('rider.profile.copyFailed'))
      } })
    }
    else {
      return station.phone
    }
  }
  return { resolveStationPhone }
}
