/**
 * ============================================================================
 * 【文件概述】主包会话生命周期路径，Mock 只引用本模块路径。
 * 【方法与导出清单】endpoints。
 * 【综合使用示例】import { endpoints } from '@/pages/auth/session/api/endpoints'
 * ============================================================================
 */
/** 生命周期端点。角色端点必须由环境明确配置，不回退到顾客接口。 */
export const endpoints = {
  customerProfile: '/user/info',
  customerRefresh: '/auth/refreshToken',
  customerLogout: '/auth/logout',
  demoProfile: '/demo/session/profile',
  demoRefresh: '/demo/session/refresh',
  demoLogout: '/demo/session/logout',
} as const
