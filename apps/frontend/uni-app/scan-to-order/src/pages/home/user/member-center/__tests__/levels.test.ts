import { expect, it, vi } from 'vitest'
import { levelApi } from '../composables/use-requests'

const mocks = vi.hoisted(() => ({ levels: vi.fn(), enabled: true }))
vi.mock('../api/level.api', () => ({ levelRequests: { levels: mocks.levels } }))
vi.mock('@/pages/account/assets/asset', () => ({ isAssetDemo: () => mocks.enabled }))

it('等级数据保留有效的零门槛，缺失字段留空，格式错误进入失败分支', async () => {
  mocks.levels
    .mockResolvedValueOnce([{ id: 1, name: '普通会员', rebate: null, upgradeAmount: 0 }])
    .mockResolvedValueOnce([{ id: 2, name: '银卡会员', rebate: '9.5' }])

  await expect(levelApi.levels()).resolves.toEqual([{ id: 1, name: '普通会员', upgradeAmount: 0 }])
  await expect(levelApi.levels()).rejects.toThrow('会员等级折扣或消费标准格式错误')

  mocks.enabled = false
  await expect(levelApi.levels()).resolves.toEqual([])
  expect(mocks.levels).toHaveBeenCalledTimes(2)
})
