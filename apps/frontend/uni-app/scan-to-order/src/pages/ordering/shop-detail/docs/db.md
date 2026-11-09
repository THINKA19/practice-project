# 门店详情数据契约

本目录不拥有独立数据库表、接口或 Mock。门店 API、DTO 和模型由 [门店数据领域](../../index/docs/db.md) 维护，页面通过其 `index.ts` 使用 `shopApi.detail` 和 `toShopDetail`。

输入为 URL 门店 `id`；展示字段包含 name、pic、introduce、characteristic、linkPhone、openingHours、address。详情快照还提供 latitude、longitude、coordinateType、countryCode 供位置页使用；mapPreview 为可选位置图片，详情页直接展示并支持预览缩放；缺失或加载失败显示明确提示，不生成替代位置图。地图标记由坐标派生，不是数据库记录。

详情快照仅属于当前页面实例。生产数据库结构、真实坐标及电话有效性待后端确认；本次为归属调整，未新增接口或执行生产请求。

详情展示新增 photos、services、arrivalGuide、parkingInfo、notice，均为可选字段，无值不显示相关区块。封面与相册去重用于图片预览。地图与外部导航保留原始坐标事实，展示时按目标坐标系转换；不将转换结果写回门店数据。
