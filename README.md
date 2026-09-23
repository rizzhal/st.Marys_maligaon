# St. Mary's Sr. Secondary School - Next.js

This project is the original St. Mary's School website converted from the supplied Vite/React frontend and Express backend into a single Next.js application.

## What was changed

- Converted the frontend entry point to Next.js App Router.
- Removed Vite and React Router as runtime requirements.
- Kept the existing page/component structure and Tailwind UI classes intact.
- Added a Next.js catch-all page so the existing public and admin URLs continue to work.
- Moved the Express controllers, models and authentication logic into `src/server`.
- Added same-origin Next.js API routes under `app/api/[...path]/route.js`.
- Added a Next.js file route for `/uploads/*` so existing uploaded-file URLs remain unchanged.
- Kept MongoDB/Mongoose persistence.
- Removed Docker-related files and configuration.
- Removed Vite build configuration and Vite environment variables.

## Project structure

```text
app/
├── [[...slug]]/page.jsx       # Public/admin page router
├── api/[...path]/route.js     # Converted backend API
├── uploads/[...path]/route.js # Serves runtime uploads
├── globals.css
├── layout.jsx
└── providers.jsx

src/
├── admin/
├── components/
├── pages/
├── assets/
├── services/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   └── models/
├── routing.jsx
└── App.jsx

public/
└── wp-content/uploads/        # Existing public documents/assets
```

## Environment variables

Copy `.env.example` to `.env.local` and configure:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
NODE_ENV=development
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production:

```bash
npm run build
npm start
```

## Important

This application no longer uses a separate Express server or Docker container. The browser calls `/api/...` on the same Next.js origin, and authentication uses the existing HTTP-only `adminToken` cookie.

Runtime uploads are written to the local `uploads/` directory. For serverless hosting, replace local filesystem storage with persistent object storage before production deployment.
