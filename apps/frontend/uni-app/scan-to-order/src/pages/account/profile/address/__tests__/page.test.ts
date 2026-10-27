import { effectScope, reactive } from 'vue'
import { useSessionAccountScope } from '@/pages/auth/session/composables/use-account-scope'
import { beforeEach, expect, it, vi } from 'vitest'
import { navigate } from '@/utils/project/navigation'
import { useAddressPage } from '../composables/use-page'
import { addressApi } from '../composables/use-requests'
import { confirm, showError, toast } from '@/utils/project/interaction'
import { requireIdentity } from '@/pages/auth/session'

const session = reactive({ sessionRevision: 0, hasLogin: true, identity: 'customer' })
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }))
vi.mock('@/pages/auth/session', () => ({
  useSessionAccountScope: (reset: () => void) => useSessionAccountScope(reset),
  useSessionState: () => session,
  getSessionRevision: () => session.sessionRevision,
  requireIdentity: vi.fn(() => true),
}))
vi.mock('../composables/use-requests', () => ({ addressApi: { add: vi.fn(), update: vi.fn(), remove: vi.fn(), list: vi.fn(), detail: vi.fn(), setDefault: vi.fn(), provinces: vi.fn(), children: vi.fn() } }))
vi.mock('@/utils/project/interaction', () => ({ back: vi.fn(), showError: vi.fn(), toast: vi.fn(), alert: vi.fn(), setTitle: vi.fn(), confirm: vi.fn(), withLoading: (action: () => Promise<unknown>) => action() }))

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(requireIdentity).mockReturnValue(true)
  vi.stubGlobal('getCurrentPages', () => [{}])
  vi.mocked(navigate).mockResolvedValue({ ok: true })
  vi.mocked(addressApi.list).mockResolvedValue([])
  session.sessionRevision++
})

it('未登录点击新增先引导登录，不打开地址表单；登录后才能填写', () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  vi.mocked(requireIdentity).mockReturnValue(false)
  page.addAddress()
  expect(requireIdentity).toHaveBeenCalledWith('customer')
  expect(page.addressEdit.value).toBe(false)
  expect(addressApi.add).not.toHaveBeenCalled()
  vi.mocked(requireIdentity).mockReturnValue(true)
  page.addAddress()
  expect(page.addressEdit.value).toBe(true)
  scope.stop()
})

it('未登录保存先引导登录，不提示表单校验错误也不提交地址', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  vi.mocked(requireIdentity).mockReturnValue(false)
  await page.bindSave()
  expect(requireIdentity).toHaveBeenCalledWith('customer')
  expect(toast).not.toHaveBeenCalled()
  expect(addressApi.add).not.toHaveBeenCalled()
  expect(addressApi.update).not.toHaveBeenCalled()
  scope.stop()
})

it('设置默认地址失败时保留页面，不把失败当作选择成功返回', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  vi.mocked(addressApi.setDefault).mockRejectedValue(new Error('保存失败'))
  await page.selectTap(7)
  expect(navigate).not.toHaveBeenCalled()
  expect(showError).toHaveBeenCalledOnce()
  expect(page.saving.value).toBe(false)
  scope.stop()
})

it('列表响应在换账户后返回时不能恢复旧账户地址', async () => {
  let finish!: (rows: Awaited<ReturnType<typeof addressApi.list>>) => void
  vi.mocked(addressApi.list).mockReturnValue(new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  const pending = page.refresh()
  session.sessionRevision++
  finish([{ id: 7, linkMan: '旧账户', mobile: '13800000000', address: '旧地址' }])
  await pending
  expect(page.addressList.value).toEqual([])
  expect(page.loaded.value).toBe(false)
  scope.stop()
})

vi.mock('@/pages/routes', () => ({ ClientRoutes: { Account: { my: '/pages/account/index/index' }, Home: { home: '/pages/home/index/index' } } }))
vi.mock('@/pages/auth/session/composables/use-state', () => ({ useSessionState: () => session }))
vi.mock('@/pages/auth/session/composables/use-actions', () => ({ getSessionRevision: () => session.sessionRevision }))

it('管理模式设置默认地址后更新标签并留在当前页面', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  page.addressList.value = [
    { id: 1, linkMan: '甲', mobile: '13800000000', address: '一号', isDefault: true },
    { id: 2, linkMan: '乙', mobile: '13800000001', address: '二号' },
  ]
  vi.mocked(addressApi.setDefault).mockResolvedValue(undefined)
  await page.selectTap(2)
  expect(navigate).not.toHaveBeenCalled()
  expect(page.addressList.value.map(item => item.isDefault)).toEqual([true, false])
  scope.stop()
})

it('结算选择模式设置默认地址成功后返回', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  vi.mocked(addressApi.setDefault).mockResolvedValue(undefined)
  await page.selectTap(2, true)
  expect(navigate).toHaveBeenCalledWith('/pages/home/index/index')
  scope.stop()
})

