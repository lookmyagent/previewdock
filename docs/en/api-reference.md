# Component usage

This page contains only the public usage needed by an application integrating PreviewDock.

## Create preview capabilities

```ts
// All mode
const engine = createAllFormatEngine()

// Category mode
const engine = createViewerEngine([documentsPack, imagesPack])
```

## Use the Vue component

```vue
<script setup lang="ts">
import { PreviewDock } from '@previewdock/vue'
import '@previewdock/vue/style.css'
import { engine } from './preview-engine'
</script>

<template>
  <div style="height: 640px">
    <PreviewDock :engine="engine" :source="file" :file-name="file.name" locale="en" />
  </div>
</template>
```

Common props are `engine`, `source`, `fileName`, `locale`, and `showToolbar`. Applications can listen for `status`, `ready`, and `error`. The host remains responsible for file selection, authorization, and download policy.
