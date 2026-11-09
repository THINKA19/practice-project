# 商品搜索数据归属

本目录拥有 index.vue 与 composables/use-page.ts，不拥有独立商品接口、数据表或共享 Store。搜索流程通过 [menu 公开入口](../../menu/index.ts) 访问商品目录 API、模型、转换和规格能力；接口及 Mock 由 [商品目录](../../menu/docs/goods.md) 统一维护。

关键词 name、分类 categoryId、排序 orderBy 与页码构成查询；列表与规格状态属于页面实例。当前门店归 [门店领域](../../index/docs/db.md)，购物车写入归 [购物车领域](../../menu-cart/docs/db.md)。库存、价格及授权由服务端确认。路由为 /pages/ordering/menu-search/index。
