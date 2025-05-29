import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  image?: string | null;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

interface RecipesContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  deleteRecipe: (id: string) => Promise<void>;
  isLoading: boolean;
}

const RecipesContext = createContext<RecipesContextType>({
  recipes: [],
  addRecipe: async () => {},
  getRecipe: () => undefined,
  deleteRecipe: async () => {},
  isLoading: true,
});

export const useRecipes = () => useContext(RecipesContext);

export const RecipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const savedRecipes = await AsyncStorage.getItem('recipes');
      if (savedRecipes) {
        setRecipes(JSON.parse(savedRecipes));
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecipes = async (newRecipes: Recipe[]) => {
    try {
      await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
    } catch (error) {
      console.error('Error saving recipes:', error);
    }
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(), // Simple ID generation
    };
    const updatedRecipes = [newRecipe, ...recipes];
    setRecipes(updatedRecipes);
    await saveRecipes(updatedRecipes);
  };

  const getRecipe = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
  };

  const deleteRecipe = async (id: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);
    await saveRecipes(updatedRecipes);
  };

  return (
    <RecipesContext.Provider
      value={{
        recipes,
        addRecipe,
        getRecipe,
        deleteRecipe,
        isLoading,
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
}; 