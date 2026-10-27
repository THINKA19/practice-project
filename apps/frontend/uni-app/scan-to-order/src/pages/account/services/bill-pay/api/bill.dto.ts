/** 请求与响应的原始契约；展示模型与纯规则在 models/、domain/ 维护。 */

/** 金额按分计算；优惠试算不修改规则列表。 */
export interface PayBillDiscountDto { id: string | number, consume: number, discounts: number }
