import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { gunzipSync, strToU8, zipSync } from 'fflate'
import { parseTarEntries, parseZipEntries, readGzipOriginalName } from './index'
import { createArchiveAdapterManifest } from './manifest'

const samples = new URL('../../../apps/playground/public/samples/archives/', import.meta.url)

describe('archive formats', () => {
  it('routes RAR, 7Z, TAR, GZIP, TGZ and JAR through the archive adapter', () => {
    const manifest = createArchiveAdapterManifest()
    expect(manifest.extensions).toEqual(expect.arrayContaining([
      'rar', '7z', 'tar', 'gz', 'gzip', 'tgz', 'jar',
    ]))
    expect(manifest.mimeTypes).toEqual(expect.arrayContaining([
      'application/vnd.rar',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-gzip',
      'application/java-archive',
    ]))
  })

  it('parses a real PAX TAR without exposing PAX or macOS metadata entries', () => {
    const bytes = new Uint8Array(readFileSync(new URL('sample.tar', samples)))
    const entries = parseTarEntries(bytes)
    expect(entries.map(entry => entry.path).sort()).toEqual([
      'data',
      'data/sample.csv',
      'docs',
      'docs/readme.txt',
    ])
    expect(entries.some(entry => entry.path.includes('PaxHeader'))).toBe(false)
    expect(entries.some(entry => entry.path.split('/').some(part => part.startsWith('._')))).toBe(false)
    const readme = entries.find(entry => entry.path === 'docs/readme.txt')
    expect(new TextDecoder().decode(readme?.data)).toContain('支持多级目录')
  })

  it('keeps the original filename and extension stored in a GZIP header', () => {
    const bytes = new Uint8Array(readFileSync(new URL('sample.gzip', samples)))
    expect(readGzipOriginalName(bytes)).toBe('ufv-archive-sample.txt')
    expect(new TextDecoder().decode(gunzipSync(bytes))).toContain('中文预览验证')
  })

  it('parses a standard JAR manifest and nested entries as ZIP content', () => {
    const jar = zipSync({
      'META-INF/': new Uint8Array(),
      'META-INF/MANIFEST.MF': strToU8('Manifest-Version: 1.0\r\nCreated-By: UFV\r\n'),
      'docs/readme.txt': strToU8('JAR nested file'),
    })
    const entries = parseZipEntries(jar)
    expect(entries.map(entry => entry.path)).toEqual(expect.arrayContaining([
      'META-INF',
      'META-INF/MANIFEST.MF',
      'docs/readme.txt',
    ]))
    const manifest = entries.find(entry => entry.path === 'META-INF/MANIFEST.MF')
    expect(new TextDecoder().decode(manifest?.data)).toContain('Manifest-Version: 1.0')
  })
})
