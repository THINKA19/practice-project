# 门店商品接口参考

当前契约来自模块内的模拟处理器。真实服务通过 `VITE_SHOP_BACKEND_ENABLED` 启用。

- `GET /operator/shop/goods` 携带 `shopId` 和 `includeCategories=true`，返回门店商品目录，结构为 `{ categories: string[], items: ShopGoodsItem[] }`。分类名称按接口顺序展示，`items[].category` 对应商品的分类名称。接口可返回「热销」「售罄」作为筛选项，前端对应按销量大于 100、库存等于 0 筛选。前端在分类首位补「全部」，用于展示所有返回商品。
- `GET /operator/shop/goods/detail` 携带 `shopId`、商品 `id`，返回商品资料及版本。
- `POST /operator/shop/goods/save` 携带 `shopId`、已有商品 `id`、`version` 与 JSON 字符串 `form`。`form` 仅包含售价 `price`。
- `POST /operator/shop/goods/action` 携带 `shopId`、已有商品 `id`、`version`、`action` 和 `value`，仅支持更新库存。标记售罄提交库存 0，恢复销售提交正整数补货量。

接入真实服务时应对令牌、门店归属、`goods.edit` 权限、商品是否存在和版本进行服务端校验，并限制店铺端可写字段。管理员通过后台管理系统维护商品目录和基本资料。
