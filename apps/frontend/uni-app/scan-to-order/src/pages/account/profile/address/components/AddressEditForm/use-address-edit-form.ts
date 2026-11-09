import { computed, ref } from 'vue'
import { DELIVERY_COUNTRIES } from '../../models/enums'
import { deliveryRegions } from '../../domain/address.rules'
import type { FormEvents, FormProps } from './types'

/** 地址表单只拥有配送国家和地区选择，电话交互由 phone-input 持有。 */
export function useForm(props: Readonly<FormProps>, emit: FormEvents) {
  const sheet = ref<'region' | 'area' | ''>('')
  const countryName = computed(() => DELIVERY_COUNTRIES.find(item => item.code === props.draft.countryCode)?.name)
  const options = computed(() => sheet.value === 'area'
    ? deliveryRegions(props.draft.countryCode).map(name => ({ code: name, name }))
    : DELIVERY_COUNTRIES)
  function choose(code: string) {
    emit('input', sheet.value === 'area' ? 'regionText' : 'countryCode', code)
    sheet.value = ''
  }
  return { sheet, countryName, options, choose }
}
