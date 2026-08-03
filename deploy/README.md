# Production deployment

The production release script builds and assembles the portal, documentation,
and playground into one static site, uploads an immutable release directory,
validates Nginx, recreates `previewdock-web`, and verifies public routes plus
the cross-origin isolation headers required by Office preview.

```bash
pnpm deploy:production
```

The default target is `root@47.95.243.157`, served publicly at
`https://playground.yigeren.me`. Authentication is not stored in the project;
use an SSH key or SSH agent. All deployment settings can be overridden with the
environment variables documented by:

```bash
./scripts/deploy-production.sh --help
```

For a previously built and assembled `apps/site/dist`, use:

```bash
./scripts/deploy-production.sh --skip-build
```

Each deployment is stored under `/opt/previewdock/releases`. The script keeps
the five newest releases by default and automatically restores the previously
mounted release if the new container fails its local health check.
