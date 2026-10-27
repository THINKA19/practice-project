# 三端唯一会话

顾客隐私选择由 agreement 模块独立维护。App 启用后，未接受当前隐私版本时，顾客 getToken/getIdentity 与 useSessionState 的身份、资料和凭证按游客暴露，禁止顾客登录兑换、资料刷新及凭证刷新；底层缓存保留，同意后可恢复有效会话。getSessionRevision 包含隐私选择修订号，避免旧异步结果写回。商家、骑手身份不被顾客隐私状态屏蔽。公共 HTTP、Router 和根 Store 无需修改。

首次确认采用 App.ku.vue 中统一挂载的底部弹窗，拒绝后继续浏览，同版本不自动重复提示；未选择便刷新或卸载仍为未选择。旧版没有明确操作标记的拒绝记录重新提示，有效同意保留。主动登录可再次确认。小程序同意按钮使用 agreePrivacyAuthorization，发布前仍须在微信后台如实配置隐私保护指引并真机验证；客户端选择记录不代表已完成服务端授权留证或正式运营合规验收。

登录引导统一由 `loginNavigation.ts` 的 `redirectToLogin` 维护，经 `index.ts` 公开。身份守卫直接调用该实现；历史页面和公共 HTTP 使用的 `src/utils/toLoginPage.ts` 仅保留同一函数的兼容导出，共享 500ms 防抖及 flush/cancel，不维护第二套规则。显式 identity 优先，否则按当前页面所属分包选择登录页；默认携带当前 fullPath 作为 redirect，显式 queryString 优先。当前页面为空时回落顾客登录页。该入口不改变受保护路由拦截器自身的登录地址与策略。

顾客、商家、骑手共用一个会话快照，一次只能有一个身份。换端前必须退出；后端 profile 返回的 identity 必须与登录目标一致。旧顾客接口可省略 identity，仅兼容为 customer。

- index.ts：只读 useSessionState、有效 token、创建/刷新/退出会话、身份检查、类型。
- store.ts：模块内部 Pinia 状态。公共 src/store/index.ts 只安装 Pinia 和持久化插件，其他业务通过本模块公开出口访问。
- api/：当前用户、刷新、注销；登录模块只做凭证交换。
- domain/：外部凭证/快照校验和纯访问规则。
- mock/：三端身份和开发 token 状态的唯一所有者，mock/index.ts 只供开发模块调用。

持久化使用 auth-session 键，仅保存 version=1 的 snapshot；启动时校验并迁移原 token/user/绝对到期时间。身份、资料、有效期不一致时不恢复。revision 和登录锁不持久化。业务资料不在本模块扩展，后续头像昵称维护归用户资料模块。

Session Store 首次创建时，通过现有持久化插件的 afterRestore 钩子执行 storage/session.storage.ts 内的校验、过期处理和旧数据迁移；无新存储时也执行迁移，不依赖 main.ts 调用。显式 $hydrate 后重新校验，restoreSession 仅保留为幂等的显式恢复入口。身份检查 requireIdentity 归本模块 composables/use-guard.ts，通过 index.ts 公开；session 不引用登录页面或分包。登录路径唯一声明在 pages/auth/session/routes/index.ts。没有 src/app 中间层。

refreshSession 对同一会话共用刷新任务；退出、换身份后旧登录和刷新结果不提交。src/store/token.ts 兼容脚手架既有调用，读取同一 session 状态，logout 只清本地会话，避免 401 清理再次请求注销。刷新、候选 profile、注销使用现有 Alova 的 ignoreAuth 配置；不向原生 HTTP 传入不存在的 authMode/retryOnAuth 参数。缓存由各业务请求配置，不在外部改写公共实例的全局缓存规则。当前脚手架各请求入口的 401 行为不同，不能声称所有业务响应都受会话版本保护或所有请求都能无感重放。

商家和骑手是普通分包，不能设 independent。主包不 import 两个分包；分包之间不互相引用。分包自己的 Mock 通过本地 API 的开发分支动态加载，主包 Mock 自动发现只扫描 src/pages/**/mock/entry.mock.ts。

