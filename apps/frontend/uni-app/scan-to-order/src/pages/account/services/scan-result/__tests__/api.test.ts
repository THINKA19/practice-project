import { beforeEach, expect, it, vi } from 'vitest'
import { verificationApi } from '../adapters/verification.adapter'

const mocks = vi.hoisted(() => ({ detail: vi.fn(), verify: vi.fn() }))
vi.mock('@/pages/pickup1/scan', () => ({ scanApi: mocks }))
beforeEach(() => {
  mocks.detail.mockReset()
  mocks.verify.mockReset()
})
it('通过订单公开能力查询并转换页面模型', async () => {
  mocks.detail.mockResolvedValue({ orderInfo: { status: 1, amountReal: 12 }, goods: [] })
  expect(await verificationApi.detail('CODE')).toEqual({ status: 1, amountReal: 12, preparing: false, goods: [] })
  expect(mocks.detail).toHaveBeenCalledWith('CODE')
})
it('响应无效或请求失败时不能进入成功状态', async () => {
  mocks.detail.mockResolvedValue(undefined)
  await expect(verificationApi.detail('CODE')).rejects.toThrow()
  mocks.verify.mockResolvedValue(undefined)
  await expect(verificationApi.confirm('CODE')).rejects.toThrow()
  mocks.verify.mockRejectedValue(new Error('无权核销'))
  await expect(verificationApi.confirm('CODE')).rejects.toThrow('无权核销')
  mocks.verify.mockResolvedValue(null)
  await expect(verificationApi.confirm('CODE')).resolves.toBeUndefined()
})
