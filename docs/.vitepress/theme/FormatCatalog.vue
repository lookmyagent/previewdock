<script setup lang="ts">
import { computed } from 'vue'
import { formatCategories } from '../../../packages/core/src/formats'

const props = defineProps<{ locale: 'zh' | 'en' }>()
const structuralLabel = computed(() => props.locale === 'zh' ? '结构 / 快速预览' : 'Structural / quick preview')
</script>

<template>
  <div class="docs-format-catalog">
    <section v-for="category in formatCategories" :key="category.id" class="docs-format-category">
      <h2>{{ locale === 'zh' ? category.labelZh : category.label }}</h2>
      <div v-for="family in category.families" :key="family.id" class="docs-format-family">
        <div class="docs-format-family__title">
          <strong>{{ locale === 'zh' ? family.labelZh : family.label }}</strong>
          <span v-if="family.fidelity === 'structural'">{{ structuralLabel }}</span>
        </div>
        <code>{{ family.extensions.map(extension => extension.toUpperCase()).join(' · ') }}</code>
      </div>
    </section>
  </div>
</template>
