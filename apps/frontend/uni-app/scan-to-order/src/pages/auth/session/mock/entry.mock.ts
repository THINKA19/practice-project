/**
 * 【文件概述】自动发现的会话 Mock 登记入口。
 * 【方法与导出清单】default
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
import { sessionState } from './state'

export { default } from './handlers'
export const reset = sessionState.reset
