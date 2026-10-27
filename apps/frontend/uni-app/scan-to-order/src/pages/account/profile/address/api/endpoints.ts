/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 查询列表；common 网关。 */
  list: '/user/shipping-address/list/v2',
  /** 查询详情；common 网关。 */
  detail: '/user/shipping-address/detail/v2',
  /** 查询默认地址；common 网关。 */
  defaultAddress: '/user/shipping-address/default/v2',
  /** 新增记录；common 网关。 */
  add: '/user/shipping-address/add',
  /** 更新记录；common 网关。 */
  update: '/user/shipping-address/update',
  /** 删除记录；common 网关。 */
  remove: '/user/shipping-address/delete',
  /** 查询省份；common 网关。 */
  provinces: '/region/province',
  /** 按父级查询行政区；common 网关。 */
  children: '/region/child',
} as const
