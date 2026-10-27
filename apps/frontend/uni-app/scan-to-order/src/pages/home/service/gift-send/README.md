# gift-send

赠送礼品卡：从卡包选择卡片后进入，生成凭证并通过微信按钮分享。

页面入口为 index.vue，页面流程归 composables/use-page.ts；领域接口与类型通过 ../gift-card/index.ts 使用。路由由 ClientRoutes.Home 维护。

归属：本业务以首页服务入口组织，卡片领域由 gift-card 维护，gift-send 和 gift-receive 分别拥有赠送与领取页面流程，跨模块通过 gift-card/index.ts 使用接口和类型。
