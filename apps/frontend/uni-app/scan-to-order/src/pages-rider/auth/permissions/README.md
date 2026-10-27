# 骑手业务权限

身份登录由 session 负责；本模块校验骑手资格和具体操作权限。RiderGrant 必须来自后端业务接口，不能从登录账号、昵称或本地可编辑字段推断。当前只有纯规则，业务功能接入时提供服务端授权资料。

## 当前目录与职责边界

本模块位于 `src/pages-rider/auth/permissions`。本模块提供复用能力，不为凑目录创建页面。

- 页面入口：无独立页面。
- 对外能力：经 `index.ts` 导出 `canRiderOperate`、`RiderGrant`。
- 依赖领域：无跨领域业务依赖；框架与公共基础设施按已有入口使用。
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- 本领域：没有额外的领域状态；纯规则、类型及静态展示不创建 Store。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。
