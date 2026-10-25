# 服务接口与字段

## 接口约定

GET /service/gallery：返回 ActivityGalleryGroup[]。该路径为当前前端与 Mock 的开发契约，真实后端尚未确认。

## 字段与行为

group.id：分组标识；title：标题；images：图片数组；image.url/label：本地图片路径与说明；moreUrl：可选应用内地址。Mock 使用 src/mock/assets/images/lunbo 的本地资源，不伪造更多页面。H5 鼠标拖动与箭头采用条件编译，其他端使用 scroll-view 触摸；状态按组件隔离，销毁移除监听。

## 数据来源

接口路径清单以本领域 api/endpoints.ts 为准；复用模块以其公开入口为准。统一响应信封为 { code, message, data }，由 src/http/alova.ts 解包。除明确标注的前端开发契约外，路径沿用原复制代码约定，尚未完成真实后端联调。

当前没有数据库 DDL 或真实服务端表结构，不能据前端字段推断实际数据库表名、主外键、事务或索引。

## 模拟边界

模拟接口位于所属领域 mock/；Mock 入口独立于运行时 index.ts。测试通过现有 Alova 入口验证响应与失败分支。未登记接口仍访问网络，生产构建不启用 Mock。

当前六组展示为门店活动、用餐环境、餐品展示、聚会活动、节日主题、服务瞬间，每组 16 项，轮换使用八张本地样本图片。title 为接口原始标题，titleKey 为演示栏目的可选本地语言键；没有 titleKey 的真实接口栏目继续展示其原始 title。服务列表不限制后端返回的分组数量。
