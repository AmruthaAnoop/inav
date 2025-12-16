#!/bin/bash

# Restore Database from Backup
# Usage: ./restore-database.sh backup_file.sql.gz

if [ -z "$1" ]; then
    echo "Usage: ./restore-database.sh backup_file.sql.gz"
    exit 1
fi

BACKUP_FILE=$1
DB_NAME="payment_collection_db"
DB_USER="root"

echo "🔄 Starting database restore..."
echo "📁 Backup file: $BACKUP_FILE"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Decompressing..."
    gunzip -c $BACKUP_FILE | mysql -u $DB_USER -p $DB_NAME
else
    mysql -u $DB_USER -p $DB_NAME < $BACKUP_FILE
fi

if [ $? -eq 0 ]; then
    echo "✅ Restore completed successfully!"
else
    echo "❌ Restore failed!"
    exit 1
fi
