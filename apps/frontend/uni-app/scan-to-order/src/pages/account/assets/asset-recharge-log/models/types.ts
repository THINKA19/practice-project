export interface PayLog {
  id: number
  money: number
  remark?: string
  status: number
  statusStr?: string
  dateAdd: string
  nextAction?: string
  payGateStr?: string
  dateUpdate?: string
  [k: string]: unknown
}
