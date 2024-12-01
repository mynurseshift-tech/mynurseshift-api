#!/bin/bash

# Configuration
DB_NAME="mynurseshift"
DB_USER="postgres"
BACKUP_DIR="/Users/fawsy/CascadeProjects/mynurseshift-api/backups"
DAYS_TO_KEEP=7
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/$DB_NAME-$DATE.sql"

# Assurez-vous que le répertoire de sauvegarde existe
mkdir -p "$BACKUP_DIR"

# Créer la sauvegarde
echo "Création de la sauvegarde: $BACKUP_FILE"
PGPASSWORD=postgres pg_dump -h localhost -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compresser la sauvegarde
echo "Compression de la sauvegarde"
gzip "$BACKUP_FILE"

# Supprimer les anciennes sauvegardes
echo "Nettoyage des anciennes sauvegardes"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$DAYS_TO_KEEP -delete

# Afficher les sauvegardes existantes
echo "Sauvegardes disponibles:"
ls -lh "$BACKUP_DIR"

# Vérifier l'espace disque
echo "Espace disque utilisé par les sauvegardes:"
du -sh "$BACKUP_DIR"
