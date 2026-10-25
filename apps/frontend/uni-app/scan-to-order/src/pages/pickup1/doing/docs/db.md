# 进行中订单列表演示接口

GET /demo/pickup/list 返回 OrderDoingData：orderList、goodsMap、logisticsMap。模型由取餐模块拥有，从其 index.ts 引用。

Mock 按请求凭证读取进行中样单，与 scan-result 的核销 Mock 共享状态；核销完成的订单不会再次返回。Mock 状态只保存在开发进程，不代表真实数据库或真实履约记录。

本接口为前端演示契约，生产构建不启用 Mock，未接入真实后端。真实取餐页仍使用 /order/list 与顾客身份校验。
