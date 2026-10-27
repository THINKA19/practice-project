# 预约订座接口与字段

## 接口约定

POST /yuyue/join：参数 yuyueId、extJsonStr。extJsonStr 为姓名、联系电话、到店时间、用餐人数的 JSON。请求使用既有 SECONDARY 域名配置。

## 字段与行为

yuyueId 优先取业务入口页面参数，缺省时通过 bookingApi.info() 查询活动 ID；旧 shared/settings 不存在，当前不臆造系统配置来源。缺少活动 ID 时阻止提交。Mock 校验参数后返回 accepted=true，表示模拟接受报名，不代表真实占座。

## 数据来源

接口路径清单以本领域 api/endpoints.ts 为准；复用模块以其公开入口为准。统一响应信封为 { code, message, data }，由 src/http/alova.ts 解包。除明确标注的前端开发契约外，路径沿用原复制代码约定，尚未完成真实后端联调。

当前没有数据库 DDL 或真实服务端表结构，不能据前端字段推断实际数据库表名、主外键、事务或索引。

## 模拟边界

模拟接口位于所属领域 mock/；Mock 入口独立于运行时 index.ts。测试通过现有 Alova 入口验证响应与失败分支。未登记接口仍访问网络，生产构建不启用 Mock。

提交响应当前仅认可 data.accepted=true，表示申请已接收，不等于订座成功。无效响应或提交异常进入当前页面待核对状态，禁止再次提交；未提供服务端幂等键和结果查询，重进页面后的去重仍未实现。
