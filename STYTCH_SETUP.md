# Stytch Authentication Setup Guide

This guide will help you set up Stytch authentication for your Nexbit application.

## Prerequisites

1. A Stytch account (sign up at https://stytch.com/)
2. An organization created in Stytch Dashboard

## Step 1: Get Your Stytch Credentials

1. Log in to your [Stytch Dashboard](https://stytch.com/dashboard)
2. Navigate to **API Keys** section
3. Copy your **Public Token** (starts with `public-token-`)
4. Navigate to **Organizations** section
5. Copy your **Organization ID** (starts with `org-`)
6. (Optional) Navigate to **Webhooks** section and copy your **Webhook Secret** if you plan to use webhooks

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist) and add:

```bash
# Stytch Public Token (from API Keys)
# Required: Get this from Stytch Dashboard > API Keys
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=public-token-test-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stytch Project Environment (test or live)
# Optional: Defaults to test if not specified
NEXT_PUBLIC_STYTCH_PROJECT_ENV=test

# Organization ID (from Organizations)
# Optional: Used as fallback if not found in member's organization
NEXT_PUBLIC_STYTCH_ORG_ID=org-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook Secret (optional, from Webhooks)
# Used to verify webhook requests from Stytch
NEXT_PUBLIC_STYTCH_WEBHOOK_SECRET=webhook-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- The `.env.local` file is gitignored and should NOT be committed
- Restart your development server after adding/modifying environment variables
- Use `.env.example` as a template (this file can be committed)

**Important:** Replace the placeholder values with your actual Stytch credentials.

## Step 3: Configure Stytch Dashboard Settings

### Enable Frontend SDKs
1. Go to Stytch Dashboard > **Settings** > **Frontend SDKs**
2. Enable frontend SDKs in **Test** environment
3. Add your domain to **Authorized applications**:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

### Enable Organization Creation (Optional)
1. Go to Stytch Dashboard > **Settings** > **Enabled methods**
2. Enable the **Create organizations** toggle
3. This allows users to create new Organizations directly from the SDK

### Enable Passwords Authentication
**Important**: To show email + password fields and reset/signup links, you must enable passwords:

1. Go to Stytch Dashboard > **Passwords** (or **Settings** > **Passwords**)
2. Enable **Passwords** as an authentication method
3. (Optional) Enable **Cross-Organization Passwords** if you want users to use the same password across organizations
   - **Note**: Cross-Org Passwords can only be enabled if no existing members have passwords set
4. Configure password strength requirements if needed

### Configure Magic Links Redirect URLs
1. Go to Stytch Dashboard > **Magic Links**
2. Add redirect URLs:
   - Default: `http://localhost:3000/authenticate`
   - Production: `https://yourdomain.com/authenticate`
3. The `/authenticate` page will automatically authenticate the magic link token

### Configure Password Redirect URLs
1. Go to Stytch Dashboard > **Passwords**
2. Add redirect URLs:
   - **Login redirect URL**: `http://localhost:3000/dashboard` (for development)
   - **Reset password redirect URL**: `http://localhost:3000/authenticate` (for development)
   - Update these for production: `https://yourdomain.com/dashboard` and `https://yourdomain.com/authenticate`

### Configure OAuth Providers (Optional)
To enable Google OAuth:

1. Go to Stytch Dashboard > **OAuth**
2. Enable Google OAuth
3. Configure your Google OAuth credentials
4. Add authorized redirect URLs:
   - `http://localhost:3000/authenticate` (for development)
   - `https://yourdomain.com/authenticate` (for production)

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. The Stytch B2B Discovery flow will be displayed
4. Try logging in with:
   - **Email + Password**: Enter your email and password (if passwords are enabled)
   - **Email Magic Link**: Enter your email and check your inbox (alternative method)
   - **Signup**: If self-registration is enabled, you'll see a signup link
   - **Reset Password**: If passwords are enabled, you'll see a "Forgot password?" link
   - After authentication, you'll be redirected to `/dashboard`

5. **Important**: 
   - Make sure `/authenticate` redirect URL is configured in your Stytch Dashboard
   - Make sure passwords are enabled in Dashboard > Passwords to see password fields
   - Make sure "Create organizations" is enabled to see signup links

## Step 6: Protect Your Routes

Routes are automatically protected using the `ProtectedRoute` component. To protect additional pages:

```tsx
import { ProtectedRoute } from "../components/ProtectedRoute";

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* Your page content */}
    </ProtectedRoute>
  );
}
```

## Step 7: Access User Information

Use the `useAuth` hook to access user information:

```tsx
import { useAuth } from "../contexts/AuthContext";

export default function MyComponent() {
  const { user, isAuthenticated, organizationId } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Organization: {user?.organizationName}</p>
      <p>Organization ID: {organizationId}</p>
    </div>
  );
}
```

## Step 8: Logout

Users can logout via the sidebar profile dropdown, or programmatically:

```tsx
import { useStytch } from "@stytch/nextjs";
import { useRouter } from "next/navigation";

const stytch = useStytch();
const router = useRouter();

const handleLogout = async () => {
  await stytch.session.revoke();
  router.push("/login");
};
```

## Troubleshooting

### "Stytch is not configured" error
- Make sure `.env.local` exists and contains `NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN`
- Restart your development server after adding environment variables
- Check that the token starts with `public-token-`

### Magic link not received
- Check your spam folder
- Verify email is correct
- Check Stytch Dashboard > Magic Links for email delivery status

### OAuth not working
- Verify OAuth is enabled in Stytch Dashboard
- Check redirect URLs are correctly configured
- Ensure Google OAuth credentials are set up correctly

### User not redirected after login
- Check redirect URLs in Stytch Dashboard match your application URLs
- Verify the session is being created (check browser console)

### Only seeing email field, no password field
- **Enable Passwords** in Stytch Dashboard > Passwords
- Make sure `B2BProducts.passwords` is included in the `products` array in your config
- Check that Cross-Org Passwords can be enabled (no existing members with passwords)

### Not seeing reset password or signup links
- **Reset password link**: Enable Passwords in Dashboard and configure reset password redirect URL
- **Signup link**: Enable "Create organizations" in Dashboard > Settings > Enabled methods
- Make sure redirect URLs are properly configured in Dashboard

## Additional Resources

- [Stytch Documentation](https://stytch.com/docs)
- [Stytch Next.js SDK](https://stytch.com/docs/nextjs)
- [Stytch B2B Authentication](https://stytch.com/docs/b2b)

## Support

If you encounter issues:
1. Check the [Stytch Status Page](https://status.stytch.com/)
2. Review [Stytch Documentation](https://stytch.com/docs)
3. Contact Stytch Support through your dashboard
