import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { SiteFooter, SiteHeader } from '../../../packages/site-shell/src/index'
import { projectLinks } from '../../../config/project'
import '../../../packages/site-shell/src/styles.css'
import './custom.css'

function forceDocsNavigation(event: MouseEvent) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const anchor = (event.composedPath().find(node => node instanceof HTMLAnchorElement) as HTMLAnchorElement | undefined)
  const href = anchor?.getAttribute('href')
  if (!href || !href.startsWith('/docs/') || href.startsWith('#')) return
  event.preventDefault()
  event.stopImmediatePropagation()
  window.location.assign(href)
}

export default {
  ...DefaultTheme,
  Layout: () => h('div', { class: 'previewdock-docs-shell' }, [
    h(SiteHeader, { active: 'docs', links: projectLinks }),
    h(DefaultTheme.Layout),
    h(SiteFooter, { links: projectLinks }),
  ]),
  enhanceApp() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', forceDocsNavigation, true)
    }
  },
}
