# Deno Edge Functions Setup Guide

## Overview

This project uses Deno for Supabase Edge Functions. Deno and Node.js/React have different configurations, so we maintain separate TypeScript configurations for each.

## Project Structure

```
shreeji-adminpanel/
├── src/                          # React app (Node.js/Vite)
│   └── tsconfig.json             # React TypeScript config
├── supabase/
│   └── functions/
│       └── create-delivery-user/
│           ├── index.ts          # Deno Edge Function
│           └── deno.json         # Deno configuration
├── tsconfig.json                 # Main React config
└── .vscode/
    ├── settings.json             # Deno/VS Code setup
    └── extensions.json           # Recommended extensions
```

## Configuration Files

### 1. `supabase/functions/create-delivery-user/deno.json`

```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2.38.0"
  },
  "compilerOptions": {
    "lib": ["deno.window", "deno.unstable"],
    "allowJs": true,
    "strict": true
  }
}
```

**Key settings:**
- `lib: ["deno.window"]` - Tells TypeScript about Deno globals
- `imports` - Maps module aliases for Edge Functions
- `strict: true` - Strict type checking

### 2. `supabase/functions/create-delivery-user/index.ts`

First line must be:
```typescript
/// <reference lib="deno.window" />
```

This tells TypeScript to use Deno types, giving you access to `Deno` global without import.

### 3. `.vscode/settings.json`

Configures VS Code to use Deno language server:

```json
{
  "deno.enable": true,
  "deno.enablePaths": ["./supabase/functions"],
  "deno.disablePaths": ["./src", "./dist"]
}
```

## Why Two Configurations?

### React App (src/)
- Uses Node.js modules
- TypeScript via Vite
- React/JSX support
- Browser APIs

### Deno Edge Functions (supabase/functions/)
- Uses Deno runtime
- No npm packages (uses URL imports)
- Server-side only
- No browser APIs

## Setting Up VS Code

### Option 1: Automatic (Recommended)
When you open the project, VS Code will suggest installing the Deno extension. Click "Install".

### Option 2: Manual
1. Open VS Code Extensions
2. Search for "Deno"
3. Install "Deno" by denoland
4. Restart VS Code

The `.vscode/settings.json` and `.vscode/extensions.json` files will be auto-detected.

## Available Deno Globals

Once configured, you have access to:

```typescript
Deno.serve()          // HTTP server
Deno.env.get()        // Environment variables
Deno.stdin            // Standard input
Deno.stdout           // Standard output
Deno.open()           // File operations
Deno.cwd()            // Current working directory
```

## Developing Edge Functions

### 1. Create new function

```bash
mkdir supabase/functions/my-function
touch supabase/functions/my-function/index.ts
touch supabase/functions/my-function/deno.json
```

### 2. `deno.json`

```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2.38.0"
  },
  "compilerOptions": {
    "lib": ["deno.window", "deno.unstable"],
    "strict": true
  }
}
```

### 3. `index.ts`

```typescript
/// <reference lib="deno.window" />
import { createClient } from 'supabase';

Deno.serve(async (req) => {
  // Your function logic
  return new Response('Hello from Edge Function!');
});
```

### 4. Deploy

```bash
supabase functions deploy my-function
```

## Debugging Edge Functions

### Local Testing
```bash
supabase functions serve
```

This starts a local Edge Function server for testing.

### Production Logs
```bash
supabase functions logs create-delivery-user
```

View logs from deployed functions.

## Common Issues

### Issue: "Cannot find module 'https://deno.land'"
**Solution:** Ensure you have the Deno extension installed and `.vscode/settings.json` exists.

### Issue: "Cannot find name 'Deno'"
**Solution:** Add the triple-slash reference at the top of your file:
```typescript
/// <reference lib="deno.window" />
```

### Issue: TypeScript errors in Deno code
**Solution:** Verify `supabase/functions/create-delivery-user/deno.json` has proper `lib` configuration.

### Issue: "Unable to resolve module"
**Solution:** Use full URLs for imports:
```typescript
import { something } from "https://esm.sh/package-name";
```

## Best Practices

1. **Use ESM imports with full URLs**
   ```typescript
   // ✅ Good
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
   
   // ❌ Bad
   import { createClient } from '@supabase/supabase-js';
   ```

2. **Keep functions small and focused**
   - One function per file
   - Extract logic to helpers

3. **Handle CORS properly**
   ```typescript
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
     'Access-Control-Allow-Headers': 'authorization, content-type',
   };
   
   if (req.method === 'OPTIONS') {
     return new Response(null, { headers: corsHeaders });
   }
   ```

4. **Validate inputs**
   ```typescript
   if (!req.body) {
     return new Response('Missing request body', { status: 400 });
   }
   ```

5. **Return proper error responses**
   ```typescript
   try {
     // Logic
   } catch (error) {
     return new Response(
       JSON.stringify({ error: error.message }),
       { status: 500 }
     );
   }
   ```

## Resources

- [Deno Documentation](https://deno.land/manual)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase JavaScript Client](https://github.com/supabase/supabase-js)
- [VS Code Deno Extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)

## File Checklist for New Functions

- [ ] `index.ts` exists with `/// <reference lib="deno.window" />`
- [ ] `deno.json` configured with proper imports and compiler options
- [ ] Function exports via `Deno.serve()`
- [ ] CORS headers included
- [ ] Error handling implemented
- [ ] Environment variables documented
- [ ] Function tested locally with `supabase functions serve`
- [ ] Function deployed with `supabase functions deploy`
