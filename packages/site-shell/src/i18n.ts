import type { SiteLocale } from './types'

const localeStorageKey = 'previewdock.locale'

export const siteLabels: Record<SiteLocale, {
  home: string
  playground: string
  docs: string
  mainNav: string
  github: string
  gitee: string
  menu: string
  language: string
  languageSwitch: string
  product: string
  documentation: string
  project: string
  quickStart: string
  formats: string
  api: string
  tagline: string
}> = {
  'zh-CN': {
    home: '首页', playground: '在线预览', docs: '文档', mainNav: '主导航', github: 'GitHub', gitee: 'Gitee',
    menu: '菜单', language: '语言', languageSwitch: 'EN', product: '产品', documentation: '文档', project: '项目',
    quickStart: '快速开始', formats: '格式支持', api: 'API', tagline: '浏览器原生文件预览运行时。',
  },
  en: {
    home: 'Home', playground: 'Playground', docs: 'Docs', mainNav: 'Main navigation', github: 'GitHub', gitee: 'Gitee',
    menu: 'Menu', language: 'Language', languageSwitch: '中文', product: 'Product', documentation: 'Docs', project: 'Project',
    quickStart: 'Getting started', formats: 'Formats', api: 'API', tagline: 'Browser-native file preview runtime.',
  },
}

export function getSiteLocale(): SiteLocale {
  if (typeof window === 'undefined') return 'zh-CN'
  const queryLocale = new URLSearchParams(window.location.search).get('lang')
  if (queryLocale === 'en' || queryLocale === 'zh-CN') {
    setSiteLocale(queryLocale)
    return queryLocale
  }
  if (window.location.pathname.startsWith('/docs/')) {
    const docsLocale = window.location.pathname.startsWith('/docs/en') ? 'en' : 'zh-CN'
    setSiteLocale(docsLocale)
    return docsLocale
  }
  const savedLocale = window.localStorage.getItem(localeStorageKey)
  if (savedLocale === 'en' || savedLocale === 'zh-CN') return savedLocale
  return window.navigator.language.toLowerCase().startsWith('en') ? 'en' : 'zh-CN'
}

export function setSiteLocale(locale: SiteLocale): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(localeStorageKey, locale)
  document.documentElement.lang = locale
}

export function getLocalizedPath(path: string, locale: SiteLocale): string {
  if (path === '/docs' || path.startsWith('/docs/')) return locale === 'en' ? '/docs/en/' : '/docs/'
  if (path === '/') return locale === 'en' ? '/?lang=en' : '/?lang=zh-CN'
  if (path === '/playground' || path.startsWith('/playground/')) {
    return locale === 'en' ? '/playground/?lang=en' : '/playground/?lang=zh-CN'
  }
  return path
}

export function getLocalizedDocsPath(pathname: string, locale: SiteLocale): string {
  const docsPath = pathname
    .replace(/^\/docs\/?/, '')
    .replace(/^en\/?/, '')
    .replace(/^\/+|\/+$/g, '')

  if (!docsPath) return locale === 'en' ? '/docs/en/' : '/docs/'
  return locale === 'en' ? `/docs/en/${docsPath}` : `/docs/${docsPath}`
}