it('切换配送国家清空旧地区，重新选择同一国家保留地区', () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  page.setField('countryCode', 'VN')
  page.setField('regionText', '胡志明市')
  page.setField('countryCode', 'VN')
  expect(page.addressData.value.regionText).toBe('胡志明市')
  page.setField('countryCode', 'TH')
  expect(page.addressData.value.regionText).toBe('')
  scope.stop()
})

vi.mock('@/utils/project/navigation', () => ({ navigate: vi.fn() }))

it('编辑中返回列表，列表无上一页时回到首页', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  page.addAddress()
  await page.goBack()
  expect(page.addressEdit.value).toBe(false)
  expect(navigate).not.toHaveBeenCalled()
  await page.goBack()
  expect(navigate).toHaveBeenCalledWith('/pages/home/index/index')
  scope.stop()
})

it('有页面栈时返回上一页，返回失败再回首页', async () => {
  vi.stubGlobal('getCurrentPages', () => [{}, {}])
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  await page.goBack()
  expect(uni.navigateBack).toHaveBeenCalledWith(expect.objectContaining({ delta: 1 }))
  expect(navigate).not.toHaveBeenCalled()
  const options = vi.mocked(uni.navigateBack).mock.calls.at(-1)?.[0]
  options?.fail?.({ errMsg: 'navigateBack:fail' })
  await Promise.resolve()
  expect(navigate).toHaveBeenCalledWith('/pages/home/index/index')
  scope.stop()
})

it('当前默认地址不重复提交，结算选择当前默认地址直接返回', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  page.addressList.value = [{ id: 7, linkMan: '顾客', mobile: '+84912345678', address: '测试地址', isDefault: true }]
  await page.selectTap(7, false)
  expect(addressApi.setDefault).not.toHaveBeenCalled()
  expect(navigate).not.toHaveBeenCalled()
  await page.selectTap(7, true)
  expect(addressApi.setDefault).not.toHaveBeenCalled()
  expect(navigate).toHaveBeenCalledOnce()
  scope.stop()
})

it('完整表单保存国际手机号及国家地区，第二条地址不抢占默认地址', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  page.addressList.value = [{ id: 1, linkMan: '原地址', mobile: '+84912345678', address: '旧地址', isDefault: true }]
  page.addAddress()
  page.setField('linkMan', '新联系人')
  page.setField('mobile', '0912345678')
  page.setField('countryCode', 'VN')
  page.setField('regionText', '胡志明市')
  page.setField('address', '街道1号')
  await page.bindSave()
  expect(toast).not.toHaveBeenCalled()
  expect(addressApi.add).toHaveBeenCalledWith(expect.objectContaining({ countryCode: 'VN', regionText: '胡志明市', mobile: '+84912345678', isDefault: false }))
  expect(page.addressEdit.value).toBe(false)
  scope.stop()
})

it('删除确认期间阻止重复点击，取消确认后解除锁定', async () => {
  let finish!: (value: boolean) => void
  vi.mocked(confirm).mockReturnValueOnce(new Promise((resolve) => {
    finish = resolve
  }))
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  const pending = page.deleteAddress(7)
  await page.deleteAddress(7)
  expect(confirm).toHaveBeenCalledOnce()
  expect(page.saving.value).toBe(true)
  finish(false)
  await pending
  expect(page.saving.value).toBe(false)
  expect(addressApi.remove).not.toHaveBeenCalled()
  scope.stop()
})

it('编辑默认地址保留默认标记，保存失败保留表单输入', async () => {
  vi.mocked(addressApi.detail).mockResolvedValue({ info: { id: 7, linkMan: '顾客', mobile: '+84912345678', phoneCountry: 'VN', countryCode: 'VN', regionText: '胡志明市', address: '旧街道', isDefault: true } })
  vi.mocked(addressApi.update).mockRejectedValueOnce(new Error('保存失败'))
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  await page.editAddress(7)
  page.setField('address', '新街道')
  await page.bindSave()
  expect(addressApi.update).toHaveBeenCalledWith(expect.objectContaining({ id: 7, address: '新街道', isDefault: true }))
  expect(page.addressEdit.value).toBe(true)
  expect(page.addressData.value.address).toBe('新街道')
  expect(page.saving.value).toBe(false)
  scope.stop()
})

it('第三条设为默认后置顶，原默认第二位，其余相对顺序保持', async () => {
  const scope = effectScope()
  const page = scope.run(useAddressPage)!
  page.addressList.value = [1, 2, 3, 4].map(id => ({ id, linkMan: '顾客', mobile: '+84912345678', address: '街道', isDefault: id === 1 }))
  vi.mocked(addressApi.setDefault).mockResolvedValue(undefined)
  await page.selectTap(3)
  expect(page.addressList.value.map(row => row.id)).toEqual([3, 1, 2, 4])
  expect(page.addressList.value.filter(row => row.isDefault).map(row => row.id)).toEqual([3])
  vi.mocked(addressApi.list).mockResolvedValue([1, 2, 3, 4].map(id => ({ id, linkMan: '顾客', mobile: '+84912345678', address: '街道', isDefault: id === 3 })))
  await page.refresh()
  expect(page.addressList.value.map(row => row.id)).toEqual([3, 1, 2, 4])
  scope.stop()
})
