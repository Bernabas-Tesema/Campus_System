# Campus Eat Frontend — Component Architecture

The frontend is organized so **UI components**, **domain modules** (with their own API layer), and **pages** (routing + state) stay separate. A module can be copied into another React project with minimal wiring.

## Directory layout

```
frontend/src/
├── components/           # Shared, reusable UI (no business API)
│   ├── ui/               # Alert, IconInput, PasswordField, LoadingSpinner
│   ├── layout/           # AppShell, Navbar, Footer
│   ├── routing/          # ProtectedRoute, RoleRedirect
│   └── Layout.jsx        # Re-exports AppShell (backward compatible)
│
├── modules/              # Domain bundles (portable)
│   ├── auth/
│   │   ├── components/   # AuthLayout, LoginForm, RegisterForm, …
│   │   ├── services/api.js
│   │   └── index.js
│   ├── food/services/api.js
│   ├── orders/
│   │   ├── components/   # StatusBadge
│   │   └── services/api.js
│   ├── lounge/services/api.js
│   ├── admin/services/api.js
│   └── notifications/services/api.js
│
├── services/
│   ├── client.js         # Axios instance + auth interceptors
│   └── api.js            # Barrel re-export (existing imports still work)
│
├── context/              # App-wide React context (Auth, Cart)
├── pages/                # Route entry points — compose modules + context
└── utils/
```

## Layers

| Layer | Responsibility | Example |
|-------|----------------|---------|
| **pages** | Routes, local state, navigation after API calls | `pages/Login.jsx` |
| **modules/…/components** | Presentational UI for one domain | `LoginForm` |
| **modules/…/services** | HTTP API for that domain | `authAPI.login()` |
| **services/client.js** | Shared HTTP client | Bearer token, 401 redirect |
| **context** | Global session state | `AuthProvider`, `useAuth` |

## Using a module in another project

1. Copy the module folder, e.g. `src/modules/auth/`.
2. Copy dependencies: `src/components/ui/`, `src/services/client.js`.
3. Set `VITE_API_URL` to your backend.
4. Import from the module barrel:

```jsx
import { AuthLayout, LoginForm, authAPI } from './modules/auth';
```

5. Wire your own auth state (or copy `context/AuthContext.jsx`).

## Import conventions (this app)

- **Pages** → prefer `modules/<domain>` for APIs and domain UI.
- **Legacy** → `services/api` still works (re-exports all domain APIs).
- **Orders status** → `modules/orders` or `components/StatusBadge` (alias).

## What not to change when extracting

- Tailwind classes in `index.css` (`.btn-primary`, `.card`, `.input`).
- `AuthProvider` + `BrowserRouter` in `main.jsx` for the full app.
