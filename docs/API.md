# API Reference

Base API root: `/api/` (served by backend at `http://<host>:8000/api/` in default compose).

Authentication
- `POST /api/register/` — register a user.
  - Body (JSON): `username`, `email`, `password`, optional `role` (`student` or `lounge`) and lounge fields.
- `POST /api/login/` — obtain JWT tokens (via `TokenObtainPairView`).
  - Body: `username`, `password`. Response: `access` and `refresh` tokens.
- `POST /api/token/refresh/` — refresh access token.

Users
- `GET /api/profile/` — get current user profile (auth required).

Foods & Categories
- `GET /api/categories/` — list categories. Search by `?search=`.
- `POST /api/categories/` — create category (admin/lounge).
- `GET /api/foods/` — list foods. Filters: `category`, `lounge`, `meal_time`. Search: `?search=`.
- `GET /api/foods/<id>/` — food details.
- `GET /api/foods/manage/` — lounge/admin manage foods.

Orders
- `GET /api/orders/` — list orders (students see own orders).
- `POST /api/orders/` — create an order.
  - Example request body:
    ```json
    {
      "lounge_id": 1,
      "items": [{"food_id": 10, "quantity": 2}],
      "payment_method": "cash",
      "notes": "No onions"
    }
    ```
- `GET /api/orders/<id>/` — retrieve order details.
- `PATCH /api/orders/status/<id>/` — update order status (`accepted`, `preparing`, `ready`, `completed`, `rejected`, `cancelled`).
- `GET /api/admin/reports/` — admin-only reporting summary.

Lounges
- `GET /api/lounges/` — list active lounges.
- `GET /api/lounge/profile/` — lounge staff profile (view/update own lounge) `GET`/`PATCH`.

Notifications
- `GET /api/notifications/` — list notifications for current user.
- `POST /api/notifications/<id>/read/` — mark single notification read.
- `POST /api/notifications/read-all/` — mark all as read.

Responses typically follow DRF serializers defined in `backend/apps/*/serializers.py`. See those files for field-level details.
