# Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors in development
- [ ] Environment variables configured for production
- [ ] Supabase Edge Functions deployed
- [ ] Database migrations applied
- [ ] RLS policies enabled on all tables
- [ ] CORS properly configured

## Environment Setup

### 1. Create Production Environment File

Copy `.env.example` to `.env.production`:

```bash
cp .env.example .env.production
```

Update with your production Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

**⚠️ NEVER commit `.env.production` to version control**

### 2. Build for Production

```bash
npm run build
```

This will:
- Run TypeScript type checking
- Build optimized production bundles
- Split vendor code for better caching
- Generate `dist/` folder with all assets

### 3. Deploy

The `dist/` folder contains all production-ready files.

**Recommended platforms:**
- Vercel (recommended for React apps)
- Netlify
- AWS S3 + CloudFront
- DigitalOcean App Platform
- Google Cloud Run

## Security Best Practices

1. **Environment Variables**
   - Use production Supabase project
   - Keep ANON_KEY secure (visible in client, but only has permissions you grant)
   - Never expose SERVICE_ROLE_KEY in frontend

2. **CORS Configuration**
   - Configure Supabase Edge Functions with proper CORS headers
   - Allow only your production domain

3. **RLS (Row Level Security)**
   - Enable RLS on all tables
   - Create policies for each role (admin, delivery_boy)
   - Test policies before deploying

4. **API Rate Limiting**
   - Enable Supabase rate limiting
   - Monitor Edge Function execution

## Monitoring

- Monitor Supabase usage in dashboard
- Check Edge Function logs
- Set up error tracking (Sentry, LogRocket)
- Monitor bundle size and performance

## Rollback Procedure

If issues arise in production:

1. Revert to previous `dist/` build
2. Clear browser cache (or use cache busting)
3. Check Supabase Edge Function logs
4. Verify RLS policies
5. Check environment variables

## CI/CD Integration

For automated deployments, ensure:

1. TypeScript type checking passes
2. Build completes successfully
3. Environment variables are injected
4. Deploy only the `dist/` folder
5. Run smoke tests on production URL

## Production Performance Tips

- All console.log statements are removed in production builds
- Code is minified and split into vendor chunks
- Assets are optimized by Vite
- Image assets are processed by bundler
- Consider adding CDN for static assets
