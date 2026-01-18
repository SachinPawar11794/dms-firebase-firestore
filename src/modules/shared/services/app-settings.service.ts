import { storage } from '../../../config/firebase.config';
import { AppSettings, UpdateAppSettingsDto } from '../models/app-settings.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';
import { AppSettingsRepository } from '../../../repositories/app-settings.repository';

const SETTINGS_KEY = 'app_branding'; // Key for app settings in database

export class AppSettingsService {
  private appSettingsRepository: AppSettingsRepository;

  constructor() {
    this.appSettingsRepository = new AppSettingsRepository();
  }

  async getAppSettings(): Promise<AppSettings | null> {
    try {
      const settings = await this.appSettingsRepository.findByKey(SETTINGS_KEY);

      if (!settings) {
        // Return default settings if not found
        return null;
      }

      // Parse the JSONB value (repository returns AppSettings with value property)
      const settingsData = settings as any;
      const value = typeof settingsData.value === 'string' ? JSON.parse(settingsData.value) : (settingsData.value || {});
      
      // Map to AppSettings interface
      return {
        id: settings.id,
        companyLogoUrl: value.logoUrl || null,
        companyName: value.companyName || null,
        appNameShort: value.appNameShort || value.appName || 'DMS',
        appNameLong: value.appNameLong || null,
        createdAt: Timestamp.fromDate(new Date(settings.updatedAt.toDate().getTime() - 86400000)), // Approximate
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy || '',
      };
    } catch (error: any) {
      logger.error('Error getting app settings:', error);
      throw new Error('Failed to get app settings');
    }
  }

  async updateAppSettings(settingsData: UpdateAppSettingsDto, updatedBy: string): Promise<AppSettings> {
    try {
      // Get existing settings
      const existing = await this.appSettingsRepository.findByKey(SETTINGS_KEY);
      
      // Build value object
      const existingData = existing as any;
      const currentValue = existing && typeof existingData.value === 'string' 
        ? JSON.parse(existingData.value) 
        : (existingData?.value || {});
      
      const newValue: any = { ...currentValue };
      
      // Update only provided fields
      if (settingsData.companyLogoUrl !== undefined) {
        newValue.logoUrl = settingsData.companyLogoUrl;
      }
      if (settingsData.companyName !== undefined) {
        newValue.companyName = settingsData.companyName || null;
      }
      if (settingsData.appNameShort !== undefined) {
        newValue.appNameShort = settingsData.appNameShort || null;
        newValue.appName = settingsData.appNameShort || 'DMS'; // Keep appName for backward compatibility
      }
      if (settingsData.appNameLong !== undefined) {
        newValue.appNameLong = settingsData.appNameLong || null;
      }

      // Upsert settings
      await this.appSettingsRepository.upsertByKey(
        SETTINGS_KEY,
        newValue,
        'Application branding settings',
        updatedBy
      );

      const updatedSettings = await this.getAppSettings();
      if (!updatedSettings) {
        throw new Error('Failed to retrieve updated settings');
      }

      return updatedSettings;
    } catch (error: any) {
      logger.error('Error updating app settings:', error);
      throw error;
    }
  }

  async uploadLogo(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      // Validate file buffer
      if (!file.buffer) {
        throw new Error('File buffer is missing');
      }

      // Get storage bucket - use explicit bucket name if available
      // Firebase Storage bucket name format: project-id.appspot.com or project-id.firebasestorage.app
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET || process.env.STORAGE_BUCKET;
      let bucket;
      
      if (bucketName) {
        bucket = storage.bucket(bucketName);
        logger.info('Using explicit bucket name:', bucketName);
      } else {
        bucket = storage.bucket();
        logger.info('Using default bucket:', bucket.name);
      }
      
      // Verify bucket exists and is accessible
      try {
        const [exists] = await bucket.exists();
        if (!exists) {
          throw new Error(`Storage bucket does not exist: ${bucket.name}`);
        }
      } catch (checkError: any) {
        logger.warn('Could not verify bucket existence, continuing anyway:', checkError.message);
      }
      
      // Sanitize filename to remove special characters
      const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `logos/company-logo-${Date.now()}-${sanitizedFileName}`;
      const fileUpload = bucket.file(fileName);

      logger.info('Uploading logo to Firebase Storage:', {
        fileName,
        size: file.buffer.length,
        contentType: file.mimetype,
        bucket: bucket.name,
      });

      // Upload file to Firebase Storage
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      logger.info('File uploaded successfully, making public...');

      // Make file publicly accessible
      await fileUpload.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      logger.info('Logo uploaded successfully:', { publicUrl });

      // Update app settings with new logo URL
      await this.updateAppSettings({ companyLogoUrl: publicUrl }, userId);

      return publicUrl;
    } catch (error: any) {
      logger.error('Error uploading logo:', {
        error: error.message,
        code: error.code,
        stack: error.stack,
        fileName: file?.originalname,
        fileSize: file?.buffer?.length,
      });
      
      // Provide more specific error messages
      if (error.code === 'ENOENT' || error.message?.includes('bucket')) {
        throw new Error('Firebase Storage bucket not configured. Please check your Firebase Storage settings.');
      }
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        throw new Error('Permission denied. Please check Firebase Storage permissions.');
      }
      
      throw new Error(`Failed to upload logo: ${error.message || 'Unknown error'}`);
    }
  }

  async deleteLogo(userId: string): Promise<void> {
    try {
      const settings = await this.getAppSettings();
      
      if (!settings || !settings.companyLogoUrl) {
        throw new Error('No logo to delete');
      }

      // Extract file path from URL
      const url = settings.companyLogoUrl;
      const bucket = storage.bucket();
      
      // Extract file name from URL
      const urlParts = url.split('/');
      const fileName = urlParts.slice(urlParts.indexOf('logos')).join('/');
      
      // Delete file from Storage
      try {
        const file = bucket.file(fileName);
        await file.delete();
      } catch (error: any) {
        // If file doesn't exist, continue (might have been deleted manually)
        logger.warn('Logo file not found in storage:', error);
      }

      // Update settings to remove logo URL
      await this.updateAppSettings({ companyLogoUrl: null }, userId);
    } catch (error: any) {
      logger.error('Error deleting logo:', error);
      throw error;
    }
  }
}

export const appSettingsService = new AppSettingsService();
