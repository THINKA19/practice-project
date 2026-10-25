# 三端唯一会话

登录引导统一由 `loginNavigation.ts` 的 `redirectToLogin` 维护，经 `index.ts` 公开。身份守卫直接调用该实现；历史页面和公共 HTTP 使用的 `src/utils/toLoginPage.ts` 仅保留同一函数的兼容导出，共享 500ms 防抖及 flush/cancel，不维护第二套规则。显式 identity 优先，否则按当前页面所属分包选择登录页；默认携带当前 fullPath 作为 redirect，显式 queryString 优先。当前页面为空时回落顾客登录页。该入口不改变受保护路由拦截器自身的登录地址与策略。

顾客、商家、骑手共用一个会话快照，一次只能有一个身份。换端前必须退出；后端 profile 返回的 identity 必须与登录目标一致。旧顾客接口可省略 identity，仅兼容为 customer。

- index.ts：只读 useSession、有效 token、创建/刷新/退出会话、身份检查、类型。
- store.ts：模块内部 Pinia 状态。公共 src/store/index.ts 只安装 Pinia 和持久化插件，其他业务通过本模块公开出口访问。
- api/：当前用户、刷新、注销；登录模块只做凭证交换。
- domain/：外部凭证/快照校验和纯访问规则。
- mock/：三端身份和开发 token 状态的唯一所有者，mock/index.ts 只供开发模块调用。

持久化使用 auth-session 键，仅保存 version=1 的 snapshot；启动时校验并迁移原 token/user/绝对到期时间。身份、资料、有效期不一致时不恢复。revision 和登录锁不持久化。业务资料不在本模块扩展，后续头像昵称维护归用户资料模块。

Session Store 首次创建时，通过现有持久化插件的 afterRestore 钩子执行 restore.ts 内的校验、过期处理和旧数据迁移；无新存储时也执行迁移，不依赖 main.ts 调用。显式 $hydrate 后重新校验，restoreSession 仅保留为幂等的显式恢复入口。身份检查 requireIdentity 归本模块 guard.ts，通过 index.ts 公开；session 不引用登录页面或分包。登录路径唯一声明在 pages/auth/session/routes.ts。没有 src/app 中间层。

refreshSession 对同一会话共用刷新任务；退出、换身份后旧登录和刷新结果不提交。src/store/token.ts 兼容脚手架既有调用，读取同一 session 状态，logout 只清本地会话，避免 401 清理再次请求注销。刷新、候选 profile、注销使用现有 Alova 的 ignoreAuth 配置；不向原生 HTTP 传入不存在的 authMode/retryOnAuth 参数。缓存由各业务请求配置，不在外部改写公共实例的全局缓存规则。当前脚手架各请求入口的 401 行为不同，不能声称所有业务响应都受会话版本保护或所有请求都能无感重放。

商家和骑手是普通分包，不能设 independent。主包不 import 两个分包；分包之间不互相引用。分包自己的 Mock 通过本地 API 的开发分支动态加载，主包 Mock 自动发现只扫描 src/pages/**/mock/entry.mock.ts。

真实服务需要分别配置 VITE_SHOP_LOGIN_URL、VITE_SHOP_PROFILE_URL、VITE_SHOP_REFRESH_URL、VITE_SHOP_LOGOUT_URL（骑手使用 RIDER）。路径必须以单个 / 开头。profile 返回 userId、username、nickname、identity 和最小资料；凭证返回 token/expiresIn 或 accessToken/refreshToken/accessExpiresIn/refreshExpiresIn。登录使用 POST、profile/注销沿用现有 GET、刷新 POST，若后端协议不同应在模块 API 内适配，不能直接套用未核实路径。

Mock 仅 DEV 且 VITE_USE_MOCK=true 时启用，商家 shop/123456、骑手 rider/123456；顾客保留微信模拟确认。生产构建不提供模拟登录。编译和 Mock 测试不代表真实后端或微信实机已验收。

旧 Store 兼容边界：src/store/token.ts 只保留凭证读取、时间更新、刷新和本地清理；src/store/user.ts 只提供只读资料、资料刷新及会话清理。两者不注册独立 Pinia 状态、不持久化 token/user，也不提供 login、wxLogin、setTokenInfo、setUserInfo、setUserAvatar。新业务直接使用本模块公开入口；各端登录模块负责凭证交换，Session 负责身份校验和原子提交。clearUserInfo 会清理整个会话，不能只清资料而保留凭证。

根级 Store 的日常开发保护与必要变更条件统一见 [脚手架保护规范的 Store 条款](../../../../docs/ai/脚手架保护与参考代码使用规范.md)。会话状态在读取时检查实际时间；不承诺到期时自动触发页面重渲染或后台定时退出。资料刷新必须保持同一账号，返回的资料与会话状态隔离；凭证刷新保留同一会话期间已更新的资料。

2026-10-24 Store/Session 收敛审查：相关 28 项测试通过，覆盖三端状态、到期读取及显式时间更新、刷新、退出和迟到响应、账号一致性及资料隔离；相关代码 lint 通过。全量测试为 200 通过、7 失败，旧路由测试仍调用已移除的 setUserInfo，另有旧角色守卫预期与首页多语言测试失败。全量类型检查与 lint 尚未通过，涉及旧路由测试、其他模块与依赖类型/风格问题。H5 构建成功但仍报告 Session 导出及相关依赖的循环分块警告；未验证真实后端、设备及所有平台运行，不据此宣称全项目验收完成。上述缺口需按对应模块和保护边界另行处理，不为通过历史测试恢复任意会话 setter。
