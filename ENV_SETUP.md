# Frontend Environment Variables

## Required `.env` File

Create a `.env` file in the `frontend/` directory with the following:

```env
VITE_API_URL=http://localhost:8000/api
```

## Explanation

### `VITE_API_URL`

- **Purpose**: Base URL for all API requests to your Django backend
- **Format**: Full URL including protocol, host, port, and `/api` path
- **Default**: `http://localhost:8000/api` (if not set)

### Examples

**Local Development:**
```env
VITE_API_URL=http://localhost:8000/api
```

**Production (example):**
```env
VITE_API_URL=https://api.edunova.com/api
```

**Different Port:**
```env
VITE_API_URL=http://localhost:3000/api
```

## Important Notes

1. **Vite Prefix**: All environment variables in Vite must start with `VITE_` to be exposed to the client-side code.

2. **No Trailing Slash**: Don't add a trailing slash to the URL. The API client will handle path concatenation.

3. **CORS**: Make sure your Django backend's `CORS_ALLOWED_ORIGINS` includes your frontend URL:
   - Development: `http://localhost:5173`
   - Production: Your production domain

4. **Restart Required**: After changing `.env`, restart the Vite dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## How It's Used

The `VITE_API_URL` is used in `src/api/client.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

All API requests will use this base URL:
- Login: `POST ${VITE_API_URL}/auth/login/`
- Register: `POST ${VITE_API_URL}/auth/register/`
- Lessons: `GET ${VITE_API_URL}/lessons/`
- etc.

## Security Note

⚠️ **Important**: Environment variables in Vite are exposed to the client-side code. Never put sensitive information (like API keys, secrets) in `.env` files that start with `VITE_`.

For sensitive data, use server-side endpoints or environment-specific configuration.

