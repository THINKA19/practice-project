export interface CmsPage {
  info: {
    title?: string
    content?: string
    contact?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}
