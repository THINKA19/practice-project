# 礼品卡兑换数据参考

来源：当前模块源码、既有接口调用和开发 Mock；核对日期：2026-11-10。未取得后端源码、SQL DDL 或权威数据库字典。

## 本模块契约

- 接口：`POST /card/exchange`。
- 调用：`cardExchangeApi.exchange`，沿用 Alova 默认网关，调用时读取客户 Authorization，关闭缓存。

`number: string` 为兑换码。提交前去除首尾空白；协议确认是前端条件，不作为数据库字段。成功响应的载荷不参与判断。

## 数据所有权与操作

兑换码、协议、提交中和完成状态归本页；已使用兑换码按账户隔离，归本模块 mock/state.ts。

检查非空兑换码、协议及客户身份后提交；提交中与完成后禁止重复提交。失败保留表单，成功才返回卡包。换账户或页面卸载后忽略迟到响应。

`mock/data.ts` 定义 GIFT-DEMO 及目标模板；`mock/state.ts` 提供隔离实例与 reset。发卡通过 gift-card/mock 的 addCard，事件通过 gift-card-logs/mock 写入，不复制持卡或流水状态。

卡包资产字段见 [gift-card 数据参考](../../gift-card/docs/db.md)。分享凭证生命周期见 [赠送数据参考](../../gift-card-send/docs/db.md)，流水事件字段见 [流水数据参考](../../gift-card-logs/docs/db.md)。

## 后端待确认

真实表名、主外键、SQL 类型、NULL/默认值、租户与账户授权、软删除、事务、并发、幂等和超时恢复契约均待后端确认。TypeScript 可选字段不等于 SQL 可空；开发 Mock 的同步写入不是后端事务保证。接口对象不作为数据库表名，不据当前前端反推 SQL。