真实服务需要分别配置 VITE_SHOP_LOGIN_URL、VITE_SHOP_PROFILE_URL、VITE_SHOP_REFRESH_URL、VITE_SHOP_LOGOUT_URL（骑手使用 RIDER）。路径必须以单个 / 开头。profile 返回 userId、username、nickname、identity 和最小资料；凭证返回 token/expiresIn 或 accessToken/refreshToken/accessExpiresIn/refreshExpiresIn。登录使用 POST、profile/注销沿用现有 GET、刷新 POST，若后端协议不同应在模块 API 内适配，不能直接套用未核实路径。

Mock 仅 DEV 且 VITE_USE_MOCK=true 时启用，商家 shop/123456、骑手 rider/123456；顾客保留微信模拟确认。生产构建不提供模拟登录。编译和 Mock 测试不代表真实后端或微信实机已验收。

旧 Store 兼容边界：src/store/token.ts 只保留凭证读取、时间更新、刷新和本地清理；src/store/user.ts 只提供只读资料、资料刷新及会话清理。两者不注册独立 Pinia 状态、不持久化 token/user，也不提供 login、wxLogin、setTokenInfo、setUserInfo、setUserAvatar。新业务直接使用本模块公开入口；各端登录模块负责凭证交换，Session 负责身份校验和原子提交。clearUserInfo 会清理整个会话，不能只清资料而保留凭证。

根级 Store 的日常开发保护与必要变更条件统一见 [脚手架保护规范的 Store 条款](../../../../docs/ai/脚手架保护与参考代码使用规范.md)。会话状态在读取时检查实际时间；不承诺到期时自动触发页面重渲染或后台定时退出。资料刷新必须保持同一账号，返回的资料与会话状态隔离；凭证刷新保留同一会话期间已更新的资料。

2026-10-24 Store/Session 收敛审查：相关 28 项测试通过，覆盖三端状态、到期读取及显式时间更新、刷新、退出和迟到响应、账号一致性及资料隔离；相关代码 lint 通过。全量测试为 200 通过、7 失败，旧路由测试仍调用已移除的 setUserInfo，另有旧角色守卫预期与首页多语言测试失败。全量类型检查与 lint 尚未通过，涉及旧路由测试、其他模块与依赖类型/风格问题。H5 构建成功但仍报告 Session 导出及相关依赖的循环分块警告；未验证真实后端、设备及所有平台运行，不据此宣称全项目验收完成。上述缺口需按对应模块和保护边界另行处理，不为通过历史测试恢复任意会话 setter。

`getAuthorizationHeaders(identity)` 通过公开入口提供指定身份的实时 Bearer 请求头；未登录、过期或身份不符时抛错，不发请求或跳转。`useSessionAccountScope` 提供账户切换及页面销毁时的旧响应隔离。

## 当前目录与职责边界

本模块位于 `src/pages/auth/session`。本模块提供复用能力，不为凑目录创建页面。

- 页面入口：无独立页面。
- 对外能力：经 `index.ts` 导出 `useSessionAccountScope`、`redirectToLogin`、`LoginNavigationOptions`、`useSessionState`、`clearSession`、`createSession`、`getIdentity`、`getSessionRevision`、`getToken`、`logoutSession`、`refreshSession`、`refreshUserInfo`、`restoreSession`、`getAuthorizationHeaders`、`requireIdentity`、`canAccessIdentity`、`isSessionIdentity`、`isDoubleTokenRes`、`isSingleTokenRes`、`SessionIdentity`、`IAuthLoginRes`、`IDoubleTokenRes`、`ISingleTokenRes`、`IUserInfoRes`、`UserRole`、`AUTH_ROUTES`、`identityForPath`。
- 依赖领域：无跨领域业务依赖；框架与公共基础设施按已有入口使用。
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `storage/`：本领域的持久化读写、格式校验与恢复。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-account-scope.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-login-navigation.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-actions.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-authorization.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-guard.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-store.ts`：本领域跨页共享状态；通过公开命令修改。
- `composables/use-state.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `storage/`：持久化机制；账号、门店和请求版本的隔离由所属业务流程负责。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Session`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useSession<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

业务状态入口为 `composables/use-state.ts` 的 `useSessionState`。公共 `index.ts` 仅为受保护的脚手架 Store 保留 `useSession` 导出别名，二者指向同一函数、同一会话状态；业务调用方使用新名称。
