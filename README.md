# Chantallow

Storefront website + admin panel, split into two apps:

    backend/                 Express JSON API (port 3000)
      server.js              routes
      auth.js                JWT, password hashing, role guards, admin seeding
      db.js                  PostgreSQL pool (DigitalOcean, SSL)
      upload.js              Multer file uploads
      schema.sql             products + users tables (created on startup)
      .env                   backend config (not committed — see .env.example)
      public/uploads/products/   uploaded product media
    frontend/                React + Vite website (port 5173)
      src/api/client.js          fetch wrapper + token storage
      src/context/AuthContext.jsx  current user + role, login/register/logout
      src/components/ProtectedRoute.jsx
      src/admin/                 admin panel pages (/admin/...)
      src/pages/Login, SignUp    wired to the API

## Running it

Two terminals:

    cd backend
    npm install
    npm run dev          # http://localhost:3000

    cd frontend
    npm install
    npm run dev          # http://localhost:5173

In dev, Vite proxies `/api` and `/uploads` to `localhost:3000`, so the site needs no
API URL config. For a deployed API, set `VITE_API_URL=https://api.example.com` in
`frontend/.env` and add the site's origin to `CLIENT_ORIGIN` in `backend/.env`.

## Roles

There are two roles, stored on each row of the `users` table:

| Role    | How you get it                                   | Can do |
|---------|--------------------------------------------------|--------|
| `user`  | Sign up at `/register`                           | Browse, cart, wishlist, stay signed in |
| `admin` | Seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, or promoted at `/admin/users` | Everything above + `/admin` (products, users) |

- Both roles log in on the same page, `/login`. Admins are redirected to `/admin`; users go home
  (or back to the page they came from).
- `/admin/*` is guarded twice: in React by `<ProtectedRoute role="admin">`, and on the
  server by `requireAuth` + `requireRole('admin')` on every write route. The server is the
  real gate — the React guard only keeps users from seeing a broken page.
- The server reloads the user from the database on every request, so promoting or
  demoting someone takes effect immediately, not when their token expires.
- Admins can't remove their own admin role (prevents locking yourself out).

## API

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` `{ name, email, password }` | public — creates a `user` |
| POST | `/api/auth/login` `{ email, password }` | public — returns `{ token, user: { role, … } }` |
| GET | `/api/auth/me` | signed in |
| GET | `/api/meta` | public |
| GET | `/api/products` (`search`, `category`, `size`, `min_price`, `max_price`) | public |
| GET | `/api/products/:id` | public |
| POST | `/api/products` (multipart, `media` files) | admin |
| PUT | `/api/products/:id` (multipart, `keep_media` + `media`) | admin |
| DELETE | `/api/products/:id` | admin |
| GET | `/api/admin/users` | admin |
| PATCH | `/api/admin/users/:id` `{ role }` | admin |

Authenticated requests send `Authorization: Bearer <token>`.

## Before going live

1. **Rotate the database password.** It has been shared in plaintext; change it in the
   DigitalOcean console and update `backend/.env`.
2. **DigitalOcean Trusted Sources**: the database only accepts connections from allowed IPs.
   Add your machine / server IP, or the API starts with "DB unavailable".
3. **Uploads live on local disk.** On App Platform / containers that disk is wiped on
   redeploy. Move to DigitalOcean Spaces before deploying — only `upload.js` needs to change.
4. The storefront pages still read products from `frontend/src/data/products.js`. Products
   added in the admin panel are served by `GET /api/products`, ready to be wired into the
   shop pages.
