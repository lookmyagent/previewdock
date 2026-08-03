#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_TARGET="${PREVIEWDOCK_DEPLOY_TARGET:-root@47.95.243.157}"
DEPLOY_ROOT="${PREVIEWDOCK_DEPLOY_ROOT:-/opt/previewdock}"
CONTAINER_NAME="${PREVIEWDOCK_CONTAINER_NAME:-previewdock-web}"
CONTAINER_IMAGE="${PREVIEWDOCK_CONTAINER_IMAGE:-previewdock-nginx:release-base}"
DOCKER_NETWORK="${PREVIEWDOCK_DOCKER_NETWORK:-ruoyi-admin_default}"
HOST_PORT="${PREVIEWDOCK_HOST_PORT:-8088}"
PUBLIC_URL="${PREVIEWDOCK_PUBLIC_URL:-https://playground.yigeren.me}"
KEEP_RELEASES="${PREVIEWDOCK_KEEP_RELEASES:-5}"
SKIP_BUILD=0

usage() {
  cat <<'EOF'
Usage: scripts/deploy-production.sh [--skip-build]

Environment overrides:
  PREVIEWDOCK_DEPLOY_TARGET     SSH target (default: root@47.95.243.157)
  PREVIEWDOCK_DEPLOY_ROOT       Remote release root (default: /opt/previewdock)
  PREVIEWDOCK_CONTAINER_NAME    Docker container name (default: previewdock-web)
  PREVIEWDOCK_CONTAINER_IMAGE   Docker image (default: previewdock-nginx:release-base)
  PREVIEWDOCK_DOCKER_NETWORK   Docker network (default: ruoyi-admin_default)
  PREVIEWDOCK_HOST_PORT         Published HTTP port (default: 8088)
  PREVIEWDOCK_PUBLIC_URL        Public health-check URL
  PREVIEWDOCK_KEEP_RELEASES     Number of releases retained (default: 5)

Authentication is intentionally not stored in this repository. Use an SSH key
or your local SSH agent. Set --skip-build only when apps/site/dist is current.
EOF
}

