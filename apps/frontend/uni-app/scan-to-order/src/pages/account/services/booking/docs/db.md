# 预约订座接口与字段

- POST /shop/subshop/list 增加可选 capability=table-booking，服务端按地区、关键词和预约能力过滤后分页。
- GET /yuyue/info 使用现有 SECONDARY 网关，传 key=table-booking、shopId。返回 id（该店的活动 ID）、shopName、slots（门店本地时间 YYYY-MM-DD HH:mm）。客户端在日期和时间联动弹层中展示未来七天内由门店提供的偶数整点起始时段，从 10:00–12:00 到 22:00–24:00，每两小时切一档，提交时再次检查范围。
- POST /yuyue/join 使用 SECONDARY 网关，提交 shopId、yuyueId、requestId、extJsonStr。扩展字段为姓名、联系电话、到店时间、用餐人数。联系电话提交含国家区号的国际格式，例如 +84912345678。到店时间沿用原格式提交所选时段的起点。服务端需检查顾客身份、活动归属、预约能力和实时容量，并按顾客与 requestId 幂等。
- accepted=true 表示接收申请。缺失确认时页面锁定本次提交并提示联系门店核对。正式预约单号、门店确认状态和结果查询需要服务端契约。

业务 Mock 展示开通和未开通门店、门店活动匹配和时段校验。正式接口需要在预发联调。
