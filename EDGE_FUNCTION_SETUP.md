# Edge Function Setup & CORS Fix Guide

## 🔴 The CORS Error You're Seeing

```
Access to fetch at 'https://hdlfnsghfzrgafxgnuvr.supabase.co/functions/v1/create-delivery-user' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check
```

**Root Cause**: The Edge Function wasn't properly handling the browser's preflight (OPTIONS) request.

---

## ✅ What I Fixed

### 1. **Edge Function Pattern** 
- ❌ Old: `export default async (req) => { ... }`
- ✅ New: `Deno.serve(async (req) => { ... })`

This is the correct pattern for Supabase Edge Functions.

### 2. **CORS Headers**
- ✅ Added `Access-Control-Allow-Methods: POST, OPTIONS`
- ✅ Added `Access-Control-Max-Age: 86400`
- ✅ Return 200 status on OPTIONS request

### 3. **Token Verification**
- ✅ Uses `supabase.auth.getUser(token)` instead of JWT parsing
- ✅ Properly handles expired/invalid tokens
- ✅ Better error messages

### 4. **Error Handling**
- ✅ Graceful JSON parsing error handling
- ✅ Proper status codes for all responses
- ✅ Console logging for debugging

---

## 🚀 How to Deploy the Fixed Edge Function

### Option 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g @supabase/cli

# Login to your Supabase account
supabase login

# Link to your project
supabase link --project-ref hdlfnsghfzrgafxgnuvr

# Deploy the function
supabase functions deploy create-delivery-user

# You should see:
# ✓ Function create-delivery-user deployed successfully!
```

### Option 2: Using Supabase Dashboard

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Edge Functions** → **New Function**
4. Name it: `create-delivery-user`
5. Copy the entire code from `supabase/functions/create-delivery-user/index.ts`
6. Paste it into the editor
7. Click **Deploy**

---

## 🧪 Test the Edge Function

### After Deployment:

```typescript
// In your browser console, test with a valid admin JWT:

const jwt = 'YOUR_ADMIN_ACCESS_TOKEN'; // From your session

const response = await fetch(
  'https://hdlfnsghfzrgafxgnuvr.supabase.co/functions/v1/create-delivery-user',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      full_name: 'Test User',
      phone: '9876543210',
      email: 'test@example.com',
      password: 'TestPassword123'
    })
  }
);

const data = await response.json();
console.log('Response:', data);
```

---

## 🔍 Understanding the Fix

### The CORS Preflight Process

```
Browser:
┌─────────────────────────────────────┐
│ 1. Send OPTIONS request (preflight) │
│    Headers:                         │
│    - Origin: http://localhost:3000  │
│    - Access-Control-Request-Method  │
│    - Access-Control-Request-Headers │
└─────────────────────────────────────┘
         ↓
Supabase Edge Function:
┌─────────────────────────────────────────┐
│ if (req.method === 'OPTIONS') {         │
│   return new Response('ok', {           │
│     status: 200,  ← CRITICAL!           │
│     headers: corsHeaders                │
│   });                                   │
│ }                                       │
└─────────────────────────────────────────┘
         ↓
Browser:
┌────────────────────────────────────┐
│ ✓ CORS check passes!               │
│ → Now send actual POST request     │
└────────────────────────────────────┘
```

### CORS Headers Explained

```typescript
const corsHeaders = {
  // Allow requests from any origin
  'Access-Control-Allow-Origin': '*',
  
  // Allow POST and OPTIONS methods
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  
  // Allow these headers in requests
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  
  // Browser can cache preflight for 24 hours
  'Access-Control-Max-Age': '86400',
};
```

---

## 📊 Updated Edge Function Features

### Security
✅ JWT verification (via `supabase.auth.getUser()`)
✅ Admin-only access check
✅ Service role isolation
✅ Input validation
✅ Password strength check (≥8 chars)
✅ Email format validation

### Reliability
✅ Proper CORS handling
✅ Graceful error handling
✅ Detailed error messages
✅ Console logging for debugging
✅ Non-blocking operations

### Standards Compliance
✅ HTTP 200 on OPTIONS
✅ HTTP 201 on successful creation
✅ HTTP 400 on validation errors
✅ HTTP 401 on auth failures
✅ HTTP 403 on permission denied
✅ HTTP 500 on server errors

---

## 🐛 Debugging Steps

If you still see CORS errors:

### 1. Check Edge Function Deployment
```bash
# View function status in Supabase Dashboard
# Edge Functions → create-delivery-user
# Should show green status "Deployed"
```

### 2. Check Function Logs
```bash
# In Supabase Dashboard, click on the function
# View the logs to see what's happening
# Look for console.log outputs
```

### 3. Verify Environment Variables
In Supabase Dashboard → Settings → Edge Functions:
- ✅ `SUPABASE_URL` should be set
- ✅ `VITE_SUPABASE_ANON_KEY` should be set

### 4. Test with curl
```bash
curl -X OPTIONS \
  https://hdlfnsghfzrgafxgnuvr.supabase.co/functions/v1/create-delivery-user \
  -H "Origin: http://localhost:3000"

