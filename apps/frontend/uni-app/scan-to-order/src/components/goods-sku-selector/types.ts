export interface SkuChoice {
  id: number
  name: string
  active: boolean
  disabled?: boolean
  priceText?: string
}
export interface SkuGroup {
  id: number
  name: string
  choices: SkuChoice[]
  required?: boolean
}
