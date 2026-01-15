import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { plantService, Plant } from '../services/plantService';

/**
 * Hook to fetch and access plants throughout the application
 * @param activeOnly - If true, only returns active plants
 * @returns Plants array and loading state
 */
export const usePlants = (activeOnly: boolean = false) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Track auth state reactively
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const { data: plants = [], isLoading, error } = useQuery({
    queryKey: ['plants', activeOnly],
    queryFn: () => plantService.getAllPlants(activeOnly),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on error
    // Only fetch if user is authenticated
    enabled: !!currentUser,
  });

  return {
    plants,
    isLoading,
    error,
    // Helper function to get plant by ID
    getPlantById: (id: string): Plant | undefined => {
      return plants.find((plant) => plant.id === id);
    },
    // Helper function to get plant by code
    getPlantByCode: (code: string): Plant | undefined => {
      return plants.find((plant) => plant.code === code);
    },
  };
};
