# 🚀 Production Ready - Deployment Guide

## What's Been Fixed for Production

### 1. **Image Assets** ✅
- Logo now imported as ES module instead of static path
- Vite will optimize and hash images in production
- Works correctly with asset fingerprinting

**Files updated:**
- `src/pages/admin/Login.tsx`
- `src/components/admin/Sidebar.tsx`

### 2. **Console Logging** ✅
- All debug logs wrapped in `if (import.meta.env.DEV)` checks
- Logs stripped from production builds
- Error logs preserved for debugging

**Files updated:**
- `src/hooks/useAuth.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/RequireDeliveryBoy.tsx`

### 3. **Deno Edge Functions** ✅
- TypeScript configuration fixed with proper Deno types
- `supabase/functions/create-delivery-user/deno.json` configured

### 4. **Build Configuration** ✅
- Vite configured for optimal production builds
- Code splitting enabled (React, Supabase, UI vendors separate)
- Minification and optimization enabled
- Source maps disabled

### 5. **Environment Variables** ✅
- `.env.production` template created
- `.gitignore` properly configured
- Examples documented in `.env.example`

---

## Quick Start: Deploy to Production

### Step 1: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.production

# Edit with your PRODUCTION Supabase credentials
nano .env.production
```

**Required values:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Step 2: Build for Production

```bash
npm run build
```

This creates an optimized `dist/` folder containing:
- Minified HTML/CSS/JS
- Optimized images
- Split vendor chunks for efficient caching
- All assets properly hashed

### Step 3: Deploy

Choose your platform and deploy the `dist/` folder:

#### **Option A: Vercel (Recommended)**
```bash
npm install -g vercel
vercel --prod
```
- Automatically detects Vite project
- Handles environment variables securely
- Includes global CDN
- Free tier available

#### **Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir dist
```

#### **Option C: AWS S3 + CloudFront**
```bash
aws s3 sync dist/ s3://your-bucket-name
# Configure CloudFront distribution pointing to S3
```

#### **Option D: Docker Container**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Step 4: Configure Supabase

1. Go to Supabase Dashboard
2. Project Settings → API
3. Update CORS allowed origins with your production domain:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

4. Verify Edge Functions are deployed:
   ```bash
   supabase functions list
   ```

### Step 5: Test in Production

- [ ] Visit your production URL
- [ ] Login with admin account
- [ ] Login with delivery account
- [ ] Create an order (if applicable)
- [ ] Mark order as completed
- [ ] Check console for errors (should be empty)
- [ ] Verify all images load
- [ ] Test on mobile

---

## Environment Variables

### Development (`.env.local`)
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-key
```

### Production (`.env.production`)
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-key
```

⚠️ **NEVER commit `.env.production` to git**

---

## Security Checklist

- [ ] Using separate Supabase projects for dev/prod
- [ ] ANON_KEY has minimal permissions (RLS enforces security)
- [ ] SERVICE_ROLE_KEY never exposed in frontend
- [ ] All table RLS policies enabled
- [ ] CORS properly configured
- [ ] Edge Functions deployed with proper CORS headers
- [ ] Environment variables injected at build/deploy time

---

## Performance Metrics

Expected bundle sizes (gzipped):
- Total: ~200-250 KB
- React vendor: ~60 KB
- Supabase vendor: ~40 KB
- App code: ~50 KB
- UI libraries: ~50 KB

Performance goals:
- First Contentful Paint: < 2 seconds
- Time to Interactive: < 3 seconds
- Lighthouse Score: > 90

---

## Monitoring & Observability

### Recommended Tools

1. **Error Tracking**
   - Sentry (free tier available)
   - LogRocket

2. **Performance Monitoring**
   - Vercel Analytics (if using Vercel)
   - Google Analytics
   - New Relic

3. **Uptime Monitoring**
   - UptimeRobot
   - Datadog

### What to Monitor

- Application errors in console
- Supabase Edge Function execution time
- Database query performance
- API response times
- User authentication failures
- Page load performance

---

## Troubleshooting

### Issue: Images not loading in production
**Solution:** Ensure images are imported as ES modules, not static paths.

### Issue: Console showing "Cannot find module" errors
**Solution:** Verify `.env.production` file exists with correct Supabase credentials.

### Issue: Delivery users can't see orders
**Solution:** Check Supabase RLS policies allow `delivery_boy` role to read orders.

### Issue: Build fails with TypeScript errors
**Solution:** Run `npm run typecheck` to see all type errors.

### Issue: Slow page loads
**Solution:** 
- Check Supabase query performance
- Monitor API response times
- Check browser DevTools Network tab
- Consider adding caching

---

## Rollback Procedure

If something goes wrong in production:

1. **Revert deployment** to previous version
2. **Clear CDN cache** (if applicable)
3. **Clear browser cache** in user's browser (or wait 24 hours)
4. **Check Supabase logs** for database/API errors
5. **Verify RLS policies** haven't changed

---

## Documentation Files

- `DEPLOYMENT.md` - Detailed deployment guide
- `PRODUCTION_CHECKLIST.md` - Pre-deployment verification
- `.env.example` - Environment variable template
- `README.md` - Project overview

---

## Support & Next Steps

After deployment:

1. Monitor application for 24-48 hours
2. Collect user feedback
3. Optimize based on analytics
4. Plan feature releases
5. Schedule regular security audits

---

**Ready to deploy?** Run `npm run build` and follow the deployment steps above! 🎉
