# 充值记录

index.vue 为页面入口；本模块 api/、models/ 和 mock/ 分别维护接口、记录类型和 Mock 路由，composables 装配本模块 API 与 ../asset 的共用分页。Mock 账本由钱包统一维护，保证充值与两类流水一致，避免复制余额状态。

每次进入刷新，触底追加 5 条，支持空态、加载、错误重试。顶部数量仅表示已加载记录数，不冒充全账户累计次数。演示充值后的记录由模拟服务返回，真实支付接口尚未接通。接口契约见 ../asset/docs/db.md。

## 当前目录与职责边界

本模块位于 `src/pages/account/assets/asset-recharge-log`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `rechargeLogApi`、`PayLog`。
- 依赖领域：无跨领域业务依赖；框架与公共基础设施按已有入口使用。
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `RechargeLog`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useRechargeLog<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
