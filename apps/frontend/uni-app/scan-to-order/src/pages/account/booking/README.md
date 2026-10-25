# 预约订座

从取号页“预约订座”打开 /pages/queue/booking/index?yuyueId=demo-booking。调用方显式提供活动 ID，不从已删除的 shared/settings 读取配置。

页面使用内部 z-paging 展示联系人、电话、到店时间和用餐人数。游客可查看表单，提交时检查顾客登录身份；未登录打开现有 /pages/auth/login。

api/endpoints.ts 定义 POST /yuyue/join；models/booking.ts 拥有表单类型、人数选项与转换规则；composables/ 拥有表单和提交状态。日期弹层使用 root-portal 和独立层级。

mock/ 为独立模拟入口，校验参数后表示模拟接受报名，不代表真实占座。真实预约仍需有效活动 ID、登录服务及门店确认。

详见 [接口与字段](./docs/db.md)。
