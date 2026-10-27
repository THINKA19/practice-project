/** 扫码核销页面拥有的展示模型和纯业务规则。 */
export interface VerificationGoods {
  id: string | number
  goodsName: string
  number: number
}

export interface VerificationOrder {
  status: number
  preparing: boolean
  amountReal: number
  goods: VerificationGoods[]
}
