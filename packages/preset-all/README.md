# @previewdock/preset-all

Official all-format preset for PreviewDock. It combines all seven product categories—Documents, Text & Data, Archives, Images, Media, Diagrams, and 3D & CAD—while keeping parser implementations behind dynamic imports.

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

Browser-native formats work without extra configuration. RAR/7Z, engineering CAD, and legacy DOC/PPT require Worker, WASM, font, or converter assets supplied through `createAllFormatEngine(options)`. See the PreviewDock deployment guide for production configuration.

Use individual `@previewdock/adapter-*` packages instead when the application should install only selected format groups.
