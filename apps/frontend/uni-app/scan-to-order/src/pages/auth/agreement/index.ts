export { canUseCustomerData, enablePrivacyConsent, ensurePrivacyConsent, getPrivacyRevision } from './composables/use-privacy-consent'
/**
 * 【文件概述】协议版本与页面路径的唯一公开入口。
 * 【方法与导出清单】AGREEMENT_VERSION、AGREEMENT_PAGES。
 * 【综合使用示例】uni.navigateTo({ url: AGREEMENT_PAGES.user })
 */
/** 协议模块公开版本及页面路径。 */
export { AGREEMENT_VERSION } from './models/enums'
export { PRIVACY_VERSION } from './models/enums'
export { AGREEMENT_PAGES } from './routes'
