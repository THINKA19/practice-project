# 买单演示契约

GET /__mock/account/bill-pay/rules 返回 {id, consume, discounts} 数组，金额单位元。
POST /__mock/account/bill-pay/pay 接收 amountCents（正整数分）、requestId（幂等键），返回 amountCents、discountCents、payableCents、demo=true。

模拟服务独立重算优惠，要求顾客演示凭证，按账户与请求键隔离；重复请求同金额返回相同结果，不同金额拒绝。无需或不维护真实数据库，不改钱包资产。

历史 TODO /payBill、/payBill/discounts 尚未验证，不作为真实支付契约接入。生产支付禁用，待后端提供门店与权限、试算、订单、支付凭证与支付结果查询。
