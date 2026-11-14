# 门店经营汇总接口参考

统计模块通过 api/endpoints.ts 登记 GET /operator/shop/statistics，携带会话令牌、shopId 和 period。生产服务能力由 VITE_SHOP_BACKEND_ENABLED 控制，真实接口契约仍待确认。

开发 Mock 的周期值为 0 今日、1 近 7 天、2 近 30 天、3 全部历史。短周期含当日，全部历史从最早可追溯的门店业务日至当天。range 返回 start 和 end，历史无记录时 start 为 null。

新增周期 4 为上个月，从门店当地上月 1 日到月末。周期 7 为门店当地昨日，页面筛选使用 0、7、1。周期 3 用于独立累计卡。coverage.fromOpening 为 true 时表示明确覆盖开业以来。

channels 返回订单中心五类数量。堂食、外卖、自取和收银按非取消订单下单日统计，收银可与其他类型重叠。预约按预约到店日统计非取消预约，需要 booking.read。收银遵循订单中心的老板及金额权限。未提供的分类省略字段。

响应含 overview、trend、topGoods。trend 按门店当地业务日返回 YYYY-MM-DD 和当日订单金额。固定周期补零，全部历史按有有效订单的日期返回。金额字段需校验 order.amount.read，缺失金额时省略金额指标并返回空趋势。overview 的 unitsSold 汇总有效订单商品份数，completedCount 和 cancelledCount 分别统计所选期间下单、当前状态为已完成和已取消的订单。商品聚合优先使用 productId，旧数据按商品名归并。销量榜按份数排序截取前十。

finance 为可选字段，仅向有统计和金额权限的账号返回。金额以门店结算币种的主单位表示，已确认的零值返回 0，缺少数据时省略对应字段。

- receivedAmount 按付款成功日汇总。paidOrderCount 按期间内成功付款的订单去重。Mock 使用每单单次收款和全额退款的订单事件，正式服务应以支付和退款流水金额汇总。
- refundedAmount 按退款成功日汇总，含部分退款和旧订单的当期退款。净收款由实收与退款差额得出。
- pendingAmount 是查询时整家门店有效订单的待收余额，与期间筛选无关。Mock 仅在老板有全店数据、且相关订单的支付状态和金额齐备时提供。

正式服务需校验账号对当前门店的 statistics.read 和金额访问权限，并确定历史留存、门店时区、币种、统计状态口径及历史聚合方式。
