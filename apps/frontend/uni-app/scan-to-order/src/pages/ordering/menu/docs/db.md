# 点餐首页：后端数据参考

核实日期：2026-10-09。来源：[models/types.ts](../models/types.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：引用商品、购物车、门店、公告和优惠券数据。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

本领域拥有商品目录、规格、时段、拼团与菜单公告的前端协议；不据此推断独立数据库表。分类徽章、选中项、弹窗开关和选项视图属于前端状态。扫码 scene 转换由门店领域负责，不能用前端参数替代后端桌台鉴权。

## 本模块接口及参数

商品与拼团接口、参数和字段词典见 [goods.md](./goods.md)，路径由 [api/endpoints.ts](../api/endpoints.ts) 唯一维护。请求返回原始 DTO，模型转换在 models/，流程在 composables/。门店、购物车、购买草稿与共享身份继续调用对应所有者的公开入口。

公告由 `orderingContentApi.notices()` 读取 GET `/ordering/notice`；响应允许单条或列表，经 `normalizeNotices` 校验为 `OrderingNotice[]`。id 为正整数，title 必须为非空文本，content 为文本，publishedAt 可选。列表和详情复用同一接口与规范化规则，不另设公告 Store。

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### OptionChoiceView

点餐页表现层共享类型（ViewModel 与页面私有组件之间的展示模型）；规格 / 加料 / 时段 共用的选项组展示模型。

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `active`：`boolean`。已声明的前端字段；完整业务含义待后端确认。

### OptionGroupView

- `id`：`number`。接口记录标识。
- `name`：`string`。名称。
- `choices`：`OptionChoiceView[]`。已声明的前端字段；完整业务含义待后端确认。

### IndexPageQuery

点餐页 onLoad 参数。

- `scene?`：`string`。扫码点餐小程序码 scene。
- `share_goods_id?`：`string`。分享进入：商品 id。
- `share_pingtuan_open_id?`：`string`。分享进入：拼团 id。
- `inviter_id?`：`string`。已声明的前端字段；完整业务含义待后端确认。

## 关联模块资料

- [pages/ordering/menu-cart](../../menu-cart/docs/db.md)
- [pages/account/assets/coupons](../../../account/assets/coupons/docs/db.md)
- [pages/ordering/menu-search](../../menu/docs/goods.md)
- [pages/home/index](../../../home/index/docs/db.md)
- [pages/home/notice](../README.md)
- [pages/ordering/index](../../index/docs/db.md)
- [共享会话](../../../auth/session/docs/db.md)
- [门店配置](../../index/README.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。

## 金额展示约定（2026-10-29）

按本次业务约定：VN、LA 接口金额单位为万，TH 为铢。接口返回 2.28 时，中文界面展示 2.28万 越南盾 / 2.28万 基普；泰国返回 28 展示 28 泰铢。前端仅追加单位与币种名称，不做倍率换算、汇率换算或展示舍入。售价、原价、规格、购物车、结算及提示共用门店上下文派生的展示规则；保留金额前的国家货币符号（₫、₭、฿、¥）；现价使用深红色 #c93636，原价沿用原现价棕金色并保留删除线；币种名称以小字号、常规字重区分，继承金额颜色，不再叠加透明度，万与数字同字号。金额单位契约应由后端在报价、优惠、运费、余额与支付接口一致执行，真实服务尚未联调验证。
