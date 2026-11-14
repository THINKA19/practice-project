/**
 * ============================================================================
 * 【文件概述】骑手登录的跨模块公开入口。数据与逻辑由本业务模块独立维护。
 * 【方法与导出清单】
 * - useRiderLoginAuth：所属模块的公开能力。
 * - useRiderLoginPage：所属模块的公开能力。
 * 【综合使用示例】
 * import { useRiderLoginAuth } from '@/pages-rider/auth/login/index'
 * const auth = useRiderLoginAuth(); auth.ensureLogin() // 在页面 setup 中校验骑手身份
 * ============================================================================
 */
export { useRiderLoginAuth } from './composables/use-auth'
export { useRiderLoginPage } from './composables/use-page'
