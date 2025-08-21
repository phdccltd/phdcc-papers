# PHDCC Papers - Architecture Overview

## System Description
PHDCC Papers is a web-based journal/conference abstract and paper submission and review system built with Nuxt 4 (Vue 3). 
It provides a complete platform for managing academic paper submissions, reviews, and publication workflows.

## Core Technologies
- **Frontend**: Nuxt 4 (SSG/SPA), Vue 3 Composition API, TypeScript
- **Styling**: Bootstrap 5, SCSS, Bootstrap Vue Next
- **State Management**: Pinia with persistence
- **HTTP Client**: Axios with custom API layer
- **Testing**: Cypress (E2E), ESLint
- **Icons**: FontAwesome
- **Authentication**: JWT tokens with reCAPTCHA

## Architecture Patterns

### 1. Frontend Architecture (SPA)
```
nuxt.config.ts → ssr: false (SPA mode)
├── app/app.vue (root component)
├── app/layouts/defaults.vue (main layout)
├── app/pages/ (file-based routing)
├── app/components/ (reusable UI components)
└── app/assets/css/ (global styles)
```

### 2. State Management
```
app/stores/
├── auth.ts (user authentication & authorisation)
├── misc.ts (general app state)
├── pubs.ts (publications management)
├── submits.ts (submission handling)
├── users.ts (user management)
├── mailtemplates.ts (email templates)
└── sitepages.ts (site content management)
```

### 3. API Layer
```
app/api/
├── BaseAPI.js (core HTTP client with auth)
├── AuthAPI.js (authentication endpoints)
├── PubAPI.js (publications)
├── SubmitAPI.js (submissions)
├── ReviewersAPI.js (reviewer management)
├── GradingsAPI.js (grading/scoring)
├── MailAPI.js (email functionality)
├── DownloadsAPI.js (file downloads)
├── AcceptingsAPI.js (acceptance workflow)
├── SitePagesAPI.js (content management)
└── index.js (API aggregation)
```

## Key Architectural Features

### Authentication & Security
- JWT token-based authentication stored in localStorage
- Authorisation headers automatically injected via BaseAPI
- Role-based access control (normal users, super users)
- User masquerading capability for admin support
- reCAPTCHA integration for form protection

### Component Architecture
- **Form Components**: Reusable form inputs (FormInput, FormLookup, FormFile, etc.)
- **Modal Components**: ConfirmModal, MessageBoxOK, SubmitEditModal
- **Help System**: Contextual help components (Help*)
- **Business Logic**: Grading, Publications, Submissions components

### Route Structure
```
/                                            → Home/landing
/login, /register                            → Authentication
/account                                     → User profile
/panel                                       → Main dashboard (authenticated)
/panel/[pubid]                               → Publication management
/panel/[pubid]/[flowid]/[submitid]           → Submission management
/panel/[pubid]/[flowid]/[submitid]/[entryid] → Submission entry management
/admin                                       → Super user admin
/admin/site-pages                            → Super user site pages admin
```

### Middleware
- `app/middleware/authuser.ts` - Ensures user authentication
- `app/middleware/authsuper.ts` - Requires super user privileges

### Error Handling
- Custom API error classes (APIError, LoginError, SignUpError, MaintenanceError)
- Automatic retry logic for network timeouts
- Global error boundary with user-friendly messages

### Development & Testing
- **Development**: `npm run dev` (port 3000)
- **Linting**: ESLint with Prettier (160 char lines, single quotes)
- **Testing**: Cypress E2E tests with coverage
- **Build**: Static generation for deployment

## Data Flow
1. **User Actions** → Components
2. **Components** → Pinia Stores (actions)
3. **Stores** → API Layer (BaseAPI + specific APIs)
4. **API Responses** → Store state updates
5. **Reactive State** → Component re-rendering

## Deployment Configuration
- **Target**: Azure Static Web Apps
- **Runtime**: Node.js 20+
- **Build**: Static generation (`nuxt generate`)
- **Environment**: Runtime config for API endpoints and feature flags

## External Dependencies
- **Core**: Vue 3, Nuxt 4, Pinia, Axios
- **UI**: Bootstrap 5, Bootstrap Vue Next, FontAwesome
- **Development**: Cypress, ESLint, Prettier, SASS
- **Authentication**: vue-recaptcha-v3, jwt-decode

## File Organisation
- `app/api/` - Backend API integration
- `app/assets/` - Static assets and styles
- `app/components/` - Reusable Vue components
- `app/composables/` - Vue composables
- `app/layouts/` - Page layout templates
- `app/middleware/` - Route guards for authorisation
- `app/pages/` - Route-based page components
- `app/plugins/` - Nuxt plugins
- `app/stores/` - Pinia state management
- `app/utils/` - Utility functions
- `coverage/` - Coverage analysis output
- `cypress/` - Test system
- `node_modules/` - Packages
- `public/` - Static site contents
- `server/` - SSR not used
