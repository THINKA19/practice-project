export interface PhoneInputProps {
  modelValue: string
  country?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}

export interface PhoneInputEmits {
  (event: 'update:modelValue', value: string): void
  (event: 'update:country', value: string): void
}

export interface PhoneInputHandle {
  validate: () => boolean
}
