import type { PickupDemoScene } from './types'

export const PICKUP_DEMO_SCENES: { value: PickupDemoScene, label: string }[] = [
  { value: 'pickup', label: 'pickupPreview.pickupScene' },
  { value: 'delivery', label: 'pickupPreview.deliveryScene' },
  { value: 'unpaid', label: 'pickupPreview.unpaidScene' },
  { value: 'finished', label: 'pickupPreview.finishedScene' },
]
