# Deploy AutoControl

This project should be deployed as three connected parts:

```text
Vercel Web App -> Render Backend -> Supabase PostgreSQL
Android APK    -> Render Backend -> Supabase PostgreSQL
```

## 1. Supabase

1. Open Supabase.
2. Open your project.
3. Copy the PostgreSQL JDBC connection details.
4. Keep the password private.

You will need:

```env
DATABASE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
DATABASE_USERNAME=YOUR_SUPABASE_USERNAME
DATABASE_PASSWORD=YOUR_SUPABASE_PASSWORD
```

## 2. Backend on Render

1. Push this repository to GitHub.
2. Open Render.
3. Create a new Web Service.
4. Connect the GitHub repository.
5. Render can use `render.yaml`.
6. Add these environment variables in Render:

```env
DATABASE_URL=jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require
DATABASE_USERNAME=YOUR_SUPABASE_USERNAME
DATABASE_PASSWORD=YOUR_SUPABASE_PASSWORD
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://YOUR_VERCEL_SITE.vercel.app
```

7. Deploy.
8. Check:

```text
https://YOUR_RENDER_BACKEND.onrender.com/api/health
```

## 3. Web on Vercel

1. Open Vercel.
2. Add a new project.
3. Connect the same GitHub repository.
4. Framework: Vite.
5. Add environment variable:

```env
VITE_API_BASE_URL=https://YOUR_RENDER_BACKEND.onrender.com/api
```

6. Deploy.
7. Copy the Vercel URL.
8. Go back to Render and update:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://YOUR_VERCEL_SITE.vercel.app
```

9. Redeploy backend.

## 4. APK with Expo EAS

1. Create an Expo account.
2. Login locally:

```powershell
cd mobile
npm install
npx eas login
```

3. Open `mobile/eas.json`.
4. Replace:

```text
https://YOUR_RENDER_BACKEND_URL
```

with your real backend URL:

```text
https://YOUR_RENDER_BACKEND.onrender.com
```

5. Build APK:

```powershell
npx eas build -p android --profile preview
```

6. Expo will provide an APK download link.

## 5. Quick Check

1. Open the Vercel site.
2. Add a driver.
3. Open:

```text
https://YOUR_RENDER_BACKEND.onrender.com/api/drivers
```

If the driver appears there, the chain works:

```text
Vercel -> Render -> Supabase
```

4. Install the APK.
5. Add or view data from the phone.
6. Confirm the same data appears on the web.
