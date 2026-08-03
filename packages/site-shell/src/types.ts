export type SiteSection = 'home' | 'playground' | 'docs'
export type SiteLocale = 'zh-CN' | 'en'

export interface SiteLinks {
  site: string
  docs: string
  playground: string
  github: string
  gitee?: string
  issues?: string
  releases?: string
}
