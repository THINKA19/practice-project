import { slicePage as demoPage } from '@/utils/project/paged-response'
import { defineMock } from '@alova/mock'
import { ok } from '@/mock/response'
import { withFailure } from '@/mock/scenario'
import { assetDemoOwner, walletDemo } from '../../asset/mock'
import { endpoints } from '../api/endpoints'

// 与钱包共用账户账本，充值后两个流水页面读取同一笔交易。
export default defineMock({
  [`[POST]${endpoints.demoLogs}`]: withFailure(({ headers, data }) =>
    ok(demoPage(walletDemo(assetDemoOwner(headers.Authorization)).cash, data))),
})
