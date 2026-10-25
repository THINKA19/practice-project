# 订单详情接口与字段

## 接口约定

GET /order/detail：参数 id，返回 OrderDetailData。
GET /shop/subdetail：参数 id，返回 ShopSubItem。

## 字段与行为

取餐一测试页只调用下述演示契约，不将传入 ID 作为正式订单入口。orderInfo.status：-1 关闭、0 待付、1/2 进行中、3/4 完成。保留 /order/detail 契约供接口测试使用，不用于取餐一页面加载；模拟支付成功后只更新独立演示订单。

## 数据来源

接口路径清单以本领域 api/endpoints.ts 为准；复用模块以其公开入口为准。统一响应信封为 { code, message, data }，由 src/http/alova.ts 解包。除明确标注的前端开发契约外，路径沿用原复制代码约定，尚未完成真实后端联调。

当前没有数据库 DDL 或真实服务端表结构，不能据前端字段推断实际数据库表名、主外键、事务或索引。

## 模拟边界

模拟接口位于所属领域 mock/；Mock 入口独立于运行时 index.ts。测试通过现有 Alova 入口验证响应与失败分支。未登记接口仍访问网络，生产构建不启用 Mock。

## H5 演示契约

GET /demo/pickup/detail 接收 scene（pickup、delivery、unpaid、finished），返回独立样本订单 201 的 OrderDetailData。POST /demo/pickup/pay 只返回模拟付款后的同一演示订单，不能用于真实支付。无参数的底部入口加载本接口，不依赖取餐列表接口。
