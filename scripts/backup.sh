#!/bin/bash
# WordPress Production Backup Script

set -euo pipefail

# Configuration
BACKUP_DIR="/backup"
DB_HOST="${MYSQL_HOST:-mysql}"
DB_NAME="${MYSQL_DATABASE:-wordpress}"
DB_USER="${MYSQL_USER:-wordpress}"
DB_PASS="${MYSQL_PASSWORD}"
WP_DIR="/var/www/html"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days"
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete || true
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete || true
}

# Function to backup database
backup_database() {
    log "Starting database backup"
    
    local backup_file="$BACKUP_DIR/db_backup_$DATE.sql"
    
    # Create database dump
    mysqldump \
        --host="$DB_HOST" \
        --user="$DB_USER" \
        --password="$DB_PASS" \
        --single-transaction \
        --routines \
        --triggers \
        --opt \
        "$DB_NAME" > "$backup_file"
    
    # Compress the backup
    gzip "$backup_file"
    
    log "Database backup completed: ${backup_file}.gz"
}

# Function to backup WordPress files
backup_files() {
    log "Starting WordPress files backup"
    
    local backup_file="$BACKUP_DIR/wp_files_$DATE.tar.gz"
    
    # Create tar archive of WordPress files
    tar -czf "$backup_file" \
        --exclude="$WP_DIR/wp-content/cache/*" \
        --exclude="$WP_DIR/wp-content/uploads/cache/*" \
        --exclude="$WP_DIR/wp-content/backup/*" \
        -C "$(dirname "$WP_DIR")" \
        "$(basename "$WP_DIR")"
    
    log "WordPress files backup completed: $backup_file"
}

# Function to verify backup integrity
verify_backup() {
    local backup_file="$1"
    
    if [[ -f "$backup_file" && -s "$backup_file" ]]; then
        log "Backup verification passed: $backup_file"
        return 0
    else
        log "ERROR: Backup verification failed: $backup_file"
        return 1
    fi
}

# Function to send backup notification
send_notification() {
    local status="$1"
    local message="$2"
    
    # Add webhook notification logic here if needed
    log "Backup notification: [$status] $message"
}

# Main backup process
main() {
    log "Starting WordPress backup process"
    
    local success=true
    local error_message=""
    
    # Cleanup old backups first
    cleanup_old_backups
    
    # Backup database
    if backup_database; then
        local db_backup="$BACKUP_DIR/db_backup_$DATE.sql.gz"
        if verify_backup "$db_backup"; then
            log "Database backup successful"
        else
            success=false
            error_message="Database backup verification failed"
        fi
    else
        success=false
        error_message="Database backup failed"
    fi
    
    # Backup files
    if backup_files; then
        local files_backup="$BACKUP_DIR/wp_files_$DATE.tar.gz"
        if verify_backup "$files_backup"; then
            log "Files backup successful"
        else
            success=false
            error_message="Files backup verification failed"
        fi
    else
        success=false
        error_message="Files backup failed"
    fi
    
    # Send notification
    if $success; then
        send_notification "SUCCESS" "WordPress backup completed successfully"
        log "Backup process completed successfully"
        exit 0
    else
        send_notification "ERROR" "$error_message"
        log "ERROR: Backup process failed - $error_message"
        exit 1
    fi
}

# Check if running as a cron job or one-time execution
if [[ "${BACKUP_SCHEDULE:-}" ]]; then
    # Install cron job
    echo "$BACKUP_SCHEDULE /backup.sh > /var/log/backup.log 2>&1" | crontab -
    log "Backup cron job installed: $BACKUP_SCHEDULE"
    
    # Start cron daemon
    exec crond -f
else
    # Run backup immediately
    main
fi