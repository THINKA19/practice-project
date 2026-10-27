export interface GroupScrollState {
  left: number
  width: number
  viewport: number
  dragging: boolean
  dragMoved: boolean
  startX: number
  startLeft: number
}
export interface HorizontalScrollEvent { detail: { scrollLeft: number, scrollWidth: number } }
