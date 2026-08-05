import { computed, defineComponent, h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { SiteFooter, SiteHeader } from '../../../packages/site-shell/src/index'
import { projectLinks } from '../../../config/project'
import FormatCatalog from './FormatCatalog.vue'
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

const PreviewDockDocsLayout = defineComponent({
  setup() {
    const { page } = useData()
    const locale = computed(() => page.value.relativePath.startsWith('en/') ? 'en' : 'zh-CN')
    return () => h('div', { class: 'previewdock-docs-shell' }, [
      h(SiteHeader, { active: 'docs', links: projectLinks, locale: locale.value }),
      h(DefaultTheme.Layout),
      h(SiteFooter, { links: projectLinks, locale: locale.value }),
    ])
  },
})

export default {
  ...DefaultTheme,
  Layout: PreviewDockDocsLayout,
  enhanceApp({ app }) {
    app.component('FormatCatalog', FormatCatalog)
    if (typeof window !== 'undefined') {
      window.addEventListener('click', forceDocsNavigation, true)
    }
  },
}
