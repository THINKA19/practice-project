/**
 * 【文件概述】顾客登录公开规则与类型；状态和生命周期归 session。
 * 【方法与导出清单】resolveRedirect、AGREEMENT_VERSION、微信 DTO 类型。
 * 【综合使用示例】resolveRedirect(query.redirect, paths, fallback)
 */
export { AGREEMENT_VERSION } from '../agreement'
export { default as AgreementConsent } from './components/AgreementConsent/index.vue'
export { default as WechatAuthorizationPanel } from './components/AuthPanel/index.vue'
export { useLoginWechatAuthorization } from './composables/use-wechat-authorization'
export { resolveRedirect } from './domain/redirect.rules'
export type { WechatChannel, WechatExchange, WechatPoll, WechatTicket } from './models/types'
