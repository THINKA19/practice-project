# Ordering 验证记录

## 2026-11-01 收藏分类主动登录引导

- 未登录切换“我的收藏”停留当前分类，不跳转登录、不请求私人收藏数据；绿色“去登录”按钮才触发既有顾客登录流程。登录返回保留收藏分类并刷新，取消登录保持引导，退出/换账号时立即清空列表并忽略旧响应。
- 收藏分类区分未登录、已登录空列表和请求失败；分别提供去登录、浏览全部门店、重新加载。其余分类保留原有空状态。
- `select-page.test.ts`、`favorites.test.ts`、`favorites-empty-view.test.ts` 共 3 文件 / 19 项通过；修改文件 ESLint 与差异空白检查通过。本轮未重跑全仓门禁、双端构建或真机验证。

## 2026-11-01 统一进入门店、经营状态与结算限制（本轮最终方案）

- 门店列表与活动弹层统一“进入门店”；非营业门店仍可浏览和加购，不再转为“查看门店”资料页。经营状态胶囊位于店名后，列表省略正常营业及浏览长提示，当前门店使用标题行小标记与卡片高亮；列表移除收藏操作，保留搜索、“我的收藏”分类及门店内部收藏入口。
- 门店内部以简短提示说明暂不可下单。优惠卡片只在存在公开未结束活动时出现，新开业不独立产生营销标签。营业时段按当前业务时区 UTC+7 区分营业/休息，暂停营业与尚未开业优先。
- 普通去结算、拼团/砍价直达结算、扫码桌台提交、新订单创建复用 `useShopCheckoutAvailability`；刷新失败、非营业、换店或换账号时不交易。商品加号、规格、购物车数量与删除保持可用，交易被拒绝不清空购物车。状态字段和真实后端交易校验仍待联调，不代表已实现后台配置或优惠计价。
- 上轮相关模块回归为 50 文件 / 202 项通过，交易专项 4 文件 / 27 项通过；最终布局与交易合并回归为 11 文件 / 64 项全部通过，包含菜单头部、门店详情、状态胶囊、活动面板、选择流程、普通与扫码提交、时区边界、网络失败和迟到响应。以上执行有重叠，不累加为总测试数。
- 最终 `pnpm lint` 与 `git diff --check` 通过。`pnpm type-check` 仍有 Wot UI button/upload、公共 Mock 旧 pickup 引用、优惠券旧 shopSelect、旧 Router setUserInfo 五处范围外错误，未出现本轮代码类型错误。
- 最终 H5 构建通过（`dist/build/h5`）；微信小程序在沙箱内默认及独立输出目录出现 EPERM，沙箱外执行同一构建后通过，产物位于 `dist/verify-business-state-final-external/mp-weixin`。本机微信开发者工具 CLI 路径不存在，未运行开发者工具或真机。
- `pnpm check:mock-output dist/build/h5 dist/verify-business-state-final-external/mp-weixin` 通过，共检查 727 个生产脚本文件。
- 布局调整前的全量 `pnpm test:run --maxWorkers=2`：206 文件通过、3 文件失败，772 项通过、7 项失败；失败集中在公共 Mock 旧 pickup 导入、旧 Router 测试和已有 useOrderingCurrency 命名检查。最终布局调整由上述 64 项回归覆盖，未宣称全仓全绿。
- 真实后端、微信开发者工具交互和真机尚未验证。受保护的根级 Store、HTTP、Router、公共 Mock、生成 Service 未修改，原有环境配置与图片改动保留。

## 2026-11-01 活动详情与开业状态优化

- 活动以 promotions 数组返回，日期按天；已发布的未来活动可宣传，结束日全天有效，次日隐藏。入口仅展示接口排序首项活动的名称、日期和箭头，详情只展示选中活动的简介与说明。
- 活动不显示阶段徽章、活动数量、时分和时区。详情仅展示棕色活动名称、日期和活动说明，不展示独立简介及现金结算提示，不联动价格或优惠计算。日期及发布接口仍需真实后端联调；Mock 相对日期只在工厂生成。
- 系统提示框改为底部可滚动详情面板，支持一店多活动。打开、进入门店前重新读取详情，可见期间每 30 秒复查服务端状态；过期时移除活动，失败可重试，关闭/换店/卸载后不回写。卡片隐藏页面时关闭面板并释放时钟；优惠列表在到期与返回页面时刷新。
- 最终相关回归：25 个文件、111 项通过。覆盖发布/时间边界、重复编号和异常数据、多活动、预告不能点餐、撤回后不能进入、失败重试、关闭后的迟到响应、页面隐藏及计时器清理。普通 Vue 测试为 uni-app onShow/onHide 提供局部适配，没有改动公共测试初始化。
- `pnpm lint` 和最终 `pnpm exec eslint src/pages/ordering/index` 均通过；`git diff --check` 通过。
- `pnpm test:run --maxWorkers=8 --testTimeout=30000`：204 个文件通过、3 个失败；759 项通过、7 项失败，另有缺失导入的套件加载失败。剩余失败仅为既有公共 Mock 旧 pickup 引用、旧 Router 测试、useOrderingCurrency 命名检查；本轮相关回归通过。没有修改受保护基础或范围外测试。
- `pnpm type-check` 仍是原有 5 处范围外错误：Wot UI button/upload 类型、公共 Mock 旧路径、优惠券 shopSelect 引用、旧 Router setUserInfo。未报告本轮新增代码类型错误，全量类型检查未通过。
- 最终 H5 与微信小程序构建通过，目录为 `dist/verify-shop-activities-final/h5`、`dist/verify-shop-activities-final/mp-weixin`。小程序在沙箱内独立目录仍遇到 EPERM，随后授权的沙箱外构建成功；微信开发者工具 CLI 路径不可用，未真机运行。
- 两端最终产物通过 `pnpm check:mock-output`，与构建插件共同检查生产 Mock 隔离。前端不从活动文案推算或扣减价格；真实活动接口、服务端权威时间、报价与结算优惠、经营状态授权仍须后端联调确认，未接入预售、领券或提醒能力。