# Should return 200 with CORS headers
```

---

## 💾 Files You Received

| File | Purpose |
|------|---------|
| `supabase/functions/create-delivery-user/index.ts` | Fixed Edge Function (Deno.serve pattern) |
| `supabase/functions/create-delivery-user/deno.json` | Dependencies config |
| `src/services/delivery.service.ts` | Updated service with better error handling |
| `EDGE_FUNCTION_SETUP.md` | This guide |

---

## 🚦 The Full Flow (After Fix)

```
User in Admin Panel clicks "Add Delivery Member"
         ↓
Form opens with validation
         ↓
Admin fills: name, phone, email, password
         ↓
Clicks "Create Delivery User"
         ↓
CreateDeliveryUserForm calls:
DeliveryService.createDeliveryUser()
         ↓
Service gets session & JWT token
         ↓
Service calls Edge Function:
POST /functions/v1/create-delivery-user
WITH: Bearer {jwt}
         ↓
Browser sends OPTIONS preflight
         ↓
Edge Function returns 200 with CORS headers ✓
         ↓
Browser sends actual POST request
         ↓
Edge Function verifies JWT
         ↓
Edge Function checks admin role
         ↓
Edge Function validates input
         ↓
Edge Function creates auth user
         ↓
Auth trigger auto-creates profile
         ↓
Edge Function returns: { id, email, full_name, phone }
         ↓
Service receives response
         ↓
Form shows toast: "User created successfully"
         ↓
Form resets
         ↓
Staff list refreshes
         ↓
Modal closes
         ↓
Delivery user can now login ✓
```

---

## ⚡ Quick Checklist

Before testing:

- [ ] Deploy Edge Function via CLI or Dashboard
- [ ] Verify CORS headers in function code
- [ ] Check environment variables are set
- [ ] Frontend build compiles (`npm run build`)
- [ ] Use admin JWT for testing (not regular user)
- [ ] Check browser console for errors
- [ ] Check Edge Function logs in Supabase Dashboard

---

## 🎯 Next Steps

1. **Deploy the Edge Function**
   ```bash
   cd /Users/tristanhancock/Documents/Development/Clones/shreeji-adminpanel
   supabase functions deploy create-delivery-user
   ```

2. **Test the deployment**
   - Go to `/admin/delivery-boys`
   - Click "Add Delivery Member"
   - Fill the form
   - Click "Create Delivery User"
   - Check browser console for logs

3. **Monitor success**
   - Should see toast: "Delivery user created successfully"
   - Staff list should refresh
   - New user should appear in the table

4. **Verify auth works**
   - Logout
   - Try login with new delivery user's email/password
   - Should redirect to `/delivery/orders`

---

## 📞 Troubleshooting

**"Failed to fetch"?**
→ Check Edge Function is deployed and running

**"Invalid token"?**
→ Make sure you're logged in as admin

**"Only admins can create..."?**
→ Log in with admin account, not delivery user

**CORS error still showing?**
→ Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

**Nothing happens on form submit?**
→ Check browser console for errors
→ Check Edge Function logs in Supabase Dashboard

---

This fix handles all browser security requirements for cross-origin requests! 🎉
