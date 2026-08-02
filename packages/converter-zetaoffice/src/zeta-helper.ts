// ZetaJS 1.2 ships the runtime module without TypeScript declarations.
// @ts-ignore ZetaJS 1.2 ships the runtime module without declarations.
import { ZetaHelperMain as RuntimeZetaHelperMain, zetaHelperWrapThread as RuntimeZetaHelperWrapThread } from 'zetajs/zetaHelper.js'

export interface ZetaFileSystem {
  mkdir(path: string): void
  writeFile(path: string, data: Uint8Array): void
  readFile(path: string): Uint8Array
  unlink(path: string): void
}

export interface ZetaHelperMainInstance {
  thrPort: MessagePort
  FS: ZetaFileSystem
  Module: {
    uno_scripts: string[]
    preRun?: Array<() => void>
  }
  start(appInit: () => void): void
}

interface ZetaHelperMainConstructor {
  new (
    threadJs: string | URL | null,
    options: {
      threadJsType: string | null
      wasmPkg: string | null
      blockPageScroll: boolean
    },
  ): ZetaHelperMainInstance
}

export const ZetaHelperMain = RuntimeZetaHelperMain as ZetaHelperMainConstructor
export const zetaHelperWrapThread = RuntimeZetaHelperWrapThread as () => void
