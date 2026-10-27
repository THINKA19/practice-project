# 个人中心与反馈：后端数据参考

核实日期：2026-10-09。来源：[api/endpoints.ts](../api/endpoints.ts)、[api/feedback.ts](../api/feedback.ts)、[models/feedback.ts](../models/feedback.ts)，以及迁移前代码和现有规则测试。未获取后端源码、SQL DDL 或权威数据库字典；本次未调用生产接口核实。本文仅供开发参考，不被运行代码导入，不自动生成类型。

## 表及关联

涉及的数据对象：用户反馈留言；引用会话/资产/券统计。**真实表名、主外键、SQL 类型与表间关系均待后端确认**；下文描述的是接口对象和前端模型，不把接口路径或 TypeScript 类型当作物理表名。

## 已知操作语义

反馈 type=1；extJsonStr 使用中文姓名、联系电话和 file0/file1 等附件字段。单个附件上传失败时跳过该地址但保留下标，最终仍提交留言。这是已有前端行为，后台是否必须有附件尚未确认。会员码来自会话接口，不能当成永久凭证保存。

## 本模块接口及参数

- `addComment(data: Record<string, string | number | undefined>)`：POST `/comment/add`；common 网关，沿用客户端认证。留言/反馈（意见反馈、门店入驻申请都走此接口）
type: 0 意见反馈 等，具体见后台配置；extJsonStr 为扩展字段 JSON

参数签名表示当前前端封装；Record/ApiParams 容器不代表后端接受任意字段。对象序列化与默认值以对应接口函数为准。各接口具体读取/写入的表、事务和连带更新均需后端确认。

## 字段和枚举

以下类型来自前端声明。`?` 只表示前端允许缺省，不表示 SQL NULL；字段声明不是运行时校验。未注明的金额单位、时间格式、默认值和枚举全集均待核实。嵌套字段只是接口嵌套，不证明数据库关联。

### FEEDBACK_COMMENT_TYPE

意见反馈留言类型（原 feedback addComment type=1）

```ts
export const FEEDBACK_COMMENT_TYPE = 1
```

### FeedbackForm

- `name`：`string`。名称。
- `mobile?`：`string`。联系电话。
- `content`：`string`。内容。
- `files`：`string[]`。本地临时文件路径。

## 关联模块资料

- [pages/account/asset](../../asset/docs/db.md)
- [pages/account/benefits/coupons](../../benefits/coupons/docs/db.md)
- [pages/ordering/shop](../../../ordering/shop/docs/db.md)
- [shared/media](../../../../asset/media/docs/db.md)
- [shared/session](../../../../asset/session/docs/db.md)
- [shared/settings](../../../../asset/settings/docs/db.md)

## 后端待确认及维护

- 确认真实表名、字段映射、SQL 类型、NULL/默认值、主键及关联，记录后端资料位置与核实日期。
- 确认权限/租户过滤、状态流转限制、写操作是否局部更新、软删除及级联行为。
- 确认涉及库存、资产、优惠权益的连带操作、事务、幂等及超时后的查询恢复方式；前端规则不能证明后端已保证。
- 若本模块只有读取/展示，上述写入项标为“不适用”，不要虚构写操作。
- 接口/模型变更时同步更新本文件；与实际后端行为冲突时先核实再更正。不要记录 token、用户手机号或生产样本。

## 资产摘要演示契约（2026-10-24）
GET /__mock/account/assets 仅在开发 Mock 开启时请求，不是正式后端接口或数据库契约。返回 couponCount（券数）、balanceCents（分）、points（积分）、demo=true；数字必须是非负安全整数。固定样本为 3、12850、260。每次显示账户页重新请求，cacheFor=0。演示 Mock 通过现有 mockCustomerOwner 处理开发凭证归属，兼容刷新后的开发凭证；只返回统一样本，不代表真实服务授权。真实金额单位、优惠券统计规则、正式接口与权限仍需后端确认。



# 附件上传契约

前端契约参考，未获取数据库或文件服务的权威资料。

- POST `/upload`，secondary 网关，字段 `file`，通过既有 Alova upload 模式发送临时文件路径。
- 仅允许当前有效顾客会话，Bearer 参数由共享会话模块生成。
- HTTP 200 且业务 code 为 0/200，`data.url` 为 HTTP(S) 字符串才确认上传成功。
- 开发 Mock 只返回示例地址，不保存个人资料或真实文件。
- 真实文件表名、存储供应商、大小/格式限制、鉴权、保留期和服务端权限待后端确认。

## 微信资料契约调整

个人资料写入仅包含 gender、birthday，不写昵称、头像和手机号；后端按字段更新，不能清空其他账号字段。GET /user/info 返回账号头像、昵称，登录提交共享会话后所有身份卡同步展示。Mock 会话和选填资料单独持久化为测试数据源，模拟服务重启后继续识别已签发凭证，不替代生产服务认证。真实微信头像不能仅凭小程序登录 code 自动获取。
