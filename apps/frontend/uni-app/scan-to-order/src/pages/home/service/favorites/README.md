# 收藏分页与取消

api/favorites.api.ts 调用现有 Alova 客户端；models 定义商品和分页结果；composables/use-page.ts 持有列表、分页、加载及取消状态；components/FavoriteCard 提供商品卡片。Mock 通过 entry.mock.ts 自动发现，按顾客隔离收藏，取消成功后重载第一页。

页面入口为 index.vue。开发运行需启用 VITE_USE_MOCK=true。测试覆盖所属模块的请求链与状态行为，生产服务仍需联调。

数据契约见 [docs/db.md](docs/db.md)。
