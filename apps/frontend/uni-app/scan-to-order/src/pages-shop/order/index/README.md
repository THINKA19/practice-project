# 商家订单中心

页面读取 `GET /operator/shop/orders/summary?shopId=<shopId>`，通过 Authorization 请求头传递当前会话。响应数据示例：

```json
{
  "shopId": "A",
  "items": [
    { "category": "dine-in", "status": "awaitingAcceptance", "count": 3 },
    { "category": "delivery", "status": "awaitingAcceptance", "count": 0 },
    { "category": "pickup", "status": "awaitingVerification", "count": 2 },
    { "category": "booking", "status": "awaitingConfirmation", "count": 1 },
    { "category": "cashier", "status": "awaitingPayment", "count": 0 }
  ]
}
```

服务端按登录账户的当前门店授权查询，要求 `order.read`。预约项另需 `booking.read`，收银项仅对拥有 `order.amount.read` 的店主返回。每个可见分类返回一项，数量为零时返回 `0`。服务端统计口径与订单列表操作条件一致，预约统计待确认，自取统计已出餐且需要核销的订单，收银排除取消和售后订单。

开发环境启用 Mock 时，从订单列表和预约列表共用的模拟记录计算汇总。生产环境使用真实 HTTP 接口，状态码通过项目语言资源显示。

工作台角标和「订单待办」卡片显示当前账户可见分类的待办总数。总数按待办动作相加，一笔堂食订单同时待接单、待收款时计为两项。分类行进入订单列表时带上汇总状态，列表默认打开对应筛选，可手动切回全部。
