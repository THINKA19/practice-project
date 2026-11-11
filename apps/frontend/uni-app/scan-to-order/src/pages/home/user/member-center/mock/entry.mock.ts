/** 等级公开演示样本，不代表真实会员权益。 */
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { endpoints } from '../api/endpoints'

export default defineMock({
  [`[GET]${endpoints.demoLevels}`]: withFailure(() => ok([
    { id: 1, name: '普通会员', rebate: 10, upgradeAmount: 0 },
    { id: 2, name: '银卡会员', rebate: 9.5, upgradeAmount: 500 },
    { id: 3, name: '金卡会员', rebate: 9, upgradeAmount: 2000 },
  ])),
})
