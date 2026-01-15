import { auth, db } from '../config/firebase.config';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import { DEFAULT_PERMISSIONS } from '../models/permission.model';

export class AuthService {
  /**
   * Create both Firebase Auth user and Firestore document
   */
  async createUserWithAuth(userData: CreateUserDto & { password: string }): Promise<User> {
    try {
      // Validate required fields
      if (!userData.email || !userData.password || !userData.displayName) {
        throw new Error('Email, password, and display name are required');
      }

      // Create Firebase Auth user first
      const userRecord = await auth.createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: false, // User can verify later
      });

      logger.info(`Firebase Auth user created: ${userRecord.uid}`);

      // Create Firestore document
      const user = await this.createUser(userData, userRecord.uid);
      return user;
    } catch (error: any) {
      logger.error('Error creating user with auth:', {
        error: error.message,
        code: error.code,
        codePrefix: error.codePrefix,
        stack: error.stack,
        userData: { ...userData, password: '***' }, // Log without password
      });
      
      // Handle specific error codes
      if (error.code === 'auth/email-already-exists') {
        throw new Error('User with this email already exists in Firebase Authentication');
      }
      
      if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format');
      }
      
      if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use a stronger password (at least 8 characters)');
      }
      
      if (error.code === 'auth/internal-error' || error.codePrefix === 'auth') {
        // Check if it's a permission error
        if (error.message?.includes('PERMISSION_DENIED') || 
            error.message?.includes('serviceusage') ||
            error.message?.includes('Service Usage')) {
          throw new Error('Service account lacks permissions. Please grant "Service Usage Consumer" and "Firebase Admin SDK Administrator Service Agent" roles to your service account in Google Cloud Console. See USER_MANAGEMENT.md for manual creation steps.');
        }
      }
      
      // Re-throw with original message if it's already a formatted error
      if (error.message && error.message.includes('Service account lacks permissions')) {
        throw error;
      }
      
      throw new Error(`Failed to create user: ${error.message || error.code || 'Unknown error'}`);
    }
  }

  async createUser(userData: CreateUserDto, uid: string): Promise<User> {
    try {
      const now = Timestamp.now();
      const modulePermissions = userData.modulePermissions || this.getDefaultPermissions(userData.role);

      // Build user object, only including defined fields (Firestore doesn't allow undefined)
      const user: any = {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        modulePermissions,
        createdAt: now,
        updatedAt: now,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      };

      // Only add optional fields if they are defined (not undefined or empty string)
      if (userData.employeeId) {
        user.employeeId = userData.employeeId;
      }
      if (userData.plant) {
        user.plant = userData.plant;
      }
      if (userData.department) {
        user.department = userData.department;
      }
      if (userData.designation) {
        user.designation = userData.designation;
      }
      if (userData.contactNo) {
        user.contactNo = userData.contactNo;
      }

      await db.collection('users').doc(uid).set(user);

      return {
        id: uid,
        ...user,
      };
    } catch (error: any) {
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return null;
      }

      return {
        id: userDoc.id,
        ...(userDoc.data() as Omit<User, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const usersSnapshot = await db
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        return null;
      }

      const userDoc = usersSnapshot.docs[0];
      return {
        id: userDoc.id,
        ...(userDoc.data() as Omit<User, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting user by email:', error);
      throw new Error('Failed to get user by email');
    }
  }

  async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    try {
      const updateData: any = {
        ...userData,
        updatedAt: Timestamp.now(),
      };

      // If role is updated, update permissions
      if (userData.role) {
        updateData.modulePermissions = this.getDefaultPermissions(userData.role);
      }

      // Remove undefined fields to avoid overwriting with undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await db.collection('users').doc(userId).update(updateData);

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error: any) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await db.collection('users').doc(userId).delete();
      await auth.deleteUser(userId);
    } catch (error: any) {
      logger.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<{ users: User[]; total: number }> {
    try {
      const usersSnapshot = await db
        .collection('users')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();

      const totalSnapshot = await db.collection('users').count().get();
      const total = totalSnapshot.data().count;

      const users: User[] = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>),
      }));

      return { users, total };
    } catch (error: any) {
      logger.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }

  private getDefaultPermissions(role: string): Record<string, string[]> {
    const permissions = DEFAULT_PERMISSIONS[role] || [];
    return {
      employeeTaskManager: permissions,
      pms: permissions,
      humanResource: permissions,
      maintenance: permissions,
    };
  }
}

export const authService = new AuthService();
