/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

export interface UserLevelDto {
  id: number
  name: string
  level?: number
  upgradeAmount?: number
  rebate?: number
  paixu?: number
  [k: string]: unknown
}
