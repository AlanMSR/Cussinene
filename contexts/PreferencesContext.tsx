import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { Schema } from '../amplify/data/resource';
import { useUser } from './UserContext';

const client = generateClient<Schema>();

interface PreferencesContextType {
  dietaryPrefs: string[];
  allergies: string[];
  foodAllergies: { id: string; name: string | null }[];
  dietaryPreferences: { id: string; name: string | null }[];
  isLoading: boolean;
  updatePreferences: (newDietaryPrefs: string[], newAllergies: string[]) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType>({
  dietaryPrefs: [],
  allergies: [],
  foodAllergies: [],
  dietaryPreferences: [],
  isLoading: true,
  updatePreferences: async () => {},
  refreshPreferences: async () => {},
});

export const usePreferences = () => useContext(PreferencesContext);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  // const [userSub, setUserSub] = useState<string | null>(null);
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [foodAllergies, setFoodAllergies] = useState<{ id: string; name: string | null }[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState<{ id: string; name: string | null }[]>([]);

  const fetchUser = async () => {
    // const output = await fetchUserAttributes();
    // const currentUserSub = output.sub;

    if (!user) {
      console.log('No user sub found');
      return;
    }
    // setUserSub(currentUserSub);
    if (!user.sub) {
      console.log('No user sub found');
      return;
    }
    try {
      const { data: userF, errors } = await client.models.User.get({
        id: user.sub,
      });

      if (errors) {
        console.error('Errors fetching user:', errors);
        return;
      }

      if (userF) {
        setDietaryPrefs((userF.dietaryPrefs || []).filter((pref): pref is string => pref !== null));
        setAllergies((userF.allergies || []).filter((allergy): allergy is string => allergy !== null));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchDietaryPreferences = async () => {
    const { data: items, errors } = await client.models.DietaryPreferences.list()
    if (items) {
      const filteredItems = items.map(({ id, name }) => ({ id, name }));
      setDietaryPreferences(filteredItems);
    } else {
      console.error("Error or invalid dietary preferences data:", errors);
    }
  }

  const fetchFoodAllergies = async () => {
    const { data: items, errors } = await client.models.FoodAllergies.list()
    if (items) {
      const filteredItems = items.map(({ id, name }) => ({ id, name }));
      setFoodAllergies(filteredItems);
    } else {
      console.error("Error fetching food allergies:", errors);
    }
  }

  const refreshPreferences = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUser(),
        fetchDietaryPreferences(),
        fetchFoodAllergies()
      ]);
    } catch (error) {
      console.error('Error loading preferences data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newDietaryPrefs: string[], newAllergies: string[]) => {
    if (!user) {
      console.error('No user sub found');
      return;
    }

    try {
      const updateData = {
        id: user.sub,
        dietaryPrefs: newDietaryPrefs,
        allergies: newAllergies,
      };
      await client.models.User.update(updateData);
      setDietaryPrefs(newDietaryPrefs);
      setAllergies(newAllergies);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshPreferences();
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        dietaryPrefs,
        allergies,
        foodAllergies,
        dietaryPreferences,
        isLoading,
        updatePreferences,
        refreshPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}; 