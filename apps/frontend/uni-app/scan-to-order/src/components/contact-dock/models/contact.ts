export interface ContactItem {
  id: string
  label: string
  icon: string
  color: string
  background: string
  action: { type: 'copy', value: string } | { type: 'link', value: string }
}
