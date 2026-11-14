# 骑手业务分包

当前包含 7 个页面、7 个独立业务模块。基于现有用户修改继续整理，docs/reviews 中两份同源参考代码不参与运行时。

## 模块

- [登录](auth/login/README.md)：凭证交换、准入与退出。
- [权限](auth/permissions/README.md)：资格、具体动作授权和账号归属，无独立页面。
- [工作台](workspace/index/README.md)：公告、参考目标和任务组合。
- [个人中心](account/index/README.md)：账户等级、评分、累计完成量及菜单。
- [资料](account/profile/README.md)：版本化编辑、服务门店及站点联系方式。
- [设置](account/settings/README.md)：接单规则和提醒设置。
- [配送任务](delivery/task/README.md)：订单列表、详情、状态流转和前台提醒。

每个模块具备 api、models、composables、mock、__tests__、README.md 和 docs/db.md；domain、storage、adapters 仅按实际职责建立。跨领域从 index.ts 调用，跨 Mock 从 mock/index.ts 调用。页面不直接请求或维护第二份任务和会话状态。

## 请求接入

开发环境开启 Mock 时，从「我的 → 进入骑手工作台」使用测试账号 rider、密码 123456 登录。骑手 API 按需加载所属模块的模拟数据。候选凭证仍由共享会话校验身份并提交，工作台继续使用骑手权限和任务状态。公共 Mock 发现范围保持原样。真实骑手 API 使用公共 Alova 客户端。

连接骑手服务需关闭公共 Mock。真实登录需 VITE_RIDER_LOGIN_URL 与 VITE_RIDER_PROFILE_URL；真实骑手业务默认关闭，后端确认 endpoints 契约后再启用 VITE_RIDER_BACKEND_ENABLED=true。客户端授权检查不能替代服务端对账号、门店、任务、权限和版本的校验。

## 行为边界

任务状态与归属以服务端快照为准，前端不乐观改订单。进行中包括 assigned、accepted、delivering；今日配送费使用现有 UTC+7 业务日，不是已结算收入。工作台无参考目标时隐藏进度。评分未知显示 —。

提醒仅覆盖前台轮询，不代表后台推送。首帧建立基线；换号清理事件和音频；用户原有 /static/audio/notifications/incoming.wav 保留。演示站点不直接拨号。模拟任务按账号隔离，不代表真实商家派单、多人抢单或支付结算。

## 验证

在应用根使用 pnpm test:run src/pages-rider、pnpm exec eslint src/pages-rider、pnpm type-check、pnpm lint、pnpm test:run、pnpm build:h5、pnpm build:mp。生产构建后用 pnpm check:mock-output <H5 产物目录> <微信小程序产物目录> 检查隔离。
