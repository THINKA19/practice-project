<script lang="ts">
/**
 * ============================================================================
 * 【文件概述】底部选店首页入口，仅装配本模块共享选店组件与页面配置。
 * 【方法与导出清单】default：选店页面组件。
 * 【综合使用示例】import ShopSelectionPage from './components/ShopSelectionPage/index.vue'; // 本领域页面装配选店组件
 * ============================================================================
 */
import ShopSelectionPage from './components/ShopSelectionPage/index.vue'

definePage({ style: { navigationBarTitleText: '选择门店', disableScroll: true } })
export default ShopSelectionPage
</script>
