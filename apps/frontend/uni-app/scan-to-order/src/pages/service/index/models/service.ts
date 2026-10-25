/** 服务页活动实拍图片。 */
export interface ActivityGalleryImage { url: string, label: string }
/** 服务页分组；moreUrl 仅允许应用内部页面地址。 */
export interface ActivityGalleryGroup { id: number, title: string, titleKey?: string, images: ActivityGalleryImage[], moreUrl?: string }
