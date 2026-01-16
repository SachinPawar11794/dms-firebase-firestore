import { Timestamp } from 'firebase-admin/firestore';

export interface AppSettings {
  id: string;
  companyLogoUrl?: string; // Firebase Storage URL
  companyName?: string;
  appNameShort?: string; // Short app name (e.g., "DMS")
  appNameLong?: string; // Long app name (e.g., "Dhananjay Manufacturing System")
  createdAt: Timestamp;
  updatedAt: Timestamp;
  updatedBy: string; // userId
}

export interface UpdateAppSettingsDto {
  companyLogoUrl?: string;
  companyName?: string;
  appNameShort?: string;
  appNameLong?: string;
}
