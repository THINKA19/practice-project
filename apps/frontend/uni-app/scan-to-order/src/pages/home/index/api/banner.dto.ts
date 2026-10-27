/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

export interface BannerDto {
  id: number
  picUrl: string
  linkUrl?: string
  title?: string
  type?: string
}
