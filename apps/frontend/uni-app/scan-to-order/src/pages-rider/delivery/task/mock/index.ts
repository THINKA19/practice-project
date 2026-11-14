/**
 * ============================================================================
 * 【文件概述】配送任务的仅开发使用的模拟后端层。业务页面和 API 不得导入此文件。
 * 【方法与导出清单】
 * - act：所属模块的公开能力。
 * - reset：所属模块的公开能力。
 * - setOnline：所属模块的公开能力。
 * - snapshot：所属模块的公开能力。
 * 【综合使用示例】
 * import { act } from '@/pages-rider/delivery/task/mock/index'
 * // 调用约束与参数见该导出的实现声明。
 * ============================================================================
 */
/** 本模块开发数据的唯一出口。 */
export { demoDispatchPolicy } from './policy'
export { act, reset, setOnline, snapshot } from './state'
