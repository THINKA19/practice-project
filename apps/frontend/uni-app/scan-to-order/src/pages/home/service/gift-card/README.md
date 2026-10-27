# 礼品卡

购卡、我的卡、赠送、领取、兑换和使用记录。

## 目录与入口

- `api/`：业务接口；路径集中在 endpoints.ts。
- `models/`：类型、枚举与数据转换。
- `domain/`：纯业务规则。
- `composables/`：页面响应式逻辑及业务流程。
- `components/`：本模块专属 UI。
- `index.ts`：仅向外导出实际使用的能力，其他模块不能导入内部文件。

页面路由：`/pages/home/service/gift-card/exchange`、`/pages/home/service/gift-card/index`、`/pages/home/service/gift-card/logs`、`/pages/home/service/gift-receive/index`、`/pages/home/service/gift-send/index`。

## 依赖与业务边界

`pages/home/index`、订单列表局部余额支付、`pages/auth/session`、正式客服页面。业务请求保持原有参数、认证、网关和空结果处理。页面临时状态由 composables 拥有，共享状态由唯一 store 拥有，服务端仍是业务事实来源。

MyCard.cardId 关联模板，MyCard.id 是用户卡标识。type=0 次卡按次数/杯数，type=1 储值卡按金额，不可统一解释 amount 单位。fetchShare calculate=true 只预览，false 才领取；openShare 返回分享 token 字符串。购买 nextAction.type=10。赠送/领取的并发、过期与撤回事务待确认。

赠送查询采用请求编号，旧卡片响应不能覆盖当前选择。卡片或留言变化会清除本地分享凭证，迟到的签发响应不能重新启用旧分享入口；这不等于撤销服务端已经签发的凭证。账号变化时清理卡片、分享凭证及留言草稿。

## 后端参考

修改前阅读 [docs/db.md](./docs/db.md)。数据库物理结构尚未核实，已知前端契约与后端待确认项分开记录。文档不参与运行；改动接口或模型时同步维护参考资料。

当前依赖边界、服务接入限制和验证方法见 [profile 迁移说明](../README.md)。本模块未做真实后端或真机验收。

## 当前目录与职责边界

本模块位于 `src/pages/home/service/gift-card`。页面入口仅接入页面配置、组件及组合函数；页面地址统一迁入 home/service/gift-card，由 ClientRoutes.Home 维护。

- 页面入口：`exchange.vue`、`index.vue`、`logs.vue`、`receive.vue`、`send.vue`
- 对外能力：经 `index.ts` 导出 `cardApi`、`myCardState`、`MyCard`。
- 依赖领域：`@/pages/auth/session`、`@/pages/routes`、`@/pages/home/index`
- 外部调用只走所属模块的 `index.ts`；模块内部直接引用实现，避免从自身聚合出口绕回。

### 文件职责

- `api/`：请求与原始 DTO；端点集中在 endpoints.ts，不执行响应转换或页面状态修改。
- `models/`：types.ts 为前端模型；enums.ts 为实际使用的常量；mappers.ts 负责边界数据转换，仅以 import type 引用 DTO。
- `composables/`：领域状态、请求编排、权限和交互流程；按职责拆分，每个页面实例的交互状态独立。
- `components/`：业务 UI；入口为组件目录内的 index.vue；私有逻辑就近放置，复合组件的私有子部件放 parts/。
- `domain/`：不依赖 Vue、Pinia、HTTP 和页面运行时的纯业务规则。
- `docs/`：业务契约、后端接入与参考资料。

### 状态归属

- 共享身份、凭证和用户资料：唯一事实源仍为 `@/pages/auth/session`，本模块不复制会话。
- `composables/use-exchange-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-logs-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-page.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。
- `composables/use-requests.ts`：所属职责的状态或流程；页面通过它获取数据及执行操作。

### 验证

在应用根目录使用 `pnpm test:run --maxWorkers=2`、`pnpm type-check`、`pnpm lint`；构建使用 `pnpm build:h5` 和 `pnpm build:mp`。局部测试或构建通过不代表真实后端、支付或真机能力验证通过。

### Composable 命名

本模块 Domain 为 `Card`。文件使用 `composables/use-<duty>.ts`，实际组合函数导出为 `useCard<Duty>`；文件名省略领域前缀。请求对象、普通命令和类型保留业务语义，不伪装成组合函数。组件私有 Hook 继续放在组件目录。

## 开发演示

个人中心我的服务不再提供礼品卡入口；好友从分享消息进入 gift-receive，领取后进入卡包。开发 Mock 下可使用 GIFT-DEMO 兑换一次演示卡，再赠送、撤回或由其他演示账户领取；预览不消费凭证，领取只能执行一次。兑换后返回我的礼品卡。演示不产生真实资产，在线购买未开放，真实接口及微信分享仍需联调。旧 profile/card 路由已移除，旧分享链接需重新生成。

赠送页已归相邻 gift-send/index.vue；领取页已归 gift-receive/index.vue。两者通过本模块公开出口使用卡片接口和模型，本模块不依赖赠送或领取的页面实现。

## 入口依据与当前链路

参考 docs/reference/account-users/my/index/composables/useMeMenus.ts 及 my7 同名文件：原我的页面配置优惠券、余额、积分和会员中心等入口，没有礼品卡入口；account-profile 的 test/test1 也没有提供礼品卡入口。现有参考材料不足以证明礼品卡是余额、优惠券或积分的子页面。

当前利用首页已有卡片入口接入正式卡包（按钮显示礼品卡），属于补齐工程现有入口，不宣称原始参考源码已经实现该链路。我的服务不增加礼品卡菜单。

- 日常查看： 首页 → 礼品卡 → 我的。
- 发起赠送：卡包 → 我的 → 可赠送卡片 → 转赠好友 → gift-send → 生成赠送链接 → 微信分享按钮。
- 好友领取：微信聊天中的赠送卡片 → gift-receive → 主动领取 → 我的卡包。
- 兑换：卡包 → 我的 → 礼品卡兑换 → 成功后回到我的卡包。
- 消费记录：卡包 → 我的 → 已激活卡片 → 使用记录。

赠送按钮要求持有可赠送的卡；没有卡片时不伪造持卡资产。真实微信分享与后端资产转移仍需双账号真机及接口联调。
归属：本业务以首页服务入口组织，卡片领域由 gift-card 维护，gift-send 和 gift-receive 分别拥有赠送与领取页面流程，跨模块通过 gift-card/index.ts 使用接口和类型。
