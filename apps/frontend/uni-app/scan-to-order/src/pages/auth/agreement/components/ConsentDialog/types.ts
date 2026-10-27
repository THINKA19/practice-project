/** Content supplied by a host; the dialog has no account, route or storage dependency. */
export interface DialogProps {
  visible: boolean
  title: string
  paragraphs: string[]
  readLabel: string
  acceptLabel: string
  rejectLabel: string
}
