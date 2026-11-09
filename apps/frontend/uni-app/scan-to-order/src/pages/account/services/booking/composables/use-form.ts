/**
 * 在线订座 ViewModel
 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BOOKING_PERSON_OPTIONS } from '../models/enums'
import { checkBookingDraft, isBookingSlot } from '../domain/booking.rules'
import { isAccepted } from '../models/mappers'
import { bookingApi } from './use-requests'
import { submitBooking } from './use-actions'
import { useSessionState } from '@/pages/auth/session'
import { toLoginPage } from '@/utils/toLoginPage'
import { ClientRoutes } from '@/pages/routes'
import { toast } from '@/utils/project/feedback'

function readShopField(value: unknown): string {
  if (typeof value !== 'string')
    return ''
  try {
    return decodeURIComponent(value).trim()
  }
  catch {
    return value.trim()
  }
}

/** 维护订座活动、人数与时间草稿；服务端未确认结果时阻止重复提交，换号清空个人输入。 */
export function useBookingForm() {
  const { t, locale } = useI18n()
  const session = useSessionState()
  const reservationId = ref('')
  const shopId = ref(0)
  const shopName = ref('')
  const shopAddress = ref('')
  const shopPic = ref('')
  const slots = ref<string[]>([])
  const configLoading = ref(false)
  const submitting = ref(false)
  const time = ref('')
  function chooseShop() {
    if (configLoading.value || submitting.value)
      return
    uni.navigateTo({
      url: `${ClientRoutes.Account.bookingShops}?change=1&shopId=${shopId.value}`,
      events: { bookingShopSelected: (id: number, name: string, address = '', pic = '') => selectShop(id, name, address, pic) },
    })
  }
  let disposed = false
  let revision = 0
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  const configFailed = ref(false)
  const pending = ref(false)
  async function load() {
    if (disposed || configLoading.value || !shopId.value)
      return
    configLoading.value = true
    configFailed.value = false
    try {
      const info = await bookingApi.info(shopId.value)
      if (!disposed) {
        reservationId.value = typeof info?.id === 'string' ? info.id.trim() : ''
        if (!shopName.value)
          shopName.value = info?.shopName || ''
        const now = Date.now()
        slots.value = Array.isArray(info?.slots)
          ? [...new Set(info.slots.filter(slot => typeof slot === 'string' && isBookingSlot(slot, now)))].sort()
          : []
        if (!slots.value.includes(time.value))
          time.value = ''
        configFailed.value = !reservationId.value
      }
    }
    catch {
      if (!disposed)
        configFailed.value = true
    }
    finally {
      if (!disposed)
        configLoading.value = false
    }
  }
  function selectShop(id: number, name: string, address: string, pic: string, keepTime = false) {
    if (!Number.isSafeInteger(id) || id <= 0 || id === shopId.value)
      return
    shopId.value = id
    shopName.value = name.trim()
    shopAddress.value = address.trim()
    shopPic.value = pic.trim()
    reservationId.value = ''
    slots.value = []
    if (!keepTime)
      time.value = ''
    pending.value = false
    void load()
  }
  const name = ref('')
  const mobile = ref('')
  const phoneCountry = ref('VN')
  const personIndex = ref(0)
  onLoad((query) => {
    if (typeof query?.time === 'string')
      time.value = query.time
    selectShop(Number(query?.shopId), readShopField(query?.shopName), readShopField(query?.shopAddress), readShopField(query?.shopPic), true)
  })
  watch(() => session.sessionRevision, () => {
    revision++
    submitting.value = false
    pending.value = false
    personIndex.value = 0
    name.value = ''
    mobile.value = ''
    phoneCountry.value = 'VN'
    time.value = ''
  }, { flush: 'sync' })

  /** 人数选项按语言展示（原 persionNum[language]） */
  const personOptions = computed<readonly string[]>(() =>
    String(locale.value).startsWith('en') ? BOOKING_PERSON_OPTIONS.en : String(locale.value).startsWith('vi') ? BOOKING_PERSON_OPTIONS.vi : BOOKING_PERSON_OPTIONS.zh,
  )

  function init() {
    uni.setNavigationBarTitle({ title: t('booking.title') })
  }

  /** 每次显示同步标题，提交动作再进行身份校验。 */
  function refresh() {
    init()
    if (shopId.value && !pending.value && !submitting.value)
      void load()
  }

  function selectPeople(idx: number) {
    personIndex.value = idx
  }

  const canBook = computed(() => session.hasLogin && session.identity === 'customer')

  function login() {
    toast('请先登录后预约')
    const redirect = `${ClientRoutes.Account.booking}?shopId=${shopId.value}&shopName=${encodeURIComponent(shopName.value)}&shopAddress=${encodeURIComponent(shopAddress.value)}&shopPic=${encodeURIComponent(shopPic.value)}&time=${encodeURIComponent(time.value)}`
    toLoginPage({ queryString: `?redirect=${encodeURIComponent(redirect)}` })
  }

  async function submit(): Promise<void> {
    session.updateNowTime()
    if (disposed || submitting.value || pending.value) {
      return
    }
    if (!shopId.value) {
      chooseShop()
      return
    }
    if (!session.hasLogin || session.identity !== 'customer') {
      login()
      return
    }
    const draft = { name: name.value, mobile: mobile.value, phoneCountry: phoneCountry.value, time: time.value, personIndex: personIndex.value }
    const err = checkBookingDraft(draft)
    if (err) {
      toast(t(err))
      return
    }
    if (configLoading.value || configFailed.value || !reservationId.value) {
      toast('缺少预约活动配置，请联系门店')
      return
    }
    if (!slots.value.includes(draft.time)) {
      toast('请选择门店提供的可预约时段')
      return
    }
    const requestId = `booking-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const request = revision
    submitting.value = true
    try {
      const result = await submitBooking(shopId.value, reservationId.value, draft, requestId)
      if (disposed || request !== revision)
        return
      if (!isAccepted(result)) {
        pending.value = true
        toast('预约结果未确认，请联系门店核对，勿重复提交')
        return
      }
      pending.value = true
      toast('预约申请已接收，是否订座成功请以门店确认为准')
      uni.navigateBack()
    }
    catch {
      if (!disposed && request === revision) {
        pending.value = true
        toast('预约结果未确认，请联系门店核对，勿重复提交')
      }
    }
    finally {
      if (!disposed && request === revision)
        submitting.value = false
    }
  }

  return {
    shopId,
    shopName,
    shopAddress,
    shopPic,
    slots,
    chooseShop,
    canBook,
    login,
    configLoading,
    configFailed,
    pending,
    submitting,
    load,
    name,
    mobile,
    phoneCountry,
    time,
    personIndex,
    personOptions,
    init,
    refresh,
    selectPeople,
    submit,
  }
}
