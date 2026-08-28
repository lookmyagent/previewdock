import { describe, expect, it } from 'vitest'
import { createPreviewDockWatermarkBackground, registerPreviewDockElement } from './index'

describe('web host', () => {
  it('is safe to import and register outside a browser', () => {
    expect(() => registerPreviewDockElement()).not.toThrow()
  })

  it('creates an escaped and bounded watermark pattern', () => {
    const background = createPreviewDockWatermarkBackground({
      text: 'Internal & <Demo>',
      opacity: 4,
      fontSize: 200,
      gapX: 20,
      gapY: 20,
    })
    expect(background).toContain('data:image/svg+xml')
    const svg = decodeURIComponent(background!.slice(4, -2).replace('data:image/svg+xml,', ''))
    expect(svg).toContain('Internal &amp; &lt;Demo&gt;')
    expect(svg).toContain('fill-opacity="1"')
    expect(svg).toContain('font-size="72"')
    expect(svg).toContain('width="96"')
    expect(svg).toContain('height="64"')
  })

  it('disables an empty watermark', () => {
    expect(createPreviewDockWatermarkBackground('   ')).toBeUndefined()
    expect(createPreviewDockWatermarkBackground(false)).toBeUndefined()
  })
})
