import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { appSettingsService } from '../services/app-settings.service';
import { ResponseHelper } from '../../../utils/response';
import { UpdateAppSettingsDto } from '../models/app-settings.model';
import multer from 'multer';
import { logger } from '../../../utils/logger';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error = new Error('Only image files are allowed (JPG, PNG, GIF, etc.)');
      (req as any).fileValidationError = error.message;
      cb(error);
    }
  },
});

export class AppSettingsController {
  async getAppSettings(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settings = await appSettingsService.getAppSettings();
      
      // Return default empty settings if none exist
      if (!settings) {
        ResponseHelper.success(res, {
          id: 'app-settings',
          companyLogoUrl: null,
          companyName: null,
          createdAt: null,
          updatedAt: null,
          updatedBy: null,
        });
        return;
      }

      ResponseHelper.success(res, settings);
    } catch (error: any) {
      next(error);
    }
  }

  async updateAppSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const settingsData: UpdateAppSettingsDto = req.body;
      const updatedBy = req.user!.uid;

      const settings = await appSettingsService.updateAppSettings(settingsData, updatedBy);
      ResponseHelper.success(res, settings);
    } catch (error: any) {
      next(error);
    }
  }

  async uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        ResponseHelper.error(res, 'BAD_REQUEST', 'No file uploaded. Please select an image file.', 400);
        return;
      }

      // Validate file
      if (!req.file.buffer) {
        ResponseHelper.error(res, 'BAD_REQUEST', 'File buffer is missing', 400);
        return;
      }

      logger.info('Uploading logo:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        userId: req.user!.uid,
      });

      const userId = req.user!.uid;
      const logoUrl = await appSettingsService.uploadLogo(req.file, userId);
      
      ResponseHelper.success(res, { logoUrl }, 201);
    } catch (error: any) {
      logger.error('Error in uploadLogo controller:', {
        error: error.message,
        code: error.code,
        stack: error.stack,
        file: req.file ? {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        } : 'No file',
      });
      next(error);
    }
  }

  async deleteLogo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.uid;
      await appSettingsService.deleteLogo(userId);
      
      ResponseHelper.success(res, { message: 'Logo deleted successfully' });
    } catch (error: any) {
      next(error);
    }
  }
}

export const appSettingsController = new AppSettingsController();
export { upload }; // Export multer upload middleware
