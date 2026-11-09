/** 结算页会员卡选择；优惠券不参与本页报价和提交。 */
import type { MyCard } from '@/pages/home/service/gift-card'
import { ref } from 'vue'
import { cardApi } from '@/pages/home/service/gift-card'
/** 加载当前账号可用会员卡。 */
export function usePayCardSelect() {
  const cardMyList = ref<MyCard[]>([])
  const curCard = ref<MyCard | null>(null)
  async function loadCardList() {
    try {
      const list = await cardApi.my()
      cardMyList.value = list.filter(card => !!card.isActive && Number(card.amount) > 0)
    }
    catch {}
  }
  function selectCard(card: MyCard | null) {
    curCard.value = card
  }
  return { cardMyList, curCard, loadCardList, selectCard }
}
export type CardSelectVm = ReturnType<typeof usePayCardSelect>
