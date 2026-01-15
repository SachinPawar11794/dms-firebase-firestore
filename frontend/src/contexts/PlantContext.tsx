import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { auth } from '../config/firebase';
import { Plant, plantService } from '../services/plantService';
import { userService } from '../services/userService';

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
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const hasAutoSelectedRef = useRef(false); // Track if we've already auto-selected

  // Track auth state reactively
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Get current user and plants
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
    enabled: !!firebaseUser,
    retry: false,
  });

  const { data: plants = [] } = useQuery({
    queryKey: ['plants', true],
    queryFn: () => plantService.getAllPlants(true),
    enabled: !!firebaseUser,
    retry: false,
  });

  // Auto-select plant based on user's plant field (only run once when user/plants are loaded)
  useEffect(() => {
    // Only auto-select if user is authenticated and we have plants, and haven't already auto-selected
    if (!auth.currentUser || !currentUser || !plants || plants.length === 0 || hasAutoSelectedRef.current) {
      return;
    }

    // Check localStorage first
    const savedPlant = localStorage.getItem(SELECTED_PLANT_STORAGE_KEY);
    if (savedPlant) {
      try {
        const parsedPlant = JSON.parse(savedPlant);
        // Verify the saved plant still exists in the plants list and is active
        const plantExists = plants.find((p: Plant) => p.id === parsedPlant.id && p.isActive);
        if (plantExists) {
          setSelectedPlantState(parsedPlant);
          hasAutoSelectedRef.current = true; // Mark as auto-selected
          return;
        }
      } catch (error) {
        // Invalid saved plant, continue to auto-select
      }
    }

    // Auto-select based on user's plant field
    if (currentUser.plant) {
      const userPlantValue = currentUser.plant.trim();
      
      // First try to match by plant code (case-insensitive) - priority since dropdown shows codes
      let matchedPlant = plants.find((plant: Plant) => 
        plant.isActive && plant.code.toLowerCase() === userPlantValue.toLowerCase()
      );

      // If not found by code, try to match by plant name (case-insensitive)
      if (!matchedPlant) {
        matchedPlant = plants.find((plant: Plant) => 
          plant.isActive && plant.name.toLowerCase() === userPlantValue.toLowerCase()
        );
      }

      if (matchedPlant) {
        setSelectedPlantState(matchedPlant);
        localStorage.setItem(SELECTED_PLANT_STORAGE_KEY, JSON.stringify(matchedPlant));
        hasAutoSelectedRef.current = true; // Mark as auto-selected
        // Invalidate queries to refresh data with the selected plant
        queryClient.invalidateQueries();
      } else {
        // No match found, mark as attempted so we don't keep trying
        hasAutoSelectedRef.current = true;
      }
    } else {
      // User has no plant assigned, mark as attempted
      hasAutoSelectedRef.current = true;
    }
  }, [currentUser, plants, firebaseUser, queryClient]);

  // Reset auto-select flag when user logs out
  useEffect(() => {
    if (!firebaseUser) {
      hasAutoSelectedRef.current = false;
    }
  }, [firebaseUser]);

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
