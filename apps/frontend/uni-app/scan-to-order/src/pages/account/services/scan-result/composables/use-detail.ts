/** 扫码核销页面状态与流程：转换归 models、纯规则归 domain，跨领域协议归 adapters。 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { redirectToLogin, useSessionState } from '@/pages/auth/session'
import { verificationApi } from '../adapters/verification.adapter'
import { canVerifyOrder, isVerificationCompleted } from '../domain/scan-result.rules'
import { normalizeVerificationCode } from '../models/mappers'
import type { VerificationOrder } from '../models/types'
import { toast } from '@/utils/project/feedback'

/**
 * 创建页面状态；在 Vue setup 中调用，销毁或换号后忽略旧响应。
 * @example const vm = useOrderVerificationDetail(); onLoad(vm.init); onShow(vm.refresh)
 */
export function useOrderVerificationDetail() {
  const session = useSessionState()
  const code = ref('')
  const inputCode = ref('')
  const detail = ref<VerificationOrder | null>(null)
  const loading = ref(false)
  const scanning = ref(false)
  const submitting = ref(false)
  const verified = ref(false)
  const failed = ref(false)
  const allowed = computed(() => session.hasLogin && session.identity === 'shop')
  const canVerify = computed(() => allowed.value && !loading.value && !scanning.value && !submitting.value && !verified.value && !failed.value && canVerifyOrder(detail.value))
  let revision = 0
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  watch(() => session.sessionRevision, () => {
    revision++
    detail.value = null
    verified.value = false
    failed.value = false
    loading.value = false
    scanning.value = false
    submitting.value = false
  }, { flush: 'sync' })
  function checkAccess() {
    session.updateNowTime()
    if (session.hasLogin && !allowed.value) {
      toast('当前为顾客账号，请从商家后台使用门店账号核销')
      return false
    }
    if (!allowed.value) {
      redirectToLogin({ identity: 'shop' })
      return false
    }
    return true
  }
  async function loadVerify(value: unknown) {
    if (submitting.value || disposed)
      return
    const request = ++revision
    code.value = normalizeVerificationCode(value)
    inputCode.value = code.value
    detail.value = null
    verified.value = false
    failed.value = false
    loading.value = false
    if (!code.value) {
      toast('请输入有效核销码，或扫描包含 hxNumber 的取餐码')
      return
    }
    if (!checkAccess())
      return
    loading.value = true
    try {
      const data = await verificationApi.detail(code.value)
      if (request !== revision || disposed)
        return
      detail.value = data
      verified.value = isVerificationCompleted(data)
    }
    catch {
      if (request === revision && !disposed)
        failed.value = true
    }
    finally {
      if (request === revision && !disposed)
        loading.value = false
    }
  }
  function scan() {
    if (disposed || scanning.value || loading.value || submitting.value || !checkAccess())
      return
    // #ifdef H5
    toast('请在小程序或 App 中使用相机扫码，也可输入核销码查询')
    return
    // #endif
    // #ifndef H5
    const request = revision
    scanning.value = true
    uni.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        if (!disposed && request === revision) {
          scanning.value = false
          void loadVerify(res.result)
        }
      },
      fail: (error) => {
        if (!disposed && request === revision && !error.errMsg?.includes('cancel'))
          toast('扫码失败，请重试或输入核销码')
      },
      complete: () => {
        if (!disposed && request === revision)
          scanning.value = false
      },
    })
    // #endif
  }
  async function confirm() {
    if (disposed || !checkAccess() || !canVerify.value)
      return
    const request = revision
    submitting.value = true
    try {
      await verificationApi.confirm(code.value)
      if (request === revision && !disposed) {
        verified.value = true
        toast('核销成功')
      }
    }
    catch {
      if (request === revision && !disposed) {
        failed.value = true
        toast('核销结果未确认，请重新查询订单后再操作')
      }
    }
    finally {
      if (request === revision && !disposed)
        submitting.value = false
    }
  }
  /** 接收页面参数；实际加载统一由 onShow 刷新，避免初始化重复请求。 */
  function init(query?: { hxNumber?: unknown }) {
    code.value = normalizeVerificationCode(query?.hxNumber)
    inputCode.value = code.value
  }
  /** 登录返回或页面再次显示时重新查询，不恢复旧账号的订单详情。 */
  function refresh() {
    session.updateNowTime()
    if (code.value && allowed.value && !loading.value && !submitting.value && !scanning.value)
      void loadVerify(code.value)
  }
  return { inputCode, init, refresh, code, detail, loading, scanning, submitting, verified, failed, allowed, canVerify, loadVerify, scan, confirm }
}
