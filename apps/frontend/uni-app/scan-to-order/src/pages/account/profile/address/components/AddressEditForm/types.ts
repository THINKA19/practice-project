import type { AddressDraft } from '../../models/types'

export interface FormProps {
  saving?: boolean
  locating?: boolean
  draft: AddressDraft
}
export interface FormEvents {
  (event: 'input', field: 'linkMan' | 'mobile' | 'address' | 'phoneCountry' | 'countryCode' | 'regionText', value: string): void
  (event: 'save'): void
  (event: 'cancel'): void
}
