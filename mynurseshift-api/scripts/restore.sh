#!/bin/bash

# Configuration
DB_NAME="mynurseshift"
DB_USER="postgres"
BACKUP_DIR="/Users/fawsy/CascadeProjects/mynurseshift-api/backups"

# Vérifier si un fichier de sauvegarde est spécifié
if [ -z "$1" ]; then
    echo "Usage: $0 <backup-file>"
    echo "Sauvegardes disponibles:"
    ls -lh "$BACKUP_DIR"
    exit 1
fi

BACKUP_FILE="$1"

# Vérifier si le fichier existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erreur: Le fichier $BACKUP_FILE n'existe pas"
    exit 1
fi

# Si le fichier est compressé, le décompresser
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Décompression de la sauvegarde..."
    gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.gz}"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Restaurer la base de données
echo "Restauration de la base de données à partir de $BACKUP_FILE..."
PGPASSWORD=postgres psql -h localhost -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"

# Nettoyer le fichier décompressé si nécessaire
if [[ "$1" == *.gz ]]; then
    rm "$BACKUP_FILE"
fi

echo "Restauration terminée!"
