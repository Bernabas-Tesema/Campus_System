#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! python -c "import socket; s=socket.socket(); s.connect(('postgres', 5432))" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

python manage.py migrate --noinput

if [ "${SEED_DEMO_DATA}" = "true" ] || [ "${SEED_DEMO_DATA}" = "1" ]; then
  python manage.py seed_data --demo
else
  python manage.py seed_data
fi

python manage.py collectstatic --noinput 2>/dev/null || true

exec "$@"
