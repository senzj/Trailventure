# Trailventure 🏕️

Trailventure is a full-stack storefront for premium camping gear and outdoor equipment. It pairs a React/Vite frontend with a lightweight Express + SQLite API, keeping everything simple to run locally and easy to host.

## Tech Stack

- **Frontend:** React 18, Vite, React Router, Jotai (state), Tailwind CSS + shadcn/ui components, react-toastify
- **Backend:** Express 5, `better-sqlite3` (SQLite), `multer` (image uploads)
- **Auth:** local JWT tokens, user/admin roles (no Firebase)

## Getting Started

### Prerequisites

- Node.js 18+ (uses the `--env-file-if-exists` flag, available in Node 22.9+; earlier versions work if you don't rely on env-specific flags)

### Install

```bash
npm install
```

### Run the dev servers

```bash
npm run dev
```

This starts both the API (http://localhost:3001) and the Vite web app (http://localhost:5173) at the same time with `concurrently`. Open http://localhost:5173.

### Seed the database

An admin user, categories, and sample products are auto-seeded on first run. To re-seed manually:

```bash
npm run seed
```

### Demo login

| Role        | Email                        | Password    |
| ----------- | ---------------------------- | ----------- |
| Super Admin | `superadmin@trailventure.com` | `Super123!` |
| Admin       | `admin@trailventure.com`     | `Admin123!` |
| Member      | `user@trailventure.com`      | `User123!`  |

> **Roles:** members can browse and order. Admins manage products/discounts/orders. Super admins additionally **manage users and roles** (via the Users tab in the admin dashboard).

## Scripts

| Command         | Description                                   |
| --------------- | --------------------------------------------- |
| `npm run dev`   | Run the API and web app together (HMR)        |
| `npm run dev:web` | Run only the Vite web app                     |
| `npm run server`| Run only the Express + SQLite API             |
| `npm run seed`  | Seed/reset the database                       |
| `npm run build` | Production build to `dist/`                   |
| `npm run preview` | Preview the production build                  |
| `npm run lint`  | Lint with ESLint (+ Prettier via lint-staged) |

## Environment Configuration

Copy `.env.example` to `.env` to customize ports, the database path, and the frontend API base URL. The defaults work out of the box for local development.

| Variable           | Default                     | Description                                            |
| ------------------ | --------------------------- | ------------------------------------------------------ |
| `PORT`             | `3001`                      | Port the Express + SQLite API listens on.              |
| `DB_PATH`          | `./server/data/trailventure.db` | Location of the SQLite database file.                 |
| `VITE_API_BASE`    | *(empty)*                   | API origin for the frontend. Leave empty in local dev (Vite proxies `/api`). |

> **Deploying?** Set `PORT`, point `DB_PATH` at a writable location, and set `VITE_API_BASE` to your deployed API origin if the frontend and API live on different hosts.

## Updating the App Icon

The site icon (favicon) lives in **`public/icon.webp`** (a copy of the example at `src/assets/icon.webp`), referenced from `index.html`:

```html
<link rel="icon" type="image/webp" href="/icon.webp" />
```

To use your own icon:

1. Export your logo/icon as a `.webp`, `.png`, or `.ico` file.
2. Drop it into `public/` (e.g. `public/app-icon.png`).
3. Point `index.html` to it, matching the file type:

```html
<link rel="icon" type="image/png" href="/app-icon.png" />
```

> **Tip:** Serve an optional higher-resolution touch icon too for mobile home screens:

> ```html
> <link rel="apple-touch-icon" href="/app-icon.png" />
> ```

Any file added to `public/` is served at the root (e.g. `/icon.webp`), so you can reference it with an absolute path. For folders you keep in `src/`, import the asset in JS/CSS instead so Vite handles hashing and bundling.

Note: the `src/assets/icon.webp` is just an example; you can delete it once your own icon is in `public/`.

## Project Structure

```
├── public/            # Static assets served as-is (icons, product images)
├── server/            # Express + SQLite backend
│   ├── index.js       # App entry, middleware, route mounting
│   ├── db.js          # SQLite setup + schema/migrations
│   ├── seed.js        # Demo admin, categories, products
│   ├── middleware/    # Auth guards (requireAuth, requireAdmin)
│   └── routes/        # auth, products, categories, orders
└── src/
    ├── api/           # Frontend API clients (client.js, products, orders, ...)
    ├── atom/          # Jotai atoms (auth, shopping cart)
    ├── assets/        # Bundled assets (backgrounds, example icon)
    ├── components/    # Reusable UI + business components
    ├── hooks/         # useAuth, etc.
    ├── lib/           # Utility helpers
    └── pages/         # Route-level pages (Home, Search, Product, Cart, Checkout, Admin…)
```

## API Overview

All endpoints are namespaced under `/api` and proxied by Vite in development.

| Method | Endpoint                   | Auth          | Description                          |
| ------ | -------------------------- | ------------- | ------------------------------------ |
| POST   | `/api/auth/register`       | Public        | Create an account (email, password, optional username/name/phone/address) |
| POST   | `/api/auth/login`          | Public        | Log in, returns a token              |
| GET    | `/api/products`            | Public        | List products (search/filter)        |
| GET    | `/api/products/:id`        | Public        | Get a single product                 |
| POST   | `/api/products`            | Admin         | Create a product                     |
| PUT    | `/api/products/:id`        | Admin         | Update a product                     |
| DELETE | `/api/products/:id`        | Admin         | Delete a product                     |
| GET    | `/api/categories`          | Public        | List categories                      |
| POST   | `/api/orders`              | Public        | Create an order                      |
| GET    | `/api/orders`              | Admin         | List orders                          |
| PUT    | `/api/orders/:id/status`   | Admin         | Update an order's status             |
| GET    | `/api/users`               | Super Admin   | List users                           |
| POST   | `/api/users`               | Super Admin   | Create a user (email, username, name, phone, address, password, role) |
| PUT    | `/api/users/:id`           | Super Admin   | Update a user's profile (name/phone/address) or reset password |
| PUT    | `/api/users/:id/role`      | Super Admin   | Change a user's role                 |
| DELETE | `/api/users/:id`           | Super Admin   | Delete a user account                |

Order statuses: `pending`, `processing`, `completed`, `cancelled`.
Roles: `user`, `admin`, `superadmin`.