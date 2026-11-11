# 礼品卡赠送数据参考

来源：当前模块源码、既有接口调用和开发 Mock；核对日期：2026-11-10。未取得后端源码、SQL DDL 或权威数据库字典。

## 本模块契约

- 接口：`POST /card/share/open、POST /card/share/close`。
- 调用：`cardSendApi.openShare / shareClose`，沿用 Alova 默认网关，调用时读取客户 Authorization，关闭缓存。

签发输入 `{ id, remark }`，id 是持卡编号，成功返回不透明 token 字符串。`models/mappers.ts` 拒绝空白或非字符串凭证。撤回输入 `{ id }`，成功后卡包重新查询。

## 数据所有权与操作

当前卡片、留言、准备状态和本地凭证归本页；分享凭证、发送账户、24 小时有效期及序列归本模块 mock/state.ts。

从当前卡包查询持卡，使用卡包公开状态规则判断可赠送。卡片、留言、账户变化后清除本地凭证；迟到签发响应不恢复旧凭证。微信使用现有按钮分享，其他端保持现有平台提示。撤回由卡包页面调用本模块公开 API。

`mock/state.ts` 提供 createShareState，封装 issue/get/remove/expire/reset；过期事件只记录一次。`mock/index.ts` 只导出 shareState，供卡包初始样本与领取处理协作。凭证 Map 不导出，Mock 登记不从专用出口加载。

卡包资产字段见 [gift-card 数据参考](../../gift-card/docs/db.md)。分享凭证生命周期见 [赠送数据参考](../../gift-card-send/docs/db.md)，流水事件字段见 [流水数据参考](../../gift-card-logs/docs/db.md)。

## 后端待确认

真实表名、主外键、SQL 类型、NULL/默认值、租户与账户授权、软删除、事务、并发、幂等和超时恢复契约均待后端确认。TypeScript 可选字段不等于 SQL 可空；开发 Mock 的同步写入不是后端事务保证。接口对象不作为数据库表名，不据当前前端反推 SQL。
