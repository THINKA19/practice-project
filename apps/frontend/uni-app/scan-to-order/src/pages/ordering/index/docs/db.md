# 门店与桌台：后端数据参考

核实日期：2026-10-09。来源：[api/endpoints.ts](../api/endpoints.ts)、[入驻资料](../../../../pages-shop/onboarding/docs/db.md)、[api/shop.api.ts](../api/shop.api.ts)、[models/types.ts](../models/types.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

### 2026-11-01 新增前端契约（真实后端待联调）

- POST `/shop/subshop/list` 新增 `category: all | favorites | promotions`，缺省为 all。与地区、搜索条件一起在分页前筛选；favorites 必须校验顾客 Bearer 凭证，只返回该顾客收藏；promotions 仅返回当前存在有效优惠的门店，不因新开业自动归入。
- GET `/shop/subshop/favorites`：顾客身份，返回完整门店 ID 数组 `number[]`。
- POST `/shop/subshop/favorites`：顾客身份，参数 `{ shopId: number, favorite: boolean }`，按当前顾客与门店幂等设置，返回完整收藏 ID 数组；不能接受客户端指定收藏归属账号。以上数组均是公共响应解包后的 data。
- Shop 使用 `openingState?: 'new' | 'upcoming'`、`openingDate?: string`（预计开业展示日期）、`newUntil?: string`（历史新开业字段，不再单独展示营销标签）。新增 `businessState?: 'open' | 'upcoming' | 'suspended' | 'resting'`，显式非营业状态优先，缺省兼容旧 upcoming；普通营业时段按 UTC+7 自动区分营业/休息。字段待真实后端联调，不复用含义未确认的数字 status。营业时段支持 HH:mm-HH:mm、跨夜、结束 24:00，同起止为全天；缺少可用状态与合法时段禁止交易，不自动认定营业。开业日期不自动解除筹备状态。
- 活动使用 `promotions: ShopPromotion[]`。必要字段：`id`、`status: published | draft | withdrawn`、`startsAt/endsAt: YYYY-MM-DD`、`title`、`rules`。单日活动有效，结束日期不得早于开始；旧显式时区时间戳按当前业务地区 UTC+7 转换为日期。`period` 和 `applicableModes` 仅保留为可选兼容字段，不参与展示校验；适用方式写入自由文本 rules。按接口顺序展示，同 ID 去重。
- `category=promotions` 在分页前筛选已发布且结束日期不早于今天的活动；未来活动发布即可展示，结束日整天有效。草稿、撤回、已过期或异常活动不展示。后端按门店当地日期过滤并按商家顺序返回；前端当前按 UTC+7 兼容，跨时区门店需要补齐时区契约。后端应保存发布状态和排序，当前仅业务 Mock 实现，未实现真实后台保存接口。
- `period` 为废弃兼容字段，不再展示，也不参与有效性计算。详情面板打开、进入门店前重新获取详情，可见期间每 30 秒刷新，关闭/换店/卸载丢弃旧响应。面板时间状态每秒更新；优惠列表在已加载活动到期及重新回到页面时刷新，隐藏页面停用计时器，不进行持续的列表轮询。
- 仅展示接口排序首项有效活动的名称、日期和箭头，无数量及阶段徽章。详情仅展示棕色名称、日期和活动说明；summary 是可选兼容字段，不参与校验或展示；无现金结算提示，不显示时分、时区或单独的适用方式。不领取、不核销、不计算优惠、不改变订单金额。
- 门店状态与活动状态分别控制。尚未开业允许预览开业优惠，展示“开业后可点餐”；普通活动说明不自动产生领券、预售和提醒能力。最终商品价格和优惠金额必须由商品/报价/结算服务校验；本次不在前端从活动文案推算或扣减价格。
- 入口统一“进入门店”，所有经营状态都允许浏览已公开商品和加购。非营业仅限制交易：去结算、正式提交、桌台加菜、拼团/砍价直达结算前获取门店详情校验，失败不放行，换账号/换店丢弃迟到结果。试算也检查当前快照；真实后端须在报价和交易接口按权威时间再次校验，购物车不锁定库存/价格/优惠。本次未实现后台配置页面或真实后端接口。
- 正式存储需保证顾客与门店唯一关联、跨设备一致及权限隔离；真实数据库表名/迁移未确认。Mock 按顾客保存，支持公共 reset，不能替代正式后端。活动 Mock 使用完整业务文案和同一发布/时间规则，相对日期仅在 Mock 工厂生成，覆盖进行中、即将开始、已结束、草稿和撤回。

涉及的数据对象：门店、桌台与自提点。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

当前门店使用 shopInfo/peisongType/scanDining 等逻辑存储键，缓存治理规则见模块 README；本地存储格式不是后端数据库契约。cyTableToken 用 id 和 k 换取临时会话；不在文档记录实际密钥。gpsDistance 返回米，门店展示距离按现有调用处理为 km。入驻提交 comment/add，不应当作创建门店接口。

## 本模块接口及参数

- `addComment(data: Record<string, string | number | undefined>)`：POST `/comment/add`；common 网关，沿用客户端认证。

- `fetchShops(query: FetchShopsQuery)`：POST `/shop/subshop/list`；main（默认） 网关，关闭自动认证。 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `detail(id: string | number)`：GET `/shop/subshop/detail/v2`；main（默认） 网关，关闭自动认证。

- `cyTableToken(tableId: string, key: string)`：POST `/cyTable/token`；main（默认） 网关，关闭自动认证。扫码点餐：用桌台密钥换取临时登录态

- `pickPoints(data: ApiParams)`：POST `/shop/subshop/pickPoints`；common 网关，沿用客户端认证。自提点 允许后端暂无数据，按接口函数转换为空列表/对象或 null。

- `gpsDistance(data: ApiParams)`：POST `/common/map/qq/distance`；mainRoot 网关，关闭自动认证。两点距离（腾讯地图），返回米；接口结构 { result: { rows: [{ elements: [{ distance }] }] } }

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### Shop

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `address?`：`string`。地址文本。
- `latitude?`：`number`。纬度；坐标系待确认。
- `longitude?`：`number`。经度；坐标系待确认。
- `distance?`：`number | string`。距离（km），列表接口返回。
- `openingHours?`：`string`。营业时间，如 "09:00-22:00"，跨天如 "18:00-02:00"。
- `linkPhone?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `pic?`：`string`。图片地址。
- `introduce?`：`string`。已声明的前端字段；完整业务含义待后端确认。
- `status?`：`number`。状态编码，完整枚举待后端确认。

### ShopDetail

门店详情接口返回。

- `info`：`Shop`。已声明的前端字段；完整业务含义待后端确认。
- `extJson?`：`Record<string, unknown>`。已声明的前端字段；完整业务含义待后端确认。

### PeisongType

前端类型：`'zq' | 'kd'`。配送方式：zq 到店自取，kd 外卖配送

### ScanDining

扫码点餐桌台。

- `shopId`：`string`。门店标识。
- `id`：`string`。接口记录标识。
- `key`：`string`。业务键或记录键，依所属对象语义。

## 关联模块资料

- [商品媒体所有者](../../menu-goods-details/docs/db.md)
- [共享会话](../../../auth/session/docs/db.md)
- [门店配置](../../index/README.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。

## 选店分页补充（2026-10-28）

fetchShops 使用 page（从 1 开始）、pageSize（列表固定 6）、nameLike、countryCode、cityCode、districtCode；先筛选后分页，返回当前页数组。少于六条表示末页，零条表示空结果。地区代码属于前端与业务 Mock 的待联调契约，不是已确认的数据库字段。Shop/ShopDto 新增可选 countryCode、cityCode、districtCode。

## 门店详情展示补充（2026-10-28）

Shop/ShopDto 增加可选 photos: string[]（相册）、services: string[]（已确认服务设施名称）、arrivalGuide: string（入口楼层）、parkingInfo: string（停车说明）、notice: string（到店须知）。均由既有详情接口 info 返回，不新增接口或数据库表。真实后端是否支持这些字段仍待确认，缺省时隐藏对应区块。

models/mappers.ts 对新增数组和文本进行边界检查。坐标必须配合 coordinateType（wgs84/gcj02）与 countryCode 提供，避免跨地图展示偏移；mapPreview 只用于示意，不应替代真实坐标。业务 Mock 的相册与到店信息明确为演示数据，不作为真实门店事实。

## 开放经营地区接口补充

地区目录已改为 `GET /shop/subshop/regions` 获取，业务数据为国家/城市/区域树。接口结构、编码约束、开放过滤规则与后端待确认项见 [regions.md](./regions.md)。本次仅接入前端和业务 Mock，未新增真实后端接口或后台配置功能。
