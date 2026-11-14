/**
 * ============================================================================
 * 【文件概述】商品详情 / composables/use-kanjia.ts
 * 流程层：管理页面实例状态、异步编排及交互动作。
 * 【方法与导出清单】
 * - KanjiaSetView：数据类型契约。
 * - KanjiaHelpLog：数据类型契约。
 * - KanjiaProgressView：数据类型契约。
 * - useGoodsDetailKanjia：本文件对外声明。
 * 【综合使用示例】
 * import type { KanjiaSetView } from '@/pages/ordering/menu-goods-details/composables/use-kanjia'
 * // 使用该类型约束调用方数据，字段语义以声明为准。
 * ============================================================================
 */
import { needsLogin, useOrderingLocale as useI18n } from '@/pages/ordering/menu'
/**
 * 商品详情 - 砍价 ViewModel
 * 来源：bee-master/pages/goods-details/index.js
 *   getGoodsDetailAndKanjieInfo（砍价部分）、helpKanjia/helpKanjiaDone、joinKanjia/doneJoinKanjia
 */
import type { KanjiaInfo, KanjiaSet } from '@/pages/ordering/menu'
import { getIdentity, getToken, requireIdentity, useSessionState } from '@/pages/auth/session'
import { kanjiaApi } from '@/pages/ordering/menu-goods-details'
import { alert, showError } from '@/utils/project/interaction'

/**
 * 砍价设置（marketing.KanjiaSet 未声明的展示字段在此补充）
 * 结构字段：number、numberBuy、originalPrice、dateEnd；必填与可选字段见声明。
 * @example
 * import type { KanjiaSetView } from '@/pages/ordering/menu-goods-details/composables/use-kanjia'
 * declare const response: KanjiaSetView
 * const value: KanjiaSetView = response // => 保留 KanjiaSetView 的字段与取值约束
 */
export interface KanjiaSetView extends KanjiaSet {
  number?: number
  numberBuy?: number
  originalPrice: number
  dateEnd?: string
}

/**
 * KanjiaHelpLog 数据契约；字段可选性及取值范围以声明为准。
 * 结构字段：avatarUrl、nick、cutPrice、dateAdd；必填与可选字段见声明。
 * @example
 * import type { KanjiaHelpLog } from '@/pages/ordering/menu-goods-details/composables/use-kanjia'
 * declare const response: KanjiaHelpLog
 * const value: KanjiaHelpLog = response // => 保留 KanjiaHelpLog 的字段与取值约束
 */
export interface KanjiaHelpLog {
  avatarUrl?: string
  nick?: string
  cutPrice?: number
  dateAdd?: string
  [k: string]: unknown
}

/**
 * 砍价进度（marketing.KanjiaInfo 未声明的展示字段在此补充）
 * 结构字段：kanjiaInfo、joiner、helps；必填与可选字段见声明。
 * @example
 * import type { KanjiaProgressView } from '@/pages/ordering/menu-goods-details/composables/use-kanjia'
 * declare const response: KanjiaProgressView
 * const value: KanjiaProgressView = response // => 保留 KanjiaProgressView 的字段与取值约束
 */
export interface KanjiaProgressView extends KanjiaInfo {
  kanjiaInfo: KanjiaInfo['kanjiaInfo'] & { statusStr?: string, dateAdd?: string }
  joiner?: { nick?: string, [k: string]: unknown }
  helps?: KanjiaHelpLog[]
}

interface KanjiaHelpResult {
  cutPrice?: number
  [k: string]: unknown
}

/**
 * 创建 use-kanjia 对应的领域状态与交互能力。
 * @param options {{ reload: () => Promise<void> }} 调用配置及依赖能力。
 * @returns 对象，包含 curGoodsKanjia、curKanjiaprogress、myHelpDetail、kjJoinUid、isOwner、percentage、setJoinUid、load、helpKanjia、joinKanjia。
 * @example
 * import { useGoodsDetailKanjia } from '@/pages/ordering/menu-goods-details/composables/use-kanjia'
 * declare const options: Parameters<typeof useGoodsDetailKanjia>[0]
 * useGoodsDetailKanjia(options) // => 对象，包含 curGoodsKanjia、curKanjiaprogress、myHelpDetail、kjJoinUid、isOwner、percentage、setJoinUid、load、helpKanjia、joinKanjia
 */
