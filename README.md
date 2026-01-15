# DMS Firebase Firestore Application

A scalable, multi-module enterprise application built with Google Cloud Firebase and Firestore.

## Features

- 🔐 **Authentication & Authorization**: Firebase Authentication with role-based access control
- 📋 **Employee Task Manager**: Task assignment, tracking, and management
- 🏭 **Production Management System (PMS)**: Production planning, order management, and quality control
- 👥 **Human Resource**: Employee management, attendance tracking, and HR operations
- 🔧 **Maintenance**: Equipment tracking, maintenance requests, and scheduling
- 🔒 **Permission System**: Module-specific permissions for fine-grained access control

## Documentation

- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture documentation (**⚠️ Read Frontend Module Isolation section before creating new modules**)
- 🎯 [TASKS_MODULE_ARCHITECTURE.md](./TASKS_MODULE_ARCHITECTURE.md) - Tasks module architecture example (reference for all modules)
- 🚀 [QUICK_START.md](./QUICK_START.md) - Get started in minutes
- 📋 [SETUP.md](./SETUP.md) - Complete setup and installation guide
- 🔥 [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md) - Complete Firestore setup guide
- 📊 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Project overview and features
- 📚 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API documentation
- 🎨 [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) - Frontend integration guide
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- 👥 [USER_MANAGEMENT_BEST_PRACTICES.md](./USER_MANAGEMENT_BEST_PRACTICES.md) - **User management best practices**
- 📝 [QUICK_USER_GUIDE.md](./QUICK_USER_GUIDE.md) - Quick user management reference
- 🔌 [API_COLLECTION.json](./API_COLLECTION.json) - Postman collection for API testing

## Prerequisites

- Node.js (v18 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore enabled
- Service account key for Firebase Admin SDK

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your Firebase credentials:
   ```bash
   cp .env.example .env
   ```

4. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```

5. Build the project:
   ```bash
   npm run build
   ```

## Development

Run the development server:
```bash
npm run dev
```

## Deployment

Deploy Firestore security rules:
```bash
npm run deploy:rules
```

Deploy Firebase Functions:
```bash
npm run deploy:functions
```

## Project Structure

```
src/
├── config/          # Firebase configuration
├── models/          # Data models
├── services/        # Business logic
├── modules/         # Feature modules
├── middleware/      # Express middleware
└── utils/           # Utility functions
```

## Quick Commands

```bash
# Install dependencies
npm install

# Verify setup
npm run verify-setup

# Create admin user (Firestore document)
npm run create-firestore-user <uid> <email> "<displayName>"

# Test API endpoints
npm run test-api <email> <password>

# Start development server
npm run dev

# Deploy Firestore rules
npm run deploy:rules
```

## API Testing

Import `API_COLLECTION.json` into Postman or similar tools for ready-to-use API requests.

## License

ISC
