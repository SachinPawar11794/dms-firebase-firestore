# DMS Frontend Application

Modern React + TypeScript frontend for the DMS Firebase Firestore application.

## Features

- 🔐 Firebase Authentication
- 📋 Task Management
- 🏭 Production Management
- 👥 Human Resource Management
- 🔧 Maintenance Management
- 🎨 Modern UI/UX
- ⚡ Fast and Responsive

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the `frontend` directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── config/         # Configuration files
│   └── App.tsx         # Main app component
```

## Technologies

- React 18
- TypeScript
- Vite
- React Router
- React Query
- Firebase SDK
- Axios