export function useGoodsDetailKanjia(options: { reload: () => Promise<void> }) {
  const { t } = useI18n()

  const session = useSessionState()

  /** 当前商品的砍价设置（原 curGoodsKanjia） */

  const curGoodsKanjia = ref<KanjiaSetView | null>(null)
  /** 砍价进度（原 curKanjiaprogress） */

  const curKanjiaprogress = ref<KanjiaProgressView | null>(null)
  /** 我的帮砍记录，有值表示已帮砍（原 myHelpDetail） */

  const myHelpDetail = ref<unknown>(null)
  /** 发起砍价的用户 uid（原 kjJoinUid，来自分享链接或自己） */

  const kjJoinUid = ref('')

  /** 当前用户是否为本次砍价的发起人（原 curKanjiaprogress.kanjiaInfo.uid == curuid） */

  const isOwner = computed(() => {
    const p = curKanjiaprogress.value

    return !!p && !!String(session.userInfo.userId) && String(p.kanjiaInfo.uid) === String(String(session.userInfo.userId))
  })

  /** 进度条百分比 */

  const percentage = computed(() => {
    const set = curGoodsKanjia.value

    const p = curKanjiaprogress.value

    if (!set || !p) {
      return 0
    }

    const total = Number(set.originalPrice) - Number(set.minPrice)

    if (!(total > 0)) {
      return 100
    }

    const v = (100 * (Number(set.originalPrice) - Number(p.kanjiaInfo.curPrice))) / total

    return Math.max(0, Math.min(100, Math.round(v)))
  })

  function setJoinUid(uid?: string) {
    kjJoinUid.value = uid || ''
  }

  /** 读取砍价设置 / 进度 / 我的帮砍记录（原 getGoodsDetailAndKanjieInfo 的砍价部分） */

  async function load(goodsId: string | number) {
    const sets = await kanjiaApi.set(goodsId).catch(() => null)

    if (!sets || !sets.length) {
      return
    }

    const set = sets[0] as KanjiaSetView

    curGoodsKanjia.value = set

    if (!kjJoinUid.value) {
      kjJoinUid.value = String(session.userInfo.userId)
    }

    const joiner = kjJoinUid.value

    const [progress, myHelp] = await Promise.all([
      kanjiaApi.detail(set.id, joiner).catch(() => null),
      session.hasLogin ? kanjiaApi.myHelp(set.id, joiner).catch(() => null) : Promise.resolve(null),
    ])

    if (progress) {
      curKanjiaprogress.value = progress as KanjiaProgressView
    }

    if (myHelp) {
      myHelpDetail.value = myHelp
    }
  }

  /** 未登录(2000)时重新登录并刷新页面（原 AUTH.login(this)） */

  async function handleError(e: unknown) {
    if (needsLogin(e)) {
      if (requireIdentity('customer')) {
        await options.reload()
      }

      return
    }

    showError(e)
  }

  /** 帮 TA 砍一刀 */

  async function helpKanjia() {
    if (!(requireIdentity('customer'))) {
      return
    }

    const set = curGoodsKanjia.value

    if (!set || myHelpDetail.value) {
      return
    }

    try {
      const res = await kanjiaApi.help(set.id, kjJoinUid.value, '') as KanjiaHelpResult

      myHelpDetail.value = res

      alert(`${t('goodsDetail.kanJiaAmount')} ${res?.cutPrice ?? ''}`)

      await options.reload()
    }
    catch (e) {
      await handleError(e)
    }
  }

  /** 报名参加砍价 */

  const joining = ref(false)

  async function joinKanjia() {
    if (joining.value || !(getIdentity() === 'customer' && !!getToken())) {
      return
    }

    const set = curGoodsKanjia.value

    if (!set) {
      return
    }

    joining.value = true
    try {
      await kanjiaApi.join(set.id)

      kjJoinUid.value = String(session.userInfo.userId)

      myHelpDetail.value = null

      await options.reload()
    }
    catch (e) {
      await handleError(e)
    }
    finally {
      joining.value = false
    }
  }

  return {
    joining,
    curGoodsKanjia,
    curKanjiaprogress,
    myHelpDetail,
    kjJoinUid,
    isOwner,
    percentage,
    setJoinUid,
    load,
    helpKanjia,
    joinKanjia,
  }
}
