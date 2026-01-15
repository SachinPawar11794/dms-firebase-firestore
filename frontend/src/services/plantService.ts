import apiClient from './api';

export interface Plant {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreatePlantDto {
  name: string;
  code: string;
}

export interface UpdatePlantDto {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export const plantService = {
  getAllPlants: async (activeOnly: boolean = false): Promise<Plant[]> => {
    try {
      const response = await apiClient.get('/api/v1/plants', {
        params: { activeOnly },
      });
      return response.data.data;
    } catch (error: any) {
      // If 404 or 401, user is not logged in - return empty array
      if (error.response?.status === 404 || error.response?.status === 401) {
        return [];
      }
      throw error;
    }
  },

  getPlant: async (id: string): Promise<Plant> => {
    const response = await apiClient.get(`/api/v1/plants/${id}`);
    return response.data.data;
  },

  createPlant: async (plantData: CreatePlantDto): Promise<Plant> => {
    const response = await apiClient.post('/api/v1/plants', plantData);
    return response.data.data;
  },

  updatePlant: async (id: string, plantData: UpdatePlantDto): Promise<Plant> => {
    const response = await apiClient.put(`/api/v1/plants/${id}`, plantData);
    return response.data.data;
  },

  deletePlant: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/plants/${id}`);
  },
};
