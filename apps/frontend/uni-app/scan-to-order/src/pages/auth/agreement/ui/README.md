# pages/auth/agreement/ui

## 当前目录与职责边界

本模块位于 `src/pages/auth/agreement/ui`。本模块提供复用能力，不为凑目录创建页面。

- 页面入口：无独立页面。
- 对外能力：经 `index.ts` 导出 `ConsentDialog`、`ConsentHost`。
- 依赖领域：无跨领域业务依赖；框架与公共基础设施按已有入口使用。
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责


### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- 本领域：没有额外的领域状态；纯规则、类型及静态展示不创建 Store。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。
