# CloudRush Frontend

React + TypeScript single-page application for the CloudRush platform. It provides an Auth0-backed login flow, workspace navigation, and rich UI primitives powered by Radix UI and Tailwind CSS.

## Table of Contents

- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Auth & API Integration](#auth--api-integration)
- [Development Tips](#development-tips)
- [License](#license)

## Overview

The frontend consumes the CloudRush FastAPI backend and surfaces airline revenue insights. Authentication is managed by Auth0; access tokens are stored in local storage and distributed to the rest of the app via a lightweight Zustand store. React Query handles API caching and revalidation, while Radix UI components create a polished dashboard layout.

## Feature Highlights

- 🔐 **Auth0 login** with silent token refresh and API audience support.
- 🛰️ **API-ready state management** via React Query and a global access-token provider.
- 🧭 **Responsive sidebar layout** with quick navigation, favorites, and profile menus.
- 🎨 **Tailwind CSS** theming plus Radix UI primitives for accessible components.
- ⚙️ **Configurable backend target** through environment variables (`VITE_API_URL`).

## Tech Stack

- React 19 (Vite 7 + SWC)
- TypeScript 5.8
- Tailwind CSS 4
- Auth0 React SDK
- @tanstack/react-query
- Zustand state store
- Axios HTTP client
- Radix UI component primitives & lucide-react icons

## Prerequisites

- Node.js 20 LTS or newer
- [pnpm](https://pnpm.io/installation)
- Running instance of the CloudRush backend (default: `http://localhost:8000`)
- Auth0 application configured for the **SPA** flow with API audience access

## Getting Started

```bash
# Clone and enter the repo (if you haven't already)
git clone https://github.com/loihnt05/cloud-rush.git
cd cloud-rush/frontend

# Install dependencies
pnpm install

# Copy environment defaults (optional)
cp .env .env.local  # or create .env.local manually

# Launch the dev server
pnpm dev
```

Vite will start the app at <http://localhost:5173>. Ensure this URL is configured in Auth0 under **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins**.

## Environment Variables

Create either `.env` or `.env.local` (ignored by git) with the following values:

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain | `dev-123456.us.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | Auth0 SPA application client ID | `abcXYZ123` |
| `VITE_AUTH0_API_AUDIENCE` | Audience for API access tokens | `https://cloudrush-api` |
| `VITE_API_URL` | Base URL for the backend API (optional, defaults to `http://localhost:8000`) | `https://api.cloudrush.dev` |

> A starter `.env` is checked in for local development. Duplicate it to `.env.local` (ignored by git) or manage secrets via your preferred tooling before deploying.

Restart the dev server after changing environment values so Vite picks them up.

## Available Scripts

All commands are run with `pnpm <script>`:

| Script | Description |
| --- | --- |
| `dev` | Start Vite in development mode with hot module replacement |
| `build` | Type-check and produce a production build in `dist/` |
| `preview` | Serve the production build locally |
| `lint` | Run ESLint with the repo configuration |

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Sidebar layout, navigation, UI primitives (Radix + Tailwind)
│   ├── hooks/             # Custom hooks (e.g., responsive helpers)
│   ├── pages/             # Routable pages like Home and About
│   ├── services/          # Axios client and API helpers
│   ├── stores/            # Zustand store for tokens & backend URL
│   ├── styles/            # Global Tailwind layer
│   ├── App.tsx            # Auth-aware home page wrapper
│   ├── main.tsx           # App bootstrap (Auth0, React Query, Router providers)
│   └── auth-config.ts     # Reads Auth0 config from Vite env vars
├── vite.config.ts
├── tsconfig.*.json
└── pnpm-lock.yaml
```

## Auth & API Integration

1. Configure an Auth0 SPA application:
   - Allowed Callback URLs: `http://localhost:5173`
   - Allowed Logout URLs: `http://localhost:5173`
   - Allowed Web Origins: `http://localhost:5173`
   - Link an API with the same audience as `VITE_AUTH0_API_AUDIENCE`.
2. Start the backend (`docker compose up` within `/backend`) so the frontend can fetch data.
3. Tokens retrieved by Auth0 are stored via `AccessTokenProvider` and exposed through a Zustand store. `axios` instances can consume `useSettingStore().accessToken` for authenticated calls.

## Development Tips

- Use the browser DevTools Application tab to clear or inspect `access_token` and `auth_error` entries saved to `localStorage` during development.
- Tailwind utilities live in `styles/index.css`; add global layers there instead of editing generated CSS.
- React Query devtools can be enabled by importing `ReactQueryDevtools` if you need visibility into query caches.
- For production deploys, set `VITE_API_URL` to your hosted backend and configure Auth0 with the new domain.

## License

This project is licensed under the MIT License (see root `LICENSE`).
