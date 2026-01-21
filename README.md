# BorrowBook Frontend

A React frontend application for a physical book borrowing system where users can share and borrow books from each other.

## What does it do?

BorrowBook allows users to:
- Register/login with email verification or Google OAuth
- Add books to their collection (integrates with Google Books API)
- Search and browse available books from other users
- Send and manage borrow requests
- View other users' profiles and book collections
- Admin panel for user management and request handling

## Architecture

- **Framework**: React 19 with Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 4
- **Authentication**: Google OAuth integration via `@react-oauth/google`
- **Security**: CSRF token handling, DOMPurify for XSS prevention
- **Icons**: Heroicons

### Key Components
- CSRF-protected API requests with automatic token refresh
- Role-based route protection (USER/ADMIN)
- Responsive design with custom Tailwind styling
- Security headers configured for Cloudflare Pages deployment

## How to Run

### Prerequisites
- Node.js 18+
- npm or yarn

### Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Edit .env.development with your backend API URL for local development
# Edit .env.production with your backend API URL for production builds

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Backend API base URL (e.g., `https://borrowbook.me`) |

## CI/CD Pipeline

The project uses Cloudflare Pages for continuous deployment.

### Build Settings

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `/dist` |
| Build system version | 3 (latest) |

### How It Works

- On **push to production branch**: Cloudflare automatically builds and deploys
- Build process: Install → Build → Deploy to Cloudflare's global network
- Custom `_headers` file configures security headers (CSP, HSTS, etc.)

### Security Headers

The `public/_headers` file configures:
- `Strict-Transport-Security` - HSTS with preload
- `X-Frame-Options` - Clickjacking protection
- `Content-Security-Policy` - XSS and injection protection
- `Referrer-Policy` - Privacy-focused referrer handling
