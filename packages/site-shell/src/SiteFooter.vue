<script setup lang="ts">
import { computed } from 'vue'
import { getLocalizedPath, getSiteLocale, siteLabels } from './i18n'
import type { SiteLinks, SiteLocale } from './types'

const props = defineProps<{ links: SiteLinks; locale?: SiteLocale }>()
const currentLocale = computed(() => props.locale || getSiteLocale())
const labels = computed(() => siteLabels[currentLocale.value])
const siteUrl = computed(() => getLocalizedPath(props.links.site, currentLocale.value))
const playgroundUrl = computed(() => getLocalizedPath(props.links.playground, currentLocale.value))
const docsUrl = computed(() => getLocalizedPath(props.links.docs, currentLocale.value))

function navigateSurface(event: MouseEvent, href: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  event.stopPropagation()
  window.location.assign(href)
}
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__brand">
      <a class="site-brand" :href="siteUrl" @click="navigateSurface($event, siteUrl)"><span class="site-brand__mark">PD</span><span class="site-brand__name">PreviewDock</span></a>
      <p>{{ labels.tagline }}</p>
      <small>0.2.0 · Stable · Apache-2.0</small>
    </div>
    <div>
      <strong>{{ labels.product }}</strong>
      <a :href="siteUrl" @click="navigateSurface($event, siteUrl)">{{ labels.home }}</a>
      <a :href="playgroundUrl" @click="navigateSurface($event, playgroundUrl)">{{ labels.playground }}</a>
      <a :href="docsUrl" @click="navigateSurface($event, docsUrl)">{{ labels.docs }}</a>
    </div>
    <div>
      <strong>{{ labels.documentation }}</strong>
      <a v-if="currentLocale === 'en'" :href="docsUrl" @click="navigateSurface($event, docsUrl)">{{ labels.quickStart }}</a>
      <template v-else>
        <a :href="`${links.docs}getting-started`">{{ labels.quickStart }}</a>
        <a :href="`${links.docs}format-support`">{{ labels.formats }}</a>
        <a :href="`${links.docs}api-reference`">{{ labels.api }}</a>
      </template>
    </div>
    <div>
      <strong>{{ labels.project }}</strong>
      <a :href="links.github" target="_blank" rel="noreferrer">{{ labels.github }}</a>
      <a v-if="links.gitee" :href="links.gitee" target="_blank" rel="noreferrer">{{ labels.gitee }}</a>
      <a v-if="links.issues" :href="links.issues" target="_blank" rel="noreferrer">Issues</a>
      <a v-if="links.releases" :href="links.releases" target="_blank" rel="noreferrer">Releases</a>
    </div>
  </footer>
</template>
