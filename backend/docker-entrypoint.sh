#!/bin/sh

set -e

echo "⏳ Waiting for database to be ready..."
until nc -z postgres 5432; do
  sleep 1
done
echo "✅ Database is ready"

# Initialiser le schéma de la base de données si nécessaire
if [ "$INIT_DB" = "true" ]; then
  echo "🔧 Initializing database schema..."
  npm run init-db:prod
fi

# Exécuter le seed si demandé
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Running database seed..."
  npm run seed:prod
fi

# Exécuter la commande principale
exec "$@"

