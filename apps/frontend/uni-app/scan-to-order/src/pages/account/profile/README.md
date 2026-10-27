# 个人中心业务页面

正式页面以 `src/pages/routes.ts` 的 `ClientRoutes.Account` 为路径事实源，通过原有页面扫描生成注册配置。`pages/account/index` 的“我的订单、收货地址、关于我们、联系客服、意见反馈”已接入这里。

## 源码迁移

两份输入源码完整保留在 [docs/reference/account-profile](../../../../docs/reference/account-profile/README.md)，不再放在 `src` 内参与页面、类型和测试扫描。正式代码不依赖参考目录。

- `service/address` → `ad`：地址列表、新增/编辑/删除、默认地址、多国电话区号、东南亚配送国家与手填地区；不再要求地图定位或微信国内地址读取。保存和默认地址更新失败时保留页面。
- `service/order` → `order`：订单列表、详情、组件、页面流程、API、Mock、类型与测试聚合在同一模块；全部、自取、外卖、预约、堂食分类，以及取消、删除、联系门店、售后和余额支付。未知类型只显示在全部订单，错误与空列表分别展示。原 `all-orders` 目录已移除。
- `setting/about` → `about`：CMS 富文本、加载/错误/空内容、重试、复制联系方式、客服入口。未返回联系方式时不展示源码中的演示号码。
- `setting/contact` → `contact`：二维码、微信号、服务时间、QQ群与电话，支持复制和拨打。微信在线客服按钮使用原生能力；其他平台使用实际返回的联系信息。
- `setting/feedback` → `feedback`：姓名、选填手机、反馈内容和最多 6 个图片/视频附件。全部附件上传成功后才发送反馈；失败不丢弃输入；提交防重复，账户切换后不续交旧表单。

礼品卡现归 `home/service/gift-card`；`order-refund-apply` 已修正旧模块引用并接入相同的 HTTP、会话与导航边界。礼品卡赠送通过 `cardId` 重新读取当前账户卡片，不跨页面保存另一份账户资料；先生成赠送凭证，再由微信分享按钮分享。

## 所有权与边界

各业务接口在本模块 `api/`，类型和规则在 `models/`；跨模块使用 `index.ts`。反馈接口和模型已经从“我的”模块归还 `feedback`。会话使用 `pages/auth/session`，导航使用 `utils/project/navigation`，HTTP 直接使用现有 `http/alova`。身份请求头归共享会话模块的 `getAuthorizationHeaders(identity)`；共享上传归 `pages/account/index`，反馈和订单通过其 `index.ts` 复用，profile 根目录不再保留 api-context.ts 或 upload.ts。

已删除 profile 根级 `composables/`。页面流程留在各业务模块；平台交互位于 `utils/project/interaction.ts`，返回兜底路径由业务调用方传入；账户生命周期保护通过共享会话模块的 `useAccountScope` 公开入口使用。未修改受保护的 router、http、mock、store、service 目录，也不手改生成的 pages.json。

## 服务接入限制

这次没有后端源码或真实环境凭证，接口仍需联调确认，不能把编译或单元测试通过当作服务端授权验证。about、contact、feedback 与个人中心已登记模块开发 Mock（上传演示归 account/index），订单查询、取消、删除与地址增删改、国家与文字地址已补充模块 Mock；其他未登记接口在 Mock 严格模式下仍按公共规则报错。

- 订单余额支付使用 `/order/pay`；余额不足时提示在线收银台尚未开放。现有工程缺少原代码引用的收银面板，因此未恢复微信/第三方支付，也不模拟支付成功。
- 礼品卡保留查询、兑换、赠送、撤回、预览和领取接口；在线购买暂未开放。
- 客服配置沿用 `GET /service/config`，兼容 `image/wechat/phone/business_time/qq_group`，新增渠道数组以支持微信、公众号、QQ、QQ群、Telegram 及其他渠道的账号、二维码和联系链接；扩展字段需后端确认。
- 附件由 `account/index` 统一调用既有上传地址 `/upload`，secondary 网关，字段 `file`，要求响应成功且返回 `data.url`。视频大小、格式、鉴权和服务端上传契约仍需真实环境确认。
- 地址/CMS 使用现有 secondary 域名；其余接口保留既有主域名选择，统一携带当前顾客 Bearer 凭证。服务端字段、空结果错误码和网关鉴权方式需联调核实。
- 定位、微信地址、客服电话、微信客服及分享能力未做真机验证。

## 验证

在应用根目录执行：

```sh
pnpm test:run src/pages/account/profile src/pages/account/index/__tests__/feedback-rules.test.ts src/pages/account/index/__tests__/navigation.test.ts src/pages/account/index/__tests__/my-page.test.ts
pnpm exec eslint src/pages/account/profile src/pages/account/index/composables/useNavigation.ts src/pages/routes.ts
pnpm type-check
pnpm lint
pnpm test:run
pnpm build:h5
pnpm build:mp
```

定向测试覆盖接口参数、反馈校验/重复提交/上传失败/换账户、地址默认设置失败/旧响应以及订单分类和售后规则。全量检查的历史失败应单独记录，不通过删除测试或修改公共基础设施绕过。
