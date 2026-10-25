import type { IAuthLoginRes, ILoginForm, IUserInfoRes, SessionIdentity } from '@/pages/auth/session'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue' // 修复：导入 computed
import {
  getUserInfo as _getUserInfo,
  login as _login,
  logout as _logout,
  refreshToken as _refreshToken,
  wxLogin as _wxLogin,
  getWxCode,
  isDoubleTokenRes,
  isSessionIdentity,
  isSingleTokenRes,
} from '@/pages/auth/session'
import { useUserStore } from './user'

/**
 * 是否是双token模式
 */
export const isDoubleTokenMode = import.meta.env.VITE_AUTH_MODE === 'double'
// 初始化状态
const tokenInfoState = isDoubleTokenMode
  ? {
      accessToken: '',
      accessExpiresIn: 0,
      refreshToken: '',
      refreshExpiresIn: 0,
    }
  : {
      token: '',
      expiresIn: 0,
    }

export const useTokenStore = defineStore(
  'token',
  () => {
    // 定义用户信息
    const tokenInfo = ref<IAuthLoginRes>({ ...tokenInfoState })
    const nowTime = ref(Date.now())
    // 唯一身份和凭证共用现有 Pinia 持久化，不另存 operator/customer token。
    const identity = ref<SessionIdentity | null>(null)
    const authenticating = ref(false)
    const sessionRevision = ref(0)

    function clearSession() {
      sessionRevision.value++
      authenticating.value = false
      identity.value = null
      tokenInfo.value = { ...tokenInfoState }
      nowTime.value = Date.now()
      uni.removeStorageSync('accessTokenExpireTime')
      uni.removeStorageSync('refreshTokenExpireTime')
      useUserStore().clearUserInfo()
    }

    // 添加一个时间戳 ref 作为响应式依赖

    /**
     * 更新响应式数据:now
     * 确保isTokenExpired/isRefreshTokenExpired重新计算,而不是用错误过期缓存值
     * 可useTokenStore内部适时调用;也可链式调用:tokenStore.updateNowTime().hasLogin
     * @returns 最新的tokenStore实例
     */
    const updateNowTime = () => {
      nowTime.value = Date.now()
      return useTokenStore()
    }

    // 设置用户信息
    const setTokenInfo = (val: IAuthLoginRes) => {
      updateNowTime()
      tokenInfo.value = val
      identity.value ??= 'customer'

      // 计算并存储过期时间
      const now = Date.now()
      if (isSingleTokenRes(val)) {
        // 单token模式
        const expireTime = now + val.expiresIn * 1000
        uni.setStorageSync('accessTokenExpireTime', expireTime)
      }
      else if (isDoubleTokenRes(val)) {
        // 双token模式
        const accessExpireTime = now + val.accessExpiresIn * 1000
        const refreshExpireTime = now + val.refreshExpiresIn * 1000
        uni.setStorageSync('accessTokenExpireTime', accessExpireTime)
        uni.setStorageSync('refreshTokenExpireTime', refreshExpireTime)
      }
    }

    /**
     * 判断token是否过期
     */
    const isTokenExpired = computed(() => {
      if (!tokenInfo.value) {
        return true
      }

      const now = nowTime.value
      const expireTime = uni.getStorageSync('accessTokenExpireTime')

      if (!expireTime)
        return true
      return now >= expireTime
    })

    /**
     * 判断refreshToken是否过期
     */
    const isRefreshTokenExpired = computed(() => {
      if (!isDoubleTokenMode)
        return true

      const now = nowTime.value
      const refreshExpireTime = uni.getStorageSync('refreshTokenExpireTime')

      if (!refreshExpireTime)
        return true
      return now >= refreshExpireTime
    })

    /**
     * 三端共用的登录事务：校验身份后统一保存凭证和资料。
     * 普通登录和微信登录由下方入口调用；商家/骑手接入真实 API 后直接调用此方法。
     * @param target 本次登录端身份
     * @param request 通过认证模块登录接口获取凭证
     * @returns 登录凭证；并发、身份冲突或资料校验失败时抛出错误
     */
    async function authenticate(target: SessionIdentity, request: () => Promise<IAuthLoginRes>, loadUser: (token: string) => Promise<IUserInfoRes> = _getUserInfo) {
      if (!isSessionIdentity(target))
        throw new Error('无效的登录身份')
      if (authenticating.value)
        throw new Error('正在登录，请稍后重试')
      if (identity.value || (isSingleTokenRes(tokenInfo.value) ? tokenInfo.value.token : tokenInfo.value.accessToken))
        throw new Error('请先退出当前账号，再登录其他身份')
      authenticating.value = true
      const started = ++sessionRevision.value
      try {
        const result = await request()
        if (started !== sessionRevision.value)
          throw new Error('登录已取消')
        const valid = isDoubleTokenMode
          ? isDoubleTokenRes(result) && !!result.accessToken && !!result.refreshToken
          && result.accessExpiresIn > 0 && Number.isFinite(result.accessExpiresIn)
          && result.refreshExpiresIn > 0 && Number.isFinite(result.refreshExpiresIn)
          : isSingleTokenRes(result) && !!result.token && result.expiresIn > 0 && Number.isFinite(result.expiresIn)
        if (!valid)
          throw new Error('登录凭证格式无效')
        const token = isSingleTokenRes(result) ? result.token : result.accessToken
        // 复用现有 API；候选凭证只用于此次资料查询，完整成功后才保存。
        const user = await loadUser(token)
        if (started !== sessionRevision.value)
          throw new Error('登录已取消')
        if ((user.identity ?? 'customer') !== target)
          throw new Error('账号身份与当前登录端不匹配')
        useTokenStore().$patch(() => {
          setTokenInfo(result)
          identity.value = target
          useUserStore().setUserInfo(user)
        })
        return result
      }
      catch (error) {
        if (started === sessionRevision.value)
          clearSession()
        throw error
      }
      finally {
        if (started === sessionRevision.value)
          authenticating.value = false
      }
    }

    /**
     * 用户登录
     * 有的时候后端会用一个接口返回token和用户信息，有的时候会分开2个接口，一个获取token，一个获取用户信息
     * （各有利弊，看业务场景和系统复杂度），这里使用2个接口返回的来模拟
     * @param loginForm 登录参数
     * @returns 登录结果
     */
    const login = async (loginForm: ILoginForm) => {
      try {
        const res = await authenticate('customer', () => _login(loginForm))
        uni.showToast({
          title: '登录成功',
          icon: 'success',
        })
        return res
      }
      catch (error) {
        console.error('登录失败:', error)
        uni.showToast({
          title: '登录失败，请重试',
          icon: 'error',
        })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 微信登录
     * 有的时候后端会用一个接口返回token和用户信息，有的时候会分开2个接口，一个获取token，一个获取用户信息
     * （各有利弊，看业务场景和系统复杂度），这里使用2个接口返回的来模拟
     * @returns 登录结果
     */
    const wxLogin = async () => {
      try {
        // 获取微信小程序登录的code
        const res = await authenticate('customer', async () => {
          const code = await getWxCode()
          return _wxLogin({ code: code.code })
        })
        uni.showToast({
          title: '登录成功',
          icon: 'success',
        })
        return res
      }
      catch (error) {
        console.error('微信登录失败:', error)
        uni.showToast({
          title: '微信登录失败，请重试',
          icon: 'error',
        })
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      // 发起请求时捕获旧凭证，立即退出本地；迟到响应不清除新会话。
      const task = _logout().catch(error => console.error('退出登录失败:', error))
      clearSession()
      await task
    }

    /**
     * 刷新token
     * @returns 刷新结果
     */
    const refreshToken = async () => {
      if (!isDoubleTokenMode) {
        console.error('单token模式不支持刷新token')
        throw new Error('单token模式不支持刷新token')
      }

      const started = sessionRevision.value
      const currentIdentity = identity.value
      try {
        // 安全检查，确保refreshToken存在
        if (!isDoubleTokenRes(tokenInfo.value) || !tokenInfo.value.refreshToken) {
          throw new Error('无效的refreshToken')
        }

        const refreshToken = tokenInfo.value.refreshToken
        const res = await _refreshToken(refreshToken)
        if (started !== sessionRevision.value || currentIdentity !== identity.value)
          throw new Error('会话已变化，忽略旧刷新结果')
        if (!isDoubleTokenRes(res) || !res.accessToken || !res.refreshToken
          || !Number.isFinite(res.accessExpiresIn) || res.accessExpiresIn <= 0
          || !Number.isFinite(res.refreshExpiresIn) || res.refreshExpiresIn <= 0) {
          throw new Error('刷新凭证格式无效')
        }
        setTokenInfo(res)
        return res
      }
      catch (error) {
        console.error('刷新token失败:', error)
        throw error
      }
      finally {
        updateNowTime()
      }
    }

    /**
     * 获取有效的token
     * 注意：在computed中不直接调用异步函数，只做状态判断
     * 实际的刷新操作应由调用方处理
     * 建议这样使用 tokenStore.updateNowTime().validToken
     */
    const getValidToken = computed(() => {
      // token已过期，返回空
      if (isTokenExpired.value) {
        return ''
      }

      if (!isDoubleTokenMode) {
        return isSingleTokenRes(tokenInfo.value) ? tokenInfo.value.token : ''
      }
      else {
        return isDoubleTokenRes(tokenInfo.value) ? tokenInfo.value.accessToken : ''
      }
    })

    /**
     * 检查是否有登录信息（不考虑token是否过期）
     */
    const hasLoginInfo = computed(() => {
      if (!tokenInfo.value) {
        return false
      }
      if (isDoubleTokenMode) {
        return isDoubleTokenRes(tokenInfo.value) && !!tokenInfo.value.accessToken
      }
      else {
        return isSingleTokenRes(tokenInfo.value) && !!tokenInfo.value.token
      }
    })

    /**
     * 检查是否已登录且token有效
     * 建议这样使用tokenStore.updateNowTime().hasLogin
     */
    const hasValidLogin = computed(() => {
      console.log('hasValidLogin', hasLoginInfo.value, !isTokenExpired.value)
      return hasLoginInfo.value && !isTokenExpired.value && !authenticating.value
    })

    /**
     * 尝试获取有效的token，如果过期且可刷新，则刷新token
     * @returns 有效的token或空字符串
     */
    const tryGetValidToken = async (): Promise<string> => {
      updateNowTime()
      if (!getValidToken.value && isDoubleTokenMode && !isRefreshTokenExpired.value) {
        try {
          await refreshToken()
          return getValidToken.value
        }
        catch (error) {
          console.error('尝试刷新token失败:', error)
          return ''
        }
      }
      return getValidToken.value
    }

    return {
      // 核心API方法
      identity,
      authenticating,
      sessionRevision,
      authenticate,
      clearSession,
      login,
      wxLogin,
      logout,

      // 认证状态判断（最常用的）
      hasLogin: hasValidLogin,

      // 内部系统使用的方法
      refreshToken,
      tryGetValidToken,
      validToken: getValidToken,

      // 调试或特殊场景可能需要直接访问的信息
      tokenInfo,
      setTokenInfo,
      updateNowTime,
    }
  },
  {
    // 添加持久化配置，确保刷新页面后token信息不丢失
    persist: {
      paths: ['tokenInfo', 'identity'],
      afterRestore: ({ store }) => {
        if (store.identity !== null && !isSessionIdentity(store.identity))
          store.clearSession()
        else if (!store.identity && (store.tokenInfo.token || store.tokenInfo.accessToken))
          store.identity = 'customer'
      },
    },
  },
)
