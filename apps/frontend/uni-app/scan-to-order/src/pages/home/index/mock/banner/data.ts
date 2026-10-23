/**
 * ============================================================================
 * 【文件概述】首页轮播纯数据工厂，引用项目已有静态图片，不调用平台或请求接口。
 * 【方法与导出清单】createHomeBanners：每次返回独立的轮播数据。
 * 【综合使用示例】
 * import { createHomeBanners } from './data'
 * const banners = createHomeBanners('shouye') // 三张本地轮播图
 * ============================================================================
 */
/**
 * 创建指定类型的模拟轮播，当前仅提供首页数据。
 * @param type 轮播类型，shouye 为首页。
 * @returns 首页返回三张轮播图，其他类型返回空数组；无跳转目标。
 * @example createHomeBanners('shouye').length // 3
 * @example createHomeBanners('card') // []
 */
export function createHomeBanners(type: string) {
  return type === 'shouye'
    ? ['01', '02', '03'].map((name, index) => ({
        id: index + 1,
        picUrl: `/static/images/home/banner/${name}.jpeg`,
        title: `首页轮播 ${index + 1}`,
        type: 'shouye',
      }))
    : []
}
