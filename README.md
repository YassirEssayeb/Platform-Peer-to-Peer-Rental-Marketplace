# Peer-to-Peer Rental Marketplace

A platform where users can rent items from each other. Built with Next.js, TypeScript, and MySQL.

## Features

- Browse and search rental items by category, location, and price
- Book items with date range picking and conflict detection
- Real-time messaging between renters and owners
- Digital wallet with deposit/withdraw functionality
- Mutual review system (rate product and renter)
- Owner dashboard for managing listings and bookings
- Admin panel with user/product management and analytics

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide icons
- **Backend:** Next.js API routes, Socket.io (real-time chat)
- **Database:** MySQL with mysql2 driver
- **Auth:** JWT with cookie-based sessions

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentmarket.com | admin123 |
| Owner | owner@test.com | password123 |
| Renter | renter@test.com | password123 |

## Project Structure

```
src/
  app/
    api/        # REST API routes
    auth/       # Login/register pages
    products/   # Product listing and detail pages
    dashboard/  # Owner dashboard pages
    admin/      # Admin panel pages
    chat/       # Real-time messaging pages
    wallet/     # Digital wallet page
    profile/    # User profile page
  components/   # Shared UI components
  lib/          # Utilities and database connection
  context/      # React context (auth)
```
