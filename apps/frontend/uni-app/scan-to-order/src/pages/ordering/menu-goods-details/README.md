# 商品详情

源码核对：2026-10-28。

## 页面与职责

`index.vue`：商品详情、规格、海报与砍价。

拥有商品详情页面流程、砍价接口和媒体接口；商品目录/SKU 引擎由 menu 维护，购物车由 cart 维护。

## 公开能力与依赖

`kanjiaApi`、`goodsMediaApi`；精确清单见 index.ts。

依赖：menu、门店 index、cart、pay、共享会话和现有平台交互工具；内部直接引用本目录 API，不绕经自身公共出口。

跨领域只通过对方 index.ts；页面只由路由加载，内部组件使用 components/组件名/index.vue。

## 状态所有权与规则

商品详情、海报、选中规格、购买数量及砍价进度由页面实例持有；会话、购物车和购买草稿分别由对应领域唯一持有。

规格计价复用 menu 引擎，不复制另一套价格规则。海报与媒体属于展示能力；活动资格、库存、最终金额仍由后端确认。

## Mock 与数据资料

`mock/entry.mock.ts` 登记砍价和媒体；商品与购物车模拟依赖各自所有者公开的 Mock 能力。

接口与数据归属见 [docs/db.md](./docs/db.md)。规范正文见 [项目 Skill](../../../../.agents/skills/uniapp-business-development/SKILL.md)，验证结果统一记录在 [ordering/VALIDATION.md](../VALIDATION.md)。

## 验证边界

本地 Mock、单元测试和构建不代表真实后端、支付、地图网络及设备行为已验证；无权威后端资料的表结构、状态枚举与业务约束保留待确认。

规格选项展示通过本模块 `SkuOptions` 适配到公共 `goods-sku-selector`，展开与弹窗共用；选项完整售价与加料加价由门店货币格式化展示。接口、报价和加购仍复用 menu 引擎与页面流程，不由公共组件处理。
