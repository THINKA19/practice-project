/** Mock 仅用于开发；生产构建即使误设开关也不会启用。 */
export const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true'

export interface MockConfig {
  /** 固定延迟，便于复现 loading；单位毫秒。 */
  delay: number
  /** 仅对显式使用 withFailure 的接口生效，范围 0～1。 */
  failureRate: number
  logRequests: boolean
}

export const mockConfig: Readonly<MockConfig> = {
  delay: 300,
  failureRate: 0,
  logRequests: false,
}
