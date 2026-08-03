/// <reference types="vite/client" />

declare module 'occt-import-js' {
  const initialize: (options?: { locateFile?: (path: string) => string }) => Promise<unknown>
  export default initialize
}
