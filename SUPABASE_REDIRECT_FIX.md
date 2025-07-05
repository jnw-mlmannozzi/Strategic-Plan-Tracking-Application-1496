# Fix Supabase Redirect URLs

## Update your Supabase Dashboard Settings:

### 1. Site URL (keep as is):
```
https://legendary-granita-37f4f2.netlify.app
```

### 2. Redirect URLs (replace with these):
```
https://legendary-granita-37f4f2.netlify.app/confirm
https://legendary-granita-37f4f2.netlify.app/confirm/**
```

## Why this fixes the issue:

1. **Specific Route**: By using `/confirm` instead of root, Supabase will redirect directly to your confirmation page
2. **Wildcard Pattern**: The `/**` ensures all confirmation parameters are preserved
3. **Direct Handling**: Your `EmailConfirmation` component will handle the confirmation directly

## Testing Steps:
1. Update the redirect URLs in Supabase
2. Sign up with a new email
3. Check email and click confirmation link
4. Should redirect to: `https://legendary-granita-37f4f2.netlify.app/confirm?[confirmation-params]`
5. Your `EmailConfirmation` component will process the confirmation

## Alternative: Keep Root Route (if you prefer)
If you want to keep the root route handling, update your `App.jsx` to better handle the confirmation parameters that come from Supabase redirects.