# 排队取号接口与字段

## 接口约定

GET /queuing/types：返回 QueueType[] 或 { result: QueueType[] }。
GET /queuing/my：返回 MyQueueRecord[]，每项含 queuingLog 和 queuingUpType。
POST /queuing/get：参数 typeId、mobile；成功后重新查询我的号码。

## 字段与行为

id/typeId：桌型或记录标识；number：我的号；curNumber：当前叫号；minitus：每号预计分钟数（保留接口拼写）。等待时间规则位于 models/queue.ts。Mock 按凭证隔离顾客记录，同一顾客只允许一个有效排队号，发号序列按桌型共享。

## 数据来源

接口路径清单以本领域 api/endpoints.ts 为准；复用模块以其公开入口为准。统一响应信封为 { code, message, data }，由 src/http/alova.ts 解包。除明确标注的前端开发契约外，路径沿用原复制代码约定，尚未完成真实后端联调。

当前没有数据库 DDL 或真实服务端表结构，不能据前端字段推断实际数据库表名、主外键、事务或索引。

## 模拟边界

模拟接口位于所属领域 mock/；Mock 入口独立于运行时 index.ts。测试通过现有 Alova 入口验证响应与失败分支。未登记接口仍访问网络，生产构建不启用 Mock。

## 开发演示契约

GET /demo/queue/snapshot 返回 { types, records }；POST /demo/queue/action 参数 { action: take|cancel|call|seat, id }，take/call 的 id 是桌型 id，cancel/seat 是记录 id。

状态：0 等待、1 已叫号、2 已入座、3 已取消、4 已过号。叫下一桌将上一条未入座的已叫号记录标为过号。取消/入座只能操作调用者的记录。桌型 status=0 开放、1 暂停；minPeople/maxPeople 为适用人数。numberGet 为累计已发号，numberWait 为仍在等待的桌数，aheadTables 为有效前方桌数。

Mock 发号序列按桌型共享且单调递增；跨桌型只允许一个有效号码。数据仅在开发进程存活，不保证重启保留。以上是演示契约，尚未映射真实取消、店员叫号和入座接口。
