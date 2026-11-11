# 礼品卡流水数据参考

来源：当前模块源码、既有接口调用和开发 Mock；核对日期：2026-11-10。未取得后端源码、SQL DDL 或权威数据库字典。

## 本模块契约

- 接口：`POST /card/logs`。
- 调用：`cardLogsApi.logs`，沿用 Alova 默认网关，调用时读取客户 Authorization，关闭缓存。

`cardId` 为持卡编号，`page` 从 1 开始，`pageSize` 为正整数（页面固定 20）。响应为 `{ result: CardLog[], totalPage?: number }`，null 归一为空列表；缺少总页数时按返回数量判断末页。

## 数据所有权与操作

当前卡号、持卡摘要、页码、失败和加载状态归本页；事件记录、初始流水样本及 reset 归本模块 mock/。

先查询卡包验证当前客户持卡，再请求流水。成功才推进页码；分页失败保留原列表并重试同一页；刷新清空旧列表并重新验证持卡。畸形流水或总页数进入失败状态。

`mock/data.ts` 创建独立的初始流水样本，`mock/state.ts` 封装读快照、初始化、替换和记录事件。`mock/index.ts` 仅导出 logState 给其他 Mock；外部不得访问内部 Map。领取时清理旧持有人的流水，避免备注泄露。

卡包资产字段见 [gift-card 数据参考](../../gift-card/docs/db.md)。分享凭证生命周期见 [赠送数据参考](../../gift-card-send/docs/db.md)，流水事件字段见 [流水数据参考](../../gift-card-logs/docs/db.md)。

## 后端待确认

真实表名、主外键、SQL 类型、NULL/默认值、租户与账户授权、软删除、事务、并发、幂等和超时恢复契约均待后端确认。TypeScript 可选字段不等于 SQL 可空；开发 Mock 的同步写入不是后端事务保证。接口对象不作为数据库表名，不据当前前端反推 SQL。

## 流水字段

- id：流水编号；amount：本次绝对数量，type=0 时按次数，type=1 时当前界面按元展示，生产单位需后端确认。
- dateAdd：记录时间字符串；真实格式与时区待确认。remark/typeStr：可选说明。balance：事件后可用数量。
- eventType：可选 purchase、consume、refund、exchange、share、cancel、receive、shareExpired；未知事件保留 typeStr 兜底。
- direction：可选 debit/credit/none；relatedLogId：返还关联的原扣减编号。

事件扩展已用于前端与 Mock，不证明生产服务已支持。缺省扩展字段仍兼容旧消费记录；非资产事件不显示虚假扣款。
