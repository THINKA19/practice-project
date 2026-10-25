/**
 * 在线订座 ViewModel
 * 来源：bee-master/pages/booking/index.js
 *   onLoad(formatter)、onShow(登录校验)、changePersionNum、submit、showDatetimePop、hideDatetimePop、confirm、filter
 */
import { useI18n } from 'vue-i18n'
import { BOOKING_PERSON_OPTIONS, checkBookingDraft, nextBookingTime } from '../models/booking'
import { bookingApi } from '../api/booking'
import { submitBooking } from './booking'
import dayjs from 'dayjs'
import { useSession } from '@/pages/auth/session'
import { toLoginPage } from '@/utils/toLoginPage'
import { toast } from '@/utils/project/feedback'

export function useBookingPage() {
  const { t, locale } = useI18n()
  const session = useSession()
  const reservationId = ref('')
  onLoad(async (query) => {
    reservationId.value = typeof query?.yuyueId === 'string' ? query.yuyueId.trim() : ''
    if (!reservationId.value) {
      try {
        reservationId.value = (await bookingApi.info()).id
      }
      catch { /* 请求层展示错误。 */ }
    }
  })

  const name = ref('')
  const mobile = ref('')
  const time = ref('')
  const personIndex = ref(0)
  const showDatetimePop = ref(false)
  const minDate = Date.now()
  const currentDate = ref<number>(nextBookingTime(minDate))
  const submitting = ref(false)

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

  function changePersionNum(idx: number) {
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

  function openDatetimePop() {
    showDatetimePop.value = true
  }

  function hideDatetimePop() {
    showDatetimePop.value = false
  }

  function confirm(value: number | string) {
    time.value = dayjs(Number(value)).format('YYYY-MM-DD HH:mm')
    hideDatetimePop()
  }

  async function submit(): Promise<void> {
    if (submitting.value) {
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
    if (!reservationId.value) {
      toast('缺少预约活动配置，请联系门店')
      return
    }
    submitting.value = true
    try {
      await submitBooking(reservationId.value, draft)
      toast(t('common.submitSuccess'))
      uni.navigateBack()
    }
    catch { /* 请求层展示失败信息。 */ }
    finally {
      submitting.value = false
    }
  }

  return {
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
    changePersionNum,
    filter,
    formatter,
    openDatetimePop,
    hideDatetimePop,
    confirm,
    submit,
  }
}
