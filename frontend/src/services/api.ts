import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token for public routes (login, forgot password, reset password)
    const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some(route => 
      window.location.pathname.includes(route)
    );
    
    if (!isPublicRoute) {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        // Silently fail if token can't be retrieved (user might not be logged in)
        // Don't block the request
        console.debug('Could not get auth token:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log 404/401 errors if user is not authenticated (expected behavior)
    const isUnauthenticated = !auth.currentUser;
    const is404 = error.response?.status === 404;
    const is401 = error.response?.status === 401;
    
    // Suppress console errors for 404/401 when user is not authenticated
    if ((is404 || is401) && isUnauthenticated) {
      // Silently handle 404s/401s when user is not logged in
      // This prevents console spam during initial page load
      return Promise.reject(error);
    }
    
    // Only redirect to login on 401 if user was authenticated (session expired)
    if (is401 && auth.currentUser) {
      // Session expired - redirect to login
      auth.signOut();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle Firestore index errors - redirect to Firebase Console
    if (error.response?.data?.error?.code === 'INDEX_REQUIRED') {
      const indexUrl = error.response.data.error.details?.indexUrl;
      if (indexUrl) {
        // Open Firebase Console in new tab to show index status
        window.open(indexUrl, '_blank');
        alert(
          '⚠️ Firestore Index Required\n\n' +
          'A Firestore composite index is required for this query.\n\n' +
          'A new tab has been opened to the Firebase Console where you can:\n' +
          '1. View the index creation link\n' +
          '2. Click "Create Index" to build the index\n' +
          '3. Wait 2-5 minutes for the index to build\n' +
          '4. Refresh this page once the index is ready\n\n' +
          'The index will be automatically created when you click the link.'
        );
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
