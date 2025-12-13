# EduNova Frontend

React + TypeScript + TailwindCSS frontend for EduNova educational platform.

## Features

- ⚡ Vite for fast development
- ⚛️ React 19 with TypeScript
- 🎨 TailwindCSS for styling
- 🧭 React Router for navigation
- 🔐 JWT authentication with localStorage
- 📱 Responsive design
- 🤖 AI-powered lesson generation
- 📄 PDF export functionality
- 🔍 Public lesson exploration
- 🎯 Filtering and sorting capabilities
- 🖼️ Video thumbnail previews
- 📝 Rich lesson content editing

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
│   ├── api/              # API client and endpoints
│   │   ├── auth.ts       # Authentication API
│   │   └── lessons.ts    # Lessons API
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx    # Main layout wrapper
│   │   ├── Navbar.tsx    # Navigation bar
│   │   └── ProtectedRoute.tsx  # Route protection
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx    # Landing/home page
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx      # Registration page
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── NewLesson.tsx      # Create new lesson
│   │   ├── EditLesson.tsx     # Edit existing lesson
│   │   ├── LessonDetail.tsx   # View lesson details
│   │   ├── PublicLesson.tsx   # Public lesson view
│   │   └── Explore.tsx        # Explore public lessons
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
│   ├── favicon.svg       # App favicon
│   └── hero_right.jpg    # Landing page hero image
└── package.json
```

## Routes

- `/` - Landing page (accessible to all)
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - User dashboard (protected)
- `/lessons/new` - Create new lesson (protected)
- `/lessons/:id` - View lesson details (protected)
- `/lessons/:id/edit` - Edit lesson (protected)
- `/public/:slug` - Public lesson view (no auth required)
- `/explore` - Explore public lessons (no auth required)

## Authentication

The app uses JWT tokens stored in localStorage. The `AuthContext` provides:

- `user` - Current user data
- `token` - Access token
- `login()` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Authentication status
- `isInitializing` - Loading state

### Protected Routes

Routes wrapped with `<ProtectedRoute>` require authentication. Unauthenticated users are redirected to `/login`.

## API Integration

The `apiClient` in `src/api/client.ts` handles all API requests with automatic token injection and error handling.

### API Endpoints Used

- **Authentication:**
  - `POST /api/auth/register/` - Register new user
  - `POST /api/auth/login/` - Login user
  - `GET /api/auth/me/` - Get current user

- **Lessons:**
  - `POST /api/lessons/generate/` - Generate lesson content with AI
  - `GET /api/lessons/` - List user's lessons
  - `POST /api/lessons/` - Create lesson
  - `GET /api/lessons/:id/` - Get lesson details
  - `PUT /api/lessons/:id/` - Update lesson
  - `DELETE /api/lessons/:id/` - Delete lesson
  - `GET /api/lessons/:id/export-pdf/` - Export lesson as PDF
  - `POST /api/lessons/:id/toggle-public/` - Toggle public status
  - `GET /api/lessons/public/` - List public lessons
  - `GET /api/lessons/public/:slug/` - Get public lesson by slug

## Key Features

### Lesson Generation
- AI-powered content generation using OpenAI
- Duration-based content length
- Automatic image and video suggestions
- Comprehensive lesson structure (description, content, activities, questions, summary)

### Lesson Management
- Create, read, update, and delete lessons
- Filter by status, subject, and grade level
- Sort by various fields (date, topic, subject, etc.)
- Public/private lesson sharing
- PDF export functionality

### User Experience
- Responsive design for mobile and desktop
- Video thumbnail previews
- Rich text editing for lesson content
- Loading states and error handling
- Smooth animations and transitions

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Backend Connection

Make sure your Django backend is running on `http://localhost:8000` and CORS is configured to allow requests from `http://localhost:5173`.

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000/api`)

## Styling

The project uses TailwindCSS for styling. Custom animations and styles are defined in `src/index.css`.

### Key Design Features

- Modern, clean UI with gradient accents
- Consistent color scheme (blue/indigo/purple)
- Smooth transitions and hover effects
- Responsive grid layouts
- Accessible form controls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Production Build

```bash
npm run build
```

The production build will be in the `dist/` directory, ready to be deployed to any static hosting service.
