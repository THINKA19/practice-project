import { beforeEach, expect, it, vi } from 'vitest'
import { kanjiaApi } from '../../menu-goods-details/api/kanjia.api'
import { pingtuanApi } from '../api/pingtuan.api'
import { http } from '@/http/alova'

beforeEach(() => {
  vi.restoreAllMocks()
})
it('goods 接口端点与参数保持一致', async () => {
  const post = vi.spyOn(http, 'Post').mockResolvedValue({ id: 1 })

  await pingtuanApi.open(4)

  expect(post).toHaveBeenLastCalledWith('/shop/goods/pingtuan/open', { goodsId: 4, extJsonStr: '' }, { cacheFor: 0 })

  await kanjiaApi.help(5, 6)

  expect(post).toHaveBeenLastCalledWith('/shop/goods/kanjia/help', { kjid: 5, joinerUser: 6, remark: '' })
})
