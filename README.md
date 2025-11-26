# ChatZone Vercel Deployment

## Steps

1. **Frontend**: Vercel will build and serve from `frontend/` using Vite.
2. **Backend**: API requests to `/api/*` are routed to Express backend as a serverless function.
3. **Environment Variables**: Set all required variables in Vercel dashboard (do not rely on `.env`).
4. **Build Commands**: Vercel uses `vercel-build` scripts in both frontend and backend.
5. **Custom Routing**: See `vercel.json` for API and static file routing.

## Notes
- For large/complex Express apps, consider deploying backend separately (e.g., on Railway, Render, or Vercel separate project) and update frontend API URLs.
- For local development, run frontend and backend separately as before.

---

See `vercel.json` for build and routing config.