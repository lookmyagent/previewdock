# PreviewDock release guide

PreviewDock publishes every public workspace package with the same version. The release tool builds tarballs in dependency order, replaces `workspace:*` ranges, validates package metadata and contents, and publishes the exact validated artifacts.

## First npm release

The first release must establish the public `@previewdock` npm scope and package ownership.

1. Create or confirm the `previewdock` user/organization on npm.
2. Enable two-factor authentication for publishing.
3. Add a granular npm token with publish permission as the GitHub Environment secret `NPM_TOKEN` in the `npm` environment.
4. Protect the `npm` GitHub Environment with required reviewers.
5. Publish the GitHub Release for the matching version tag, such as `v0.2.0`.

The `Publish npm packages` workflow verifies tests, types, builds, the tag/version match, tarball contents and publish order before uploading.

## Local verification

```bash
pnpm release:npm:dry-run
```

Validated tarballs and `manifest.json` are written to the ignored `artifacts/npm/` directory. Dry-run never uploads a package.

## Local emergency publish

Use this only from the exact tagged commit after `npm login`:

```bash
npm whoami --registry=https://registry.npmjs.org
pnpm release:npm -- --tag=latest
```

The command refuses to publish if tracked files are dirty or `HEAD` is not tagged with the package version. It skips packages whose exact version already exists, so a partially completed release can be resumed safely.

## Trusted publishing

After the first package versions exist, configure GitHub Actions as a trusted publisher for each npm package. Use repository `lookmyagent/previewdock`, workflow `publish-npm.yml`, and environment `npm`. The workflow already grants `id-token: write`; npm can then publish through OIDC and attach provenance without a long-lived token. Remove `NPM_TOKEN` after the trusted publisher configuration has been verified.
