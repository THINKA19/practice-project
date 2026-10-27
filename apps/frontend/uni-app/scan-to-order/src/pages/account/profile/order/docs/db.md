# 订单生命周期：后端数据参考

核实日期：2026-10-09。来源：[api/endpoints.ts](../api/endpoints.ts)、[api/order.ts](../api/order.ts)、[models/order.ts](../models/order.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：订单、订单商品、物流、评价与退款申请。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

本模块聚合订单列表 `index.vue`、详情 `detail.vue` 及其 API、Mock、模型和页面流程。历史桌台类型没有实际调用，已删除，不再将旧的 `useTableOrderPage` 描述为当前实现。

orderId 与 orderGoodsId 分别标识订单和订单商品。现有结算页试算发送 calculate: 'true'，正式提交省略 calculate 字段，不能把试算响应当成创建成功。close、delete、pay、delivery、hx 含义不同。退款申请不等于退款已到账；取消订单是否回库存/退券、删除是否软删、支付及退款事务待确认。

## 本模块接口及参数

- `uploadOrderFile(filePath: string)`：调用公共上传能力；上传售后凭证等订单附件（原 WXAPI.uploadFileV2），返回文件地址
包装基础设施的上传能力，页面不直接依赖 infrastructure

- `create(data: ApiParams)`：POST `/order/create`；main（默认） 网关，沿用客户端认证。下单；calculate=true 时仅试算价格不生成订单

- `list(data: ApiParams)`：POST `/order/list`；main（默认） 网关，沿用客户端认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `detail(id: string | number, hxNumber = '', peisongOrderId = '')`：GET `/order/detail`；main（默认） 网关，沿用客户端认证。

- `close(orderId: number | string)`：POST `/order/close`；main（默认） 网关，沿用客户端认证。

- `remove(orderId: number | string)`：POST `/order/delete`；main（默认） 网关，沿用客户端认证。

- `payByBalance(orderId: number | string)`：POST `/order/pay`；main（默认） 网关，沿用客户端认证。使用余额支付

- `delivery(orderId: number | string)`：POST `/order/delivery`；main（默认） 网关，沿用客户端认证。确认收货

- `reputation(postJsonString: string)`：POST `/order/reputation`；main（默认） 网关，沿用客户端认证。评价，postJsonString 为评价内容 JSON

- `hx(data: ApiParams)`：POST `/order/hx`；main（默认） 网关，沿用客户端认证。核销

- `cyTableAddOrder(data: ApiParams)`：POST `/cyTable/add-order`；main（默认） 网关，沿用客户端认证。扫码点餐：加菜到桌台订单

- `refundApply(data: ApiParams)`：POST `/order/refundApply/apply`；main（默认） 网关，沿用客户端认证。

- `refundApplyDetail(orderId: number | string, orderGoodsId: number | string = '')`：GET `/order/refundApply/info`；main（默认） 网关，沿用客户端认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `refundApplyCancel(orderId: number | string, orderGoodsId: number | string = '')`：POST `/order/refundApply/cancel`；main（默认） 网关，沿用客户端认证。

- `refundApplySetBackLogistics(data: ApiParams)`：POST `/order/refundApply/setBackLogistics`；main（默认） 网关，沿用客户端认证。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### OrderStatus

apifm 订单状态

```ts
export const OrderStatus = {
  CLOSED: -1,
  UNPAID: 0,
  /** 已支付待发货 / 待取餐 */
  PAID: 1,
  /** 已发货 / 配送中 */
  SHIPPED: 2,
  /** 待评价 */
  TO_EVALUATE: 3,
  COMPLETED: 4,
} as const
```

### OrderStatusValue

前端类型：`typeof OrderStatus[keyof typeof OrderStatus]`。

### Order

- `id`：`number`。接口记录标识。
- `orderNumber`：`string`。订单编号。
- `status`：`number`。状态编码，完整枚举待后端确认。
- `statusStr?`：`string`。状态展示文案。
- `amount?`：`number`。金额或次数，具体单位依所属对象及后端契约。
- `amountReal`：`number`。订单实付金额；后端单位待核实。
- `amountLogistics?`：`number`。物流费用；后端单位待核实。
- `score?`：`number`。积分值；方向与发放规则依接口语义。
- `goodsNumber?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `dateAdd`：`string`。创建/记录时间，时区和格式待确认。
- `datePay?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `isNeedLogistics?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `isPay?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `hxNumber?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `qudanhao?`：`string`。取餐号。
- `shopId?`：`number`。门店标识。
- `shopIdZt?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `shopNameZt?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `remark?`：`string`。备注。
- `peisongType?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `refundStatus?`：`number`。已声明的前端字段；完整业务含义待后端确认。

### OrderGoods

- `id`：`number`。接口记录标识。
- `goodsId`：`number`。商品标识。
- `goodsName`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `pic`：`string`。图片地址。
- `number`：`number`。数量或号码，依所属对象及接口语义。
- `amount`：`number`。金额或次数，具体单位依所属对象及后端契约。
- `amountSingle?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `property?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `isScore?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `refundStatus?`：`number`。已声明的前端字段；完整业务含义待后端确认。

### OrderLogistics

- `linkMan?`：`string`。联系人。
- `mobile?`：`string`。联系电话。
- `address?`：`string`。地址文本。
- `provinceStr?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `cityStr?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `areaStr?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### OrderDetail

- `orderInfo`：`Order`。已声明的前端字段；完整业务含义待后端确认。
- `goods`：`OrderGoods[]`。已声明的前端字段；完整业务含义待后端确认。
- `logistics?`：`OrderLogistics`。已声明的前端字段；完整业务含义待后端确认。
- `logisticsTraces?`：`unknown[]`。已声明的前端字段；完整业务含义待后端确认。
- `extJson?`：`Record<string, unknown>`。已声明的前端字段；完整业务含义待后端确认。

### OrderListResult

- `orderList`：`Order[]`。已声明的前端字段；完整业务含义待后端确认。
- `goodsMap`：`Record<string, OrderGoods[]>`。订单 id -> 商品列表。
- `totalRow?`：`number`。总记录数。
- `totalPage?`：`number`。总页数。
- `logisticsMap?`：`Record<string, unknown>`。已声明的前端字段；完整业务含义待后端确认。

### OrderGoodsInput

下单商品项（goodsJsonStr 元素）。

- `goodsId`：`number`。商品标识。
- `number`：`number`。数量或号码，依所属对象及接口语义。
- `propertyChildIds?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `logisticsType?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesDay?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesItem?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `sku?`：`unknown`。已声明的前端字段；完整业务含义待后端确认。
- `additions?`：`unknown`。已声明的前端字段；完整业务含义待后端确认。

### CreateOrderResult

- `id`：`number`。接口记录标识。
- `orderNumber`：`string`。订单编号。
- `amountReal`：`number`。订单实付金额；后端单位待核实。
- `amountTotle?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `amountLogistics?`：`number`。物流费用；后端单位待核实。
- `score?`：`number`。积分值；方向与发放规则依接口语义。
- `couponUserList?`：`Array<{ id: number, name: string, money: number, [k: string]: unknown }>`。已声明的前端字段；完整业务含义待后端确认。

### RefundApply

售后（退款）单。

- `baseInfo`：`{ id: number status: number type: number reason?: string remark?: string amount?: number dateAdd?: string [k: string]: unknown }`。已声明的前端字段；完整业务含义待后端确认。
- `baseInfo.id`：`number`。接口记录标识。
- `baseInfo.status`：`number`。状态编码，完整枚举待后端确认。
- `baseInfo.type`：`number`。类型编码，具体值见已知行为及后端待确认项。
- `baseInfo.reason?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `baseInfo.remark?`：`string`。备注。
- `baseInfo.amount?`：`number`。金额或次数，具体单位依所属对象及后端契约。
- `baseInfo.dateAdd?`：`string`。创建/记录时间，时区和格式待确认。

### OrderGoodsCoupon

订单优惠信息（order/detail 的 goodsCoupons；type 0 文本券码，1 图片）。

- `id`：`number`。接口记录标识。
- `type`：`number`。类型编码，具体值见已知行为及后端待确认项。
- `coupon`：`string`。已声明的前端字段；完整业务含义待后端确认。

### ReputationLevel

前端类型：`0 | 1 | 2`。评价等级：0 差评 1 中评 2 好评

### ReputationItem

- `id`：`number | string`。订单商品 id（OrderGoods.id）。
- `reputation`：`ReputationLevel`。已声明的前端字段；完整业务含义待后端确认。
- `remark`：`string`。备注。

### REFUND_APPLYING_CODE

售后申请：当前商品正在售后中（接口返回码）

```ts
export const REFUND_APPLYING_CODE = 20000
```

### RefundType

售后类型：0 仅退款 1 退货退款 2 换货

```ts
export const RefundType = {
  REFUND: '0',
  RETURN_REFUND: '1',
  EXCHANGE: '2',
} as const
```

### RefundableGoods

支持售后的订单商品（afterSale 为逗号分隔的售后类型，如 "0,1,2"）。

- `afterSale?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### RefundLogisticsContent

售后单寄回物流信息（baseInfo.logisticsContent 为 JSON 字符串）。

- `linkMan?`：`string`。联系人。
- `mobile?`：`string`。联系电话。
- `address?`：`string`。地址文本。
- `shipperName?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `trackingNumber?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### RefundApplyRecord

售后单（含关联的订单商品），用于售后列表/详情展示。

- `baseInfo`：`RefundApply['baseInfo'] & { orderId?: number orderGoodsId?: number number?: number statusStr?: string typeStr?: string logisticsStatusStr?: string /** 寄回状态：0 无需寄回 1 待填写快递单号 2 已填写 */ status2?: number logisticsContent?: string }`。已声明的前端字段；完整业务含义待后端确认。
- `pics?`：`Array<{ pic: string, [k: string]: unknown }>`。已声明的前端字段；完整业务含义待后端确认。
- `goodInfo?`：`RefundableGoods`。已声明的前端字段；完整业务含义待后端确认。

## 关联模块资料

- [pages/account/asset](../../../asset/docs/db.md)
- [pages/ordering/payment](../../../../ordering/payment/docs/db.md)
- [pages/auth/session](../../../../../pages/auth/session/docs/db.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。

## 当前结算页实际提交字段

来源：../pay/composables/useOrderPreview.ts 与 useSubmitOrder.ts；以下是前端已确认行为，不是后端字段全集。

开发预览额外提供 `/__mock/profile/orders/action`，接收 `orderId` 和 `action: pay | refund`，仅修改当前演示账户内存订单的状态，不属于正式后端契约，不扣款、不退款。列表 `goodsMap` 与详情 `goods` 使用一致的本地商品样本；`refundStatus=1` 表示演示售后处理中。

- goodsJsonStr：购物车商品经转换后序列化的 JSON；包含 goodsId、number、规格/加料和选购时段。
- remark、peisongType、isCanHx：备注、配送方式（zq 自取、kd 外卖）和现有核销标记。
- shopIdZt/shopNameZt：当前门店；启用自提点且正式下单时追加 pickPointId。
- kjid/pingtuanOpenId：路由传入的砍价活动/拼团标识，经已有流程带入请求。
- extJsonStr：中文键的扩展 JSON，自取包含联系电话；启用用餐时间时写取餐时间或送达时间。
- trips：现有自取打包费参数；peisongFeeId：匹配到的配送费档位。后端最终收费和单位待核实。
- dadaShopNo/lat/lng：达达外卖时的门店编号和收货坐标。
- provinceId/cityId/districtId/address/linkMan/mobile/code：正式外卖下单时复制地址资料，不是只传地址 ID。
- couponId/cardId：选中的用户券/用户卡标识。
- calculate：试算为字符串 'true'；正式下单不传该字段。不要把 composable 的 submit 布尔参数直接当成 HTTP calculate 参数。

正式下单成功后，普通购物车订单尝试清空购物车；buyNow 不清空。订单待支付时读取余额，足够则调用订单余额支付接口，否则打开收银台。此过程的多次请求不是一个前端事务，后端原子性和幂等仍需核实。
