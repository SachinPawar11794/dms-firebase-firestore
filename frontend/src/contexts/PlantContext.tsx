import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../config/firebase';
import { Plant } from '../services/plantService';

interface PlantContextType {
  selectedPlant: Plant | null;
  setSelectedPlant: (plant: Plant | null) => void;
  clearSelectedPlant: () => void;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

const SELECTED_PLANT_STORAGE_KEY = 'dms_selected_plant';

export const PlantProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPlant, setSelectedPlantState] = useState<Plant | null>(null);
  const queryClient = useQueryClient();

  // Load selected plant from localStorage on mount - only if user is authenticated
  useEffect(() => {
    // Only load plant if user is authenticated
    if (!auth.currentUser) {
      // Clear plant selection if user is not authenticated
      setSelectedPlantState(null);
      localStorage.removeItem(SELECTED_PLANT_STORAGE_KEY);
      return;
    }
    
    const savedPlant = localStorage.getItem(SELECTED_PLANT_STORAGE_KEY);
    if (savedPlant) {
      try {
        setSelectedPlantState(JSON.parse(savedPlant));
      } catch (error) {
        console.error('Error loading selected plant from localStorage:', error);
        localStorage.removeItem(SELECTED_PLANT_STORAGE_KEY);
      }
    }
  }, [auth.currentUser]);

  // Save selected plant to localStorage and invalidate queries when it changes
  const setSelectedPlant = (plant: Plant | null) => {
    const previousPlant = selectedPlant;
    setSelectedPlantState(plant);
    
    if (plant) {
      localStorage.setItem(SELECTED_PLANT_STORAGE_KEY, JSON.stringify(plant));
    } else {
      localStorage.removeItem(SELECTED_PLANT_STORAGE_KEY);
    }

    // Invalidate all queries when plant changes to refresh data
    if (previousPlant?.id !== plant?.id) {
      queryClient.invalidateQueries();
    }
  };

  const clearSelectedPlant = () => {
    setSelectedPlant(null);
  };

  return (
    <PlantContext.Provider value={{ selectedPlant, setSelectedPlant, clearSelectedPlant }}>
      {children}
    </PlantContext.Provider>
  );
};

export const usePlant = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlant must be used within a PlantProvider');
  }
  return context;
};
