# Deployment (Production) Notes

1. Set environment variables securely. Important vars: `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, database credentials, `REDIS_URL`, SMTP settings.

2. Build frontend for production:

```bash
cd frontend
npm install
npm run build
```

Serve built frontend via Nginx or CDN. In Django, run `collectstatic` to gather static files:

```bash
cd backend
python manage.py collectstatic --noinput
```

3. Backend process: use Gunicorn (example):

```bash
gunicorn campus_eat.wsgi:application --workers 4 --bind 0.0.0.0:8000
```

4. Use a reverse proxy (Nginx) for TLS termination and routing. Keep sensitive envs in a secrets manager.

5. Database: use managed Postgres or provision backups. Ensure migrations run during deploy: `python manage.py migrate`.

6. Monitoring: add logging, metrics, and alerting. Use Redis for caching and Celery for background jobs if added.
