import type { AdminLoginForm } from '../type'
import { onLoad } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'
import { SHOP_HOME_URL } from '@/pages-shop/routes'
import { checkForm, when } from '@/utils/form'
import { isMerchantRole } from '@/utils/merchant'
import { useAuthStore } from '@/store/auth'

/** 记住账号的本地存储 key（登录页 / 历史版本共用） */
export const ADMIN_REMEMBER_ACCOUNT_KEY = 'adminRememberAccount'

/**
 * 商家账号登录
 *
 * 与骑手端登录保持同一套形态：账号 + 密码（验证码仅真实后端开启时出现）。
 *  - 校验只在 handleLogin 里做一次（不再依赖 uni-forms 的表单联动，任何端都能给出明确提示）；
 *  - 请求走统一 api + mock 链路：/auth/login（mock 阶段密码传 'error' 可验证失败分支），
 *    token / 用户信息 / 角色判定全部由 authStore.login 串好，页面只管跳转；
 *  - 测试账号见 constants/testAccount.ts（admin / 123456）。
 *
 * @param options.isCaptchaRequired 由页面注入「后端是否开启了验证码」，
 *        开启时才会校验必填并把验证码带进请求体
 */
export function useAdminLogin(options: { isCaptchaRequired?: () => boolean } = {}) {
  const authStore = useAuthStore()

  const loginForm = reactive<AdminLoginForm>({
    username: '',
    password: '',
    captcha: '',
    rememberAccount: true,
  })
  const showPassword = ref(false)
  const loading = ref(false)

  /** 账号密码都填了才允许提交（与骑手登录一致） */
  const canSubmit = computed(() => !!loginForm.username && !!loginForm.password)

  /** 回填记住的账号 */
  function restoreRememberedAccount() {
    const remembered = uni.getStorageSync(ADMIN_REMEMBER_ACCOUNT_KEY) as string
    if (remembered) {
      loginForm.username = remembered
      loginForm.rememberAccount = true
    }
  }

  function persistRememberedAccount() {
    if (loginForm.rememberAccount && loginForm.username)
      uni.setStorageSync(ADMIN_REMEMBER_ACCOUNT_KEY, loginForm.username)
    else
      uni.removeStorageSync(ADMIN_REMEMBER_ACCOUNT_KEY)
  }

  async function handleLogin() {
    // 字段级兜底校验：不依赖表单联动，保证任何端都能给出明确提示（见 @/utils/form）
    // 验证码只在后端开启时才要求填写，否则输入框根本不展示
    if (!checkForm([
      when(canSubmit.value, '请输入账号和密码'),
      when(!options.isCaptchaRequired?.() || !!loginForm.captcha.trim(), '请输入验证码'),
    ]))
      return

    try {
      loading.value = true
      // authStore.login 内部已串好完整链路：登录 → token 落地 → 拉用户信息（含 role）
      await authStore.login({
        username: loginForm.username,
        password: loginForm.password,
        // 登录体是整体透传的：采集到的验证码必须一起提交，
        // 否则后端开启校验后会出现「输对了验证码仍登录失败」
        captcha: loginForm.captcha.trim(),
      })
      persistRememberedAccount()

      // 商家角色进后台首页（其余页面全部从首页菜单进入）；顾客账号提示无权限
      if (isMerchantRole())
        uni.redirectTo({ url: SHOP_HOME_URL })
      else
        uni.showToast({ title: '该账号无商家后台权限', icon: 'none' })
    }
    catch {
      // 登录失败的 toast 已由 authStore.login 统一给出，这里只需终止跳转
    }
    finally {
      loading.value = false
    }
  }

  onLoad(() => restoreRememberedAccount())

  return {
    loginForm,
    showPassword,
    loading,
    canSubmit,
    handleLogin,
  }
}
