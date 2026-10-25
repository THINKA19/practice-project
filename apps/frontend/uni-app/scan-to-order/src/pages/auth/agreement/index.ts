/**
 * 【文件概述】协议版本与页面路径的唯一公开入口。
 * 【方法与导出清单】AGREEMENT_VERSION、AGREEMENT_PAGES。
 * 【综合使用示例】uni.navigateTo({ url: AGREEMENT_PAGES.user })
 */
/** 协议模块公开版本及页面路径。 */
export { AGREEMENT_VERSION } from './models/version'
export const AGREEMENT_PAGES = { user: '/pages/auth/agreement/user', privacy: '/pages/auth/agreement/privacy' } as const
