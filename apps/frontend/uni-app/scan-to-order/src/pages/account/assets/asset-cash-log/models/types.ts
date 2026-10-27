export interface CashLog {
  id: number
  amount: number
  balance?: number
  typeStr?: string
  remark?: string
  dateAdd: string
  behavior?: number
  [k: string]: unknown
}
