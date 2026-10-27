# pages/auth/agreement

## 当前目录与职责边界

本模块位于 `src/pages/auth/agreement`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`privacy.vue`、`user.vue`；首次确认由 `App.ku.vue` 挂载的 `ConsentHost` 弹窗展示，不单独跳转确认页。
- 对外能力：经 `index.ts` 导出 `canUseCustomerData`、`enablePrivacyConsent`、`ensurePrivacyConsent`、`getPrivacyRevision`、`AGREEMENT_VERSION`、`PRIVACY_VERSION`、`AGREEMENT_PAGES`。
- 依赖领域：`@/pages/auth/session`、`@/pages/routes`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-privacy-consent.ts`：本领域跨页共享状态；通过公开命令修改。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Agreement`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useAgreement<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
