# 商品目录与促销：后端数据参考

核实日期：2026-10-09。来源：[api/catalog.api.ts](../api/catalog.api.ts)、[api/endpoints.ts](../api/endpoints.ts)、[api/kanjia.api.ts](../../menu-goods-details/api/kanjia.api.ts)、[api/pingtuan.api.ts](../api/pingtuan.api.ts)、[models/types.ts](../models/types.ts)、[models/types.ts](../models/types.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：商品、分类、规格、加料、时段、拼团和砍价。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

goodsId 关联商品；规格 optionId/optionValueId 与商品参数 propertyChildIds 需要按已有转换处理。拼团 tuanId 与砍价 kjid 不是订单 ID。goodsList 在配置 shopIds 时追加 shopId。规格报价、库存扣减与活动资格必须由后端确认；前端报价只是交互展示。

## 本模块接口及参数

- `categories(shopId = '')`：GET `/shop/goods/category/all`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `goodsList(query: GoodsQuery)`：POST `/shop/goods/list/v2`；main（默认） 网关，关闭自动认证。商品列表；门店商品隔离时自动带 shopId（与 apifm SDK 行为一致） 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `goodsDetail(id: string | number)`：GET `/shop/goods/detail`；main（默认） 网关，沿用客户端认证。

- `goodsPrice(goodsId: number, propertyChildIds: string)`：POST `/shop/goods/price`；main（默认） 网关，关闭自动认证。

- `goodsPriceV2(data: ApiParams)`：POST `/shop/goods/price`；main（默认） 网关，关闭自动认证。

- `goodsAddition(goodsId: number | string)`：GET `/shop/goods/goodsAddition`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `timesSchedule(goodsId: number | string, propertyChildIds = '', brandId = '', categoryId = '')`：POST `/shop/goods/times/schedule`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `set(goodsId: number | string)`：GET `/shop/goods/kanjia/set/v2`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `join(kjid: number | string)`：POST `/shop/goods/kanjia/join`；main（默认） 网关，沿用客户端认证。

- `detail(kjid: number | string, joiner: number | string)`：GET `/shop/goods/kanjia/info`；main（默认） 网关，关闭自动认证。

- `help(kjid: number | string, joinerUser: number | string, remark = '')`：POST `/shop/goods/kanjia/help`；main（默认） 网关，沿用客户端认证。

- `myHelp(kjid: number | string, joinerUser: number | string)`：GET `/shop/goods/kanjia/myHelp`；main（默认） 网关，沿用客户端认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `set(goodsId: number | string)`：GET `/shop/goods/pingtuan/set`；common 网关，关闭自动认证。

- `open(goodsId: number | string, extJsonStr = '')`：POST `/shop/goods/pingtuan/open`；common 网关，沿用客户端认证。

- `joinUsers(tuanId: number | string)`：GET `/shop/goods/pingtuan/joiner`；common 网关，关闭自动认证。参团用户；团不存在(700) 返回 null 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### Category

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `icon?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `pid?`：`number`。父级或来源标识，依所属对象语义。
- `level?`：`number`。已声明的前端字段；完整业务含义待后端确认。

### Goods

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `pic`：`string`。图片地址。
- `minPrice`：`number`。最低价格；单位待后端核实。
- `originalPrice`：`number`。原价；单位待后端核实。
- `minScore?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `minBuyNumber`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `stores`：`number`。库存数量；最终可售库存由后端决定。
- `categoryId`：`number`。分类标识。
- `shopId?`：`number`。门店标识。
- `tags?`：可选标签数组，每项包含可选的 `id: number | string`、`label: string`、可选的 `tone: green | orange` 及 `emphasis: primary | normal`。后端控制文案、配色标识、展示级别及数组顺序；前端不根据 ID 或文案猜测样式。按顺序去重后最多展示两个，无标签不占位。重点标签使用绿色或橙色浅背景、24rpx、较高字重和内边距；普通标签统一为 20rpx 灰棕色文字，无背景、无边框，不使用 tone 配色。缺失或未知级别按普通展示，重点标签缺失或未知配色按橙色展示。原描述保持独立，不参与库存及活动判断。真实接口及商家编辑保存尚待接入，Mock 首个商品展示一重点搭配一普通，另有双重点、单重点、双普通及无标签商品。后端应过滤停用或过期标签并校验门店归属，不直接下发任意 CSS、字号；当前前端不自动推断有效期。
- `characteristic?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `miaosha?`：`boolean`。是否秒杀。
- `dateStart?`：`string`。开始时间，时区和格式待确认。
- `dateEnd?`：`string`。结束/失效时间，时区和格式待确认。
- `pingtuan?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `pingtuanPrice?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `kanjia?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `numberSells?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `logisticsId?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `hasAddition?`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `propertyIds?`：`string`。规格 id 串，非空表示有规格。
- `hasGoodsTimes?`：`boolean`。是否时段定价。
- `kanjiaPrice?`：`number`。砍价底价。

### GoodsListResult

- `result`：`Goods[]`。结果列表。
- `totalRow?`：`number`。总记录数。
- `totalPage?`：`number`。总页数。

### PropertyChild

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `propertyId?`：`number`。已声明的前端字段；完整业务含义待后端确认。

### GoodsProperty

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `childsCurGoods`：`PropertyChild[]`。已声明的前端字段；完整业务含义待后端确认。

### GoodsSubPic

- `optionValueId?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `pic`：`string`。图片地址。

### GoodsDetail

- `basicInfo`：`Goods & { content?: string score?: number videoId?: string shopId?: number }`。已声明的前端字段；完整业务含义待后端确认。
- `properties?`：`GoodsProperty[]`。已声明的前端字段；完整业务含义待后端确认。
- `pics?`：`Array<{ pic: string, id?: number }>`。已声明的前端字段；完整业务含义待后端确认。
- `subPics?`：`GoodsSubPic[]`。已声明的前端字段；完整业务含义待后端确认。
- `content?`：`string`。内容。
- `extJson?`：`Record<string, unknown>`。已声明的前端字段；完整业务含义待后端确认。

### AdditionItem

- `id`：`number`。接口记录标识。
- `pid`：`number`。父级或来源标识，依所属对象语义。
- `name`：`string`。名称。
- `price`：`number`。价格；后端单位待核实。

### AdditionGroup

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `type`：`number`。0 单选，1 多选。
- `required`：`boolean`。已声明的前端字段；完整业务含义待后端确认。
- `items`：`AdditionItem[]`。已声明的前端字段；完整业务含义待后端确认。

### TimeSlot

- `name`：`string`。名称。
- `price`：`number`。价格；后端单位待核实。
- `stores`：`number`。库存数量；最终可售库存由后端决定。

### TimeScheduleDay

- `day`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `items`：`TimeSlot[]`。已声明的前端字段；完整业务含义待后端确认。

### SkuPriceResult

- `price`：`number`。价格；后端单位待核实。
- `originalPrice`：`number`。原价；单位待后端核实。
- `pingtuanPrice?`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `score`：`number`。积分值；方向与发放规则依接口语义。
- `stores`：`number`。库存数量；最终可售库存由后端决定。

### SkuSelection

商品规格选择状态
- props: propertyId -> childId
- additions: 已选加料 id 集合（key 为 `${pid}-${id}`）
- time: [dayIndex, slotIndex]。

- `props`：`Record<number, number>`。已声明的前端字段；完整业务含义待后端确认。
- `additions`：`string[]`。已声明的前端字段；完整业务含义待后端确认。
- `time`：`[number, number] | null`。已声明的前端字段；完整业务含义待后端确认。

### SkuPayloadItem

- `optionId`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `optionValueId`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `optionName?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `optionValueName?`：`string`。已声明的前端字段；完整业务含义待后端确认。

### AdditionPayloadItem

- `id`：`number`。接口记录标识。
- `pid`：`number`。父级或来源标识，依所属对象语义。
- `pname?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `name?`：`string`。名称。

### PriceQuote

- `price`：`number`。价格；后端单位待核实。
- `originalPrice`：`number`。原价；单位待后端核实。
- `score`：`number`。积分值；方向与发放规则依接口语义。
- `maxBuy`：`number`。已声明的前端字段；完整业务含义待后端确认。

### CategoryRange

- `categoryId`：`number`。分类标识。
- `categoryName`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `startIndex`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `endIndex`：`number`。已声明的前端字段；完整业务含义待后端确认。

### MenuSection

连续滚动菜单的一个分段：一个分类及其商品。

- `category`：`Category`。已声明的前端字段；完整业务含义待后端确认。
- `categoryIndex`：`number`。分类在完整分类列表中的下标。
- `goods`：`Goods[]`。已声明的前端字段；完整业务含义待后端确认。

### MENU_INITIAL_GOODS

首屏连续加载的商品数量阈值（原逻辑 50）

```ts
export const MENU_INITIAL_GOODS = 50
```

### MiaoshaCountdown

- `startIn`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `endIn`：`number`。已声明的前端字段；完整业务含义待后端确认。

### GoodsListAction

前端类型：`'soldOut' | 'notStart' | 'ended' | 'kanjia' | 'pingtuan' | 'sku' | 'add'`。列表商品按钮状态（原 index.wxml goods-btn 分支，按优先级）
soldOut 补货中 / notStart 即将开抢 / ended 秒杀结束 / kanjia 去砍价 / pingtuan 一起拼 / sku 选规格 / add 直接加购

### PingtuanSet

- `goodsId`：`number`。商品标识。
- `numberOrder`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `timeoutHours?`：`number`。已声明的前端字段；完整业务含义待后端确认。

### PingtuanOpen

- `id`：`number`。接口记录标识。

### PingtuanJoiner

- `apiExtUserHelp`：`{ avatarUrl: string, nick?: string }`。已声明的前端字段；完整业务含义待后端确认。
- `apiExtUserHelp.avatarUrl`：`string`。头像地址。
- `apiExtUserHelp.nick?`：`string`。昵称。

### KanjiaSet

- `id`：`number`。接口记录标识。
- `goodsId`：`number`。商品标识。
- `minPrice`：`number`。最低价格；单位待后端核实。

### KanjiaInfo

- `kanjiaInfo`：`{ curPrice: number, helpNumber: number, uid: number, [k: string]: unknown }`。已声明的前端字段；完整业务含义待后端确认。
- `kanjiaInfo.curPrice`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `kanjiaInfo.helpNumber`：`number`。已声明的前端字段；完整业务含义待后端确认。
- `kanjiaInfo.uid`：`number`。用户标识。
- `joiner?`：`Record<string, unknown>`。已声明的前端字段；完整业务含义待后端确认。
- `helps?`：`unknown[]`。已声明的前端字段；完整业务含义待后端确认。

## 关联模块资料

- [pages/ordering/menu-cart](../../menu-cart/docs/db.md)
- [共享会话](../../../auth/session/docs/db.md)
- [门店配置](../../index/README.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。
