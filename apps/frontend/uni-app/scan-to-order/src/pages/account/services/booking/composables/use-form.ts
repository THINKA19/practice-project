/**
 * 在线订座 ViewModel
 * 来源：bee-master/pages/booking/index.js
 *   onLoad(formatter)、onShow(登录校验)、selectPeople、submit、showDatetimePop、closeTime、confirm、filter
 */
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BOOKING_PERSON_OPTIONS } from '../models/enums'
import { checkBookingDraft, nextBookingTime } from '../domain/booking.rules'
import { isAccepted } from '../models/mappers'
import { bookingApi } from './use-requests'
import { submitBooking } from './use-actions'
import dayjs from 'dayjs'
import { useSessionState } from '@/pages/auth/session'
import { toLoginPage } from '@/utils/toLoginPage'
import { toast } from '@/utils/project/feedback'

/** 维护订座活动、人数与时间草稿；服务端未确认结果时阻止重复提交，换号清空个人输入。 */
export function useBookingForm() {
  const { t, locale } = useI18n()
  const session = useSessionState()
  const reservationId = ref('')
  let disposed = false
  let revision = 0
  onScopeDispose(() => {
    disposed = true
    revision++
  })
  const configLoading = ref(false)
  const configFailed = ref(false)
  const pending = ref(false)
  async function load() {
    if (disposed || configLoading.value)
      return
    configLoading.value = true
    configFailed.value = false
    try {
      const info = await bookingApi.info()
      if (!disposed) {
        reservationId.value = typeof info?.id === 'string' ? info.id.trim() : ''
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
  onLoad((query) => {
    reservationId.value = typeof query?.yuyueId === 'string' ? query.yuyueId.trim() : ''
    if (!reservationId.value)
      void load()
  })

  const name = ref('')
  const mobile = ref('')
  const time = ref('')
  const personIndex = ref(0)
  const showDatetimePop = ref(false)
  const minDate = ref(Date.now())
  const currentDate = ref<number>(nextBookingTime(minDate.value))
  const submitting = ref(false)
  watch(() => session.sessionRevision, () => {
    revision++
    submitting.value = false
    pending.value = false
    personIndex.value = 0
    name.value = ''
    mobile.value = ''
    time.value = ''
    showDatetimePop.value = false
  }, { flush: 'sync' })

  /** 人数选项按语言展示（原 persionNum[language]） */
  const personOptions = computed<readonly string[]>(() =>
    String(locale.value).startsWith('en') ? BOOKING_PERSON_OPTIONS.en : String(locale.value).startsWith('vi') ? BOOKING_PERSON_OPTIONS.vi : BOOKING_PERSON_OPTIONS.zh,
  )

  function init() {
    uni.setNavigationBarTitle({ title: t('booking.title') })
  }

  /** 每次显示同步标题，提交动作再进行身份校验。 */
  async function refresh() {
    init()
  }

  function selectPeople(idx: number) {
    personIndex.value = idx
  }

  /** 分钟只保留 10 的整数倍 */
  function filter(column: { type: string, values: number[] }) {
    if (column.type === 'minute') {
      return column.values.filter(v => v % 10 === 0)
    }
    return column.values
  }

  function formatter(type: string, value: string | number) {
    switch (type) {
      case 'year':
        return `${value}${t('date.year')}`
      case 'month':
        return `${value}${t('date.month')}`
      case 'date':
        return `${value}${t('date.day')}`
      case 'hour':
        return `${value}${t('date.hour')}`
      case 'minute':
        return `${value}${t('date.minutes')}`
      default:
        return `${value}`
    }
  }

  function openTime() {
    minDate.value = Date.now()
    currentDate.value = Math.max(currentDate.value, nextBookingTime(minDate.value))
    showDatetimePop.value = true
  }

  function closeTime() {
    showDatetimePop.value = false
  }

  function confirm(value: number | string) {
    time.value = dayjs(Number(value)).format('YYYY-MM-DD HH:mm')
    closeTime()
  }

  async function submit(): Promise<void> {
    session.updateNowTime()
    if (disposed || submitting.value || pending.value) {
      return
    }
    if (!session.hasLogin || session.identity !== 'customer') {
      toast(t('demoFlow.signIn'))
      toLoginPage()
      return
    }
    const draft = { name: name.value, mobile: mobile.value, time: time.value, personIndex: personIndex.value }
    const err = checkBookingDraft(draft)
    if (err) {
      toast(t(err))
      return
    }
    if (configLoading.value || configFailed.value || !reservationId.value) {
      toast('缺少预约活动配置，请联系门店')
      return
    }
    const request = revision
    submitting.value = true
    try {
      const result = await submitBooking(reservationId.value, draft)
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
    configLoading,
    configFailed,
    pending,
    submitting,
    load,
    name,
    mobile,
    time,
    personIndex,
    personOptions,
    showDatetimePop,
    currentDate,
    minDate,
    init,
    refresh,
    selectPeople,
    filter,
    formatter,
    openTime,
    closeTime,
    confirm,
    submit,
  }
}
