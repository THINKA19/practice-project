# 礼品卡领取数据参考

来源：当前模块源码、既有接口调用和开发 Mock；核对日期：2026-11-10。未取得后端源码、SQL DDL 或权威数据库字典。

## 本模块契约

- 接口：`POST /card/share/fetch`。
- 调用：`cardReceiveApi.fetchShare`，沿用 Alova 默认网关，调用时读取客户 Authorization，关闭缓存。

输入 `{ id, shareToken, calculate }`。`calculate=true` 只预览，false 执行领取。预览包含 cardUser 与 cardInfo，user 可选；模型层检查必需字段、模板关联和展示字段，编排层验证预览持卡编号与链接一致。写操作成功载荷不当作预览使用。

## 数据所有权与操作

分享链接参数、预览、失败、提交中与完成状态归本页；领取无需第二份持久状态，依靠赠送凭证失效与卡包转移表达完成。

进入页面仅预览，预览有效后允许主动领取；失败只能重新预览，不自动重放写入。参数、账户变化和卸载后忽略迟到结果；完成提示后的导航也受同一请求代次保护。

`mock/entry.mock.ts` 拥有领取编排：通过 gift-card-send/mock 验证凭证，通过 gift-card/mock 转移资产，通过 gift-card-logs/mock 隔离旧流水并记录领取。拒绝自己的赠送、过期凭证、错误卡号、重复领取与缺失 calculate。无独立共享状态，因此不建空 state.ts 或重复 reset。

卡包资产字段见 [gift-card 数据参考](../../gift-card/docs/db.md)。分享凭证生命周期见 [赠送数据参考](../../gift-card-send/docs/db.md)，流水事件字段见 [流水数据参考](../../gift-card-logs/docs/db.md)。

## 后端待确认

真实表名、主外键、SQL 类型、NULL/默认值、租户与账户授权、软删除、事务、并发、幂等和超时恢复契约均待后端确认。TypeScript 可选字段不等于 SQL 可空；开发 Mock 的同步写入不是后端事务保证。接口对象不作为数据库表名，不据当前前端反推 SQL。
