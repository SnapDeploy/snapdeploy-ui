# SnapDeploy Dashboard Setup

## Overview

This dashboard is built using:

- **React** with TypeScript
- **Clerk** for authentication
- **shadcn/ui** for UI components
- **Tailwind CSS** for styling
- **React Router** for navigation

## File Structure

```
src/
├── components/
│   ├── ui/                          # shadcn components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   └── sidebar.tsx
│   ├── layout/                      # Layout components
│   │   ├── DashboardLayout.tsx      # Main layout wrapper with sidebar & header
│   │   ├── DashboardSidebar.tsx     # Left sidebar navigation
│   │   └── Header.tsx               # Top navigation bar with search & user menu
│   └── dashboard/                   # Dashboard widgets
│       ├── StatsCard.tsx            # Reusable metric cards
│       ├── RecentActivity.tsx       # Activity feed component
│       └── QuickActions.tsx         # Quick action buttons
├── pages/
│   ├── auth/
│   │   └── SignInPage.tsx           # Clerk sign-in page
│   ├── dashboard/                   # Dashboard pages
│   │   ├── Overview.tsx             # Main dashboard with stats & activity
│   │   ├── DeploymentsPage.tsx      # Deployments list & management
│   │   ├── ProfilePage.tsx          # User profile information
│   │   └── SettingsPage.tsx         # Application settings
│   └── index.ts                     # Page exports
├── hooks/
│   └── useUser.ts                   # Custom user hook (wraps Clerk)
├── lib/
│   └── utils.ts                     # Utility functions
├── App.tsx                          # Main app with routing
└── main.tsx                         # App entry point with Clerk provider
```

## Features Implemented

### 1. Authentication

- ✅ Clerk integration for secure authentication
- ✅ Protected routes (requires sign-in)
- ✅ User profile management
- ✅ Sign-out functionality

### 2. Layout Components

#### DashboardLayout

- Main layout wrapper for all dashboard pages
- Contains sidebar and header
- Uses React Router's `<Outlet />` for nested routing

#### DashboardSidebar

- Left navigation with active route highlighting
- Navigation items:
  - Overview (/)
  - Deployments (/deployments)
  - Profile (/profile)
  - Settings (/settings)
- Sign-out button at the bottom

#### Header

- Search functionality
- Notification bell with indicator
- User dropdown menu with avatar
- Quick access to profile and settings

### 3. Dashboard Pages

#### Overview (`/`)

- 4 stat cards showing key metrics:
  - Total Deployments
  - Active Services
  - Success Rate
  - Average Deploy Time
- Recent Activity feed
- Quick Actions grid

#### Deployments (`/deployments`)

- List of all deployments
- Status badges (Success, Pending, Failed)
- Environment tags (Production, Staging, Development)
- Deployment details (branch, version, timestamp)
- "New Deployment" action button

#### Profile (`/profile`)

- User account information
- Avatar with fallback initials
- Email and join date
- Recent activity statistics

#### Settings (`/settings`)

- General settings (app name, default environment)
- Notification preferences
- Security settings (2FA, API keys)
- Database connection settings

### 4. Reusable Components

#### StatsCard

```typescript
<StatsCard
  title="Total Deployments"
  value="24"
  icon={Rocket}
  description="Last 30 days"
  trend={{ value: "12%", isPositive: true }}
/>
```

#### RecentActivity

- Displays recent deployment activities
- Status indicators (success, failed, pending)
- Timestamps

#### QuickActions

- Grid of quick action buttons
- Icons with descriptions
- Variants for primary/secondary actions

## Installation & Setup

### 1. Environment Variables

Create a `.env` file in the `snapdeploy-ui` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

### 2. Install Dependencies

```bash
cd snapdeploy-ui
pnpm install
```

### 3. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Routes

| Route          | Component       | Description                            |
| -------------- | --------------- | -------------------------------------- |
| `/`            | Overview        | Main dashboard with stats and activity |
| `/deployments` | DeploymentsPage | List and manage deployments            |
| `/profile`     | ProfilePage     | User profile information               |
| `/settings`    | SettingsPage    | Application settings                   |

## Customization

### Adding New Pages

1. Create a new page component in `src/pages/dashboard/`
2. Export it from `src/pages/index.ts`
3. Add a new route in `src/App.tsx`
4. Add navigation item in `src/components/layout/DashboardSidebar.tsx`

### Adding shadcn Components

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Styling

- Uses Tailwind CSS with shadcn's design system
- Color scheme: Blue primary (blue-600) with neutral grays
- Responsive breakpoints: sm, md, lg
- Custom CSS variables in `src/index.css`

## Design Principles

1. **Clean & Modern**: Minimalist design with ample whitespace
2. **Responsive**: Works on all screen sizes
3. **Consistent**: Uses shadcn components for uniformity
4. **Accessible**: Proper ARIA labels and keyboard navigation
5. **Fast**: Optimized with React best practices

## Next Steps

To connect to your backend API:

1. Create an API client in `src/lib/api.ts`
2. Use React Query or SWR for data fetching
3. Replace mock data with real API calls
4. Add loading states and error handling
5. Implement real-time updates with WebSockets

## Tech Stack Details

- **React 19**: Latest React features
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Beautiful component library
- **Clerk**: Authentication & user management
- **Lucide React**: Icon library
- **React Router**: Client-side routing

## Support

For issues or questions:

1. Check the shadcn/ui documentation: https://ui.shadcn.com
2. Check Clerk documentation: https://clerk.com/docs
3. Review the codebase comments and TypeScript types
