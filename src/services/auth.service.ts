import { auth } from '../config/firebase.config';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { logger } from '../utils/logger';
import { DEFAULT_PERMISSIONS } from '../models/permission.model';
import { UserRepository } from '../repositories/user.repository';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Create both Firebase Auth user and PostgreSQL record
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

      // Create PostgreSQL record
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
      const modulePermissions = userData.modulePermissions || this.getDefaultPermissions(userData.role);

      // Create user in PostgreSQL
      const user = await this.userRepository.createWithFirebaseUid({
        firebaseUid: uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        modulePermissions,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        employeeId: userData.employeeId,
        plant: userData.plant,
        department: userData.department,
        designation: userData.designation,
        contactNo: userData.contactNo,
      });

      return user;
    } catch (error: any) {
      logger.error('Error creating user:', error);
      // If PostgreSQL insert fails, try to clean up Firebase Auth user
      try {
        await auth.deleteUser(uid);
      } catch (deleteError) {
        logger.error('Failed to clean up Firebase Auth user after PostgreSQL error:', deleteError);
      }
      throw new Error('Failed to create user');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      // First try to find by PostgreSQL ID
      let user = await this.userRepository.findById(userId);

      // If not found, try to find by Firebase UID (for backward compatibility)
      if (!user) {
        user = await this.userRepository.findByFirebaseUid(userId);
      }

      return user;
    } catch (error: any) {
      logger.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error: any) {
      logger.error('Error getting user by email:', error);
      throw new Error('Failed to get user by email');
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    try {
      return await this.userRepository.findByFirebaseUid(firebaseUid);
    } catch (error: any) {
      logger.error('Error getting user by Firebase UID:', error);
      throw new Error('Failed to get user by Firebase UID');
    }
  }

  async updateUser(userId: string, userData: UpdateUserDto): Promise<User> {
    try {
      const updateData: Partial<User> = { ...userData };

      // If role is updated, update permissions
      if (userData.role) {
        updateData.modulePermissions = this.getDefaultPermissions(userData.role);
      }

      const updatedUser = await this.userRepository.update(userId, updateData);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return updatedUser;
    } catch (error: any) {
      logger.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Try to get user by ID first, then by Firebase UID
      let user = await this.userRepository.findById(userId);
      let firebaseUid: string | null = null;

      if (user) {
        // If found by ID, we need to get the Firebase UID from the database
        const userRow = await this.userRepository.query(
          `SELECT firebase_uid FROM users WHERE id = $1`,
          [userId]
        );
        firebaseUid = userRow.rows[0]?.firebase_uid || null;
      } else {
        // Try by Firebase UID
        user = await this.userRepository.findByFirebaseUid(userId);
        firebaseUid = userId; // userId is the Firebase UID in this case
      }

      if (!user) {
        throw new Error('User not found');
      }

      // Delete from PostgreSQL (use the PostgreSQL ID)
      await this.userRepository.delete(user.id);

      // Delete from Firebase Auth
      if (firebaseUid) {
        try {
          await auth.deleteUser(firebaseUid);
        } catch (authError) {
          logger.warn('Failed to delete Firebase Auth user, continuing:', authError);
        }
      }
    } catch (error: any) {
      logger.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  async getAllUsers(limit: number = 50, offset: number = 0): Promise<{ users: User[]; total: number }> {
    try {
      const users = await this.userRepository.findAll({}, limit, offset);
      const total = await this.userRepository.count();

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
