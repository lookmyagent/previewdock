<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getLocalizedPath, getSiteLocale, setSiteLocale, siteLabels } from './i18n'
import type { SiteLinks, SiteLocale, SiteSection } from './types'

const props = defineProps<{
  active: SiteSection
  links: SiteLinks
  locale?: SiteLocale
}>()

const emit = defineEmits<{ changeLocale: [locale: SiteLocale] }>()
const currentLocale = ref<SiteLocale>(props.locale || getSiteLocale())
const labels = computed(() => siteLabels[currentLocale.value])
const localizedLinks = computed(() => ({
  site: getLocalizedPath(props.links.site, currentLocale.value),
  playground: getLocalizedPath(props.links.playground, currentLocale.value),
  docs: getLocalizedPath(props.links.docs, currentLocale.value),
}))

const isActive = (section: SiteSection) => props.active === section
watch(() => props.locale, locale => {
  if (locale) currentLocale.value = locale
})

function toggleLocale() {
  const nextLocale = currentLocale.value === 'zh-CN' ? 'en' : 'zh-CN'
  setSiteLocale(nextLocale)
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/docs/')) {
    window.location.assign(getLocalizedPath(props.links.docs, nextLocale))
    return
  }
  currentLocale.value = nextLocale
  emit('changeLocale', nextLocale)
}

function navigateSurface(event: MouseEvent, href: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  event.stopPropagation()
  window.location.assign(href)
}
</script>

<template>
  <header class="site-header">
    <a class="site-brand" :href="localizedLinks.site" :aria-label="`PreviewDock ${labels.home}`" @click="navigateSurface($event, localizedLinks.site)">
      <span class="site-brand__mark">PD</span>
      <span class="site-brand__name">PreviewDock</span>
    </a>

    <nav class="site-header__nav" :aria-label="labels.mainNav">
      <a :class="{ 'is-active': isActive('home') }" :href="localizedLinks.site" :aria-current="isActive('home') ? 'page' : undefined" @click="navigateSurface($event, localizedLinks.site)">{{ labels.home }}</a>
      <a :class="{ 'is-active': isActive('playground') }" :href="localizedLinks.playground" :aria-current="isActive('playground') ? 'page' : undefined" @click="navigateSurface($event, localizedLinks.playground)">{{ labels.playground }}</a>
      <a :class="{ 'is-active': isActive('docs') }" :href="localizedLinks.docs" :aria-current="isActive('docs') ? 'page' : undefined" @click="navigateSurface($event, localizedLinks.docs)">{{ labels.docs }}</a>
    </nav>

    <div class="site-header__actions">
      <a class="site-header__repo" :href="links.github" target="_blank" rel="noreferrer">{{ labels.github }}</a>
      <a v-if="links.gitee" class="site-header__repo" :href="links.gitee" target="_blank" rel="noreferrer">{{ labels.gitee }}</a>
      <button class="site-header__locale" type="button" :aria-label="labels.language" @click="toggleLocale">{{ labels.languageSwitch }}</button>
    </div>

    <details class="site-header__mobile">
      <summary :aria-label="labels.menu">{{ labels.menu }}</summary>
      <div>
        <a :class="{ 'is-active': isActive('home') }" :href="localizedLinks.site" @click="navigateSurface($event, localizedLinks.site)">{{ labels.home }}</a>
        <a :class="{ 'is-active': isActive('playground') }" :href="localizedLinks.playground" @click="navigateSurface($event, localizedLinks.playground)">{{ labels.playground }}</a>
        <a :class="{ 'is-active': isActive('docs') }" :href="localizedLinks.docs" @click="navigateSurface($event, localizedLinks.docs)">{{ labels.docs }}</a>
        <a :href="links.github" target="_blank" rel="noreferrer">{{ labels.github }}</a>
        <a v-if="links.gitee" :href="links.gitee" target="_blank" rel="noreferrer">{{ labels.gitee }}</a>
        <button type="button" @click="toggleLocale">{{ labels.language }}: {{ labels.languageSwitch }}</button>
      </div>
    </details>
  </header>
</template>
