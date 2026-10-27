# 每日签到

页面：/pages/account/services/sign-in/index；入口：个人中心常用功能。

api/ 使用公共 Alova 与 session 公开凭证，composables/ 管理日历、加载、提交锁与迟到响应。游客可查看日历，签到时引导顾客登录；换号清除记录，失败可以重试。

开发 Mock 按凭证隔离记录、同日幂等，仅模拟签到，不同步真实积分钱包。真实每日边界、重复签到返回码与积分事务需后端确认；公共客户端只接受 0/200，历史 10000 不再被当作成功发放积分。

字段见 docs/db.md。

月历仅展示状态，不使用日期选择器；历史已签不可重选、未签不可补签、未来不可提前签。当天只通过签到按钮提交；成功后立即标记，即使日志刷新失败也不重复开放。日志按日期匹配，不使用固定演示日期；旧日历选择器适配已删除。

## 当前目录与职责边界

本模块位于 `src/pages/account/services/sign-in`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `isSignedOn`。
- 依赖领域：`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-calendar.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `SignIn`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useSignIn<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
