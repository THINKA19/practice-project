/** 账户页业务跳转，复用正式公共导航。 */
import type { Ref } from 'vue'
import type { IUserInfoRes } from '@/pages/auth/session'
import type { NavigationResult } from '@/utils/project/navigation'
import { navigate } from '@/utils/project/navigation'
import { toast } from '@/utils/project/feedback'
import { t } from '@/locale'
import { ClientRoutes } from '@/pages/routes'

/** 提供正式页面及客户登录跳转；未接入功能只显示提示。 */
export function useAccountNavigation(user: Readonly<Ref<Pick<IUserInfoRes, 'userId'> | null>>) {
  let pending: Promise<NavigationResult> | null = null

  function open(path: string, title?: string) {
    if (pending)
      return pending
    pending = (title ? navigate(path, { title }) : navigate(path)).then((result) => {
      if (!result.ok)
        toast(t('common.navigationFailed'))
      return result
    }).finally(() => {
      pending = null
    })
    return pending
  }

  function navTo(title: string) {
    if (title === '登录')
      return open(ClientRoutes.Auth.login)
    if (title === '扫码核销')
      return open(ClientRoutes.Account.scanResult)
    if (title === '每日签到')
      return open(ClientRoutes.Account.sign)
    if (title === '预约订座')
      return open(ClientRoutes.Account.booking)
    if (title === '优惠买单')
      return open(ClientRoutes.Account.billPay)
    if (title === '优惠券')
      return open(ClientRoutes.Account.coupons)
    if (title === '余额')
      return open(ClientRoutes.Account.asset)
    if (title === '积分明细')
      return open(ClientRoutes.Account.scoreLogs)
    if (title === '我的订单')
      return open(ClientRoutes.Account.allOrders)
    if (title === '收货地址')
      return open(ClientRoutes.Account.address)
    if (title === '关于我们')
      return open(ClientRoutes.Account.about)
    if (title === '联系客服')
      return open(ClientRoutes.Account.contact)
    if (title === '意见反馈')
      return open(ClientRoutes.Account.feedback, title)
    if (title === '会员码')
      return open(ClientRoutes.Account.userCode, title)
    if (title === '会员中心')
      return open(ClientRoutes.Account.memberCenter)
    toast('该功能暂未开放')
  }

  function editNick() {
    return user.value ? navTo('修改昵称') : open(ClientRoutes.Auth.login)
  }

  return { navTo, editNick }
}
