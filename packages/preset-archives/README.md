# @previewdock/preset-archives

Official PreviewDock preset for ZIP, TAR, GZIP, JAR, RAR, and 7Z archives.

```ts
import { archivesPack } from '@previewdock/preset-archives'
```

RAR and 7Z require runtime assets configured through `createArchivesPack({ archive })`.

The default browser profile supports archives up to 100 MB. ZIP and JAR also
support a range-backed large-file mode up to 1 GB; remote URLs must respond to
HTTP Range requests.