while (($#)); do
  case "$1" in
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

[[ "$DEPLOY_ROOT" =~ ^/[A-Za-z0-9._/-]+$ ]] || { echo "Unsafe deploy root" >&2; exit 2; }
[[ "$CONTAINER_NAME" =~ ^[A-Za-z0-9_.-]+$ ]] || { echo "Unsafe container name" >&2; exit 2; }
[[ "$DOCKER_NETWORK" =~ ^[A-Za-z0-9_.-]+$ ]] || { echo "Unsafe Docker network" >&2; exit 2; }
[[ "$HOST_PORT" =~ ^[0-9]+$ ]] || { echo "Invalid host port" >&2; exit 2; }
[[ "$KEEP_RELEASES" =~ ^[1-9][0-9]*$ ]] || { echo "Invalid release retention" >&2; exit 2; }

if ((SKIP_BUILD == 0)); then
  echo "[1/5] Building portal, docs, and playground"
  (cd "$ROOT_DIR" && pnpm build)
else
  echo "[1/5] Reusing existing apps/site/dist"
fi

SITE_DIST="$ROOT_DIR/apps/site/dist"
[[ -f "$SITE_DIST/index.html" && -f "$SITE_DIST/docs/index.html" && -f "$SITE_DIST/playground/index.html" ]] || {
  echo "Assembled site is incomplete: $SITE_DIST" >&2
  exit 1
}

GIT_REV="$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo nogit)"
if ! git -C "$ROOT_DIR" diff --quiet || ! git -C "$ROOT_DIR" diff --cached --quiet; then
  GIT_REV="$GIT_REV-dirty"
fi
RELEASE_ID="$(date +%Y%m%d-%H%M%S)-$GIT_REV"
RELEASE_DIR="$DEPLOY_ROOT/releases/$RELEASE_ID"

echo "[2/5] Uploading release $RELEASE_ID"
ssh "$DEPLOY_TARGET" "mkdir -p '$RELEASE_DIR/site'"
COPYFILE_DISABLE=1 tar --no-xattrs -C "$SITE_DIST" -czf - . | ssh "$DEPLOY_TARGET" "tar -xzf - -C '$RELEASE_DIR/site'"
scp -q "$ROOT_DIR/deploy/nginx.conf" "$DEPLOY_TARGET:$RELEASE_DIR/nginx.conf"

echo "[3/5] Activating container release"
ssh "$DEPLOY_TARGET" bash -s -- \
  "$RELEASE_DIR" "$DEPLOY_ROOT" "$CONTAINER_NAME" "$CONTAINER_IMAGE" \
  "$DOCKER_NETWORK" "$HOST_PORT" "$KEEP_RELEASES" <<'REMOTE'
set -Eeuo pipefail

release_dir="$1"
deploy_root="$2"
container_name="$3"
container_image="$4"
docker_network="$5"
host_port="$6"
keep_releases="$7"

previous_site=""
previous_config=""
if docker inspect "$container_name" >/dev/null 2>&1; then
  previous_site="$(docker inspect "$container_name" --format '{{range .Mounts}}{{if eq .Destination "/usr/share/nginx/html"}}{{.Source}}{{end}}{{end}}')"
  previous_config="$(docker inspect "$container_name" --format '{{range .Mounts}}{{if eq .Destination "/etc/nginx/conf.d/default.conf"}}{{.Source}}{{end}}{{end}}')"
fi

docker run --rm \
  -v "$release_dir/site:/usr/share/nginx/html:ro" \
  -v "$release_dir/nginx.conf:/etc/nginx/conf.d/default.conf:ro" \
  "$container_image" nginx -t

start_container() {
  local site_dir="$1"
  local config_file="$2"
  docker run -d \
    --name "$container_name" \
    --restart unless-stopped \
    --network "$docker_network" \
    -p "$host_port:80" \
    -v "$site_dir:/usr/share/nginx/html:ro" \
    -v "$config_file:/etc/nginx/conf.d/default.conf:ro" \
    "$container_image" >/dev/null
}

docker rm -f "$container_name" >/dev/null 2>&1 || true
start_container "$release_dir/site" "$release_dir/nginx.conf"

healthy=0
for _ in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:$host_port/" >/dev/null \
    && curl -fsS "http://127.0.0.1:$host_port/docs/" >/dev/null \
    && curl -fsS "http://127.0.0.1:$host_port/playground/" >/dev/null; then
    healthy=1
    break
  fi
  sleep .5
done

if ((healthy == 0)); then
  echo "New release failed its local health check; rolling back" >&2
  docker rm -f "$container_name" >/dev/null 2>&1 || true
  if [[ -n "$previous_site" && -n "$previous_config" ]]; then
    start_container "$previous_site" "$previous_config"
  fi
  exit 1
fi

ln -sfn "$release_dir" "$deploy_root/current"

mapfile -t stale_releases < <(find "$deploy_root/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | tail -n "+$((keep_releases + 1))" | cut -d' ' -f2-)
for stale_release in "${stale_releases[@]}"; do
  [[ "$stale_release" == "$deploy_root/releases/"* ]] && rm -rf -- "$stale_release"
done
REMOTE

echo "[4/5] Checking public routes and isolation headers"
for route in / /docs/ /playground/; do
  curl --fail --silent --show-error --location --max-time 20 "$PUBLIC_URL$route" >/dev/null
done

headers="$(curl --fail --silent --show-error --head --max-time 20 "$PUBLIC_URL/playground/")"
grep -qi '^cross-origin-opener-policy: same-origin' <<<"$headers"
grep -qi '^cross-origin-embedder-policy: require-corp' <<<"$headers"

echo "[5/5] Deployment complete: $PUBLIC_URL ($RELEASE_ID)"
