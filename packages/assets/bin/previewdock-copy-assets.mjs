#!/usr/bin/env node
import { resolve } from 'node:path'
import { copyPreviewDockAssets } from '../dist/index.js'

const output = resolve(process.argv[2] || 'public/previewdock')
const copied = await copyPreviewDockAssets(output)
process.stdout.write(`PreviewDock: copied ${copied.length} runtime assets to ${output}\n`)
