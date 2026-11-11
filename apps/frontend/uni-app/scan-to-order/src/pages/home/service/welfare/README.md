# 福利中心

通过 home/user/coupons/index.ts 复用优惠券模型、组件与领取流程。composables/use-page.ts 创建独立页面实例。支持分页、口令券、领取中状态、错误重试，领取结果可在首页优惠券页查看。接口和 Mock 统一归优惠券领域。

页面入口为 index.vue。开发运行需启用 VITE_USE_MOCK=true。测试覆盖所属模块的请求链与状态行为，生产服务仍需联调。

数据契约见 [docs/db.md](docs/db.md)。
