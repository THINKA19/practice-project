# 位置页数据契约

无独立表和写入接口。门店信息来自 [详情领域](../../shop-detail/docs/db.md)，最终数据所有者是 [门店数据领域](../../index/docs/db.md)。不复制其接口、DTO、模型或 Mock。

URL `id` 必须能转为正整数。页面消费 name、address、latitude、longitude、coordinateType、countryCode；地图标记由有效坐标派生；H5 使用无 Key 的 Google Maps 网页 iframe，原生端使用平台 map。mapPreview 不再用于位置页。剪贴板和外部导航只属于设备交互，不表示服务端修改。

正式坐标系和真实地址由后端提供，本目录不提供配送区域或导航服务保证。

位置页不展示 arrivalGuide、parkingInfo、photos 和 pic；这些内容留在详情页。没有坐标不阻止查看地址或生成 Google 地址路线；没有地址禁用地址复制，地址与坐标均缺失时禁用 Google 链接。原始坐标不被地图交互修改，转换仅用于展示与平台导航。H5 不需要地图 Key、安全码或结算账户；Google iframe 使用门店坐标/当地地址，外部导航与地图加载均不写入服务端。小程序平台内置能力及第三方链接的实际海外可用性需分别验证。
