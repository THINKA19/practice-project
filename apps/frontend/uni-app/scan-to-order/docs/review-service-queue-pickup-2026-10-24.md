# 服务、取号与取餐基础版本审核

审核日期：2026-10-24。审核对象为当前工作区，包含审核前已有的未提交改动；不是某个已发布提交。范围为服务页、排队取号、取餐、取餐一详情及列表测试、扫码核销关联实现。

## 版本判断

当前可作为前端 Mock 基础版本候选保留：本范围 16 个测试文件、45 个测试全部通过，相关页面 lint 通过，H5 生产构建通过。未发现需要改写现有业务流程的阻断问题。

暂不标记正式封档或生产验收通过：全项目测试、类型检查和 lint 尚未全部通过；手机真机手势与真实后端履约未验证。本文不创建发布标签，也不调整 package.json 版本。

## 服务页适配

- `components/ServiceGalleryGroup.vue` 使用 scroll-view 的 scroll-x 和 enable-flex，手机横向触摸由原生滚动接管，图片点击打开同组预览。
- H5 使用左右按钮和鼠标拖动，首尾禁用对应按钮，不循环。H5 手机浏览器也显示箭头，不影响其触摸滚动实现。
- 浏览器实测 localhost:9000 的服务页：点击第一组下一页后，实际横向 scrollLeft 从 0 变为约 811px，第二、第三组保持 0，滚动容器 overflow-x 为 auto。
- 自动测试覆盖分组隔离、拖动销毁清理、首尾按钮边界。原生触摸配置已经实现；本轮没有手机真机或小程序真机测试，不能据此断言真机手势验收通过。

## 取餐与测试闭环

- 正式取餐页读取订单接口，按自提/配送筛选，展示商品、金额、配送信息与核销码；制作中隐藏核销码。
- 加载、无订单、失败重试、未登录、会话变化、迟到响应与页面销毁有处理，相关测试通过。
- 取餐一详情与列表是独立演示接口；列表场景包括待取餐、制作中、无订单。演示核销状态与正式取餐 Mock 隔离。
- 接口测试验证：核销成功后对应订单从列表移除；重复核销、无效码和制作中核销被拒绝。扫码页面测试覆盖顾客演示权限与正式门店权限、重复提交及迟到响应。
- 演示支付只改变模拟详情状态，不代表真实下单、支付、制作和履约链路已联调。
- 当前进度在页面显示时刷新，没有实时订阅或定时轮询。

## 取号与取餐的业务关系

排队页是等桌业务，使用 /queuing/types、/queuing/my、/queuing/get、/queuing/cancel；订单取餐使用订单列表和核销接口。排队号码与订单取餐号不是同一记录，当前不存在“排队取号后自动生成取餐订单”的联动。

排队 Mock 已验证领取、重复领取限制、暂停桌型、按顾客隔离、取消后重新领取，以及演示叫号和入座状态。若产品要求排队号直接关联取餐订单，这项需求尚未实现，需先明确门店、顾客、订单与号码的关联契约，不能标记完整链路已完成。

## 本次最小修改

- 两个包含连续 Mock 请求的取餐接口集成测试，单用例超时从默认 5 秒调整为 15 秒，与已有长链路测试一致；保留原断言和业务实现。首次运行出现默认超时，调整后按默认测试超时运行本范围全部通过。
- 服务 README 修正“首尾循环”和误写的“取餐轮播”；取号 README 删除轮播描述并明确排队号与取餐号的边界。
- 未修改业务运行代码、脚手架、生成物或审核前已有改动。

## 验证记录

- `pnpm test:run src/pages/service src/pages/queue src/pages/pickup src/pages/pickup1 --maxWorkers=2`：16 文件、45 测试通过。日志：review-final-focused.log。
- `pnpm exec eslint src/pages/service src/pages/queue src/pages/pickup src/pages/pickup1`：通过。日志：review-final-focused-lint.log。
- `pnpm build:h5`：通过。日志：review-final-build.log。
- `pnpm test:run --maxWorkers=2 --testTimeout=15000`：168 通过、4 失败，分别为 router/interceptor.test.ts 的 3 项角色/冷启动拦截断言和 locale/__tests__/home-locale.test.ts 的 1 项首页标题断言。日志：review-final-tests.log。这些文件本轮未修改，失败原因及运行影响仍需单独核实。
- `pnpm type-check`：28 项错误，涉及 Wot 依赖组件及其他测试类型；未报告本次服务、取号、取餐目录的类型错误。日志：review-final-types.log。
- `pnpm lint`：43 项错误，位于 pages.config.ts、scripts/bump-version.js、src/tabbar/TabbarItem.test.ts。日志：review-final-lint.log。

正式封档前仍需解决全项目门禁失败、完成手机真机滑动验收，并由真实后端确认订单、取餐码、核销授权和排队叫号契约。若只确认前端 Mock 演示范围，可将当前状态保留为基础版本候选。
