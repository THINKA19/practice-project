import type { SkuGroup } from './types'
import { computed } from 'vue'

/** 受控选择：稳定 ID 区分选项，每个调用方独立维护状态。 */
export function useSkuSelector(groups: () => SkuGroup[], onSelect: (groupId: number, choiceId: number) => void) {
  const complete = computed(() => groups().every(group => !group.required || group.choices.some(choice => choice.active && !choice.disabled)))
  const selectedNames = computed(() => groups().flatMap(group => group.choices.filter(choice => choice.active).map(choice => choice.name)))
  function select(groupId: number, choiceId: number) {
    const choice = groups().find(group => group.id === groupId)?.choices.find(choice => choice.id === choiceId)
    if (choice && !choice.disabled)
      onSelect(groupId, choiceId)
  }
  return { complete, selectedNames, select }
}
