# 点餐商品搜索

## 页面与职责

入口 index.vue，路由 /pages/ordering/menu-search/index。支持关键词、分类查询、排序、分页、布局切换和快速选规格加购。页面调用本领域 composables/use-page.ts 的 useGoodsSearchPage，专属实例状态与流程由本目录持有。

## 公开能力与依赖

无跨领域公开能力，index.ts 显式为空。通过 menu 公开入口复用商品 API、模型、转换、规格引擎和展示组件；购物车写入归 menu-cart，门店上下文归 ordering/index。不得复制接口或重复登记 Mock。

## 状态与入口

搜索、分页和规格面板属于页面实例；门店变化及实例销毁隔离迟到响应。导航常量仍为 ClientRoutes.Ordering.goodsList，当前没有找到固定按钮调用；外部后台链接及历史分享需同步新地址，不保留旧路由。

## 数据与验证

数据归属见 [docs/db.md](./docs/db.md)，检查结果见 [VALIDATION.md](../VALIDATION.md)。Mock 与构建通过不代表真实后端、支付或设备验证。
