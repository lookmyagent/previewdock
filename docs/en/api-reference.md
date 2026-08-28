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
    <PreviewDock
      :engine="engine"
      :source="file"
      :file-name="file.name"
      locale="en"
      :watermark="{ text: 'Internal use only', opacity: 0.14, rotate: -24 }"
    />
  </div>
</template>
```

Common props are `engine`, `source`, `fileName`, `locale`, `showToolbar`, and `watermark`. A watermark can be a string or an object with `text`, `color`, `opacity`, `fontSize`, `rotate`, `gapX`, and `gapY`; pass `false` to disable it. The visual watermark applies to every renderer without blocking scroll, zoom, or 3D interaction. It does not modify the source file and is not a replacement for authorization, download controls, or audit logging.

Applications can listen for `status`, `ready`, and `error`. The host remains responsible for file selection, authorization, and download policy.
