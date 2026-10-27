# pages 业务模块

当前包含 44 个页面文件。页面路径保持不变，组件与私有 parts 不参与页面注册；纯能力模块不创建 index.vue。

## 分层约定

- index.vue：页面配置和组件组装；状态、筛选、请求与业务动作由 composables 拥有。
- index.ts：已有跨模块调用的公共出口；内部不经自己的出口回引。
- api/：endpoints.ts、*.api.ts 和所需 *.dto.ts；仅请求，不混入转换、页面状态或业务流程。
- models/：types.ts、按需 enums.ts、mappers.ts；类型与业务模型不依赖 Vue/Pinia/请求运行时。
- domain/：纯业务规则；adapters/：跨领域协议适配；storage/：持久化，各层只在需要时建立。
- components/<Name>/index.vue：组件入口；私有 Hook 按组件名命名；复杂组件使用 parts/。
- mock/：保留既有 entry.mock.ts 发现入口和 mock/index.ts 开发数据公共出口；路径使用所属 api/endpoints.ts。

## 状态归属

共享会话归 auth/session；跨页领域状态归所属模块 composables；页面状态归该页组合函数；组件草稿、展开状态和 DOM 引用归组件实例。既有会话 API session.ts 保留名称，因为受保护的 Store 测试仍依赖该路径。协议 UI 以 auth/agreement/ui/index.ts 单独出口，避免仅使用协议版本的调用方加载组件。

## 模块导航

- [account/assets/asset](account/assets/asset/README.md)
- [account/assets/asset-cash-log](account/assets/asset-cash-log/README.md)
- [account/assets/asset-recharge-log](account/assets/asset-recharge-log/README.md)
- [account/assets/coupons](account/assets/coupons/README.md)
- [account/assets/score](account/assets/score/README.md)
- [account/index](account/index/README.md)
- [account/profile/about](account/profile/about/README.md)
- [account/profile/address](account/profile/address/README.md)
- [home/service/gift-card](home/service/gift-card/README.md)
- [home/service/gift-send](home/service/gift-send/README.md)
- [home/service/gift-receive](home/service/gift-receive/README.md)
- [account/profile/contact](account/profile/contact/README.md)
- [account/profile/feedback](account/profile/feedback/README.md)
- [account/profile/order](account/profile/order/README.md)
- [account/profile/order-refund-apply](account/profile/order-refund-apply/README.md)
- [account/services/bill-pay](account/services/bill-pay/README.md)
- [account/services/booking](account/services/booking/README.md)
- [account/services/scan-result](account/services/scan-result/README.md)
- [account/services/sign-in](account/services/sign-in/README.md)
- [account/users/member-center](account/users/member-center/README.md)
- [account/users/user-code](account/users/user-code/README.md)
- [auth/agreement](auth/agreement/README.md)
- [auth/agreement/ui](auth/agreement/ui/README.md)
- [auth/login](auth/login/README.md)
- [auth/register](auth/register/README.md)
- [auth/session](auth/session/README.md)
- [auth/session/routes](auth/session/routes/README.md)
- [home/index](home/index/README.md)
- [home/service/favorites](home/service/favorites/README.md)
- [home/service/group-buying](home/service/group-buying/README.md)
- [home/service/welfare](home/service/welfare/README.md)
- [home/user/coupons](home/user/coupons/README.md)
- [home/user/member-center](home/user/member-center/README.md)
- [ordering/index](ordering/index/README.md)
- [ordering/shop](ordering/shop/README.md)
- [pickup1/doing](pickup1/doing/README.md)
- [pickup1/index](pickup1/index/README.md)
- [pickup1/scan](pickup1/scan/README.md)
- [pickup1/scan-result](pickup1/scan-result/README.md)
- [pickup/index](pickup/index/README.md)
- [pickup/shared](pickup/shared/README.md)
- [queue/index](queue/index/README.md)
- [service/index](service/index/README.md)

## 回归检查

在应用目录执行 pnpm test:run --maxWorkers=2、pnpm type-check、pnpm lint、pnpm build:h5 和 pnpm build:mp。模型别名随正式位置更新；公共 HTTP、Mock、Router、Store 基础和 OpenAPI 生成代码保持其既有保护边界。

## Composable 命名规则

领域模块统一使用 `composables/use-<duty>.ts`，文件名只描述职责，例如 `use-list.ts`、`use-detail.ts`、`use-actions.ts`。组合函数导出名携带领域与职责：`use<Domain><Duty>`，例如 `useHomePage`、`useAddressPage`。组件根目录就近的私有 Hook 维持按组件命名；组件中若设有 composables/，同样使用 use-<duty>.ts 与 use<Component><Duty>。普通请求对象和命令不改成伪 Hook。
