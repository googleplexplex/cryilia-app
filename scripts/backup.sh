#!/bin/bash
# Ночной бэкап SQLite и галереи: локальный архив + rclone на Яндекс.Диск.
#
# Установка на Linux-хосте:
#   1. sudo apt-get install -y sqlite3 rclone
#   2. Настроить rclone (WebDAV Яндекс.Диска):
#        rclone config create yandex webdav \
#          url https://webdav.yandex.ru \
#          vendor other \
#          user ВАШ_ЛОГИН \
#          pass "$(rclone obscure 'ПАРОЛЬ_ПРИЛОЖЕНИЯ')"
#      Пароль приложения: https://id.yandex.ru/security/app-passwords
#   3. Проверка: rclone lsd yandex:
#   4. Cron (каждый день в 03:15):
#        15 3 * * * /path/to/prog/scripts/backup.sh >> /var/log/cryiliya-backup.log 2>&1
#   5. Первый запуск вручную: sudo -u www-data ./scripts/backup.sh
#
# Переменные (можно в .env рядом с app.py или в окружении cron):
#   ARTICLES_DB_PATH, GALLERY_UPLOAD_DIR, BACKUP_DIR,
#   BACKUP_KEEP_DAYS (по умолчанию 21), RCLONE_REMOTE (по умолчанию yandex:cryiliya-backups)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
STAMP="$(date +%Y-%m-%d_%H-%M-%S)"
DAY="$(date +%Y-%m-%d)"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

die() {
    log "ОШИБКА: $*"
    exit 1
}

trim_cr() {
    printf '%s' "$1" | tr -d '\r'
}

load_env_file() {
    local file="$1"
    [ -f "$file" ] || return 0
    local line key value
    while IFS= read -r line || [ -n "$line" ]; do
        line="$(trim_cr "$line")"
        case "$line" in
            ''|\#*) continue ;;
        esac
        key="${line%%=*}"
        value="${line#*=}"
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        case "$key" in
            ARTICLES_DB_PATH|GALLERY_UPLOAD_DIR|BACKUP_DIR|BACKUP_KEEP_DAYS|RCLONE_REMOTE|RCLONE_BIN)
                export "$key=$value"
                ;;
        esac
    done < "$file"
}

load_env_file "$APP_DIR/.env"

DB_PATH="${ARTICLES_DB_PATH:-$APP_DIR/data/articles.db}"
UPLOADS_DIR="${GALLERY_UPLOAD_DIR:-$APP_DIR/data/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/cryiliya}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-21}"
RCLONE_REMOTE="${RCLONE_REMOTE:-yandex:cryiliya-backups}"
RCLONE_BIN="${RCLONE_BIN:-rclone}"

ARCHIVE_NAME="cryiliya-${DAY}.tar.gz"
ARCHIVE_PATH="$BACKUP_DIR/$ARCHIVE_NAME"
STAGING="$BACKUP_DIR/.staging-$STAMP"
LOCK_FILE="$BACKUP_DIR/.backup.lock"

mkdir -p "$BACKUP_DIR"

exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    log "Уже выполняется другой бэкап, выход"
    exit 0
fi

cleanup() {
    rm -rf "$STAGING"
}
trap cleanup EXIT

log "Старт бэкапа"
log "БД: $DB_PATH"
log "Галерея: $UPLOADS_DIR"
log "Каталог архивов: $BACKUP_DIR"

mkdir -p "$STAGING/uploads"
{
    echo "created_at=$STAMP"
    echo "host=$(hostname)"
    echo "db_path=$DB_PATH"
    echo "uploads_dir=$UPLOADS_DIR"
} > "$STAGING/manifest.txt"

if [ -f "$DB_PATH" ]; then
    if command -v sqlite3 >/dev/null 2>&1; then
        sqlite3 "$DB_PATH" ".backup '$STAGING/articles.db'"
        sqlite3 "$STAGING/articles.db" "PRAGMA integrity_check;" | grep -qx 'ok' \
            || die "Проверка целостности копии SQLite не прошла"
        log "SQLite: консистентная копия готова"
    else
        log "sqlite3 не найден, копирую файлы БД как есть"
        cp -a "$DB_PATH" "$STAGING/articles.db"
        [ -f "${DB_PATH}-wal" ] && cp -a "${DB_PATH}-wal" "$STAGING/articles.db-wal"
        [ -f "${DB_PATH}-shm" ] && cp -a "${DB_PATH}-shm" "$STAGING/articles.db-shm"
    fi
else
    log "Файл БД ещё не создан, пропускаю"
fi

if [ -d "$UPLOADS_DIR" ]; then
    cp -a "$UPLOADS_DIR/." "$STAGING/uploads/"
    log "Галерея скопирована"
else
    log "Папка галереи отсутствует, пропускаю"
fi

tar -czf "$ARCHIVE_PATH.tmp" -C "$STAGING" .
mv -f "$ARCHIVE_PATH.tmp" "$ARCHIVE_PATH"
log "Локальный архив: $ARCHIVE_PATH ($(du -h "$ARCHIVE_PATH" | awk '{print $1}'))"

find "$BACKUP_DIR" -maxdepth 1 -type f -name 'cryiliya-*.tar.gz' -mtime +"$KEEP_DAYS" -delete
log "Локально храню архивы за последние ${KEEP_DAYS} дн."

if ! command -v "$RCLONE_BIN" >/dev/null 2>&1; then
    die "rclone не установлен. Поставьте: sudo apt-get install -y rclone"
fi

if ! "$RCLONE_BIN" lsd "$RCLONE_REMOTE" >/dev/null 2>&1; then
    log "Создаю удалённую папку $RCLONE_REMOTE"
    "$RCLONE_BIN" mkdir "$RCLONE_REMOTE" || die "Не удалось обратиться к $RCLONE_REMOTE. Проверьте rclone config"
fi

"$RCLONE_BIN" sync "$BACKUP_DIR" "$RCLONE_REMOTE" \
    --include 'cryiliya-*.tar.gz' \
    --retries 3 \
    --fast-list
log "Синхронизировано с $RCLONE_REMOTE"
log "Бэкап завершён"
