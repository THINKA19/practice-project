/**
 * 【文件概述】门店授权接口配置，后端未配置时拒绝请求。
 * 【方法与导出清单】见下方具名导出。
 * 【综合使用示例】通过所属模块 index.ts 调用。
 */
export function permissionEndpoint(action: 'SHOPS' | 'GRANT' | 'INVITE'): string {
  const value = import.meta.env[`VITE_SHOP_${action}_URL`]

  if (typeof value !== 'string' || !/^\/(?!\/)/.test(value))
    throw new Error('门店授权服务尚未配置')

  return value
}
