# AutoControl

AutoControl is a full-stack transport maintenance tracking system.

It tracks vehicles, drivers, technical inspections, active vehicle problems, reminders, and inspection history.

## Architecture

```text
Vercel Web App
        \
         -> Render Spring Boot API -> Supabase PostgreSQL
        /
Android APK
```

React and the Android app never connect to Supabase directly. All data goes through the Java backend.

## Stack

- Web: React + Vite + React Router + plain CSS
- Mobile: Expo React Native
- Backend: Java 21 + Spring Boot + Spring Web + Spring Data JPA
- Database: Supabase PostgreSQL

## Project Structure

```text
src/        web frontend
mobile/     Expo mobile app
backend/    Spring Boot backend
render.yaml Render deploy config
vercel.json Vercel deploy config
```

## Local Backend

Create environment variables locally:

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-26.0.1"
$env:Path="$env:JAVA_HOME\bin;$env:Path"

$env:DATABASE_URL="jdbc:postgresql://YOUR_SUPABASE_HOST:5432/postgres?sslmode=require"
$env:DATABASE_USERNAME="YOUR_SUPABASE_USERNAME"
$env:DATABASE_PASSWORD="YOUR_SUPABASE_PASSWORD"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

cd backend
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

## Local Web

Create `.env.local` in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Run:

```powershell
npm install
npm run dev
```

Web runs on:

```text
http://localhost:5173
```

## Local Mobile

For a real phone, do not use `localhost`. Use your computer IP address in the same Wi-Fi network.

Create `mobile/.env.local`:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IP:8080
```

Run:

```powershell
cd mobile
npm install
npm start
```

Open Expo Go and scan the QR code.

## Main API

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/transports`
- `GET /api/transports/{id}`
- `POST /api/transports`
- `PUT /api/transports/{id}`
- `DELETE /api/transports/{id}`
- `GET /api/drivers`
- `POST /api/drivers`
- `PUT /api/drivers/{id}`
- `DELETE /api/drivers/{id}`
- `GET /api/inspections`
- `POST /api/inspections`
- `GET /api/transports/{id}/inspections`
- `POST /api/problems`
- `GET /api/problems/active`
- `GET /api/transports/{id}/problems`
- `PUT /api/problems/{id}/resolve`
- `GET /api/reminders`
- `POST /api/reminders`
- `GET /api/reminders/due`
- `PUT /api/reminders/{id}/sent`

## Secrets

Do not commit real `.env`, `.env.local`, Supabase passwords, API keys, or tokens.

Only commit `.env.example` files with placeholders.
