# 团购列表

api 负责列表、详情与参团请求；models 定义价格、人数、结束时间和参与状态；composables 处理分页；components/GroupCard 展示活动。index.ts 向详情页公开接口和模型。Mock 状态只由本模块维护。

页面入口为 index.vue。开发运行需启用 VITE_USE_MOCK=true。测试覆盖所属模块的请求链与状态行为，生产服务仍需联调。

数据契约见 [docs/db.md](docs/db.md)。