## 2026-11-01 门店分类、活动与收藏

- 入口顺序为“全部 / 优惠活动 / 我的收藏”；前两项公开浏览，收藏入口与收藏操作沿用顾客登录门禁。分类与地区、关键词共同在服务端分页前筛选。
- 列表、点餐门店头部、详情页共享收藏，换会话清空，迟到响应不回写；即将开业门店从列表进入详情，不写入点餐上下文。新开业、即将开业与优惠标签可以组合，活动说明包含时间和规则。
- 选店、门店头部及详情相关测试：21 个文件、99 项通过；补充分类接口、卡片标签和游客门禁专项：3 个文件、16 项通过。两次执行有重叠，不累加作为总测试数。
- `pnpm lint` 通过；本次相关目录与页面的 scoped ESLint 也通过。
- `pnpm test:run --maxWorkers=4`：197 个文件通过、6 个失败；744 项通过、11 项失败，另有 1 个套件因缺失导入无法加载。范围外问题包括公共 Mock 测试引用不存在的 pickup Mock、旧路由测试使用已删除 setter/旧页面、既有 useOrderingCurrency 命名检查，以及买单、排队、取餐测试的 5 秒超时。
- 对超时的 3 个文件单独执行 `--maxWorkers=2 --testTimeout=30000`：3 个文件、6 项全部通过。没有修改相关实现、测试或全局超时配置。
- `pnpm type-check` 仍有 5 处范围外错误：Wot UI 的 button/upload 类型、公共 Mock 测试的旧路径、优惠券的旧 shopSelect 路由引用、旧路由测试的 setUserInfo。未报告本次新增功能的类型错误；全量类型检查未通过。
- 最终 H5、微信小程序生产构建均通过，输出分别为 `dist/verify-shop-categories/h5`、`dist/verify-shop-categories/mp-weixin`。默认小程序输出目录曾出现 EPERM，使用独立验证目录完成构建，没有清理或覆盖现有目录来解决权限问题。
- 两份产物执行 `pnpm check:mock-output dist/verify-shop-categories/h5 dist/verify-shop-categories/mp-weixin` 通过，配合既有构建插件检查生产 Mock 隔离。
- 本次只完成前端及所属业务 Mock 的闭环；真实收藏接口、活动有效期、服务端下单限制及真机交互仍需联调验证。请求、路由、公共 Mock、生成 service、根级 store 均未修改。

检查日期：2026-10-28 至 2026-10-29（Asia/Bangkok）。范围：ordering 全目录及必要的页面架构命名登记。现有其他工作区改动保留。

## 结构与文档核对

- 9 个直接业务目录均有真实页面，并具备 index.ts、README.md、docs/db.md。
- 按构建器 JSONC 解析结果，生成 pages.json 注册 ordering 的 11 个页面；未注册内部组件。
- 147 个非测试 TS/Vue 核心文件均有包含文件概述、导出清单和使用示例的文件说明；这项静态核对不代替注释语义评审。
- ordering Markdown 相对链接扫描无失效目标；修正迁移后会话、账户订单、地址、资产、卡券和媒体所有者路径。
- 详情组件改为独立目录的 index.vue；商品图片资料从 goods 的孤立目录归位至 menu/mock/assets。
- 分类根目录不增加运行时公共出口，不新增虚构页面、空 API 或第二套共享状态。

## 本轮业务与架构回归

命令：pnpm exec vitest run src/pages/ordering src/pages/__tests__。

45 个文件、169 项测试通过，包括目录/跨领域引用/组合函数命名检查。

新增或加强覆盖：

- 购物车读取乱序、清空期间迟到读取、删除失败保留快照。
- 门店详情无效编号清空旧详情与标记、作用域销毁后忽略旧响应。
- SKU 切换商品与销毁实例后丢弃旧报价。
- 公告详情无效编号、单条兼容、失败重试、切换与销毁后的旧响应隔离。
- 同一经营地区实际返回原有演示店及生成样本，不再断言区域只能有一家门店。

