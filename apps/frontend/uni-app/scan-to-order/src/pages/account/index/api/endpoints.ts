/** 后端路径清单；网关由接口函数显式选择。 */
export const endpoints = {
  /** 开发资产摘要，非正式后端契约。 */
  assets: '/__mock/account/assets',
  /** 提交留言及扩展信息；common 网关。 */
  addComment: '/comment/add',
} as const
