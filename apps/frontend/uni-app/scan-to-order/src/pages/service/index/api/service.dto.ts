/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

/** 服务页分组；moreUrl 仅允许应用内部页面地址。 */
export interface ActivityGalleryGroupDto { id: number, title: string, titleKey?: string, images: ActivityGalleryImageDto[], moreUrl?: string }

/** 服务页活动实拍图片。 */
export interface ActivityGalleryImageDto { url: string, label: string }
