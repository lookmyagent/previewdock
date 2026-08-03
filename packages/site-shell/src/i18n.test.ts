import { describe, expect, it } from 'vitest'
import { getLocalizedDocsPath } from './i18n'

describe('localized documentation paths', () => {
  it('keeps the current document while changing locale', () => {
    expect(getLocalizedDocsPath('/docs/categories', 'en')).toBe('/docs/en/categories')
    expect(getLocalizedDocsPath('/docs/en/categories', 'zh-CN')).toBe('/docs/categories')
  })

  it('keeps documentation roots canonical', () => {
    expect(getLocalizedDocsPath('/docs/', 'en')).toBe('/docs/en/')
    expect(getLocalizedDocsPath('/docs/en/', 'zh-CN')).toBe('/docs/')
  })
})
