<script setup lang="ts">
/**
 * ============================================================================
 * 【文件概述】菜单选品 / components/catalog/CategorySidebar/index.vue
 * 展示层：通过属性与事件组装本领域交互。
 * 【方法与导出清单】
 * - 默认 Vue 组件。
 * 【综合使用示例】
 * import CategorySidebar from '@/pages/ordering/menu/components/catalog/CategorySidebar/index.vue'
 * // 在所属领域的模板中绑定本组件声明的 props 与事件。
 * ============================================================================
 */
import type { Category } from '../../../models/goods.types'

/**
 * 左侧分类栏（高亮跟随商品列表滚动，徽章为购物车中该分类的数量）
 */

defineProps<{
  categories: Category[]
  active: number
  /** 分类 id → 购物车数量 */
  badges: Record<number, number>
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

function onChange(e: { value: number | string }) {
  emit('select', Number(e.value))
}
</script>

<template>
  <scroll-view class="category-sidebar" scroll-y>
    <wd-sidebar :model-value="active" @change="onChange">
      <wd-sidebar-item
        v-for="(item, index) in categories"
        :key="item.id"
        :value="index"
        :label="item.name"
        :custom-style="index === active ? 'color: var(--app-brand-primary, #8b4513);' : ''"
        :badge="badges[item.id] || undefined"
      />
    </wd-sidebar>
  </scroll-view>
</template>

<style lang="scss" scoped>
.category-sidebar {
  --wot-sidebar-item-color-active: var(--app-brand-primary, #8b4513);

  flex-shrink: 0;
  width: 180rpx;
  height: 100%;
  overflow: hidden;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}
</style>
