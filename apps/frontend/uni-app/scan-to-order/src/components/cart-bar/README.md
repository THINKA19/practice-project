# cart-bar

公共购物车底栏，按需引入，模板使用 `<cart-bar />`。保留数量徽章、合计金额、结算加载中、选择门店与未营业展示。

`use-cart-bar.ts` 为组件内部交互 Hook，统一派生徽章、按钮模式、文案、加载和禁用状态，并保护点击入口。`types.ts` 定义公共属性与事件契约，通过 `index.ts` 导出类型。组件内部 Hook 不作为业务公开入口。

从 `@/components/cart-bar` 引入 `CartBar`。调用方传入：

- `number`、`price`：商品数量和合计金额；组件不换算金额。
- `currencySymbol`、`currencyUnit`、`currencyName`：币种展示。
- `cartText`、`checkoutText`、`selectShopText`、`closedText`：调用方当前语言的文案。
- `checkingOut`、`opened`、`hasShop`：结算加载中、营业状态和是否已选门店。

事件：`toggle-cart` 打开购物车；`pay` 发起结算；`get-shop` 获取或选择门店。结算加载中或数量为零时不发出 `pay`，未营业时不提供结算操作。

未选门店时优先展示选择门店；结算处理中拦截底栏的购物车入口与操作按钮。异步结算锁仍由业务调用方维护，并通过 `checkingOut` 传回；组件不会将本地点击当作结算成功。

组件不读取业务 Store、请求接口或决定跳转。页面负责传入数据、控制显隐并处理事件。组件参与父容器布局，不固定定位；底部安全区由页面负责。

现有接入示例见 `src/pages/ordering/menu/index.vue`。

点餐业务使用 `use-cart-bar-binding.ts` 复用页面已有的购物车和门店 Hook，统一输出 `props`、`listeners`、`visible`；页面通过 `v-bind` 传入属性，并显式绑定三个事件。币种和翻译跟随原业务状态更新，购物车请求、加购、金额计算、扫码结算目标仍由原业务模块负责。
