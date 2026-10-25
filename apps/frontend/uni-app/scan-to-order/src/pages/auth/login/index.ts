/**
 * 【文件概述】顾客登录公开规则与类型；状态和生命周期归 session。
 * 【方法与导出清单】resolveRedirect、AGREEMENT_VERSION、微信 DTO 类型。
 * 【综合使用示例】resolveRedirect(query.redirect, paths, fallback)
 */
export { AGREEMENT_VERSION } from '../agreement'
export { resolveRedirect } from './domain/redirect'
export type { WechatChannel, WechatExchange, WechatPoll, WechatTicket } from './models/wechat'
