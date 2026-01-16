import apiClient from './api';

export interface AppSettings {
  id: string;
  companyLogoUrl?: string | null;
  companyName?: string | null;
  appNameShort?: string | null; // Short app name (e.g., "DMS")
  appNameLong?: string | null; // Long app name (e.g., "Dhananjay Manufacturing System")
  createdAt?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface UpdateAppSettingsDto {
  companyLogoUrl?: string;
  companyName?: string;
  appNameShort?: string;
  appNameLong?: string;
}

export const appSettingsService = {
  getAppSettings: async (): Promise<AppSettings> => {
    const response = await apiClient.get('/api/v1/app-settings');
    return response.data.data;
  },

  updateAppSettings: async (settingsData: UpdateAppSettingsDto): Promise<AppSettings> => {
    const response = await apiClient.put('/api/v1/app-settings', settingsData);
    return response.data.data;
  },

  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post('/api/v1/app-settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  deleteLogo: async (): Promise<void> => {
    await apiClient.delete('/api/v1/app-settings/logo');
  },
};
