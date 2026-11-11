/**
 * ============================================================================
 * 【文件概述】service/favorites/api/endpoints.ts，负责业务请求与接口契约。
 * 【方法与导出清单】endpoints
 * 【综合使用示例】
 * import { endpoints } from '@/pages/home/service/favorites/api/endpoints'
 * // 通过此入口使用本模块的业务契约。
 * ============================================================================
 */
/** 收藏学习接口，仅开发 Mock 使用；真实服务契约待确认。 */
export const endpoints = {
  list: '/__mock/home/favorites/list',
  remove: '/__mock/home/favorites/remove',
} as const
