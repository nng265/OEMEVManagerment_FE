# OEM EV Warranty Management — Frontend (React + Vite)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview
Frontend web application for OEM EV Warranty Management. Provides UI for Service Centers, Manufacturer staff, and Customers to book appointments and manage warranty workflows.

## Links
- Backend (API): https://github.com/hominhdung9105/OEMEVWarrantyManagement
- Repository: https://github.com/nng265/OEMEVManagerment_FE

## Features
### Customer
- Book service/appointment
- Receive confirmation emails
- View campaign / warranty information

### Service Center / Manufacturer
- Dashboard & analytics
- Warranty request management
- Campaign management
- Spare parts logistics
- Vehicle & customer management

## Tech Stack
- React + Vite
- React Router
- Axios
- Tailwind CSS (or project CSS)
- Google OAuth (if configured)

## Project Structure (as in repo)
```
public/
  add.png
  eye.png
  logo.png
  pencil.png
  request.png

src/
  components/
  configs/
  context/
  features/
  hooks/
  pages/
  routes/
  services/
  App.css
  App.jsx
  index.css
  main.jsx
  index.html

.gitignore
README.md
db.json
package.json
vite.config.js
```

## Setup & Run

### 1. Clone repository
```bash
git clone https://github.com/nng265/OEMEVManagerment_FE.git
cd OEMEVManagerment_FE
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` in project root
```
VITE_API_BASE_URL=http:xxx
VITE_GOOGLE_CLIENT_ID=xxx
```

- `VITE_API_BASE_URL`: URL to Backend API (dev use). Ensure it matches backend address/port.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID if using Google login.

### 4. Run dev server
```bash
npm run dev
```

App will be available at: `http://localhost:5173`

## Connecting with Backend
- Backend URL must be set in `.env` as `VITE_API_BASE_URL`.
- Backend Scalar: `/scalar` where you can inspect endpoints used by FE.

## Notes
- Keep FE API calls aligned with backend DTOs/endpoints.
- If using CORS, ensure backend allows origin `http://localhost:5173` during development.
- Email confirmation links in backend point to FE routes (see `EmailUrlSettings` in backend appsettings).
