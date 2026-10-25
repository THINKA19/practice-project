/**
 * 【文件概述】骑手凭证交换接口配置；未确认的真实路径必须通过环境配置。
 * 【方法与导出清单】loginEndpoint
 * 【综合使用示例】通过本模块 index.ts 调用公开能力。
 */
export function loginEndpoint(): string {
  const value = import.meta.env.VITE_RIDER_LOGIN_URL

  if (typeof value !== 'string' || !/^\/(?!\/)/.test(value))
    throw new Error('骑手登录服务尚未配置')

  return value
}
