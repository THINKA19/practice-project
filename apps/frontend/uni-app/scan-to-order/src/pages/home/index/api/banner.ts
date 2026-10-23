/**
 * ============================================================================
 * 首页轮播接口
 * 【文件概述】通过项目现有 Alova 查询轮播；服务地址和认证遵循脚手架。
 * 【方法与导出清单】bannerApi.banners：按类型读取轮播列表。
 * 【综合使用示例】
 * import { bannerApi } from '@/pages/home/index'
 * const banners = await bannerApi.banners('shouye') // 后端成功时返回轮播列表
 * ============================================================================
 */
import type { Banner } from '../models/banner'
import { http } from '@/http/alova'
import { endpoints } from './endpoints'

export const bannerApi = {
  /**
   * 查询指定类型的轮播，校验展示必需字段。
   * @param type 轮播类型，首页为 shouye。
   * @returns Promise<Banner[]>，空数据返回空数组，请求失败抛出供页面降级。
   * @example await bannerApi.banners('shouye') // 返回可展示图片的列表，真实服务待联调
   */
  async banners(type: string): Promise<Banner[]> {
    const data = await http.Get<Banner[] | null>(endpoints.banners, {
      params: { type },
      meta: { ignoreAuth: true, toast: false },
    }).send()
    return Array.isArray(data) ? data.filter(item => item && typeof item.picUrl === 'string' && item.picUrl.trim()) : []
  },
}
