# Product principles and usage boundaries

PreviewDock gives business applications one browser file-preview experience across many file families, while reducing inconsistent integrations, unnecessary file transfer, and performance impact from specialist formats.

## Product principles

- **One component:** documents, data, images, archives, media, diagrams, and models use the same Vue surface.
- **Two integration modes:** All mode enables every category; category mode installs only the capabilities exposed by the product.
- **Local-first:** supported files stay in the current browser by default. Remote conversion must be explicitly configured by the host.
- **Enabled when needed:** normal file usage does not make users wait for unrelated specialist capabilities.
- **Consistent localization:** portal, documentation, and preview UI support Chinese and English while preserving the current page.

## Usage boundaries

PreviewDock is a read-only viewer, not a replacement for Office, CAD, or professional design software. It does not execute macros or active content. Complex layout, fonts, codecs, and external model assets can affect fidelity. The host remains responsible for authentication, authorization, storage, download policy, size limits, and auditing. Some legacy documents, archive formats, and engineering models require additional runtime assets.

Review [format support and compatibility](/en/format-support) and [runtime and deployment](/en/deployment) before production rollout.
