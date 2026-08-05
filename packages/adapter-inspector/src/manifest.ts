import type { AdapterRegistration, FormatCategoryId } from '@previewdock/core'
import { getCategoryExtensions } from '@previewdock/core'

export function createInspectorAdapterManifest(
  category: FormatCategoryId,
): AdapterRegistration {
  return {
    id: `structural-inspector-${category}`,
    extensions: [...getCategoryExtensions(category)],
    priority: -100,
    load: async () => (await import('./index')).createInspectorAdapter(category),
  }
}
