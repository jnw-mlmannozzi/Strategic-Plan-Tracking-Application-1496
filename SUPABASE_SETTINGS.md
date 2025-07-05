# Fix Supabase Email Confirmation Settings

## 1. Update Site URL in Supabase Dashboard

Go to your Supabase project → Authentication → URL Configuration:

**Site URL:** `http://localhost:5173`

## 2. Update Redirect URLs

**Redirect URLs:** Add these URLs (one per line):
```
http://localhost:5173/confirm
http://localhost:5173/confirm/**
http://localhost:5173
```

## 3. Alternative: Update Your App to Handle Root Route

If you prefer to keep the redirect at the root, update your App.jsx to handle confirmation at the root route.