/** 最近门店按操作账号隔离；存储失败不撤销已经生效的服务端授权。 */
export function merchantShopPreference(userId: number) {
  const key = `merchant-last-shop:${userId}`
  return {
    read(): string {
      try {
        const value: unknown = uni.getStorageSync(key)
        return typeof value === 'string' ? value : ''
      }
      catch {
        return ''
      }
    },
    write(value: string) {
      try {
        uni.setStorageSync(key, value)
        return { ok: true }
      }
      catch {
        return { ok: false }
      }
    },
  }
}
