import { computed, ref, watch } from 'vue'
import { DELIVERY_COUNTRIES, PHONE_COUNTRIES } from '../../models/enums'
import { deliveryRegions, internationalPhone } from '../../domain/address.rules'
import type { FormEvents, FormProps } from './types'

/** Owns only this form instance's field and picker interactions. */
export function useForm(props: Readonly<FormProps>, emit: FormEvents) {
  const sheet = ref<'phone' | 'region' | 'area' | ''>('')
  const phoneValue = ref(props.draft.mobile)
  const phoneTouched = ref(false)
  const phoneEditing = ref(false)
  const submitAttempted = ref(false)
  const phoneError = computed(() => !phoneEditing.value && phoneTouched.value
    && (Boolean(phoneValue.value.trim()) || submitAttempted.value)
    && !internationalPhone(phoneValue.value, props.draft.phoneCountry))
  watch(() => props.draft.mobile, (value) => {
    phoneValue.value = value
    if (!value.trim()) {
      phoneTouched.value = false
      submitAttempted.value = false
    }
  })
  watch(() => props.draft.phoneCountry, () => {
    phoneEditing.value = false
    phoneTouched.value = Boolean(phoneValue.value.trim())
  })
  function inputPhone(value: string) {
    phoneValue.value = value
    if (!value.trim()) {
      phoneTouched.value = false
      submitAttempted.value = false
    }
    emit('input', 'mobile', value)
  }
  function blurPhone(event: { detail?: { value?: string } }) {
    if (typeof event.detail?.value === 'string')
      inputPhone(event.detail.value)
    phoneEditing.value = false
    phoneTouched.value = Boolean(phoneValue.value.trim())
  }
  function save() {
    phoneEditing.value = false
    phoneTouched.value = true
    submitAttempted.value = true
    if (!phoneError.value)
      emit('save')
  }
  const phoneCountry = computed(() => PHONE_COUNTRIES.find(item => item.code === props.draft.phoneCountry) || PHONE_COUNTRIES[1])
  const countryName = computed(() => DELIVERY_COUNTRIES.find(item => item.code === props.draft.countryCode)?.name)
  const options = computed(() => {
    if (sheet.value === 'area')
      return deliveryRegions(props.draft.countryCode).map(name => ({ code: name, name }))
    if (sheet.value === 'phone')
      return PHONE_COUNTRIES.map(country => ({ code: country.code, name: `${country.name} +${country.dial}` }))
    return DELIVERY_COUNTRIES
  })
  function choose(code: string) {
    emit('input', sheet.value === 'phone' ? 'phoneCountry' : sheet.value === 'area' ? 'regionText' : 'countryCode', code)
    sheet.value = ''
  }

  return { sheet, phoneValue, phoneEditing, phoneError, inputPhone, blurPhone, save, phoneCountry, countryName, options, choose }
}
