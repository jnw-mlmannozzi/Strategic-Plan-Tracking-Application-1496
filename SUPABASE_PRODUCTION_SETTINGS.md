# Supabase Production Settings

## Update these settings in your Supabase Dashboard:

### 1. Site URL
```
https://legendary-granita-37f4f2.netlify.app
```

### 2. Redirect URLs (Add all of these)
```
https://legendary-granita-37f4f2.netlify.app
https://legendary-granita-37f4f2.netlify.app/confirm
https://legendary-granita-37f4f2.netlify.app/confirm/**
http://localhost:5173
http://localhost:5173/confirm
```

### 3. Why include both?
- **Production URLs** - For testing on the deployed site
- **Local URLs** - For development work

## Testing Steps:
1. Go to https://legendary-granita-37f4f2.netlify.app
2. Click "Sign Up"
3. Fill out the form
4. Check your email for the confirmation link
5. Click the link - it should redirect to the deployed site
6. Complete the confirmation process

## Note:
The preview window in development tools may not handle email confirmations properly due to domain restrictions and SSL requirements.