# 购物车：后端数据参考

核实日期：2026-10-09。来源：[api/cart.api.ts](../api/cart.api.ts)、[api/endpoints.ts](../api/endpoints.ts)、[models/types.ts](../models/types.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：购物车条目与商品/规格引用。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

历史页面 `/pages/ordering/menu-cart/order` 展示桌台订单，相关字段、请求与买单流程归订单模块，参考 [订单资料](../../../account/profile/order/docs/db.md)。它不使用购物车条目模型。

key 是修改/删除条目的请求标识，不应替换成 goodsId。sku 和 addition 提交为 JSON 字符串；goodsTimesDay/goodsTimesItem 表示选购时段。info、remove、empty 的空结果行为保留。价格与库存的最终确认由后端负责。

## 本模块接口及参数

- `info(type = '')`：GET `/shopping-cart/info`；main（默认） 网关，沿用客户端认证。无数据(700)返回 null 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `add(cmd: AddCartCommand, type = '')`：POST `/shopping-cart/add`；main（默认） 网关，沿用客户端认证。

- `modifyNumber(key: string, number: number, type = '')`：POST `/shopping-cart/modifyNumber`；main（默认） 网关，沿用客户端认证。

- `remove(key: string, type = '')`：POST `/shopping-cart/remove`；main（默认） 网关，沿用客户端认证。删除后购物车为空时返回 null 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `empty(type = '')`：POST `/shopping-cart/empty`；main（默认） 网关，沿用客户端认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### CartSkuItem

购物车上下文 - 领域模型。

- `optionId?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `optionValueId?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `optionName?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `optionValueName?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### CartAdditionItem

- `id?`：`number`。接口记录标识。
- `pid?`：`number`。父级或来源标识，依所属对象语义。
- `pname?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `name?`：`string`。名称。

### CartItem

- `key`：`string`。业务键或记录键，依所属对象语义。
- `goodsId`：`number`。商品标识。
- `categoryId?`：`number`。分类标识。
- `shopId?`：`number`。门店标识。
- `name`：`string`。名称。
- `pic`：`string`。图片地址。
- `price`：`number`。价格；后端单位待核实。
- `score?`：`number`。积分值；方向与发放规则依接口语义。
- `number`：`number`。数量或号码，依所属对象及接口语义。
- `minBuyNumber?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `stores?`：`number`。库存数量；最终可售库存由后端决定。
- `selected?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `sku?`：`CartSkuItem[]`。已声明的前端字段；完整业务含义待后端确认。
- `additions?`：`CartAdditionItem[]`。已声明的前端字段；完整业务含义待后端确认。
- `logisticsId?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `propertyChildIds?`：`string`。规格 id 串（无 sku 数组时由服务端直接给出）。
- `goodsTimesDay?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesItem?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `label?`：`string`。规格标签文案（结算页展示）。

### CartInfo

- `items`：`CartItem[]`。已声明的前端字段；完整业务含义待后端确认。
- `number`：`number`。数量或号码，依所属对象及接口语义。
- `price`：`number`。价格；后端单位待核实。
- `score?`：`number`。积分值；方向与发放规则依接口语义。

### AddCartCommand

加购参数（apifm /shopping-cart/add）。

- `goodsId`：`number`。商品标识。
- `number`：`number`。数量或号码，依所属对象及接口语义。
- `sku?`：`Array<{ optionId: number, optionValueId: number }>`。已声明的前端字段；完整业务含义待后端确认。
- `addition?`：`Array<{ id: number, pid: number }>`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesDay?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesItem?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### OrderGoodsJsonItem

下单商品项（/order/create goodsJsonStr 元素）。

- `goodsId`：`number`。商品标识。
- `number`：`number`。数量或号码，依所属对象及接口语义。
- `propertyChildIds?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `goodsAdditionList?`：`Array<{ pid?: number, id?: number }>`。已声明的前端字段；完整业务含义待后端确认。
- `logisticsType`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `inviter_id`：`string | number`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesDay`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `goodsTimesItem`：`string`。已声明的前端字段；完整业务含义待后端确认。

## 关联模块资料

- [pages/account/profile/order](../../../account/profile/order/docs/db.md)
- [pages/ordering/payment](../../menu-pay/docs/payment.md)
- [共享会话](../../../auth/session/docs/db.md)

## 后端待确认及维护

- 当前前端按条目的 `shopId` 隔离门店展示、汇总及结算选品；缺少门店归属的条目不进入已选门店购物车。接口尚未确认门店级查询/清空参数，未虚构新参数，当前按条目删除本店商品。真实后端需保证商品归属、单店下单与权限校验；多条删除不具备原子清空语义。

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。
