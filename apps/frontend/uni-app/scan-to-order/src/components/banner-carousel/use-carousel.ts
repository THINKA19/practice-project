import { computed } from 'vue'
import type { BannerCarouselItem } from './types'

/** 只处理展示数据与点击映射，不请求接口、不读取门店、不执行跳转。 */
export function useCarousel<T extends BannerCarouselItem>(props: { items: T[] }, onSelect: (item: T) => void) {
  const slides = computed(() => props.items.filter(item => typeof item.picUrl === 'string' && item.picUrl.trim()))
  const images = computed(() => slides.value.map(item => item.picUrl))
  const multiple = computed(() => slides.value.length > 1)

  function select(event: { index: number }) {
    if (!Number.isInteger(event.index) || event.index < 0)
      return
    const item = slides.value[event.index]
    if (item)
      onSelect(item)
  }

  return { slides, images, multiple, select }
}
