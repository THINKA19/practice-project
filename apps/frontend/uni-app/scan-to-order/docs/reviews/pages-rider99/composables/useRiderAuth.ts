import { computed, reactive, ref } from 'vue'
import { riderLogin } from '@/api/modules/auth/rider'
import { useRiderSessionStore } from '@/store/riderSession'
import { guardRiderAccess } from '@/utils/auth/guards'
import { checkForm, when } from '@/utils/form'
import { RIDER_LOGIN_URL, RIDER_WORKBENCH_URL } from '../routes'

/**
 * 骑手端登录流程 + 会话守卫（页面的唯一入口）
 *
 * 分层（改动前先读这里）：
 *   - 本文件：登录表单编排、登录成功后的跳转、退出确认（都是「流程 + 交互」）
 *   - 会话落地：store/riderSession.ts（useRiderSessionStore，pinia）
 *   - 订单池：store/riderOrderPool.ts（useRiderOrderPoolStore，pinia）
 *   - 页面准入守卫：utils/auth/guards.ts 的 guardRiderAccess
 *
 * 登录态不再读写裸 storage —— 之前 restoreProfile / isLogin 各自 uni.getStorageSync，
 * 与内存里的会话可能不一致，表现成「页面显示已登录、守卫却判未登录」的错乱。
 *
 * 骑手端与顾客端 token 体系互相独立，因此这里不复用 store/token.ts。
 */
export function useRiderAuth() {
  // 本文件只用会话部分；订单池在 store/riderOrderPool.ts，退出时由 session.logout 连带清空
  const riderSession = useRiderSessionStore()

  const form = reactive({ username: '', password: '' })
  const loading = ref(false)

  /** 账号密码都填了才允许提交（避免空值打到接口） */
  const canSubmit = computed(() => !!form.username && !!form.password)

  /** 登录：校验 → 请求接口 → 落地会话（资料 + token）→ 进工作台 */
  async function login() {
    // 校验：按顺序取第一条不通过的提示（见 @/utils/form）
    if (!checkForm([
      when(canSubmit.value, '请输入账号和密码'),
    ]))
      return

    try {
      loading.value = true
      const { profile, token } = await riderLogin({ username: form.username, password: form.password })
      riderSession.setSession(profile, token)

      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => uni.redirectTo({ url: RIDER_WORKBENCH_URL }), 600)
    }
    catch {
      // 失败提示由请求层统一 toast（账号或密码错误），这里只需终止跳转
    }
    finally {
      loading.value = false
    }
  }

  /** 是否已登录（读会话，不再读裸 storage） */
  function isLogin() {
    return riderSession.isLogin
  }

  /** 从本地缓存恢复会话（页面 onLoad 调用） */
  function restoreProfile() {
    return riderSession.restoreSession()
  }

  /** 页面级登录守卫：未登录跳登录页（统一走 utils/auth/guards） */
  function ensureLogin() {
    return guardRiderAccess()
  }

  /** 退出登录：确认 → 清会话与订单池 → 回登录页 */
  function logout() {
    uni.showModal({
      title: '提示',
      content: '确认退出登录吗？',
      success: (res) => {
        if (!res.confirm)
          return
        riderSession.logout()
        uni.redirectTo({ url: RIDER_LOGIN_URL })
      },
    })
  }

  return {
    form,
    loading,
    canSubmit,
    login,
    isLogin,
    restoreProfile,
    ensureLogin,
    logout,
  }
}
