import { computed, ref, watch } from 'vue'
import { internationalPhone, PHONE_COUNTRIES } from '@/utils/project/phone'
import type { PhoneInputEmits, PhoneInputProps } from './types'

/** 管理单个电话输入实例的区号、输入同步和校验时机，不持有地址、账户或订单状态。 */
export function usePhoneInput(props: Readonly<PhoneInputProps>, emit: PhoneInputEmits) {
  const value = ref(props.modelValue)
  const open = ref(false)
  const editing = ref(false)
  const touched = ref(false)
  const attempted = ref(false)
  const countryInfo = computed(() => PHONE_COUNTRIES.find(item => item.code === (props.country ?? 'VN')))
  const invalid = computed(() => value.value.trim() ? !internationalPhone(value.value, props.country) : props.required)
  const countryLabel = computed(() => countryInfo.value ? `${countryInfo.value.name} +${countryInfo.value.dial}` : '选择区号')
  const error = computed(() => !editing.value && touched.value && (Boolean(value.value.trim()) || attempted.value) && invalid.value)
  watch(() => props.modelValue, (next) => {
    value.value = next
    if (!next.trim()) {
      touched.value = false
      attempted.value = false
    }
  })
  watch(() => props.country, () => {
    editing.value = false
    touched.value = Boolean(value.value.trim())
  })
  watch(() => props.disabled, (disabled) => {
    if (disabled)
      open.value = false
  })
  function inputPhone(next: string) {
    if (props.disabled)
      return
    value.value = next
    if (!next.trim()) {
      touched.value = false
      attempted.value = false
    }
    emit('update:modelValue', next)
  }
  function blur(next?: string) {
    if (props.disabled)
      return
    if (typeof next === 'string')
      inputPhone(next)
    editing.value = false
    touched.value = Boolean(value.value.trim())
  }
  function clear() {
    inputPhone('')
    editing.value = false
  }
  function choose(country: string) {
    if (props.disabled)
      return
    emit('update:country', country)
    open.value = false
  }
  /** 表单提交前校验；选填空值通过，非空号码必须合法。 */
  function validate() {
    editing.value = false
    touched.value = true
    attempted.value = true
    return !invalid.value
  }
  function openPicker() {
    if (!props.disabled)
      open.value = true
  }
  function closePicker() {
    open.value = false
  }
  function focus() {
    if (!props.disabled)
      editing.value = true
  }
  const errorMessage = computed(() => error.value ? (value.value.trim() ? '请输入与所选区号匹配的手机号' : '请输入手机号') : '')
  return { value, open, countryLabel, errorMessage, inputPhone, focus, blur, clear, openPicker, closePicker, choose, validate, countries: PHONE_COUNTRIES }
}
