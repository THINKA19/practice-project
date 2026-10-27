/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 按 key 查询 CMS 单页；common 网关。 */
  cmsPage: '/cms/page/info/v2',
} as const
