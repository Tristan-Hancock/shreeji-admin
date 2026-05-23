# Settings Page - Complete Guide

## Overview

The Settings page provides users with comprehensive account management, security settings, and system role information.

## Features

### 1. Profile Card
Displays user's current information:
- Avatar with role icon
- Full name
- Email address
- Current role badge

Users can click "Edit Profile" to modify their account details (future feature).

---

## 2. Store Configuration

Access various operational settings:

#### Store Details
- Configure store name
- Set address and location
- Add VAT/Tax information
- Business hours

#### WhatsApp Setup
- Configure automated notification numbers
- Set up WhatsApp Business integration
- Test messaging functionality

#### App Appearance
- Upload custom logos
- Set brand colors
- Configure theme settings
- Customize branding

---

## 3. Security & Roles

### Your Role & Permissions

Displays:
- Current role name and access level
- Detailed description of role capabilities
- List of all permissions you have

### System Roles

Shows all available roles in the system:

#### Administrator
- **Full Access Badge**
- Full system control
- Permissions:
  - View Dashboard
  - Manage Orders
  - Manage Products
  - Manage Inventory
  - Manage Delivery Boys
  - System Settings

#### Delivery Boy
- **Limited Access Badge**
- Order delivery and tracking
- Permissions:
  - View Pending Orders
  - Mark Order Complete
  - View Customer Details
  - Call Customer

Each role is displayed in an expandable card showing:
- Role name and description
- Badge indicating access level
- "Current" indicator for the user's role
- Complete list of permissions

---

## 4. Danger Zone

### Delete Your Account

Permanently delete your account with one click:

1. Click **"Delete Account"** button
2. Review warning message
3. Confirm deletion
4. Account is immediately deleted

**Warning:**
- Action is **irreversible**
- All your data will be **permanently removed**
- Cannot recover the account

### Sign Out

- Securely sign out from all sessions
- Clears local session data
- Redirects to login page

---

## Account Deletion Flow

### On Client (Frontend)

1. User clicks "Delete Account" button
2. Confirmation modal appears
3. User confirms deletion
4. Settings page calls `AccountService.deleteAccount()`
5. Service fetches current user session
6. Calls Edge Function with Bearer token

### On Server (Edge Function)

1. Edge Function receives request
2. Verifies user's Bearer token
3. Validates user identity
4. Deletes user's profile record
5. Deletes user account from auth
6. Returns success response

### After Deletion

1. User is automatically signed out
2. Local session cleared
3. Redirected to login page
4. User cannot login with deleted credentials

---

## Services

### AccountService (`src/services/account.service.ts`)

Handles account-related operations:

```typescript
import { AccountService } from '../../services/account.service';

// Delete current user's account
await AccountService.deleteAccount();
```

### Edge Function (`supabase/functions/delete-account/`)

Secure server-side account deletion:
- Verifies user authentication
- Deletes profile data
- Deletes auth user
- Returns status

---

## Security Considerations

### Authentication
- Requires valid Bearer token
- Only users can delete their own account
- Token verified on server side

### Data Cleanup
- User profile deleted first
- Then auth user deleted
- Complete data removal

### Error Handling
- Invalid token returns 401
- Deletion errors return 500
- Clear error messages to user

---

## Database Changes

### Tables Affected

1. **profiles** table
   - User profile record deleted
   - Cascades to related records (if configured)

2. **auth.users** table
   - User account completely removed
   - Cannot be recovered

---

## User Experience

### Settings Page Layout

```
┌─────────────────────────────────────────────┐
│ System Settings                             │
│ Configure your grocery platform preferences │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Profile Card                                │
│ [Avatar] Name                     Edit →     │
│          Email                              │
│          Role Badge                         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Store Configuration                         │
│ ├─ Store Details              →             │
│ ├─ WhatsApp Setup             →             │
│ └─ App Appearance             →             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Security & Roles                            │
│ ├─ Your Role & Permissions                  │
│ │  [Current Role Details]                   │
│ │  [List of Permissions]                    │
│ └─ System Roles                             │
│    [Admin Role Card] (Current)              │
│    [Delivery Boy Role Card]                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Danger Zone                                 │
│ ├─ Delete Your Account      [Delete] →      │
│ └─ Sign Out                 [Sign Out] →    │
└─────────────────────────────────────────────┘
```

---

## Testing Account Deletion

### Local Testing

1. Create test user account
2. Login with test account
3. Go to Settings page
4. Click "Delete Account"
5. Confirm deletion
6. Verify:
   - User is redirected to login
   - Cannot login with deleted email
   - Profile deleted from database
   - Auth user removed

### Production Testing

1. Test with staging environment
2. Verify Edge Function is deployed
3. Test with production credentials
4. Monitor error logs

---

## Future Enhancements

- [ ] Edit profile information
- [ ] Change password
- [ ] Two-factor authentication
- [ ] Activity log
- [ ] Session management
- [ ] Account recovery options
- [ ] Export user data
- [ ] Archive account (soft delete)

---

## Troubleshooting

### Issue: Account deletion fails
**Solution:** 
- Check Edge Function is deployed: `supabase functions list`
- Verify user has valid session
- Check Supabase logs

### Issue: Confirmation modal doesn't appear
**Solution:**
- Verify Motion library is imported
- Check browser console for errors
- Ensure modal element is in DOM

### Issue: User not redirected to login
**Solution:**
- Check signOut() function
- Verify navigation hook working
- Check browser history

### Issue: Profile not deleted
**Solution:**
- Verify RLS policies
- Check Edge Function logs
- Ensure SERVICE_ROLE_KEY is set

---

## File References

- **Component:** `src/pages/admin/Settings.tsx`
- **Service:** `src/services/account.service.ts`
- **Edge Function:** `supabase/functions/delete-account/`
- **Documentation:** This file

---

## Related Topics

- [Security & Authentication](./SECURITY.md) (future)
- [User Management](./USER_MANAGEMENT.md) (future)
- [Edge Functions Guide](./DENO_SETUP.md)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)
