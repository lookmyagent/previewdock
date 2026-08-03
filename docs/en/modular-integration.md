# All mode and category mode

PreviewDock has two product integration choices. Both use the same engine and Vue component.

## All mode

Install all seven official categories for file centers and products with open-ended file types.

```bash
pnpm add vue @previewdock/vue @previewdock/preset-all
```

```ts
import { createAllFormatEngine } from '@previewdock/preset-all'

export const engine = createAllFormatEngine()
```

All means the product receives all seven categories through one maintained dependency.

## Category mode

Install only the categories exposed by an approval flow, attachment surface, knowledge base, or vertical application.

```bash
pnpm add vue @previewdock/core @previewdock/vue \
  @previewdock/preset-documents \
  @previewdock/preset-images \
  @previewdock/preset-text-data
```

```ts
import { createViewerEngine } from '@previewdock/core'
import { documentsPack } from '@previewdock/preset-documents'
import { imagesPack } from '@previewdock/preset-images'
import { textDataPack } from '@previewdock/preset-text-data'

export const engine = createViewerEngine([documentsPack, imagesPack, textDataPack])
```

See [seven format categories](/en/categories). Adding a category only installs its package and adds its Pack to the array; the Vue page stays unchanged.

## How to choose

| Comparison | All mode | Category mode |
| --- | --- | --- |
| Installation | One preset package | Select 1–7 category packages |
| Engine API | `createAllFormatEngine()` | `createViewerEngine([packs])` |
| Installed scope | Every official category | Selected categories only |
| Page component | One shared component | The same shared component |
| New categories | Included after upgrading All | Explicitly install the category |
| Best for | General file platforms | Products with a defined format scope |

## Categories with runtime configuration

Archive, engineering CAD, and legacy Office categories accept Worker, WASM, and converter configuration through `createArchivesPack`, `createThreeDCadPack`, and `createDocumentsPack`. See [Worker and WASM deployment](/en/deployment).

The host always owns file selection, authorization, storage, network policy, file-size limits, and approval for any remote conversion.
