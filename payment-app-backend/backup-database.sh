#!/bin/bash

# Database Backup Script
# Usage: ./backup-database.sh

BACKUP_DIR="./backups"
DB_NAME="payment_collection_db"
DB_USER="root"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

echo "🔄 Starting database backup..."

# Create backup
mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup completed: $BACKUP_FILE"
    echo "📊 Backup size: $(du -h $BACKUP_FILE | cut -f1)"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "✅ Compressed: ${BACKUP_FILE}.gz"
    
    # Keep only last 7 backups
    ls -t $BACKUP_DIR/backup_*.sql.gz | tail -n +8 | xargs rm -f
    echo "✅ Cleanup: Kept only 7 latest backups"
else
    echo "❌ Backup failed!"
    exit 1
fi
