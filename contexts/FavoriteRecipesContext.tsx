import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useUser } from './UserContext';

const client = generateClient<Schema>();

type FavoriteRecipe = {
    id: string;
    // userId: string;
    name: string;
    mealType?: string | null;
    cookTime: number;
    ingredients: Array<{ name: string; quantity: number; unit: string }>;
    steps: string[];
};

type FavoriteRecipesContextType = {
    favoriteRecipes: FavoriteRecipe[];
    loading: boolean;
    fetchFavoriteRecipes: () => Promise<void>;
    addFavoriteRecipe: (
        recipe: Omit<FavoriteRecipe, 'id' | 'createdAt'>
    ) => Promise<string | undefined>;
    removeFavoriteRecipe: (id: string) => Promise<void>;
};

const FavoriteRecipesContext = createContext<FavoriteRecipesContextType | undefined>(undefined);

export function useFavoriteRecipes() {
    const context = useContext(FavoriteRecipesContext);
    if (!context) {
        throw new Error('useFavoriteRecipes must be used within a FavoriteRecipesProvider');
    }
    return context;
}

export function FavoriteRecipesProvider({ children }: { children: ReactNode }) {
    const [favoriteRecipes, setFavoriteRecipes] = useState<FavoriteRecipe[]>([]);
    const [unitTypes] = useState(() => client.enums.UnitType.values());
    const { user } = useUser();
    const [loading, setLoading] = useState(false);

    const fetchFavoriteRecipes = useCallback(async () => {
        if (!user?.sub) return;
        setLoading(true);
        try {
            const { data, errors } = await client.models.Favorite.list({
                filter: {
                    userId: { eq: user.sub }
                }
            });
            // console.log('Favorite recipes:', data);
            const recipes: FavoriteRecipe[] = (data ?? []).map((item) => ({
                id: item.id,
                name: item.name,
                mealType: item.mealType ?? null,
                cookTime: item.cookTime,
                steps: (item.steps ?? []).map((s: any) => typeof s === 'string' ? s : s?.S ?? ''),
                ingredients: (item.ingredients ?? []).map((i: any) => ({
                    name: i?.name ?? '',
                    quantity: i?.quantity ?? 0,
                    unit: i?.unit ?? 'GRAMS',
                })),
            }));
            console.log('Favorite recipes:', recipes);
            setFavoriteRecipes(recipes);
            // if (errors) throw new Error(JSON.stringify(errors));
        } catch (error) {
            console.error('Error fetching favorite recipes:', error);
        }
    }, [user?.sub]);

    const addFavoriteRecipe = useCallback(async (recipe: Omit<FavoriteRecipe, 'id'>) => {
        try {
            const { data, errors } = await client.models.Favorite.create({
                userId: user?.sub,
                name: recipe.name,
                mealType: recipe.mealType ?? 'Lunch',
                cookTime: recipe.cookTime,
                ingredients: recipe.ingredients.map((i) => ({
                    name: i.name,
                    quantity: i.quantity,
                    unit: i.unit as Schema['Ingredient']['type']['unit'] ?? 'GRAMS',
                })),
                steps: recipe.steps,
            });
            return data?.id;
        } catch (error) {
            console.error('Error adding favorite recipe:', error);
        }
    }, []);

    const removeFavoriteRecipe = useCallback(async (id: string) => {
        if (!id) return;
        try {
            const { data, errors } = await client.models.Favorite.delete({ id });
            if (errors) throw new Error(JSON.stringify(errors));
            // refetch
        } catch (error) {
            console.error('Error removing favorite recipe:', error);
        }
    }, []);

    return (
        <FavoriteRecipesContext.Provider
            value={{
                favoriteRecipes,
                loading,
                fetchFavoriteRecipes,
                addFavoriteRecipe,
                removeFavoriteRecipe,
            }}
        >
            {children}
        </FavoriteRecipesContext.Provider>
    );
}
