export interface SkuChoice {
  id: number
  name: string
  active: boolean
  disabled?: boolean
  price?: number
  isSurcharge?: boolean
}
export interface SkuGroup {
  id: number
  name: string
  choices: SkuChoice[]
  required?: boolean
}
