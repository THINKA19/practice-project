# 团购详情

index.vue 装配生命周期和组件；composables/use-page.ts 校验 id、加载详情、维护倒计时与参团锁；components/GroupProgress 展示成员和剩余时间。通过 group-buying/index.ts 访问接口，数据和 Mock 归列表所属领域。离页清理计时器，换账号清空旧状态。

页面入口为 index.vue。开发运行需启用 VITE_USE_MOCK=true。测试覆盖所属模块的请求链与状态行为，生产服务仍需联调。

数据契约见 [docs/db.md](docs/db.md)。
