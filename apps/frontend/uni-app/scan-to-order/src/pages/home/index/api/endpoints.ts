/**
 * ============================================================================
 * 【文件概述】首页请求路径，使用当前脚手架默认服务地址，后端能力待联调。
 * 【方法与导出清单】endpoints.banners：轮播查询路径。
 * 【综合使用示例】
 * import { endpoints } from '@/pages/home/index/api/endpoints'
 * // endpoints.banners === '/banner/list'
 * ============================================================================
 */
/** 首页接口路径常量。 @example endpoints.banners // '/banner/list' */
export const endpoints = {
  /** 按类型查询横幅；服务地址由现有请求拦截器处理。 */
  banners: '/banner/list',
} as const
