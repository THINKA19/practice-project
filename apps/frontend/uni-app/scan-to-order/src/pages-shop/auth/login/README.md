# 商家登录

本模块拥有页面、账号凭证交换和开发模拟账号。唯一会话通过 @/pages/auth/session 创建；profile 校验身份后才提交 token。登录路径由主包 pages/auth/session/routes/index.ts 定义。

未提供真实服务配置时页面显示服务暂未开放。登录成功后展示当前身份和退出操作；仅在 redirect 指向本端已注册页面时恢复导航。工作台尚未实现时不跳到不存在的页面。

普通分包，禁止依赖其他分包。操作权限由同级 permissions 模块负责；客户端页面守卫不能替代后端授权。

## 当前目录与职责边界

本模块位于 `src/pages-shop/auth/login`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `useShopLoginPage`。
- 依赖领域：`@/pages/auth/session`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-actions.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `ShopLogin`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useShopLogin<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 异步登录边界

共享 Session 负责认证和凭证提交；页面销毁时清理密码，并忽略迟到的错误提示及回跳。只有当前仍是已登录商家身份，才恢复经页面清单校验的商家端目标。