## 编译与静态检查

- H5：pnpm build:h5 成功，最终日志为 DONE Build complete。
- 微信：默认输出目录首次遇到 EPERM；使用 UNI_OUTPUT_DIR=dist/ordering-verify/mp-weixin 执行 pnpm build:mp 后成功，产物保留在该独立目录。
- 移除未被跨领域消费的 ShopSelectionPage 导出后，最终 H5/微信日志没有此前菜单列表跨 chunk 循环引用警告。
- 微信构建脚本尝试启动本机开发者工具时未找到 CLI；编译仍以成功退出，不代表开发者工具或真机已验收。
- git diff --check 通过。公共 HTTP、Mock、Router、Store、生成 Service、依赖清单与生成页面/类型无本轮手工差异。

## 全项目检查边界

本轮执行全量 test:run：187 个文件中 184 个通过、3 个失败；683 项中 676 项通过、7 项失败，另有 1 个测试套件加载失败。失败集中于：

- src/mock/__tests__/loader.test.ts 引用不存在的 pickup/index/mock。
- src/router/interceptor.test.ts 使用旧页面/角色约定与已删除的 setUserInfo。
- 账户 bill-pay 的真实请求链路契约测试超过默认 5 秒。

bill-pay 契约测试单独以 --testTimeout=20000 复核：1 个文件、1 项通过，未修改断言或全局超时。全量快照不是全绿；之后公告流程变更由上述最终 45 文件回归覆盖，未再次宣称全仓通过。

最终 type-check 仍有 5 处 ordering 外部错误：Wot UI 的按钮开放类型与上传文件类型、公共 Mock 的旧模块引用、优惠券页面的已删除 shopSelect、公共 Router 测试的 setUserInfo。没有 ordering 源码错误；没有关闭检查、修改受保护测试或添加依赖补丁。

最终 pnpm lint（全项目 ESLint）以退出码 0 通过；没有保留 ESLint 错误或警告。工具提示的浏览器数据版本信息不属于代码诊断。

## 运行边界与命令说明

以上命令均使用 pnpm --config.verify-deps-before-run=false，避免检查自动重装依赖；没有关闭 ESLint、Vitest、TypeScript 或构建检查。

Mock、静态检查和编译不能证明真实后端授权、服务端幂等、支付到账、后台动态链接、地图网络、海外导航或实体设备行为已通过。现有演示写入与支付限制保持原有业务约定。

## 2026-10-29 menu 前缀目录迁移

- cart、goods、goods-details、pay、youhui-pay 统一增加 menu- 前缀；同步路由、导入、测试和文档引用，业务逻辑保持不变。
- pnpm test:run src/pages/ordering src/pages/__tests__ src/pages/account/services/bill-pay --testTimeout=20000：48 个文件、179 项通过。默认 5 秒下 bill-pay 契约测试超时，未修改断言或全局配置。
- pnpm lint、pnpm build:h5、pnpm check:mock-output dist/build/h5 和 git diff --check 通过。
- pnpm type-check 未通过：Wot UI 两处类型错误、公共 Mock 的 pickup/index/mock 引用、优惠券 shopSelect 引用和 Router 测试 setUserInfo；均位于本次迁移范围外。
- 页面注册由构建重新生成，六个迁移页面使用新地址，未手改生成文件；外部后台链接、历史分享与小程序码仍需由维护方同步。
- 微信构建：沙箱内默认及独立目录遇到 EPERM；提升权限后 pnpm build:mp（UNI_OUTPUT_DIR=dist/menu-rename-verify/mp-weixin）成功。开发者工具 CLI 缺失，未进行真机验证。

## 2026-10-29 搜索入口与买单流程收敛

- 商品搜索迁至 menu-search/index.vue，专属 useGoodsSearchPage 归本目录 composables/use-page.ts。商品接口、模型、Mock 和规格组件继续复用 menu；搜索状态与交互不变。
- 优惠买单保留 account/services/bill-pay/index 正式入口与原有模拟/支付未开放限制；删除重复点餐买单目录及其独占旧流程、模型、样本，不迁入旧扣款分支。外部动态链接、历史分享和小程序码未联调，需同步正式地址。
- 修正前次批量目录替换误改的商品媒体请求地址，恢复 /ordering/goods/video 与 /ordering/goods/share-code；页面路径不改变后端协议。
- pnpm test:run src/pages/ordering src/pages/__tests__ src/pages/account/services/bill-pay --testTimeout=20000：49 文件、181 项通过。新增搜索词解码、门店/分类、排序重置和导航回归。
- H5 与微信构建成功；微信使用独立产物 dist/menu-search-verify/mp-weixin，开发者工具 CLI 缺失，未真机验证。
- type-check 仍有原有五处范围外错误：Wot UI 两处、公共 Mock 的旧 pickup 引用、优惠券 shopSelect 与 Router 测试 setUserInfo；未修改这些范围外实现。
- 最终 pnpm lint、变更源码局部 ESLint、两端 Mock 产物检查（709 个脚本文件）及 git diff --check 通过。
