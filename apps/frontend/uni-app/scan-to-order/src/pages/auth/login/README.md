# 微信登录

首次顾客隐私确认独立于登录协议，由 agreement/privacyConsent.ts 管理状态，agreement/ui.ts 公开的 ConsentHost 在 App.ku.vue 中统一挂载底部弹窗，不跳转确认页。ConsentHost 负责业务接入，ConsentDialog 只接收内容并发出用户操作事件。仅明确点击同意/不同意才保存选择；未选择便刷新、隐藏或卸载不会被记录为拒绝，下次进入仍提示。拒绝可继续公开浏览；主动登录时允许重新确认。完整登录页与快捷微信授权均在申请 code/票据前检查隐私选择；同意后若原顾客会话仍有效，继续使用原会话。隐私同意不代替服务协议确认，不自动提交业务订单。

页面 /pages/auth/login/index：微信登录或 PC 扫码入口，不包含顾客账号密码。协议默认关闭。无真实微信权限时，开发 Mock 使用二维码状态与手动模拟手机确认，最终提交同一个顾客会话并回到原页面。

目录：models/ 类型；api/ 后端接口；storage/ 浏览器 OAuth 临时状态；domain/ 跳转规则；composables/ 请求、轮询与生命周期；components/ 演示二维码；mock/ 独立样本状态机。

状态：pending → confirmed → used，或 expired。Mock 码 120 秒过期、凭证兑换只能成功一次；轮询每 1.5 秒，隐藏或销毁页面停止，过期及网络失败可重新发起。登录会话由同分类下 session 模块校验和持久化。

生产不启用模拟确认。H5 授权 URL 只接受 https://open.weixin.qq.com；回调必须与本浏览器发起的有效 state 及协议版本匹配。AppSecret 永不进入前端。开发模拟的随机字符串不作为生产安全实现。

登录成功后的返回由 `composables/returnAfterLogin.ts` 处理：校验后的原目标仍在页面栈中时，使用 `navigateBack` 返回该页面；目标不在栈中或返回失败时，普通页面用 `redirectTo` 替换登录页，原生 Tab 页面使用 `switchTab`。不再使用 `reLaunch` 清空整个页面栈，不给其他业务页面额外添加固定返回按钮或固定回退地址。页面参数不同不视为同一个目标；无页面栈的直接访问或 OAuth 整页回跳不会伪造历史记录。


微信登录面板位于 components/AuthPanel/index.vue，私有交互状态位于同目录 use-panel.ts，首页和“我的”通过模块公开入口复用。协议默认未勾选；小程序仅提交 uni.login code、channel 和 agreementVersion，不申请手机号。后端须以 AppID + OpenID 关联内部 userId，同一微信重复登录返回同一账号，不能要求 phoneCode。UnionID 只在满足条件时用于跨应用关联，不以昵称识别账号。H5 保留原有 OAuth/扫码流程。

登录成功后使用账号接口返回的头像、昵称更新共享 Session，首页与我的同步显示；资料面板不提供头像昵称编辑。小程序登录 code 不包含真实头像昵称，不能自动获取微信头像；账号服务已有头像则正常展示，无头像使用默认图。开发数据源提供样例头像，仅测试数据不同，不展示开发提示。手机号如将来用于验证码登录或账号找回，应另建经过验证的绑定流程。

验收：真实微信 code 交换、重复登录同账号、过期及退出凭证失效需后端和真机联调，开发 Mock 不代表生产已可用。

## 当前目录与职责边界

本模块位于 `src/pages/auth/login`。页面入口仅接入页面配置、组件及组合函数；原有具名页面路径保持不变。

- 页面入口：`index.vue`
- 对外能力：经 `index.ts` 导出 `AGREEMENT_VERSION`、`AgreementConsent`、`WechatAuthorizationPanel`、`useLoginWechatAuthorization`、`resolveRedirect`、`WechatChannel`、`WechatExchange`、`WechatPoll`、`WechatTicket`。
- 依赖领域：`@/pages/auth/session`、`@/pages/routes`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `storage/`：本领域的持久化读写、格式校验与恢复。
- `mock/`：仅开发模拟；entry.mock.ts 沿用现有发现机制，跨 Mock 仅通过 mock/index.ts。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-agreement-navigation.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-return.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-view.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-flow.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-wechat-authorization.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-wechat-credential.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-wechat-environment.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `components/AuthPanel/use-auth-panel.ts`：组件实例私有的交互状态，不接管领域共享状态。
- `storage/`：持久化机制；账号、门店和请求版本的隔离由所属业务流程负责。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Login`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useLogin<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。
