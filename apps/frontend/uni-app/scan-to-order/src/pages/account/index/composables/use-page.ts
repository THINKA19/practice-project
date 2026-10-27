/** 个人中心：读取正式会话，未接入功能显示提示。 */
import { computed } from 'vue'
import { useSessionState } from '@/pages/auth/session'
import { useAccountNavigation } from './use-navigation'
import { useAccountAssets } from './use-assets'
import { t } from '@/locale'

/** 获取个人中心展示和动作；未接入功能不提交资料、不清除登录状态。 */
export function useAccountPage() {
  const session = useSessionState()
  const user = computed(() => session.hasLogin && session.identity === 'customer' ? session.userInfo : null)
  const nick = computed(() => user.value?.nickname || t('account.profile.wechatUser'))
  const avatar = computed(() => user.value?.avatar || '/static/images/default-avatar.png')

  const accountKey = computed(() => {
    if (user.value)
      return `${user.value.userId}:${session.sessionRevision}`
    return null
  })
  const assets = useAccountAssets(accountKey)
  const { navTo, editNick } = useAccountNavigation(user)

  return {
    user,
    nick,
    avatar,
    couponCount: assets.couponCount,
    balance: assets.balance,
    score: assets.score,
    assetStatus: assets.status,
    myBg: undefined,
    customerServiceType: 'QW',
    init: () => uni.setNavigationBarTitle({ title: '我的' }),
    refresh: () => {
      session.updateNowTime()
      return assets.refresh()
    },
    navTo,
    editNick,
    login: () => navTo('登录'),
    onChooseAvatar: () => navTo('修改头像'),
    scanOrderCode: () => navTo('扫码核销'),
    goCoupons: () => navTo('优惠券'),
    goBalance: () => navTo('余额'),
    goScorelog: () => navTo('积分明细'),
    govip: () => user.value ? navTo('会员中心') : editNick(),
    goUserCode: () => navTo('会员码'),
    customerService: () => navTo('联系客服'),
  }
}
