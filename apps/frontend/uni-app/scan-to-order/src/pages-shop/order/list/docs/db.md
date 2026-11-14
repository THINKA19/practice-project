# 门店订单接口参考

下列路径是应用当前使用的接口约定，开发环境由商家业务 Mock 提供。

- `GET /operator/shop/orders` 按当前授权门店返回订单列表。
- `GET /operator/shop/order` 按 `shopId` 与 `id` 返回订单详情。
- `POST /operator/shop/order/action` 携带 `shopId`、`id`、`version` 和 `action` 提交履约变更。
- `POST /operator/shop/order/print` 提交小票打印请求。Mock 仅返回模拟受理。

订单基础字段包括 `id`、`shopId`、`type`、`status`、`version`、`createdAt`、`tableNo`、`goods`、`timeline`。可选的 `pickupNumber` 是展示号。金额和菜品单价按 `order.amount.read` 裁剪。模拟写入校验门店归属、动作权限、当前状态和版本，列表与详情共享同一份内存记录。

真实服务由 `VITE_SHOP_BACKEND_ENABLED` 控制。日期、关键词和分页的服务端参数，以及骑手送达后的订单状态回写，需要真实后端契约支持。当前列表在客户端基于接口返回的门店数据进行日期筛选和搜索。
