/** 关于我们开发样本；只处理已登记的 about key，不伪造协议等页面。 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { endpoints } from '../api/endpoints'
import type { CmsPage } from '../models/types'

export default defineMock({
  [`[GET]${endpoints.cmsPage}`]: withFailure(({ query }) => {
    if (query.key !== 'about')
      return ok(null)
    const page: CmsPage = { info: {
      title: '关于我们',
      content: '<h3>欢迎来到扫码点餐</h3><p>从查看菜单、挑选餐品到提交订单，我们希望让每一次点餐都更轻松。</p><h3>用心服务每一餐</h3><p>您可以在个人中心查看订单、管理会员权益，并通过意见反馈告诉我们使用过程中遇到的问题。</p><h3>倾听您的建议</h3><p>如需订单协助，请通过下方客服入口联系我们。此处为开发示例，正式品牌介绍及联系方式由后台配置。</p>',
    } }
    return ok(page)
  }),
})
