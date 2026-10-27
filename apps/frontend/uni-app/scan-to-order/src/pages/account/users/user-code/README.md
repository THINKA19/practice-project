# 会员码模块

正式路由：`/pages/account/users/user-code/index`。会员码入口统一使用该路径。

## 当前交付范围

已实现客户登录入口、余额与积分展示，以及开发动态码的 API → 响应校验 → 页面状态链路。开发码明确显示“DEMO”和“不可核销”，不绘制伪二维码，不模拟真实会员权益或消费核销。

真实动态码接口、有效期及核销协议尚未提供。生产构建、关闭 Mock 时不调用开发端点，已登录客户显示服务暂未接入。不能将本模块的开发契约当作真实后端契约。

## 目录职责

- `index.vue`：页面布局，绑定 onShow、onHide、下拉刷新。
- `composables/use-page.ts`：请求协调、动态码状态、过期清理及迟到响应隔离。
- `api/endpoints.ts`：本模块已实现的开发接口路径。
- `api/member-code.ts`：复用现有 Alova 实例获取当前客户的开发码，禁用缓存并调用边界校验。
- `models/types.ts`：MemberCode、MemberCodeStatus 和 parseMemberCode 响应校验。
- `mock/entry.mock.ts`：通过项目已有发现机制登记开发端点，不修改公共 Mock 加载器。
- `__tests__/`：模型、生命周期、真实 Alova/Mock 请求链及页面回归。
- `docs/db.md`：数据来源、接口字段及真实后端待确认项。
- `index.ts`：模块公开入口；当前没有跨模块调用方，因此不额外导出内部 API。

`users/` 父目录仅保留 member-center、user-code 两个业务目录。本模块不在父目录添加公共文件，不修改公共 HTTP、Mock、Router、Store 或生成代码。

## 调用与依赖

页面只调用 useUserCodePage。余额和积分由会员中心公开入口 useMemberAccount 复用钱包 assetApi.amount；共享身份由唯一 pages/auth/session 维护。会员码 API、模型与 Mock 归本模块，不创建第二份会话、持久化、请求实例或请求适配器。

正式代码不依赖 docs/reference。原始 my、my7 保留在 docs/reference/account-users；其中的随机会员码和伪二维码不能直接用于真实核销。

## 开发接口

`GET /__mock/account/member-code`，无请求体和业务查询参数，仅在 `import.meta.env.DEV && VITE_USE_MOCK === 'true'` 时可用。

API 在请求前验证有效客户会话，通过 session 公开入口获取凭证。当前 Alova 实例尚未自动注入真实 Token，本模块沿用钱包模块的显式 Authorization 请求头方式；不修改公共认证实现。HTTP 响应外层协议由现有 Alova 拆包，业务模型只校验 data。

开发响应字段：

- `code: string`：DEMO- 前缀；后续仅允许字母、数字、连字符，长度 1～100。
- `expiresAt: number`：Unix 毫秒安全整数，必须晚于接收时刻，且距接收时刻不超过 60 秒。
- `demo: true`：强制开发标记，拒绝缺失或 false。

示例 data：`{ code: 'DEMO-123-1', expiresAt: Date.now() + 60000, demo: true }`。此为字段示例，不可作为静态有效响应复用。

开发 Mock 只接受项目客户演示凭证，使用现有 mockCustomerOwner 检查已知身份。页面刷新后未知开发凭证的处理沿用现有 Mock 约定，不代表真实服务端鉴权。每次请求产生新样本，返回最多 60 秒有效期；API 禁用缓存。游客可按既有钱包规则预览公开资产，但不能请求动态码。

## 状态和生命周期

- 未登录、其他身份：不请求动态码，提供既有客户登录引导。
- loading：清除旧码后请求；连续刷新合并进行中的动态码请求。
- ready：展示明确标记的开发码，注册过期计时器。
- expired：清除码值并提示点击刷新，不继续展示过期凭证。
- error：不保留旧码，页面提供重试；资产失败和动态码失败分别处理。
- unavailable：关闭 Mock 或生产构建时不请求开发码，显示服务未接入。
- 页面隐藏：立即清码、清计时器并使进行中请求失效；再次显示重新请求。
- 退出、换账户、身份或会话版本变化：清码并忽略旧响应。
- 页面销毁：清理计时器并忽略迟到响应。
- 下拉刷新：并行刷新资产和动态码，finally 关闭刷新动画。

动态码不持久化，不复制用户 ID 作为凭证，不在后台自动请求。真正的扫码编码、自动刷新策略和服务端核销需在协议确认后接入。

## 验证与验收

在应用目录使用 pnpm：

- `pnpm exec eslint src/pages/account/users/user-code`
- `pnpm test:run src/pages/account/users --maxWorkers=2`
- `pnpm type-check`
- `pnpm lint`
- `pnpm test:run --maxWorkers=2`
- `pnpm build:h5`
- `pnpm build:mp`

验收应覆盖：已登录客户得到开发码；重复刷新不重复请求；到期、隐藏、退出、换账户后旧码消失；失败可重试；生产不请求开发码；users 父目录只有两个业务目录。局部测试与构建不等于真实服务、扫码核销或设备验证通过。全量检查的范围外问题应单独记录。

真实后端接入条件见 [docs/db.md](./docs/db.md)。接口参数、模型或状态变化时同时更新 API、模型、测试和本说明。

## 本次验证记录（2026-10-25）

- 模块 ESLint：通过。
- 会员模块测试：5 个文件、11 项通过，含真实 Alova/Mock 请求链。
- H5 生产构建：通过；仍有现有 session 分块循环依赖警告。
- 全量类型检查：未通过，错误涉及现有组件库、旧反馈依赖、旧路由测试等；本模块无新增类型错误。
- 全量 lint：42 项范围外错误，涉及 pages.config.ts 和既有脚本等；未批量修复。
- 全量测试：81 个文件通过、2 个文件失败；333 项通过、7 项失败。失败位于 src/router/interceptor.test.ts 和 src/locale/__tests__/home-locale.test.ts，会员模块全部通过。
- 微信小程序构建：未验证通过。原输出目录及独立 dist/validation/user-code-mp 输出目录均出现 EPERM mkdir 写入错误，未改动公共配置或清空用户目录来绕过。
- users 父目录仅两个业务目录、文档相对链接、Git 差异空白检查：通过。
- 未进行真实后端联调、动态码扫码核销或真机验证。

## 当前目录与职责边界

本模块位于 `src/pages/account/users/user-code`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：当前没有跨模块公开能力，不新增无调用方的导出。
- 依赖领域：`@/pages/auth/session`、`@/pages/routes`
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
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `UserCode`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useUserCode<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
