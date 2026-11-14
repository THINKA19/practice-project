# 配送任务

本模块负责任务快照、上下线、配送动作、列表详情和前台新任务提醒。实现沿用项目 uniapp-business-development Skill；参考源码仅用于比较，不被运行时代码引用。

## 目录与维护边界

- api/：所属 endpoints、HTTP 请求及必要 DTO；不直接导入 Mock。
- models/：领域类型与外部响应校验。
- composables/：use-store.ts 是工作台、订单页和详情页共同使用的任务投影。动作串行、版本校验、账号切换隔离；成功后重新读取快照。权限从 auth/permissions 公开出口获取。
- mock/：按配送池共享任务，按账号保存上下线与定位。fixtures.ts 模拟运营授权，entry.mock.ts 登记请求与 reset。测试可覆盖跨区拦截和同区抢单竞争。
- __tests__/：store/api/workflow/orders/refresh/notice/request-chain 测试覆盖并发、版本冲突、归属、列表口径、轮询生命周期、提醒去重与 HTTP 解包。
- index.ts：跨模块公开出口；没有外部消费者的页面模块不暴露内部实现。

## 接口与状态

GET /operator/rider/tasks；POST /operator/rider/online；POST /operator/rider/task/action。任务含 id/orderId/shopId/riderId/version、状态、地址、金额和时间。快照另含 serviceArea、online 和 maxConcurrent。上线请求附带定位。离线轮询只读取本人履约及历史任务。动作体为 id/version/action/reason。pending → accepted → delivering → done；assigned 可 accept/reject，accepted 可 release，配送异常单独记录。

接口使用公共 Alova 客户端、骑手 Authorization 请求头和 cacheFor: 0。真实配送业务需先确认后端契约并设置 VITE_RIDER_BACKEND_ENABLED=true；登录单独使用登录配置。开发环境开启 Mock 时，骑手 API 按需加载本模块模拟数据。真实服务使用公共 Alova 请求链。见 [分包说明](../../README.md)。

## 验证

在应用根执行 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check；构建使用 pnpm build:h5、pnpm build:mp。全量基线失败与本模块测试分开报告。真实服务、真机、后台推送及结算尚未验证。

数据归属见 [docs/db.md](docs/db.md)。
