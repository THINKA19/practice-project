export interface ScoreLog {
  id: number
  score: number
  typeStr?: string
  remark?: string
  dateAdd: string
  [k: string]: unknown
}
