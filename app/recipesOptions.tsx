import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDeepSeek } from '@/hooks/useDeepSeek';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useUser } from '@/contexts/UserContext';
import { useInventory } from '@/contexts/InventoryContext';
import RecipeCard from '@/components/RecipeCard';
import { Recipe } from '@/types/recipe';

export default function GenerateRecipesScreen() {
  const router = useRouter();

  const abortControllerRef = useRef<AbortController | null>(null);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { colors, theme } = useTheme();
  const { dietaryPrefs, allergies } = usePreferences();
  const { callDeepSeek } = useDeepSeek();
  const { inventory, fetchInventory } = useInventory();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  const cleanJsonString = (jsonString: string): string => {
    let cleaned = jsonString.replace(/,\s*([}\]])/g, '$1');
    if (!cleaned.trim().endsWith('}]')) {
      cleaned = cleaned.replace(/\}\s*$/, '}]');
    }
    return cleaned;
  };

  const convertJSONToRecipe = (json: string): Recipe[] => {
    console.log('Original JSON:', json);

    if (json === '[]') {
      return [];
    }

    try {
      const cleanedJson = cleanJsonString(json);
      const parsed = JSON.parse(cleanedJson);

      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any) => {
            if (!item || typeof item !== 'object') return null;

            return {
              title: item.name || 'Untitled Recipe',
              mealType: item.mealType || 'meal',
              ingredients: Array.isArray(item.ingredients)
                ? item.ingredients.map((i: any) => ({
                    id: i.id,
                    name: i.name,
                    quantity: i.quantity,
                    unit: i.unit,
                  }))
                : [],
              instructions: Array.isArray(item.instructions) ? item.instructions : [],
              cookingTime: typeof item.preparationTime === 'number' ? item.preparationTime : 0,
            };
          })
          .filter((recipe): recipe is Recipe => recipe !== null);
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      const arrayMatch = json.match(/\[.*\]/s);
      if (arrayMatch) {
        return convertJSONToRecipe(arrayMatch[0]);
      }
    }

    return [];
  };

  useEffect(() => {
    const init = async () => {
      if (!user?.sub || !params.data) {
        setError('Missing required data');
        return;
      }

      setIsLoading(true);
      try {
        await fetchInventory(user.sub);
        const data = JSON.parse(params.data as string);
        const prompt = `Provide exactly and only a valid JSON array containing 0-3 ${data.mealType || 'meal'} recipe objects that strictly meet all these criteria:
          - Preparation time around ${data.timeAvailable || '30'} minutes
          - Matches these dietary preferences: ${dietaryPrefs?.length ? dietaryPrefs.join(', ') : 'None'}
          - Avoids these allergies: ${allergies?.length ? allergies.join(', ') : 'None'}
          - Uses only these available ingredients:
          ${inventory.length ? inventory.map(item => `${item.id}: ${item.quantity} ${item.unit} ${item.name}`).join(', ') : 'None'}

          Each recipe object must have:
          - name: string
          - mealType: string (the same as the mealType in the list above)
          - ingredients: array of objects, each with id (from list above), name, quantity, unit (the unit should be the same as in the list above)
          - instructions: array of steps (strings)
          - preparationTime: number (minutes)

          If no recipes meet all criteria exactly, return empty array [].

          Response must be exactly and only valid JSON, no explanation or extra text.`;

        abortControllerRef.current = new AbortController();

        const aiResult = await callDeepSeek(prompt, {
          signal: abortControllerRef.current.signal,
        });

        if (aiResult) {
          const generatedRecipes = convertJSONToRecipe(aiResult);
          setRecipes(generatedRecipes);
        } else {
          setError('Failed to generate recipes. Please try again.');
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [params.data, user?.sub]);

  const handleBack = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Generated Recipes',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
        }}
      />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textPrimary, marginTop: 16 }}>Generating recipes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={{ color: colors.warning, marginBottom: 16 }}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}>
            <Text style={[styles.retryButtonText, { color: colors.textWhite }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      ) : recipes.length > 0 ? (
        <ScrollView contentContainerStyle={styles.recipesContainer}>
          {recipes.map((recipe, index) => (
            <RecipeCard key={index} recipe={recipe} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
            No recipes
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={handleBack}>
            <Text style={[styles.generateButtonText, { color: colors.textWhite }]}>
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipesContainer: {
    padding: 16,
    gap: 16,
  },
  generateButton: {
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  generateMoreButton: {
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 16,
  },
  generateMoreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});