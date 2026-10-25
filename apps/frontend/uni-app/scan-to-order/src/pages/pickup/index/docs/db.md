# 取餐进度接口与字段

## 接口约定

GET /order/list：参数 type=0、statusBatch=1,2；返回 OrderDoingData。

## 字段与行为

orderList：订单列表；goodsMap、logisticsMap：按订单 ID 索引。id 为订单标识，hxNumber 为核销码，qudanhao 为取餐号，isNeedLogistics 为配送标记，amountReal 为实付。客户登录后查询，登出刷新清空状态；迟到响应和销毁页面不写回。

## 数据来源

接口路径清单以本领域 api/endpoints.ts 为准；复用模块以其公开入口为准。统一响应信封为 { code, message, data }，由 src/http/alova.ts 解包。除明确标注的前端开发契约外，路径沿用原复制代码约定，尚未完成真实后端联调。

当前没有数据库 DDL 或真实服务端表结构，不能据前端字段推断实际数据库表名、主外键、事务或索引。

## 模拟边界

模拟接口位于所属领域 mock/；Mock 入口独立于运行时 index.ts。测试通过现有 Alova 入口验证响应与失败分支。未登记接口仍访问网络，生产构建不启用 Mock。
