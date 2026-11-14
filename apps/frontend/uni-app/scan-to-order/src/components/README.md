# 公共组件

每个组件一个目录。带 `index.ts` 的组件可从 `@/components/组件名` 导入。仅有 `index.vue` 的组件可直接导入该文件。`<fg-empty>` 和 `<status-tag>` 通过 [Easycom 配置](../../pages.config.ts) 注册，可直接在模板中使用。

## banner-carousel

展示首页、点餐等页面的横幅。单张静态展示，多张自动轮播，点击后将选中的横幅交给调用方处理。

- `index.vue` 渲染图片、轮播容器及指示器。
- `index.ts` 导出组件和横幅数据类型。
- `types.ts` 定义横幅条目的数据结构。
- `use-carousel.ts` 过滤缺图条目，根据轮播组件返回的索引找到被点击的横幅。
- `index.scss` 定义轮播区域的样式。
- `__tests__/banner-carousel.test.ts` 验证空数据、单图、多图轮播和点击目标。
- [README.md](banner-carousel/README.md) 说明组件接入方式。

## cart-bar

展示点餐页的购物车底栏，提供查看购物车、去结算或选门店的入口。

- `index.vue` 渲染商品数量、金额和操作按钮。
- `index.ts` 导出组件、属性和操作类型。
- `types.ts` 定义展示数据及由调用方提供的操作。
- `use-cart-bar.ts` 根据门店、购物车和结算状态决定按钮显示及点击行为。
- `__tests__/interaction.test.ts` 验证购物车、结算和选门店交互。
- [README.md](cart-bar/README.md) 说明传参和事件约定。

## contact-dock

在服务页集中展示联系方式，支持查看详情、复制或打开链接。

- `index.vue` 渲染联系人按钮并装配详情弹窗。
- `index.ts` 导出组件和联系人类型。
- `models/contact.ts` 定义联系人数据及操作类型。
- `composables/use-controller.ts` 管理详情弹窗、复制和各平台的链接处理。
- `components/WechatContactPopup.vue` 展示联系方式详情和复制入口。
- `__tests__/contact.test.ts` 验证联系人展示、详情和复制操作。
- [README.md](contact-dock/README.md) 说明配置方式和平台行为。

## fg-empty

- `index.vue` 根据调用方传入的图标和文案展示空态，用于商家商品、订单等列表。

## goods-sku-selector

展示商品规格、加料等选项，供点餐菜单和商品详情选择。

- `index.vue` 渲染选项分组及选中、禁用状态。
- `index.ts` 导出组件、规格类型和选择逻辑。
- `types.ts` 定义规格分组与选项。
- `use-sku-selector.ts` 处理可选项判断和选择回调。
- `__tests__/selection.test.ts` 验证规格选择和禁用行为。
- [README.md](goods-sku-selector/README.md) 说明输入和选择事件。

## language-switcher

提供文字或图标形式的语言切换入口，在底部弹层显示语言、国旗和当前选项。

- `index.vue` 渲染入口及语言选择弹层。
- `index.ts` 导出组件。
- `composables/use-picker.ts` 管理语言选项、选中态和弹层开关。
- `img/` 存放选择列表使用的国旗。各文件对应澳大利亚 `au.svg`、中国 `cn.svg`、英国 `gb.svg`、印度尼西亚 `id.svg`、日本 `jp.svg`、韩国 `kr.svg`、老挝 `la.svg`、斯里兰卡 `lk.svg`、缅甸 `mm.svg`、菲律宾 `ph.svg`、泰国 `th.svg`、越南 `vn.svg`。
- [README.md](language-switcher/README.md) 说明语言接入、弹层行为和图标来源。

## list-end

- `index.vue` 使用 `common.noMore` 渲染本地化的列表结束提示及分隔线。

## order-image

统一展示订单和购物车中的商品图片。

- `index.vue` 渲染图片、加载提示和缺图或加载失败时的占位。
- `index.ts` 导出组件。

## page-state

统一展示页面或列表区域的加载、空数据和错误状态。

- `index.vue` 根据状态渲染提示，支持由页面传入操作按钮。
- `index.ts` 导出组件。
- `__tests__/page-state.test.ts` 验证加载文案及加载期间的内容和操作可见性。
- [README.md](page-state/README.md) 说明属性、插槽和布局行为。

## phone-input

用于结算、地址编辑和预约，支持国家区号选择与电话号码格式校验。

- `index.vue` 渲染区号选择与号码输入，暴露校验方法。
- `index.ts` 导出组件、属性类型和校验接口类型。
- `types.ts` 定义属性、更新事件及校验接口。
- `use-phone-input.ts` 管理输入同步、区号弹层、焦点和校验提示。
- `__tests__/input.test.ts` 验证区号展示、必填与选填校验、外部重置及禁用行为。
- [README.md](phone-input/README.md) 说明双向绑定、校验和提交前的号码转换。

## role-password-help

- `index.vue` 为商家和骑手登录页提供“忘记密码”入口，点击后展示本地化的密码重置说明。

## status-tag

- `status-tag.vue` 根据调用方提供的文案、文字颜色、背景色及尺寸渲染状态标签，用于商家桌台和订单。
