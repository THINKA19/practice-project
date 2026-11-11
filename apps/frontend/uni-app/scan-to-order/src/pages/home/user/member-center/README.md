# 会员中心

正式路由：`/pages/home/user/member-center/index`。

- **首页**：用户卡的“会员中心”按钮或会员等级；游客先进入登录流程。
- **我的**：点击会员等级，进入同一页面。

页面展示顾客资料、当前等级、累计消费、余额和积分，并提供钱包、积分明细、会员码和优惠券入口。访问私人服务前校验顾客身份。累计消费缺失时显示横杠，等级取自账户资料。

- `index.vue` 负责进入页面和下拉刷新的生命周期，`components/MemberOverview` 负责展示。
- `composables/use-account.ts` 复用顾客会话和钱包 API。同账户的资产请求合并；换号、退出或销毁后清空并忽略旧响应。
- `composables/use-page.ts` 编排刷新和服务导航。`use-requests.ts` 校验等级响应，刷新失败保留上次有效列表。
- `index.ts` 公开 `useMemberCenterAccount`。等级端点与 Mock 注册仍归本模块。

等级列表仅在开发环境且 Mock 开启时加载。真实等级配置、升级、结算折扣和动态会员码仍需后端接入，见 [接口契约](docs/db.md)。

局部验证：`pnpm test:run src/pages/home/user/member-center`。
