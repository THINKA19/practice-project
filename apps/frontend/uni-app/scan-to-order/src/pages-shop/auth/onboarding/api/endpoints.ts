/** 入驻申请端点只接受明确配置的后端路径。 */
export function onboardingEndpoint(key: 'VITE_SHOP_ONBOARDING_URL' | 'VITE_SHOP_ONBOARDING_UPLOAD_URL'): string {
  const value = import.meta.env[key]
  if (typeof value !== 'string' || !/^\/(?!\/)/.test(value))
    throw new Error('入驻服务暂未开放')
  return value
}
