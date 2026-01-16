import { db, storage } from '../../../config/firebase.config';
import { AppSettings, UpdateAppSettingsDto } from '../models/app-settings.model';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '../../../utils/logger';

const SETTINGS_DOC_ID = 'app-settings'; // Single document for app settings

export class AppSettingsService {
  async getAppSettings(): Promise<AppSettings | null> {
    try {
      const settingsDoc = await db.collection('appSettings').doc(SETTINGS_DOC_ID).get();

      if (!settingsDoc.exists) {
        // Return default settings if document doesn't exist
        return null;
      }

      return {
        id: settingsDoc.id,
        ...(settingsDoc.data() as Omit<AppSettings, 'id'>),
      };
    } catch (error: any) {
      logger.error('Error getting app settings:', error);
      throw new Error('Failed to get app settings');
    }
  }

  async updateAppSettings(settingsData: UpdateAppSettingsDto, updatedBy: string): Promise<AppSettings> {
    try {
      const settingsRef = db.collection('appSettings').doc(SETTINGS_DOC_ID);
      const settingsDoc = await settingsRef.get();

      const now = Timestamp.now();

      if (!settingsDoc.exists) {
        // Create new settings document
        const newSettings: Omit<AppSettings, 'id'> = {
          ...settingsData,
          createdAt: now,
          updatedAt: now,
          updatedBy,
        };

        await settingsRef.set(newSettings);

        return {
          id: SETTINGS_DOC_ID,
          ...newSettings,
        };
      } else {
        // Update existing settings
        const fieldsToUpdate: any = {
          updatedAt: now,
          updatedBy,
        };

        // Only update fields that are provided
        if (settingsData.companyLogoUrl !== undefined) {
          // If null, delete the field; otherwise set the value
          if (settingsData.companyLogoUrl === null) {
            fieldsToUpdate.companyLogoUrl = null;
          } else {
            fieldsToUpdate.companyLogoUrl = settingsData.companyLogoUrl;
          }
        }
        if (settingsData.companyName !== undefined) {
          if (settingsData.companyName === null || settingsData.companyName === '') {
            fieldsToUpdate.companyName = null;
          } else {
            fieldsToUpdate.companyName = settingsData.companyName;
          }
        }
        if (settingsData.appNameShort !== undefined) {
          if (settingsData.appNameShort === null || settingsData.appNameShort === '') {
            fieldsToUpdate.appNameShort = null;
          } else {
            fieldsToUpdate.appNameShort = settingsData.appNameShort;
          }
        }
        if (settingsData.appNameLong !== undefined) {
          if (settingsData.appNameLong === null || settingsData.appNameLong === '') {
            fieldsToUpdate.appNameLong = null;
          } else {
            fieldsToUpdate.appNameLong = settingsData.appNameLong;
          }
        }

        await settingsRef.update(fieldsToUpdate);

        const updatedSettings = await this.getAppSettings();
        if (!updatedSettings) {
          throw new Error('Failed to retrieve updated settings');
        }

        return updatedSettings;
      }
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
