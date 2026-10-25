# 商家门店权限

通过 session 只读状态获得商家身份和 token。服务端授予的 merchantId、shopId、成员角色和具体 permissions 决定操作权限。

VITE_SHOP_SHOPS_URL、VITE_SHOP_GRANT_URL、VITE_SHOP_INVITE_URL 分别配置门店列表、门店授权和邀请接口。未配置时明确拒绝请求，不使用顾客权限替代。没有选中门店或权限刷新失败时不放行。

换账号清空上下文；切店乱序只保留最后选择；capture/matches 用于丢弃旧门店请求结果。最近门店按用户 ID 存储；权限始终从后端重取。
