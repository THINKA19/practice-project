# 点餐业务

本目录是业务分类，根下不建立页面、Store 或统一运行时出口。下面 8 个领域均有实际路由页面，并在自身目录维护 index.ts、README.md、docs/db.md；内部组件、接口、模型、流程与 Mock 随业务所有者放置，不为目录统一新增空接口或虚构页面。

menu 是扫码点餐主入口，menu-* 是该模块的配套页面和功能目录；本次仅统一目录前缀，不改变功能及状态所有权。外部后台配置、旧分享链接或小程序码如引用旧地址，需要同步新页面路径。

## 页面与所有权

- [index](./index/README.md)：index.vue，拥有门店列表、数据接口、经营地区及跨页门店/配送/桌台上下文。
- [menu](./menu/README.md)：index.vue、notice-detail.vue，拥有商品目录、规格/加料/时段、菜单交互和公告。
- [menu-search](./menu-search/README.md)：index.vue，拥有搜索页面流程，复用 menu 商品接口、模型及展示组件。
- [menu-goods-details](./menu-goods-details/README.md)：index.vue，拥有商品详情、砍价与媒体协议及海报展示。
- [menu-cart](./menu-cart/README.md)：index.vue、order.vue，拥有购物车快照与操作、桌台订单页面编排；订单实体接口归账户订单领域。
- [menu-pay](./menu-pay/README.md)：index.vue，拥有结算流程、购买草稿、配送计费和支付面板。
- [shop-detail](./shop-detail/README.md)：index.vue，拥有门店详情与相册页面实例。
- [shop-location](./shop-location/README.md)：index.vue，拥有地址复制、地图展示与导航面板实例。

本次五个配套目录统一增加 menu- 前缀，页面路径随目录迁移，只由路由加载；内部组件位于 components/组件名/index.vue，私有分区才使用 parts。分类、接口或工具目录不因此获得页面身份。页面扫描继续排除内部目录，生成 pages.json 不应出现组件路径。

## 依赖与状态

跨领域只使用对方 index.ts，Mock 联动只使用对方 mock/index.ts，不由生产出口转发。内部使用局部实现，不从自身公共出口绕回内部依赖。选店组件仅供本领域页面使用，移出公共出口，避免菜单列表反向进入门店公开依赖链。

购物车由 menu-cart/store.ts 唯一缓存；门店与配送方式归 index/store.ts；购买草稿归 menu-pay/store.ts；共享身份归 auth/session。搜索、报价、详情、公告和支付面板状态属于各自实例。API 处理原始协议，models 负责转换，composables 负责流程；最终库存、权限、价格和到账由服务端确认。

## 文档与检查

各领域 README 记录职责、公开能力、依赖与状态归属，docs/db.md 记录接口语义、数据所有者及后端待确认项。JSON 文案说明见 [中文回退文案](./menu/locale/zh-Hans.md)。组织记录见 [organization.md](./menu/docs/organization.md)，检查结果统一见 [VALIDATION.md](./VALIDATION.md)。

规范正文以项目 [.agents Skill](../../../.agents/skills/uniapp-business-development/SKILL.md) 为准。普通点餐业务不修改公共 HTTP、Mock、Router、Store、生成服务及其保护规则。
