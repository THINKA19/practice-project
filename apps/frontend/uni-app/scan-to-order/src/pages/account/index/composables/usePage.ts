/** 个人中心：读取正式会话，未接入功能统一打开模块内测试页。 */
import { computed } from 'vue'
import { useSession } from '@/pages/auth/session'
import { useNavigation } from './useNavigation'
import { useAssets } from './useAssets'
import { t } from '@/locale'
import { toast } from '@/utils/project/feedback'

/** 获取个人中心展示和动作；测试入口不提交资料、不清除登录状态。 */
export function usePage() {
  const session = useSession()
  const user = computed(() => session.hasLogin && session.identity === 'customer' ? session.userInfo : null)
  const nick = computed(() => user.value?.nickname || user.value?.username || t('account.nickSet'))
  const avatar = computed(() => user.value?.avatar || '/static/images/default-avatar.png')
  const uid = computed(() => user.value?.userId)

  const accountKey = computed(() => user.value ? `${user.value.userId}:${session.sessionRevision}` : null)
  const assets = useAssets(accountKey)
  const { navTo, editNick } = useNavigation(user)

  function copyuid() {
    if (uid.value === undefined)
      return
    uni.setClipboardData({ data: String(uid.value), fail: () => toast('复制失败，请重试') })
  }

  return {
    user,
    nick,
    avatar,
    uid,
    couponCount: assets.couponCount,
    balance: assets.balance,
    score: assets.score,
    assetStatus: assets.status,
    myBg: undefined,
    canHX: false,
    customerServiceType: 'QW',
    init: () => uni.setNavigationBarTitle({ title: '我的' }),
    refresh: () => {
      session.updateNowTime()
      return assets.refresh()
    },
    navTo,
    editNick,
    copyuid,
    onChooseAvatar: () => navTo('修改头像'),
    scanOrderCode: () => navTo('扫码核销'),
    goCoupons: () => navTo('优惠券'),
    goBalance: () => navTo('余额'),
    goScorelog: () => navTo('积分明细'),
    govip: () => navTo('会员中心'),
    goUserCode: () => navTo('会员码'),
    customerService: () => navTo('联系客服'),
    clearStorage: () => navTo('清除缓存'),
  }
}
