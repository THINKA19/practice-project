// 历史参考资料：禁止正式业务导入；按需提取到正式模块后再接入和验证。
import { expect, it, vi } from 'vitest'
import { usePagedList } from '../usePagedList'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}

it('刷新后旧响应不覆盖新列表', async () => {
  const old = deferred<{ list: number[] }>()
  const latest = deferred<{ list: number[] }>()
  const fetcher = vi.fn().mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise)
  const paging = usePagedList<number>(fetcher)
  const first = paging.refresh()
  const second = paging.refresh()
  latest.resolve({ list: [2] })
  await second
  old.resolve({ list: [1] })
  await first
  expect(paging.list.value).toEqual([2])
  expect(paging.loading.value).toBe(false)
})

it('销毁后失败不更新状态，失败页允许重试', async () => {
  const pending = deferred<{ list: number[] }>()
  const paging = usePagedList(() => pending.promise)
  const task = paging.refresh()
  paging.dispose()
  pending.reject(new Error('late'))
  await task
  expect(paging.error.value).toBeUndefined()
  const fetcher = vi.fn().mockRejectedValueOnce(new Error('retry')).mockResolvedValueOnce({ list: [1] })
  const retry = usePagedList<number>(fetcher)
  await retry.loadMore()
  await retry.loadMore()
  expect(fetcher).toHaveBeenNthCalledWith(2, 1, 20)
  expect(retry.list.value).toEqual([1])
})
