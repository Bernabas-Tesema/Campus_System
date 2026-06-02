# Contributing

1. Fork or branch from `main`.
2. Write clear commit messages. Use feature branches named `feature/...` or `fix/...`.
3. Backend:
   - Add migrations with `python manage.py makemigrations` and include them in PR.
   - Run `python manage.py migrate` locally when testing.
4. Frontend:
   - Follow existing component patterns in `frontend/src/`.
   - Run `npm run dev` during development.
5. Tests: include tests where possible; add CI job to run tests.
6. Code style: keep Django idioms; prefer explicit serializers and avoid business logic in views.
