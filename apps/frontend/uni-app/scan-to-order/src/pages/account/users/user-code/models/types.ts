/** 开发动态码契约；真实核销协议尚未确认。 */
export interface MemberCode {
  code: string
  /** Unix 毫秒时间戳；仅用于开发页面过期展示。 */
  expiresAt: number
  demo: true
}

export type MemberCodeStatus = 'idle' | 'loading' | 'ready' | 'error' | 'expired' | 'unavailable'
