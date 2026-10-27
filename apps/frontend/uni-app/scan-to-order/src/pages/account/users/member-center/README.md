# 会员中心

正式路由：`/pages/account/users/member-center/index`。

沿用原会员卡片和等级列表布局，资料来自正式 session，余额、积分及累计消费通过本模块 composables/use-account.ts 账户视图复用钱包模块。累计消费缺失时展示横杠，不推算等级。

等级 API 仅在开发 Mock 开启时请求 `GET /__mock/account/membership/levels`，通过本模块 mock/entry.mock.ts 提供公开样本。关闭 Mock 时显示等级服务尚未接入。历史 `POST /user/level/list` 所用 common 网关在当前项目中不存在，未经确认不直接迁为生产请求。

接口参考及后端待确认项见 [docs/db.md](./docs/db.md)。页面刷新合并、错误重试，资产按客户会话隔离。

## 目录和边界

本模块保留 api、models、composables、mock、docs 和模块内测试；index.vue 负责布局及生命周期，index.ts 仅公开会员码页实际使用的 useMemberCenterAccount。users 父目录仅容纳 member-center、user-code 两个业务目录，不存放文件或公共逻辑。

账户视图复用正式 session 与钱包 API；资产请求合并，换账户、退出及销毁后清空并忽略迟到响应。未登录及其他身份不读取私人资产，登录动作使用 requireIdentity。开发 Mock 允许游客预览公开资产，并明确标注演示。

原 my、my7 已保存在 docs/reference/account-users，正式模块不依赖参考源码。会员码模块通过本模块 index.ts 访问账户视图，不导入内部 composables 或 API。

## 当前目录与职责边界

本模块位于 `src/pages/account/users/member-center`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `useMemberCenterAccount`。
- 依赖领域：`@/pages/account/assets/asset`、`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-account.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `MemberCenter`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useMemberCenter<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
