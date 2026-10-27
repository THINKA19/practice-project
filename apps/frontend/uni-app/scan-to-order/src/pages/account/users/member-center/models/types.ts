export interface UserLevel {
  id: number
  name: string
  level?: number
  upgradeAmount?: number
  rebate?: number
  paixu?: number
  [k: string]: unknown
}
