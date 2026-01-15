import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
  login: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  logout: async () => {
    await signOut(auth);
  },

  sendPasswordResetEmail: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: false,
      });
      // Success - email sent (Firebase sends email even if user doesn't exist for security)
    } catch (error: any) {
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address. Please check the email format.');
      } else if (error.code === 'auth/user-not-found') {
        // For security, Firebase doesn't reveal if user exists
        // But we should still show success to prevent email enumeration
        // However, Firebase won't actually send the email in this case
        console.warn('Password reset requested for non-existent user:', email);
        // Still return success to prevent email enumeration attacks
        return;
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many password reset requests. Please try again later.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      // Log other errors for debugging
      console.error('Password reset error:', error.code, error.message);
      throw new Error(error.message || 'Failed to send password reset email. Please try again.');
    }
  },

  confirmPasswordReset: async (code: string, newPassword: string) => {
    await confirmPasswordReset(auth, code, newPassword);
  },

  getCurrentUser: (): Promise<User | null> => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
};
