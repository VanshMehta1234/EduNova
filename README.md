# EduNova Frontend

React + TypeScript + TailwindCSS frontend for EduNova educational platform.

## Features

- ⚡ Vite for fast development
- ⚛️ React 19 with TypeScript
- 🎨 TailwindCSS for styling
- 🧭 React Router for navigation
- 🔐 Auth context with localStorage
- 📱 Responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts (Auth)
│   ├── pages/         # Page components
│   ├── App.tsx        # Main app component with routing
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── package.json
```

## Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)
- `/lessons/new` - Create new lesson (protected)
- `/lessons/:id` - View/edit lesson (protected)
- `/public/:slug` - Public lesson view (no auth)

## Authentication

The app uses JWT tokens stored in localStorage. The `AuthContext` provides:

- `user` - Current user data
- `token` - Access token
- `login()` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Authentication status

## API Integration

The `apiClient` in `src/api/client.ts` handles all API requests with automatic token injection.

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Backend Connection

Make sure your Django backend is running on `http://localhost:8000` and CORS is configured to allow requests from `http://localhost:5173`.
