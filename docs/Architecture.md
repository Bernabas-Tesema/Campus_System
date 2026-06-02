# Architecture

## High-level components
- **Backend**: Django project `campus_eat` with modular apps in `backend/apps/`.
- **Frontend**: React SPA (Vite) in `frontend/`.
- **Data & Cache**: PostgreSQL + Redis.
- **Ingress / static**: Nginx.

## Patterns and design
- `patterns.repository`: data access abstraction used by services.
- `patterns.strategy`: pluggable strategies (search, payment flows).
- `patterns.adapter`: external adapters (payment providers) exposed via `EXTERNAL_ADAPTERS`.
- `patterns.observer`: event notifications for order status changes.

## Typical request flow (order placement)
1. Client calls `POST /api/orders/` with `lounge_id`, items and `payment_method`.
2. Backend validates items, creates `Order` and `OrderItem` records.
3. Payment processed via `PaymentContext` or external adapter.
4. `Payment` record saved with `admin_commission` calculated (1.5%).
5. `order_status_subject` notifies subscribers of new `pending` order.

## Files of interest
- `backend/campus_eat/settings.py` — configuration, JWT, CORS, cache.
- `backend/apps/*/views.py` — API view implementations.
- `frontend/src/services/client.js` — Axios client and auth interceptor.
