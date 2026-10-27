# 钱包与充值

页面入口 index.vue；页面状态 composables/use-page.ts；套餐展示 components/RechargePlans/index.vue。

本目录拥有钱包接口、余额与充值模型、充值规则、顾客准入和钱包 Mock。通过 index.ts 提供实际使用的公开能力；通用分页机制位于 hooks/project，账号准入仍由业务控制。资金与充值记录的页面、API、类型、Mock 路由和装配逻辑分别归 ../asset-cash-log 和 ../asset-recharge-log。

支持余额、冻结金额、套餐、自定义金额（大于零、最多两位小数）、取消及重复提交保护。刷新合并，账号变化立即清空，销毁后不写回。原代码的本地支付成功改为仅开发 Mock 中由请求确认的模拟充值；生产支付未接入时不发起充值。

开发模拟按顾客隔离，充值按最高赠送档位计算，requestId 去重，同时写入资金及充值流水。详见 ../README.md 和 docs/db.md。

## 当前目录与职责边界

本模块位于 `src/pages/account/assets/asset`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/account/assets/asset`、`@/pages/auth/session`、`@/pages/routes`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Asset`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useAsset<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
