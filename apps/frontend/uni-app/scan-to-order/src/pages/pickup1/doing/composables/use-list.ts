import type { PickupScene } from '../models/types'
import { ref } from 'vue'
import { usePickupOrders } from '@/pages/pickup/shared'
import { doingApi } from '../api/orders.api'

/** 取餐一的列表测试页，通过独立演示接口切换场景。 */
export function useOrderDoingList() {
  const scene = ref<PickupScene>('ready')
  const scenes: PickupScene[] = ['ready', 'preparing', 'empty']
  const state = usePickupOrders(() => doingApi.preview(scene.value))
  function selectScene(value: PickupScene) {
    scene.value = value
    return state.refresh()
  }
  return { ...state, scene, scenes, selectScene, fetchOrderList: state.refresh }
}
