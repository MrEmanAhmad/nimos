#!/usr/bin/env bash
#
# backup.sh -- Production SQLite backup for Nimo's backend
#
# Uses SQLite's .backup command to create a consistent, point-in-time
# snapshot even while the database is in use (WAL mode safe).
#
# Usage:
#   ./backup.sh              # manual run
#   Add to cron for daily automated backups
#
# Exit codes:
#   0  success
#   1  sqlite3 not found or backup failed
#   2  source database missing
# ---------------------------------------------------------------

set -euo pipefail

# ---- Configuration ---------------------------------------------
BASE_DIR="/root/.openclaw-nimos/workspace/nimos-system"
DB_PATH="${BASE_DIR}/db/nimos.db"
BACKUP_DIR="${BASE_DIR}/backups"
LOG_FILE="${BACKUP_DIR}/backup.log"
KEEP_COUNT=7                       # number of backups to retain
SQLITE3="$(command -v sqlite3 2>/dev/null || true)"
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
BACKUP_FILE="${BACKUP_DIR}/nimos_backup_${TIMESTAMP}.db"
# ----------------------------------------------------------------

# ---- Helpers ---------------------------------------------------
log() {
    local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
    echo "$msg" | tee -a "$LOG_FILE"
}

die() {
    log "ERROR: $*"
    exit "${2:-1}"
}
# ----------------------------------------------------------------

# ---- Pre-flight checks -----------------------------------------
if [[ -z "$SQLITE3" ]]; then
    die "sqlite3 binary not found in PATH" 1
fi

if [[ ! -f "$DB_PATH" ]]; then
    die "Source database not found: ${DB_PATH}" 2
fi

mkdir -p "$BACKUP_DIR"
# ----------------------------------------------------------------

# ---- Perform backup --------------------------------------------
log "Starting backup of ${DB_PATH}"
log "Destination: ${BACKUP_FILE}"

if "$SQLITE3" "$DB_PATH" ".backup '${BACKUP_FILE}'" 2>>"$LOG_FILE"; then
    BACKUP_SIZE="$(stat --printf='%s' "$BACKUP_FILE" 2>/dev/null || stat -f '%z' "$BACKUP_FILE" 2>/dev/null)"
    log "Backup completed successfully (${BACKUP_SIZE} bytes)"
else
    die "SQLite .backup command failed" 1
fi

# Quick integrity check on the new backup
if "$SQLITE3" "$BACKUP_FILE" "PRAGMA integrity_check;" 2>>"$LOG_FILE" | grep -q "^ok$"; then
    log "Integrity check passed"
else
    log "WARNING: Integrity check did not return 'ok' -- backup may be corrupt"
fi
# ----------------------------------------------------------------

# ---- Rotate old backups ----------------------------------------
# List backup files newest-first, then remove everything past KEEP_COUNT
BACKUPS_FOUND=( $(ls -1t "${BACKUP_DIR}"/nimos_backup_*.db 2>/dev/null) )
TOTAL="${#BACKUPS_FOUND[@]}"

if (( TOTAL > KEEP_COUNT )); then
    REMOVE_COUNT=$(( TOTAL - KEEP_COUNT ))
    log "Rotating backups: keeping ${KEEP_COUNT}, removing ${REMOVE_COUNT}"
    for (( i = KEEP_COUNT; i < TOTAL; i++ )); do
        log "  Removing old backup: ${BACKUPS_FOUND[$i]}"
        rm -f "${BACKUPS_FOUND[$i]}"
    done
else
    log "Backup rotation: ${TOTAL}/${KEEP_COUNT} slots used, nothing to remove"
fi
# ----------------------------------------------------------------

log "Backup job finished"
exit 0
