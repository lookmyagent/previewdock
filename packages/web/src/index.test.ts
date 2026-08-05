import { describe, expect, it } from 'vitest'
import { registerPreviewDockElement } from './index'

describe('web host', () => {
  it('is safe to import and register outside a browser', () => {
    expect(() => registerPreviewDockElement()).not.toThrow()
  })
})
