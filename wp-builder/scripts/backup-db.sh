#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${MYSQL_DATABASE:?MYSQL_DATABASE must be set (use .env)}"
: "${MYSQL_ROOT_PASSWORD:?MYSQL_ROOT_PASSWORD must be set (use .env)}"

BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/wp-db-${STAMP}.sql.gz"

docker compose exec -T db mysqldump \
  -uroot \
  -p"${MYSQL_ROOT_PASSWORD}" \
  --single-transaction \
  --quick \
  "${MYSQL_DATABASE}" | gzip >"$OUT"

echo "Backup written: $OUT"
