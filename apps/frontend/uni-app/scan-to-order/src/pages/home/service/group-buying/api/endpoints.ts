/**
 * ============================================================================
 * 【文件概述】service/group-buying/api/endpoints.ts，负责业务请求与接口契约。
 * 【方法与导出清单】endpoints
 * 【综合使用示例】
 * import { endpoints } from '@/pages/home/service/group-buying/api/endpoints'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
/** 首页团购学习接口，通过开发 Mock 提供。 */
export const endpoints = {
  list: '/__mock/home/group-buying/list',
  detail: '/__mock/home/group-buying/detail',
  join: '/__mock/home/group-buying/join',
} as const
