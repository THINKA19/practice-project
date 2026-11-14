# 门店授权接口契约

生产服务应按已认证账号、商家和门店授权校验每次请求。员工仅能访问当前门店的履约订单和授予的动作。订单列表、详情及动作响应省去金额、商品单价和结算信息，工作台概览省去流水。桌台配置、经营管理及员工授权接口需要老板身份和对应权限。停用账号后应立即拒绝其已发凭证访问业务数据。员工授权更新仅接受履约权限。

后端路径通过 VITE_SHOP_SHOPS_URL、VITE_SHOP_GRANT_URL、VITE_SHOP_INVITE_URL 配置，旧 /operator/* 路径不再视为已核实服务。

门店列表返回 MerchantShop[]；授权查询使用 GET {shopId}，返回与请求 shopId 一致的 MerchantShop；接受邀请 POST {code}。身份凭证使用 Authorization 请求头。

MerchantShop 包含 id、merchantId、name、roleTemplate（owner/employee）、permissions:string[]、grantVersion、soundNotify。真实账户/门店归属、授权项目、邀请有效期及幂等规则待服务端确认。客户端规则与 Mock 测试不能证明后端授权已完成。
