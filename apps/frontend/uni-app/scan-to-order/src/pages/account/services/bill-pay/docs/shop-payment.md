# 优惠买单流程收敛

唯一正式入口为 /pages/account/services/bill-pay/index，ClientRoutes.Ordering.youhuiPay 已指向此页。重复的点餐优惠买单页面及其独占旧流程、模型与未消费样本已移除。

正式页面继续使用本领域 useBillPayPage、useBillPayDiscounts、useBillPayPayment；保留模拟买单与真实支付未开放限制，不迁入旧流程的余额扣款或在线支付分支。接口、模型、规则及 Mock 归本领域，不新增第二套实现。数据契约见 [db.md](./db.md)。

源码未发现被移除页面的固定调用；后台动态链接、历史分享及小程序码未联调，维护方需将其目标更新为正式入口。
