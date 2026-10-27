import { beforeEach, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createApp, nextTick } from 'vue'
import { cancelPrivacyConsent, canUseCustomerData, enablePrivacyConsent, ensurePrivacyConsent, finishPrivacyConsent, setPrivacyChoice, useAgreementPrivacyConsent } from '../composables/use-privacy-consent'
import { PRIVACY_VERSION } from '../models/enums'

beforeEach(() => {
  cancelPrivacyConsent()
  setActivePinia(createPinia())
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/home/index/index' }] as ReturnType<typeof getCurrentPages>)
  enablePrivacyConsent()
})

it('首次及主动请求合并成底部弹窗，不跳页面', async () => {
  const first = ensurePrivacyConsent(true)
  const second = ensurePrivacyConsent()
  expect(useAgreementPrivacyConsent().requested.value).toBe(true)
  expect(uni.navigateTo).not.toHaveBeenCalled()
  finishPrivacyConsent(false)
  expect(await first).toBe(false)
  expect(await second).toBe(false)
})

it('明确拒绝后不重复自动提示，主动重试可以接受', async () => {
  setPrivacyChoice(false)
  expect(await ensurePrivacyConsent(true)).toBe(false)
  expect(useAgreementPrivacyConsent().requested.value).toBe(false)
  const task = ensurePrivacyConsent()
  finishPrivacyConsent(true)
  expect(await task).toBe(true)
  expect(canUseCustomerData()).toBe(true)
})

it('未选择便结束等待，下次进入仍提示', async () => {
  const first = ensurePrivacyConsent(true)
  cancelPrivacyConsent()
  expect(await first).toBe(false)
  expect(canUseCustomerData()).toBe(false)
  const second = ensurePrivacyConsent(true)
  expect(useAgreementPrivacyConsent().requested.value).toBe(true)
  finishPrivacyConsent(false)
  await second
})

it('全文阅读页不被自动弹窗遮挡', async () => {
  vi.mocked(getCurrentPages).mockReturnValue([{ route: 'pages/auth/agreement/privacy' }] as ReturnType<typeof getCurrentPages>)
  expect(await ensurePrivacyConsent(true)).toBe(false)
  expect(useAgreementPrivacyConsent().requested.value).toBe(false)
})

function installPersistence(storage: { getItem: () => string | null, setItem: (key: string, value: string) => void }) {
  const pinia = createPinia()
  pinia.use(createPersistedState({ storage }))
  createApp({}).use(pinia)
  setActivePinia(pinia)
  enablePrivacyConsent()
}

it('真实持久化重建：没有点按钮便刷新，不能保存成拒绝', async () => {
  let saved: string | null = null
  const storage = {
    getItem: () => saved,
    setItem: (_key: string, value: string) => {
      saved = value
    },
  }
  installPersistence(storage)
  const first = ensurePrivacyConsent(true)
  await nextTick()
  expect(saved ? JSON.parse(saved).record : null).toBeNull()
  cancelPrivacyConsent()
  await first
  installPersistence(storage)
  const second = ensurePrivacyConsent(true)
  expect(useAgreementPrivacyConsent().requested.value).toBe(true)
  finishPrivacyConsent(false)
  await second
  await nextTick()
  installPersistence(storage)
  expect(await ensurePrivacyConsent(true)).toBe(false)
  expect(useAgreementPrivacyConsent().requested.value).toBe(false)
})

it.each([
  { version: PRIVACY_VERSION, choice: 'accepted' },
  { version: 'old-version', choice: 'accepted' },
  { version: PRIVACY_VERSION, choice: 'rejected', explicit: true },
  { version: PRIVACY_VERSION, choice: 'rejected' },
])('恢复记录 %j：旧版模糊拒绝重新提示', async (record) => {
  installPersistence({ getItem: () => JSON.stringify({ record }), setItem: vi.fn() })
  const accepted = record.version === PRIVACY_VERSION && record.choice === 'accepted'
  const rejected = record.version === PRIVACY_VERSION && record.choice === 'rejected' && record.explicit === true
  expect(canUseCustomerData()).toBe(accepted)
  const task = ensurePrivacyConsent(true)
  expect(useAgreementPrivacyConsent().requested.value).toBe(!accepted && !rejected)
  if (!accepted && !rejected)
    finishPrivacyConsent(false)
  await task
})
